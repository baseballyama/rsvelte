use rsvelte_stylesheet::matcher;
use rsvelte_stylesheet::syntax_tree::{Rule, RuleKind};

pub(super) fn mark_external(
    source: &str,
    rules: &[Rule],
    parent_external: bool,
    used: &mut [bool],
) {
    use rsvelte_stylesheet::syntax_tree::Simple;
    for rule in rules {
        let mut external = parent_external;
        if let RuleKind::Style { selectors, .. } = &rule.kind {
            let external_selector =
                |selector: &rsvelte_stylesheet::syntax_tree::ComplexSelector| {
                    selector.parts.iter().all(|part| {
                        matcher::is_global(source, part)
                            || parent_external
                                && part.simple.iter().any(|s| matches!(s, Simple::Nesting(_)))
                                && part.simple.iter().all(|s| match s {
                                    Simple::Nesting(_)
                                    | Simple::Attribute { .. }
                                    | Simple::PseudoElement { .. } => true,
                                    Simple::PseudoClass { .. } => {
                                        !s.is_pseudo(source, &["is", "where", "has", "not"])
                                    }
                                    _ => false,
                                })
                    })
                };
            external = selectors.iter().all(external_selector);
            for selector in selectors {
                if external_selector(selector) {
                    used[selector.id as usize] = true;
                }
            }
        }
        mark_external(source, &rule.children, external, used);
    }
}
