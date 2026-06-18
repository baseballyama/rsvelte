//! `svelte/prefer-const` — suggest `const` for a `let` binding that is never
//! reassigned. Port of the core ESLint `prefer-const` rule's behaviour exercised
//! by the eslint-plugin-svelte fixtures, plus the plugin's `excludedRunes`
//! option (a `let` initialised by an excluded rune call — `$props()` /
//! `$derived(...)` by default — is left alone, since those require `let`).
//!
//! Implemented as a script-AST rule: the `<script>` ESTree program gives the
//! real initializer (so `excludedRunes` is detected from the actual `$props` /
//! `$derived` callee, not the rune-stripped binding value) and the declaration
//! identifier positions; reassignment comes from the analyzed scope
//! ([`analyze_scope`](crate::scope::analyze_scope)).

use std::collections::HashSet;

use serde_json::Value;

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::ast::template::{DeclarationTag, Fragment, Root, TemplateNode};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/prefer-const",
    category: RuleCategory::Style,
    fixable: Fixable::Code,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Suggest `const` for never-reassigned `let` bindings",
    options_schema: Some(
        r#"{ "type": "object", "properties": {
            "destructuring": { "enum": ["any", "all"] },
            "ignoreReadBeforeAssign": { "type": "boolean" },
            "excludedRunes": { "type": "array", "items": { "type": "string" } }
        }, "additionalProperties": true }"#,
    ),
};

fn ident_name(node: &Value) -> Option<&str> {
    if node_type(node) == Some("Identifier") {
        node.get("name").and_then(Value::as_str)
    } else {
        None
    }
}

/// The callee identifier name of an init expression that is a rune call:
/// `$props()` → `$props`, `$derived.by(...)` → `$derived` (member object).
fn init_rune_callee(init: &Value) -> Option<&str> {
    if node_type(init) != Some("CallExpression") {
        return None;
    }
    let callee = init.get("callee")?;
    match node_type(callee) {
        Some("Identifier") => ident_name(callee),
        Some("MemberExpression") => callee.get("object").and_then(ident_name),
        _ => None,
    }
}

/// Walk a serialized template fragment and record every binding name that is
/// the target of an assignment (`x = …`, `x += …`) or update (`x++`) whose
/// left-hand side is a plain `Identifier`. Member/element targets (`x.y = …`)
/// are mutations, not reassignments, so they are ignored — matching the core
/// `prefer-const` rule, which only bails on a write reference to the binding
/// itself. Used to cover template positions the compiler scope walk skips
/// (e.g. `{@render}` arguments).
fn collect_template_reassignments(source: &str, out: &mut HashSet<String>) {
    // Re-parse (cheap; the analyzed `ComponentAnalysis` keeps only the scope
    // tree, not the template AST) and serialize the template fragment so the
    // assignment walk runs over the ESTree expressions inside every tag. The
    // fragment's JS expressions live in the parse arena, which must be installed
    // for the duration of the serialize.
    use rsvelte_core::ast::arena::with_serialize_arena;
    let Ok(root) = rsvelte_core::parse(source, rsvelte_core::ParseOptions::default()) else {
        return;
    };
    let Some(value) =
        with_serialize_arena(&root.arena, || serde_json::to_value(&root.fragment).ok())
    else {
        return;
    };
    walk_assignments(&value, out);
}

/// Add names that are declared by more than one `let`/`var`/`const` declarator
/// in `program` (a redeclaration), which the core `prefer-const` rule treats as
/// having multiple writes. Used only on the parse-only fallback path.
fn add_redeclared_names(program: &Value, out: &mut HashSet<String>) {
    let mut counts: std::collections::HashMap<String, u32> = std::collections::HashMap::new();
    walk_js(program, |node, _| {
        if node_type(node) != Some("VariableDeclaration") {
            return;
        }
        let Some(decls) = node.get("declarations").and_then(Value::as_array) else {
            return;
        };
        for d in decls {
            let mut ids = Vec::new();
            if let Some(id) = d.get("id") {
                collect_pattern_idents(id, &mut ids);
            }
            for id in ids {
                if let Some(name) = ident_name(id) {
                    *counts.entry(name.to_string()).or_insert(0) += 1;
                }
            }
        }
    });
    for (name, count) in counts {
        if count > 1 {
            out.insert(name);
        }
    }
}

