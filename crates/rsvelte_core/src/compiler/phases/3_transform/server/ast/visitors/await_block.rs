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
//!
//! Destructuring `node.value` patterns (`{#await … then { a, b }}`, `[a, b]`,
//! defaults, rests, computed/nested patterns) ARE handled: [`value_pattern`]
//! re-parses the destructuring slice via `reparse_pattern`.

use crate::ast::template::AwaitBlock;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use oxc_ast::ast::BindingPattern;

use super::shared::{
    BLOCK_CLOSE, TemplateEntry, build_fragment_block, create_child_block, expr_text_blockers,
    save_wrap_expr_text, text_has_await,
};

/// Visit an `{#await expr}...{:then v}...{/await}` block.
///
/// 写经 `AwaitBlock.js`:
/// - `expression = context.visit(node.expression)` — the AwaitExpression server
///   visitor rewrites an inline `await x` to `(await $.save(x))()`.
/// - when `node.metadata.expression.has_await` (an inline await in the
///   expression), the visited expression is wrapped in an async IIFE
///   `(async () => <expr>)()` so the `$.await` driver still receives a promise
///   (`{#await await ...}` should NOT eagerly wait on the inner await).
/// - the whole `$.await(...)` statement is then routed through
///   [`create_child_block`] with the expression's top-level-await blockers +
///   `has_await`, so a blocker reference becomes
///   `$$renderer.async_block([$$promises[N]…], …)` and an inline await becomes
///   `$$renderer.child_block(async …)`.
pub fn visit_await_block<'a>(node: &AwaitBlock, state: &mut ServerTransformState<'a>) {
    // Detect the async axes from the expression source against the precomputed
    // instance blocker map (only populated under `experimental.async`).
    let expr_text = state.expr_source(&node.expression).map(|s| s.to_string());
    let blocker_indices: Vec<usize> = expr_text
        .as_deref()
        .map(|t| expr_text_blockers(state, t))
        .unwrap_or_default();
    let has_await = expr_text.as_deref().is_some_and(text_has_await);

    // `context.visit(node.expression)` → `$.save`-wrap any inline await.
    let mut expression = if has_await {
        save_wrap_expr_text(state, expr_text.as_deref().unwrap_or(""))
    } else {
        state.visit_expr(&node.expression)
    };
    // `has_await` → async-IIFE-wrap so `$.await` receives a promise (the inner
    // await is not eagerly awaited).
    if has_await {
        let b = state.b;
        let iife = b.arrow_expr(b.empty_params(), expression, true);
        expression = b.call(iife, vec![]);
    }

    // Pending callback: `() => { <pending body> }` (thunk of a block).
    let pending_block = match &node.pending {
        Some(frag) => build_fragment_block(frag, false, state),
        None => state.b.block(vec![]),
    };
    let pending_thunk = state
        .b
        .thunk_block(unwrap_block(pending_block, state), false);

    // Then callback: `(value) => { <then body> }`.
    //
    // The `then` value pattern (`{#await … then result}`) introduces a binding
    // that SHADOWS any same-named component-level `$derived` / `$store` inside the
    // then body (upstream `context.state.scope` resolves a body identifier to the
    // await-value parameter, a normal binding — NOT the component derived). Push
    // the pattern names as a shadow frame around the then-body build so `{result}`
    // stays bare `result` rather than read-wrapping to `result()`. (Mirrors the
    // snippet-parameter shadow frame in `SnippetBlock.js`.)
    let mut shadow = rustc_hash::FxHashSet::default();
    if let Some(v) = &node.value {
        super::snippet_block::collect_param_pattern_names(v, &mut shadow);
    }
    state.shadowed_names.push(shadow);
    let then_block = match &node.then {
        Some(frag) => build_fragment_block(frag, false, state),
        None => state.b.block(vec![]),
    };
    state.shadowed_names.pop();
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

    // create_child_block: blockers → `$$renderer.async_block([…], …)`, an inline
    // await → `$$renderer.child_block(async …)`, else the statement verbatim.
    let stmt = b.stmt(call);
    let wrapped = create_child_block(state, vec![stmt], &blocker_indices, has_await);
    for stmt in wrapped {
        state.template.push(TemplateEntry::Stmt(stmt));
    }
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

/// Build the `then` value binding pattern. An identifier maps to `b.id_pat`; a
/// destructuring pattern (`{ a, b }`, `[a, b]`, `{ a = 3 }`, `{ a, ...rest }`,
/// `{ [computed]: v }`, nested rests, …) is re-parsed verbatim from its source
/// span — mirroring upstream's `context.visit(node.value)` which preserves the
/// full `Pattern`. The previous identifier-only path silently dropped the
/// destructuring (emitting `$$value`), so every binding in the `then` body went
/// undefined; this re-parse keeps the column-faithful pattern.
fn value_pattern<'a>(
    v: &crate::ast::js::Expression,
    state: &ServerTransformState<'a>,
) -> BindingPattern<'a> {
    if let Some(name) = v.identifier_name() {
        return state.b.id_pat(name);
    }
    // Destructuring `then` value — re-parse the source slice (`{ a }` / `[a, b]`
    // / `{ a = 3 }` / `{ a, ...rest }` / nested) as the binding pattern of a
    // throwaway `let <slice> = 0;` declaration via `reparse_pattern`.
    if let (Some(start), Some(end)) = (v.start(), v.end()) {
        let slice = state.source[start as usize..end as usize].trim();
        if let Some(pat) = state.reparse_pattern(slice) {
            return pat;
        }
    }
    state.b.id_pat("$$value")
}
