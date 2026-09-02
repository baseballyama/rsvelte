//! Upstream's `should_proxy` returns `false` only for the shapes it enumerates
//! (a literal, a `void`/`typeof`/unary result, a known-primitive call, …) and
//! proxies **everything else**. rsvelte's `expression_needs_proxy` is a text
//! sniff that returns `true` only for the shapes IT enumerates, so the two have
//! opposite defaults and every predicate rsvelte is missing flips the answer
//! the other way.
//!
//! Optional chaining was such a shape: the member and call predicates split
//! `p?.x` at the `.` and read `p?` as the object, which matches neither, so a
//! `$state(p?.x)` lost its `$.proxy`. Both directions are checked below, and
//! the shapes that must NOT be proxied are the half a whitelist gets right by
//! accident — ablate the fix and only the `?.` rows move.
//!
//! Every expected shape was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

/// The `this.#a = …` initializer emitted for a constructor assigning `$state(expr)`.
fn state_initializer(expr: &str) -> String {
    let src = format!(
        "export class S {{\n  a;\n  constructor(p, f) {{\n    this.a = $state({expr});\n  }}\n}}\n"
    );
    let js = compile_module(
        &src,
        ModuleCompileOptions {
            filename: Some("Test.svelte.js".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .map(str::trim)
        .find(|l| l.starts_with("this.#a = "))
        .unwrap_or_else(|| panic!("no `this.#a =` line for `{expr}` in:\n{js}"))
        .to_string()
}

#[test]
fn an_optional_chain_is_proxied_like_the_plain_chain_it_mirrors() {
    // Each pair is the same access written with and without `?.`; upstream
    // proxies both, so a rule that reads one and not the other is the defect.
    for (plain, optional) in [
        ("p.x", "p?.x"),
        ("p.x.y", "p?.x?.y"),
        ("p.x()", "p?.x?.()"),
        ("p.x.y.toString()", "p?.x?.y.toString()"),
        ("p[0]", "p?.[0]"),
    ] {
        for expr in [plain, optional] {
            assert_eq!(
                state_initializer(expr),
                format!("this.#a = $.state($.proxy({expr}));"),
                "`{expr}` must be proxied"
            );
        }
    }
}

#[test]
fn a_ternary_spelled_with_a_leading_dot_number_keeps_its_value() {
    // `?.5` is a ternary whose consequent is `.5`, not an optional chain, so
    // the rewrite must leave those two characters alone. Measured on both
    // arms: this line is byte-identical with and without the rewrite, and it
    // is the only shape in the grid for which that is true.
    //
    // Official proxies it (`$.state($.proxy(p ? .5 : 1))`) and rsvelte does
    // not — a SEPARATE, pre-existing gap that predates this rewrite and is
    // measured out of scope below, so this test pins the value rather than
    // the proxy.
    assert_eq!(
        state_initializer("p ?.5 : 1"),
        "this.#a = $.state(p ? .5 : 1);"
    );

    // The same ternary with a space is recognised, which is what makes the
    // no-space spelling a spacing defect rather than a missing ternary rule.
    assert_eq!(
        state_initializer("p ? .5 : 1"),
        "this.#a = $.state($.proxy(p ? .5 : 1));"
    );
    assert_eq!(
        state_initializer("p ? 1 : 2"),
        "this.#a = $.state($.proxy(p ? 1 : 2));"
    );
}

#[test]
fn the_shapes_upstream_refuses_to_proxy_stay_unproxied() {
    // The negative half: a whitelist gets these right by accident, so they are
    // the control that the rewrite did not simply start proxying everything.
    for expr in ["1", "\"s\"", "null", "undefined", "true"] {
        assert_eq!(
            state_initializer(expr),
            format!("this.#a = $.state({expr});"),
            "`{expr}` must not be proxied"
        );
    }
}

#[test]
fn the_shapes_that_already_proxied_still_proxy() {
    for expr in ["f(p)", "[1, 2]", "{ a: 1 }", "p.x ?? 1", "p?.x ?? 1"] {
        let got = state_initializer(expr);
        assert!(
            got.contains("$.proxy("),
            "`{expr}` must still be proxied, got `{got}`"
        );
    }
}
