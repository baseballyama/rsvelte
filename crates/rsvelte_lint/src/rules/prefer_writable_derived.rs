//! `svelte/prefer-writable-derived`.
//!
//! `svelte/prefer-writable-derived` — prefer a writable `$derived` over the
//! `$state` + `$effect` pattern. When an `$effect(() => { x = expr })` body does
//! nothing but reassign a `$state`-declared variable `x`, the whole thing can be
//! a writable `$derived` (`let x = $derived(expr)`). Port of the
//! eslint-plugin-svelte rule.
//!
//! Runs over the `<script>` `ESTree` program via the [`ScriptRule`] hook.
//! Reports at the `$state` declarator (matching upstream's `node: def.node`),
//! once per offending `$effect` / `$effect.pre` call.
//!
//! The suggestion (messageId `suggestRewrite`) mirrors upstream exactly:
//!   1. Replace the `$state(…)` init expression with `$derived(<rightCode>)`.
//!   2. Remove the `$effect(…)` `CallExpression` (NOT the `ExpressionStatement`),
//!      which leaves the trailing `;` behind — exactly as in the fixture outputs.

use std::collections::HashMap;

use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::reactive_stmt::source_is_ts;
use crate::rules::store_refs::module_tracker;
use crate::script::{ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type};

static META: RuleMeta = RuleMeta {
    name: "svelte/prefer-writable-derived",
    category: RuleCategory::Correctness,
    fixable: Fixable::Suggestion,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: true,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Prefer using writable `$derived` instead of `$state` and `$effect`",
    options_schema: None,
};

const MESSAGE: &str = "Prefer using writable $derived instead of $state and $effect";
const SUGGEST_DESC: &str = "Rewrite $state and $effect to $derived";

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

/// Result of inspecting the single-assignment callback argument of an `$effect`.
struct EffectAssignment<'a> {
    /// The LHS identifier node, resolved through scope to its declaration.
    target: &'a Value,
    /// Byte start of the RHS expression.
    rhs_start: u32,
    /// Byte end of the RHS expression.
    rhs_end: u32,
}

/// Returns the assignment target name and RHS span from a zero-param function
/// whose block body is exactly one `x = <expr>` assignment statement.
fn single_assignment_info(arg: &Value) -> Option<EffectAssignment<'_>> {
    match node_type(arg) {
        Some("FunctionExpression" | "ArrowFunctionExpression") => {}
        _ => return None,
    }
    if !arg
        .get("params")
        .and_then(Value::as_array)
        .is_some_and(std::vec::Vec::is_empty)
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
    left.get("name").and_then(Value::as_str)?;
    let target = left;
    let right = expr.get("right")?;
    let rhs_start = node_start(right)?;
    let rhs_end = node_end(right)?;
    Some(EffectAssignment {
        target,
        rhs_start,
        rhs_end,
    })
}

/// Information about the `$state` declaration for a variable name.
struct StateDecl {
    /// Span of the `VariableDeclarator` node — upstream's reported node.
    decl_start: u32,
    decl_end: u32,
    /// Start of the `$state(…)` init `CallExpression`.
    init_start: u32,
    /// End of the `$state(…)` init `CallExpression`.
    init_end: u32,
}

#[derive(Default)]
pub struct PreferWritableDerived;

impl ScriptRule for PreferWritableDerived {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        let tracker = module_tracker(
            ctx.source(),
            program.value(),
            source_is_ts(ctx.source(), ctx.filename()),
        );
        // Declarator span → StateDecl. Upstream resolves the assignment target
        // to `reference.resolved.defs[0].node`, so keying by name would let a
        // `$state` declarator inside a helper function answer for an outer
        // variable that merely shares its name.
        let mut state_decls: HashMap<(u32, u32), StateDecl> = HashMap::new();
        program.walk(|node, _| {
            if node_type(node) != Some("VariableDeclarator") {
                return;
            }
            // Upstream only inspects the declarator's `init`, so a destructuring
            // pattern (`let [a] = $state([0])`) qualifies as well.
            let Some(init) = node.get("init").filter(|i| !i.is_null()) else {
                return;
            };
            if !is_state_call(init) {
                return;
            }
            let (Some(decl_start), Some(decl_end), Some(init_start), Some(init_end)) = (
                node_start(node),
                node_end(node),
                node_start(init),
                node_end(init),
            ) else {
                return;
            };
            state_decls.insert(
                (decl_start, decl_end),
                StateDecl {
                    decl_start,
                    decl_end,
                    init_start,
                    init_end,
                },
            );
        });

