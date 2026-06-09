//! `svelte/no-immutable-reactive-statements` — disallow a `$:` reactive
//! statement whose every referenced variable is immutable, because such a
//! statement never re-runs (it isn't actually reactive). Port of the
//! eslint-plugin-svelte rule.
//!
//! Runs over the `<script>` ESTree program via the [`ScriptRule`] hook. A
//! variable is **mutable** when it is a prop (`export let`), a reactive store
//! reference (`$store`), reassigned, or mutated — and `analyze_scope` already
//! folds template-side writes (two-way `bind:`, `{#each}` context writes, member
//! writes inside event handlers) into the `reassigned` / `mutated` flags, so no
//! template walk is needed here. Identifiers that don't resolve to a top-level
//! binding are treated as builtin (`$$…`) or undeclared (→ not reported) unless
//! they are known globals (`console`, …), which are simply ignored.
//!
//! `analyze_scope` propagates a single level of `{#each}` context write back to
//! the iterated source, but not through *nested* each-blocks, so the rule also
//! re-parses the template and recursively marks the base variable of any
//! each-expression whose context is written (a `bind:`, an assignment, or a
//! nested each whose own context is written) as mutable — matching upstream's
//! `hasWriteMember`/`hasWriteReference` recursion.

use std::collections::HashSet;

use rsvelte_core::ParseOptions;
use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::compiler::phases::parse;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-immutable-reactive-statements",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: true,
    },
    type_aware: false,
    docs: "Disallow reactive statements that don't reference reactive values",
    options_schema: None,
};

const MESSAGE: &str = "This statement is not reactive because all variables referenced in the reactive statement are immutable.";

/// A conservative set of known global identifiers — referencing one neither
/// makes a statement reactive nor counts as an undeclared variable. Only needs
/// to be broad enough that genuine globals aren't mistaken for undeclared names.
const KNOWN_GLOBALS: &[&str] = &[
    "console",
    "window",
    "document",
    "globalThis",
    "Math",
    "JSON",
    "Object",
    "Array",
    "String",
    "Number",
    "Boolean",
    "Date",
    "RegExp",
    "Map",
    "Set",
    "WeakMap",
    "WeakSet",
    "Promise",
    "Symbol",
    "BigInt",
    "Error",
    "Infinity",
    "NaN",
    "undefined",
    "parseInt",
    "parseFloat",
    "isNaN",
    "isFinite",
    "setTimeout",
    "setInterval",
    "clearTimeout",
    "clearInterval",
    "fetch",
    "navigator",
    "location",
    "history",
    "localStorage",
    "sessionStorage",
    "URL",
    "URLSearchParams",
];

/// Collect names declared by `export let` / `export var` (props).
fn collect_export_let_props(program: &Value, out: &mut HashSet<String>) {
    walk_js(program, |node, _| {
        if node_type(node) != Some("ExportNamedDeclaration") {
            return;
        }
        let Some(decl) = node.get("declaration") else {
            return;
        };
        if node_type(decl) != Some("VariableDeclaration") {
            return;
        }
        let kind = decl.get("kind").and_then(Value::as_str);
        if kind != Some("let") && kind != Some("var") {
            return;
        }
        if let Some(declarators) = decl.get("declarations").and_then(Value::as_array) {
            for d in declarators {
                collect_pattern_idents(d.get("id"), out);
            }
        }
    });
}

