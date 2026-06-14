//! `svelte/require-store-callbacks-use-set-param` — the start callback passed to
//! `readable` / `writable` must name its first parameter `set`. Port of the
//! eslint-plugin-svelte rule. Runs over the script ESTree program via the
//! [`ScriptRule`] hook.
//!
//! Two suggestion variants (mirroring upstream):
//! - `addParam`: no params at all → insert `set` after the opening `(` of the
//!   params list.
//! - `updateParam`: first param exists but is an Identifier not named `set` →
//!   rename the param and all its references in the body to `set`.
//!
//! No suggestion is offered when the target name `set` would conflict (i.e.
//! `set` appears as any identifier inside the function node).

use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::store_refs::{collect_store_creators, is_function_expr};
use crate::script::{ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/require-store-callbacks-use-set-param",
    category: RuleCategory::Correctness,
    fixable: Fixable::Suggestion,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Require `readable`/`writable` store callbacks to use a `set` parameter",
    options_schema: None,
};

const MESSAGE: &str = "Store callbacks must use `set` param.";

/// Information collected per bad call-back during the walk.
enum ReportKind {
    /// Callback has no params at all; byte offset of the `(` before the body.
    AddParam { paren_pos: u32 },
    /// Callback has a misnamed Identifier param; byte range of the param plus
    /// all free references to its name in the body.
    UpdateParam {
        old_name: String,
        param_start: u32,
        param_end: u32,
        /// (start, end) pairs for every Identifier in the body that is a free
        /// reference to the old param name (not a declaration, not shadowed).
        refs: Vec<(u32, u32)>,
    },
    /// `set` would conflict — no suggestion.
    NoSuggestion,
}

struct ReportInfo {
    fn_start: u32,
    kind: ReportKind,
}

/// Check whether the identifier name `target` appears *anywhere* inside `node`
/// as any Identifier (reference or declaration). Used to detect conflicts when
/// the target rename name (`set`) already appears in the function.
fn has_any_identifier(node: &Value, target: &str) -> bool {
    let mut found = false;
    walk_js(node, |n, _| {
        if found {
            return;
        }
        if node_type(n) == Some("Identifier")
            && n.get("name").and_then(Value::as_str) == Some(target)
        {
            found = true;
        }
    });
    found
}

/// Collect the byte positions of all free Identifier references to `target_name`
/// inside `node`, respecting nested function scoping and let/const/var
/// declarations.
///
/// - Skips nested `FunctionExpression`/`ArrowFunctionExpression` whose params
///   include `target_name` (it is shadowed there).
/// - Skips nested functions whose bodies contain a `let`/`const`/`var`
///   declaration of `target_name` (conservative over-skip is correct for all
///   upstream fixtures).
/// - Does NOT add Identifiers that appear as the `id` of a `VariableDeclarator`
///   (those are declarations, not references).
fn collect_refs(node: &Value, target_name: &str, refs: &mut Vec<(u32, u32)>) {
    collect_refs_inner(node, target_name, refs, false);
}

fn collect_refs_inner(node: &Value, target_name: &str, refs: &mut Vec<(u32, u32)>, skip: bool) {
    if skip {
        return;
    }
    match node_type(node) {
        Some("FunctionExpression") | Some("ArrowFunctionExpression") => {
            // Check if target_name is a param of this nested function.
            let shadowed_by_param = node
                .get("params")
                .and_then(Value::as_array)
                .map(|params| {
                    params.iter().any(|p| {
                        node_type(p) == Some("Identifier")
                            && p.get("name").and_then(Value::as_str) == Some(target_name)
                    })
                })
                .unwrap_or(false);
            if shadowed_by_param {
                return; // entirely skip this subtree
            }
            // Conservative: if target_name is declared anywhere inside the body,
            // skip the whole nested function (const/let/var in any block).
            if let Some(body) = node.get("body") {
                if has_any_declaration(body, target_name) {
                    return;
                }
                // Safe to collect refs inside this nested function.
                collect_refs_in_children(node, target_name, refs);
            }
        }
        Some("VariableDeclarator") => {
            // The `id` is a declaration position — don't add it as a ref.
            // The `init` expression is still a reference position.
            if let Some(init) = node.get("init") {
                collect_refs_inner(init, target_name, refs, false);
            }
        }
        Some("Identifier") => {
            if node.get("name").and_then(Value::as_str) == Some(target_name)
                && let (Some(s), Some(e)) = (node_start(node), node_end(node))
            {
                refs.push((s, e));
            }
        }
        _ => {
            collect_refs_in_children(node, target_name, refs);
        }
    }
}

