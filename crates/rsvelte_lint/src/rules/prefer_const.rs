//! `svelte/prefer-const`.
//!
//! `svelte/prefer-const` — suggest `const` for a `let` binding that is never
//! reassigned. Port of the core `ESLint` `prefer-const` rule's behaviour exercised
//! by the eslint-plugin-svelte fixtures, plus the plugin's `excludedRunes`
//! option (a `let` initialised by an excluded rune call — `$props()` /
//! `$derived(...)` by default — is left alone, since those require `let`).
//!
//! Implemented as a script-AST rule: the `<script>` `ESTree` program gives the
//! real initializer (so `excludedRunes` is detected from the actual `$props` /
//! `$derived` callee, not the rune-stripped binding value) and the declaration
//! identifier positions; reassignment comes from the analyzed scope
//! ([`analyze_scope`](crate::scope::analyze_scope)).

use std::collections::{HashMap, HashSet};

use oxc_allocator::Allocator;
use oxc_ast::AstKind;
use oxc_parser::{ParseOptions as OxcParseOptions, Parser};
use oxc_semantic::SemanticBuilder;
use oxc_span::{GetSpan, SourceType};
use serde_json::Value;

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::ast::template::{DeclarationTag, Fragment, Root, TemplateNode};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{
    ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js,
};

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

fn json_offset(value: u64) -> Option<u32> {
    u32::try_from(value).ok()
}

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("source offsets are represented as u32")
}

fn ident_name(node: &Value) -> Option<&str> {
    if node_type(node) == Some("Identifier") {
        node.get("name").and_then(Value::as_str)
    } else {
        None
    }
}

