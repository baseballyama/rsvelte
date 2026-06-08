//! `svelte/no-inner-declarations` — disallow `function` / `var` declarations in
//! nested blocks. Port of the core ESLint `no-inner-declarations` rule (the
//! eslint-plugin-svelte extension just re-parents through `SvelteScriptElement`,
//! which in rsvelte is already the script `Program`). Runs over the `<script>`
//! ESTree program via the [`ScriptRule`] hook.
//!
//! Options (ESLint ≥9 shape — the plugin's `v8` fixtures are skipped by the
//! oracle): `[ "functions" | "both", { "blockScopedFunctions": "allow" | "disallow" } ]`.
//! `"functions"` checks only function declarations; `"both"` also checks `var`
//! declarations. Because a `<script>` is always a module (strict mode), a
//! block-scoped function declaration is only reported when
//! `blockScopedFunctions` is `"disallow"` (the default `"allow"` permits it).

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-inner-declarations",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow variable or `function` declarations in nested blocks",
    options_schema: None,
};

#[derive(Default)]
pub struct NoInnerDeclarations;

impl ScriptRule for NoInnerDeclarations {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let opts = ctx.options();
        let mode = opts
            .and_then(|a| a.get(0))
            .and_then(Value::as_str)
            .unwrap_or("functions");
        let check_vars = mode == "both";
        let block_scoped_functions = opts
            .and_then(|a| a.get(1))
            .and_then(|o| o.get("blockScopedFunctions"))
            .and_then(Value::as_str)
            .unwrap_or("allow");
        // A `<script>` is always a module (strict mode), so block-scoped function
        // declarations are only an error when explicitly disallowed.
        let check_functions = block_scoped_functions == "disallow";

        let mut reports: Vec<(u32, &'static str, &'static str)> = Vec::new();
        walk_js(program, |node, ancestors| {
            let kind = match node_type(node) {
                Some("FunctionDeclaration") if check_functions => "function",
                Some("VariableDeclaration")
                    if check_vars && node.get("kind").and_then(Value::as_str) == Some("var") =>
                {
                    "variable"
                }
                _ => return,
            };
            if !is_inner(ancestors) {
                return;
            }
            let Some(start) = node_start(node) else {
                return;
            };
            let place = body_root(ancestors);
            reports.push((start, kind, place));
        });

        for (start, kind, place) in reports {
            ctx.report(
                start,
                start,
                format!("Move {kind} declaration to {place} root."),
            );
        }
    }
}

/// Whether a declaration with the given `ancestors` (nearest parent last) sits
/// in a nested block — i.e. NOT directly in a `Program`, a function body, or a
/// class static block. Mirrors core ESLint's `no-inner-declarations` check.
fn is_inner(ancestors: &[&Value]) -> bool {
    let Some(parent) = ancestors.last() else {
        return false;
    };
    match node_type(parent) {
        Some("Program") | Some("StaticBlock") => false,
        Some("BlockStatement") => {
            // Valid only when the block is a function body.
            let gp = ancestors.get(ancestors.len().wrapping_sub(2));
            !matches!(
                gp.and_then(|g| node_type(g)),
                Some("FunctionDeclaration")
                    | Some("FunctionExpression")
                    | Some("ArrowFunctionExpression")
            )
        }
        _ => true,
    }
}

/// `"function body"` when there is an enclosing function, else `"program"`.
fn body_root(ancestors: &[&Value]) -> &'static str {
    let in_function = ancestors.iter().rev().any(|n| {
        matches!(
            node_type(n),
            Some("FunctionDeclaration")
                | Some("FunctionExpression")
                | Some("ArrowFunctionExpression")
        )
    });
    if in_function {
        "function body"
    } else {
        "program"
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn anc(types: &[&str]) -> Vec<Value> {
        types
            .iter()
            .map(|t| json!({ "type": t }))
            .collect::<Vec<_>>()
    }

    #[test]
    fn top_level_is_not_inner() {
        let a = anc(&["Program"]);
        let refs: Vec<&Value> = a.iter().collect();
        assert!(!is_inner(&refs));
    }

    #[test]
    fn function_body_is_not_inner() {
        let a = anc(&["Program", "FunctionDeclaration", "BlockStatement"]);
        let refs: Vec<&Value> = a.iter().collect();
        assert!(!is_inner(&refs));
    }

    #[test]
    fn block_in_if_is_inner() {
        let a = anc(&["Program", "IfStatement", "BlockStatement"]);
        let refs: Vec<&Value> = a.iter().collect();
        assert!(is_inner(&refs));
    }

    #[test]
    fn directly_in_if_is_inner() {
        let a = anc(&["Program", "IfStatement"]);
        let refs: Vec<&Value> = a.iter().collect();
        assert!(is_inner(&refs));
    }

    #[test]
    fn body_root_picks_function_or_program() {
        let prog = anc(&["Program", "IfStatement", "BlockStatement"]);
        let refs: Vec<&Value> = prog.iter().collect();
        assert_eq!(body_root(&refs), "program");
        let func = anc(&[
            "Program",
            "FunctionDeclaration",
            "BlockStatement",
            "IfStatement",
        ]);
        let refs2: Vec<&Value> = func.iter().collect();
        assert_eq!(body_root(&refs2), "function body");
    }
}
