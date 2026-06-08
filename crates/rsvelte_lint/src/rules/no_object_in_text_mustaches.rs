//! `svelte/no-object-in-text-mustaches` — flag an object/array/function/class
//! expression used directly in a text-position mustache (`{{ a }}`, `{[a]}`,
//! `{() => a}`, `{class A {}}`), which stringifies to `[object Object]` etc.
//! Port of the eslint-plugin-svelte rule.
//!
//! The visitor only dispatches `check_expression_tag` for **text-position**
//! mustaches, so attribute-value prop bindings (`<Comp prop={{ a }} />`) are
//! never seen here — exactly the case the plugin exempts.

use rsvelte_core::ast::template::ExpressionTag;

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

#[derive(Default)]
pub struct NoObjectInTextMustaches;

impl Rule for NoObjectInTextMustaches {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_expression_tag(&self, ctx: &mut LintContext, tag: &ExpressionTag) {
        let phrase = match tag.expression.node_type() {
            Some("ObjectExpression") => "object",
            Some("ArrayExpression") => "array",
            Some("ArrowFunctionExpression") | Some("FunctionExpression") => "function",
            Some("ClassExpression") => "class",
            _ => return,
        };
        ctx.report(
            tag.start,
            tag.end,
            format!("Unexpected {phrase} in text mustache interpolation."),
        );
    }
}
