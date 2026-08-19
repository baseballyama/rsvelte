//! `svelte/derived-has-same-inputs-outputs` — flag a `derived(store, callback)`
//! call where the callback parameter names don't match the `$storeName` convention.
//!
//! Port of `eslint-plugin-svelte/src/rules/derived-has-same-inputs-outputs.ts`.
//!
//! Category: Stylistic Issues (not recommended). Has suggestions (`hasSuggestions`).
//!
//! Upstream runs once per file over the joint scope tree, so `check_root` owns
//! components (both scripts + template expressions) and the [`ScriptRule`] half
//! covers standalone `.svelte.(js|ts)` modules.
//! A `derived` call from `svelte/store` (resolved by the shared reference
//! tracker in `store_refs`) must satisfy:
//! - `derived(a, ($a) => …)` — single-store form: param must be `$a`.
//! - `derived([a, b], ([$a, $b]) => …)` — array-store form: each array-pattern
//!   element at index `i` must be `$stores[i]`.
//!
//! When the name is wrong and there is no conflict (another declaration of
//! `$expectedName` inside the same function body), a suggestion to rename the
//! parameter and all non-shadowed references is offered.

use serde_json::Value;

use rsvelte_core::ast::template::Root;

use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::store_refs::{
    RefTracker, component_tracker, handled_by_template_pass, module_is_ts, module_tracker,
    store_creator_calls,
};
use crate::script::{
    ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js,
};

static META: RuleMeta = RuleMeta {
    name: "svelte/derived-has-same-inputs-outputs",
    category: RuleCategory::Style,
    fixable: Fixable::Suggestion,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "derived store should use same variable names between values and callback",
    options_schema: None,
};

/// Upstream message templates (resolved from messageIds).
const MSG_UNEXPECTED: &str = "The argument name should be '{{name}}'.";
const MSG_RENAME_PARAM: &str = "Rename the parameter from {{oldName}} to {{newName}}.";

/// Collect the spans of all function-like sub-nodes inside `tree` whose params
/// or local `const`/`let`/`var` declarations re-declare `shadow_name`.
/// These spans will be excluded from the rename.
fn collect_shadow_spans(tree: &Value, shadow_name: &str) -> Vec<(u32, u32)> {
    let mut spans: Vec<(u32, u32)> = Vec::new();
    walk_js(tree, |node, _| {
        let is_fn = matches!(
            node_type(node),
            Some("FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression")
        );
        if !is_fn {
            return;
        }
        // Does this sub-function shadow `shadow_name` in its params?
        let param_shadow = node
            .get("params")
            .and_then(Value::as_array)
            .is_some_and(|params| params_declare(params, shadow_name));
        // Does this sub-function have a local `const`/`let`/`var` named `shadow_name`?
        let var_shadow = has_local_var_decl(node, shadow_name);
        if (param_shadow || var_shadow)
            && let (Some(s), Some(e)) = (node_start(node), node_end(node))
        {
            spans.push((s, e));
        }
    });
    spans
}

/// Whether any parameter in `params` (recursing into `ArrayPattern`) is an
/// Identifier named `name`.
fn params_declare(params: &[Value], name: &str) -> bool {
    params.iter().any(|p| match node_type(p) {
        Some("Identifier") => p.get("name").and_then(Value::as_str) == Some(name),
        Some("ArrayPattern") => p
            .get("elements")
            .and_then(Value::as_array)
            .is_some_and(|els| params_declare(els, name)),
        _ => false,
    })
}

/// Whether `fn_node` contains a `VariableDeclarator` that binds `name` at its
/// **direct** body scope (not inside a nested function).
fn has_local_var_decl(fn_node: &Value, name: &str) -> bool {
    let Some(body) = fn_node.get("body") else {
        return false;
    };
    if node_type(body) != Some("BlockStatement") {
        return false;
    }
    let Some(stmts) = body.get("body").and_then(Value::as_array) else {
        return false;
    };
    stmts.iter().any(|stmt| stmt_declares_var(stmt, name))
}

/// Whether `stmt` or its direct children (but NOT nested functions) declare `name`.
fn stmt_declares_var(stmt: &Value, name: &str) -> bool {
    match node_type(stmt) {
        Some("VariableDeclaration") => {
            let decls = stmt
                .get("declarations")
                .and_then(Value::as_array)
                .map_or(&[] as &[Value], std::vec::Vec::as_slice);
            decls.iter().any(|d| {
                d.get("id").as_ref().is_some_and(|id| {
                    node_type(id) == Some("Identifier")
                        && id.get("name").and_then(Value::as_str) == Some(name)
                })
            })
        }
        // Recurse into block statements, if-statements etc. but not function bodies.
        Some("BlockStatement") => {
            let stmts = stmt
                .get("body")
                .and_then(Value::as_array)
                .map_or(&[] as &[Value], std::vec::Vec::as_slice);
            stmts.iter().any(|s| stmt_declares_var(s, name))
        }
        _ => false,
    }
}

