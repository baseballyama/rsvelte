use super::*;
use crate::syntax_tree::RuleKind;

fn prelude(stylesheet: &str) -> &str {
    let sheet = parse(stylesheet, Span::new(0, stylesheet.len() as u32)).expect("parses");
    match sheet.rules[0].kind {
        RuleKind::At { prelude, .. } => prelude.text(stylesheet),
        RuleKind::Style { .. } | RuleKind::Keyframe { .. } => panic!("not an at-rule"),
    }
}

#[test]
fn an_at_rule_prelude_is_trimmed() {
    assert_eq!(prelude("@media  screen and (x) { }"), "screen and (x)");
}

#[test]
fn a_whitespace_only_prelude_is_empty() {
    assert_eq!(prelude("@font-face { src: local(x); }"), "");
    assert_eq!(prelude("@font-face   \n{ src: local(x); }"), "");
}

#[test]
fn a_pseudo_element_argument_is_a_selector_list() {
    use crate::syntax_tree::Simple;
    let source = "a::slotted(.b, c) { }";
    let sheet = parse(source, Span::new(0, source.len() as u32)).expect("parses");
    let RuleKind::Style { selectors, .. } = &sheet.rules[0].kind else {
        panic!("a style rule");
    };
    let Some(Simple::PseudoElement { selectors, .. }) =
        selectors[0].parts[0].simple.iter().next_back()
    else {
        panic!("a pseudo-element");
    };
    assert_eq!(selectors.len(), 2);
}

fn whole(stylesheet: &str) -> R<StyleSheet> {
    parse(stylesheet, Span::new(0, stylesheet.len() as u32))
}

// Svelte 5 reports each one from the declaration's start to the end of its colon.
#[test]
fn a_declaration_without_a_value_is_empty() {
    for (source, end) in [
        (".a { color: }", 11),
        (".a { color :  ;}", 12),
        (concat!(".a {", " : }"), 6),
    ] {
        let error = whole(source).expect_err(source);
        assert_eq!(error.code, "css_empty_declaration", "{source}");
        assert_eq!(error.span, Span::new(5, end), "{source}");
    }
}

#[test]
fn a_declaration_svelte_reads_without_a_property_a_colon_or_a_value_parses() {
    for source in [
        ".a { : red }",
        ".a { color red }",
        ".a { --x: }",
        ".a { --x: ; }",
    ] {
        whole(source).expect(source);
    }
}

#[test]
fn the_last_of_the_combinators_in_a_row_is_the_selector_s() {
    use crate::syntax_tree::Combinator;
    for (source, combinator) in [
        ("a >> b {}", Combinator::Child),
        ("a > + b {}", Combinator::NextSibling),
        ("a || b {}", Combinator::Column),
        ("a ||b {}", Combinator::Column),
    ] {
        let sheet = whole(source).expect(source);
        let RuleKind::Style { selectors, .. } = &sheet.rules[0].kind else {
            panic!("a style rule");
        };
        let parts = &selectors[0].parts;
        assert_eq!(parts.len(), 2, "{source}");
        assert_eq!(parts[1].combinator, Some(combinator), "{source}");
    }
}

#[test]
fn an_html_comment_is_skipped_whole() {
    let sheet = whole("<!-- .b { } --> .a { }").expect("parses");
    assert_eq!(sheet.rules.len(), 1);
    let error = whole(".a { } <!-- .b { }").expect_err("the comment is open");
    assert_eq!(error.code, "expected_token");
    assert_eq!(error.span, Span::new(18, 18));
}

// Svelte 5 reads these declarations, a bracket closing nothing it reads.
#[test]
fn a_value_ends_at_the_first_terminator_outside_a_string_and_a_url() {
    for (source, values) in [
        (".a { x: (; y: z }", &["(", "z"][..]),
        (".a { b: [; }", &["["]),
        (".a { content: \";\" }", &["\";\""]),
        (".a { background: url(a;b) }", &["url(a;b)"]),
        (".a { b: myurl(;) }", &["myurl(;)"]),
    ] {
        let sheet = whole(source).expect(source);
        let found: Vec<&str> = sheet.rules[0]
            .declarations
            .iter()
            .map(|d| d.value.text(source))
            .collect();
        assert_eq!(found, values, "{source}");
    }
    let error = whole(".a { x: f(;) }").expect_err("`)` is a declaration without a value");
    assert_eq!(error.code, "css_empty_declaration");
    assert_eq!(error.span, Span::new(11, 13));
}
