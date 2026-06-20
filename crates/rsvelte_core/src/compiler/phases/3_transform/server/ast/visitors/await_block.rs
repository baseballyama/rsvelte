//! Server `AwaitBlock` visitor — the Rust port of
//! `3-transform/server/visitors/AwaitBlock.js` (sync, no-blocker path).
//!
//! Upstream (写经):
//! ```js
//! export function AwaitBlock(node, context) {
//!     let expression = context.visit(node.expression);
//!     if (node.metadata.expression.has_await) {
//!         expression = b.call(b.arrow([], expression, true));   // IIFE wrap (KNOWN GAP)
//!     }
//!     let statement = b.stmt(b.call(
//!         '$.await',
//!         b.id('$$renderer'),
//!         expression,
//!         b.thunk(node.pending ? context.visit(node.pending) : b.block([])),
//!         b.arrow(node.value ? [context.visit(node.value)] : [],
//!                 node.then ? context.visit(node.then) : b.block([]))
//!     ));
//!     context.state.template.push(
//!         ...create_child_block([statement], blockers, has_await),  // sync: just [statement]
//!         block_close                                               // `<!--]-->`
//!     );
//! }
//! ```
//!
//! Note the server `$.await` has NO catch callback (only pending + then). The
//! `then` arrow takes the resolved value pattern (`node.value`) as its single
//! parameter.
//!
//! KNOWN GAPs:
//! - `node.metadata.expression.has_await` IIFE wrap + the `create_child_block`
//!   `$$renderer.async_block` / `$$renderer.child_block` blocker wrapping — needs
//!   the PromiseOptimiser. The sync, blocker-free path is emitted as a bare
//!   `$.await(...)` statement.
//! - destructuring `node.value` patterns (only identifier handled; else re-parse).

use crate::ast::template::AwaitBlock;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use oxc_ast::ast::BindingPattern;

use super::shared::{BLOCK_CLOSE, TemplateEntry, build_fragment_block};

/// Visit an `{#await expr}...{:then v}...{/await}` block (sync, no-blocker path).
pub fn visit_await_block<'a>(node: &AwaitBlock, state: &mut ServerTransformState<'a>) {
    let expression = state.visit_expr(&node.expression);
    // KNOWN GAP: `has_await` IIFE wrap is not applied.

    // Pending callback: `() => { <pending body> }` (thunk of a block).
    let pending_block = match &node.pending {
        Some(frag) => build_fragment_block(frag, state),
        None => state.b.block(vec![]),
    };
    let pending_thunk = state
        .b
        .thunk_block(unwrap_block(pending_block, state), false);

    // Then callback: `(value) => { <then body> }`.
    let then_block = match &node.then {
        Some(frag) => build_fragment_block(frag, state),
        None => state.b.block(vec![]),
    };
    let then_params = match &node.value {
        Some(v) => vec![value_pattern(v, state)],
        None => vec![],
    };
    let b = state.b;
    let then_body = b.body(unwrap_block(then_block, state));
    let then_arrow = b.arrow(b.params(then_params, None), then_body, false, false);

    let call = b.call(
        "$.await",
        vec![b.id("$$renderer"), expression, pending_thunk, then_arrow],
    );

    // sync, no blockers: create_child_block returns [statement] unchanged.
    state.template.push(TemplateEntry::Stmt(b.stmt(call)));
    state
        .template
        .push(TemplateEntry::Literal(BLOCK_CLOSE.to_string()));
}

/// Extract the statement list out of a `BlockStatement` we just built (so it can
/// be re-wrapped as a thunk / arrow body).
fn unwrap_block<'a>(
    block: oxc_ast::ast::Statement<'a>,
    _state: &ServerTransformState<'a>,
) -> Vec<oxc_ast::ast::Statement<'a>> {
    match block {
        oxc_ast::ast::Statement::BlockStatement(b) => b.unbox().body.into_iter().collect(),
        other => vec![other],
    }
}

/// Build the `then` value binding pattern (identifier → `id_pat`; else reuse the
/// each-block re-parse fallback).
fn value_pattern<'a>(
    v: &crate::ast::js::Expression,
    state: &ServerTransformState<'a>,
) -> BindingPattern<'a> {
    if let Some(name) = v.identifier_name() {
        return state.b.id_pat(name);
    }
    state.b.id_pat("$$value")
}
