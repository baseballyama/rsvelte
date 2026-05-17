//! Regression test for `compile_module` leaking TypeScript syntax through the
//! text-based rune rewrites and emitting eagerly-evaluated `$derived` on the
//! server side (baseballyama/rsvelte#140 and follow-up).
//!
//! Two issues, one root cause:
//!
//! 1. `compile_module` parsed the TS source, stripped TS annotations from the
//!    AST, then handed the **raw source text** to `transform_module`, whose
//!    text-based rune rewrites then ran against TS-annotated input. TS
//!    annotations leaked through to the emitted JS, and byte offsets in
//!    multi-line rune calls shifted relative to what the rune scanner
//!    expected.
//!
//! 2. The server-side post-processor previously stripped `$.derived(() => X)`
//!    down to bare `X`, turning the derived into an eagerly-evaluated
//!    snapshot. Upstream svelte's server runtime exposes `$.derived(fn)` as
//!    a callable that re-evaluates on each call (see
//!    `svelte/src/internal/server/index.js#derived`), so the wrapper must
//!    survive and downstream reads via `$.get(X)` must lower to `X()`.
//!    Stripping caused derived values to freeze when their underlying state
//!    mutated (e.g. a form-model `isValid` stayed `false` even after the
//!    form was filled in).

use svelte_compiler_rust::GenerateMode;
use svelte_compiler_rust::compile_module;
use svelte_compiler_rust::compiler::ModuleCompileOptions;

fn compile_mod(src: &str, generate: GenerateMode) -> String {
    let result = compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("foo.svelte.ts".to_string()),
            generate,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile_module");
    result.js.code
}

#[test]
fn server_strips_ts_annotations() {
    let src = r#"export const useFoo = (
  getEl: () => HTMLElement | undefined,
): string => {
  return 'ok';
};
"#;
    let out = compile_mod(src, GenerateMode::Server);
    assert!(
        !out.contains("HTMLElement"),
        "TS param annotation should be stripped, got:\n{out}"
    );
    assert!(
        !out.contains("): string"),
        "TS return annotation should be stripped, got:\n{out}"
    );
}

#[test]
fn client_strips_ts_annotations() {
    let src = r#"export const useFoo = (getEl: () => HTMLElement): string => 'ok';
"#;
    let out = compile_mod(src, GenerateMode::Client);
    assert!(!out.contains("HTMLElement"), "got:\n{out}");
    assert!(!out.contains(": string"), "got:\n{out}");
}

#[test]
fn server_derived_by_block_body_keeps_wrapper() {
    let src = r#"export const useFoo = () => {
  let pos = $state({ x: 0 });
  const style = $derived.by(() => {
    return `transform: translate(${pos.x}px);`;
  });
  return style;
};
"#;
    let out = compile_mod(src, GenerateMode::Server);
    // Match upstream svelte: keep `$.derived(() => { … })` as a callable and
    // emit reads as `style()`. The previous "IIFE wrap" workaround
    // (`(() => { … })()`) eagerly evaluated the body once per factory call,
    // which silently snapshotted state.
    assert!(
        out.contains("const style = $.derived(() =>"),
        "expected `$.derived(() => {{ … }})` wrapper to survive, got:\n{out}"
    );
    assert!(
        out.contains("return style();"),
        "expected the read to be lowered to `style()`, got:\n{out}"
    );
    assert!(
        !out.contains("})()"),
        "expected NO IIFE wrap — the wrapper is the derived itself, got:\n{out}"
    );
}

#[test]
fn server_derived_expression_body_keeps_wrapper() {
    // Regression guard: expression-bodied $derived must also keep its
    // `$.derived(() => …)` wrapper on the server so reads stay reactive.
    let src = r#"export const useFoo = () => {
  let n = $state(0);
  const doubled = $derived(n * 2);
  return doubled;
};
"#;
    let out = compile_mod(src, GenerateMode::Server);
    assert!(
        out.contains("const doubled = $.derived(() => n * 2)"),
        "expected `const doubled = $.derived(() => n * 2)`, got:\n{out}"
    );
    assert!(
        out.contains("return doubled();"),
        "expected the read to be lowered to `doubled()`, got:\n{out}"
    );
}

#[test]
fn server_ts_with_derived_by_works_together() {
    // The original reproducer from #140 — TS annotations *and* a block-bodied
    // `$derived.by`. TS strip *and* the derived-wrapper preservation must
    // combine.
    let src = r#"export const useFoo = (
  getEl: () => HTMLElement | undefined,
): string => {
  let pos = $state({ x: 0 });
  const style = $derived.by(() => {
    return `transform: translate(${pos.x}px);`;
  });
  return style;
};
"#;
    let out = compile_mod(src, GenerateMode::Server);
    assert!(!out.contains("HTMLElement"), "TS leak. Got:\n{out}");
    assert!(
        out.contains("const style = $.derived(() =>"),
        "expected `$.derived(() => {{ … }})` wrapper to survive, got:\n{out}"
    );
    assert!(
        out.contains("return style();"),
        "expected the read to be lowered to `style()`, got:\n{out}"
    );
}