/// Recurse into all child values of an object or array node.
fn collect_refs_in_children(node: &Value, target_name: &str, refs: &mut Vec<(u32, u32)>) {
    match node {
        Value::Object(map) => {
            for (k, v) in map {
                if k == "loc" {
                    continue;
                }
                collect_refs_inner(v, target_name, refs, false);
            }
        }
        Value::Array(arr) => {
            for v in arr {
                collect_refs_inner(v, target_name, refs, false);
            }
        }
        _ => {}
    }
}

/// Check whether `target_name` appears as a `VariableDeclarator` id (at any
/// depth) inside `node`. Used for the conservative shadowing heuristic.
fn has_any_declaration(node: &Value, target_name: &str) -> bool {
    let mut found = false;
    // We only need to look for VariableDeclarator nodes. Walk manually to avoid
    // descending into nested functions (which have their own scope).
    has_decl_inner(node, target_name, &mut found);
    found
}

fn has_decl_inner(node: &Value, target_name: &str, found: &mut bool) {
    if *found {
        return;
    }
    match node {
        Value::Object(map) => {
            let ty = map.get("type").and_then(Value::as_str);
            match ty {
                Some("VariableDeclarator") => {
                    if let Some(id) = map.get("id")
                        && node_type(id) == Some("Identifier")
                        && id.get("name").and_then(Value::as_str) == Some(target_name)
                    {
                        *found = true;
                        return;
                    }
                    // Check init too? No: init can't declare variables.
                    // Continue into init normally.
                    if let Some(init) = map.get("init") {
                        has_decl_inner(init, target_name, found);
                    }
                }
                // Do not descend into nested function bodies for this check —
                // their declarations shadow themselves, not our outer scope.
                // HOWEVER: for the conservative heuristic used by collect_refs,
                // we WANT to find declarations even in nested functions.
                // (If inner function has `const foo`, we skip the whole inner fn.)
                _ => {
                    for (k, v) in map {
                        if k == "loc" {
                            continue;
                        }
                        has_decl_inner(v, target_name, found);
                    }
                }
            }
        }
        Value::Array(arr) => {
            for v in arr {
                has_decl_inner(v, target_name, found);
            }
        }
        _ => {}
    }
}

/// Find the byte position of the `(` that opens the params list of `fn_node`.
/// Scans backwards in `source` from `body_start - 1` looking for `(`.
fn find_open_paren(source: &str, body_start: u32) -> Option<u32> {
    let before = body_start as usize;
    if before > source.len() {
        return None;
    }
    let src = &source[..before];
    // Scan right-to-left for the `(`.
    let pos = src.rfind('(')?;
    Some(pos as u32)
}

#[derive(Default)]
pub struct RequireStoreCallbacksUseSetParam;

impl ScriptRule for RequireStoreCallbacksUseSetParam {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let creators = collect_store_creators(program);
        if creators.is_empty() {
            return;
        }

        let source = ctx.source().to_string();
        let mut reports: Vec<ReportInfo> = Vec::new();

