use rsvelte_stylesheet_semantic::matcher;
use rsvelte_stylesheet_syntax::syntax_tree::{Rule, RuleKind};

pub(super) fn mark_external(
    source: &str,
    rules: &[Rule],
    parent_external: bool,
    used: &mut [bool],
) {
    use rsvelte_stylesheet_syntax::syntax_tree::Simple;
    for rule in rules {
        let mut external = parent_external;
        if let RuleKind::Style { selectors, .. } = &rule.kind {
            let external_selector =
                |selector: &rsvelte_stylesheet_syntax::syntax_tree::ComplexSelector| {
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
                // `:global:is(…)` opens a global block, so the selectors in its arguments are used.
                for part in &selector.parts {
                    if part.simple.first().is_global_block(source) {
                        for simple in part.simple.iter().skip(1) {
                            if let Simple::PseudoClass { selectors, .. } = simple {
                                for inner in selectors {
                                    used[inner.id as usize] = true;
                                }
                            }
                        }
                    }
                }
            }
        }
        mark_external(source, &rule.children, external, used);
    }
}

/// Per selector: whether a rule nested in a `:global {…}` block holds it. Upstream's pruning never
/// enters such a block, so its selectors are used and scope no element.
pub(super) fn in_global_blocks(source: &str, rules: &[Rule], count: usize) -> Vec<bool> {
    fn walk(source: &str, rules: &[Rule], inside: bool, out: &mut [bool]) {
        for rule in rules {
            let opens = if let RuleKind::Style { selectors, .. } = &rule.kind {
                for selector in selectors {
                    out[selector.id as usize] = inside;
                }
                selectors.iter().any(|selector| {
                    selector
                        .parts
                        .last()
                        .and_then(|part| part.simple.iter().next_back())
                        .is_some_and(|simple| simple.is_global_block(source))
                })
            } else {
                false
            };
            walk(source, &rule.children, inside || opens, out);
        }
    }
    let mut out = vec![false; count];
    walk(source, rules, false, &mut out);
    out
}
