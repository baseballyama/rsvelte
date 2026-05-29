//! Regression test: CSS scoping must traverse `<svelte:boundary>` like any
//! other transparent wrapper (issue #466, H-023).
//!
//! Bug: `<svelte:boundary>` was handled only by `mark_all_elements_scoped_node`
//! and was missing from `process_node_scoping`, the sibling-combinator pass,
//! `apply_scoping_marks`, `propagate_ancestor_scoping`, and the render-site
//! collector. Elements inside a boundary were therefore never visited, so their
//! matching CSS rules were wrongly pruned as unused (and the elements lacked the
//! scope class). The official Svelte compiler scopes straight through the
//! boundary.

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
fn class_inside_boundary_is_scoped() {
    let src = r#"<svelte:boundary><div class="a">x</div></svelte:boundary>
<style>.a { color: red }</style>"#;
    let out = compile_css(src);
    // The rule must survive (not pruned) and be scoped.
    assert!(
        out.contains(".a.svelte-"),
        "`.a` inside <svelte:boundary> should be scoped, got:\n{out}"
    );
}

#[test]
fn descendant_through_boundary_is_scoped() {
    let src = r#"<div class="p"><svelte:boundary><span class="c">x</span></svelte:boundary></div>
<style>.p .c { color: red }</style>"#;
    let out = compile_css(src);
    assert!(
        out.contains(".p.svelte-") && out.contains(".c"),
        "descendant selector through <svelte:boundary> should be scoped, got:\n{out}"
    );
    // The rule must not be dropped as unused.
    assert!(
        out.contains("color: red"),
        "rule wrongly pruned, got:\n{out}"
    );
}
