//! Regression tests for #3555 — a spread argument did not stop a `globals`
//! call from reading as known-defined, so `Math.max(...xs)` lost its `?? ''`.
//!
//! Upstream's `globals` branch is one condition with two halves
//! (`phases/scope.js:509-512`): the callee keypath is in the table AND
//! `expression.arguments.every((arg) => arg.type !== 'SpreadElement')`. A
//! spread falls through to UNKNOWN, which is possibly-nullish, so the `?? ''`
//! stays.
//!
//! rsvelte's SERVER port had the guard, which is why the server target was
//! already byte-identical — the two ports of one upstream function again, with
//! no gate comparing them to each other. The client asked the table alone at
//! three of its six call sites and remembered the spread at the other three, so
//! the guard is now a PARAMETER: a site cannot forget what it has to pass.
//!
//! Unifying the two also closed a second divergence in the same predicate. The
//! phase-2 copy tested `keypath.starts_with("Math.")`, so `Math.nope(n)` and
//! `Number.nope(n)` read as known globals while `String.nope(n)` — spelled out
//! in full there — did not. There is now one table, in `2_analyze/scope.rs`,
//! where upstream keeps it.
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// The generated code for `<b>{v}x</b>` where `v` is `expr`.
///
/// `n` is written by `bump`, so nothing folds — otherwise the constant folder
/// answers first and the `?? ''` question never arises.
fn compile_read(expr: &str, generate: GenerateMode, dev: bool) -> String {
    let src = format!(
        "<script>\n\tlet n = $state(1);\n\tconst xs = [1, 2];\n\tfunction foo(...a) {{ return a[0]; }}\n\tfunction bump() {{ n += 1; }}\n\tconst v = {expr};\n</script>\n<button onclick={{bump}}>b</button>\n<b>{{v}}x</b>\n"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The `${v …}x` interpolation, wherever the target puts it.
fn interpolation(code: &str, expr: &str) -> String {
    let start = code
        .find("`${v")
        .unwrap_or_else(|| panic!("no `v` interpolation for {expr} in:\n{code}"));
    let rest = &code[start..];
    let end = rest.find("x`").expect("closing") + 2;
    rest[..end].to_string()
}

fn assert_nullish_guard(expr: &str, expected_guard: bool) {
    let expected = if expected_guard {
        "`${v ?? ''}x`"
    } else {
        "`${v}x`"
    };
    for dev in [false, true] {
        let code = compile_read(expr, GenerateMode::Client, dev);
        assert_eq!(
            interpolation(&code, expr),
            expected,
            "for {expr} (dev={dev})"
        );
    }
}

/// The defect: a spread makes the call UNKNOWN, so the guard stays.
#[test]
fn a_spread_argument_keeps_the_nullish_guard() {
    for expr in [
        "Math.max(...[1, 2, n])",
        "Math.max(1, ...[2, n])",
        "Math.min(...xs)",
        "String(...[n])",
        "Number(...[n])",
        "BigInt(...[1])",
    ] {
        assert_nullish_guard(expr, true);
    }
}

/// The control: the same callees WITHOUT a spread are known-defined, so the
/// guard is dropped. Without this row the fix could be "never trust a globals
/// call".
#[test]
fn the_same_callees_without_a_spread_stay_known() {
    for expr in [
        "Math.max(1, 2, n)",
        "Math.round(n)",
        "String(n)",
        "Number(n)",
        "BigInt(1)",
        "Number.isInteger(n)",
    ] {
        assert_nullish_guard(expr, false);
    }
}

/// The second half: a name that merely LOOKS like a global. The phase-2 copy
/// matched `Math.` and `Number.` by prefix, so these read as known there while
/// `String.nope` — spelled out in full — did not; the asymmetry is what says it
/// was a transcription, not a policy.
#[test]
fn a_near_miss_global_is_not_known() {
    for expr in [
        "Math.nope(n)",
        "Math.maxx(n)",
        "Number.nope(n)",
        "String.nope(n)",
        "foo(n)",
        "foo(...[n])",
    ] {
        assert_nullish_guard(expr, true);
    }
}

/// The server reaches the same predicate and has always had the guard, but its
/// text interpolation is `$.escape(v)` — the nullish decision has no observable
/// there in this shape. Recorded rather than asserted, so the next reader does
/// not mistake the absence of a server row for an untested target: the server
/// column of the 135-cell grid behind this fix never diverged.
#[test]
fn the_server_has_no_observable_for_this_decision() {
    for expr in ["Math.max(...[1, 2, n])", "Math.max(1, 2, n)"] {
        let code = compile_read(expr, GenerateMode::Server, false);
        assert!(code.contains("$.escape(v)"), "for {expr} in:\n{code}");
        assert!(!code.contains("?? ''"), "for {expr} in:\n{code}");
    }
}
