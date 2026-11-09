use rsvelte_kernel::source::positions::Span;

use super::parse_program;
use crate::syntax_tree::{SyntaxTree, TypeScriptKind};

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

#[test]
fn many_shorthand_initializers_are_read_in_linear_time() {
    let properties: Vec<String> = (0..10_000).map(|i| format!("a{i}=1")).collect();
    let source = format!("({{{}}} = v);", properties.join(","));
    let started = std::time::Instant::now();
    assert_eq!(parses(&source), Ok(()));
    // Removing each property from a list of the pending ones takes over ten seconds here.
    assert!(started.elapsed().as_secs() < 3, "{:?}", started.elapsed());
}

#[test]
fn a_class_records_its_type_parameters() {
    let source_text = "class K<T extends { a: 1 }> {}\n(class<U> {});";
    let mut syntax_tree = SyntaxTree::new();
    parse_program(
        &mut syntax_tree,
        source_text,
        Span::new(0, source_text.len() as u32),
        true,
    )
    .expect("parses");
    let recorded: Vec<(TypeScriptKind, &str)> = syntax_tree
        .typescript
        .iter()
        .map(|t| (t.kind, t.span.text(source_text)))
        .collect();
    assert_eq!(
        recorded,
        [
            (TypeScriptKind::TypeParameters, "<T extends { a: 1 }>"),
            (TypeScriptKind::TypeParameters, "<U>"),
        ]
    );
}
