//! Regression tests for the residue of #3654 — `Number(1n)` was the one global
//! call neither target folded.
//!
//! `to_number` refuses a bigint on purpose: `1n + 1` is a TypeError, so the
//! arithmetic operators must not coerce one. `Number(x)` is the exception —
//! it is ToNumber, which is defined for a bigint — and the globals table
//! reached it through the same helper, so the fold gave up.
//!
//! `Number.isInteger(1n)` is the control that keeps the exception narrow: it is
//! `false` in JS (the predicate wants a Number), and it must stay folded to
//! `false` rather than becoming `true` through a widened coercion.
//!
//! Every expectation is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const CASES: [(&str, &str); 12] = [
    ("Number(1n)", "1"),
    ("Number(-2n)", "-2"),
    ("Number(0n)", "0"),
    ("Number('3')", "3"),
    ("Number()", "0"),
    ("Number(true)", "1"),
    ("Number('')", "0"),
    ("String(1n)", "1"),
    ("String(3)", "3"),
    ("Number.isInteger(1n)", "false"),
    ("Number.isInteger(3)", "true"),
    ("Math.max(1, 2)", "2"),
];

/// Both targets fold the call, and to the same value — the point of the issue
/// was that they disagreed.
#[test]
fn both_targets_fold_the_global_call() {
    for (expr, expected) in CASES {
        let src = format!("<p>{{{expr}}}</p>\n");
        let server = code(&src, GenerateMode::Server);
        assert!(
            server.contains(&format!("$$renderer.push(`<p>{expected}</p>`);")),
            "server {expr:?} (expected {expected:?}) in:\n{server}"
        );
        let client = code(&src, GenerateMode::Client);
        assert!(
            client.contains(&format!("p.textContent = '{expected}';")),
            "client {expr:?} (expected {expected:?}) in:\n{client}"
        );
    }
}

/// A folded bigint conversion is an ordinary value afterwards, so it composes.
#[test]
fn the_folded_value_composes() {
    for (expr, expected) in [("Number(1n) + 1", "2"), ("String(1n) + 'x'", "1x")] {
        let src = format!("<p>{{{expr}}}</p>\n");
        let server = code(&src, GenerateMode::Server);
        assert!(
            server.contains(&format!("$$renderer.push(`<p>{expected}</p>`);")),
            "server {expr:?} in:\n{server}"
        );
    }
}

/// `BigInt(...)` is deliberately NOT folded — upstream's table maps it to
/// nothing, because the result is a bigint and the template would have to
/// render one. A fix that widens the bigint handling breaks this row.
#[test]
fn a_bigint_returning_call_is_not_folded() {
    let server = code("<p>{BigInt(3)}</p>\n", GenerateMode::Server);
    assert!(
        server.contains("$$renderer.push(`<p>${$.escape(BigInt(3))}</p>`);"),
        "in:\n{server}"
    );
}

/// The arithmetic operators still refuse a bare bigint operand: `1n + 1` throws
/// at runtime, so folding it to a number would invent a value JS never
/// produces. There is no oracle for this row — official *crashes* on it
/// (`upstream_issues/3054-svelte-bigint-mix-compile-crash.md`), which is
/// exactly the failure a coercion that does not refuse would reproduce.
#[test]
fn the_operators_still_refuse_a_bigint() {
    let server = code("<p>{1n + 1}</p>\n", GenerateMode::Server);
    assert!(
        server.contains("$$renderer.push(`<p>${$.escape(1n + 1)}</p>`);"),
        "in:\n{server}"
    );
    let client = code("<p>{1n + 1}</p>\n", GenerateMode::Client);
    assert!(client.contains("p.textContent = 1n + 1;"), "in:\n{client}");
}