/// The range reported by ESLint's core `prefer-const` rule for a binding
/// identifier includes its TypeScript annotation (`let value: Type = ...`).
/// The compatibility AST keeps the identifier's lexical `end` and carries the
/// wider boundary on `typeAnnotation`, so prefer that boundary when present.
fn binding_report_end(node: &Value) -> Option<u32> {
    node.get("typeAnnotation")
        .filter(|annotation| !annotation.is_null())
        .and_then(|annotation| annotation.get("end"))
        .and_then(Value::as_u64)
        .or_else(|| node.get("end").and_then(Value::as_u64))
        .and_then(json_offset)
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
fn collect_template_reassignments(ctx: &LintContext, out: &mut HashSet<String>) {
    // A standalone module has no template: parsing its JS as one turns markup
    // inside a string literal into real directives and expressions.
    if matches!(
        crate::engine::classify_source(ctx.filename()),
        crate::engine::SourceKind::Module { .. }
    ) {
        return;
    }
    // The template fragment is serialized once per file by the context (this
    // rule alone would otherwise re-parse + re-serialize the source on each of
    // its two call sites, for each script block).
    walk_assignments(&ctx.template_fragment_json(), out);
}

/// Add names that are declared by more than one `let`/`var`/`const` declarator
/// in `program` (a redeclaration), which the core `prefer-const` rule treats as
/// having multiple writes. Used only on the parse-only fallback path.
fn add_redeclared_names(program: &ProgramView<'_>, out: &mut HashSet<String>) {
    let mut counts: std::collections::HashMap<String, u32> = std::collections::HashMap::new();
    program.walk(|node, _| {
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
                Some("ForOfStatement" | "ForInStatement") => {
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

/// Names svelte-eslint-parser's `analyzePropsScope` gives a virtual *write*
/// reference to, because a component prop can be set by the parent: every
/// top-level `export { … }` specifier local, and every binding of a top-level
/// `export let/var/const`. The extra writer means core `prefer-const` never
/// reports the binding.
fn collect_prop_export_names(program: &ProgramView<'_>, out: &mut HashSet<String>) {
    let Some(body) = program.value().get("body").and_then(Value::as_array) else {
        return;
    };
    let push = |id: &Value, out: &mut HashSet<String>| {
        let mut ids = Vec::new();
        collect_pattern_idents(id, &mut ids);
        for id in ids {
            if let Some(name) = ident_name(id) {
                out.insert(name.to_string());
            }
        }
    };
    for node in body {
        if node_type(node) != Some("ExportNamedDeclaration") {
            continue;
        }
        match node.get("declaration").filter(|d| !d.is_null()) {
            Some(decl) => {
                if node_type(decl) == Some("VariableDeclaration")
                    && let Some(decls) = decl.get("declarations").and_then(Value::as_array)
                {
                    for d in decls {
                        if let Some(id) = d.get("id") {
                            push(id, out);
                        }
                    }
                }
            }
            None => {
                if let Some(specs) = node.get("specifiers").and_then(Value::as_array) {
                    for spec in specs {
                        if let Some(local) = spec.get("local") {
                            push(local, out);
                        }
                    }
                }
            }
        }
    }
}

/// Whether svelte-eslint-parser runs `analyzePropsScope` over this script. It
/// skips only the legacy `context="module"` spelling, so a Svelte 5
/// `<script module>` still gets prop references — while a standalone
/// `.svelte.js` / `.svelte.ts` module, having no component, never does.
fn props_scope_analyzed(ctx: &LintContext, kind: ScriptKind) -> bool {
    if kind == ScriptKind::Instance {
        return true;
    }
    if matches!(
        crate::engine::classify_source(ctx.filename()),
        crate::engine::SourceKind::Module { .. }
    ) {
        return false;
    }
    // The attribute lives on the `<script>` tag, which the script program does
    // not carry; the caller only asks once the module script exports something.
    let allocator = rsvelte_core::Allocator::default();
    let Ok(root) = rsvelte_core::parse(
        ctx.source(),
        &allocator,
        rsvelte_core::ParseOptions {
            lenient_script: true,
            ..Default::default()
        },
    ) else {
        return true;
    };
    !root
        .module
        .as_ref()
        .is_some_and(|s| s.attributes.iter().any(|a| a.name.as_str() == "context"))
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
fn collect_declaration_tags<'a, 'b>(
    fragment: &'a Fragment<'b>,
    out: &mut Vec<&'a DeclarationTag<'b>>,
) {
    for node in &fragment.nodes {
        walk_template_node_for_decl_tags(node, out);
    }
}

fn walk_template_node_for_decl_tags<'a, 'b>(
    node: &'a TemplateNode<'b>,
    out: &mut Vec<&'a DeclarationTag<'b>>,
) {
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
/// never reassigned — mirrors what the oracle's `ESLint` core `prefer-const`
/// rule does for `VariableDeclaration { kind: "let" }` nodes in the `ESTree`.
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
        &rsvelte_core::Allocator::default(),
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
        // The `let` keyword position within the tag: scan forward from tag.start
        // for the first `l` that starts `let`.
        let let_keyword_start = || {
            let src_bytes = source.as_bytes();
            let mut pos = tag.start as usize;
            let end = (tag.end as usize).min(src_bytes.len());
            loop {
                if pos + 3 > end {
                    break None;
                }
                if &src_bytes[pos..pos + 3] == b"let" {
                    break Some(source_offset(pos));
                }
                pos += 1;
            }
        };
        let_declaration_reports(
            &decl_json,
            reassigned,
            destructuring_all,
            &let_keyword_start,
            &mut reports,
        );
    }
    reports
}

/// Whether any `let` binding of one `VariableDeclaration` is never reassigned,
/// pushing one report per const-able identifier. Shared by the `{let …}`
/// declaration-tag path and the template-expression path.
fn let_declaration_reports(
    decl_json: &Value,
    reassigned: &HashSet<String>,
    destructuring_all: bool,
    let_keyword_start: &dyn Fn() -> Option<u32>,
    out: &mut Vec<(u32, u32, String, Option<u32>)>,
) {
    // Only `let` declarations fire prefer-const.
    if decl_json.get("kind").and_then(Value::as_str) != Some("let") {
        return;
    }
    let Some(declarators) = decl_json.get("declarations").and_then(Value::as_array) else {
        return;
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
                let end = id.get("end").and_then(Value::as_u64).and_then(json_offset);
                if let (Some(s), Some(e)) = (start, end) {
                    decl_idents.push((s, e, name));
                }
            } else {
                all_const_able = false;
            }
        }
    }
    if decl_idents.is_empty() {
        return;
    }
    if destructuring_all && !all_const_able {
        return;
    }
    let fixable = every_declarator_has_init && all_const_able;
    let fix_start = if fixable { let_keyword_start() } else { None };
    for (s, e, name) in decl_idents {
        out.push((
            s,
            e,
            format!("'{name}' is never reassigned. Use 'const' instead."),
            fix_start,
        ));
    }
}

/// Report `let` declarations that live inside a template *expression* — an
/// event-handler arrow body, a callback passed to `{@render}`, and so on.
/// Upstream runs core `prefer-const` over one program that already contains
/// every template expression, so those `let`s are ordinary declarations there.
fn check_template_expression_lets(
    fragment: &Value,
    destructuring_all: bool,
) -> Vec<(u32, u32, String, Option<u32>)> {
    let mut reports = Vec::new();
    walk_js(fragment, |node, ancestors| {
        if node_type(node) != Some("VariableDeclaration") {
            return;
        }
        // A `{let …}` declaration tag is a fragment node, not a function body
        // statement; `check_template_declaration_tags` owns those.
        if !ancestors.iter().any(|a| {
            matches!(
                node_type(a),
                Some("ArrowFunctionExpression" | "FunctionExpression" | "FunctionDeclaration")
            )
        }) {
            return;
        }
        // A block-scoped `let` can only be written from inside its own block, so
        // the name-keyed file-wide set would confuse it with a same-named outer
        // binding (`bind:this={el}` above a handler-local `let el`).
        let scope = ancestors
            .iter()
            .rev()
            .find(|a| {
                matches!(
                    node_type(a),
                    Some(
                        "BlockStatement"
                            | "StaticBlock"
                            | "SwitchStatement"
                            | "ForStatement"
                            | "ForInStatement"
                            | "ForOfStatement"
                    )
                )
            })
            .copied()
            .unwrap_or(node);
        let mut reassigned = HashSet::new();
        walk_assignments(scope, &mut reassigned);
        let start = node_start(node);
        let_declaration_reports(
            node,
            &reassigned,
            destructuring_all,
            &|| start,
            &mut reports,
        );
    });
    reports
}

fn collect_forin_forof_reassignments(program: &ProgramView<'_>, out: &mut HashSet<String>) {
    program.walk(|node, _| {
        let ty = node_type(node);
        if !matches!(ty, Some("ForOfStatement" | "ForInStatement")) {
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
    matches!(node_type(left), Some("ObjectPattern" | "ArrayPattern"))
}

/// The span `(start, end)` of the nearest enclosing function (declaration,
/// expression, or arrow). `None` ⇒ the node is at the top (module) level. Used
/// as a coarse lexical-scope key: `ESLint`'s scope-aware `prefer-const` only
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
            let e = json_offset(node.get("end").and_then(Value::as_u64)?)?;
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
    /// report location, matching `ESLint`), plus the enclosing-function scope of
    /// that assignment (so we only report when it matches the declaration's).
    first_destructuring: Option<((u32, u32), FnScope)>,
}

/// Walk `program` and collect, per identifier name, how many times it is the
/// target of an `AssignmentExpression` and how many of those are destructuring.
/// `UpdateExpression` increments `total` (not destructuring) so the name is
/// excluded from the single-destructuring-assignment fast path.
fn collect_assignment_info(
    program: &ProgramView<'_>,
) -> std::collections::HashMap<String, AssignInfo> {
    let mut map: std::collections::HashMap<String, AssignInfo> = std::collections::HashMap::new();
    program.walk(|node, ancestors| match node_type(node) {
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
                                id.get("end").and_then(Value::as_u64).and_then(json_offset),
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
/// in `program`. Prop exports are filtered out by the caller, which knows
/// whether this script gets prop references at all.
fn collect_no_init_let_idents<'a>(
    program: &'a Value,
    excluded_runes: &[String],
    out: &mut Vec<(String, &'a Value, FnScope)>,
) {
    walk_js(program, |node, ancestors| {
        if node_type(node) != Some("VariableDeclaration")
            || node.get("kind").and_then(Value::as_str) != Some("let")
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

/// Per-binding reassignment facts from one oxc semantic pass over the script:
/// declaration-identifier absolute span → (has a write reference, is declared
/// in the root scope). Name-keyed sets cannot tell two same-named bindings in
/// different scopes apart (an inner `let outer` reassignment must not mark the
/// outer `outer`); the symbol table can.
#[derive(Default)]
struct BindingWrites {
    map: HashMap<(u32, u32), (bool, bool)>,
    /// Declaration-identifier span → where upstream reports a no-init `let`
    /// whose single write can become the declaration itself.
    sole_write: HashMap<(u32, u32), (u32, u32)>,
    /// Declaration-identifier spans whose binding is read before its first
    /// write — what `ignoreReadBeforeAssign` suppresses.
    read_before_write: HashSet<(u32, u32)>,
    /// Names this script also binds in a NON-root scope. For such a name the
    /// compiler analysis's root-binding `reassigned` flag is not usable: the
    /// inner binding's write is what could have set it.
    shadowed: HashSet<String>,
    /// Initialized, plain-identifier `let` bindings recovered from OXC. The
    /// compiler's compatibility AST can represent a class containing legacy
    /// decorators as one opaque node, so the JSON walk above cannot see method
    /// locals inside it even though this semantic pass can.
    semantic_initialized_lets: Vec<SemanticLetCandidate>,
}

struct SemanticLetCandidate {
    start: u32,
    end: u32,
    name: String,
    init_start: u32,
    init_end: u32,
    has_write: bool,
    is_root: bool,
    fix_start: Option<u32>,
}

fn collect_binding_writes(
    source: &str,
    program: &ProgramView<'_>,
    component: bool,
) -> BindingWrites {
    let mut out = BindingWrites::default();
    let (Some(base), Some(end)) = (node_start(program.value()), node_end(program.value())) else {
        return out;
    };
    if base > end || end as usize > source.len() {
        return out;
    }
    let body = &source[base as usize..end as usize];
    let allocator = Allocator::default();
    // TS grammar is a superset of what a lint-accepted script body contains, so
    // one TS parse covers both script languages.
    let parsed = Parser::new(&allocator, body, SourceType::ts().with_module(true))
        .with_options(OxcParseOptions {
            allow_return_outside_function: true,
            ..OxcParseOptions::default()
        })
        .parse();
    let program_ref = allocator.alloc(parsed.program);
    let semantic = SemanticBuilder::new()
        .with_build_nodes(true)
        .build(program_ref)
        .semantic;
    let scoping = semantic.scoping();
    let root_scope = scoping.root_scope_id();
    for id in scoping.symbol_ids() {
        let declaration_node = semantic.symbol_declaration(id);
        let span = scoping.symbol_span(id);
        let has_write = scoping
            .get_resolved_references(id)
            .any(oxc_semantic::Reference::is_write);
        let is_root = scoping.symbol_scope_id(id) == root_scope;
        if !is_root {
            out.shadowed.insert(scoping.symbol_name(id).to_string());
        }
        let declaration = (base + span.start, base + span.end);
        if let AstKind::VariableDeclarator(declarator) = declaration_node.kind()
            && let oxc_ast::ast::BindingPattern::BindingIdentifier(identifier) = &declarator.id
            && let Some(init) = &declarator.init
            && let AstKind::VariableDeclaration(var_decl) =
                semantic.nodes().parent_kind(declaration_node.id())
            && var_decl.kind == oxc_ast::ast::VariableDeclarationKind::Let
        {
            let init_span = init.span();
            out.semantic_initialized_lets.push(SemanticLetCandidate {
                start: base + identifier.span.start,
                end: base + identifier.span.end,
                name: identifier.name.to_string(),
                init_start: base + init_span.start,
                init_end: base + init_span.end,
                has_write,
                is_root,
                fix_start: (var_decl.declarations.len() == 1).then_some(base + var_decl.span.start),
            });
        }
        if let Some(report) = sole_write_report(&semantic, id, component) {
            out.sole_write
                .insert(declaration, (base + report.0, base + report.1));
        }
        if read_precedes_write(&semantic, id) {
            out.read_before_write.insert(declaration);
        }
        out.map.insert(declaration, (has_write, is_root));
    }
    out
}

/// Where ESLint core's `getIdentifierIfShouldBeConst` would report a binding
/// with no initializer: at its single write when that write can become the
/// declaration, or at the declaration itself when a read precedes the write.
/// `None` when the binding is reassigned, unwritten, or written from another
/// scope.
/// `getIdentifierIfShouldBeConst`'s `reference.isRead() && writer === null` —
/// the state `ignoreReadBeforeAssign` turns into "do not report".
fn read_precedes_write(
    semantic: &oxc_semantic::Semantic<'_>,
    symbol: oxc_semantic::SymbolId,
) -> bool {
    let scoping = semantic.scoping();
    let nodes = semantic.nodes();
    // A declarator's initializer is a write reference to ESLint's scope
    // analyser; oxc records it as the declaration and not as a reference, so it
    // has to be folded back in at its own source position.
    let init_write = matches!(
        semantic.symbol_declaration(symbol).kind(),
        AstKind::VariableDeclarator(declarator) if declarator.init.is_some()
    )
    .then(|| scoping.symbol_span(symbol).start);
    for reference_id in ordered_references(semantic, symbol) {
        let reference = scoping.get_reference(reference_id);
        let start = nodes.get_node(reference.node_id()).span().start;
        if init_write.is_some_and(|w| w <= start) || reference.is_write() {
            return false;
        }
        if reference.is_read() {
            return true;
        }
    }
    false
}

/// A symbol's resolved references in source order, as ESLint's scope analyser
/// yields them.
fn ordered_references(
    semantic: &oxc_semantic::Semantic<'_>,
    symbol: oxc_semantic::SymbolId,
) -> Vec<oxc_semantic::ReferenceId> {
    let scoping = semantic.scoping();
    let nodes = semantic.nodes();
    let mut references = scoping.get_resolved_reference_ids(symbol).to_vec();
    references.sort_by_key(|&id| {
        nodes
            .get_node(scoping.get_reference(id).node_id())
            .span()
            .start
    });
    references
}

fn sole_write_report(
    semantic: &oxc_semantic::Semantic<'_>,
    symbol: oxc_semantic::SymbolId,
    component: bool,
) -> Option<(u32, u32)> {
    let scoping = semantic.scoping();
    let nodes = semantic.nodes();
    let references = ordered_references(semantic, symbol);
    let mut writer = None;
    let mut read_before_write = false;
    for reference_id in references {
        let reference = scoping.get_reference(reference_id);
        if reference.is_write() {
            if writer.is_some() {
                return None;
            }
            writer = Some(reference);
        } else if reference.is_read() && writer.is_none() {
            read_before_write = true;
        }
    }
    let writer = writer?;
    let write_node = nodes.get_node(writer.node_id());
    if write_node.scope_id() != scoping.symbol_scope_id(symbol) {
        return None;
    }
    if !can_become_declaration(nodes, write_node, component) {
        return None;
    }
    let span = if read_before_write {
        scoping.symbol_span(symbol)
    } else {
        write_node.span()
    };
    Some((span.start, span.end))
}

/// `canBecomeVariableDeclaration` — the write is a whole `x = …` statement
/// sitting directly in a statement list. In a component, the instance script's
/// top level is a `SvelteScriptElement` body upstream, not a `Program` body, so
/// a top-level assignment fails this test there.
fn can_become_declaration(
    nodes: &oxc_semantic::AstNodes<'_>,
    write_node: &oxc_semantic::AstNode<'_>,
    component: bool,
) -> bool {
    let mut node = nodes.parent_node(write_node.id());
    while matches!(
        node.kind(),
        AstKind::ArrayAssignmentTarget(_)
            | AstKind::ObjectAssignmentTarget(_)
            | AstKind::AssignmentTargetWithDefault(_)
            | AstKind::AssignmentTargetRest(_)
            | AstKind::AssignmentTargetPropertyIdentifier(_)
            | AstKind::AssignmentTargetPropertyProperty(_)
    ) {
        node = nodes.parent_node(node.id());
    }
    match node.kind() {
        AstKind::VariableDeclarator(_) => true,
        AstKind::AssignmentExpression(_) => {
            let statement = nodes.parent_node(node.id());
            if !matches!(statement.kind(), AstKind::ExpressionStatement(_)) {
                return false;
            }
            match nodes.parent_kind(statement.id()) {
                AstKind::Program(_) => !component,
                AstKind::BlockStatement(_)
                | AstKind::FunctionBody(_)
                | AstKind::StaticBlock(_)
                | AstKind::SwitchCase(_) => true,
                _ => false,
            }
        }
        _ => false,
    }
}

/// Scope-aware reassignment oracle for script `let` declarators.
struct ScopedReassigned {
    writes: BindingWrites,
    /// Names the compiler analysis reports as reassigned root bindings. Its
    /// scope model is the whole component, so it covers the writes this
    /// script's own symbol table cannot see (the template, the other script) —
    /// but it is name-keyed, so it is only consulted for names this script does
    /// not also bind in an inner scope.
    external_root: HashSet<String>,
    /// Names written from the template. Always honoured: a template write can
    /// only reach a root binding.
    template_external: HashSet<String>,
    /// The old name-keyed set, used when a declarator's symbol is unresolved.
    fallback: HashSet<String>,
    /// Names carrying a virtual prop write (see [`collect_prop_export_names`]).
    /// Upstream attaches it to a module-scope variable, so it only applies to a
    /// binding declared at the script's root.
    prop_names: HashSet<String>,
    /// The `ignoreReadBeforeAssign` option.
    ignore_read_before_assign: bool,
}

impl ScopedReassigned {
    /// `getIdentifierIfShouldBeConst` returns null for this binding because a
    /// read precedes its first write and the option is on.
    fn read_before_assign_ignored(&self, id: &Value) -> bool {
        self.ignore_read_before_assign
            && matches!((node_start(id), node_end(id)), (Some(s), Some(e))
                if self.writes.read_before_write.contains(&(s, e)))
    }

    fn is_reassigned(&self, id: &Value) -> bool {
        let name = ident_name(id).unwrap_or("");
        if let (Some(s), Some(e)) = (node_start(id), node_end(id))
            && let Some(&(has_write, is_root)) = self.writes.map.get(&(s, e))
        {
            if is_root && self.prop_names.contains(name) {
                return true;
            }
            if has_write || !is_root {
                return has_write;
            }
            return self.template_external.contains(name)
                || (self.external_root.contains(name) && !self.writes.shadowed.contains(name));
        }
        self.prop_names.contains(name) || self.fallback.contains(name)
    }

    fn semantic_candidate_is_reassigned(&self, candidate: &SemanticLetCandidate) -> bool {
        if candidate.is_root && self.prop_names.contains(&candidate.name) {
            return true;
        }
        if candidate.has_write {
            return true;
        }
        candidate.is_root
            && (self.template_external.contains(&candidate.name)
                || (self.external_root.contains(&candidate.name)
                    && !self.writes.shadowed.contains(&candidate.name)))
    }
}

fn collect_external_root(ctx: &LintContext, program: &ProgramView<'_>) -> HashSet<String> {
    let external: HashSet<String> = ctx.scope_analysis().map_or_else(
        || {
            // No analysis (component has an analysis error): redeclared names
            // keep multiple write references upstream, so never const-ify them.
            let mut s = HashSet::new();
            add_redeclared_names(program, &mut s);
            s
        },
        |analysis| {
            analysis
                .root
                .bindings
                .iter()
                .filter(|b| b.reassigned)
                .map(|b| b.name.clone())
                .collect()
        },
    );
    external
}

#[derive(Default)]
pub struct PreferConst;

impl ScriptRule for PreferConst {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, kind: ScriptKind) {
        let component = !matches!(
            crate::engine::classify_source(ctx.filename()),
            crate::engine::SourceKind::Module { .. }
        );
        let reassigned = collect_reassigned_names(ctx, program);
        let mut prop_names = HashSet::new();
        collect_prop_export_names(program, &mut prop_names);
        if !prop_names.is_empty() && !props_scope_analyzed(ctx, kind) {
            prop_names.clear();
        }
        let scoped = ScopedReassigned {
            writes: collect_binding_writes(ctx.source(), program, component),
            external_root: collect_external_root(ctx, program),
            template_external: {
                let mut t = HashSet::new();
                collect_template_reassignments(ctx, &mut t);
                t
            },
            fallback: reassigned.clone(),
            prop_names,
            ignore_read_before_assign: ctx.option_bool("ignoreReadBeforeAssign", false),
        };
        let (excluded, destructuring_all) = prefer_const_options(ctx.option0());
        let mut reports = collect_script_reports(program, &scoped, &excluded, destructuring_all);
        append_semantic_fallback_reports(ctx.source(), program, &scoped, &excluded, &mut reports);

        // Also check template `{let x = …}` declaration tags. The oracle's
        // ESLint core `prefer-const` treats them as ordinary `let` declarations
        // in the ESTree, so we replicate that by checking the template separately.
        // Only run for the instance script (or when there's no instance script)
        // to avoid double-reporting when both instance and module scripts exist.
        if kind == ScriptKind::Instance {
            let tag_reports =
                check_template_declaration_tags(ctx.source(), &reassigned, destructuring_all);
            reports.extend(tag_reports);
            let fragment = ctx.template_fragment_json();
            reports.extend(check_template_expression_lets(&fragment, destructuring_all));
        }

        report_no_init_destructuring(ctx, program, &excluded, &scoped, &mut reports);
        reports.sort_by_key(|report| report.0);
        for (start, end, message, fix_start) in reports {
            emit_prefer_const_report(ctx, start, end, message, fix_start);
        }
    }
}

/// Recover initialized `let` bindings hidden inside an opaque compatibility-AST
/// node (currently decorated TypeScript classes). Candidates already observed
/// by the regular JSON walk are discarded by span, keeping OXC as a narrow
/// fallback rather than a second implementation of the rule.
fn append_semantic_fallback_reports(
    source: &str,
    program: &ProgramView<'_>,
    scoped: &ScopedReassigned,
    excluded: &[String],
    reports: &mut Vec<(u32, u32, String, Option<u32>)>,
) {
    // Exclude every initialized plain `let` that the compatibility AST can
    // represent, including candidates which the normal rule deliberately does
    // not report (for example one excluded-rune declarator in a multi-declarator
    // declaration). Using `reports` here made the semantic fallback reintroduce
    // those intentional exemptions as false positives.
    let mut visible = HashSet::new();
    program.walk(|node, _| {
        if node_type(node) != Some("VariableDeclaration")
            || node.get("kind").and_then(Value::as_str) != Some("let")
        {
            return;
        }
        let Some(declarations) = node.get("declarations").and_then(Value::as_array) else {
            return;
        };
        for declaration in declarations {
            if !declaration.get("init").is_some_and(|init| !init.is_null()) {
                continue;
            }
            let Some(id) = declaration
                .get("id")
                .filter(|id| node_type(id) == Some("Identifier"))
            else {
                continue;
            };
            if let (Some(start), Some(end)) = (node_start(id), node_end(id)) {
                visible.insert((start, end));
            }
        }
    });
    for candidate in &scoped.writes.semantic_initialized_lets {
        if visible.contains(&(candidate.start, candidate.end))
            || scoped.semantic_candidate_is_reassigned(candidate)
        {
            continue;
        }
        let init = source
            .get(candidate.init_start as usize..candidate.init_end as usize)
            .unwrap_or_default()
            .trim_start();
        if excluded.iter().any(|rune| {
            init.strip_prefix(rune).is_some_and(|tail| {
                let tail = tail.trim_start();
                tail.starts_with('(') || tail.starts_with('.')
            })
        }) {
            continue;
        }
        reports.push((
            candidate.start,
            candidate.end,
            format!(
                "'{}' is never reassigned. Use 'const' instead.",
                candidate.name
            ),
            candidate.fix_start,
        ));
    }
}

fn collect_reassigned_names(ctx: &LintContext, program: &ProgramView<'_>) -> HashSet<String> {
    // Reassignment info from the analyzed scope (reliable per the R9 audit).
    // `analyze_scope` runs the full Phase-2 analysis, which returns `Err`
    // (→ `None`) when the component has *any* analysis/validation error
    // (e.g. an `animate:` directive outside a keyed `{#each}`). The oracle's
    // svelte-eslint-parser only parses, so it still lints such a file; to
    // match, fall back to a parse-only assignment scan of the script +
    // template when the analysis is unavailable.
    let mut reassigned: HashSet<String> = ctx.scope_analysis().map_or_else(
        || {
            let mut s = HashSet::new();
            walk_assignments(program, &mut s);
            // A name declared by more than one declarator (`let x; let x`)
            // has multiple write references in the svelte-eslint-parser
            // scope, so the core rule never converts it to `const`. The
            // accurate analysis path knows this; the parse-only fallback
            // must detect the redeclaration explicitly.
            add_redeclared_names(program, &mut s);
            s
        },
        |analysis| {
            analysis
                .root
                .bindings
                .iter()
                .filter(|b| b.reassigned)
                .map(|b| b.name.clone())
                .collect()
        },
    );
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
    collect_template_reassignments(ctx, &mut template_reassign);
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

    reassigned
}

fn prefer_const_options(opts: Option<&Value>) -> (Vec<String>, bool) {
    let excluded: Vec<String> = opts
        .and_then(|o| o.get("excludedRunes"))
        .and_then(Value::as_array)
        .map_or_else(
            || vec!["$props".to_string(), "$derived".to_string()],
            |a| {
                a.iter()
                    .filter_map(|v| v.as_str().map(str::to_string))
                    .collect()
            },
        );
    let destructuring_all = opts
        .and_then(|o| o.get("destructuring"))
        .and_then(Value::as_str)
        == Some("all");

    (excluded, destructuring_all)
}

fn collect_script_reports(
    program: &ProgramView<'_>,
    scoped: &ScopedReassigned,
    excluded: &[String],
    destructuring_all: bool,
) -> Vec<(u32, u32, String, Option<u32>)> {
    let mut reports = Vec::new();
    program.walk(|node, ancestors| {
        if node_type(node) != Some("VariableDeclaration")
            || node.get("kind").and_then(Value::as_str) != Some("let")
        {
            return;
        }

        let Some(declarators) = node.get("declarations").and_then(Value::as_array) else {
            return;
        };

        // `for (let x of …)` / `for (let x in …)`: the loop supplies the value,
        // so the declarator needs no initializer to be const-able, and the
        // declaration is fixable even though nothing is initialized.
        let in_for_head = matches!(
            ancestors.last().and_then(|p| node_type(p)),
            Some("ForOfStatement" | "ForInStatement")
        );

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
                let is_reassigned =
                    scoped.is_reassigned(id) || scoped.read_before_assign_ignored(id);
                if (has_init || in_for_head) && !is_reassigned {
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
        let fixable = (every_declarator_has_init || in_for_head) && all_const_able;
        // `destructuring: "all"` only reports when the whole declaration is
        // const-able (default "any" reports each const-able id).
        if destructuring_all && !all_const_able {
            return;
        }
        let fix_start = if fixable { node_start(node) } else { None };

        for id in decl_idents {
            if let (Some(s), Some(e)) = (node_start(id), binding_report_end(id)) {
                let name = ident_name(id).unwrap_or("");
                reports.push((
                    s,
                    e,
                    format!("'{name}' is never reassigned. Use 'const' instead."),
                    fix_start,
                ));
            }
        }
    });

    reports
}

fn report_no_init_destructuring(
    ctx: &LintContext,
    program: &ProgramView<'_>,
    excluded: &[String],
    scoped: &ScopedReassigned,
    reports: &mut Vec<(u32, u32, String, Option<u32>)>,
) {
    let assignment_info = collect_assignment_info(program);
    let mut template_and_forin = HashSet::new();
    collect_template_reassignments(ctx, &mut template_and_forin);
    collect_forin_forof_reassignments(program, &mut template_and_forin);
    let mut declarations = Vec::new();
    collect_no_init_let_idents(program, excluded, &mut declarations);
    for (name, id, declaration_scope) in declarations {
        if template_and_forin.contains(&name)
            || scoped.prop_names.contains(&name)
            || scoped.read_before_assign_ignored(id)
        {
            continue;
        }
        // A plain `let x; x = 1;` converts to `const` when the single write can
        // become the declaration — resolved per binding, so a same-named write
        // in another scope neither suppresses nor triggers it.
        if let (Some(s), Some(e)) = (node_start(id), node_end(id))
            && let Some(&(report_start, report_end)) = scoped.writes.sole_write.get(&(s, e))
        {
            reports.push((
                report_start,
                report_end,
                format!("'{name}' is never reassigned. Use 'const' instead."),
                None,
            ));
            continue;
        }
        let Some(info) = assignment_info.get(&name) else {
            continue;
        };
        if info.total == 1
            && info.destructuring == 1
            && let Some((position, assignment_scope)) = info.first_destructuring
            && assignment_scope == declaration_scope
        {
            reports.push((
                position.0,
                position.1,
                format!("'{name}' is never reassigned. Use 'const' instead."),
                None,
            ));
        }
    }
}

fn emit_prefer_const_report(
    ctx: &mut LintContext,
    start: u32,
    end: u32,
    message: String,
    fix_start: Option<u32>,
) {
    if let Some(declaration_start) = fix_start {
        ctx.report_with_fix(
            start,
            end,
            message,
            Fix {
                message: "Use `const` instead.".to_string(),
                edits: vec![TextEdit {
                    start: declaration_start,
                    end: declaration_start + 3,
                    new_text: "const".to_string(),
                }],
            },
        );
    } else {
        ctx.report(start, end, message);
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
        collect_template_reassignments(ctx, &mut reassigned);

        let mut tag_reports =
            check_template_declaration_tags(ctx.source(), &reassigned, destructuring_all);
        let fragment = ctx.template_fragment_json();
        tag_reports.extend(check_template_expression_lets(&fragment, destructuring_all));
        tag_reports.sort_by_key(|report| report.0);
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

    #[test]
    fn typed_binding_report_includes_type_annotation() {
        let typed = json!({
            "type": "Identifier",
            "start": 4,
            "end": 9,
            "name": "value",
            "typeAnnotation": {
                "type": "TSTypeAnnotation",
                "start": 9,
                "end": 17
            }
        });
        assert_eq!(binding_report_end(&typed), Some(17));

        let plain = json!({ "type": "Identifier", "start": 4, "end": 9, "name": "value" });
        assert_eq!(binding_report_end(&plain), Some(9));
    }
}
