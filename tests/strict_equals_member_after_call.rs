//! Regression test for `transform_strict_equals` mangling `X.member !== Y`
//! when `X` is wrapped in a call expression like `$.get(items)` (which the
//! dev-mode `$state` lowering produces). (baseballyama/rsvelte#166)
//!
//! Bug: `extract_operand_backward` walked the LHS backward looking for the
//! start of the operand. When it hit a `)`, it parsed the call expression
//! correctly — but it only did that when the operand *ends* with `)`. For a
//! member access on a call (`$.get(items).length`), the operand ends with
//! `h`, not `)`, so the fallback "scan identifier chars" path took over —
//! and that path stopped at the `)` of `$.get(items)` because `)` is not
//! an identifier char. The result was `left_expr = ".length"` and the
//! replacement landed in the middle of the chain:
//!
//!     $.get(items).length !== 0   →   $.get(items)!$.strict_equals(.length, 0)
//!
//! Now the extractor walks the entire chain — peeling off identifier runs
//! and matched `(...)` / `[...]` groups in turn — so `$.get(items).length`
//! is returned as a single operand.

use svelte_compiler_rust::GenerateMode;
use svelte_compiler_rust::compile_module;
use svelte_compiler_rust::compiler::ModuleCompileOptions;

fn compile_mod_client_dev(src: &str) -> String {
    let result = compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("x.svelte.ts".to_string()),
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
    // The arrow body should test the full member chain — `!$.strict_equals($.get(items).length, 0)`.
    assert!(
        out.contains("!$.strict_equals($.get(items).length, 0)"),
        "expected `!$.strict_equals($.get(items).length, 0)`. Got:\n{out}"
    );
    // No mangled `!$.strict_equals(.length, ...)` floating around.
    assert!(
        !out.contains("$.strict_equals(.length"),
        "found mangled `$.strict_equals(.length, …)` — operand was split:\n{out}"
    );
    // And the `$.get(items)` shouldn't be stranded with a bare `!` either.
    assert!(
        !out.contains("$.get(items)!"),
        "found stranded `$.get(items)!`:\n{out}"
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
            && !out.contains("!$.strict_equals($.get(items).length"),
        "expected `$.strict_equals($.get(items).length, 0)` (no `!`). Got:\n{out}"
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
        out.contains("!$.strict_equals($.get(arr)[0].length, 0)")
            || out.contains("!$.strict_equals(($.get(arr))[0].length, 0)"),
        "expected `!$.strict_equals($.get(arr)[0].length, 0)`. Got:\n{out}"
    );
}

#[test]
fn plain_identifier_neq_still_works() {
    // Regression guard: simple `a !== b` shouldn't regress.
    let src = r#"export const fn = (a: number, b: number) => {
  if (a !== b) return a;
  return b;
};"#;
    let out = compile_mod_client_dev(src);
    assert!(
        out.contains("!$.strict_equals(a, b)"),
        "expected `!$.strict_equals(a, b)`. Got:\n{out}"
    );
}

#[test]
fn call_left_operand_still_works() {
    // Regression guard: when LHS *does* end with `)` the call form still works.
    let src = r#"export const fn = (a: number) => {
  if (Math.abs(a) !== 0) return a;
  return 0;
};"#;
    let out = compile_mod_client_dev(src);
    assert!(
        out.contains("!$.strict_equals(Math.abs(a), 0)"),
        "expected `!$.strict_equals(Math.abs(a), 0)`. Got:\n{out}"
    );
}
