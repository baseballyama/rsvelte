//! `svelte/no-reactive-functions` — don't create functions inside reactive
//! statements (`$: foo = () => {…}` / `$: fn = function () {…}`). The function is
//! recreated on every reactive run for no reason; it should be a plain `const`.
//! Port of the eslint-plugin-svelte rule.
//!
//! Runs over the `<script>` ESTree program via the [`ScriptRule`] hook. A `$:`
//! reactive statement is a `LabeledStatement` whose label is `$`; the rule
//! flags one whose body is `ExpressionStatement > AssignmentExpression` with a
//! function-expression right-hand side. The upstream fix is suggestion-only
//! (not an autofix): it replaces the reactive label `$:` with `const` (adding a
//! space only when there wasn't one after the colon), mirroring upstream's
//! `replaceTextRange([$.start, colon.end], noExtraSpace ? 'const' : 'const ')`.

use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-reactive-functions",
    category: RuleCategory::Correctness,
    fixable: Fixable::Suggestion,
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
const SUGGEST_DESC: &str = "Move the function out of the reactive statement";

/// Build the `$:` → `const` suggestion edit. `label_end` is the byte offset just
/// past the `$` label; we scan forward for the `:` and replace `[stmt_start,
/// colon_end)` with `const` (or `const ` when no space already follows the
/// colon), mirroring upstream's token-range replace.
fn const_suggestion(source: &str, stmt_start: u32, label_end: u32) -> Option<TextEdit> {
    let bytes = source.as_bytes();
    let mut i = label_end as usize;
    while i < bytes.len() && bytes[i] != b':' {
        i += 1;
    }
    if i >= bytes.len() {
        return None;
    }
    let colon_end = i + 1;
    let space_after = bytes
        .get(colon_end)
        .is_some_and(|b| b.is_ascii_whitespace());
    Some(TextEdit {
        start: stmt_start,
        end: colon_end as u32,
        new_text: if space_after { "const" } else { "const " }.to_string(),
    })
}

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
        // (labeled-statement start, labeled-statement end, `$`-label end).
        let mut reports: Vec<(u32, u32, u32)> = Vec::new();
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
            let label_end = node.get("label").and_then(node_end);
            if let (Some(s), Some(e), Some(le)) = (node_start(node), node_end(node), label_end) {
                reports.push((s, e, le));
            }
        });

        for (start, end, label_end) in reports {
            let edit = const_suggestion(ctx.source(), start, label_end);
            match edit {
                Some(edit) => ctx.report_with_suggestions(
                    start,
                    end,
                    MESSAGE,
                    vec![Suggestion {
                        desc: SUGGEST_DESC.to_string(),
                        fix: Fix {
                            message: SUGGEST_DESC.to_string(),
                            edits: vec![edit],
                        },
                    }],
                ),
                // Defensive: no `:` found (can't happen for a valid `$:`).
                None => ctx.report(start, end, MESSAGE),
            }
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