fn walk_assignments(value: &Value, out: &mut HashSet<String>) {
    match value {
        Value::Object(map) => {
            match map.get("type").and_then(Value::as_str) {
                Some("AssignmentExpression") => {
                    // `x = …` / `x += …` and destructuring `[x] = …` / `({x} =
                    // …)` reassign their bound identifiers. A member/element
                    // target (`x.y = …`) is a mutation, not a reassignment, so
                    // `collect_pattern_idents` (which descends only patterns,
                    // not MemberExpression) naturally skips it.
                    if let Some(left) = map.get("left") {
                        let mut ids = Vec::new();
                        collect_pattern_idents(left, &mut ids);
                        for id in ids {
                            if let Some(name) = ident_name(id) {
                                out.insert(name.to_string());
                            }
                        }
                    }
                }
                Some("UpdateExpression") => {
                    if let Some(name) = map
                        .get("argument")
                        .filter(|a| node_type(a) == Some("Identifier"))
                        .and_then(ident_name)
                    {
                        out.insert(name.to_string());
                    }
                }
                // A two-way binding `bind:value={x}` / `bind:x` reassigns its
                // bound variable; svelte-eslint-parser records a write reference
                // for it, so the core rule treats it as not-const-able. The
                // bound target is the directive's `expression` (an Identifier,
                // or a MemberExpression for `bind:value={obj.x}` — a mutation,
                // which `collect_pattern_idents` skips).
                Some("BindDirective") => {
                    if let Some(expr) = map.get("expression") {
                        let mut ids = Vec::new();
                        collect_pattern_idents(expr, &mut ids);
                        for id in ids {
                            if let Some(name) = ident_name(id) {
                                out.insert(name.to_string());
                            }
                        }
                    }
                }
                // `for (x of …)` / `for (x in …)` where the left-hand side is
                // a bare pattern (not a `VariableDeclaration`) reassigns the
                // binding. Mirror what svelte-eslint-parser's scope analysis
                // records as a write reference for the loop variable.
                Some("ForOfStatement") | Some("ForInStatement") => {
                    if let Some(left) = map.get("left")
                        && node_type(left) != Some("VariableDeclaration")
                    {
                        let mut ids = Vec::new();
                        collect_pattern_idents(left, &mut ids);
                        for id in ids {
                            if let Some(name) = ident_name(id) {
                                out.insert(name.to_string());
                            }
                        }
                    }
                }
                _ => {}
            }
            for child in map.values() {
                walk_assignments(child, out);
            }
        }
        Value::Array(items) => {
            for item in items {
                walk_assignments(item, out);
            }
        }
        _ => {}
    }
}

