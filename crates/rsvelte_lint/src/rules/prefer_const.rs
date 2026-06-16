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

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
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
        collect_template_reassignments(ctx.source(), &mut reassigned);

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
