//! `css_unused_selector`: the selectors that no element matched.

use rsvelte_stylesheet_syntax::properties::without_browser_prefix;
use rsvelte_stylesheet_syntax::syntax_tree::{ComplexSelector, Rule, RuleKind, Simple};
use rsvelte_svelte_syntax::syntax_tree::Component;

use super::found::{Found, Stage};
use super::ignore::{extract, preceding_comment};
use super::warning;
use crate::analyze::Analysis;

/// Whether the comment before `<style>` ignores `css_unused_selector`, the one `svelte-ignore`
/// the style sheet reads. Its code warnings come just before the selectors'.
pub(super) fn ignored(component: &Component, source: &str, runes: bool, found: &mut Found) -> bool {
    component.style.as_ref().is_some_and(|style| {
        preceding_comment(component, source, style.span.start_offset).is_some_and(|data| {
            extract(data.start_offset, data.text(source), runes, |w| {
                found.before(Stage::Stylesheet, 0, w);
            })
            .iter()
            .any(|code| code == "css_unused_selector")
        })
    })
}

/// `css_unused_selector` (`css-warn.js`): every selector no element matched, outside
/// `@keyframes` and `:global { … }` blocks.
pub(super) fn unused_selectors(rules: &[Rule], analysis: &Analysis, source: &str, out: &mut Found) {
    for rule in rules {
        match &rule.kind {
            RuleKind::Keyframe { .. } => {}
            RuleKind::At { name, .. } => {
                if without_browser_prefix(name.text(source)) != "keyframes" {
                    unused_selectors(&rule.children, analysis, source, out);
                }
            }
            RuleKind::Style { selectors, .. } => {
                for selector in selectors {
                    unused_selector(selector, None, analysis, source, out);
                }
                let global_block = selectors.iter().any(|s| s.opens_global_block(source));
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
    out: &mut Found,
) {
    let used = analysis
        .stylesheet_used
        .get(selector.id as usize)
        .copied()
        .unwrap_or(true);
    // An unused selector inside `:is()` of an unused one is reported once, at the outer one.
    if !used && outer_used != Some(false) {
        out.push(
            Stage::Stylesheet,
            0,
            warning(
                "css_unused_selector",
                &format!("Unused CSS selector \"{}\"", selector.span.text(source)),
                selector.span,
            ),
        );
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
