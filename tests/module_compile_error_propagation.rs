//! Regression test: `compile_module` must propagate errors from the TypeScript
//! strip pass and from `transform_module`, not silently emit raw source
//! (issue #450, H-085 / H-086).
//!
//! Bug:
//! - `let _ = remove_typescript_nodes(...)` swallowed unsupported-TS errors
//!   (e.g. decorators on class fields) so `compile_module` returned `Ok` with
//!   an un-stripped TS AST that downstream phases mis-handle.
//! - `match transform_result { Err(_) => format!("/* … */\n{source}") }`
//!   converted every transform failure into a successful raw-source output
//!   with a header comment, hiding real compile failures from users.
//!
//! Both paths now use the same `?` propagation the component compile path uses.

use svelte_compiler_rust::{GenerateMode, compile_module, compiler::ModuleCompileOptions};

fn opts(filename: &str) -> ModuleCompileOptions {
    ModuleCompileOptions {
        filename: Some(filename.to_string()),
        generate: GenerateMode::Client,
        dev: false,
        ..Default::default()
    }
}

#[test]
fn valid_ts_module_still_compiles() {
    let r = compile_module("export const x: number = 1;", opts("x.svelte.ts"));
    assert!(
        r.is_ok(),
        "valid TS module must still compile, got: {:?}",
        r.err()
    );
}

#[test]
fn ts_decorator_now_errors_instead_of_being_silently_dropped() {
    // `remove_typescript_nodes` rejects `@decorator` (Stage 3, not Stage 4).
    // Previously this error was swallowed by `let _ = …` so the module would
    // compile with the decorator surviving into downstream phases.
    let r = compile_module("@dec class C {}", opts("x.svelte.ts"));
    assert!(
        r.is_err(),
        "decorator on a class should now surface a parse error, got: {:?}",
        r.ok()
    );
    let err = format!("{:?}", r.err().unwrap());
    assert!(
        err.contains("decorator"),
        "expected the diagnostic to mention `decorator`, got:\n{err}"
    );
}

#[test]
fn valid_js_module_still_compiles() {
    let r = compile_module(
        "export const x = 1; export function inc(){ return x + 1; }",
        opts("x.svelte.js"),
    );
    assert!(r.is_ok(), "got: {:?}", r.err());
}
