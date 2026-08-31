//! Upstream comments an unused selector out **in place**, so the text between
//! two consecutive unused selectors is whatever the source had — a `,` with a
//! line break and indentation keeps them. rsvelte rebuilt the comment body and
//! joined with a fixed `", "`, collapsing the run onto one line.
//!
//! Every expectation is the official compiler's own output (5.56.10).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css(markup: &str, body: &str) -> String {
    let source = format!("{markup}\n\n<style>{body}</style>\n");
    compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|err| panic!("{body}: {err:?}"))
    .css
    .map(|c| c.code)
    .unwrap_or_default()
}

#[test]
fn a_run_of_unused_selectors_keeps_the_source_line_breaks() {
    // `.a + .b` and `.a ~ .b` match nothing, `.a > .b` does; the two unused ones
    // are commented out together and their `,\n\t` survives.
    let out = css(
        "<div class=\"a\"><div class=\"b\">x</div></div>",
        "\n\t.a .b,\n\t.a > .b,\n\t.a + .b,\n\t.a ~ .b {\n\t\tcolor: maroon;\n\t}\n",
    );
    assert!(out.contains(".a + .b,\n\t.a ~ .b*/"), "{out}");
    assert!(!out.contains(".a + .b, .a ~ .b"), "{out}");
}

#[test]
fn a_run_written_on_one_line_stays_on_one_line() {
    // The control: the separator is copied, not normalized in either direction.
    let out = css(
        "<div class=\"a\"><div class=\"b\">x</div></div>",
        "\n\t.a .b, .a + .b, .a ~ .b {\n\t\tcolor: maroon;\n\t}\n",
    );
    assert!(out.contains(".a + .b, .a ~ .b*/"), "{out}");
}
