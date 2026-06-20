//! Server `TitleElement` visitor — the Rust port of
//! `3-transform/server/visitors/TitleElement.js`.
//!
//! Upstream (写経):
//! ```js
//! export function TitleElement(node, context) {
//!     // title is guaranteed to contain only text/expression tag children
//!     const template = [b.literal('<title>')];
//!     process_children(node.fragment.nodes, { ...context, state: { ...context.state, template } });
//!     template.push(b.literal('</title>'));
//!     context.state.init.push(
//!         b.stmt(
//!             b.call('$$renderer.title', b.arrow([b.id('$$renderer')], b.block(build_template(template))))
//!         )
//!     );
//! }
//! ```
//!
//! `<title>…</title>` lowers to `$$renderer.title(($$renderer) => { <body> });`
//! where the body is the coalesced `$$renderer.push(\`<title>…</title>\`)`.
//! Upstream pushes to `init`; the AST pipeline has no separate `init`/`template`
//! split for the simple cases, so the call is pushed as a `Stmt` entry into the
//! surrounding template run (correct when title is inside `<svelte:head>`).

use crate::ast::template::TitleElement;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;

use super::shared::{TemplateEntry, build_template, process_children};

/// Visit a `<title>…</title>` element.
pub fn visit_title_element<'a>(node: &TitleElement, state: &mut ServerTransformState<'a>) {
    let b = state.b;

    // Build the title body in an isolated template buffer seeded with the
    // `<title>` opener (mirrors upstream's `const template = [b.literal('<title>')]`).
    let saved = std::mem::take(&mut state.template);
    state
        .template
        .push(TemplateEntry::Literal("<title>".to_string()));
    process_children(&node.fragment.nodes, state);
    state
        .template
        .push(TemplateEntry::Literal("</title>".to_string()));
    let inner = std::mem::replace(&mut state.template, saved);
    let body_stmts = build_template(inner, state);

    // `($$renderer) => { <body> }`
    let params = b.params(vec![b.id_pat("$$renderer")], None);
    let arrow = b.arrow(params, b.body(body_stmts), false, false);

    // `$$renderer.title(($$renderer) => { ... })`
    let call = b.call("$$renderer.title", vec![arrow]);
    state.template.push(TemplateEntry::Stmt(b.stmt(call)));
}
