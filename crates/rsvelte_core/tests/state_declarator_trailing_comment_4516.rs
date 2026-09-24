//! A comment trailing a `$state(...)` declaration belongs inside the call the
//! declaration lowers to, not after the statement's `;` (#4516). Expected
//! values are the official compiler's output for the same input.
//!
//! The corpus output gate compares ASTs with `CommentPolicy::Ignore`, so a
//! comment-only placement cannot be pinned by a `pattern-corpus` repro.

use rsvelte_core::compiler::{CompileOptions, GenerateMode, compile};

fn client(source: &str, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .unwrap()
    .js
    .code
}

const TEMPLATE: &str = "<C bind:value={a} />";

#[test]
fn a_line_comment_after_the_declaration_lands_inside_the_state_call() {
    let source = format!("<script>\n\tlet a = $state(1); // c\n</script>\n{TEMPLATE}\n");
    let code = client(&source, false);
    assert!(code.contains("let a = $.state(1 // c\n\t);"), "{code}");
}

#[test]
fn the_declaration_need_not_be_the_last_statement() {
    let source =
        format!("<script>\n\tlet a = $state(1); // c\n\tlet z = 2;\n</script>\n{TEMPLATE}\n");
    let code = client(&source, false);
    assert!(code.contains("let a = $.state(1 // c\n\t);"), "{code}");
}

#[test]
fn a_block_comment_stays_on_the_same_line() {
    let source = format!("<script>\n\tlet a = $state(1); /* c */\n</script>\n{TEMPLATE}\n");
    let code = client(&source, false);
    assert!(code.contains("let a = $.state(1 /* c */);"), "{code}");
}

#[test]
fn the_source_semicolon_is_optional() {
    let source = format!("<script>\n\tlet a = $state(1) // c\n</script>\n{TEMPLATE}\n");
    let code = client(&source, false);
    assert!(code.contains("let a = $.state(1 // c\n\t);"), "{code}");
}

#[test]
fn the_dev_tag_wrapper_stays_on_one_argument_line() {
    let source = format!("<script>\n\tlet a = $state(1); // c\n</script>\n{TEMPLATE}\n");
    let code = client(&source, true);
    assert!(
        code.contains("let a = $.tag($.state(1 // c\n\t), 'a');"),
        "{code}"
    );
}

#[test]
fn a_structurally_multiline_first_argument_still_wraps_the_tag_call() {
    // Positive control for the layout rule the fix narrows: a real line break
    // in the first argument keeps the one-argument-per-line form.
    let source = format!(
        "<script>\n\tlet a = $state(function () {{ return 1; }});\n</script>\n{TEMPLATE}\n"
    );
    let code = client(&source, true);
    assert!(
        code.contains("let a = $.tag(\n\t\t$.state(function () {"),
        "{code}"
    );
}

#[test]
fn a_derived_declaration_keeps_its_comment_after_the_statement() {
    // Live control: upstream leaves this one outside the call, and so must we.
    let source =
        "<script>\n\tlet n = $state(1);\n\tlet t = $derived(n + 1); // c\n</script>\n<p>{t}</p>\n";
    let code = client(source, false);
    assert!(
        code.contains("let t = $.derived(() => n + 1); // c"),
        "{code}"
    );
}

#[test]
fn a_plain_declaration_keeps_its_comment_after_the_statement() {
    let source = "<script>\n\tlet a = 1; // c\n</script>\n<p>{a}</p>\n";
    let code = client(source, false);
    assert!(code.contains("let a = 1; // c"), "{code}");
}
