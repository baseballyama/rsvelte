//! A comment INSIDE a legacy prop's initializer — before a `.` continuation,
//! say — had no channel out of the text pipeline.
//!
//! `transform_export_let` strips every comment from the declaration before
//! splitting declarators, because a trailing `// comment` would otherwise be
//! parsed as part of the prop name. Two runs were restored afterwards: the one
//! leading the declarator and the one leading the initializer. A comment in the
//! middle of the initializer was in neither, so it never reached the output
//! while upstream flushes it between the `.` and its property.
//!
//! Reduced by measurement from the huly `TemplateStep.svelte` mutation entry.
//!
//! Every expectation is the official compiler's bytes (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

fn assert_has(output: &str, fragment: &str) {
    assert!(
        output.contains(fragment),
        "expected to find\n  {fragment}\nin:\n{output}"
    );
}

#[test]
fn a_comment_before_a_member_continuation_survives_into_the_prop_thunk() {
    let source = "<script>\n\texport let d = undefined\n\t\t// c\n\t\t.toString();\n</script>\n<span>{d}</span>\n";
    assert_has(
        &client(source),
        "let d = $.prop($$props, 'd', 24, () => undefined.// c\n\ttoString());",
    );
}

#[test]
fn the_same_comment_survives_before_a_call_on_an_array_literal() {
    let source = "<script>\n\texport let d = [1]\n\t\t// c\n\t\t.map((x) => x);\n</script>\n<span>{d}</span>\n";
    assert_has(
        &client(source),
        "let d = $.prop($$props, 'd', 24, () => [1].// c\n\tmap((x) => x));",
    );
}

/// CONTROL: a comment AFTER the whole initializer is the trailing-comment case,
/// which already had its own channel. It is what keeps the new rule from
/// carrying the source text whenever a comment appears anywhere — the raw text
/// there still holds the declaration's `;`, and emitting it verbatim produced
/// `$.prop($$props, 'd', 8, null; // c // c\n)`.
#[test]
fn a_trailing_comment_after_the_initializer_is_unchanged() {
    let source = "<script>\n\texport let d = null; // c\n</script>\n<span>{d}</span>\n";
    assert_has(
        &client(source),
        "let d = $.prop($$props, 'd', 8, null // c\n\t);",
    );
}

/// CONTROL: a plain (non-exported) declaration never enters this pipeline and
/// always kept the comment.
#[test]
fn a_non_exported_declaration_is_unchanged() {
    let source =
        "<script>\n\tlet d = undefined\n\t\t// c\n\t\t.toString();\n</script>\n<span>{d}</span>\n";
    assert_has(&client(source), "// c");
}
