//! Rewrites a style sheet so that it only applies to its component: `.x` becomes `.x.svelte-h`,
//! and rules nothing uses are commented out.

use rsv_kernel::emit::Edits;

use crate::ast::{Rule, RuleKind, Simple, StyleSheet};
use crate::matcher::is_global;

/// `used[i]` answers for the i-th complex selector in document order (see [`selectors`]).
#[must_use]
pub fn render(src: &str, sheet: &StyleSheet, used: &[bool], hash: &str) -> String {
    let mut edits = Edits::default();
    let modifier = format!(".{hash}");
    let mut next = 0usize;
    for rule in &sheet.rules {
        render_rule(src, rule, used, &mut next, &modifier, &mut edits);
    }
    debug_assert_eq!(next, used.len(), "one flag per selector");
    edits.apply_in(src, sheet.content)
}

/// Every complex selector in document order, the order [`render`] reads its flags in.
#[must_use]
pub fn selectors(sheet: &StyleSheet) -> Vec<&crate::ast::ComplexSelector> {
    fn walk<'a>(rules: &'a [Rule], out: &mut Vec<&'a crate::ast::ComplexSelector>) {
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
    src: &str,
    rule: &Rule,
    used: &[bool],
    next: &mut usize,
    modifier: &str,
    edits: &mut Edits,
) {
    match &rule.kind {
        RuleKind::At { .. } => {
            for child in &rule.children {
                render_rule(src, child, used, next, modifier, edits);
            }
        }
        RuleKind::Style { selectors, .. } => {
            let flags = &used[*next..*next + selectors.len()];
            *next += selectors.len();
            let comment = if rule.decls.is_empty() {
                Some("/* (empty) ")
            } else if !flags.iter().any(|&u| u) {
                Some("/* (unused) ")
            } else {
                None
            };
            if let Some(open) = comment {
                edits.insert(rule.span.lo, open);
                edits.insert(rule.span.hi, "*/");
                return;
            }
            for (sel, _) in selectors.iter().zip(flags).filter(|(_, u)| **u) {
                let mut bumped = false;
                for rel in &sel.parts {
                    if is_global(src, rel) {
                        if let Simple::PseudoClass {
                            span,
                            args: Some(args),
                            ..
                        } = rel.simple[0]
                        {
                            edits.replace(rsv_kernel::source::Span::new(span.lo, args.lo), "");
                            edits.replace(rsv_kernel::source::Span::new(args.hi, span.hi), "");
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
                                if i == 0 && !matches!(name.text(src), "root" | "host") {
                                    edits.insert(span.lo, m.clone());
                                }
                            }
                            Simple::Universal(span) => {
                                edits.replace(span, m.clone());
                                break;
                            }
                            _ => {
                                edits.insert(rel.simple[i].span().hi, m.clone());
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}
