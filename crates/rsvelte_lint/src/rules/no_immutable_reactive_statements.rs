//! `svelte/no-immutable-reactive-statements` — disallow a `$:` reactive
//! statement whose every referenced variable is immutable, because such a
//! statement never re-runs (it isn't actually reactive).
//!
//! Port of the eslint-plugin-svelte rule.
//!
//! Runs over the `<script>` `ESTree` program via the [`ScriptRule`] hook. A
//! variable is **mutable** when it is a prop (`export let`), a reactive store
//! reference (`$store`), reassigned, or mutated — and `analyze_scope` already
//! folds template-side writes (two-way `bind:`, `{#each}` context writes, member
//! writes inside event handlers) into the `reassigned` / `mutated` flags, so no
//! template walk is needed here. Each identifier is resolved through the script's
//! scopes: one that binds inside the statement shadows the outer name and is
//! ignored, and one that resolves nowhere is a builtin (`$$…`), a declared
//! global (harmless), or undeclared (→ not reported).
//!
//! `analyze_scope` propagates a single level of `{#each}` context write back to
//! the iterated source, but not through *nested* each-blocks, so the rule also
//! re-parses the template and recursively marks the base variable of any
//! each-expression whose context is written (a `bind:`, an assignment, or a
//! nested each whose own context is written) as mutable — matching upstream's
//! `hasWriteMember`/`hasWriteReference` recursion.

use std::collections::{HashMap, HashSet};

use rsvelte_core::compiler::ComponentAnalysis;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::reactive_stmt::{
    is_declared_global, is_reactive_statement, is_unmapped_placeholder, source_is_ts,
};
use crate::rules::store_refs::{RefTracker, module_tracker};
use crate::script::{ProgramView, ScriptKind, ScriptRule, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-immutable-reactive-statements",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: true,
    },
    type_aware: false,
    docs: "Disallow reactive statements that don't reference reactive values",
    options_schema: None,
};

/// The component's top-level binding names, across both `<script>` blocks.
/// Only consulted for identifiers the per-program resolver leaves unresolved.
fn root_binding_names(analysis: Option<&ComponentAnalysis>) -> HashSet<&str> {
    analysis.map_or_else(HashSet::new, |analysis| {
        analysis
            .root
            .bindings
            .iter()
            .map(|binding| binding.name.as_str())
            .collect()
    })
}

/// How a top-level name is declared, which decides whether a write to it can
/// make it mutable at all — upstream's per-`def` switch in `isMutableVariable`.
#[derive(Clone, Copy, PartialEq, Eq)]
enum DeclKind {
    /// `export let` / `export var` — a prop, mutable whatever else happens.
    Prop,
    /// An import binding, a `function` / `class` name, or a `const` bound to a
    /// function or a literal: never mutable, however it is written to.
    Immutable,
    /// Everything else: mutable exactly when something writes it.
    Writable,
}

/// Classify every name the program's top level declares.
fn collect_decl_kinds(program: &Value) -> HashMap<String, DeclKind> {
    let mut kinds = HashMap::new();
    let Some(body) = program.get("body").and_then(Value::as_array) else {
        return kinds;
    };
    for stmt in body {
        let exported = node_type(stmt) == Some("ExportNamedDeclaration");
        let decl = if exported {
            stmt.get("declaration").unwrap_or(&Value::Null)
        } else {
            stmt
        };
        match node_type(decl) {
            Some("ImportDeclaration") => {
                if let Some(specs) = decl.get("specifiers").and_then(Value::as_array) {
                    for spec in specs {
                        if let Some(local) = spec
                            .get("local")
                            .and_then(|l| l.get("name"))
                            .and_then(Value::as_str)
                        {
                            kinds.insert(local.to_string(), DeclKind::Immutable);
                        }
                    }
                }
            }
            Some("FunctionDeclaration" | "ClassDeclaration") => {
                if let Some(name) = decl
                    .get("id")
                    .and_then(|i| i.get("name"))
                    .and_then(Value::as_str)
                {
                    kinds.insert(name.to_string(), DeclKind::Immutable);
                }
            }
            Some("VariableDeclaration") => {
                let is_const = decl.get("kind").and_then(Value::as_str) == Some("const");
                let Some(declarators) = decl.get("declarations").and_then(Value::as_array) else {
                    continue;
                };
                for declarator in declarators {
                    let mut names = HashSet::new();
                    collect_pattern_idents(declarator.get("id"), &mut names);
                    let kind = if is_const {
                        if declarator.get("init").is_some_and(is_frozen_init) {
                            DeclKind::Immutable
                        } else {
                            DeclKind::Writable
                        }
                    } else if exported {
                        DeclKind::Prop
                    } else {
                        DeclKind::Writable
                    };
                    for name in names {
                        kinds.insert(name, kind);
                    }
                }
            }
            _ => {}
        }
    }
    kinds
}

