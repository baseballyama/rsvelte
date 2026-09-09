//! Two raw scans in the `$props()` comment path were wrong in opposite
//! directions, and the error of one hid the error of the other.
//!
//! `props_declaration_comments` ended the declaration's region at the first raw
//! `;`, so a `;` written inside a comment truncated it and the extracted
//! "comment" was a fragment; `client/mod.rs`'s re-emission gate then asked
//! `transformed_script.contains(comment)`, and a fragment is a substring of the
//! comment it came from, so the fragment was suppressed. Repairing either alone
//! measured worse than repairing neither — the substring gate was the stage
//! cancelling the truncation.
//!
//! The region now ends at whichever comes first of the declaration's own code
//! `;` and the end of the line carrying `$props(`, which bounds it in both
//! semicolon styles, and presence is counted over comment *tokens* rather than
//! tested as a substring.
//!
//! Ablating each half reddens a disjoint set: the raw `;` scan fails the two
//! truncation cells, the substring gate the four decoy cells. Three cells fail
//! under neither — the two negative controls and the semicolon-free one, whose
//! later comment the counting gate keeps whatever the region does, so it
//! records the shape rather than defending the bound.
//!
//! Every expected value below is the official compiler's, taken by compiling
//! these exact cells rather than inferred from neighbouring ones. The cells
//! assert counts and not placement: the comment's position still diverges
//! (#4448) whichever way these scans answer.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

/// The template has to read the prop: with the prop unused the declaration is
/// elided and every arm agrees on an output that never reached these scans.
fn component(body: &str) -> String {
    format!("<script>\n\t{body}\n</script>\n<i>{{p.a}}</i>")
}

fn count(haystack: &str, needle: &str) -> usize {
    haystack.matches(needle).count()
}

#[test]
fn a_comment_text_repeated_inside_a_string_is_not_read_as_the_comment() {
    let out = client(&component(
        "let p = /* c */ $props();\n\tconst s = \"/* c */\";\n\tconsole.log(s);",
    ));
    assert_eq!(count(&out, "/* c */"), 2, "output:\n{out}");
}

#[test]
fn a_comment_text_repeated_inside_a_template_literal_is_not_read_as_the_comment() {
    let out = client(&component(
        "let p = /* c */ $props();\n\tconst s = `x/* c */y`;\n\tconsole.log(s);",
    ));
    assert_eq!(count(&out, "/* c */"), 2, "output:\n{out}");
}

#[test]
fn a_comment_text_repeated_inside_a_longer_comment_is_not_read_as_the_comment() {
    let out = client(&component(
        "let p = /* c */ $props();\n\tlet b = 1; // see /* c */ below\n\tconsole.log(b);",
    ));
    assert_eq!(count(&out, "/* c */"), 2, "output:\n{out}");
}

/// The gate's premise fails on ordinary code too: the second occurrence here is
/// a real comment with the same text, so a presence test has to count rather
/// than answer yes.
#[test]
fn a_second_real_comment_of_the_same_text_does_not_suppress_the_declarations() {
    let out = client(&component(
        "let p = /* c */ $props();\n\tlet b = 1; /* c */\n\tconsole.log(b);",
    ));
    assert_eq!(count(&out, "/* c */"), 2, "output:\n{out}");
}

/// A `;` written inside a comment between `$props(` and the statement's own `;`
/// truncated the region, so the extracted "comment" was an unterminated prefix
/// of it — and `main` emits that prefix, producing output no JS parser accepts.
/// Ending the region at the first *code* `;` is what the counting gate alone
/// does not fix: with a raw `;` scan the comment is lost instead.
#[test]
fn a_semicolon_inside_the_declarations_comment_does_not_truncate_the_region() {
    let out = client(&component(
        "let p = /* c */ $props(/* ; */);\n\tlet q = 1;\n\tconsole.log(q);",
    ));
    assert_eq!(count(&out, "/* c */"), 1, "output:\n{out}");
    assert_eq!(count(&out, "/* ; */"), 1, "output:\n{out}");
    assert_eq!(
        count(&out, "/*"),
        count(&out, "*/"),
        "an unterminated block comment was emitted:\n{out}"
    );
}

/// The same truncation with the decoy after the call rather than inside it.
#[test]
fn a_semicolon_inside_a_trailing_comment_does_not_truncate_the_region() {
    let out = client(&component(
        "let p = /* c */ $props() /* ; */;\n\tlet q = 1;\n\tconsole.log(q);",
    ));
    assert_eq!(count(&out, "/* ; */"), 1, "output:\n{out}");
    assert_eq!(
        count(&out, "/*"),
        count(&out, "*/"),
        "an unterminated block comment was emitted:\n{out}"
    );
}

/// A semicolon-free source has no code `;` to end the region, so it is bounded
/// by the end of the line carrying `$props(` — without which the region runs to
/// the end of the script. threlte's `Svg` and `ContactShadows` are that shape:
/// their only `;` is inside a template literal.
#[test]
fn a_semicolon_free_declaration_does_not_sweep_in_later_comments() {
    let out = client(&component(
        "let p = /* c */ $props()\n\tlet b = 1\n\t// svelte-ignore x\n\tconsole.log(b)",
    ));
    assert_eq!(count(&out, "/* c */"), 1, "output:\n{out}");
    assert_eq!(count(&out, "// svelte-ignore x"), 1, "output:\n{out}");
}

/// Negative control: a sibling comment of different text is emitted once and
/// the declaration's once, which is what a rule that merely emitted more would
/// break.
#[test]
fn a_sibling_comment_of_different_text_is_unaffected() {
    let out = client(&component(
        "let p = /* c */ $props();\n\tlet b = 1; /* d */\n\tconsole.log(b);",
    ));
    assert_eq!(count(&out, "/* c */"), 1, "output:\n{out}");
    assert_eq!(count(&out, "/* d */"), 1, "output:\n{out}");
}

/// Negative control: with no comment in the declaration neither scan may
/// conjure one out of the script's other comments.
#[test]
fn a_declaration_with_no_comment_emits_nothing_extra() {
    let out = client(&component(
        "let p = $props(); // a; b\n\tlet b = 1; /* d */\n\tconsole.log(b);",
    ));
    assert_eq!(count(&out, "// a; b"), 1, "output:\n{out}");
    assert_eq!(count(&out, "/* d */"), 1, "output:\n{out}");
}
