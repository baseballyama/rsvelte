//! `svelte/no-reactive-functions` — don't create functions inside reactive
//! statements (`$: foo = () => {…}` / `$: fn = function () {…}`). The function is
//! recreated on every reactive run for no reason; it should be a plain `const`.
//! Port of the eslint-plugin-svelte rule.
//!
//! Runs over the `<script>` ESTree program via the [`ScriptRule`] hook. A `$:`
//! reactive statement is a `LabeledStatement` whose label is `$`; the rule
//! flags one whose body is `ExpressionStatement > AssignmentExpression` with a
//! function-expression right-hand side. The upstream fix is suggestion-only (not
//! an autofix), so the rule reports without an attached fix.

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-reactive-functions",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: true,
    },
    type_aware: false,
    docs: "Don't create functions inside reactive statements",
    options_schema: None,
};

const MESSAGE: &str =
    "Do not create functions inside reactive statements unless absolutely necessary.";

fn is_function_expr(node: &Value) -> bool {
    matches!(
        node_type(node),
        Some("ArrowFunctionExpression") | Some("FunctionExpression")
    )
}

#[derive(Default)]
pub struct NoReactiveFunctions;

impl ScriptRule for NoReactiveFunctions {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let mut reports: Vec<(u32, u32)> = Vec::new();
        walk_js(program, |node, _| {
            if node_type(node) != Some("LabeledStatement") {
                return;
            }
            if node
                .get("label")
                .and_then(|l| l.get("name"))
                .and_then(Value::as_str)
                != Some("$")
            {
                return;
            }
            let Some(body) = node.get("body") else { return };
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
            if !is_function_expr(right) {
                return;
            }
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
    fn function_expr_detection() {
        assert!(is_function_expr(
            &json!({ "type": "ArrowFunctionExpression" })
        ));
        assert!(is_function_expr(&json!({ "type": "FunctionExpression" })));
        assert!(!is_function_expr(&json!({ "type": "Literal" })));
        assert!(!is_function_expr(&json!({ "type": "Identifier" })));
    }
}
