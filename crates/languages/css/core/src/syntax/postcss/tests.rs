use rsvelte_kernel::source::positions::Span;

use super::{Dialect, InlineNode, SyntaxError, check, inline};

fn whole(source: &str) -> Span {
    Span::new(0, source.len() as u32)
}

fn error(source: &str, dialect: Dialect) -> SyntaxError {
    check(source, whole(source), dialect).expect_err("the sheet does not parse")
}

#[test]
fn a_valid_sheet_parses_in_both_dialects() {
    let source = "a { color: red; } @media (x) { b { c: d } }";
    assert_eq!(check(source, whole(source), Dialect::Css), Ok(()));
    assert_eq!(check(source, whole(source), Dialect::Scss), Ok(()));
}

#[test]
fn errors_name_the_reason_and_a_utf16_column() {
    let source = "a {\n  é class .x/35\n}";
    let found = error(source, Dialect::Css);
    assert_eq!(found.reason, "Unknown word é");
    assert_eq!((found.line, found.column), (2, 3));
    assert_eq!(
        error("a { b: c d: e }", Dialect::Css).reason,
        "Missed semicolon"
    );
    assert_eq!(error("a {", Dialect::Css).reason, "Unclosed block");
    assert_eq!(error("}", Dialect::Css).reason, "Unexpected }");
    assert_eq!(
        error("a { b: \"c }", Dialect::Css).reason,
        "Unclosed string"
    );
    assert_eq!(error("/* a", Dialect::Css).reason, "Unclosed comment");
}

#[test]
fn scss_reads_line_comments_and_interpolation() {
    let source = "// a\n.x-#{$y} { z: 1 }";
    assert_eq!(check(source, whole(source), Dialect::Scss), Ok(()));
    assert!(check(source, whole(source), Dialect::Css).is_err());
    assert_eq!(
        error("a { b: #{c", Dialect::Scss).reason,
        "Unclosed interpolation"
    );
}

#[test]
fn the_content_span_is_where_lines_count_from() {
    let source = "<style>\n}</style>";
    let found = check(source, Span::new(7, 9), Dialect::Css).expect_err("an extra brace");
    assert_eq!((found.line, found.column), (2, 1));
}

#[test]
fn an_inline_style_keeps_declarations_comments_and_holes() {
    let source = "color: red; /* c */ {a}; font-{b}: x !important";
    let holes = [Span::new(20, 23), Span::new(30, 33)];
    let nodes = inline(source, whole(source), &holes).expect("a declaration list");
    let [
        InlineNode::Declaration(color),
        InlineNode::Comment(comment),
        InlineNode::Hole { index: 0, .. },
        InlineNode::Declaration(font),
    ] = nodes.as_slice()
    else {
        panic!("unexpected nodes {nodes:?}");
    };
    assert_eq!(color.property.text(source), "color");
    assert_eq!(color.value.text(source), "red");
    assert_eq!(color.span.text(source), "color: red;");
    assert_eq!(comment.text(source), "/* c */");
    assert!(font.important);
    assert_eq!(font.property_holes, 1);
    assert_eq!(font.value.text(source), "x");
}

#[test]
fn an_inline_style_with_a_rule_is_not_converted() {
    let source = "a { b: c }";
    assert!(inline(source, whole(source), &[]).is_none());
}

#[test]
fn a_missed_semicolon_splits_an_inline_declaration() {
    let source = "a: b c: d";
    let nodes = inline(source, whole(source), &[]).expect("a declaration list");
    let properties: Vec<&str> = nodes
        .iter()
        .map(|node| match node {
            InlineNode::Declaration(d) => d.property.text(source),
            _ => panic!("only declarations"),
        })
        .collect();
    assert_eq!(properties, ["a", "c"]);
}

#[test]
fn a_comment_may_hold_any_character() {
    let source = "/* é */ a { b: c }";
    assert_eq!(check(source, whole(source), Dialect::Css), Ok(()));
    let source = "/* é */ color: red";
    assert!(inline(source, whole(source), &[]).is_some());
}

#[test]
fn every_parenthesis_up_to_a_bad_bracket_close_is_alone() {
    let found = error(":global(:where(.a[b)) {}", Dialect::Css);
    assert_eq!(
        (found.reason.as_str(), found.line, found.column),
        ("Unclosed bracket", 1, 8)
    );
    // postcss-scss's tokenizer predates `lastBadParen`.
    let source = ":global(:where(.a[b)) {}";
    assert_eq!(check(source, whole(source), Dialect::Scss), Ok(()));
}

#[test]
fn a_scss_nested_property_reads_from_its_first_word() {
    let found = error(":_0{", Dialect::Scss);
    assert_eq!(
        (found.reason.as_str(), found.line, found.column),
        ("Unclosed block", 1, 2)
    );
    let source = ":\t:global(form .x) {\n}";
    assert_eq!(check(source, whole(source), Dialect::Scss), Ok(()));
}

#[test]
fn many_missed_semicolons_split_without_recursion() {
    let source = "a: b ".repeat(100_000);
    let nodes = inline(&source, whole(&source), &[]).expect("a declaration list");
    assert_eq!(nodes.len(), 100_000);
}

#[test]
fn many_open_parentheses_stay_linear() {
    let source = format!("a {{ b: {} }}", "(".repeat(200_000));
    assert!(check(&source, whole(&source), Dialect::Css).is_err());
}
