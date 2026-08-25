//! Regression tests for #3615: `$bindable(<identifier>)` must decide whether to
//! proxy from the identifier binding's original initializer node.
//!
//! Upstream keeps `$state(1)` as a CallExpression on the binding. rsvelte keeps
//! its argument (`1`) for constant analysis, so the proxy check mistook a state
//! identifier for a primitive default and emitted eager `$.prop(..., 11, s)`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client_with_options(options: &str, script: &str) -> String {
    compile(
        &format!("{options}<script>{script}</script><b>{{typeof p}}</b>"),
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn client(script: &str) -> String {
    client_with_options("", script)
}

fn prop_line(code: &str) -> &str {
    code.lines()
        .find(|line| line.trim_start().starts_with("let p = $.prop("))
        .unwrap_or_else(|| panic!("no prop declaration in:\n{code}"))
        .trim()
}

#[test]
fn rune_identifier_defaults_are_proxied_lazily() {
    for (declaration, expected_default) in [
        ("let s = $state(1);", "$.proxy(s)"),
        ("let s = $state.raw(1);", "$.proxy(s)"),
        ("let s = $derived(1);", "$.proxy($.get(s))"),
        ("let s = $derived.by(() => 1);", "$.proxy($.get(s))"),
    ] {
        let code = client(&format!(
            "{declaration} let {{ p = $bindable(s) }} = $props();"
        ));
        assert_eq!(
            prop_line(&code),
            format!("let p = $.prop($$props, 'p', 27, () => {expected_default});"),
            "for {declaration}"
        );
    }
}

#[test]
fn primitive_const_identifier_default_stays_eager_and_unproxied() {
    let code = client("const s = 1; let { p = $bindable(s) } = $props();");
    assert_eq!(prop_line(&code), "let p = $.prop($$props, 'p', 11, s);");
}

#[test]
fn accessors_host_uses_the_same_lazy_proxy_default() {
    let code = client_with_options(
        "<svelte:options accessors />",
        "let s = $state(1); let { p = $bindable(s) } = $props();",
    );
    assert_eq!(
        prop_line(&code),
        "let p = $.prop($$props, 'p', 27, () => $.proxy(s));"
    );
}
