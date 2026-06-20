//! Server `SvelteElement` visitor — the Rust port of
//! `3-transform/server/visitors/SvelteElement.js` (sync, non-dev, static path).
//!
//! Upstream (写経, prod path):
//! ```js
//! export function SvelteElement(node, context) {
//!     let tag = context.visit(node.tag);
//!     // (build_element_attributes into state.template / state.init)
//!     const attributes = b.block([...state.init, ...build_template(state.template)]);
//!     const children = context.visit(node.fragment, state);  // a `b.block([...])`
//!     statements.push(
//!         b.stmt(
//!             b.call(
//!                 '$.element',
//!                 b.id('$$renderer'),
//!                 tag,
//!                 attributes.body.length > 0 && b.thunk(attributes),
//!                 children.body.length > 0 && b.thunk(children)
//!             )
//!         )
//!     );
//!     context.state.template.push(...create_child_block(statements, …));
//! }
//! ```
//!
//! `<svelte:element this={tag}>…</svelte:element>` lowers to
//! `$.element($$renderer, <tag>, <attrs|void 0>, () => { <children> });`.
//!
//! 写经 gaps (TODO / KNOWN GAP):
//! - attributes (`build_element_attributes`) — the static / spread / directive
//!   attribute path is NOT ported; the attributes argument is always `void 0`
//!   (an authored attribute would be silently dropped here).
//! - dev validation (`$.validate_dynamic_element_tag` / `validate_void_…`).
//! - async `create_child_block` blocker wrapping.
//! - the `void 0` placement matches the text-based oracle: when there are
//!   children but no attributes, the attributes argument is emitted as the
//!   interior `void 0`; when there are no children either, the call is truncated
//!   to `$.element($$renderer, tag)`.

use crate::ast::template::SvelteDynamicElement;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;

use super::shared::{TemplateEntry, build_fragment_body};

/// Visit a `<svelte:element this={tag}>…</svelte:element>` element (static path).
pub fn visit_svelte_element<'a>(node: &SvelteDynamicElement, state: &mut ServerTransformState<'a>) {
    let b = state.b;

    // -- tag expression -----------------------------------------------------
    // For a string-literal tag (`this={"div"}` / `this="svg"`) reparse the raw
    // literal text so the authored quoting is preserved (mirrors the oracle's
    // use of `JsNode::Literal { raw }`). Otherwise reparse the expression span.
    let tag = if node.tag.node_type() == Some("Literal") {
        let raw = match &*node.tag.as_node() {
            crate::ast::typed_expr::JsNode::Literal { raw, .. } => Some(raw.to_string()),
            _ => None,
        };
        match raw {
            Some(r) => {
                let owned = state.allocator.alloc_str(&r);
                state
                    .reparse_slice_owned(owned)
                    .unwrap_or_else(|| state.visit_expr(&node.tag))
            }
            None => state.visit_expr(&node.tag),
        }
    } else {
        match (node.tag.start(), node.tag.end()) {
            (Some(s), Some(e)) if e > s => state.reparse_slice(s as usize, e as usize),
            _ => state.visit_expr(&node.tag),
        }
    };

    // -- children -----------------------------------------------------------
    // KNOWN GAP: attributes are not ported, so the attributes argument is always
    // absent (`void 0` when children follow, dropped otherwise).
    let children_body = build_fragment_body(&node.fragment, state);

    let call = if children_body.is_empty() {
        // `$.element($$renderer, tag)` — trailing args dropped.
        b.call("$.element", vec![b.id("$$renderer"), tag])
    } else {
        // `$.element($$renderer, tag, void 0, () => { children })`
        let thunk = b.thunk_block(children_body, false);
        b.call("$.element", vec![b.id("$$renderer"), tag, b.void0(), thunk])
    };

    state.template.push(TemplateEntry::Stmt(b.stmt(call)));
}