/// Collect the bound Identifier leaves of a declarator `id` pattern.
fn collect_pattern_idents<'a>(id: &'a Value, out: &mut Vec<&'a Value>) {
    match node_type(id) {
        Some("Identifier") => out.push(id),
        Some("ObjectPattern") => {
            if let Some(props) = id.get("properties").and_then(Value::as_array) {
                for p in props {
                    match node_type(p) {
                        // `{ a }` / `{ a: b }` → the value is the binding.
                        Some("Property") => {
                            if let Some(v) = p.get("value") {
                                collect_pattern_idents(v, out);
                            }
                        }
                        // `{ ...rest }`
                        Some("RestElement") => {
                            if let Some(arg) = p.get("argument") {
                                collect_pattern_idents(arg, out);
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(els) = id.get("elements").and_then(Value::as_array) {
                for e in els.iter().filter(|e| !e.is_null()) {
                    collect_pattern_idents(e, out);
                }
            }
        }
        // `let a = 1` default in a pattern: `{ a = 1 }` → left is the binding.
        Some("AssignmentPattern") => {
            if let Some(left) = id.get("left") {
                collect_pattern_idents(left, out);
            }
        }
        Some("RestElement") => {
            if let Some(arg) = id.get("argument") {
                collect_pattern_idents(arg, out);
            }
        }
        _ => {}
    }
}

/// Scan the parsed script `program` for `for (x of …)` / `for (x in …)`
/// statements where the left-hand side is a bare pattern (not a
/// `VariableDeclaration`). Such loops reassign their binding, but the rsvelte
/// scope builder does not currently mark those bindings as `reassigned` in the
/// `analyze_scope` path. Call this after populating `reassigned` from either
/// path to close the gap.
/// Walk a template `Fragment` and collect all `DeclarationTag` nodes.
fn collect_declaration_tags<'a>(fragment: &'a Fragment, out: &mut Vec<&'a DeclarationTag>) {
    for node in &fragment.nodes {
        walk_template_node_for_decl_tags(node, out);
    }
}

fn walk_template_node_for_decl_tags<'a>(node: &'a TemplateNode, out: &mut Vec<&'a DeclarationTag>) {
    match node {
        TemplateNode::DeclarationTag(tag) => {
            out.push(tag);
        }
        TemplateNode::IfBlock(b) => {
            collect_declaration_tags(&b.consequent, out);
            if let Some(alt) = &b.alternate {
                collect_declaration_tags(alt, out);
            }
        }
        TemplateNode::EachBlock(b) => {
            collect_declaration_tags(&b.body, out);
            if let Some(fb) = &b.fallback {
                collect_declaration_tags(fb, out);
            }
        }
        TemplateNode::AwaitBlock(b) => {
            if let Some(f) = &b.pending {
                collect_declaration_tags(f, out);
            }
            if let Some(f) = &b.then {
                collect_declaration_tags(f, out);
            }
            if let Some(f) = &b.catch {
                collect_declaration_tags(f, out);
            }
        }
        TemplateNode::KeyBlock(b) => {
            collect_declaration_tags(&b.fragment, out);
        }
        TemplateNode::SnippetBlock(b) => {
            collect_declaration_tags(&b.body, out);
        }
        _ => {}
    }
}

/// Report `{let x = …}` declaration tags in the template whose binding is
/// never reassigned — mirrors what the oracle's ESLint core `prefer-const`
/// rule does for `VariableDeclaration { kind: "let" }` nodes in the ESTree.
///
/// Returns a list of `(start, end, name, fix_start_opt)` tuples.
fn check_template_declaration_tags(
    source: &str,
    reassigned: &HashSet<String>,
    destructuring_all: bool,
) -> Vec<(u32, u32, String, Option<u32>)> {
    // Parse in lenient (lint) mode — `{let …}` declaration tags are a loose
    // Svelte construct that the strict compiler parse rejects, so a strict parse
    // here drops every template `{let x = …}` (a silent FN; the oracle reports
    // them). Mirror the engine's lenient parse.
    let Ok(root) = rsvelte_core::parse(
        source,
        rsvelte_core::ParseOptions {
            lenient_script: true,
            ..Default::default()
        },
    ) else {
        return Vec::new();
    };
    let mut tags: Vec<&DeclarationTag> = Vec::new();
    with_serialize_arena(&root.arena, || {
        collect_declaration_tags(&root.fragment, &mut tags);
    });

    let mut reports = Vec::new();
    for tag in &tags {
        // Serialize the declaration expression to JSON so we can inspect its
        // `kind`, `declarations`, and identifier positions.
        let decl_json: Option<Value> =
            with_serialize_arena(&root.arena, || serde_json::to_value(&tag.declaration).ok());
        let Some(decl_json) = decl_json else {
            continue;
        };
        // Only `let` declarations fire prefer-const.
        if decl_json.get("kind").and_then(Value::as_str) != Some("let") {
            continue;
        }
        let Some(declarators) = decl_json.get("declarations").and_then(Value::as_array) else {
            continue;
        };

        let mut decl_idents: Vec<(u32, u32, String)> = Vec::new(); // (start, end, name)
        let mut all_const_able = true;
        let mut every_declarator_has_init = true;

        for d in declarators {
            let has_init = d.get("init").is_some_and(|i| !i.is_null());
            if !has_init {
                every_declarator_has_init = false;
            }
            let mut ids = Vec::new();
            if let Some(id) = d.get("id") {
                collect_pattern_idents(id, &mut ids);
            }
            for id in ids {
                let name = ident_name(id).unwrap_or("").to_string();
                let is_reassigned = reassigned.contains(&name);
                if has_init && !is_reassigned {
                    let start = node_start(id);
                    let end = id.get("end").and_then(Value::as_u64).map(|e| e as u32);
                    if let (Some(s), Some(e)) = (start, end) {
                        decl_idents.push((s, e, name));
                    }
                } else {
                    all_const_able = false;
                }
            }
        }
        if decl_idents.is_empty() {
            continue;
        }
        if destructuring_all && !all_const_able {
            continue;
        }
        let fixable = every_declarator_has_init && all_const_able;
        // The `let` keyword position within the tag: scan forward from tag.start
        // for the first `l` that starts `let`.
        let fix_start = if fixable {
            // Find the `let` keyword start by scanning from tag.start.
            let src_bytes = source.as_bytes();
            let mut pos = tag.start as usize;
            let end = (tag.end as usize).min(src_bytes.len());
            loop {
                if pos + 3 > end {
                    break None;
                }
                if &src_bytes[pos..pos + 3] == b"let" {
                    break Some(pos as u32);
                }
                pos += 1;
            }
        } else {
            None
        };
        for (s, e, name) in decl_idents {
            reports.push((
                s,
                e,
                format!("'{name}' is never reassigned. Use 'const' instead."),
                fix_start,
            ));
        }
    }
    reports
}

fn collect_forin_forof_reassignments(program: &Value, out: &mut HashSet<String>) {
    walk_js(program, |node, _| {
        let ty = node_type(node);
        if !matches!(ty, Some("ForOfStatement") | Some("ForInStatement")) {
            return;
        }
        if let Some(left) = node.get("left") {
            // Only bare patterns — skip `for (const/let/var x of …)`.
            if node_type(left) == Some("VariableDeclaration") {
                return;
            }
            let mut ids = Vec::new();
            collect_pattern_idents(left, &mut ids);
            for id in ids {
                if let Some(name) = ident_name(id) {
                    out.insert(name.to_string());
                }
            }
        }
    });
}

/// Whether the LHS of an `AssignmentExpression` is a destructuring pattern
/// (`ObjectPattern` or `ArrayPattern`), possibly nested inside a parenthesised
/// expression — i.e. `({ a } = rhs)`.
fn lhs_is_destructuring(left: &Value) -> bool {
    matches!(
        node_type(left),
        Some("ObjectPattern") | Some("ArrayPattern")
    )
}

/// The span `(start, end)` of the nearest enclosing function (declaration,
/// expression, or arrow). `None` ⇒ the node is at the top (module) level. Used
/// as a coarse lexical-scope key: ESLint's scope-aware `prefer-const` only
/// `const`-ifies a `let` whose single assignment shares its function scope.
type FnScope = Option<(u32, u32)>;

/// The nearest enclosing-function span for the node whose ancestor chain is
/// `ancestors` (closest function ancestor wins). `None` for the top level.
fn enclosing_fn_span(ancestors: &[&Value]) -> FnScope {
    for node in ancestors.iter().rev() {
        if matches!(
            node_type(node),
            Some("FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression")
        ) {
            let s = node_start(node)?;
            let e = node.get("end").and_then(Value::as_u64)? as u32;
            return Some((s, e));
        }
    }
    None
}

/// Per-variable assignment summary used for the no-init-let destructuring check.
#[derive(Default)]
struct AssignInfo {
    /// Total number of times this name appears as an assignment target anywhere
    /// in the program (via `AssignmentExpression` or `UpdateExpression`;
    /// for-of/for-in are handled separately). Counting program-wide (by name) is
    /// deliberately conservative: a same-named write in ANY scope — including a
    /// closure over an outer binding — pushes `total` above 1 and suppresses the
    /// report (a false negative, never a false positive).
    total: u32,
    /// Number of those assignments whose top-level LHS is an `ObjectPattern`
    /// or `ArrayPattern` (i.e. a destructuring assignment).
    destructuring: u32,
    /// The first destructuring assignment's `((id_start, id_end), fn_scope)`:
    /// the byte offsets of the bound identifier inside the LHS pattern (the
    /// report location, matching ESLint), plus the enclosing-function scope of
    /// that assignment (so we only report when it matches the declaration's).
    first_destructuring: Option<((u32, u32), FnScope)>,
}

/// Walk `program` and collect, per identifier name, how many times it is the
/// target of an `AssignmentExpression` and how many of those are destructuring.
/// `UpdateExpression` increments `total` (not destructuring) so the name is
/// excluded from the single-destructuring-assignment fast path.
fn collect_assignment_info(program: &Value) -> std::collections::HashMap<String, AssignInfo> {
    let mut map: std::collections::HashMap<String, AssignInfo> = std::collections::HashMap::new();
    walk_js(program, |node, ancestors| match node_type(node) {
        Some("AssignmentExpression") => {
            let Some(left) = node.get("left") else {
                return;
            };
            let is_destructuring = lhs_is_destructuring(left);
            let mut ids = Vec::new();
            collect_pattern_idents(left, &mut ids);
            for id in ids {
                if let Some(name) = ident_name(id) {
                    let entry = map.entry(name.to_string()).or_default();
                    entry.total += 1;
                    if is_destructuring {
                        entry.destructuring += 1;
                        // Record the first destructuring position + its enclosing
                        // function scope (the ids are children of this assignment,
                        // so they share its scope) for the report + scope check.
                        if entry.first_destructuring.is_none()
                            && let (Some(s), Some(e)) = (
                                node_start(id),
                                id.get("end").and_then(Value::as_u64).map(|e| e as u32),
                            )
                        {
                            entry.first_destructuring =
                                Some(((s, e), enclosing_fn_span(ancestors)));
                        }
                    }
                }
            }
        }
        Some("UpdateExpression") => {
            if let Some(name) = node
                .get("argument")
                .filter(|a| node_type(a) == Some("Identifier"))
                .and_then(ident_name)
            {
                map.entry(name.to_string()).or_default().total += 1;
            }
        }
        _ => {}
    });
    map
}

/// Collect `(name, id_node)` for every `let` declarator with NO initializer
/// in `program`.  `export let` in an instance script is excluded (handled by
/// `kind` at the call site; pass `is_instance` accordingly).
fn collect_no_init_let_idents<'a>(
    program: &'a Value,
    is_instance: bool,
    excluded_runes: &[String],
    out: &mut Vec<(String, &'a Value, FnScope)>,
) {
    walk_js(program, |node, ancestors| {
        if node_type(node) != Some("VariableDeclaration")
            || node.get("kind").and_then(Value::as_str) != Some("let")
        {
            return;
        }
        // Skip `export let` in instance scripts.
        if is_instance
            && ancestors.last().and_then(|p| node_type(p)) == Some("ExportNamedDeclaration")
        {
            return;
        }
        // The declaration's enclosing function scope — the assignment must share
        // it for the binding to be `const`-ifiable (ESLint is scope-aware).
        let decl_scope = enclosing_fn_span(ancestors);
        let Some(declarators) = node.get("declarations").and_then(Value::as_array) else {
            return;
        };
        // Skip declarations that contain an excluded-rune init.
        let skip = declarators.iter().any(|d| {
            d.get("init")
                .filter(|i| !i.is_null())
                .and_then(init_rune_callee)
                .is_some_and(|c| excluded_runes.iter().any(|e| e == c))
        });
        if skip {
            return;
        }
        for d in declarators {
            let has_init = d.get("init").is_some_and(|i| !i.is_null());
            if has_init {
                continue; // only care about no-init declarators
            }
            let Some(id) = d.get("id") else {
                continue;
            };
            // Only bare-identifier no-init declarators: `let a;` (not patterns).
            // ESLint does not report `let [a]; [a] = rhs` — it only reports the
            // separate-declaration destructuring-assignment pattern where the
            // declaration is a plain identifier.
            if node_type(id) != Some("Identifier") {
                continue;
            }
            if let Some(name) = ident_name(id) {
                out.push((name.to_string(), id, decl_scope));
            }
        }
    });
}

#[derive(Default)]
pub struct PreferConst;

impl ScriptRule for PreferConst {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, kind: ScriptKind) {
        // Reassignment info from the analyzed scope (reliable per the R9 audit).
        // `analyze_scope` runs the full Phase-2 analysis, which returns `Err`
        // (→ `None`) when the component has *any* analysis/validation error
        // (e.g. an `animate:` directive outside a keyed `{#each}`). The oracle's
        // svelte-eslint-parser only parses, so it still lints such a file; to
        // match, fall back to a parse-only assignment scan of the script +
        // template when the analysis is unavailable.
        let mut reassigned: HashSet<String> = match crate::scope::analyze_scope(ctx.source()) {
            Some(analysis) => analysis
                .root
                .bindings
                .iter()
                .filter(|b| b.reassigned)
                .map(|b| b.name.clone())
                .collect(),
            None => {
                let mut s = HashSet::new();
                walk_assignments(program, &mut s);
                // A name declared by more than one declarator (`let x; let x`)
                // has multiple write references in the svelte-eslint-parser
                // scope, so the core rule never converts it to `const`. The
                // accurate analysis path knows this; the parse-only fallback
                // must detect the redeclaration explicitly.
                add_redeclared_names(program, &mut s);
                s
            }
        };
        // The compiler's scope walk (`scope_builder::visit_node`) does not visit
        // a few template expression positions — notably `{@render fn(…)}`
        // arguments — so a reassignment buried in one (`{@render pill(() =>
        // (filter = 'all'))}`) never sets `binding.reassigned`, and the binding
        // would be mis-reported as const-able. svelte-eslint-parser walks the
        // whole AST, so the core rule sees the write. Recover parity by scanning
        // the template for `name = …` / `name++` whose LHS is a plain
        // identifier, and folding those names into the not-const-able set.
        // Template reassignments (`name = …` / `name++` inside `{…}`) — computed
        // ONCE here and reused below for the no-init-let check, avoiding a second
        // re-parse of the source.
        let mut template_reassign: HashSet<String> = HashSet::new();
        collect_template_reassignments(ctx.source(), &mut template_reassign);
        reassigned.extend(template_reassign.iter().cloned());
        // `for (x of …)` / `for (x in …)` with a bare pattern (not
        // `VariableDeclaration`) reassign the binding. The rsvelte scope builder
        // does not mark those as `reassigned`; close the gap by scanning the
        // script program directly.
        collect_forin_forof_reassignments(program, &mut reassigned);
        // The `analyze_scope` path only provides ROOT-scope bindings. Inner-scope
        // bindings (e.g., `let p = 0` inside a for-loop inside a callback) are
        // not in `root.bindings`, so their reassignment (`p += 4`) is not in the
        // `reassigned` set. The `check_program` walk finds them as `let`
        // declarations and incorrectly flags them. Close the gap by also scanning
        // the script for any assignment expressions (supplementary pass; only adds
        // to the set, never removes).
        walk_assignments(program, &mut reassigned);

        let opts = ctx.option0();
        let excluded: Vec<String> = opts
            .and_then(|o| o.get("excludedRunes"))
            .and_then(Value::as_array)
            .map(|a| {
                a.iter()
                    .filter_map(|v| v.as_str().map(str::to_string))
                    .collect()
            })
            .unwrap_or_else(|| vec!["$props".to_string(), "$derived".to_string()]);
        let destructuring_all = opts
            .and_then(|o| o.get("destructuring"))
            .and_then(Value::as_str)
            == Some("all");

        let mut reports: Vec<(u32, u32, String, Option<u32>)> = Vec::new();
        walk_js(program, |node, ancestors| {
            if node_type(node) != Some("VariableDeclaration")
                || node.get("kind").and_then(Value::as_str) != Some("let")
            {
                return;
            }

            // Legacy component props (`export let x`) are never converted to
            // `const`: svelte-eslint-parser records a synthetic write reference
            // for the parent-set value, so the core `prefer-const` rule skips
            // them. Mirror that by skipping a `let` declaration whose immediate
            // parent is an `ExportNamedDeclaration` in the **instance** script
            // (in a `<script module>` block, or runes `$props()` destructuring,
            // the same shape isn't a prop — those stay subject to the rule via
            // `excludedRunes`).
            if kind == ScriptKind::Instance
                && ancestors.last().and_then(|p| node_type(p)) == Some("ExportNamedDeclaration")
            {
                return;
            }
            let Some(declarators) = node.get("declarations").and_then(Value::as_array) else {
                return;
            };

            // `excludedRunes`: skip the whole declaration if any declarator's
            // init is a call to an excluded rune.
            let skip = declarators.iter().any(|d| {
                d.get("init")
                    .filter(|i| !i.is_null())
                    .and_then(init_rune_callee)
                    .is_some_and(|c| excluded.iter().any(|e| e == c))
            });
            if skip {
                return;
            }

            // Per-declarator bound identifiers that are const-able (init present,
            // never reassigned).
            let mut decl_idents: Vec<&Value> = Vec::new(); // const-able to report
            let mut all_const_able = true; // every bound id (with init) is const-able
            let mut every_declarator_has_init = true;
            for d in declarators {
                let has_init = d.get("init").is_some_and(|i| !i.is_null());
                if !has_init {
                    every_declarator_has_init = false;
                }
                let mut ids = Vec::new();
                if let Some(id) = d.get("id") {
                    collect_pattern_idents(id, &mut ids);
                }
                for id in ids {
                    let name = ident_name(id).unwrap_or("");
                    let is_reassigned = reassigned.contains(name);
                    if has_init && !is_reassigned {
                        decl_idents.push(id);
                    } else {
                        all_const_able = false;
                    }
                }
            }
            if decl_idents.is_empty() {
                return;
            }

            // The whole declaration can be auto-fixed to `const` only when every
            // declarator has an init and every bound id is const-able.
            let fixable = every_declarator_has_init && all_const_able;
            // `destructuring: "all"` only reports when the whole declaration is
            // const-able (default "any" reports each const-able id).
            if destructuring_all && !all_const_able {
                return;
            }
            let fix_start = if fixable { node_start(node) } else { None };

            for id in decl_idents {
                if let (Some(s), Some(e)) = (node_start(id), id.get("end").and_then(Value::as_u64))
                {
                    let name = ident_name(id).unwrap_or("");
                    reports.push((
                        s,
                        e as u32,
                        format!("'{name}' is never reassigned. Use 'const' instead."),
                        fix_start,
                    ));
                }
            }
        });

        // Also check template `{let x = …}` declaration tags. The oracle's
        // ESLint core `prefer-const` treats them as ordinary `let` declarations
        // in the ESTree, so we replicate that by checking the template separately.
        // Only run for the instance script (or when there's no instance script)
        // to avoid double-reporting when both instance and module scripts exist.
        if kind == ScriptKind::Instance {
            let tag_reports =
                check_template_declaration_tags(ctx.source(), &reassigned, destructuring_all);
            reports.extend(tag_reports);
        }

        // Extra check: `let a; ({ …a… } = rhs)` — a `let` binding with NO
        // initializer that is assigned EXACTLY ONCE via a destructuring
        // `AssignmentExpression` (LHS is ObjectPattern/ArrayPattern), and never
        // otherwise reassigned/updated. ESLint core `prefer-const` reports this
        // case ("use `const` in the destructuring assignment instead"), but only
        // for the destructuring-assignment pattern — a plain `let a; a = 1` is
        // NOT reported.
        //
        // We must NOT add a fix here because the suggested fix ("use `const`
        // in the destructuring assignment") rewrites the call site, not the
        // `let` declaration; generating the right autofix would be complex.
        {
            // Collect "hard" reassigned names that disqualify the no-init path:
            // template writes, for-of/for-in bare patterns, update expressions,
            // bind directives, and plain (non-destructuring) assignments.
            // We re-use `reassigned` but need to also know which names were
            // assigned ONLY through destructuring patterns.
            let assign_info = collect_assignment_info(program);

            // Names also written via the template or a for-of/for-in bare pattern
            // — reuse the already-computed `template_reassign` (no re-parse) and
            // add for-of/for-in (a `program` JSON walk, no parse).
            let mut template_and_forin: HashSet<String> = template_reassign;
            collect_forin_forof_reassignments(program, &mut template_and_forin);

            let mut no_init_lets: Vec<(String, &Value, FnScope)> = Vec::new();
            collect_no_init_let_idents(
                program,
                kind == ScriptKind::Instance,
                &excluded,
                &mut no_init_lets,
            );

            for (name, _id_node, decl_scope) in &no_init_lets {
                // If the template or a for-of/for-in also writes this name, skip.
                if template_and_forin.contains(name.as_str()) {
                    continue;
                }
                if let Some(info) = assign_info.get(name.as_str()) {
                    // Exactly one assignment program-wide, and it is destructuring
                    // (`total == destructuring == 1`), AND that assignment shares
                    // the declaration's function scope. The scope check prevents a
                    // false positive when a `let a;` is assigned via destructuring
                    // in a DIFFERENT (e.g. nested) function — ESLint's scope-aware
                    // rule cannot `const` that and stays silent.
                    if info.total == 1
                        && info.destructuring == 1
                        && let Some((pos, assign_scope)) = info.first_destructuring
                        && assign_scope == *decl_scope
                    {
                        reports.push((
                            pos.0,
                            pos.1,
                            format!("'{name}' is never reassigned. Use 'const' instead."),
                            None,
                        ));
                    }
                }
            }
        }

        for (start, end, msg, fix_start) in reports {
            match fix_start {
                Some(decl_start) => ctx.report_with_fix(
                    start,
                    end,
                    msg,
                    Fix {
                        message: "Use `const` instead.".to_string(),
                        edits: vec![TextEdit {
                            start: decl_start,
                            end: decl_start + 3, // the `let` keyword
                            new_text: "const".to_string(),
                        }],
                    },
                ),
                None => ctx.report(start, end, msg),
            }
        }
    }
}

/// `Rule` implementation for `PreferConst` — handles template-only files (no
/// `<script>` block) where `ScriptRule::check_program` never fires. When the
/// root HAS a script block, the `check_program` path already covers the template
/// declaration tags, so `check_root` is a no-op in that case.
impl Rule for PreferConst {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        // The template `{let …}` declaration-tag check lives in `check_program`,
        // but ONLY for the instance script (`kind == Instance`). So `check_root`
        // must handle the tags whenever there is NO instance script — i.e. a
        // module-only component or a script-less file. (Guarding on
        // `root.module.is_some()` too would wrongly skip module-only files.)
        if root.instance.is_some() {
            return;
        }
        let opts = ctx.option0();
        let destructuring_all = opts
            .and_then(|o| o.get("destructuring"))
            .and_then(Value::as_str)
            == Some("all");

        // Build the reassigned set from the template itself.
        let mut reassigned: HashSet<String> = HashSet::new();
        collect_template_reassignments(ctx.source(), &mut reassigned);

        let tag_reports =
            check_template_declaration_tags(ctx.source(), &reassigned, destructuring_all);
        for (start, end, msg, fix_start) in tag_reports {
            match fix_start {
                Some(decl_start) => ctx.report_with_fix(
                    start,
                    end,
                    msg,
                    Fix {
                        message: "Use `const` instead.".to_string(),
                        edits: vec![TextEdit {
                            start: decl_start,
                            end: decl_start + 3,
                            new_text: "const".to_string(),
                        }],
                    },
                ),
                None => ctx.report(start, end, msg),
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn rune_callee_detection() {
        let props = json!({ "type": "CallExpression", "callee": { "type": "Identifier", "name": "$props" } });
        assert_eq!(init_rune_callee(&props), Some("$props"));
        let derived_by = json!({ "type": "CallExpression", "callee": { "type": "MemberExpression", "object": { "type": "Identifier", "name": "$derived" }, "property": { "type": "Identifier", "name": "by" } } });
        assert_eq!(init_rune_callee(&derived_by), Some("$derived"));
        let plain =
            json!({ "type": "CallExpression", "callee": { "type": "Identifier", "name": "calc" } });
        assert_eq!(init_rune_callee(&plain), Some("calc"));
    }

    #[test]
    fn pattern_idents() {
        let obj = json!({ "type": "ObjectPattern", "properties": [
            { "type": "Property", "value": { "type": "Identifier", "name": "a" } },
            { "type": "Property", "value": { "type": "Identifier", "name": "b" } }
        ] });
        let mut out = Vec::new();
        collect_pattern_idents(&obj, &mut out);
        let names: Vec<_> = out.iter().filter_map(|n| ident_name(n)).collect();
        assert_eq!(names, vec!["a", "b"]);
    }
}
