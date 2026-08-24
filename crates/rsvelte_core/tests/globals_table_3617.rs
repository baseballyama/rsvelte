//! Regression tests for #3617 — the `globals` constant-folding table computed
//! about half of the entries that carry a function, and applied the wrong arity
//! rule to most of the rest.
//!
//! Upstream stores each global as a `[type, fn]` pair (`phases/scope.js:26-74`)
//! and calls `fn(...values)` when every argument is known. That is a real JS
//! call, so a missing argument is `undefined` and a surplus one is ignored;
//! rsvelte's port guarded on `args.len() == N` and gave up outside it. Four
//! more causes sat in the same function: Rust's `f64::min`/`f64::max` drop a
//! NaN operand where JS propagates it, `Math.round` was `(n + 0.5).floor()`
//! (wrong for the doubles just under `0.5`), `Math.pow` followed IEEE's
//! `pow(1, NaN) == 1` instead of JS's `NaN`, and `Number.parseInt` had no
//! implementation at all.
//!
//! The server is the target because that is where the table lives — the client
//! reaches the same entries through it since #3557, which is what made these
//! observable at all.
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// The rendered text of `<u>{v}</u>` for `const v = <expr>`.
fn folded(expr: &str) -> String {
    let src = format!("<script>\n\tconst v = {expr};\n</script>\n<u>{{v}}</u>\n");
    let code = compile(
        &src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let start = code
        .find("<u>")
        .unwrap_or_else(|| panic!("no <u> for {expr} in:\n{code}"));
    let rest = &code[start + 3..];
    let end = rest
        .find("</u>")
        .unwrap_or_else(|| panic!("no closing </u> for {expr} in:\n{code}"));
    rest[..end].to_string()
}

fn assert_folds(rows: &[(&str, &str)]) {
    for (expr, expected) in rows {
        assert_eq!(&folded(expr), expected, "for {expr}");
    }
}

/// A JS function reads a missing argument as `undefined` and ignores a surplus
/// one. Every row here is a call rsvelte refused to fold.
#[test]
fn the_arity_rule_is_the_javascript_one() {
    assert_folds(&[
        ("Math.floor()", "NaN"),
        ("Math.floor(1, 2)", "1"),
        ("Math.pow(2)", "NaN"),
        ("Math.pow(2, 3, 4)", "8"),
        ("Math.atan2(1)", "NaN"),
        ("Math.imul(3)", "0"),
        ("Math.clz32()", "32"),
        ("Math.sqrt()", "NaN"),
        ("Number(1, 2)", "1"),
        ("String(1, 2)", "1"),
        ("Number.isInteger()", "false"),
        ("Number.isNaN()", "false"),
        // the no-argument identities, which never needed the missing-argument
        // rule and must not move
        ("Math.max()", "-Infinity"),
        ("Math.min()", "Infinity"),
        ("Number()", "0"),
        ("String()", ""),
    ]);
}

/// Rust's `f64::min` / `f64::max` return the non-NaN operand; JS propagates.
/// `Math.pow` is the mirror image — IEEE `pow(1, NaN)` is `1`, JS is `NaN`.
#[test]
fn nan_propagates_the_way_javascript_propagates_it() {
    assert_folds(&[
        ("Math.max(undefined)", "NaN"),
        ("Math.min(undefined)", "NaN"),
        ("Math.max(1, undefined)", "NaN"),
        ("Math.min(1, \"x\")", "NaN"),
        ("Math.pow(1, \"x\")", "NaN"),
        // the control: the same callees over operands that coerce cleanly
        ("Math.max(1, \"3\")", "3"),
        ("Math.min(1, true)", "1"),
        ("Math.pow(1, 2)", "1"),
    ]);
}

/// `Math.round` is half-UP. `(n + 0.5).floor()` gets that right everywhere
/// except the doubles immediately below `0.5`, where adding `0.5` rounds up to
/// exactly `1` — the only inputs that can tell the two rules apart.
#[test]
fn the_rounding_rule_survives_its_own_edge() {
    assert_folds(&[
        ("Math.round(0.49999999999999994)", "0"),
        ("Math.round(-0.49999999999999994)", "0"),
        ("Math.round(0.5)", "1"),
        ("Math.round(-0.5)", "0"),
        ("Math.round(2.5)", "3"),
        ("Math.round(-2.5)", "-2"),
        ("Math.round(1.5)", "2"),
        // `Infinity` is not in `global_constants`, so it does not fold at all —
        // the row that says the fix reads a table and not a name.
        ("Math.round(1 / 0)", "Infinity"),
    ]);
}

/// Five entries carried a type marker and no implementation, so the value never
/// folded however known its arguments were.
#[test]
fn the_unimplemented_entries_compute() {
    assert_folds(&[
        ("Math.f16round(1.5)", "1.5"),
        ("Math.f16round(0.1)", "0.0999755859375"),
        ("Math.f16round(65504)", "65504"),
        ("Math.f16round(65520)", "Infinity"),
        ("Math.f16round(1e-8)", "0"),
        ("Number.parseInt(\"5x\")", "5"),
        ("Number.parseInt(\"0x1f\")", "31"),
        ("Number.parseInt(\"ff\", 16)", "255"),
        ("Number.parseInt(\"z\", 36)", "35"),
        ("Number.parseInt(\"5\", 1)", "NaN"),
        ("Number.parseInt(\"1e3\")", "1"),
        ("Number.parseInt(\"Infinity\")", "NaN"),
        ("Number.parseFloat(\"1e3\")", "1000"),
        ("Number.parseFloat(\"Infinity\")", "Infinity"),
        ("Number.parseFloat(\"1e\")", "1"),
        ("Number.parseFloat(\".\")", "NaN"),
        ("Number.parseFloat(\"0x1f\")", "0"),
        ("String.fromCharCode(65, 66)", "AB"),
        ("String.fromCharCode()", ""),
        ("String.fromCodePoint(65)", "A"),
    ]);
}

/// Accumulating in `f64` rounds at every step; V8 converts the whole digit
/// string once. Only a digit string past 2^53 can tell the two apart.
#[test]
fn parse_int_rounds_once() {
    assert_folds(&[
        ("Number.parseInt(\"999999999999999999999999\")", "1e+24"),
        ("Number.parseInt(\"9007199254740993\")", "9007199254740992"),
        ("Number.parseInt(\"9007199254740991\")", "9007199254740991"),
    ]);
}

/// The two shapes deliberately left unfolded, so a later reader does not
/// "finish" the table and reintroduce them.
///
/// A lone surrogate is a valid JS string and not a valid Rust one; and
/// `String.fromCodePoint` on an invalid code point makes the OFFICIAL compiler
/// throw an unhandled `RangeError`, so declining to fold is the more faithful
/// of the two behaviours (`upstream_issues/svelte-fromcodepoint-rangeerror.md`).
#[test]
fn two_shapes_stay_unfolded_on_purpose() {
    for expr in [
        "String.fromCharCode(0xD800)",
        "String.fromCodePoint(-1)",
        "String.fromCodePoint(1.5)",
        "String.fromCodePoint(0x110000)",
    ] {
        assert_eq!(&folded(expr), "${$.escape(v)}", "for {expr}");
    }
}
