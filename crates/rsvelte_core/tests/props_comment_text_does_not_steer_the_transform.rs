//! Pins that a **comment's text** cannot steer the `$props()` declaration
//! transform (#4472).
//!
//! `transform_props_destructuring` located the call with a last-occurrence,
//! boundary-free substring search, so a trailing comment mentioning `$props`
//! moved the anchor into the comment and the declaration was spliced around it.
//! The client emitted `let a } = $.prop($$props, 'a }', 3, $props(): { a: b;);`
//! — the comment's own words in code position, and text no JS parser accepts.
//!
//! The assertion is that every one of these sources generates the **same code**,
//! because they differ only in the words of a trailing comment. That is the
//! property the defect violates, and it needs no JS parser to state.
//!
//! Byte-equality with the oracle is deliberately not asserted: the comment's
//! own slot still diverges here (#4448's class, and #4475's), so no
//! comment-bearing input of this shape reaches EQ and a `pattern-corpus` entry
//! would have to be listed in a shrink-only ratchet.
//!
//! The rows are chosen so the ones that were *already* correct stay in: a scan
//! keyed on the whole `$props(): { … }` spelling is what the reported cases
//! share, and `foo(): { … }` / `a plain word` are the neighbours that were fine
//! before the fix and must stay fine after it.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            dev: false,
            filename: Some("T.svelte".into()),
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

/// The generated code with every comment removed. Two sources differing only in
/// a comment's words must agree here; what the comment itself looks like in the
/// output is a different question, and one this gate does not answer.
fn code_without_comments(source: &str) -> String {
    let code = client(source);
    let mut out = String::with_capacity(code.len());
    let bytes = code.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'/' {
            while i < bytes.len() && bytes[i] != b'\n' {
                i += 1;
            }
        } else if bytes[i] == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            i = (i + 2).min(bytes.len());
        } else {
            out.push(bytes[i] as char);
            i += 1;
        }
    }
    out.split_whitespace().collect::<Vec<_>>().join(" ")
}

/// The reported shape: a multi-line type annotation carrying a comment, which is
/// what sends the declaration down the text path in the first place.
fn source(trailing_comment: &str) -> String {
    format!(
        "<script lang=\"ts\">\n\tlet {{ a }}: {{ // x\n\t\ta: string;\n\t}} = $props(); // {trailing_comment}\n</script>\n<p>x</p>\n"
    )
}

/// Each was `UNPARSEABLE` before the fix except the last three, which were
/// already correct and are here as the neighbours a wider fix would break.
const TRAILING_COMMENTS: &[&str] = &[
    "$props(): { a: b; }",
    "$props(): { a: b }",
    "$props():{a:b;}",
    "$props() : { a: b; }",
    "$props(): { }",
    "my$props(): { a: b; }",
    "foo(): { a: b; }",
    "$props()",
    "a plain word",
];

#[test]
fn a_trailing_comments_words_do_not_change_the_generated_code() {
    let baseline = code_without_comments(&source("a plain word"));

    // Liveness: without this the test passes for a compiler that emits nothing.
    assert!(
        baseline.contains("export default function T($$anchor, $$props)"),
        "the baseline cell generated no component function, so the comparison below is vacuous:\n{baseline}"
    );

    for text in TRAILING_COMMENTS {
        let got = code_without_comments(&source(text));
        assert_eq!(
            got, baseline,
            "the trailing comment `// {text}` changed the generated code; a comment's words must not reach the transform"
        );
    }
}

#[test]
fn b_the_comments_words_never_reach_code_position() {
    // The defect's own signature: the comment's braces and semicolon spliced into
    // the declaration. `a: b` appears in no correct output for this source.
    for text in TRAILING_COMMENTS {
        let code = code_without_comments(&source(text));
        assert!(
            !code.contains("a: b"),
            "the trailing comment `// {text}` left its text in code position:\n{code}"
        );
    }
}

#[test]
fn c_the_annotations_own_comment_is_still_what_selects_this_path() {
    // Control: drop the comment inside the type annotation and the declaration
    // never reaches the text path at all. It was correct before the fix and must
    // stay correct, which is what says the fix did not simply disable the path.
    let single_line = "<script lang=\"ts\">\n\tlet { a }: { a: string } = $props(); // $props(): { a: b; }\n</script>\n<p>x</p>\n";
    let code = code_without_comments(single_line);
    assert!(
        code.contains("export default function T($$anchor, $$props)") && !code.contains("a: b"),
        "the single-line-annotation control changed shape:\n{code}"
    );
}
