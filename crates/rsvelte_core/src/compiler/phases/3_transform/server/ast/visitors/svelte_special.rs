//! Server visitors for the special elements `<svelte:window>`,
//! `<svelte:document>`, `<svelte:body>` and `<svelte:options>` — the Rust ports
//! of upstream `3-transform/server/visitors/{SvelteWindow,SvelteDocument,
//! SvelteBody}.js` (and the *absence* of a `SvelteOptions` server visitor).
//!
//! Upstream (写经):
//!
//! - `SvelteWindow` / `SvelteDocument` — there is **no** server visitor file for
//!   these in `3-transform/server/visitors/`; they are window/document-only
//!   event-binding hosts and produce no SSR markup. So the AST pipeline emits
//!   nothing for them (matching the text oracle, which filters them out of every
//!   meaningful/visible-node computation).
//!
//! - `SvelteBody`:
//!   ```js
//!   export function SvelteBody(node, context) {
//!       context.next();
//!   }
//!   ```
//!   `context.next()` continues the default traversal into `node.fragment`,
//!   serializing the body element's CHILDREN **inline** into the surrounding
//!   template stream (NOT wrapped in a `{ ... }` fragment block — `<svelte:body>`
//!   is not itself a DOM element server-side, only a binding/handler host whose
//!   children render where the tag sits). This mirrors upstream visiting the
//!   children with the same `context.state`, so they flow into `state.template`
//!   exactly like a `RegularElement`'s children would (sans open/close literals).
//!   In practice the analyzer FORBIDS children on `<svelte:body>`
//!   (`svelte_meta_invalid_content`: "`<svelte:body>` cannot have children"), so
//!   the inline walk is almost always over an empty fragment and emits nothing;
//!   we still port the inline-render semantics faithfully.
//!
//! - `SvelteOptions` (`<svelte:options>`) — likewise has no server visitor; it is
//!   a compile-time-only configuration element and emits nothing.
//!
//! KNOWN GAP: the dropped event-handler / binding expressions on these elements
//! can carry interior comments that the text oracle re-inserts via esrap's
//! lost-comment tracking (`record_lost_expression_comments`). The AST pipeline
//! does not yet reproduce those stray comments — but no markup is affected, only
//! the (rare) comment-preservation edge case.

use crate::ast::template::SvelteElement;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;

use super::shared::process_children;

/// Visit `<svelte:window …>` / `<svelte:document …>` — render nothing.
///
/// Upstream has no server visitor for either, so they fall through to the
/// no-op default. They host only window/document event bindings and produce no
/// SSR output.
pub fn visit_svelte_window_or_document<'a>(
    _node: &SvelteElement,
    _state: &mut ServerTransformState<'a>,
) {
    // No output — port of the absent upstream `SvelteWindow` / `SvelteDocument`
    // server visitors.
}

/// Visit `<svelte:options …>` — render nothing.
///
/// `<svelte:options>` is a compile-time configuration element with no server
/// visitor upstream; it produces no SSR output.
pub fn visit_svelte_options<'a>(_node: &SvelteElement, _state: &mut ServerTransformState<'a>) {
    // No output — port of the absent upstream `SvelteOptions` server visitor.
}

/// Visit `<svelte:body>…</svelte:body>` — render its children INLINE.
///
/// Port of upstream `SvelteBody`'s `context.next()`: the body element itself
/// emits no open/close markup server-side, but its children are serialized into
/// the current template stream (NOT a nested fragment block). Children are
/// walked with NO `RegularElement` parent and the default `html` namespace, and
/// `<svelte:body>` is NOT an `is_text_first` parent (it is absent from upstream's
/// `is_text_first` parent list).
pub fn visit_svelte_body<'a>(node: &SvelteElement, state: &mut ServerTransformState<'a>) {
    process_children(&node.fragment.nodes, None, "html", state);
}
