//! Regression test for the CSS scope rewriter losing the argument of
//! `:nth-child(N)` / `:nth-of-type(N)` / `:nth-last-child(N)` /
//! `:nth-last-of-type(N)`.
//!
//! Bug: when scoping a selector like `.foo:nth-child(3)`, the parser
//! produces a PseudoClassSelector whose `args` is a SelectorList wrapping
//! an `Nth` node (`{ type: "Nth", value: "3" }`). The transformer walks
//! that tree via `get_selector_text` → `format_simple_selector`, but the
//! latter had no match arm for `"Nth"` and silently returned an empty
//! string. The emitted CSS therefore had `:nth-child()` (no argument).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

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
fn nth_child_argument_preserved_after_scoping() {
    let src = r#"<div class="x"></div><div class="x"></div><div class="x"></div>
<style>
@media (max-width: 999px) {
  .x:nth-child(3) { color: red }
}
</style>"#;
    let out = compile_css(src);
    assert!(
        out.contains(":nth-child(3)"),
        "expected `:nth-child(3)` in output, got:\n{out}"
    );
    assert!(
        !out.contains(":nth-child()"),
        "argument should not be dropped, got:\n{out}"
    );
}

#[test]
fn nth_child_an_plus_b_preserved() {
    let src = r#"<div class="x"></div><div class="x"></div>
<style>
@media (max-width: 999px) {
  .x:nth-child(2n+1) { color: red }
}
</style>"#;
    let out = compile_css(src);
    assert!(
        out.contains(":nth-child(2n+1)"),
        "expected `:nth-child(2n+1)`, got:\n{out}"
    );
}

#[test]
fn nth_of_type_argument_preserved() {
    let src = r#"<div class="x"></div><div class="x"></div>
<style>
@media (max-width: 999px) {
  .x:nth-of-type(odd) { color: green }
  .x:nth-last-child(3) { color: blue }
  .x:nth-last-of-type(2n) { color: yellow }
}
</style>"#;
    let out = compile_css(src);
    assert!(out.contains(":nth-of-type(odd)"), "got:\n{out}");
    assert!(out.contains(":nth-last-child(3)"), "got:\n{out}");
    assert!(out.contains(":nth-last-of-type(2n)"), "got:\n{out}");
}
