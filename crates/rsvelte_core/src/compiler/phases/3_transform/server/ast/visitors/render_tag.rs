//! Server `RenderTag` visitor — the Rust port of
//! `3-transform/server/visitors/RenderTag.js` (sync, non-optional path).
//!
//! Upstream (写経):
//! ```js
//! export function RenderTag(node, context) {
//!     const optimiser = new PromiseOptimiser();
//!     const callee = unwrap_optional(node.expression).callee;
//!     const raw_args = unwrap_optional(node.expression).arguments;
//!     const snippet_function = optimiser.transform(context.visit(callee), …);
//!     const snippet_args = raw_args.map((arg, i) => optimiser.transform(context.visit(arg), …));
//!     let statement = b.stmt(
//!         (node.expression.type === 'CallExpression' ? b.call : b.maybe_call)(
//!             snippet_function, b.id('$$renderer'), ...snippet_args
//!         )
//!     );
//!     context.state.template.push(...optimiser.render_block([statement]));
//!     if (!optimiser.is_async() && !context.state.is_standalone) {
//!         context.state.template.push(empty_comment);
//!     }
//! }
//! ```
//!
//! `{@render foo(a, b)}` lowers to `foo($$renderer, a, b);` followed by an
//! `<!---->` anchor comment. The callee and arguments are decomposed from the
//! parsed `CallExpression`'s child spans and re-parsed (mirroring the
//! text-based oracle's source-slicing), since the `PromiseOptimiser` / store /
//! prop rewrites are not threaded through the AST `visit_expr` yet.
//!
//! 写经 gaps (TODO / KNOWN GAP):
//! - async path (`optimiser.is_async()`) — needs blocker plumbing.
//! - optional-chain `{@render foo?.()}` (`ChainExpression`) — emitted as
//!   `foo?.($$renderer, …)` via a manual optional `CallExpression`, but without
//!   the `PromiseOptimiser`. Falls through here only for the simple shape.
//! - `is_standalone` (single-snippet boundary elision) — always emits the
//!   trailing `<!---->`.

use crate::ast::template::RenderTag;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use serde_json::Value;

use super::shared::{EMPTY_COMMENT, PromiseOptimiser, TemplateEntry};

/// Slice the component source `[start, end)` (the optimiser blocker / await
/// predicate operates on raw source text). `None` for an out-of-range span.
fn source_slice(state: &ServerTransformState<'_>, start: usize, end: usize) -> Option<String> {
    if end <= start || end > state.source.len() {
        return None;
    }
    Some(state.source[start..end].to_string())
}

/// Visit a `{@render expr(args)}` tag (sync path).
pub fn visit_render_tag<'a>(node: &RenderTag, state: &mut ServerTransformState<'a>) {
    let expr_json = node.expression.as_json();
    let is_optional = node.expression.node_type() == Some("ChainExpression");

    // Unwrap the optional chain to reach the inner `CallExpression`.
    let call_json: &Value = if is_optional {
        match expr_json.get("expression") {
            Some(v) => v,
            None => return,
        }
    } else {
        expr_json
    };

    if call_json.get("type").and_then(Value::as_str) != Some("CallExpression") {
        return;
    }

    // -- callee -------------------------------------------------------------
    let callee = match call_json.get("callee") {
        Some(c) => c,
        None => return,
    };
    let (c_start, c_end) = match (
        callee.get("start").and_then(Value::as_u64),
        callee.get("end").and_then(Value::as_u64),
    ) {
        (Some(s), Some(e)) => (s as usize, e as usize),
        _ => return,
    };
    // 写经 `context.visit(callee)`: the snippet-function expression is read-wrapped,
    // so a `$derived` snippet (`let snippet = $derived(...)`) becomes `snippet()`
    // and a store-sub snippet (`$snippet`) becomes
    // `$.store_get($$store_subs ??= {}, "$snippet", snippet)`.
    let mut callee_expr = state.reparse_slice(c_start, c_end);
    state.wrap_reads_in_place(&mut callee_expr);

    // 写经 `optimiser.transform(context.visit(callee), …)`: feed the callee through
    // a fresh `PromiseOptimiser` so a callee reading a top-level-await blocker
    // (`{@render snippet(double)}` where `double` is a `$derived(await …)`) wraps
    // the render statement in `$$renderer.async_block([$$promises[N]…], …)`.
    let mut optimiser = PromiseOptimiser::new();
    if let Some(t) = source_slice(state, c_start, c_end) {
        callee_expr = optimiser.transform(state, &t, callee_expr);
    }

    // -- arguments ----------------------------------------------------------
    // `[$$renderer, ...args]` — `$$renderer` is always the first argument.
    // 写经 `raw_args.map(arg => optimiser.transform(context.visit(arg), …))`:
    // each argument is also read-wrapped (a `$derived` arg becomes `arg()`) and
    // routed through the optimiser so a blocked argument makes the tag async.
    let mut args = vec![state.b.id("$$renderer")];
    if let Some(arg_list) = call_json.get("arguments").and_then(Value::as_array) {
        for arg in arg_list {
            if let (Some(a_start), Some(a_end)) = (
                arg.get("start").and_then(Value::as_u64),
                arg.get("end").and_then(Value::as_u64),
            ) {
                let (a_start, a_end) = (a_start as usize, a_end as usize);
                let mut arg_expr = state.reparse_slice(a_start, a_end);
                state.wrap_reads_in_place(&mut arg_expr);
                if let Some(t) = source_slice(state, a_start, a_end) {
                    arg_expr = optimiser.transform(state, &t, arg_expr);
                }
                args.push(arg_expr);
            }
        }
    }

    // -- build `callee($$renderer, ...args)` (optional when ChainExpression) -
    let call = if is_optional {
        state.b.optional_call(callee_expr, args)
    } else {
        state.b.call(callee_expr, args)
    };
    let stmt = state.b.stmt(call);

    // 写经 `context.state.template.push(...optimiser.render_block([statement]))`:
    // async (blocker / inline-await) → `$$renderer.async_block([$$promises[N]…],
    // ($$renderer) => { <statement> })`; sync → the statement unchanged.
    let is_async = optimiser.is_async();
    for s in optimiser.render_block(state, vec![stmt]) {
        state.template.push(TemplateEntry::Stmt(s));
    }

    // Non-async, non-standalone → trailing `<!---->` anchor. A standalone
    // fragment (single non-dynamic render tag) elides it; an ASYNC tag also
    // elides it (写经 `if (!optimiser.is_async() && !is_standalone)`).
    if !is_async && !state.is_standalone {
        state
            .template
            .push(TemplateEntry::Literal(EMPTY_COMMENT.to_string()));
    }
}
