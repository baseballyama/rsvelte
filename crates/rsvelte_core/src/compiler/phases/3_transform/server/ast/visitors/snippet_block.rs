//! Server `SnippetBlock` visitor — the Rust port of
//! `3-transform/server/visitors/SnippetBlock.js` (non-dev path).
//!
//! Upstream (写经):
//! ```js
//! export function SnippetBlock(node, context) {
//!     let fn = b.function_declaration(
//!         node.expression,                          // the snippet name id
//!         [b.id('$$renderer'), ...node.parameters], // ($$renderer, ...params)
//!         context.visit(node.body)                  // a `b.block([...])`
//!     );
//!     const statements = node.metadata.can_hoist ? context.state.hoisted
//!                                                 : context.state.init;
//!     // dev: validate_snippet_args + prevent_snippet_stringification (KNOWN GAP)
//!     statements.push(fn);
//! }
//! ```
//!
//! A snippet lowers to a `function name($$renderer, ...params) { <body> }`
//! declaration. The `node.parameters` are emitted VERBATIM as formal parameters
//! — including destructuring patterns (`{ count }` / `[x]`) and default values
//! (`id = default_arg()`, `b = (1, 2)`) — because upstream spreads them directly
//! into the parameter list. When `node.metadata.can_hoist` is true the
//! declaration is lifted to module scope (`state.hoisted`); otherwise it goes into
//! the SHARED component-level `state.init` (here `state.snippet_inits`), which the
//! program assembly prepends to the component-function body ahead of the rendered
//! template.
//!
//! The dev-mode `$.validate_snippet_args` prologue and
//! `$.prevent_snippet_stringification` registration are KNOWN GAPs.

use crate::ast::template::SnippetBlock;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use serde_json::Value;

/// Visit a `{#snippet name(params)}...{/snippet}` block.
pub fn visit_snippet_block<'a>(node: &SnippetBlock, state: &mut ServerTransformState<'a>) {
    let b = state.b;

    // Snippet name — `node.expression` is the name identifier.
    let name = node
        .expression
        .identifier_name()
        .map(|s| s.to_string())
        .unwrap_or_else(|| "snippet".to_string());

    // -- parameters ---------------------------------------------------------
    // 写经 upstream: `[b.id('$$renderer'), ...node.parameters]` — the declared
    // parameters are spread VERBATIM into the formal-parameter list. We
    // reconstruct each parameter's source spelling (mirroring the text oracle's
    // `extract_snippet_param`: TS-strip, default-value via span, parenthesize a
    // SequenceExpression default) and reparse the whole list into oxc
    // FormalParameters so destructuring patterns + default values survive.
    let mut param_srcs: Vec<String> = vec!["$$renderer".to_string()];
    for param in &node.parameters {
        let s = extract_snippet_param(param, state.source);
        if !s.is_empty() {
            param_srcs.push(s);
        }
    }
    let params = state
        .reparse_params(&param_srcs)
        // Fallback (unreachable for valid input): `($$renderer)` only.
        .unwrap_or_else(|| b.params(vec![b.id_pat("$$renderer")], None));

    // The snippet PARAMETERS shadow any same-named component-level `$derived` /
    // `$store` binding inside the body (upstream `context.state.scope` resolves a
    // body identifier to the snippet parameter, a normal binding, not the
    // component derived). Push the param names as a shadow frame around the body
    // build so e.g. `{#snippet foo(doubled)} {doubled} {/snippet}` does not
    // read-wrap `doubled` to `doubled()`.
    let mut shadow = rustc_hash::FxHashSet::default();
    for param in &node.parameters {
        collect_param_pattern_names(param, &mut shadow);
    }
    state.shadowed_names.push(shadow);

    // Body: render the fragment as a `{ ... }` block, then reuse its statements
    // as the function body.
    // SnippetBlock body IS an `is_text_first` parent (upstream `clean_nodes`).
    let body_block = super::shared::build_fragment_body(&node.body, true, state);
    let fn_body = b.body(body_block);

    state.shadowed_names.pop();

    let fn_decl = b.function_declaration(&name, params, fn_body, false);

    // 写经 upstream `fn.___snippet = true`: record the snippet's function name so
    // the `uses_component_bindings` settle-loop assembly can hoist this
    // declaration ahead of `$$render_inner` (snippet functions render OUTSIDE the
    // re-render loop).
    state.snippet_names.insert(name.clone());

    // 写经 `node.metadata.can_hoist ? state.hoisted : state.init`: a hoistable
    // snippet (no instance-state reference) goes to module scope; otherwise it
    // is emitted INLINE at its source position in the enclosing fragment's
    // template stream. The text-based oracle this pipeline matches does not keep a
    // separate `init` buffer — it prints a non-hoistable snippet function exactly
    // where it appears in the child run, so a `{@const}` declared before the
    // `{#snippet}` precedes it (`function` hoisting makes the order irrelevant at
    // runtime, but byte-parity requires source order). `function` declarations
    // flush the joinable text run (like a `{@const}`), so the rendered `push`
    // calls that surround them stay in place.
    // Upstream `can_hoist = is_root_level && body_refs_only_own_params`. Our
    // analyze does NOT bump its depth counters for `<svelte:boundary>`, so a
    // snippet that sits directly inside a boundary's children fragment (e.g.
    // `{#snippet children()}` in `<svelte:boundary>`) wrongly reports
    // `can_hoist == true`. Re-impose the root-level gate with the server-side
    // `fragment_depth` (root fragment = 1; any nested block / boundary body ≥ 2)
    // so a boundary-nested snippet is emitted INLINE in the boundary block rather
    // than hoisted to module scope — mirroring the same gate the SvelteBoundary
    // visitor applies to the `failed` snippet.
    if node.metadata.can_hoist && state.fragment_depth <= 1 {
        state.hoisted.push(fn_decl);
    } else {
        state
            .template
            .push(super::shared::TemplateEntry::HoistableDecl(fn_decl));
    }
}

