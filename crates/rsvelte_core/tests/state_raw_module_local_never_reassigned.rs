//! Regression test for a non-reassigned `$state.raw` local getting optimized
//! to a plain value, matching the official compiler's `is_state_source`
//! (`3-transform/client/utils.js`): in runes mode a `state`/`raw_state`
//! binding that is never reassigned is not a "state source" and skips both
//! the `$.state(...)` declaration wrapper and `$.get(...)` read wrapping.
//!
//! rsvelte previously only applied this optimization to `$state`/`$state.raw`
//! locals declared at the module's *top level* (plus a `const`-only carve-out
//! for locals inside functions), so a non-reassigned `let` inside a function
//! body kept the `$.get(...)` wrapper the official compiler drops. The gate
//! now keys off `Binding::reassigned` directly — the same signal official
//! uses — regardless of scope depth or `let`/`const`. (#2082)

use rsvelte_core::GenerateMode;
use rsvelte_core::compile_module;
use rsvelte_core::compiler::ModuleCompileOptions;

fn compile_mod_client(src: &str, dev: bool) -> String {
    let result = compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("x.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile_module");
    result.js.code
}

#[test]
fn non_reassigned_raw_state_in_nested_function_is_plain_value() {
    // `items` lives inside the arrow function body (not the module's top
    // level) and is never reassigned.
    let src = r#"export const fn = () => {
  let items = $state.raw([]);
  return items.length;
};"#;
    let out = compile_mod_client(src, false);
    assert!(
        out.contains("let items = [];"),
        "expected the `$state.raw([])` declarator to collapse to a plain `[]`. Got:\n{out}"
    );
    assert!(
        out.contains("return items.length;"),
        "expected a plain, unwrapped read of `items`. Got:\n{out}"
    );
    assert!(
        !out.contains("$.get(items)") && !out.contains("$.state("),
        "found reactive wrapping on a never-reassigned `$state.raw` local:\n{out}"
    );
}

#[test]
fn non_reassigned_raw_state_at_module_top_level_is_plain_value() {
    // Top-level module case — already worked before #2082, kept as a
    // same-file sibling so the two scopes are covered side by side.
    let src = r#"let items = $state.raw([]);
export function len() {
  return items.length;
}"#;
    let out = compile_mod_client(src, false);
    assert!(
        out.contains("let items = [];"),
        "expected the `$state.raw([])` declarator to collapse to a plain `[]`. Got:\n{out}"
    );
    assert!(
        !out.contains("$.get(items)") && !out.contains("$.state("),
        "found reactive wrapping on a never-reassigned `$state.raw` local:\n{out}"
    );
}

#[test]
fn reassigned_raw_state_in_nested_function_still_reactive() {
    // Control case: once `items` is reassigned anywhere, it *is* a state
    // source and must keep the `$.state(...)` / `$.get(...)` wrapping.
    let src = r#"export const fn = () => {
  let items = $state.raw([]);
  items = [1];
  return items.length;
};"#;
    let out = compile_mod_client(src, false);
    assert!(
        out.contains("$.state([])"),
        "expected the reassigned `$state.raw([])` declarator to keep `$.state(...)`. Got:\n{out}"
    );
    assert!(
        out.contains("$.get(items)"),
        "expected reads of the reassigned local to stay wrapped in `$.get(...)`. Got:\n{out}"
    );
}

#[test]
fn non_reassigned_plain_state_in_nested_function_is_proxied_not_sourced() {
    // Same optimization, but for bare `$state(...)` (not `.raw`): a
    // never-reassigned local still gets `$.proxy(...)` for deep reactivity
    // on objects/arrays, but not the `$.state(...)`/`$.get(...)` source
    // wrapping — mirroring `create_state_declarator` in
    // `3-transform/client/visitors/VariableDeclaration.js`.
    let src = r#"export const fn = () => {
  let items = $state([]);
  return items.length;
};"#;
    let out = compile_mod_client(src, false);
    assert!(
        out.contains("let items = $.proxy([]);"),
        "expected the non-reassigned `$state([])` declarator to drop to `$.proxy(...)` only. Got:\n{out}"
    );
    assert!(
        !out.contains("$.get(items)") && !out.contains("$.state("),
        "found `$.state(...)`/`$.get(...)` wrapping on a never-reassigned `$state` local:\n{out}"
    );
}
