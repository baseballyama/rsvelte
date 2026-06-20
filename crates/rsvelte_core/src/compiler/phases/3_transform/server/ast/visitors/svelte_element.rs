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
//! - dev validation (`$.validate_dynamic_element_tag` / `validate_void_…`).
//! - async `create_child_block` blocker wrapping.
//! - the interior `void 0` placement matches the text-based oracle: when there
//!   are children but no attributes, the attributes argument is emitted as the
//!   interior `void 0`; when there are no children either, the call is truncated
//!   to `$.element($$renderer, tag)`.
//! - attribute coverage is now ported by reusing the `RegularElement`
//!   `build_element_attributes` machinery (static / dynamic / `class:` /
//!   `style:` / `bind:` / spread + css-scope-hash); the residual per-attribute
//!   gaps (`use:` / `@attach`, the `style:|important` split inside spread, the
//!   get/set bind form) are inherited from `element.rs` and noted there.

use crate::ast::template::{
    Fragment, RegularElement, RegularElementMetadata, SvelteDynamicElement,
};
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;

use super::element::build_element_attributes;
use super::shared::{TemplateEntry, build_fragment_body, build_template};

/// Visit a `<svelte:element this={tag}>…</svelte:element>` element (static path).
pub fn visit_svelte_element<'a>(node: &SvelteDynamicElement, state: &mut ServerTransformState<'a>) {
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
        // 写经 `context.visit(node.tag)`: the tag expression is visited by the
        // global `Identifier` visitor, so a store/derived read in `this={$tag}`
        // is read-wrapped (`$.store_get(...)`). Route through `visit_expr` (which
        // applies the read-wrapping pass) rather than the verbatim
        // `reparse_slice` so the store/derived lowering fires.
        state.visit_expr(&node.tag)
    };

    // -- attributes ---------------------------------------------------------
    //
    // Upstream `SvelteElement.js` calls the SAME `build_element_attributes` as a
    // regular element into a fresh per-element `state.template` / `state.init`,
    // then `attributes = b.block([...state.init, ...build_template(state.template)])`
    // and passes `attributes.body.length > 0 && b.thunk(attributes)` as the 3rd
    // arg of `$.element(...)`. We mirror that: build the attributes into a SCRATCH
    // template buffer (save/restore `state.template`), `build_template` it, and
    // wrap the resulting statements in a thunk.
    //
    // `build_element_attributes` operates over an element's `name` / `attributes`
    // / `metadata.{svg,mathml}` (it never touches the fragment), so we adapt the
    // `SvelteDynamicElement` into a temporary `RegularElement` view. The dynamic
    // element's literal node-name is `svelte:element` (matching the node upstream
    // passes), which is neither svg/mathml-by-name, custom, nor a `select` /
    // `option` / `textarea` special — exactly upstream's behaviour for the
    // dynamic-element node.
    let css_hash: Option<String> = if node.metadata.scoped && !state.analysis.css.hash.is_empty() {
        Some(state.analysis.css.hash.to_string())
    } else {
        None
    };

    let adapter = RegularElement {
        start: node.start,
        end: node.end,
        name: node.name.clone(),
        name_loc: node.name_loc.clone(),
        attributes: node.attributes.clone(),
        fragment: Fragment::default(),
        metadata: RegularElementMetadata {
            svg: node.metadata.svg,
            mathml: node.metadata.mathml,
            scoped: node.metadata.scoped,
            ..RegularElementMetadata::default()
        },
    };

    let saved_template = std::mem::take(&mut state.template);
    build_element_attributes(&adapter, css_hash.as_deref(), state);
    let attr_entries = std::mem::replace(&mut state.template, saved_template);
    let attr_body = build_template(attr_entries, state);

    let b = state.b;
    let attrs_thunk = if attr_body.is_empty() {
        None
    } else {
        Some(b.thunk_block(attr_body, false))
    };

    // -- children -----------------------------------------------------------
    // SvelteElement children are NOT an `is_text_first` parent.
    let children_body = build_fragment_body(&node.fragment, false, state);
    let b = state.b;
    let children_thunk = if children_body.is_empty() {
        None
    } else {
        Some(b.thunk_block(children_body, false))
    };

    // `$.element($$renderer, tag, attrs?, children?)`. `call_opt` drops trailing
    // `None`s and prints interior `None`s as `void 0` — so `(attrs=None,
    // children=Some)` emits the interior `void 0`, and `(attrs=None,
    // children=None)` collapses to `$.element($$renderer, tag)`.
    let call = b.call_opt(
        "$.element",
        vec![
            Some(b.id("$$renderer")),
            Some(tag),
            attrs_thunk,
            children_thunk,
        ],
    );

    state.template.push(TemplateEntry::Stmt(b.stmt(call)));
}
