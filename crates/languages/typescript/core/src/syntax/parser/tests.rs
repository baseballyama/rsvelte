use rsvelte_kernel::source::positions::Span;

use super::parse_program;
use crate::syntax_tree::SyntaxTree;

fn parses(source_text: &str) -> Result<(), String> {
    let mut syntax_tree = SyntaxTree::new();
    parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        false,
    )
    .map(drop)
    .map_err(|e| e.message)
}

#[test]
fn a_shorthand_initializer_is_valid_only_in_a_pattern() {
    for valid in [
        "({ a = 1 } = v);",
        "[{ a = 1, b }] = v;",
        "({ a: { b = 2 } } = v);",
        "for ({ a = 1 } of v);",
    ] {
        assert_eq!(parses(valid), Ok(()), "{valid}");
    }
    for invalid in ["({ a = 1 });", "f({ a = 1 });", "({ b: { a = 1 } }).b;"] {
        assert!(parses(invalid).is_err(), "{invalid}");
    }
}
