//! `svelte/no-inner-declarations`.
//!
//! `svelte/no-inner-declarations` — disallow `function` / `var` declarations in
//! nested blocks. Port of the core `ESLint` `no-inner-declarations` rule (the
//! eslint-plugin-svelte extension just re-parents through `SvelteScriptElement`,
//! which in rsvelte is already the script `Program`). Runs over the `<script>`
//! `ESTree` program via the [`ScriptRule`] hook, plus the template expressions —
//! upstream sees a single `Program` spanning the whole component, so a `var`
//! inside a template event handler is in scope for it as well.
//!
//! Options (`ESLint` ≥9 shape — the plugin's `v8` fixtures are skipped by the
//! oracle): `[ "functions" | "both", { "blockScopedFunctions": "allow" | "disallow" } ]`.
//! `"functions"` checks only function declarations; `"both"` also checks `var`
//! declarations. Because a `<script>` is always a module (strict mode), a
//! block-scoped function declaration is only reported when
//! `blockScopedFunctions` is `"disallow"` (the default `"allow"` permits it).

use rsvelte_core::ast::template::Root;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ProgramView, ScriptKind, ScriptRule, node_start, node_type};

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

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, kind: ScriptKind) {
        let Some(opts) = Options::read(ctx) else {
            return;
        };
        let mut reports: Vec<(u32, &'static str, &'static str)> = Vec::new();
        program.walk(|node, ancestors| collect(node, ancestors, opts, &mut reports));
        // Upstream sees one `Program` spanning the whole component, so a handler
        // in the template is checked too. Attach that pass to the instance
        // script; `check_root` covers components that have none.
        if kind == ScriptKind::Instance {
            let fragment = ctx.template_fragment_json();
            crate::script::walk_js(&fragment, |node, ancestors| {
                collect(node, ancestors, opts, &mut reports);
            });
        }
        emit(ctx, reports);
    }
}

impl Rule for NoInnerDeclarations {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        // `check_program` already walks the template alongside the instance
        // script; without one, this is the only pass that reaches it.
        if root.instance.is_some() {
            return;
        }
        let Some(opts) = Options::read(ctx) else {
            return;
        };
        let mut reports: Vec<(u32, &'static str, &'static str)> = Vec::new();
        let fragment = ctx.template_fragment_json();
        crate::script::walk_js(&fragment, |node, ancestors| {
            collect(node, ancestors, opts, &mut reports);
        });
        emit(ctx, reports);
    }
}

/// The rule's two resolved switches. `None` when neither declaration kind is
/// checked, so the walk can be skipped entirely.
#[derive(Clone, Copy)]
struct Options {
    functions: bool,
    vars: bool,
}

impl Options {
    fn read(ctx: &LintContext) -> Option<Self> {
        let opts = ctx.options();
        let vars = opts.and_then(|a| a.get(0)).and_then(Value::as_str) == Some("both");
        // A `<script>` is always a module (strict mode), so block-scoped function
        // declarations are only an error when explicitly disallowed.
        let functions = opts
            .and_then(|a| a.get(1))
            .and_then(|o| o.get("blockScopedFunctions"))
            .and_then(Value::as_str)
            == Some("disallow");
        (functions || vars).then_some(Self { functions, vars })
    }
}

fn collect<'a>(
    node: &'a Value,
    ancestors: &[&'a Value],
    opts: Options,
    reports: &mut Vec<(u32, &'static str, &'static str)>,
) {
    let kind = match node_type(node) {
        Some("FunctionDeclaration") if opts.functions => "function",
        Some("VariableDeclaration")
            if opts.vars && node.get("kind").and_then(Value::as_str) == Some("var") =>
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
    reports.push((start, kind, body_root(ancestors)));
}

fn emit(ctx: &mut LintContext, mut reports: Vec<(u32, &'static str, &'static str)>) {
    reports.sort_unstable();
    reports.dedup();
    for (start, kind, place) in reports {
        ctx.report(
            start,
            start,
            format!("Move {kind} declaration to {place} root."),
        );
    }
}

/// Whether a declaration with the given `ancestors` (nearest parent last) sits
/// in a nested block — i.e. NOT directly in a `Program`, a function body, or a
/// class static block. Mirrors core `ESLint`'s `no-inner-declarations` check.
fn is_inner(ancestors: &[&Value]) -> bool {
    let Some(parent) = ancestors.last() else {
        return false;
    };
    match node_type(parent) {
        Some("Program" | "StaticBlock" | "ExportNamedDeclaration" | "ExportDefaultDeclaration") => {
            false
        }
        Some("BlockStatement") => {
            // Valid only when the block is a function body.
            let gp = ancestors.get(ancestors.len().wrapping_sub(2));
            !matches!(
                gp.and_then(|g| node_type(g)),
                Some("FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression")
            )
        }
        _ => true,
    }
}

/// The nearest enclosing context the rule allows declarations in, mirroring
/// core `ESLint`'s `getAllowedBodyDescription`: a class static block wins over
/// an outer function, and a bare `Program` is the fallback.
fn body_root(ancestors: &[&Value]) -> &'static str {
    for node in ancestors.iter().rev() {
        match node_type(node) {
            Some("StaticBlock") => return "class static block body",
            Some("FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression") => {
                return "function body";
            }
            _ => {}
        }
    }
    "program"
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
    fn export_declaration_is_a_valid_parent() {
        let a = anc(&["Program", "ExportNamedDeclaration"]);
        let refs: Vec<&Value> = a.iter().collect();
        assert!(!is_inner(&refs));
    }

    #[test]
    fn nearest_static_block_wins_over_an_outer_function() {
        let a = anc(&[
            "Program",
            "FunctionDeclaration",
            "BlockStatement",
            "ClassDeclaration",
            "ClassBody",
            "StaticBlock",
            "IfStatement",
            "BlockStatement",
        ]);
        let refs: Vec<&Value> = a.iter().collect();
        assert!(is_inner(&refs));
        assert_eq!(body_root(&refs), "class static block body");
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
