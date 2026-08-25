//! Regression coverage for the measurement residue reported in #3640 and #3715.
//!
//! Both cases predate the scoped `space_bytes` accounting now used by
//! `Context::measure`: an opening pad in a nested literal used to disappear
//! from every enclosing measure, and selecting the comment-aware printer used
//! to leave a seven-item sequence one column short. These thresholds are not
//! observable through the formatter-normalized corpus comparison, so keep the
//! raw layout decisions here.

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_esrap::print;

fn p(source: &str) -> String {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, source, SourceType::default().with_module(true)).parse();
    assert!(
        parsed.diagnostics.is_empty(),
        "parse error for {source:?}: {:?}",
        parsed.diagnostics
    );
    print(&parsed.program, source)
}

#[test]
fn nested_opening_pads_count_towards_the_enclosing_width() {
    let source =
        "export const o = { c: { d: { e: { f: () => ({ g: { h: [{ i: \"leaf\" }] } }) } } } };";

    assert_eq!(
        p(source),
        "export const o = {\n\tc: { d: { e: { f: () => ({ g: { h: [{ i: \"leaf\" }] } }) } } }\n};"
    );
}

#[test]
fn a_program_comment_does_not_shorten_a_sequence_measurement() {
    let source = r#"function f(a, b) { return a + b; }
// any program comment selects the comment-aware layout path
const data = [f(0, 0), f(1, 0), f(2, 0), f(3, 0), f(4, 0), f(5, 0), f(6, 0)];"#;
    let output = p(source);

    assert!(
        output.contains("const data = [\n\tf(0, 0),"),
        "the comment-aware sequence stayed on one line:\n{output}"
    );
}
