//! A `$props()` decoy in a string or a comment no longer loses the real
//! declaration's comment.
//!
//! Four raw text scans decide where that declaration is and whether its comment
//! still needs emitting: `find_sub("$props()")` and `rfind_sub("let")` locate it
//! (`client/mod.rs:3264`), `find(';')` ends it, and
//! `transformed_script.contains(comment)` at `client/mod.rs:1459` decides
//! whether to re-emit. Only the first is fixed here.
//!
//! The other three are entangled, which is a measurement rather than a scope
//! choice. Hardening the `contains` gate to compare against the script's real
//! comments fixes three constructed cells and regresses **19 corpus units**,
//! because the `;` scan truncates the region at a `;` written inside a comment
//! — so the extracted "props comment" is a partial line comment, and the
//! substring test was the only thing hiding it. Hardening the `;` scan instead
//! regresses **4 other units**: threlte's `Svg` and `ContactShadows` have every
//! `;` inside a string or a template literal, so a code-aware scan finds none,
//! the region runs to the end of the script, and unrelated comments are swept
//! into the declaration. Two wrong scans whose errors cancel, with the
//! substring test as the cancelling stage; fixing either alone measures worse
//! than fixing neither, so they go together in a separate change.
//!
//! Every cell diverges from official on comment *placement* (#4448) whichever
//! way these scans answer, so the assertions are about the comment being
//! present, which is what this defect decides.

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
fn a_props_decoy_in_a_string_does_not_lose_the_declarations_comment() {
    let out = client(&component(
        "const s = \"$props()\";\n\tconsole.log(s);\n\tlet p = /* c */ $props();",
    ));
    assert_eq!(count(&out, "/* c */"), 1, "output:\n{out}");
}

#[test]
fn a_props_decoy_in_a_comment_does_not_lose_the_declarations_comment() {
    let out = client(&component("// $props() here\n\tlet p = /* c */ $props();"));
    assert_eq!(count(&out, "/* c */"), 1, "output:\n{out}");
}

/// Negative control: without a decoy the declaration's comment was never lost,
/// and a sibling comment of different text must still be emitted exactly once.
#[test]
fn a_declaration_with_no_decoy_is_unaffected() {
    let out = client(&component(
        "let p = /* c */ $props();\n\tlet b = 1; /* d */\n\tconsole.log(b);",
    ));
    assert_eq!(count(&out, "/* c */"), 1, "output:\n{out}");
    assert_eq!(count(&out, "/* d */"), 1, "output:\n{out}");
}

/// Negative control: with no comment in the declaration the decoy must not
/// conjure one, which is what a scan that merely moved its anchor would do.
#[test]
fn a_decoy_with_no_declaration_comment_emits_nothing() {
    let out = client(&component(
        "let p = $props();\n\tconst s = \"$props()\";\n\tconsole.log(s);",
    ));
    assert_eq!(count(&out, "/*"), 0, "output:\n{out}");
}
