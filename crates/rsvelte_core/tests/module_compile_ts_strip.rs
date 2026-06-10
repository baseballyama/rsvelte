//! `compile_module` behavior tests for `$derived` server lowering, plus a
//! guard that TS module input is rejected like upstream.
//!
//! HISTORY: rsvelte used to TS-sniff from a `.svelte.ts` filename and strip
//! annotations itself (#140). Upstream's `analyze_module` parses plain JS
//! only — TS must be stripped by the bundler (esbuild/Vite) BEFORE
//! `compileModule` — so rsvelte now mirrors that and rejects TS syntax.
//! The `$derived` server-wrapper tests below (originally written against
//! the TS pipeline) therefore use plain-JS sources.
//!
//! Server-side `$derived` rule: upstream exposes `$.derived(fn)` as a
//! callable that re-evaluates per read, so the wrapper must survive and
//! reads via `$.get(X)` must lower to `X()`. Stripping the wrapper caused
//! derived values to freeze when their underlying state mutated.

use rsvelte_core::GenerateMode;
use rsvelte_core::compile_module;
use rsvelte_core::compiler::ModuleCompileOptions;

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
fn server_rejects_ts_annotations() {
    // Upstream parity: analyze_module parses plain JS; TS syntax errors.
    let src = r#"export const useFoo = (
  getEl: () => HTMLElement | undefined,
): string => {
  return 'ok';
};
"#;
    let r = compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("foo.svelte.ts".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    );
    assert!(r.is_err(), "TS module input must error like upstream");
}

#[test]
fn client_rejects_ts_annotations() {
    let src = r#"export const useFoo = (getEl: () => HTMLElement): string => 'ok';
"#;
    let r = compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("foo.svelte.ts".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    );
    assert!(r.is_err(), "TS module input must error like upstream");
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
    // The original reproducer from #140, post-esbuild (annotations already
    // stripped, as the production pipeline does before compileModule).
    let src = r#"export const useFoo = (
  getEl,
) => {
  let pos = $state({ x: 0 });
  const style = $derived.by(() => {
    return `transform: translate(${pos.x}px);`;
  });
  return style;
};
"#;
    let out = compile_mod(src, GenerateMode::Server);
    assert!(
        out.contains("const style = $.derived(() =>"),
        "expected `$.derived(() => {{ … }})` wrapper to survive, got:\n{out}"
    );
    assert!(
        out.contains("return style();"),
        "expected the read to be lowered to `style()`, got:\n{out}"
    );
}