/// Whether `pos` falls inside any of the shadow `spans`.
fn in_shadow(pos: u32, spans: &[(u32, u32)]) -> bool {
    spans.iter().any(|(s, e)| pos >= *s && pos < *e)
}

/// Inspect the function body for a conflict (a binding of `expected_name` in
/// scope) and collect all non-shadowed references to `param_name`.
///
/// Returns `None` when there is a conflict → no suggestion offered.
/// Returns `Some(spans)` with the byte spans of every identifier to rename.
fn collect_refs_for_rename(
    fn_node: &Value,
    param_name: &str,
    expected_name: &str,
) -> Option<Vec<(u32, u32)>> {
    let body = fn_node.get("body")?;

    // 1. Check for conflict: `expected_name` already bound in the body's immediate scope.
    //    Upstream uses ESLint scope; we approximate by checking VariableDeclarators
    //    and function params inside the body (direct scope only).
    let conflict = has_local_var_decl(fn_node, expected_name)
        || fn_node
            .get("params")
            .and_then(Value::as_array)
            .is_some_and(|params| params_declare(params, expected_name));
    if conflict {
        return None;
    }
    // Also check for outer-scope conflict: walk the body, check any nested
    // function that's at the TOP level of the body for an `expected_name` param.
    // Actually upstream uses the ESLint scope manager; we only check direct scope.
    // Check if `expected_name` appears in the outer closure scope by checking
    // ancestor identifiers — this is what `findVariableForReplacement` does.
    // The fixture case `somethingWithACallback(() => { const $a = 303; derived(a, (b) => { $a }) })`
    // should produce `hasConflict = true`. Let me detect this by checking the
    // body for any read of `expected_name` that comes from an outer scope decl.
    // We walk the body and detect any FREE (non-declared-here) usage of `expected_name`.
    let shadow_spans_for_expected = collect_shadow_spans(body, expected_name);
    // Check if expected_name is used in the body without being locally declared.
    // If it IS used (and not locally declared), it's a conflict from an outer scope.
    let mut expected_used_in_body = false;
    walk_js(body, |node, _| {
        if node_type(node) != Some("Identifier") {
            return;
        }
        if node.get("name").and_then(Value::as_str) != Some(expected_name) {
            return;
        }
        let Some(s) = node_start(node) else { return };
        if !in_shadow(s, &shadow_spans_for_expected) {
            expected_used_in_body = true;
        }
    });
    if expected_used_in_body {
        // expected_name is referenced in the body from an outer scope → conflict.
        return None;
    }

    // 2. Collect shadow spans for `param_name` inside nested functions.
    let shadow_spans = collect_shadow_spans(body, param_name);

    // 3. Walk the body and collect all non-shadowed `param_name` identifier spans.
    let mut refs: Vec<(u32, u32)> = Vec::new();
    walk_js(body, |node, _| {
        if node_type(node) != Some("Identifier") {
            return;
        }
        if node.get("name").and_then(Value::as_str) != Some(param_name) {
            return;
        }
        let (Some(s), Some(e)) = (node_start(node), node_end(node)) else {
            return;
        };
        if !in_shadow(s, &shadow_spans) {
            refs.push((s, e));
        }
    });
    Some(refs)
}

/// One lint report to emit.
struct Report {
    param_start: u32,
    param_end: u32,
    expected_name: String,
    old_name: String,
    /// Spans to rename (param + body refs). `None` → no suggestion (conflict).
    rename_spans: Option<Vec<(u32, u32)>>,
}

/// Check a single-store `derived(ident, (param) => …)`.
fn check_identifier(store: &Value, fn_node: &Value) -> Option<Report> {
    let store_name = store.get("name").and_then(Value::as_str)?;
    let params = fn_node.get("params").and_then(Value::as_array)?;
    let param = params.first()?;
    if node_type(param) != Some("Identifier") {
        return None;
    }
    let param_name = param.get("name").and_then(Value::as_str)?;
    let expected = format!("${store_name}");
    if expected == param_name {
        return None;
    }
    let ps = node_start(param)?;
    let pe = node_end(param)?;
    let rename_spans = collect_refs_for_rename(fn_node, param_name, &expected).map(|mut refs| {
        refs.push((ps, pe));
        refs
    });
    Some(Report {
        param_start: ps,
        param_end: pe,
        expected_name: expected,
        old_name: param_name.to_string(),
        rename_spans,
    })
}