/// A `const` initializer that fixes the binding's value for good.
fn is_frozen_init(init: &Value) -> bool {
    matches!(
        node_type(init),
        Some("FunctionExpression" | "ArrowFunctionExpression" | "Literal")
    )
}

fn json_offset(value: u64) -> Option<u32> {
    u32::try_from(value).ok()
}

const MESSAGE: &str = "This statement is not reactive because all variables referenced in the reactive statement are immutable.";

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
fn collect_mutable_via_each(ctx: &LintContext) -> HashSet<String> {
    let mut out = HashSet::new();
    let frag = ctx.template_fragment_json();
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

/// Whether two nodes are the same node (their spans coincide).
fn same_span(a: &Value, b: &Value) -> bool {
    let span = |n: &Value| (n.get("start").cloned(), n.get("end").cloned());
    span(a) == span(b)
}

/// Whether the identifier is a **write** to its variable: an assignment,
/// update or `for…of` target (through any destructuring pattern), a write to a
/// member path rooted at it, a `delete` of such a path, or a two-way `bind:`.
/// Mirrors upstream's `reference.isWrite()` plus `hasWriteMember`. A
/// declarator's own `id` is not a write here, matching upstream's exclusion of
/// references inside the definition's binding identifier.
fn is_write_reference(ident: &Value, ancestors: &[&Value]) -> bool {
    let mut node = ident;
    let mut depth = ancestors.len();
    // Climb the member path: `x` → `x.y` → `x.y.z`.
    while depth > 0 {
        let parent = ancestors[depth - 1];
        if node_type(parent) == Some("MemberExpression")
            && parent.get("object").is_some_and(|o| same_span(o, node))
        {
            node = parent;
            depth -= 1;
        } else {
            break;
        }
    }
    // Climb out of a destructuring pattern to its root.
    while depth > 0 {
        let parent = ancestors[depth - 1];
        let climbs = match node_type(parent) {
            Some("ArrayPattern") => true,
            Some("ObjectPattern") => true,
            Some("Property") => parent.get("value").is_some_and(|v| same_span(v, node)),
            Some("AssignmentPattern") => parent.get("left").is_some_and(|l| same_span(l, node)),
            Some("RestElement") => parent.get("argument").is_some_and(|a| same_span(a, node)),
            _ => false,
        };
        if !climbs {
            break;
        }
        node = parent;
        depth -= 1;
    }
    let Some(parent) = depth.checked_sub(1).map(|i| ancestors[i]) else {
        return false;
    };
    match node_type(parent) {
        Some("AssignmentExpression" | "ForInStatement" | "ForOfStatement") => {
            parent.get("left").is_some_and(|l| same_span(l, node))
        }
        Some("UpdateExpression") => parent.get("argument").is_some_and(|a| same_span(a, node)),
        Some("UnaryExpression") => {
            parent.get("operator").and_then(Value::as_str) == Some("delete")
                && parent.get("argument").is_some_and(|a| same_span(a, node))
        }
        Some("BindDirective") => parent.get("expression").is_some_and(|e| same_span(e, node)),
        _ => false,
    }
}

/// The top-level names something writes — upstream's `hasWrite`. Script
/// references are filtered through the resolver, so a same-named parameter,
/// block `let` or catch binding does not count as a write to the outer
/// variable; template references resolve by name, as they do upstream.
fn collect_written_names(
    tracker: &RefTracker<'_>,
    program: &ProgramView<'_>,
    fragment: &Value,
) -> HashSet<String> {
    let mut written = HashSet::new();
    program.walk(|node, ancestors| {
        if node_type(node) != Some("Identifier") {
            return;
        }
        let Some(name) = node.get("name").and_then(Value::as_str) else {
            return;
        };
        if tracker
            .find_variable(node)
            .is_some_and(|var| !tracker.is_root(var))
        {
            return;
        }
        if is_write_reference(node, ancestors) {
            written.insert(name.to_string());
        }
    });
    walk_js(fragment, |node, ancestors| {
        if node_type(node) != Some("Identifier") {
            return;
        }
        let Some(name) = node.get("name").and_then(Value::as_str) else {
            return;
        };
        if is_write_reference(node, ancestors) {
            written.insert(name.to_string());
        }
    });
    written
}

/// Whether `ident` (with its parent) sits in a position that is NOT a variable
/// read: a non-computed member `.property`, a non-computed/non-shorthand object
/// `key`, the `$` reactive label, the `const` of an `as const` assertion.
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
        // `x as const` parses as a `TSTypeReference` whose `typeName` is the
        // reserved word `const`; TypeScript's scope analysis creates no
        // reference for it, so upstream never sees an unresolved name here.
        Some("TSTypeReference") => ident.get("name").and_then(Value::as_str) == Some("const"),
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
            .and_then(json_offset);
        let end = left
            .and_then(|l| l.get("end"))
            .and_then(Value::as_u64)
            .and_then(json_offset);
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
/// rather than triggering the "undeclared → `should_skip`" path.
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

#[derive(Default)]
pub struct NoImmutableReactiveStatements;

impl ScriptRule for NoImmutableReactiveStatements {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        // The scope analysis only supplies the *other* `<script>`'s top-level
        // names; it can fail (e.g. on a component the Svelte compiler rejects)
        // and the rule still works, because everything else is resolved here.
        let analysis = ctx.scope_analysis();
        let binding_names = root_binding_names(analysis.as_deref());

        // Upstream yields only references that resolve into the top-level scope,
        // so an identifier that resolves to a binding declared *inside* the
        // reactive statement (a `const`, a parameter, a catch binding) is not a
        // reference to the same-named outer variable and must not stand in for
        // it. Only a resolver can tell those apart.
        let tracker = module_tracker(
            ctx.source(),
            program.value(),
            source_is_ts(ctx.source(), ctx.filename()),
        );
        let fragment = ctx.template_fragment_json();
        let decl_kinds = collect_decl_kinds(program.value());
        let written = collect_written_names(&tracker, program, &fragment);
        // `analyze_scope` propagates one level of `{#each}` context write back to
        // the iterated source but not through nested each-blocks, so the rule
        // recovers those itself.
        let mutable_via_each = collect_mutable_via_each(ctx);

        // Names implicitly declared by a top-level reactive assignment
        // (`$: foo = 1`, `$: ([...foo] = arr)`). Svelte creates these as
        // reactive bindings; no resolver sees them, so they are collected here.
        let mut reactive_decl_names: HashSet<String> = HashSet::new();
        collect_reactive_decl_names(program.value(), &mut reactive_decl_names);

        let is_mutable = |name: &str| -> bool {
            // A name whose definition is a `$: name = …` assignment is a
            // reactive value, which upstream classes as mutable outright.
            if reactive_decl_names.contains(name) {
                return true;
            }
            match decl_kinds.get(name) {
                Some(DeclKind::Prop) => true,
                Some(DeclKind::Immutable) => false,
                Some(DeclKind::Writable) | None => {
                    written.contains(name) || mutable_via_each.contains(name)
                }
            }
        };

        // A name is "known" when it appears in the component's top-level
        // bindings OR is implicitly declared by a reactive assignment statement.
        // Consulted only for identifiers the resolver leaves unresolved — a name
        // declared in the *other* `<script>` is one, since each program is
        // resolved on its own.
        let is_known_name = |name: &str| -> bool {
            binding_names.contains(name) || reactive_decl_names.contains(name)
        };

        let mut reports: Vec<(u32, u32)> = Vec::new();
        program.walk(|node, ancestors| {
            if !is_reactive_statement(node, ancestors) {
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
                // A serializer placeholder (a `BigInt` literal, say) is not a
                // variable reference at all; reading it as an undeclared name
                // silences the whole statement.
                if is_unmapped_placeholder(ctx.source(), inner) {
                    return;
                }
                let Some(name) = inner.get("name").and_then(Value::as_str) else {
                    return;
                };

                // A reference that resolves to a binding declared inside the
                // statement shadows the outer name: upstream never yields it.
                let resolved = tracker.find_variable(inner);
                if resolved.is_some_and(|var| !tracker.is_root(var)) {
                    return;
                }
                let is_toplevel = resolved.is_some() || is_known_name(name);

                let id_pos = inner.get("start").and_then(Value::as_u64).unwrap_or(0);
                let is_write_only = write_only_lhs_spans
                    .iter()
                    .any(|&(s, e)| u64::from(s) <= id_pos && id_pos < u64::from(e));

                if is_write_only {
                    if is_toplevel {
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
                } else if is_toplevel {
                    if is_mutable(name) {
                        should_skip = true;
                    }
                } else if !is_declared_global(name) {
                    should_skip = true; // undeclared / unresolved
                }
            });

            if !should_skip && let (Some(ts), Some(te)) = (json_offset(ts), json_offset(te)) {
                reports.push((ts, te));
            }
        });

        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}
