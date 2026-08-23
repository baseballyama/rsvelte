//! The constant fold knew a bigint's value but no operation on one (issue
//! #3539). `to_number` returns `None` for a bigint — correct for JS `ToNumber`,
//! which throws on one — and every arithmetic and relational arm was gated on
//! it, so `1n + 1n` fell through to "unknown" and the expression stayed
//! reactive. Arithmetic uses `ToNumeric`, which keeps a bigint a bigint.
//!
//! Every expectation below is the official compiler's output (5.56.9) for the
//! same source, read off rather than reasoned about — including the rows where
//! upstream folds a mixed-type *comparison* (`2n == 2` is `true`, `2n === 2` is
//! `false`) and the rows where mixing throws and nothing may fold.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_source(src: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("must compile")
    .js
    .code
}

fn server_text(expression: &str) -> String {
    let code = compile_source(
        &format!("<script>\n</script>\n<p>{{{expression}}}</p>\n"),
        GenerateMode::Server,
        false,
    );
    let start = code.find("$$renderer.push(`").expect("a push call") + "$$renderer.push(`".len();
    let rest = &code[start..];
    let end = rest.find("`);").expect("the end of the push call");
    rest[..end].to_string()
}

fn client_is_reactive(expression: &str) -> bool {
    compile_source(
        &format!("<script>\n</script>\n<p>{{{expression}}}</p>\n"),
        GenerateMode::Client,
        false,
    )
    .contains("template_effect")
}

/// `(source, official's rendered text)`.
const FOLDS: &[(&str, &str)] = &[
    // bigint (x) bigint arithmetic — the population #3539 reports
    ("7n + 2n", "<p>9</p>"),
    ("7n - 2n", "<p>5</p>"),
    ("7n * 2n", "<p>14</p>"),
    ("7n / 2n", "<p>3</p>"),
    ("7n % 2n", "<p>1</p>"),
    ("7n ** 2n", "<p>49</p>"),
    ("7n & 2n", "<p>2</p>"),
    ("7n | 2n", "<p>7</p>"),
    ("7n ^ 2n", "<p>5</p>"),
    ("7n << 2n", "<p>28</p>"),
    ("7n >> 2n", "<p>1</p>"),
    // a negative operand: bigint `/` truncates toward zero, `%` follows the
    // dividend, `>>` is arithmetic, and the bitwise ops are two's complement
    ("-8n / 3n", "<p>-2</p>"),
    ("-8n % 3n", "<p>-2</p>"),
    ("-5n >> 1n", "<p>-3</p>"),
    ("-1n & 3n", "<p>3</p>"),
    ("-1n | 3n", "<p>-1</p>"),
    ("-1n ^ 3n", "<p>-4</p>"),
    // a negative shift count shifts the other way
    ("1n << -1n", "<p>0</p>"),
    ("8n >> -1n", "<p>16</p>"),
    ("0n ** 0n", "<p>1</p>"),
    // past f64's exact-integer range, still inside i128
    ("2n ** 64n", "<p>18446744073709551616</p>"),
    ("9007199254740993n + 1n", "<p>9007199254740994</p>"),
    // comparisons between two bigints
    ("7n < 2n", "<p>false</p>"),
    ("7n > 2n", "<p>true</p>"),
    ("7n <= 7n", "<p>true</p>"),
    ("7n >= 8n", "<p>false</p>"),
    // mixed-type comparison is legal where mixed-type arithmetic is not, and
    // `==` and `===` disagree across the boundary
    ("2n == 2", "<p>true</p>"),
    ("2n === 2", "<p>false</p>"),
    ("2n != 2", "<p>false</p>"),
    ("2n !== 2", "<p>true</p>"),
    ("2n == '2'", "<p>true</p>"),
    ("2n == ' 2 '", "<p>true</p>"),
    ("2n == 'x'", "<p>false</p>"),
    ("2n < '3'", "<p>true</p>"),
    ("2n < 'x'", "<p>false</p>"),
    ("1n == true", "<p>true</p>"),
    ("2n == true", "<p>false</p>"),
    ("0n == false", "<p>true</p>"),
    ("2n == null", "<p>false</p>"),
    ("2n == undefined", "<p>false</p>"),
    ("2n < null", "<p>false</p>"),
    ("2n > null", "<p>true</p>"),
    ("2n < undefined", "<p>false</p>"),
    // the double is not truncated and the bigint is not rounded
    ("2n < 2.5", "<p>true</p>"),
    ("2n > 2.5", "<p>false</p>"),
    ("2n <= 2", "<p>true</p>"),
    ("2n >= 2", "<p>true</p>"),
    // unary
    ("~1n", "<p>-2</p>"),
    ("~0n", "<p>-1</p>"),
    ("~-1n", "<p>0</p>"),
    ("-1n", "<p>-1</p>"),
    ("!0n", "<p>true</p>"),
    ("!1n", "<p>false</p>"),
    ("typeof 1n", "<p>bigint</p>"),
    ("void 1n", "<p></p>"),
    // `+` with a string is concatenation, so it never throws
    ("2n + 'x'", "<p>2x</p>"),
    ("'x' + 2n", "<p>x2</p>"),
    ("`v=${1n + 2n}`", "<p>v=3</p>"),
    // logical and ternary hosts
    ("0n || 2n", "<p>2</p>"),
    ("1n && 2n", "<p>2</p>"),
    ("0n ?? 2n", "<p>0</p>"),
    ("1n ? 3n + 1n : 2n", "<p>4</p>"),
];

