//! Regression test for `compile_module` leaking TypeScript syntax through the
//! text-based rune rewrites and mis-handling `$derived.by(() => { block })`
//! on the server side (baseballyama/rsvelte#140).
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
//! 2. The server-side post-processor for `$.derived(arrow)` always stripped
//!    the arrow head. For expression-bodied arrows that worked, but for
//!    block-bodied arrows (`$derived.by(() => { return X })`) it left a
//!    naked block `{ return X }` at expression position — invalid JS that
//!    rolldown/oxc reject.

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
fn server_derived_by_block_body_becomes_iife() {
    let src = r#"export const useFoo = () => {
  let pos = $state({ x: 0 });
  const style = $derived.by(() => {
    return `transform: translate(${pos.x}px);`;
  });
  return style;
};
"#;
    let out = compile_mod(src, GenerateMode::Server);
    // The arrow + block must survive as `(() => { … })()` — not stripped to a
    // bare `{ … }`, which would be invalid JS at expression position.
    assert!(
        out.contains("(() =>") && out.contains("})()"),
        "expected an IIFE wrap around the block body, got:\n{out}"
    );
    assert!(
        !out.contains("const style = {"),
        "the block must not be emitted as a bare object literal, got:\n{out}"
    );
}

#[test]
fn server_derived_expression_body_extracts_value() {
    // Regression guard: expression-bodied $derived (no block) should still
    // be extracted to just the expression on the server.
    let src = r#"export const useFoo = () => {
  let n = $state(0);
  const doubled = $derived(n * 2);
  return doubled;
};
"#;
    let out = compile_mod(src, GenerateMode::Server);
    assert!(
        out.contains("const doubled = n * 2;") || out.contains("const doubled = n * 2"),
        "expected `const doubled = n * 2`, got:\n{out}"
    );
}

#[test]
fn server_ts_with_derived_by_works_together() {
    // The original reproducer from #140 — TS annotations *and* a block-bodied
    // `$derived.by`. Both fixes must combine.
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
        out.contains("(() =>") && out.contains("})()"),
        "IIFE missing. Got:\n{out}"
    );
}
