//! `svelte/require-optimized-style-attribute` — require style attributes that
//! can be optimized into `style:property` directives by the compiler.
//!
//! Port of `eslint-plugin-svelte/src/rules/require-optimized-style-attribute.ts`
//! on the shared `parseStyleAttributeValue` model:
//! - shorthand `{style}` → `shorthand` at the attribute;
//! - unparseable value (at-rule / interpolation in a comment) → `complex` at
//!   the whole attribute;
//! - declaration with unknown interpolations → `complex` at the declaration;
//! - declaration with a prop interpolation → `interpolationKey` at the prop;
//! - top-level comment → `comment` at the comment;
//! - top-level interpolation (inline node) → `complex` at the mustache.

use rsvelte_core::ast::template::{Attribute, AttributeValue};

use super::shared::style_decls::{StyleNode, parse_style_attr};
use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/require-optimized-style-attribute",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Require style attributes that can be optimized",
    options_schema: None,
};

#[derive(Default)]
pub struct RequireOptimizedStyleAttribute;

impl Rule for RequireOptimizedStyleAttribute {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        let Attribute::Attribute(node) = attr else {
            return;
        };
        if node.name.as_str() != "style" {
            return;
        }

        // Shorthand `{style}` — upstream's `SvelteShorthandAttribute` visitor.
        if ctx.slice(node.start, node.start + 1) == "{" {
            ctx.report(
                node.start,
                node.end,
                "It cannot be optimized because style attribute is specified using shorthand.",
            );
            return;
        }

        // Upstream returns before parsing when the value is empty.
        match &node.value {
            AttributeValue::True(_) => return,
            AttributeValue::Sequence(parts) if parts.is_empty() => return,
            _ => {}
        }

        let Some(root) = parse_style_attr(&node.value, ctx.source()) else {
            ctx.report(
                node.start,
                node.end,
                "It cannot be optimized because too complex.",
            );
            return;
        };

        for child in &root.nodes {
            match child {
                StyleNode::Decl(decl) => {
                    if !decl.unknown_interpolations.is_empty() {
                        ctx.report(
                            decl.start,
                            decl.end,
                            "It cannot be optimized because too complex.",
                        );
                    } else if !decl.prop_interpolations.is_empty() {
                        ctx.report(
                            decl.prop_start,
                            decl.prop_end,
                            "It cannot be optimized because property of style declaration contain interpolation.",
                        );
                    }
                }
                StyleNode::Comment { start, end } => {
                    ctx.report(
                        *start,
                        *end,
                        "It cannot be optimized because contains comments.",
                    );
                }
                StyleNode::Inline(inline) => {
                    ctx.report(
                        inline.start,
                        inline.end,
                        "It cannot be optimized because too complex.",
                    );
                }
            }
        }
    }
}
