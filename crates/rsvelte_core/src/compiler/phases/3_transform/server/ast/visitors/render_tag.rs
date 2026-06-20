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

use super::shared::{EMPTY_COMMENT, TemplateEntry};

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
    let callee_expr = state.reparse_slice(c_start, c_end);

    // -- arguments ----------------------------------------------------------
    // `[$$renderer, ...args]` — `$$renderer` is always the first argument.
    let mut args = vec![state.b.id("$$renderer")];
    if let Some(arg_list) = call_json.get("arguments").and_then(Value::as_array) {
        for arg in arg_list {
            if let (Some(a_start), Some(a_end)) = (
                arg.get("start").and_then(Value::as_u64),
                arg.get("end").and_then(Value::as_u64),
            ) {
                args.push(state.reparse_slice(a_start as usize, a_end as usize));
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

    // KNOWN GAP: `optimiser.render_block` async wrapping is not ported; emit the
    // statement directly (sync path).
    state.template.push(TemplateEntry::Stmt(stmt));

    // Non-async, non-standalone → trailing `<!---->` anchor. A standalone
    // fragment (single non-dynamic render tag) elides it.
    if !state.is_standalone {
        state
            .template
            .push(TemplateEntry::Literal(EMPTY_COMMENT.to_string()));
    }
}
