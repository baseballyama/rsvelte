//! Upstream constant-folds a template chunk by running `scope.evaluate()` on
//! the *converted* expression. In dev the `BinaryExpression` visitor has
//! already rewritten an equality into `$.strict_equals` / `$.equals`, so the
//! chunk is a call and never folds — `{1 === 1}` stays a call rather than
//! becoming the literal `'true'`.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Eq.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn a_static_equality_stays_a_call_in_dev() {
    let out = compile_client("<h1>{1 === 1}</h1>", true);
    assert!(
        out.contains("$.strict_equals(1, 1)"),
        "expected the dev call, got:\n{out}"
    );
}

#[test]
fn a_static_equality_still_folds_outside_dev() {
    let out = compile_client("<h1>{1 === 1}</h1>", false);
    assert!(
        out.contains("'true'"),
        "expected the folded literal, got:\n{out}"
    );
}
