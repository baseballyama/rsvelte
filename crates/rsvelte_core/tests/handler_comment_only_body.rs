//! A template-expression function body whose only content is a comment.
//!
//! Upstream brackets a body's leading and trailing comments by the body's own
//! `loc`, so `() => { /* c */ }` prints the comment between the braces.
//! rsvelte derives that location from the comment-buffer range the body's
//! lowering consumed, which is empty exactly when the body holds no statement —
//! the printer's `has_loc` guard then skipped the end-of-body flush and the
//! comment vanished from the output entirely.
//!
//! Reached unmutated by `layerchart/.../Canvas.svelte`, whose `ontouchmove`
//! handler is a comment and nothing else.
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

const HEAD: &str = "<script>\n\tlet a = 1;\n</script>\n";

#[test]
fn a_delegated_handler_keeps_a_line_comment_that_is_its_whole_body() {
    let source = format!("{HEAD}<button onclick={{(e) => {{\n\t// c\n}}}}>{{a}}</button>\n");
    assert_has(
        &client(&source),
        "$.delegated('click', button, (e) => {\n\t\t// c\n\t});",
    );
}

#[test]
fn a_non_delegated_handler_keeps_a_block_comment_that_is_its_whole_body() {
    let source = format!("{HEAD}<div onscroll={{(e) => {{\n\t/* c */\n}}}}>{{a}}</div>\n");
    assert_has(
        &client(&source),
        "$.event('scroll', div, (e) => {\n\t\t/* c */\n\t});",
    );
}

/// A capture listener is a third lowering, and its extra argument makes the
/// call print one argument per line — a different layout around the same body.
#[test]
fn a_capture_handler_keeps_a_comment_that_is_its_whole_body() {
    let source = format!("{HEAD}<button onclickcapture={{(e) => {{\n\t// c\n}}}}>{{a}}</button>\n");
    assert_has(
        &client(&source),
        "\t\t(e) => {\n\t\t\t// c\n\t\t},\n\t\ttrue\n\t);",
    );
}

#[test]
fn a_function_expression_handler_keeps_a_comment_that_is_its_whole_body() {
    let source = format!("{HEAD}<button onclick={{function (e) {{\n\t// c\n}}}}>{{a}}</button>\n");
    assert_has(
        &client(&source),
        "$.delegated('click', button, function (e) {\n\t\t// c\n\t});",
    );
}

/// CONTROL: a body with no comment must stay on one line. The fix gives an
/// empty body a location it did not have, so this is what keeps that from
/// turning every `() => {}` into a three-line block.
#[test]
fn an_empty_handler_body_with_no_comment_stays_on_one_line() {
    let source = format!("{HEAD}<button onclick={{(e) => {{}}}}>{{a}}</button>\n");
    assert_has(&client(&source), "$.delegated('click', button, (e) => {});");
}

/// CONTROL: the same comment-only body written in the instance script always
/// matched, because a script statement's location comes from the source rather
/// than from the comment buffer. This pins that the fix is confined to the
/// template-expression path.
#[test]
fn a_script_function_with_a_comment_only_body_is_unchanged() {
    let source = "<script>\n\tlet a = 1;\n\tfunction h(e) {\n\t\t// c\n\t}\n</script>\n<button onclick={h}>{a}</button>\n";
    assert_has(&client(source), "\tfunction h(e) {\n\t\t// c\n\t}");
    assert_has(&client(source), "$.delegated('click', button, h);");
}