/// Collect bound identifier names from a declarator `id` pattern.
fn collect_pattern_idents(id: Option<&Value>, out: &mut HashSet<String>) {
    let Some(id) = id else { return };
    match node_type(id) {
        Some("Identifier") => {
            if let Some(n) = id.get("name").and_then(Value::as_str) {
                out.insert(n.to_string());
            }
        }
        Some("ObjectPattern") => {
            if let Some(props) = id.get("properties").and_then(Value::as_array) {
                for p in props {
                    match node_type(p) {
                        Some("Property") => collect_pattern_idents(p.get("value"), out),
                        Some("RestElement") => collect_pattern_idents(p.get("argument"), out),
                        _ => {}
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(els) = id.get("elements").and_then(Value::as_array) {
                for e in els.iter().filter(|e| !e.is_null()) {
                    collect_pattern_idents(Some(e), out);
                }
            }
        }
        Some("AssignmentPattern") => collect_pattern_idents(id.get("left"), out),
        Some("RestElement") => collect_pattern_idents(id.get("argument"), out),
        _ => {}
    }
}

/// The base identifier name of an expression: `x` → `x`, `x.y[0]` → `x`.
fn expr_base_name(e: Option<&Value>) -> Option<&str> {
    let e = e?;
    match node_type(e) {
        Some("Identifier") => e.get("name").and_then(Value::as_str),
        Some("MemberExpression") => expr_base_name(e.get("object")),
        _ => None,
    }
}

/// Whether `name` is *written* anywhere in `scope`: as a `bind:` directive
/// target, an assignment / update target, or the source of a nested `{#each}`
/// whose own context is (recursively) written.
fn is_written(name: &str, scope: &Value) -> bool {
    let mut found = false;
    walk_js(scope, |node, _| {
        if found {
            return;
        }
        let nt = node_type(node);
        let simple_write = (nt == Some("BindDirective")
            && expr_base_name(node.get("expression")) == Some(name))
            || (nt == Some("AssignmentExpression")
                && expr_base_name(node.get("left")) == Some(name))
            || (nt == Some("UpdateExpression")
                && expr_base_name(node.get("argument")) == Some(name));
        if simple_write {
            found = true;
            return;
        }
        if nt == Some("EachBlock") && expr_base_name(node.get("expression")) == Some(name) {
            let mut cnames = HashSet::new();
            collect_pattern_idents(node.get("context"), &mut cnames);
            if let Some(body) = node.get("body")
                && cnames.iter().any(|c| is_written(c, body))
            {
                found = true;
            }
        }
    });
    found
}

/// The base variables of every `{#each}` source whose context is written — these
/// are mutated through the loop and so are *not* immutable.
fn collect_mutable_via_each(source: &str) -> HashSet<String> {
    let mut out = HashSet::new();
    let Ok(root) = parse(source, ParseOptions::default()) else {
        return out;
    };
    let Some(frag) =
        with_serialize_arena(&root.arena, || serde_json::to_value(&root.fragment).ok())
    else {
        return out;
    };
    walk_js(&frag, |node, _| {
        if node_type(node) != Some("EachBlock") {
            return;
        }
        let Some(base) = expr_base_name(node.get("expression")) else {
            return;
        };
        let mut cnames = HashSet::new();
        collect_pattern_idents(node.get("context"), &mut cnames);
        if let Some(body) = node.get("body")
            && cnames.iter().any(|c| is_written(c, body))
        {
            out.insert(base.to_string());
        }
    });
    out
}

/// Whether `ident` (with its parent) sits in a position that is NOT a variable
/// read: a non-computed member `.property`, a non-computed/non-shorthand object
/// `key`, the `$` reactive label, or the write-only assignment target.
fn is_ignored_position(ident: &Value, parent: &Value, write_only_lhs_start: Option<u32>) -> bool {
    let id_start = ident.get("start").and_then(Value::as_u64);
    match node_type(parent) {
        Some("MemberExpression") => {
            let computed = parent.get("computed").and_then(Value::as_bool) == Some(true);
            !computed
                && parent
                    .get("property")
                    .and_then(|p| p.get("start"))
                    .and_then(Value::as_u64)
                    == id_start
        }
        Some("Property") => {
            let computed = parent.get("computed").and_then(Value::as_bool) == Some(true);
            let shorthand = parent.get("shorthand").and_then(Value::as_bool) == Some(true);
            !computed
                && !shorthand
                && parent
                    .get("key")
                    .and_then(|k| k.get("start"))
                    .and_then(Value::as_u64)
                    == id_start
        }
        Some("LabeledStatement") => {
            parent
                .get("label")
                .and_then(|l| l.get("start"))
                .and_then(Value::as_u64)
                == id_start
        }
        _ => {
            // Write-only assignment target.
            write_only_lhs_start.map(u64::from) == id_start
        }
    }
}

#[derive(Default)]
pub struct NoImmutableReactiveStatements;

impl ScriptRule for NoImmutableReactiveStatements {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let Some(analysis) = crate::scope::analyze_scope(ctx.source()) else {
            return;
        };
        let binding_names: HashSet<&str> = analysis
            .root
            .bindings
            .iter()
            .map(|b| b.name.as_str())
            .collect();
        let mutable_bindings: HashSet<&str> = analysis
            .root
            .bindings
            .iter()
            .filter(|b| b.reassigned || b.mutated)
            .map(|b| b.name.as_str())
            .collect();
        let mut props: HashSet<String> = HashSet::new();
        collect_export_let_props(program, &mut props);
        let mutable_via_each = collect_mutable_via_each(ctx.source());
        let globals: HashSet<&str> = KNOWN_GLOBALS.iter().copied().collect();

        let is_mutable = |name: &str| -> bool {
            props.contains(name)
                || mutable_bindings.contains(name)
                || mutable_via_each.contains(name)
        };

        let mut reports: Vec<(u32, u32)> = Vec::new();
        walk_js(program, |node, _| {
            if node_type(node) != Some("LabeledStatement")
                || node
                    .get("label")
                    .and_then(|l| l.get("name"))
                    .and_then(Value::as_str)
                    != Some("$")
            {
                return;
            }
            let Some(body) = node.get("body") else { return };

            // Report target + write-only LHS (for `$: x = expr`).
            let (target_start, target_end, write_only_lhs_start) = if node_type(body)
                == Some("ExpressionStatement")
                && let Some(expr) = body.get("expression")
                && node_type(expr) == Some("AssignmentExpression")
            {
                let op_eq = expr.get("operator").and_then(Value::as_str) == Some("=");
                let lhs_start = expr
                    .get("left")
                    .filter(|l| node_type(l) == Some("Identifier"))
                    .and_then(|l| l.get("start"))
                    .and_then(Value::as_u64)
                    .map(|s| s as u32);
                let right = expr.get("right");
                let (ts, te) = if op_eq {
                    (
                        right.and_then(|r| r.get("start")).and_then(Value::as_u64),
                        right.and_then(|r| r.get("end")).and_then(Value::as_u64),
                    )
                } else {
                    (
                        body.get("start").and_then(Value::as_u64),
                        body.get("end").and_then(Value::as_u64),
                    )
                };
                (ts, te, lhs_start)
            } else {
                (
                    body.get("start").and_then(Value::as_u64),
                    body.get("end").and_then(Value::as_u64),
                    None,
                )
            };
            let (Some(ts), Some(te)) = (target_start, target_end) else {
                return;
            };

            // Walk the statement subtree, classifying each referenced identifier.
            let mut should_skip = false;
            walk_js(node, |inner, ancestors| {
                if should_skip || node_type(inner) != Some("Identifier") {
                    return;
                }
                let Some(parent) = ancestors.last() else {
                    return;
                };
                if is_ignored_position(inner, parent, write_only_lhs_start) {
                    return;
                }
                let Some(name) = inner.get("name").and_then(Value::as_str) else {
                    return;
                };
                if name.starts_with("$$") {
                    should_skip = true; // builtin `$$` var
                } else if name.starts_with('$') {
                    should_skip = true; // reactive store reference → mutable
                } else if binding_names.contains(name) {
                    if is_mutable(name) {
                        should_skip = true;
                    }
                } else if !globals.contains(name) {
                    should_skip = true; // undeclared / unresolved
                }
            });

            if !should_skip {
                reports.push((ts as u32, te as u32));
            }
        });

        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}
