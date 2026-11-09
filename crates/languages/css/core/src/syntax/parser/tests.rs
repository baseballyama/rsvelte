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