/// Collect every binding identifier name introduced by a snippet / slot
/// parameter pattern (`id`, `{ a, b: c }`, `[x, ...y]`, `id = default`). Walks the
/// JSON pattern shape since parameters are stored as `crate::ast::js::Expression`.
/// Used to populate the shadow frame so a parameter shadows a component-level
/// `$derived` / `$store` binding of the same name within the snippet body.
pub(super) fn collect_param_pattern_names(
    expr: &crate::ast::js::Expression,
    out: &mut rustc_hash::FxHashSet<String>,
) {
    collect_pattern_names_json(expr.as_json(), out);
}

fn collect_pattern_names_json(json: &Value, out: &mut rustc_hash::FxHashSet<String>) {
    let ty = json.get("type").and_then(Value::as_str).unwrap_or("");
    match ty {
        "Identifier" => {
            if let Some(name) = json.get("name").and_then(Value::as_str) {
                out.insert(name.to_string());
            }
        }
        "AssignmentPattern" => {
            if let Some(left) = json.get("left") {
                collect_pattern_names_json(left, out);
            }
        }
        "RestElement" => {
            if let Some(arg) = json.get("argument") {
                collect_pattern_names_json(arg, out);
            }
        }
        "ArrayPattern" => {
            if let Some(elems) = json.get("elements").and_then(Value::as_array) {
                for el in elems {
                    if !el.is_null() {
                        collect_pattern_names_json(el, out);
                    }
                }
            }
        }
        "ObjectPattern" => {
            if let Some(props) = json.get("properties").and_then(Value::as_array) {
                for prop in props {
                    let pty = prop.get("type").and_then(Value::as_str).unwrap_or("");
                    if pty == "RestElement" {
                        if let Some(arg) = prop.get("argument") {
                            collect_pattern_names_json(arg, out);
                        }
                    } else if let Some(value) = prop.get("value") {
                        collect_pattern_names_json(value, out);
                    }
                }
            }
        }
        _ => {}
    }
}

/// Reconstruct a snippet parameter's source spelling, stripping any TypeScript
/// type annotation. Mirrors the text oracle's `extract_snippet_param`: an
/// `AssignmentPattern` (default value) keeps `<lhs> = <rhs>` (parenthesizing a
/// `SequenceExpression` default), and `ObjectPattern`/`ArrayPattern`/identifier
/// patterns are taken from the source span with the type annotation stripped.
pub(super) fn extract_snippet_param(expr: &crate::ast::js::Expression, source: &str) -> String {
    let json = expr.as_json();
    let node_type = json.get("type").and_then(Value::as_str).unwrap_or("");

    match node_type {
        "AssignmentPattern" => {
            let left = json.get("left");
            let right = json.get("right");

            let left_str = if let Some(left_val) = left {
                let left_expr = crate::ast::js::Expression::from_json(left_val.clone());
                let start = left_expr.start().unwrap_or(0) as usize;
                let end = left_expr.end().unwrap_or(0) as usize;
                if end > start && end <= source.len() {
                    strip_ts_type_annotation(&source[start..end])
                } else {
                    String::new()
                }
            } else {
                String::new()
            };

            let right_str = if let Some(right_val) = right {
                let right_expr = crate::ast::js::Expression::from_json(right_val.clone());
                let start = right_expr.start().unwrap_or(0) as usize;
                let end = right_expr.end().unwrap_or(0) as usize;
                if end > start && end <= source.len() {
                    let val = source[start..end].trim().to_string();
                    // A SequenceExpression default (`c = (2, 3)`) covers only the
                    // inner `2, 3` span — re-wrap it in parens to preserve the
                    // comma-expression semantics in parameter position.
                    let right_type = right_val.get("type").and_then(Value::as_str).unwrap_or("");
                    if right_type == "SequenceExpression" {
                        format!("({val})")
                    } else {
                        val
                    }
                } else {
                    String::new()
                }
            } else {
                String::new()
            };

            if left_str.is_empty() {
                String::new()
            } else if right_str.is_empty() {
                left_str
            } else {
                format!("{left_str} = {right_str}")
            }
        }
        _ => {
            // Identifier / ObjectPattern / ArrayPattern: take the source span and
            // strip the type annotation.
            let start = expr.start().unwrap_or(0) as usize;
            let end = expr.end().unwrap_or(0) as usize;
            if end > start && end <= source.len() {
                strip_ts_type_annotation(&source[start..end])
            } else {
                String::new()
            }
        }
    }
}

/// Strip a top-level TypeScript type annotation from a parameter source slice.
/// Delegates to the server helper used by the text oracle so the two pipelines
/// strip identically (handles `name: type`, destructure `: {…}` annotations, and
/// nested generics / object-type braces).
fn strip_ts_type_annotation(src: &str) -> String {
    crate::compiler::phases::phase3_transform::server::helpers::strip_ts_type_annotation(src)
}
