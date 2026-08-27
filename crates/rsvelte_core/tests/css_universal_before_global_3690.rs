//! A bare universal selector immediately before `:global(...)` is the local
//! scoping point. Upstream replaces that `*` with the scope class; the partial-
//! global transform used to append the class and emit `*.svelte-hash.g`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn css_of(style: &str) -> String {
    let source = format!(
        "<div class=\"g a\"></div><svg><circle class=\"g\" /></svg>\n<style>\n\t{style}\n</style>\n"
    );
    compile(
        &source,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .css
    .map(|css| css.code)
    .unwrap_or_default()
}

#[test]
fn a_bare_universal_scoping_point_is_replaced_before_global() {
    let out = css_of("*:global(.g) { color: red }");

    assert!(
        out.contains(".svelte-"),
        "expected a scoped selector in:\n{out}"
    );
    assert!(
        out.contains(".g { color: red }"),
        "global class was lost:\n{out}"
    );
    assert!(
        !out.contains("*.svelte-"),
        "the bare universal must be replaced, not retained:\n{out}"
    );
}

#[test]
fn a_universal_before_another_local_selector_is_preserved() {
    let out = css_of("*.a:global(.g) { color: red }");

    assert!(
        out.contains("*.a.svelte-") && out.contains(".g { color: red }"),
        "the class, rather than the earlier universal, is the scoping point:\n{out}"
    );
}

#[test]
fn a_namespaced_universal_is_not_treated_as_bare() {
    let out = css_of(
        "@namespace svg url(http://www.w3.org/2000/svg);\n\tsvg|*:global(.g) { color: red }",
    );

    assert!(
        out.contains("svg|*.svelte-") && out.contains(".g { color: red }"),
        "a namespaced universal must survive scoping:\n{out}"
    );
}