/// Check an array-store `derived([a, b], ([pa, pb]) => …)`.
fn check_array_expression(store_arr: &Value, fn_node: &Value) -> Vec<Report> {
    let Some(elements) = store_arr.get("elements").and_then(Value::as_array) else {
        return Vec::new();
    };
    let Some(params) = fn_node.get("params").and_then(Value::as_array) else {
        return Vec::new();
    };
    let Some(pattern) = params.first() else {
        return Vec::new();
    };
    if node_type(pattern) != Some("ArrayPattern") {
        return Vec::new();
    }
    let Some(pat_elems) = pattern.get("elements").and_then(Value::as_array) else {
        return Vec::new();
    };

    let mut reports = Vec::new();
    for (i, pat_elem) in pat_elems.iter().enumerate() {
        let Some(store_elem) = elements.get(i) else {
            continue;
        };
        let (Some("Identifier"), Some(store_name)) = (
            node_type(store_elem),
            store_elem.get("name").and_then(Value::as_str),
        ) else {
            continue;
        };
        if node_type(pat_elem) != Some("Identifier") {
            continue;
        }
        let Some(param_name) = pat_elem.get("name").and_then(Value::as_str) else {
            continue;
        };
        let expected = format!("${store_name}");
        if expected == param_name {
            continue;
        }
        let Some(ps) = node_start(pat_elem) else {
            continue;
        };
        let Some(pe) = node_end(pat_elem) else {
            continue;
        };
        let rename_spans =
            collect_refs_for_rename(fn_node, param_name, &expected).map(|mut refs| {
                refs.push((ps, pe));
                refs
            });
        reports.push(Report {
            param_start: ps,
            param_end: pe,
            expected_name: expected,
            old_name: param_name.to_string(),
            rename_spans,
        });
    }
    reports
}

fn run(ctx: &mut LintContext, tracker: &RefTracker<'_>) {
    let mut reports: Vec<Report> = Vec::new();

    for (call, _name) in store_creator_calls(tracker, &["derived"]) {
        let Some(args) = call.get("arguments").and_then(Value::as_array) else {
            continue;
        };
        if args.len() < 2 {
            continue;
        }
        let store_arg = &args[0];
        let fn_arg = &args[1];
        if !matches!(
            node_type(fn_arg),
            Some("ArrowFunctionExpression" | "FunctionExpression")
        ) {
            continue;
        }
        let Some(params) = fn_arg.get("params").and_then(Value::as_array) else {
            continue;
        };
        if params.is_empty() {
            continue;
        }

        match node_type(store_arg) {
            Some("Identifier") => {
                if let Some(r) = check_identifier(store_arg, fn_arg) {
                    reports.push(r);
                }
            }
            Some("ArrayExpression") => {
                reports.extend(check_array_expression(store_arg, fn_arg));
            }
            _ => {}
        }
    }

    reports.sort_by_key(|r| (r.param_start, r.param_end));
    reports.dedup_by_key(|r| (r.param_start, r.param_end));

    for report in reports {
        let message = MSG_UNEXPECTED.replace("{{name}}", &report.expected_name);
        let suggestions = match report.rename_spans {
            Some(spans) => {
                let desc = MSG_RENAME_PARAM
                    .replace("{{oldName}}", &report.old_name)
                    .replace("{{newName}}", &report.expected_name);
                let new_name = report.expected_name.clone();
                let edits = spans
                    .into_iter()
                    .map(|(s, e)| TextEdit {
                        start: s,
                        end: e,
                        new_text: new_name.clone(),
                    })
                    .collect();
                vec![Suggestion {
                    desc,
                    fix: Fix {
                        message: String::new(),
                        edits,
                    },
                }]
            }
            None => Vec::new(),
        };
        ctx.report_with_suggestions(report.param_start, report.param_end, message, suggestions);
    }
}

#[derive(Default)]
pub struct DerivedHasSameInputsOutputs;

impl ScriptRule for DerivedHasSameInputsOutputs {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        if handled_by_template_pass(ctx.filename()) {
            return;
        }
        let tracker = module_tracker(ctx.source(), program.value(), module_is_ts(ctx.filename()));
        run(ctx, &tracker);
    }
}

impl Rule for DerivedHasSameInputsOutputs {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let root_json = ctx.root_json(root);
        if root_json.is_null() {
            return;
        }
        let tracker = component_tracker(ctx.source(), root, &root_json);
        run(ctx, &tracker);
    }
}
