//! `oxc_formatter` drops parentheses an ES2022 brand check needs, which changes
//! the program (`upstream_issues/3451-oxc-private-in-parens.md`). The formatter
//! keeps the input rather than rewriting what the code means.
//!
//! This is a DELIBERATE divergence from the oxfmt oracle: the oracle is the same
//! engine, so it reproduces the defect and a parity comparison scores a match by
//! construction. The assertions below are about the program, not about parity.

use rsvelte_formatter::{
    FormatOptions, IndentStyle, IndentWidth, JsFormatOptions, LineWidth, format,
};

fn fmt(src: &str) -> String {
    let js = JsFormatOptions {
        indent_style: IndentStyle::Space,
        indent_width: IndentWidth::try_from(2u8).unwrap(),
        line_width: LineWidth::try_from(80u16).unwrap(),
        ..JsFormatOptions::default()
    };
    let options = FormatOptions {
        js,
        typescript: false,
        ..FormatOptions::new()
    };
    format(src, &options).expect("format ok")
}

fn script(body: &str) -> String {
    format!(
        "<script>\n  class Box {{\n    static #value;\n    static holds(o, p) {{\n      return {body};\n    }}\n  }}\n</script>\n"
    )
}

/// The reported shape: `in` binds tighter than `||`, so dropping the
/// parentheses returns `true`/`{}` where the source returns `true`/`false`.
#[test]
fn a_logical_right_operand_keeps_its_parentheses() {
    let out = fmt(&script("#value in (o || {})"));
    assert!(out.contains("#value in (o || {})"), "{out}");
}

#[test]
fn a_coalesce_right_operand_keeps_its_parentheses() {
    let out = fmt(&script("#value in (o ?? {})"));
    assert!(out.contains("#value in (o ?? {})"), "{out}");
}

#[test]
fn a_conditional_right_operand_keeps_its_parentheses() {
    let out = fmt(&script("#value in (o ? o : p)"));
    assert!(out.contains("#value in (o ? o : p)"), "{out}");
}

/// The other direction: the brand check is itself the child of a tighter
/// operator, and losing its own parentheses re-associates the whole expression.
#[test]
fn a_brand_check_under_a_tighter_operator_keeps_its_parentheses() {
    let out = fmt(&script("(#value in o) * 2"));
    assert!(out.contains("(#value in o) * 2"), "{out}");
}

#[test]
fn a_brand_check_before_a_member_access_keeps_its_parentheses() {
    let out = fmt(&script("(#value in o).toString()"));
    assert!(out.contains("(#value in o).toString()"), "{out}");
}

/// The discriminating control: same operator, same right operand, ordinary left
/// operand. oxc parenthesises this correctly, so the body is still FORMATTED —
/// the guard must not disable formatting for every class.
#[test]
fn an_ordinary_in_is_untouched_and_still_formatted() {
    let out = fmt(
        "<script>\n  class Box {\n        static holds(o) {\n            return \"k\" in (o || {});\n        }\n  }\n</script>\n",
    );
    assert!(out.contains("\"k\" in (o || {})"), "{out}");
    assert!(
        out.contains("    static holds(o) {"),
        "the body must still be re-indented:\n{out}"
    );
}

/// Negative control: a brand check whose parentheses oxc does NOT drop leaves
/// the body formatted as usual, so the guard is keyed on the defect and not on
/// the mere presence of a `#x in o`.
#[test]
fn a_brand_check_oxc_prints_correctly_is_still_formatted() {
    let out = fmt(
        "<script>\n  class Box {\n    static #value;\n        static holds(o) {\n            return #value in o;\n        }\n  }\n</script>\n",
    );
    assert!(out.contains("#value in o"), "{out}");
    assert!(
        out.contains("    static holds(o) {"),
        "the body must still be re-indented:\n{out}"
    );
}
