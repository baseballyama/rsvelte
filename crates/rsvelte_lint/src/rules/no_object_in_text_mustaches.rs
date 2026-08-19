//! `svelte/no-object-in-text-mustaches`.
//!
//! `svelte/no-object-in-text-mustaches` — flag an object/array/function/class
//! expression used directly in a text-position mustache (`{{ a }}`, `{[a]}`,
//! `{() => a}`, `{class A {}}`), which stringifies to `[object Object]` etc.
//! Port of the eslint-plugin-svelte rule.
//!
//! Fires for mustaches in **text** position (`check_expression_tag`), for
//! `{@html …}` raw tags (upstream's visitor has no `kind` filter), and for
//! mustaches that are **one segment among several** in an attribute value
//! (`class="{[a]} x"`). It does NOT fire for a single-value attribute mustache
//! (`<Comp prop={{ a }} />`), which is a prop binding — matching the plugin's
//! `parent.type === 'SvelteAttribute' && parent.value.length === 1` exemption.

use rsvelte_core::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, ExpressionTag, HtmlTag,
};

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
fn phrase(node_type: Option<&str>) -> Option<&'static str> {
    match node_type {
        Some("ObjectExpression") => Some("object"),
        Some("ArrayExpression") => Some("array"),
        Some("ArrowFunctionExpression" | "FunctionExpression") => Some("function"),
        Some("ClassExpression") => Some("class"),
        _ => None,
    }
}

#[derive(Default)]
pub struct NoObjectInTextMustaches;

impl NoObjectInTextMustaches {
    fn check_tag(ctx: &mut LintContext, tag: &ExpressionTag) {
        Self::report_tag(ctx, tag.start, tag.end, tag.expression.node_type());
    }

    fn report_tag(ctx: &mut LintContext, start: u32, end: u32, node_type: Option<&str>) {
        if let Some(p) = phrase(node_type) {
            ctx.report(
                start,
                end,
                format!("Unexpected {p} in text mustache interpolation."),
            );
        }
    }

    fn check_parts(ctx: &mut LintContext, parts: &[AttributeValuePart]) {
        for part in parts {
            if let AttributeValuePart::ExpressionTag(tag) = part {
                Self::check_tag(ctx, tag);
            }
        }
    }
}

impl Rule for NoObjectInTextMustaches {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_expression_tag(&self, ctx: &mut LintContext, tag: &ExpressionTag) {
        Self::check_tag(ctx, tag);
    }

    /// `{@html …}` is a `SvelteMustacheTag` upstream too — the visitor has no
    /// `kind` filter, so a raw tag is reported exactly like a text one.
    fn check_html_tag(&self, ctx: &mut LintContext, tag: &HtmlTag) {
        Self::report_tag(ctx, tag.start, tag.end, tag.expression.node_type());
    }

    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        match attr {
            // Only normal attributes with a *multi-segment* value (text +
            // mustache, or several mustaches) are in "text context". A lone
            // `attr={expr}` or a single-mustache sequence is a prop binding and
            // is exempt.
            Attribute::Attribute(node) => {
                if let AttributeValue::Sequence(parts) = &node.value
                    && parts.len() > 1
                {
                    Self::check_parts(ctx, parts);
                }
            }
            // A `style:` directive is a `SvelteStyleDirective` upstream, not a
            // `SvelteAttribute`, so the single-value prop exemption never
            // applies to it.
            Attribute::StyleDirective(node) => match &node.value {
                AttributeValue::Sequence(parts) => Self::check_parts(ctx, parts),
                AttributeValue::Expression(tag) => Self::check_tag(ctx, tag),
                AttributeValue::True(_) => {}
            },
            _ => {}
        }
    }
}
