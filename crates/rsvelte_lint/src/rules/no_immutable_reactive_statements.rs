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

/// Collect the base identifier of every `delete <member>` expression in the
/// program (`delete obj.prop` ⇒ `obj`). Such a delete mutates the object, so the
/// base name is mutable — mirrors upstream's `hasWriteMember` handling of
/// `UnaryExpression { operator: 'delete' }`.
fn collect_delete_mutated(program: &Value) -> HashSet<String> {
    let mut out = HashSet::new();
    walk_js(program, |node, _| {
        if node_type(node) != Some("UnaryExpression") {
            return;
        }
        if node.get("operator").and_then(Value::as_str) != Some("delete") {
            return;
        }
        if let Some(base) = expr_base_name(node.get("argument")) {
            out.insert(base.to_string());
        }
    });
    out
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
    let Ok(root) = parse(
        source,
        &rsvelte_core::Allocator::default(),
        ParseOptions::default(),
    ) else {
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
/// `key`, the `$` reactive label.
fn is_ignored_position(ident: &Value, parent: &Value) -> bool {
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
        _ => false,
    }
}

/// Collect all binding-shaped `=` assignment LHS spans anywhere in `node`.
/// These are positions where an identifier is in write-only position (not read),
/// and must be excluded from the "is this a reactive read?" check — but only
/// when the name is a known top-level binding. For undeclared names in write-only
/// position, we still treat them as unresolved through-references (→ don't report).
///
/// Only collects spans for `AssignmentExpression` with `=` operator whose LHS
/// is `Identifier | ObjectPattern | ArrayPattern` (binding shapes). A
/// `MemberExpression` LHS is NOT write-only — it mutates the object, making the
/// object binding a mutable (reactive) reference.
fn collect_write_only_lhs_spans(node: &Value, out: &mut Vec<(u32, u32)>) {
    walk_js(node, |n, _| {
        if node_type(n) != Some("AssignmentExpression") {
            return;
        }
        if n.get("operator").and_then(Value::as_str) != Some("=") {
            return;
        }
        let left = n.get("left");
        let lhs_is_binding = matches!(
            left.and_then(node_type),
            Some("Identifier" | "ObjectPattern" | "ArrayPattern")
        );
        if !lhs_is_binding {
            return;
        }
        let start = left
            .and_then(|l| l.get("start"))
            .and_then(Value::as_u64)
            .map(|v| v as u32);
        let end = left
            .and_then(|l| l.get("end"))
            .and_then(Value::as_u64)
            .map(|v| v as u32);
        if let (Some(s), Some(e)) = (start, end) {
            out.push((s, e));
        }
    });
}

/// Collect names implicitly declared by top-level `$:` reactive assignment
/// statements across the WHOLE program (e.g. `$: foo = 1`, `$: ([foo] = arr)`,
/// `$: ({ a, b } = obj)`). These names are created as reactive bindings by
/// Svelte but may not appear in `analyze_scope`'s `binding_names` when the
/// scope builder doesn't handle the destructuring reactive-declaration pattern.
/// Treating them as "known" ensures write-only refs in the LHS are skipped
/// rather than triggering the "undeclared → should_skip" path.
fn collect_reactive_decl_names(program: &Value, out: &mut HashSet<String>) {
    let Some(body) = program.get("body").and_then(Value::as_array) else {
        return;
    };
    for stmt in body {
        if node_type(stmt) != Some("LabeledStatement") {
            continue;
        }
        if stmt
            .get("label")
            .and_then(|l| l.get("name"))
            .and_then(Value::as_str)
            != Some("$")
        {
            continue;
        }
        let Some(body) = stmt.get("body") else {
            continue;
        };
        if node_type(body) != Some("ExpressionStatement") {
            continue;
        }
        let Some(expr) = body.get("expression") else {
            continue;
        };
        // Unwrap a single level of parenthesization: `$: (foo = bar)`.
        let expr = if node_type(expr) == Some("SequenceExpression") {
            // Not a typical case but safe to skip
            continue;
        } else {
            expr
        };
        if node_type(expr) != Some("AssignmentExpression") {
            continue;
        }
        if expr.get("operator").and_then(Value::as_str) != Some("=") {
            continue;
        }
        // Collect all identifier names from the LHS pattern — these are the
        // implicitly-declared reactive vars.
        collect_pattern_idents(expr.get("left"), out);
    }
}

/// Collect all names declared by `VariableDeclaration` nodes or function
/// parameters anywhere **inside** the reactive statement node (including inside
/// nested function bodies). These are local bindings that shadow any outer
/// top-level binding with the same name — references to them are not references
/// to the outer binding and must be ignored.
///
/// Mirrors the upstream behaviour where `iterateRangeReferences` only yields
/// references from the *top-level* (module/instance) scope: references to
/// names declared inside the reactive statement itself are block- or
/// function-scoped and therefore not yielded.
fn collect_local_decls(node: &Value, out: &mut HashSet<String>) {
    // We skip the LabeledStatement node itself (the reactive label `$:`) so we
    // don't accidentally treat the label `$` as a declaration. Only the body
    // subtree contains local declarations.
    let body = node.get("body");
    let Some(body) = body else { return };
    walk_js(body, |n, _| {
        let nt = node_type(n);
        if nt == Some("VariableDeclaration") {
            if let Some(declarators) = n.get("declarations").and_then(Value::as_array) {
                for d in declarators {
                    collect_pattern_idents(d.get("id"), out);
                }
            }
        } else if matches!(
            nt,
            Some("FunctionExpression" | "ArrowFunctionExpression" | "FunctionDeclaration")
        ) && let Some(params) = n.get("params").and_then(Value::as_array)
        {
            for p in params {
                collect_pattern_idents(Some(p), out);
            }
        }
    });
}

#[derive(Default)]
pub struct NoImmutableReactiveStatements;

impl ScriptRule for NoImmutableReactiveStatements {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        // Try to get full scope analysis. If it fails (e.g. constant_assignment
        // or constant_binding errors that the upstream ESLint scope manager
        // wouldn't reject), continue with empty binding maps — the write-only
        // LHS detection and the "unknown identifier → skip" guard ensure we
        // only report structurally obvious non-reactive statements.
        let analysis = crate::scope::analyze_scope(ctx.source());

        let (binding_names, mutable_bindings): (HashSet<&str>, HashSet<&str>) =
            if let Some(ref a) = analysis {
                let names = a.root.bindings.iter().map(|b| b.name.as_str()).collect();
                let mutable = a
                    .root
                    .bindings
                    .iter()
                    .filter(|b| b.reassigned || b.mutated)
                    .map(|b| b.name.as_str())
                    .collect();
                (names, mutable)
            } else {
                (HashSet::new(), HashSet::new())
            };

        let mut props: HashSet<String> = HashSet::new();
        collect_export_let_props(program, &mut props);
        let mutable_via_each = collect_mutable_via_each(ctx.source());
        let delete_mutated = collect_delete_mutated(program);
        let globals: HashSet<&str> = KNOWN_GLOBALS.iter().copied().collect();

        // Collect names implicitly declared by reactive assignment statements
        // (e.g. `$: foo = 1`, `$: ([...foo] = arr)`). These are reactive vars
        // that Svelte creates but that may not appear in `analyze_scope`'s
        // `binding_names` for destructuring patterns. We need them to correctly
        // classify write-only LHS identifiers as "known" so they're skipped
        // rather than triggering the "undeclared → should_skip" path.
        let mut reactive_decl_names: HashSet<String> = HashSet::new();
        collect_reactive_decl_names(program, &mut reactive_decl_names);

        let is_mutable = |name: &str| -> bool {
            props.contains(name)
                || mutable_bindings.contains(name)
                || mutable_via_each.contains(name)
                || delete_mutated.contains(name)
        };

        // A name is "known" when it appears in the component's top-level
        // bindings OR is implicitly declared by a reactive assignment statement.
        let is_known_name = |name: &str| -> bool {
            binding_names.contains(name) || reactive_decl_names.contains(name)
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

            // Report target: for `$: x = rhs` (operator `=`), report at `rhs`;
            // otherwise report at the statement body node.
            let (target_start, target_end) = if node_type(body) == Some("ExpressionStatement")
                && let Some(expr) = body.get("expression")
                && node_type(expr) == Some("AssignmentExpression")
                && expr.get("operator").and_then(Value::as_str) == Some("=")
            {
                let right = expr.get("right");
                let ts = right.and_then(|r| r.get("start")).and_then(Value::as_u64);
                let te = right.and_then(|r| r.get("end")).and_then(Value::as_u64);
                (ts, te)
            } else {
                (
                    body.get("start").and_then(Value::as_u64),
                    body.get("end").and_then(Value::as_u64),
                )
            };
            let (Some(ts), Some(te)) = (target_start, target_end) else {
                return;
            };

            // Pre-collect all write-only LHS spans from ALL `=` assignments
            // anywhere in this reactive statement (including those inside block
            // bodies). These are positions where KNOWN identifiers are in
            // write-only position (not reads) — they should not count as reactive
            // references. For UNKNOWN identifiers in write-only position, the
            // normal "undeclared → should_skip = true" path still applies.
            let mut write_only_lhs_spans: Vec<(u32, u32)> = Vec::new();
            collect_write_only_lhs_spans(node, &mut write_only_lhs_spans);

            // Pre-collect all names declared INSIDE the reactive statement body
            // (variable declarations and function params at any depth). These are
            // local bindings that shadow outer top-level variables with the same
            // name. References to such names within the reactive statement are NOT
            // references to the outer top-level binding and must be ignored.
            let mut local_decls: HashSet<String> = HashSet::new();
            collect_local_decls(node, &mut local_decls);

            // Walk the statement subtree, classifying each referenced identifier.
            let mut should_skip = false;
            walk_js(node, |inner, ancestors| {
                if should_skip || node_type(inner) != Some("Identifier") {
                    return;
                }
                let Some(parent) = ancestors.last() else {
                    return;
                };
                if is_ignored_position(inner, parent) {
                    return;
                }
                let Some(name) = inner.get("name").and_then(Value::as_str) else {
                    return;
                };

                // Identifiers that name a LOCAL declaration within this reactive
                // statement (a block-scoped variable or a function param) are not
                // references to the outer top-level binding — ignore them entirely.
                // This mirrors the upstream `iterateRangeReferences` which only
                // yields references from the top-level (module/instance) scope.
                if local_decls.contains(name) {
                    return;
                }

                let id_pos = inner.get("start").and_then(Value::as_u64).unwrap_or(0);
                let is_write_only = write_only_lhs_spans
                    .iter()
                    .any(|&(s, e)| u64::from(s) <= id_pos && id_pos < u64::from(e));

                if is_write_only {
                    if is_known_name(name) {
                        // Known variable in write-only position: this is a write
                        // target, not a read — skip it. The upstream's
                        // `reference.isWriteOnly() → continue` mirrors this.
                        return;
                    }
                    // Unknown variable in write-only position (e.g. `c` in
                    // `c = bar == null` where `c` is not declared). This is an
                    // unresolved "through" reference in the upstream model.
                    // `through.resolved == null → return` means don't report.
                    should_skip = true;
                    return;
                }

                // Not in write-only position: standard read-reference check.
                if name.starts_with("$$") {
                    should_skip = true; // builtin `$$` var
                } else if name.starts_with('$') {
                    should_skip = true; // reactive store reference → mutable
                } else if is_known_name(name) {
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
