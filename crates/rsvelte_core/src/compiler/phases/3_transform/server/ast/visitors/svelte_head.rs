//! Server `SvelteHead` visitor — the Rust port of
//! `3-transform/server/visitors/SvelteHead.js`.
//!
//! Upstream (写経):
//! ```js
//! export function SvelteHead(node, context) {
//!     const block = context.visit(node.fragment);   // a `b.block([...])`
//!     context.state.template.push(
//!         b.stmt(
//!             b.call(
//!                 '$.head',
//!                 b.literal(hash(filename)),
//!                 b.id('$$renderer'),
//!                 b.arrow([b.id('$$renderer')], block)
//!             )
//!         )
//!     );
//! }
//! ```
//!
//! `<svelte:head>…</svelte:head>` lowers to
//! `$.head('<hash>', $$renderer, ($$renderer) => { <body> });`. The hash is the
//! component's `filename_hash` (mirrors upstream's `hash(filename)`).

use crate::ast::template::SvelteElement;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;

use super::shared::{TemplateEntry, build_fragment_body};

/// Visit a `<svelte:head>…</svelte:head>` element.
pub fn visit_svelte_head<'a>(node: &SvelteElement, state: &mut ServerTransformState<'a>) {
    let b = state.b;
    let hash = state.analysis.filename_hash.clone();

    // Body fragment rendered as the arrow body's statements (upstream passes the
    // visited `b.block([...])` directly as the arrow body, so we splice the
    // fragment statements straight in — no extra `{ }` nesting).
    // SvelteHead body is NOT an `is_text_first` parent.
    let body_stmts = build_fragment_body(&node.fragment, false, false, state);

    // `($$renderer) => { <body> }`
    let params = b.params(vec![b.id_pat("$$renderer")], None);
    let arrow = b.arrow(params, b.body(body_stmts), false, false);

    // `$.head('<hash>', $$renderer, ($$renderer) => { ... })`
    let call = b.call("$.head", vec![b.string(&hash), b.id("$$renderer"), arrow]);
    state.template.push(TemplateEntry::Stmt(b.stmt(call)));
}
