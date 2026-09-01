//! Upstream tests `is_simple_expression` on the *transformed* initializer, where
//! a legacy store read is already `$s()` and a `$:` variable is already
//! `$.get(r)` — both calls, hence non-simple, hence thunked with
//! `PROPS_IS_LAZY_INITIAL` (flags 24). rsvelte tested the untransformed source,
//! where each is a plain identifier, so a store or `$:` read nested inside a
//! logical / conditional / binary default was judged simple: flags 8, no thunk —
//! and for a store the value stayed the bare getter `$s`, so the default was the
//! function itself rather than the store's value.
//!
//! A BARE identifier already had its own branches (`is_store_accessor`,
//! `is_prop_ref`, the `LegacyReactive` thunk), which is why only the nested
//! positions diverged. Those bare rows are the controls here.
//!
//! Every expected fragment was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn prop_line(head: &str, default_value: &str) -> String {
    let src =
        format!("<script>\n\t{head}\n\texport let c = {default_value};\n</script>\n<p>{{c}}</p>\n");
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .find(|l| l.contains("let c = $.prop("))
        .unwrap_or_else(|| panic!("no `$.prop` declarator in:\n{js}"))
        .trim()
        .to_string()
}

const STORE: &str = r#"import { s } from './s.js';"#;
const REACTIVE: &str = r#"let z = 1; $: r = z + 1;"#;

#[test]
fn a_store_read_nested_in_a_default_is_thunked() {
    assert_eq!(
        prop_line(STORE, "$s ?? null"),
        "let c = $.prop($$props, 'c', 24, () => $s() ?? null);"
    );
    assert_eq!(
        prop_line(STORE, "$s ? 1 : 2"),
        "let c = $.prop($$props, 'c', 24, () => $s() ? 1 : 2);"
    );
    assert_eq!(
        prop_line(STORE, "$s + 1"),
        "let c = $.prop($$props, 'c', 24, () => $s() + 1);"
    );
    assert_eq!(
        prop_line(STORE, "1 ? ($s ?? 2) : 3"),
        "let c = $.prop($$props, 'c', 24, () => 1 ? $s() ?? 2 : 3);"
    );
}

#[test]
fn a_legacy_reactive_read_nested_in_a_default_is_thunked() {
    assert_eq!(
        prop_line(REACTIVE, "r ?? null"),
        "let c = $.prop($$props, 'c', 24, () => $.get(r) ?? null);"
    );
    assert_eq!(
        prop_line(REACTIVE, "r ? 1 : 2"),
        "let c = $.prop($$props, 'c', 24, () => $.get(r) ? 1 : 2);"
    );
    assert_eq!(
        prop_line(REACTIVE, "r + 1"),
        "let c = $.prop($$props, 'c', 24, () => $.get(r) + 1);"
    );
    assert_eq!(
        prop_line(REACTIVE, "1 ? (r ?? 2) : 3"),
        "let c = $.prop($$props, 'c', 24, () => 1 ? $.get(r) ?? 2 : 3);"
    );
}

/// A bare store stays the un-thunked getter reference — upstream's separate
/// `initial.callee` branch, not the thunk. Would go red if the fix made every
/// store read non-simple without leaving that branch first.
#[test]
fn a_bare_store_default_is_still_the_getter_reference() {
    assert_eq!(
        prop_line(STORE, "$s"),
        "let c = $.prop($$props, 'c', 24, $s);"
    );
}

/// A bare `$:` variable was already thunked before this change.
#[test]
fn a_bare_legacy_reactive_default_is_still_thunked() {
    assert_eq!(
        prop_line(REACTIVE, "r"),
        "let c = $.prop($$props, 'c', 24, () => $.get(r));"
    );
}

/// The control that separates "a store/`$:` read is not simple" from "a nested
/// identifier is not simple": a plain `let` that no transform rewrites keeps
/// flags 8 and no thunk in every one of the same four positions.
#[test]
fn a_plain_local_nested_in_a_default_stays_simple() {
    for (value, expected) in [
        ("q ?? null", "let c = $.prop($$props, 'c', 8, q ?? null);"),
        ("q ? 1 : 2", "let c = $.prop($$props, 'c', 8, q ? 1 : 2);"),
        ("q + 1", "let c = $.prop($$props, 'c', 8, q + 1);"),
        (
            "1 ? (q ?? 2) : 3",
            "let c = $.prop($$props, 'c', 8, 1 ? q ?? 2 : 3);",
        ),
    ] {
        assert_eq!(prop_line("let q = 1;", value), expected, "for `{value}`");
    }
}