/// Controls: a fix for the bigint arms must not move any of these.
const CONTROLS: &[(&str, &str)] = &[
    ("1 + 1", "<p>2</p>"),
    ("'a' + 'b'", "<p>ab</p>"),
    ("typeof 1", "<p>number</p>"),
    ("typeof '0'", "<p>string</p>"),
    ("'1' + 1", "<p>11</p>"),
    // a bigint that is only read, never operated on — correct before the fix
    ("1n", "<p>1</p>"),
    ("`v=${1}`", "<p>v=1</p>"),
    ("Math.max(1, 2)", "<p>2</p>"),
    ("0.1 + 0.2", "<p>0.30000000000000004</p>"),
    ("2 ** 53", "<p>9007199254740992</p>"),
    ("1 < 2", "<p>true</p>"),
    ("'10' < '9'", "<p>true</p>"),
    ("null == undefined", "<p>true</p>"),
    ("0 == '0'", "<p>true</p>"),
    ("0 === '0'", "<p>false</p>"),
];

/// Mixing a bigint with any other type in an arithmetic operator is a runtime
/// `TypeError`, and `1n / 0n`, `2n ** -1n`, `>>>` and unary `+` on a bigint are
/// runtime errors too. Nothing here may fold — the value does not exist.
/// (The official compiler evaluates these eagerly and so aborts the whole
/// compile with an unhandled `TypeError`; see upstream_issues/.)
const NEVER_FOLDS: &[&str] = &[
    "2n + 1",
    "2n - 1",
    "2n * 1",
    "2n / 1",
    "2n % 1",
    "2n ** 1",
    "2n & 1",
    "2n | 1",
    "2n ^ 1",
    "2n << 1",
    "2n >> 1",
    "2n - 'x'",
    "2n * true",
    "2n / null",
    "2n % undefined",
    "1 + 2n",
    "'1' - 2n",
    "1n >>> 1n",
    "2n >>> 1n",
    "1n / 0n",
    "1n % 0n",
    "2n ** -1n",
    "+1n",
    "Math.max(1n, 2n)",
    "Math.abs(-1n)",
    "Math.floor(1n)",
];

#[test]
fn an_operation_on_a_bigint_folds_to_the_value_official_computes() {
    for (expression, expected) in FOLDS {
        assert_eq!(
            &server_text(expression),
            expected,
            "`{expression}` must fold to official's value"
        );
        assert!(
            !client_is_reactive(expression),
            "`{expression}` is constant, so the client must not keep it reactive"
        );
    }
}

#[test]
fn the_non_bigint_folds_are_unchanged() {
    for (expression, expected) in CONTROLS {
        assert_eq!(&server_text(expression), expected, "control `{expression}`");
        assert!(
            !client_is_reactive(expression),
            "control `{expression}` must stay folded"
        );
    }
}

#[test]
fn an_operation_that_throws_at_runtime_never_folds() {
    for expression in NEVER_FOLDS {
        let text = server_text(expression);
        assert!(
            text.contains("$.escape("),
            "`{expression}` has no value — it throws — so it must stay reactive, got `{text}`"
        );
    }
}

/// A bigint outside `i128` is declined rather than folded wrong: the port holds
/// a bigint in an `i128`, so an exact result it cannot represent stays
/// reactive. Official folds these (arbitrary precision); the divergence is a
/// missed fold, never a wrong value.
#[test]
fn a_result_outside_i128_stays_reactive() {
    for expression in [
        "2n ** 200n",
        "170141183460469231731687303715884105727n + 1n",
        "1n << 200n",
    ] {
        assert!(
            server_text(expression).contains("$.escape("),
            "`{expression}` overflows i128, so it must stay reactive rather than fold wrong"
        );
    }
}

/// `Number()` is an explicit conversion, so it accepts a bigint where an
/// implicit `ToNumber` would throw — and it rounds, which is the shape a fold
/// that went through a double would have silently produced everywhere.
#[test]
fn an_explicit_conversion_of_a_bigint_folds() {
    for (expression, expected) in [
        ("Number(1n)", "<p>1</p>"),
        ("Number(-3n)", "<p>-3</p>"),
        ("Number(9007199254740993n)", "<p>9007199254740992</p>"),
        ("String(1n)", "<p>1</p>"),
        ("Number.isInteger(1n)", "<p>false</p>"),
    ] {
        assert_eq!(
            server_text(expression),
            expected,
            "`{expression}` must fold to official's value"
        );
    }
}

/// Dev-mode client lowers an equality to `$.strict_equals` / `$.equals` before
/// the fold runs, so an equality chunk stays a call there on both compilers —
/// while the arithmetic still folds. Pinned so the bigint arms are not read as
/// a licence to fold a dev equality.
#[test]
fn dev_mode_folds_the_arithmetic_and_not_the_equality() {
    let arithmetic = compile_source(
        "<script>\n</script>\n<p>{7n + 2n}</p>\n",
        GenerateMode::Client,
        true,
    );
    // The folded literal, not the absence of a `template_effect`: the
    // `textContent` fast path is taken either way, so only the value
    // discriminates a fold from a verbatim copy of the expression.
    assert!(
        arithmetic.contains("textContent = '9'"),
        "dev must still fold bigint arithmetic, got:\n{arithmetic}"
    );
    let equality = compile_source(
        "<script>\n</script>\n<p>{2n == 2}</p>\n",
        GenerateMode::Client,
        true,
    );
    assert!(
        equality.contains("$.equals") || equality.contains("template_effect"),
        "dev lowers an equality to a call before the fold sees it"
    );
}
