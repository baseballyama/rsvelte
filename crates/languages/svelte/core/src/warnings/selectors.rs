//! `css_unused_selector`: the selectors that no element matched.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_stylesheet::syntax_tree::{ComplexSelector, Rule, RuleKind, Simple};
use rsvelte_svelte_semantic::semantic::analyze::Analysis;

use super::warning;

/// `css_unused_selector` (`css-warn.js`): every selector no element matched, outside
/// `@keyframes` and `:global { … }` blocks.
pub(super) fn unused_selectors(
    rules: &[Rule],
    analysis: &Analysis,
    source: &str,
    out: &mut Vec<Diagnostic>,
) {
    for rule in rules {
        match &rule.kind {
            RuleKind::Keyframe { .. } => {}
            RuleKind::At { name, .. } => {
                let name = name.text(source).trim_start_matches('@');
                let unprefixed = ["-webkit-", "-moz-", "-o-", "-ms-"]
                    .iter()
                    .find_map(|p| name.strip_prefix(p))
                    .unwrap_or(name);
                if unprefixed != "keyframes" {
                    unused_selectors(&rule.children, analysis, source, out);
                }
            }
            RuleKind::Style { selectors, .. } => {
                for selector in selectors {
                    unused_selector(selector, None, analysis, source, out);
                }
                let global_block = selectors.iter().any(|selector| {
                    selector
                        .parts
                        .iter()
                        .any(|part| part.simple.iter().any(|s| s.is_global_block(source)))
                });
                if !global_block {
                    unused_selectors(&rule.children, analysis, source, out);
                }
            }
        }
    }
}

pub(super) fn unused_selector(
    selector: &ComplexSelector,
    outer_used: Option<bool>,
    analysis: &Analysis,
    source: &str,
    out: &mut Vec<Diagnostic>,
) {
    let used = analysis
        .stylesheet_used
        .get(selector.id as usize)
        .copied()
        .unwrap_or(true);
    // An unused selector inside `:is()` of an unused one is reported once, at the outer one.
    if !used && outer_used != Some(false) {
        out.push(warning(
            "css_unused_selector",
            &format!("Unused CSS selector \"{}\"", selector.span.text(source)),
            selector.span,
        ));
    }
    for part in &selector.parts {
        for simple in &part.simple {
            if let Simple::PseudoClass { selectors, .. } = simple
                && simple.is_pseudo(source, &["is", "where"])
            {
                for inner in selectors {
                    unused_selector(inner, Some(used), analysis, source, out);
                }
            }
        }
    }
}
