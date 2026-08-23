//! Regression coverage for #3600 — a sequence with exactly one member must obey
//! the same width rule as every other arity.
//!
//! esrap has one `sequence`, whose accumulator starts at `-1` and adds
//! `measure + 1` per item, so at one item `length == measure` and
//! `multiline ||= length > 60` still decides. rsvelte splits `sequence_indexed`
//! into arity branches for speed, and the one-item branch measured the child but
//! never compared it — so an over-width single-property object, single-element
//! array or single-parameter list stayed on one line forever.
//!
//! The controls are the point of the file: call arguments have no width rule on
//! either side (esrap's `CallExpression` does not go through `sequence`), so a
//! blanket "break anything over 60" would break them.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::print;

fn p(source: &str) -> String {
    let alloc = Allocator::default();
    let st = SourceType::default().with_module(true);
    let ret = Parser::new(&alloc, source, st).parse();
    assert!(ret.diagnostics.is_empty(), "parse: {:?}", ret.diagnostics);
    print(&ret.program, source)
}

fn x(n: usize) -> String {
    "x".repeat(n)
}

#[test]
fn a_single_over_width_property_breaks() {
    let out = p(&format!("const o = {{ k: \"{}\" }};", x(80)));
    assert!(out.contains("{\n\tk:"), "stayed on one line:\n{out}");
}

#[test]
fn a_single_over_width_array_element_breaks() {
    let out = p(&format!("const a = [\"{}\"];", x(80)));
    assert!(out.contains("[\n\t\""), "stayed on one line:\n{out}");
}

#[test]
fn a_single_over_width_parameter_breaks() {
    let out = p(&format!(
        "function g({} = \"{}\") {{}}",
        "a".repeat(68),
        x(80)
    ));
    assert!(out.contains("(\n\t"), "stayed on one line:\n{out}");
}

#[test]
fn a_single_short_member_stays_on_one_line() {
    assert_eq!(p("const o = { k: 1 };"), "const o = { k: 1 };");
    assert_eq!(p("const a = [1];"), "const a = [1];");
}

#[test]
fn eight_short_properties_stay_on_one_line() {
    // The width control: 8 properties measure under 60, 9 do not.
    let src = "const o = { p0: 0, p1: 1, p2: 2, p3: 3, p4: 4, p5: 5, p6: 6, p7: 7 };";
    assert_eq!(p(src), src);
}

#[test]
fn call_arguments_have_no_width_rule() {
    // esrap prints a call's arguments itself rather than through `sequence`, so
    // an over-width argument list stays flat however long it gets. A fix that
    // reached this path would diverge from official in the other direction.
    let one = format!("f(\"{}\");", x(80));
    assert_eq!(p(&one), one);
    let many = format!(
        "const v = Math.max({});",
        (0..40)
            .map(|i| i.to_string())
            .collect::<Vec<_>>()
            .join(", ")
    );
    assert_eq!(p(&many), many);
}
