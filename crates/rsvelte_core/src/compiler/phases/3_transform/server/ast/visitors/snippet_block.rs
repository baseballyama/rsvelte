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

    // Body: render the fragment as a `{ ... }` block, then reuse its statements
    // as the function body.
    // SnippetBlock body IS an `is_text_first` parent (upstream `clean_nodes`).
    let body_block = super::shared::build_fragment_body(&node.body, true, state);
    let fn_body = b.body(body_block);

    let fn_decl = b.function_declaration(&name, params, fn_body, false);

    // 写经 `node.metadata.can_hoist ? state.hoisted : state.init`: a hoistable
    // snippet (no instance-state reference) goes to module scope; otherwise it
    // is collected into the shared component-level `init` slot.
    if node.metadata.can_hoist {
        state.hoisted.push(fn_decl);
    } else {
        state.snippet_inits.push(fn_decl);
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
                let left_expr = crate::ast::js::Expression::Value(left_val.clone());
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
                let right_expr = crate::ast::js::Expression::Value(right_val.clone());
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
