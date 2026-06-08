//! `svelte/no-object-in-text-mustaches` — flag an object/array/function/class
//! expression used directly in a text-position mustache (`{{ a }}`, `{[a]}`,
//! `{() => a}`, `{class A {}}`), which stringifies to `[object Object]` etc.
//! Port of the eslint-plugin-svelte rule.
//!
//! Fires for mustaches in **text** position (`check_expression_tag`) and for
//! mustaches that are **one segment among several** in an attribute value
//! (`class="{[a]} x"`). It does NOT fire for a single-value attribute mustache
//! (`<Comp prop={{ a }} />`), which is a prop binding — matching the plugin's
//! `parent.type === 'SvelteAttribute' && parent.value.length === 1` exemption.

use rsvelte_core::ast::template::{Attribute, AttributeValue, AttributeValuePart, ExpressionTag};

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-object-in-text-mustaches",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow objects in text mustache interpolation",
    options_schema: None,
};

/// The "phrase" the message uses for a non-stringifiable expression, or `None`.
fn phrase(tag: &ExpressionTag) -> Option<&'static str> {
    match tag.expression.node_type() {
        Some("ObjectExpression") => Some("object"),
        Some("ArrayExpression") => Some("array"),
        Some("ArrowFunctionExpression") | Some("FunctionExpression") => Some("function"),
        Some("ClassExpression") => Some("class"),
        _ => None,
    }
}

#[derive(Default)]
pub struct NoObjectInTextMustaches;

impl NoObjectInTextMustaches {
    fn check_tag(&self, ctx: &mut LintContext, tag: &ExpressionTag) {
        if let Some(p) = phrase(tag) {
            ctx.report(
                tag.start,
                tag.end,
                format!("Unexpected {p} in text mustache interpolation."),
            );
        }
    }
}

impl Rule for NoObjectInTextMustaches {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_expression_tag(&self, ctx: &mut LintContext, tag: &ExpressionTag) {
        self.check_tag(ctx, tag);
    }

    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        // Only normal attributes with a *multi-segment* value (text + mustache,
        // or several mustaches) are in "text context". A lone `attr={expr}` or a
        // single-mustache sequence is a prop binding and is exempt.
        if let Attribute::Attribute(node) = attr
            && let AttributeValue::Sequence(parts) = &node.value
            && parts.len() > 1
        {
            for part in parts {
                if let AttributeValuePart::ExpressionTag(tag) = part {
                    self.check_tag(ctx, tag);
                }
            }
        }
    }
}
