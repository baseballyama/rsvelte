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
//! The upstream fix is offered only as a *suggestion* (not an autofix): it
//! moves the literal out of the reactive statement into a plain assignment —
//! `insertTextBefore(parent, "let " + text(assignment))` + `remove(parent)`,
//! which collapses to replacing the whole `$: …;` labeled statement with
//! `let <assignment-text>` (note: no trailing `;`, mirroring upstream byte for
//! byte).

use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-reactive-literals",
    category: RuleCategory::Correctness,
    fixable: Fixable::Suggestion,
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
const SUGGEST_DESC: &str = "Move the literal out of the reactive statement into an assignment";

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
        // (labeled-statement start, labeled-statement end, assignment start,
        // assignment end). The suggestion replaces [labeled.start, labeled.end)
        // with `let <assignment-text>`.
        let mut reports: Vec<(u32, u32, u32, u32)> = Vec::new();
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
            if let (Some(s), Some(e), Some(es), Some(ee)) = (
                node_start(node),
                node_end(node),
                node_start(expr),
                node_end(expr),
            ) {
                reports.push((s, e, es, ee));
            }
        });

        for (start, end, expr_start, expr_end) in reports {
            let assignment = ctx.slice(expr_start, expr_end).to_string();
            ctx.report_with_suggestions(
                start,
                end,
                MESSAGE,
                vec![Suggestion {
                    desc: SUGGEST_DESC.to_string(),
                    fix: Fix {
                        message: SUGGEST_DESC.to_string(),
                        edits: vec![TextEdit {
                            start,
                            end,
                            new_text: format!("let {assignment}"),
                        }],
                    },
                }],
            );
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
