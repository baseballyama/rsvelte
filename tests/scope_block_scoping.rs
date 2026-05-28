//! Lexical-scope coverage for issue #444 (H-005, H-006): `var` hoists to the
//! enclosing function scope, and `try` / `finally` blocks and `switch` bodies
//! get their own lexical scopes so `let`/`const` inside them don't leak.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| format!("{e:?}"))
}

/// H-006: a `let` in a `try` block and a `let` in the matching `finally` block
/// live in distinct scopes, so re-using the same name is not a duplicate.
#[test]
fn try_and_finally_lets_do_not_collide() {
    let src = "<script>\nfunction f() {\n  try { let dup = 1; return dup; }\n  finally { let dup = 2; return dup; }\n}\nf();\n</script>";
    let out = compile_client(src);
    assert!(out.is_ok(), "try/finally let collided: {out:?}");
}

/// H-006: `let` declarations inside a `switch` case body stay within the switch
/// block scope and do not leak to (or collide with) the enclosing scope.
#[test]
fn switch_case_let_does_not_leak() {
    let src = "<script>\nfunction f(n) {\n  switch (n) { case 1: { let leaked = 1; return leaked; } }\n  let leaked = 2;\n  return leaked;\n}\nf(0);\n</script>";
    let out = compile_client(src);
    assert!(out.is_ok(), "switch-case let leaked: {out:?}");
}

/// H-005: a `var` inside a block is hoisted to the enclosing function scope, so
/// the same `var` name in an outer block is the same binding (not a conflict).
#[test]
fn var_hoists_out_of_block() {
    let src = "<script>\nfunction f(cond) {\n  if (cond) { var hoisted = 1; }\n  return hoisted;\n}\nf(true);\n</script>";
    let out = compile_client(src);
    assert!(out.is_ok(), "var hoisting failed: {out:?}");
}
