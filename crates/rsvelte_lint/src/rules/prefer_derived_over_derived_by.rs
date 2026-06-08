//! `svelte/prefer-derived-over-derived-by` — disallow unnecessary
//! `$derived.by()` when `$derived()` is sufficient. Port of the
//! eslint-plugin-svelte rule, over the script ESTree program via the
//! [`ScriptRule`] hook.
//!
//! The rule fires on a `$derived.by(fn)` call whose single argument is a
//! parameter-less, non-async, non-generator arrow/function expression that
//! merely returns a single expression — either a concise arrow body or a block
//! body containing exactly one `return <expr>;`. It autofixes the whole call to
//! `$derived(<expr>)`, splicing the returned expression's source text verbatim.
//!
//! Because `$derived.by` only exists in runes mode, matching the syntactic
//! pattern is sufficient (no separate runes-mode detection is needed).

use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/prefer-derived-over-derived-by",
    category: RuleCategory::Style,
    fixable: Fixable::Code,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow unnecessary `$derived.by()` when `$derived()` is sufficient",
    options_schema: None,
};

const MESSAGE: &str =
    "Unnecessary use of `$derived.by()`. Use `$derived()` directly for simple expressions.";

fn ident_name(node: &Value) -> Option<&str> {
    if node_type(node) == Some("Identifier") {
        node.get("name").and_then(Value::as_str)
    } else {
        None
    }
}

/// Whether `callee` is a non-computed member expression `$derived.by`.
fn is_derived_by_callee(callee: &Value) -> bool {
    node_type(callee) == Some("MemberExpression")
        && callee.get("computed").and_then(Value::as_bool) != Some(true)
        && callee.get("object").and_then(ident_name) == Some("$derived")
        && callee.get("property").and_then(ident_name) == Some("by")
}

/// Whether `arg` is a parameter-less, non-async, non-generator
/// arrow/function expression. Returns the node type when so.
fn simple_thunk_kind(arg: &Value) -> Option<&str> {
    let kind = node_type(arg)?;
    if kind != "ArrowFunctionExpression" && kind != "FunctionExpression" {
        return None;
    }
    let params_empty = arg
        .get("params")
        .and_then(Value::as_array)
        .map(|p| p.is_empty())
        .unwrap_or(false);
    if !params_empty {
        return None;
    }
    if arg.get("async").and_then(Value::as_bool) == Some(true) {
        return None;
    }
    if arg.get("generator").and_then(Value::as_bool) == Some(true) {
        return None;
    }
    Some(kind)
}

/// The single returned expression node of a simple thunk, if it returns one:
/// a concise arrow body, or a block body of exactly one `return <expr>;`.
fn returned_expression(arg: &Value, kind: &str) -> Option<Value> {
    let body = arg.get("body")?;
    if kind == "ArrowFunctionExpression" && node_type(body) != Some("BlockStatement") {
        return Some(body.clone());
    }
    if node_type(body) == Some("BlockStatement") {
        let stmts = body.get("body").and_then(Value::as_array)?;
        if stmts.len() == 1 {
            let stmt = &stmts[0];
            if node_type(stmt) == Some("ReturnStatement") {
                if let Some(argument) = stmt.get("argument") {
                    if !argument.is_null() {
                        return Some(argument.clone());
                    }
                }
            }
        }
    }
    None
}

#[derive(Default)]
pub struct PreferDerivedOverDerivedBy;

impl ScriptRule for PreferDerivedOverDerivedBy {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        // (call_start, call_end, expr_start, expr_end)
        let mut reports: Vec<(u32, u32, u32, u32)> = Vec::new();

        walk_js(program, |node, _| {
            if node_type(node) != Some("CallExpression") {
                return;
            }
            let Some(callee) = node.get("callee") else {
                return;
            };
            if !is_derived_by_callee(callee) {
                return;
            }
            let Some(args) = node.get("arguments").and_then(Value::as_array) else {
                return;
            };
            if args.len() != 1 {
                return;
            }
            let arg = &args[0];
            let Some(kind) = simple_thunk_kind(arg) else {
                return;
            };
            let Some(expr) = returned_expression(arg, kind) else {
                return;
            };
            let (Some(call_start), Some(call_end)) = (node_start(node), node_end(node)) else {
                return;
            };
            let (Some(expr_start), Some(expr_end)) = (node_start(&expr), node_end(&expr)) else {
                return;
            };
            reports.push((call_start, call_end, expr_start, expr_end));
        });

