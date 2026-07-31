//! Regression test for the dev equality rewrite mangling `X.member !== Y`
//! when `X` is wrapped in a call expression like `$.get(items)` (which the
//! dev-mode `$state` lowering produces). (baseballyama/rsvelte#166)
//!
//! The original text scanner walked the left operand backward and stopped at
//! the `)` of `$.get(items)`, because `)` is not an identifier character. It
//! captured `.length` as the whole operand and spliced the call into the
//! middle of the chain:
//!
//!     $.get(items).length !== 0   →   $.get(items)!$.strict_equals(.length, 0)
//!
//! Operands now come off the AST, so an operand can no longer be split. These
//! cases stay as a guard against regressing to a text-based extractor.
//!
//! Note the negated form: `!==` emits `$.strict_equals(l, r, false)`, matching
//! the official compiler, rather than negating the call from outside.

use rsvelte_core::GenerateMode;
use rsvelte_core::compile_module;
use rsvelte_core::compiler::ModuleCompileOptions;

fn compile_mod_client_dev(src: &str) -> String {
    let result = compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("x.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile_module");
    result.js.code
}

#[test]
fn neq_after_member_on_tagged_state_call_chain() {
    let src = r#"export const fn = () => {
  let items = $state.raw([]);
  if (items.length !== 0) items[0];
};"#;
    let out = compile_mod_client_dev(src);
    // The arrow body should test the full member chain.
    assert!(
        out.contains("$.strict_equals($.get(items).length, 0, false)"),
        "expected `$.strict_equals($.get(items).length, 0, false)`. Got:\n{out}"
    );
    // No mangled `$.strict_equals(.length, ...)` floating around.
    assert!(
        !out.contains("$.strict_equals(.length"),
        "found mangled `$.strict_equals(.length, …)` — operand was split:\n{out}"
    );
    // Nor a fragment of the chain stranded outside the call.
    assert!(
        !out.contains("$.get(items).length !==") && !out.contains(").length, 0)$"),
        "found part of the chain left outside the call:\n{out}"
    );
}

#[test]
fn eq_after_member_on_tagged_state_call_chain() {
    // Mirror case with `===`.
    let src = r#"export const fn = () => {
  let items = $state.raw([]);
  if (items.length === 0) items[0];
};"#;
    let out = compile_mod_client_dev(src);
    assert!(
        out.contains("$.strict_equals($.get(items).length, 0)")
            && !out.contains("$.strict_equals($.get(items).length, 0, false)"),
        "expected `$.strict_equals($.get(items).length, 0)` (no negation argument). Got:\n{out}"
    );
}

#[test]
fn neq_after_bracket_index_chain() {
    // `arr[0].length !== 0` — the chain ends with a bracket-index too.
    let src = r#"export const fn = () => {
  let arr = $state.raw([[1, 2]]);
  if (arr[0].length !== 0) arr[0][0];
};"#;
    let out = compile_mod_client_dev(src);
    assert!(
        out.contains("$.strict_equals($.get(arr)[0].length, 0, false)")
            || out.contains("$.strict_equals(($.get(arr))[0].length, 0, false)"),
        "expected `$.strict_equals($.get(arr)[0].length, 0, false)`. Got:\n{out}"
    );
}

#[test]
fn plain_identifier_neq_still_works() {
    // Regression guard: simple `a !== b` shouldn't regress.
    let src = r#"export const fn = (a, b) => {
  if (a !== b) return a;
  return b;
};"#;
    let out = compile_mod_client_dev(src);
    assert!(
        out.contains("$.strict_equals(a, b, false)"),
        "expected `$.strict_equals(a, b, false)`. Got:\n{out}"
    );
}

#[test]
fn call_left_operand_still_works() {
    // Regression guard: when LHS *does* end with `)` the call form still works.
    let src = r#"export const fn = (a) => {
  if (Math.abs(a) !== 0) return a;
  return 0;
};"#;
    let out = compile_mod_client_dev(src);
    assert!(
        out.contains("$.strict_equals(Math.abs(a), 0, false)"),
        "expected `$.strict_equals(Math.abs(a), 0, false)`. Got:\n{out}"
    );
}
