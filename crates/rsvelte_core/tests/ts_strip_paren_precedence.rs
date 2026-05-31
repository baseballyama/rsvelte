//! Regression test: stripping `(X as T)` / `(X!)` parens must preserve
//! precedence (issue #457, H-125).
//!
//! Bug: when a parenthesized expression wraps a TS-only wrapper (`as`,
//! `satisfies`, `!`, `<T>`), the type-erasure pass dropped both layers
//! unconditionally. `(-n as number) ** 2` → `-n ** 2` is a JS syntax error
//! (unary cannot directly precede `**`); `(a + b as number) * c` →
//! `a + b * c` silently reassociates. Now the parens are only dropped when
//! peeling the TS wrapper exposes a "simple" expression (identifier, literal,
//! member / call / `new`, etc.) — never a unary / binary / logical /
//! conditional / sequence expression.

use rsvelte_core::{GenerateMode, compile_module, compiler::ModuleCompileOptions};

fn compile_ts(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("x.svelte.ts".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn unary_in_exponentiation_keeps_parens() {
    let out = compile_ts("export function f(n:number){ return (-n as number) ** 2; }");
    assert!(out.contains("(-n) ** 2"), "got:\n{out}");
}

#[test]
fn binary_in_multiplication_keeps_parens() {
    let out = compile_ts(
        "export function f(a:number,b:number,c:number){ return (a + b as number) * c; }",
    );
    assert!(out.contains("(a + b) * c"), "got:\n{out}");
}

#[test]
fn simple_identifier_drops_parens() {
    let out = compile_ts("export function f(x:number){ return (x as number); }");
    assert!(out.contains("return x;"), "got:\n{out}");
    assert!(
        !out.contains("return (x"),
        "must drop parens for simple id, got:\n{out}"
    );
}

#[test]
fn simple_call_drops_parens() {
    let out = compile_ts("export function f(){ return (foo() as number); }");
    assert!(out.contains("return foo();"), "got:\n{out}");
}

#[test]
fn ts_non_null_unary_keeps_parens() {
    let out = compile_ts("export function f(n:number){ return (-n!) ** 2; }");
    assert!(out.contains("(-n) ** 2"), "got:\n{out}");
}
