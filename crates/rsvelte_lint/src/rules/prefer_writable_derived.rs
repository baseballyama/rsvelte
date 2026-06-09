//! `svelte/prefer-writable-derived` — prefer a writable `$derived` over the
//! `$state` + `$effect` pattern. When an `$effect(() => { x = expr })` body does
//! nothing but reassign a `$state`-declared variable `x`, the whole thing can be
//! a writable `$derived` (`let x = $derived(expr)`). Port of the
//! eslint-plugin-svelte rule.
//!
//! Runs over the `<script>` ESTree program via the [`ScriptRule`] hook. The
//! upstream fix is suggestion-only (not an autofix), so the rule reports without
//! an attached fix. Reports at the `$state` declarator (matching upstream's
//! `node: def.node`), once per offending `$effect` / `$effect.pre` call.

use std::collections::HashMap;

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/prefer-writable-derived",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: true,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Prefer using writable `$derived` instead of `$state` and `$effect`",
    options_schema: None,
};

const MESSAGE: &str = "Prefer using writable $derived instead of $state and $effect";

/// The callee identifier of a `$state(...)` call init, if any.
fn is_state_call(init: &Value) -> bool {
    node_type(init) == Some("CallExpression")
        && init
            .get("callee")
            .filter(|c| node_type(c) == Some("Identifier"))
            .and_then(|c| c.get("name"))
            .and_then(Value::as_str)
            == Some("$state")
}

/// Whether `node` is a `$effect(...)` or `$effect.pre(...)` call.
fn is_effect_call(node: &Value) -> bool {
    let Some(callee) = node.get("callee") else {
        return false;
    };
    match node_type(callee) {
        Some("Identifier") => callee.get("name").and_then(Value::as_str) == Some("$effect"),
        Some("MemberExpression") => {
            let object_is_effect = callee
                .get("object")
                .filter(|o| node_type(o) == Some("Identifier"))
                .and_then(|o| o.get("name"))
                .and_then(Value::as_str)
                == Some("$effect");
            let prop_is_pre = callee
                .get("property")
                .filter(|p| node_type(p) == Some("Identifier"))
                .and_then(|p| p.get("name"))
                .and_then(Value::as_str)
                == Some("pre");
            object_is_effect && prop_is_pre
        }
        _ => false,
    }
}

/// The single bare `x = <expr>` target name of a zero-param function argument
/// whose block body is exactly one assignment statement.
fn single_assignment_target(arg: &Value) -> Option<&str> {
    match node_type(arg) {
        Some("FunctionExpression") | Some("ArrowFunctionExpression") => {}
        _ => return None,
    }
    if !arg
        .get("params")
        .and_then(Value::as_array)
        .is_some_and(|p| p.is_empty())
    {
        return None;
    }
    let body = arg.get("body")?;
    if node_type(body) != Some("BlockStatement") {
        return None;
    }
    let stmts = body.get("body").and_then(Value::as_array)?;
    if stmts.len() != 1 {
        return None;
    }
    let stmt = &stmts[0];
    if node_type(stmt) != Some("ExpressionStatement") {
        return None;
    }
    let expr = stmt.get("expression")?;
    if node_type(expr) != Some("AssignmentExpression")
        || expr.get("operator").and_then(Value::as_str) != Some("=")
    {
        return None;
    }
    let left = expr.get("left")?;
    if node_type(left) != Some("Identifier") {
        return None;
    }
    left.get("name").and_then(Value::as_str)
}

#[derive(Default)]
pub struct PreferWritableDerived;

impl ScriptRule for PreferWritableDerived {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        // name → `$state` declarator start offset.
        let mut state_decls: HashMap<String, u32> = HashMap::new();
        walk_js(program, |node, _| {
            if node_type(node) != Some("VariableDeclarator") {
                return;
            }
            let Some(id) = node.get("id") else { return };
            if node_type(id) != Some("Identifier") {
                return;
            }
            let Some(name) = id.get("name").and_then(Value::as_str) else {
                return;
            };
            let Some(init) = node.get("init").filter(|i| !i.is_null()) else {
                return;
            };
            if is_state_call(init)
                && let Some(s) = node_start(node)
            {
                state_decls.insert(name.to_string(), s);
            }
        });

        let mut reports: Vec<(u32, u32)> = Vec::new();
        walk_js(program, |node, _| {
            if node_type(node) != Some("CallExpression") || !is_effect_call(node) {
                return;
            }
            let args = node.get("arguments").and_then(Value::as_array);
            let Some(args) = args else { return };
            if args.len() != 1 {
                return;
            }
            let Some(target) = single_assignment_target(&args[0]) else {
                return;
            };
            if let Some(&decl_start) = state_decls.get(target) {
                reports.push((decl_start, decl_start));
            }
        });

        // Report each at the `$state` declarator; the end offset is unused for
        // the column (start drives it), so point start==end at the declarator.
        for (start, _end) in reports {
            ctx.report(start, start, MESSAGE);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn effect_call_detection() {
        assert!(is_effect_call(
            &json!({ "type": "CallExpression", "callee": { "type": "Identifier", "name": "$effect" } })
        ));
        assert!(is_effect_call(
            &json!({ "type": "CallExpression", "callee": {
            "type": "MemberExpression",
            "object": { "type": "Identifier", "name": "$effect" },
            "property": { "type": "Identifier", "name": "pre" }
        } })
        ));
        assert!(!is_effect_call(
            &json!({ "type": "CallExpression", "callee": { "type": "Identifier", "name": "setInterval" } })
        ));
    }

    #[test]
    fn state_call_detection() {
        assert!(is_state_call(
            &json!({ "type": "CallExpression", "callee": { "type": "Identifier", "name": "$state" } })
        ));
        assert!(!is_state_call(
            &json!({ "type": "CallExpression", "callee": { "type": "Identifier", "name": "$derived" } })
        ));
    }

    #[test]
    fn single_assignment_target_shapes() {
        let ok = json!({
            "type": "ArrowFunctionExpression",
            "params": [],
            "body": { "type": "BlockStatement", "body": [
                { "type": "ExpressionStatement", "expression": {
                    "type": "AssignmentExpression", "operator": "=",
                    "left": { "type": "Identifier", "name": "x" },
                    "right": { "type": "Identifier", "name": "y" }
                } }
            ] }
        });
        assert_eq!(single_assignment_target(&ok), Some("x"));

        // Two statements → not a match.
        let two = json!({
            "type": "ArrowFunctionExpression",
            "params": [],
            "body": { "type": "BlockStatement", "body": [ {}, {} ] }
        });
        assert_eq!(single_assignment_target(&two), None);

        // Has params → not a match.
        let with_params = json!({
            "type": "ArrowFunctionExpression",
            "params": [ { "type": "Identifier", "name": "p" } ],
            "body": { "type": "BlockStatement", "body": [] }
        });
        assert_eq!(single_assignment_target(&with_params), None);
    }
}
