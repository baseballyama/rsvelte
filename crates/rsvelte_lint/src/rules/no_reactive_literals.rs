//! `svelte/no-reactive-literals` — don't assign literal values inside a reactive
//! statement (`$: foo = "foo"` / `$: bar = []` / `$: baz = {}`). Such a value
//! never changes, so the reactive statement is pointless — it should be a plain
//! `let` declaration. Port of the eslint-plugin-svelte rule.
//!
//! Runs over the `<script>` ESTree program via the [`ScriptRule`] hook. A `$:`
//! reactive statement is a `LabeledStatement` whose label is `$`; the rule
//! flags one whose body is `ExpressionStatement > AssignmentExpression` with a
//! right-hand side that is a literal, an empty array, or an empty object.
//!
//! The upstream fix is offered only as a *suggestion* (not an autofix), so this
//! rule reports without an attached fix.

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-reactive-literals",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: true,
    },
    type_aware: false,
    docs: "Don't assign literal values inside reactive statements",
    options_schema: None,
};

const MESSAGE: &str =
    "Do not assign literal values inside reactive statements unless absolutely necessary.";

/// Whether the assignment right-hand side is a literal / empty array / empty
/// object — the three shapes upstream matches.
fn is_pointless_rhs(right: &Value) -> bool {
    match node_type(right) {
        Some("Literal") => true,
        Some("ArrayExpression") => right
            .get("elements")
            .and_then(Value::as_array)
            .is_some_and(|e| e.is_empty()),
        Some("ObjectExpression") => right
            .get("properties")
            .and_then(Value::as_array)
            .is_some_and(|p| p.is_empty()),
        _ => false,
    }
}

#[derive(Default)]
pub struct NoReactiveLiterals;

impl ScriptRule for NoReactiveLiterals {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let mut reports: Vec<(u32, u32)> = Vec::new();
        walk_js(program, |node, _| {
            if node_type(node) != Some("LabeledStatement") {
                return;
            }
            // `$:` reactive statement.
            if node
                .get("label")
                .and_then(|l| l.get("name"))
                .and_then(Value::as_str)
                != Some("$")
            {
                return;
            }
            let body = match node.get("body") {
                Some(b) => b,
                None => return,
            };
            if node_type(body) != Some("ExpressionStatement") {
                return;
            }
            let Some(expr) = body.get("expression") else {
                return;
            };
            if node_type(expr) != Some("AssignmentExpression") {
                return;
            }
            let Some(right) = expr.get("right") else {
                return;
            };
            if !is_pointless_rhs(right) {
                return;
            }
            // Report at the whole reactive statement (the `$:`).
            if let (Some(s), Some(e)) = (node_start(node), node.get("end").and_then(Value::as_u64))
            {
                reports.push((s, e as u32));
            }
        });

        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn pointless_rhs_detection() {
        assert!(is_pointless_rhs(
            &json!({ "type": "Literal", "value": "foo" })
        ));
        assert!(is_pointless_rhs(
            &json!({ "type": "ArrayExpression", "elements": [] })
        ));
        assert!(is_pointless_rhs(
            &json!({ "type": "ObjectExpression", "properties": [] })
        ));
        // Non-empty / non-literal shapes are fine.
        assert!(!is_pointless_rhs(
            &json!({ "type": "ArrayExpression", "elements": [ { "type": "Literal" } ] })
        ));
        assert!(!is_pointless_rhs(
            &json!({ "type": "ObjectExpression", "properties": [ {} ] })
        ));
        assert!(!is_pointless_rhs(&json!({ "type": "TemplateLiteral" })));
        assert!(!is_pointless_rhs(
            &json!({ "type": "Identifier", "name": "x" })
        ));
    }
}
