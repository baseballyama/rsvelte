//! Regression test for CSS selector-list splitting that is not string- /
//! bracket-aware (issue #466, H-021).
//!
//! Bug: `split_by_comma_respecting_parens` tracked only `(` / `)` and `/* */`,
//! so a comma inside an attribute selector value (`[data-x="a,b"]`) or inside
//! `[...]` brackets split the selector list mid-selector, producing two broken
//! selectors. The official Svelte compiler treats `[data-x="a,b"]` as a single
//! selector. The splitter now also tracks `[` / `]` depth and string quotes.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_css(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile");
    result.css.map(|c| c.code).unwrap_or_default()
}

#[test]
fn comma_inside_attribute_value_does_not_split() {
    let src = r#"<div data-x="a,b"></div>
<style>
[data-x="a,b"] { color: red }
</style>"#;
    let out = compile_css(src);
    // The whole attribute selector survives as one scoped selector; a broken
    // split would have produced a bare `[data-x="a` fragment (unterminated).
    assert!(
        out.contains(r#"[data-x="a,b"].svelte-"#),
        "the attribute value comma must not split the selector, got:\n{out}"
    );
}

#[test]
fn comma_inside_attribute_value_in_selector_list() {
    let src = r#"<a data-x="a,b"></a>
<style>
a, [data-x="a,b"] { color: red }
</style>"#;
    let out = compile_css(src);
    // Both selectors survive and are scoped; the inner comma is not a separator.
    assert!(out.contains(r#"[data-x="a,b"]"#), "got:\n{out}");
    assert!(
        out.matches("color: red").count() == 1,
        "the two real selectors should share one rule body, got:\n{out}"
    );
}
