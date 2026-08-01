//! Regression test for redundant parentheses surviving the dev equality
//! instrumentation in module scripts (baseballyama/rsvelte#2081).
//!
//! `compile_module` rewrites the source as text, so an operand used to be
//! spliced verbatim — under `preserve_parens` that carried the source's
//! parentheses into the helper call (`$.equals(($.strict_equals(a, b)), …)`).
//! Official visits the operand and lets esrap reprint it, so the parentheses
//! are gone. The expectations below are the official compiler's output.

use rsvelte_core::GenerateMode;
use rsvelte_core::compile_module;
use rsvelte_core::compiler::ModuleCompileOptions;

fn compile_mod_client_dev(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("x.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile_module")
    .js
    .code
}

#[track_caller]
fn assert_emits(src: &str, expected: &str) {
    let out = compile_mod_client_dev(src);
    assert!(
        out.contains(expected),
        "expected `{expected}` for `{src}`. Got:\n{out}"
    );
}

#[test]
fn nested_equality_operands_lose_their_parens() {
    assert_emits(
        "export const x = (a === b) != (c == d);",
        "$.equals($.strict_equals(a, b), $.equals(c, d), false)",
    );
    assert_emits(
        "export const y = (a === b) === (c === d);",
        "$.strict_equals($.strict_equals(a, b), $.strict_equals(c, d))",
    );
}

#[test]
fn redundant_operand_parens_are_dropped() {
    assert_emits("export const a1 = ((a)) === b;", "$.strict_equals(a, b)");
    assert_emits(
        "export const a2 = (a + b) === (c * d);",
        "$.strict_equals(a + b, c * d)",
    );
    assert_emits(
        "export const a3 = (a = b) === c;",
        "$.strict_equals(a = b, c)",
    );
    assert_emits(
        "export const a4 = (a ? b : c) === d;",
        "$.strict_equals(a ? b : c, d)",
    );
    assert_emits(
        "export const a5 = ({ a: 1 }) === z;",
        "$.strict_equals({ a: 1 }, z)",
    );
}

#[test]
fn sequence_operands_keep_the_parens_they_need() {
    // A bare comma would split the helper's argument list, so this is the one
    // operand shape official parenthesises too.
    assert_emits(
        "export const s1 = (a, b) === c;",
        "$.strict_equals((a, b), c)",
    );
    assert_emits(
        "export const s2 = a === ((b, c));",
        "$.strict_equals(a, (b, c))",
    );
}

#[test]
fn state_reads_inside_a_parenthesised_operand_still_lower() {
    let src = "export const fn = () => {\n  let n = $state.raw(0);\n  n = 1;\n  return (n + 1) === 2;\n};";
    assert_emits(src, "$.strict_equals($.get(n) + 1, 2)");
}
