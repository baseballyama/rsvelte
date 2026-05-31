//! Regression test: a block-lexical binding colliding with a function
//! declaration must error (issue #480, L-002). `let x; function x(){}` is a
//! redeclaration error in JS/TS; the function-redeclaration allowance (kept for
//! TS overloads) previously suppressed it.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn tc(src: &str) -> Result<(), String> {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .map(|_| ())
    .map_err(|e| format!("{e:?}"))
}

#[test]
fn let_then_function_errors() {
    assert!(tc("<script>let x; function x(){}</script>").is_err());
    assert!(tc("<script>const x = 1; function x(){}</script>").is_err());
    assert!(tc("<script>function x(){} let x;</script>").is_err());
}

#[test]
fn function_overloads_still_allowed() {
    // Two function declarations (TS-overload-style) must NOT error.
    assert!(tc("<script>function x(){} function x(){}</script>").is_ok());
}
