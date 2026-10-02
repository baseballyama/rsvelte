//! Rewrites a style sheet so that it only applies to its component: `.x` becomes `.x.svelte-h`,
//! and rules nothing uses are commented out.

use rsvelte_kernel::output::emitter::Edits;

use crate::matcher::is_global;
use crate::syntax_tree::{Rule, RuleKind, Simple, StyleSheet};

/// `used[i]` answers for the i-th complex selector in document order (see [`selectors`]).
#[must_use]
pub fn render(source_text: &str, sheet: &StyleSheet, used: &[bool], hash: &str) -> String {
    let mut edits = Edits::default();
    let modifier = format!(".{hash}");
    let mut next = 0usize;
    for rule in &sheet.rules {
        render_rule(source_text, rule, used, &mut next, &modifier, &mut edits);
    }
    debug_assert_eq!(next, used.len(), "one flag per selector");
    edits.apply_in(source_text, sheet.content)
}

/// Every complex selector in document order, the order [`render`] reads its flags in.
#[must_use]
pub fn selectors(sheet: &StyleSheet) -> Vec<&crate::syntax_tree::ComplexSelector> {
    fn walk<'a>(rules: &'a [Rule], out: &mut Vec<&'a crate::syntax_tree::ComplexSelector>) {
        for r in rules {
            if let RuleKind::Style { selectors, .. } = &r.kind {
                out.extend(selectors.iter());
            }
            walk(&r.children, out);
        }
    }
    let mut out = Vec::new();
    walk(&sheet.rules, &mut out);
    out
}

fn render_rule(
    source_text: &str,
    rule: &Rule,
    used: &[bool],
    next: &mut usize,
    modifier: &str,
    edits: &mut Edits,
) {
    match &rule.kind {
        RuleKind::At { .. } => {
            for child in &rule.children {
                render_rule(source_text, child, used, next, modifier, edits);
            }
        }
        RuleKind::Style { selectors, .. } => {
            let flags = &used[*next..*next + selectors.len()];
            *next += selectors.len();
            let comment = if rule.declarations.is_empty() {
                Some("/* (empty) ")
            } else if !flags.iter().any(|&u| u) {
                Some("/* (unused) ")
            } else {
                None
            };
            if let Some(open) = comment {
                edits.insert(rule.span.start_offset, open);
                edits.insert(rule.span.end_offset, "*/");
                return;
            }
            for (sel, _) in selectors.iter().zip(flags).filter(|(_, u)| **u) {
                let mut bumped = false;
                for rel in &sel.parts {
                    if is_global(source_text, rel) {
                        if let Simple::PseudoClass {
                            span,
                            arguments: Some(arguments),
                            ..
                        } = rel.simple[0]
                        {
                            edits.replace(
                                rsvelte_kernel::source::positions::Span::new(
                                    span.start_offset,
                                    arguments.start_offset,
                                ),
                                "",
                            );
                            edits.replace(
                                rsvelte_kernel::source::positions::Span::new(
                                    arguments.end_offset,
                                    span.end_offset,
                                ),
                                "",
                            );
                        }
                        continue;
                    }
                    let m = if bumped {
                        format!(":where({modifier})")
                    } else {
                        modifier.to_owned()
                    };
                    bumped = true;
                    let mut i = rel.simple.len();
                    while i > 0 {
                        i -= 1;
                        match rel.simple[i] {
                            Simple::PseudoClass { span, name, .. }
                            | Simple::PseudoElement { span, name } => {
                                if i == 0 && !matches!(name.text(source_text), "root" | "host") {
                                    edits.insert(span.start_offset, m.clone());
                                }
                            }
                            Simple::Universal(span) => {
                                edits.replace(span, m.clone());
                                break;
                            }
                            _ => {
                                edits.insert(rel.simple[i].span().end_offset, m.clone());
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}