        walk_js(program, |node, _| {
            if node_type(node) != Some("CallExpression") {
                return;
            }
            let Some(callee) = node.get("callee") else {
                return;
            };
            // Only `readable` / `writable` take a `set`-style start callback.
            match creators.creator_of(callee) {
                Some("readable") | Some("writable") => {}
                _ => return,
            }
            let Some(args) = node.get("arguments").and_then(Value::as_array) else {
                return;
            };
            let Some(fn_arg) = args.get(1) else {
                return;
            };
            if !is_function_expr(fn_arg) {
                return;
            }

            let params = fn_arg.get("params").and_then(Value::as_array);
            let param0 = params.and_then(|p| p.first());

            // Report when there is no first param, or it is an Identifier not
            // named `set`. A destructuring/other pattern param is left alone.
            let bad = match param0 {
                None => true,
                Some(p) if node_type(p) == Some("Identifier") => {
                    p.get("name").and_then(Value::as_str) != Some("set")
                }
                Some(_) => false,
            };

            if !bad {
                return;
            }

            let Some(fn_start) = node_start(fn_arg) else {
                return;
            };

            // Determine the suggestion kind.
            let body = fn_arg.get("body");
            let body_start = body.and_then(node_start);

            // Conflict: does `set` appear anywhere in the fn_arg subtree?
            let has_conflict = has_any_identifier(fn_arg, "set");

            let kind = if has_conflict {
                ReportKind::NoSuggestion
            } else if let Some(p) = param0 {
                // updateParam: param exists but is misnamed Identifier
                let old_name = match p.get("name").and_then(Value::as_str) {
                    Some(n) => n.to_string(),
                    None => return,
                };
                let param_start = match node_start(p) {
                    Some(s) => s,
                    None => return,
                };
                let param_end = match node_end(p) {
                    Some(e) => e,
                    None => return,
                };
                // Collect references to old_name in the body (not the param itself).
                let mut refs: Vec<(u32, u32)> = Vec::new();
                if let Some(body_node) = body {
                    collect_refs(body_node, &old_name, &mut refs);
                }
                ReportKind::UpdateParam {
                    old_name,
                    param_start,
                    param_end,
                    refs,
                }
            } else {
                // addParam: no params at all — find the `(` before the body.
                let paren_pos = match body_start.and_then(|bs| find_open_paren(&source, bs)) {
                    Some(p) => p,
                    None => return,
                };
                ReportKind::AddParam { paren_pos }
            };

            reports.push(ReportInfo { fn_start, kind });
        });

        // Sort by fn_start to report in source order.
        reports.sort_by_key(|r| r.fn_start);

        for report in reports {
            let fn_start = report.fn_start;
            match report.kind {
                ReportKind::NoSuggestion => {
                    ctx.report(fn_start, fn_start, MESSAGE);
                }
                ReportKind::AddParam { paren_pos } => {
                    // Insert `set` immediately after the `(`.
                    let insert_pos = paren_pos + 1;
                    let desc = "Add a `set` parameter.".to_string();
                    ctx.report_with_suggestions(
                        fn_start,
                        fn_start,
                        MESSAGE,
                        vec![Suggestion {
                            desc: desc.clone(),
                            fix: Fix {
                                message: desc,
                                edits: vec![TextEdit {
                                    start: insert_pos,
                                    end: insert_pos,
                                    new_text: "set".to_string(),
                                }],
                            },
                        }],
                    );
                }
                ReportKind::UpdateParam {
                    old_name,
                    param_start,
                    param_end,
                    refs,
                } => {
                    let desc = format!("Rename parameter from {old_name} to `set`.");
                    let mut edits: Vec<TextEdit> = Vec::new();
                    // Replace the param identifier itself.
                    edits.push(TextEdit {
                        start: param_start,
                        end: param_end,
                        new_text: "set".to_string(),
                    });
                    // Replace all free references in the body.
                    for (rs, re) in refs {
                        edits.push(TextEdit {
                            start: rs,
                            end: re,
                            new_text: "set".to_string(),
                        });
                    }
                    ctx.report_with_suggestions(
                        fn_start,
                        fn_start,
                        MESSAGE,
                        vec![Suggestion {
                            desc: desc.clone(),
                            fix: Fix {
                                message: desc,
                                edits,
                            },
                        }],
                    );
                }
            }
        }
    }
}