        // (decl_start, decl_end, init_start, init_end, rhs_start, rhs_end,
        //  effect_start, effect_end)
        let mut reports: Vec<(u32, u32, u32, u32, u32, u32, u32, u32)> = Vec::new();
        program.walk(|node, _| {
            if node_type(node) != Some("CallExpression") || !is_effect_call(node) {
                return;
            }
            let args = node.get("arguments").and_then(Value::as_array);
            let Some(args) = args else { return };
            if args.len() != 1 {
                return;
            }
            let Some(info) = single_assignment_info(&args[0]) else {
                return;
            };
            let Some(sd) = tracker
                .find_variable(info.target)
                .and_then(|var| state_decls.get(&tracker.decl_node_span(var)))
            else {
                return;
            };
            let (Some(effect_start), Some(effect_end)) = (node_start(node), node_end(node)) else {
                return;
            };
            reports.push((
                sd.decl_start,
                sd.decl_end,
                sd.init_start,
                sd.init_end,
                info.rhs_start,
                info.rhs_end,
                effect_start,
                effect_end,
            ));
        });

        // Report each at the `$state` declarator with a suggestion that:
        //   1. Replaces the `$state(…)` init with `$derived(<rightCode>)`.
        //   2. Removes the `$effect(…)` CallExpression (leaving its trailing `;`).
        for (
            decl_start,
            decl_end,
            init_start,
            init_end,
            rhs_start,
            rhs_end,
            effect_start,
            effect_end,
        ) in reports
        {
            let right_code = ctx.slice(rhs_start, rhs_end).to_string();
            let new_init = format!("$derived({right_code})");
            ctx.report_with_suggestions(
                decl_start,
                decl_end,
                MESSAGE,
                vec![Suggestion {
                    desc: SUGGEST_DESC.to_string(),
                    fix: Fix {
                        message: SUGGEST_DESC.to_string(),
                        edits: vec![
                            TextEdit {
                                start: init_start,
                                end: init_end,
                                new_text: new_init,
                            },
                            TextEdit {
                                start: effect_start,
                                end: effect_end,
                                new_text: String::new(),
                            },
                        ],
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
    fn single_assignment_info_shapes() {
        let ok = json!({
            "type": "ArrowFunctionExpression",
            "params": [],
            "body": { "type": "BlockStatement", "body": [
                { "type": "ExpressionStatement", "expression": {
                    "type": "AssignmentExpression", "operator": "=",
                    "left": { "type": "Identifier", "name": "x" },
                    "right": { "type": "Identifier", "name": "y",
                        "start": 10, "end": 11 }
                } }
            ] }
        });
        let info = single_assignment_info(&ok).unwrap();
        assert_eq!(info.target.get("name").unwrap(), "x");
        assert_eq!(info.rhs_start, 10);
        assert_eq!(info.rhs_end, 11);

        // Two statements → not a match.
        let two = json!({
            "type": "ArrowFunctionExpression",
            "params": [],
            "body": { "type": "BlockStatement", "body": [ {}, {} ] }
        });
        assert!(single_assignment_info(&two).is_none());

        // Has params → not a match.
        let with_params = json!({
            "type": "ArrowFunctionExpression",
            "params": [ { "type": "Identifier", "name": "p" } ],
            "body": { "type": "BlockStatement", "body": [] }
        });
        assert!(single_assignment_info(&with_params).is_none());
    }
}
