//! Three `globals` entries upstream stores with a fold function were answered
//! with a type marker, so a known value read as unknown and the chunk was not
//! folded into the template.
//!
//! `scope.js` stores `[type, fn?]` per keypath and folds when
//! `fn && values.every(e => e.is_known)`. `String.fromCharCode`,
//! `String.fromCodePoint` and `Math.f16round` all have an `fn`;
//! `BigInt` and `Math.random` are the only two that do not.
//!
//! Every expectation is the official compiler's own server output for the same
//! source (`generate: 'server'`, `dev: false`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn folded(expr: &str) -> String {
    let src = format!("{{#if true}}{{@const c = {expr}}}{{c}}{{/if}}\n");
    let out = server(&src);
    let start = out
        .find("$$renderer.push('<!--[0-->');")
        .expect("if branch");
    let tail = &out[start..];
    let end = tail.find("} else {").expect("else arm");
    tail[..end].to_string()
}

/// The issue's repro: the folded value reaches the template instead of an escape.
#[test]
fn from_char_code_folds_into_the_template() {
    assert!(
        folded("String.fromCharCode(65)").contains("$$renderer.push(`A`);"),
        "{}",
        folded("String.fromCharCode(65)")
    );
    assert!(folded("String.fromCharCode(72, 105)").contains("$$renderer.push(`Hi`);"));
    // `ToUint16` per argument: truncate, then modulo 2^16 — never a throw.
    assert!(folded("String.fromCharCode(65.9)").contains("$$renderer.push(`A`);"));
    assert!(folded("String.fromCharCode(65536 + 65)").contains("$$renderer.push(`A`);"));
    assert!(folded("String.fromCharCode(\"66\")").contains("$$renderer.push(`B`);"));
    // -1 wraps to 0xFFFF rather than erroring.
    assert!(folded("String.fromCharCode(-1)").contains("$$renderer.push(`\u{ffff}`);"));
}

#[test]
fn from_code_point_folds_into_the_template() {
    assert!(folded("String.fromCodePoint(65)").contains("$$renderer.push(`A`);"));
    assert!(folded("String.fromCodePoint(0x41, 0x42)").contains("$$renderer.push(`AB`);"));
    // Above the BMP, so the surrogate pair has to be re-encoded correctly.
    assert!(folded("String.fromCodePoint(0x1f600)").contains("$$renderer.push(`\u{1f600}`);"));
}

#[test]
fn f16round_folds_into_the_template() {
    assert!(folded("Math.f16round(1.337)").contains("$$renderer.push(`1.3369140625`);"));
    assert!(folded("Math.f16round(0.1)").contains("$$renderer.push(`0.0999755859375`);"));
    // The overflow midpoint rounds away to Infinity under ties-to-even.
    assert!(folded("Math.f16round(65520)").contains("$$renderer.push(`Infinity`);"));
    // `String(-0)` is `"0"`.
    assert!(folded("Math.f16round(-0)").contains("$$renderer.push(`0`);"));
    // Below half the smallest subnormal, so it rounds to zero rather than staying.
    assert!(folded("Math.f16round(1e-8)").contains("$$renderer.push(`0`);"));
}

/// `NaN` is a plain global identifier, not an entry in upstream's table, so an
/// argument spelled `NaN` is not a known value and nothing folds. Measured on
/// official: both of these keep the call.
#[test]
fn a_nan_identifier_argument_is_not_a_known_value() {
    for expr in ["Math.f16round(NaN)", "String.fromCharCode(NaN)"] {
        let out = folded(expr);
        assert!(out.contains("$.escape(c)"), "{expr} folded:\n{out}");
    }
}

/// The two entries upstream really does store without a fold function must stay
/// unfolded — otherwise "give every entry a function" would pass this file.
#[test]
fn the_two_entries_without_a_fold_function_stay_unfolded() {
    for expr in ["Math.random()", "BigInt(1)"] {
        let out = folded(expr);
        assert!(
            out.contains("$.escape(c)"),
            "{expr} was folded, but upstream has no fn for it:\n{out}"
        );
    }
}

/// Entries that already folded, as a control that the shared machinery moved
/// for the three rows above and not for everything.
#[test]
fn the_entries_that_already_folded_still_fold() {
    assert!(folded("Math.max(1, 2)").contains("$$renderer.push(`2`);"));
    assert!(folded("String(\"A\")").contains("$$renderer.push(`A`);"));
    assert!(folded("Number.isInteger(1)").contains("$$renderer.push(`true`);"));
}

/// An argument that is not statically known leaves the call alone: upstream
/// folds only when `values.every(e => e.is_known)`.
#[test]
fn an_unknown_argument_is_not_folded() {
    let src = "<script>\n\tlet { n } = $props();\n</script>\n\n{#if true}{@const c = String.fromCharCode(n)}{c}{/if}\n";
    let out = server(src);
    assert!(out.contains("$.escape(c)"), "{out}");
}

/// Measured on official: these make the compiler die with a raw
/// `RangeError: Invalid code point -1` — no code, no position, no frame — on
/// legal Svelte source. Refusing to compile a valid component is not a byte
/// difference, so the crash is not reproduced; see
/// `upstream_issues/3388-svelte-fromcodepoint-compile-crash.md`. This test pins
/// rsvelte's behaviour so it is not later "fixed" into the crash.
#[test]
fn an_out_of_range_code_point_is_not_folded() {
    for expr in [
        "String.fromCodePoint(-1)",
        "String.fromCodePoint(1114112)",
        "String.fromCodePoint(1.5)",
    ] {
        let out = folded(expr);
        assert!(out.contains("$.escape(c)"), "{expr} folded:\n{out}");
    }
}

/// A lone surrogate is a valid JS string but not valid UTF-8, so it cannot be
/// carried in the folded output; the call is left for the runtime, which
/// computes the same value. Official folds it and its own serialized output
/// substitutes U+FFFD, so there is no byte-identical answer to reach here.
#[test]
fn a_lone_surrogate_is_not_folded() {
    for expr in [
        "String.fromCharCode(0xd800)",
        "String.fromCodePoint(0xd800)",
    ] {
        let out = folded(expr);
        assert!(out.contains("$.escape(c)"), "{expr} folded:\n{out}");
    }
}
