//! `svelte/no-useless-children-snippet` — disallow an explicit `children`
//! snippet where it's not needed. A `{#snippet children()}` (no params) that is
//! a direct child of an element/component is equivalent to just placing the
//! content as default children, so the explicit snippet is redundant.
//! Port of the eslint-plugin-svelte rule (Svelte 5 only; the version gate is
//! applied by the oracle, the rule itself always fires).
//!
//! Upstream fires on a `SvelteSnippetBlock` whose parent is an element/component
//! (`SvelteElement` in the upstream parser), whose id name is `"children"` and
//! which has zero params. In rsvelte a snippet is a direct child node of the
//! parent fragment and there is no parent pointer, so we detect from the parent
//! side: both `check_component` and `check_element` scan their fragment's nodes.

use rsvelte_core::ast::template::{Component, RegularElement, SnippetBlock, TemplateNode};

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-useless-children-snippet",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow explicit children snippet where it's not needed",
    options_schema: None,
};

/// Whether `block` is a redundant explicit `children` snippet: id name is
/// `"children"` and it takes zero parameters.
fn is_useless_children_snippet(block: &SnippetBlock) -> bool {
    block.expression.identifier_name() == Some("children") && block.parameters.is_empty()
}

#[derive(Default)]
pub struct NoUselessChildrenSnippet;

impl NoUselessChildrenSnippet {
    fn check_nodes(&self, ctx: &mut LintContext, nodes: &[TemplateNode]) {
        for node in nodes {
            if let TemplateNode::SnippetBlock(block) = node
                && is_useless_children_snippet(block)
            {
                // Report at the `{` of `{#snippet}` (`block.start`); span to the
                // end of the snippet id so the diagnostic column lands on the
                // opening brace, matching upstream.
                let end = block.expression.end().unwrap_or(block.start);
                ctx.report(
                    block.start,
                    end.max(block.start),
                    "Found an unnecessary children snippet.",
                );
            }
        }
    }
}

impl Rule for NoUselessChildrenSnippet {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        self.check_nodes(ctx, &el.fragment.nodes);
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        self.check_nodes(ctx, &c.fragment.nodes);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rsvelte_core::ast::js::Expression;

    fn ident_snippet(name: &str, params: usize) -> SnippetBlock {
        // Build a minimal SnippetBlock for the helper test. We only exercise the
        // pure predicate, which inspects `expression` (the snippet id) and
        // `parameters`.
        let expr = Expression::identifier(name, 0, 0, None);
        let parameters = (0..params)
            .map(|_| Expression::identifier("p", 0, 0, None))
            .collect();
        SnippetBlock {
            start: 0,
            end: 0,
            expression: expr,
            type_params: None,
            parameters,
            body: Default::default(),
            metadata: Default::default(),
        }
    }

    #[test]
    fn fires_on_zero_param_children() {
        assert!(is_useless_children_snippet(&ident_snippet("children", 0)));
    }

    #[test]
    fn skips_named_snippet() {
        assert!(!is_useless_children_snippet(&ident_snippet("bar", 0)));
    }

    #[test]
    fn skips_children_with_params() {
        assert!(!is_useless_children_snippet(&ident_snippet("children", 1)));
    }
}