        reports.sort_unstable();
        reports.dedup();
        for (call_start, call_end, expr_start, expr_end) in reports {
            let expr_text = ctx.slice(expr_start, expr_end);
            let new_text = format!("$derived({expr_text})");
            let fix = Fix {
                message: MESSAGE.to_string(),
                edits: vec![TextEdit {
                    start: call_start,
                    end: call_end,
                    new_text,
                }],
            };
            ctx.report_with_fix(call_start, call_end, MESSAGE, fix);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn detects_derived_by_callee() {
        assert!(is_derived_by_callee(&json!({
            "type": "MemberExpression",
            "computed": false,
            "object": { "type": "Identifier", "name": "$derived" },
            "property": { "type": "Identifier", "name": "by" }
        })));
        // computed member access does not match
        assert!(!is_derived_by_callee(&json!({
            "type": "MemberExpression",
            "computed": true,
            "object": { "type": "Identifier", "name": "$derived" },
            "property": { "type": "Identifier", "name": "by" }
        })));
        // wrong object / property
        assert!(!is_derived_by_callee(&json!({
            "type": "MemberExpression",
            "computed": false,
            "object": { "type": "Identifier", "name": "$derived" },
            "property": { "type": "Identifier", "name": "from" }
        })));
        assert!(!is_derived_by_callee(&json!({
            "type": "MemberExpression",
            "computed": false,
            "object": { "type": "Identifier", "name": "derived" },
            "property": { "type": "Identifier", "name": "by" }
        })));
    }

    #[test]
    fn simple_thunk_kind_filters() {
        assert_eq!(
            simple_thunk_kind(&json!({
                "type": "ArrowFunctionExpression",
                "params": [], "async": false, "generator": false
            })),
            Some("ArrowFunctionExpression")
        );
        assert_eq!(
            simple_thunk_kind(&json!({
                "type": "FunctionExpression",
                "params": [], "async": false, "generator": false
            })),
            Some("FunctionExpression")
        );
        // params present
        assert_eq!(
            simple_thunk_kind(&json!({
                "type": "ArrowFunctionExpression",
                "params": [{ "type": "Identifier", "name": "x" }],
                "async": false, "generator": false
            })),
            None
        );
        // async
        assert_eq!(
            simple_thunk_kind(&json!({
                "type": "ArrowFunctionExpression",
                "params": [], "async": true, "generator": false
            })),
            None
        );
        // generator
        assert_eq!(
            simple_thunk_kind(&json!({
                "type": "FunctionExpression",
                "params": [], "async": false, "generator": true
            })),
            None
        );
        // not a function
        assert_eq!(
            simple_thunk_kind(&json!({ "type": "Identifier", "name": "f" })),
            None
        );
    }

    #[test]
    fn returned_expression_concise_arrow() {
        let arg = json!({
            "type": "ArrowFunctionExpression",
            "params": [], "async": false, "generator": false,
            "body": { "type": "MemberExpression", "start": 10, "end": 13 }
        });
        let expr = returned_expression(&arg, "ArrowFunctionExpression").unwrap();
        assert_eq!(node_type(&expr), Some("MemberExpression"));
    }

    #[test]
    fn returned_expression_block_single_return() {
        let arg = json!({
            "type": "ArrowFunctionExpression",
            "params": [], "async": false, "generator": false,
            "body": {
                "type": "BlockStatement",
                "body": [
                    { "type": "ReturnStatement",
                      "argument": { "type": "Identifier", "name": "a", "start": 5, "end": 6 } }
                ]
            }
        });
        let expr = returned_expression(&arg, "ArrowFunctionExpression").unwrap();
        assert_eq!(node_type(&expr), Some("Identifier"));
    }

    #[test]
    fn returned_expression_rejects_multi_statement_and_bare_return() {
        // multi-statement block
        let multi = json!({
            "type": "ArrowFunctionExpression",
            "body": {
                "type": "BlockStatement",
                "body": [
                    { "type": "VariableDeclaration" },
                    { "type": "ReturnStatement", "argument": { "type": "Identifier" } }
                ]
            }
        });
        assert!(returned_expression(&multi, "ArrowFunctionExpression").is_none());

        // bare `return;`
        let bare = json!({
            "type": "ArrowFunctionExpression",
            "body": {
                "type": "BlockStatement",
                "body": [ { "type": "ReturnStatement", "argument": null } ]
            }
        });
        assert!(returned_expression(&bare, "ArrowFunctionExpression").is_none());

        // block-bodied arrow but the single statement is not a return
        let no_return = json!({
            "type": "ArrowFunctionExpression",
            "body": {
                "type": "BlockStatement",
                "body": [ { "type": "ExpressionStatement" } ]
            }
        });
        assert!(returned_expression(&no_return, "ArrowFunctionExpression").is_none());
    }
}
