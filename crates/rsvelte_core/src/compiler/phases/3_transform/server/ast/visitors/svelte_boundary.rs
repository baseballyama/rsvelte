//! Server `SvelteBoundary` visitor — the Rust port of
//! `3-transform/server/visitors/SvelteBoundary.js`.
//!
//! Upstream (写经, the shapes this port targets):
//! ```js
//! export function SvelteBoundary(node, context) {
//!     const failed_snippet  = node.fragment.nodes.find(SnippetBlock named 'failed');
//!     const failed_attribute = node.attributes.find(Attribute named 'failed');
//!     const pending_attribute = node.attributes.find(Attribute named 'pending');
//!     const pending_snippet  = node.fragment.nodes.find(SnippetBlock named 'pending');
//!
//!     const children_nodes = node.fragment.nodes.filter(
//!         n => !(SnippetBlock && name in ['failed','pending']));
//!     const children_block = context.visit({ ...fragment, nodes: children_nodes });
//!
//!     // children_body: pending-snippet / pending-attribute branches, else:
//!     children_body = b.block([block_open, children_block, block_close]);
//!
//!     // No failed branch → skip the wrapper, push children_body.body inline.
//!     if (!failed_snippet && !failed_attribute) {
//!         context.state.template.push(...children_body.body);
//!         return;
//!     }
//!
//!     const props = b.object([]);
//!     if (failed_attribute && !failed_snippet)
//!         props.properties.push(b.init('failed', <attr value>));
//!     else if (failed_snippet) {
//!         context.visit(failed_snippet, context.state);     // hoist the fn decl
//!         props.properties.push(b.init('failed', failed_snippet.expression));
//!     }
//!     context.state.template.push(
//!         b.stmt(b.call('$$renderer.boundary', props,
//!             b.arrow([b.id('$$renderer')], children_body))));
//! }
//! ```
//!
//! Final no-pending + failed-snippet shape (matches the text oracle's
//! `OutputPart::SvelteBoundary` emission):
//! ```js
//! $$renderer.boundary({ failed }, ($$renderer) => {
//!     $$renderer.push(`<!--[-->`);
//!     { /* children_block */ }
//!     $$renderer.push(`<!--]-->`);
//! });
//! ```
//!
//! The `pending` SNIPPET branch IS ported: a `{#snippet pending()}` child makes
//! the server render the pending state — `children_body` becomes
//! `[push('<!--[!-->'), <pending body>, push('<!--]-->')]` (写经
//! `build_pending_snippet_block`), discarding the real children for SSR.
//!
//! 写经 GAPs (not ported — see [`visit_svelte_boundary`]):
//! - The `pending` ATTRIBUTE branch (`build_pending_attribute_block` +
//!   `is_pending_attr_nullish` if/else). A boundary with only a `pending`
//!   attribute falls through to the children-body path.
//! - The `failed` *attribute* value uses [`ServerTransformState::visit_expr`] (the
//!   read-wrapped expression) rather than upstream's
//!   `build_attribute_value(..., is_component=true)`; correct for the common
//!   identifier / single-expression value, a gap for mixed text+expr values.
//! - The `failed` snippet is emitted via [`build_boundary_snippet`], with its
//!   placement decided by the snippet's hoistability AND the boundary's nesting
//!   depth (写经 upstream `SnippetBlock.js` `can_hoist ? state.hoisted :
//!   state.init`): a TOP-LEVEL boundary whose `failed` body references only its
//!   own params hoists to the component-body top (`state.body`); a NESTED
//!   boundary's `failed` (or one referencing instance state) is emitted INLINE
//!   into the surrounding block, right before the `$$renderer.boundary(...)` call
//!   — so it lands inside the enclosing boundary's `($$renderer) => { … }`
//!   callback. The top-level gate uses the server-side `state.fragment_depth`
//!   because our analyze does not bump its depth counters for `<svelte:boundary>`
//!   (so `metadata.can_hoist` alone would wrongly hoist a boundary-nested
//!   snippet). The generic [`super::snippet_block::visit_snippet_block`] always
//!   hoists to module scope, which would mis-place a boundary-nested snippet.

use crate::ast::template::{Attribute, Fragment, SnippetBlock, SvelteElement, TemplateNode};
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use oxc_ast::ast::{ObjectPropertyKind, Statement};

use super::shared::{
    BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, TemplateEntry, build_fragment_block,
};

/// Visit a `<svelte:boundary>...</svelte:boundary>` element. See the module docs
/// for the targeted shapes and KNOWN GAPs.
pub fn visit_svelte_boundary<'a>(node: &SvelteElement, state: &mut ServerTransformState<'a>) {
    // `failed` snippet (a `{#snippet failed(e)}` child) / `failed` attribute.
    let failed_snippet = find_snippet(&node.fragment, "failed");
    let failed_attribute = find_attribute(&node.attributes, "failed");

    // `pending` snippet (a `{#snippet pending()}` child). When present, the
    // SERVER renders the pending state — upstream `SvelteBoundary.js` sets
    // `children_body = build_pending_snippet_block(pending_snippet)`, i.e.
    // `[push('<!--[!-->'), <pending body>, push('<!--]-->')]` — and DISCARDS the
    // real children for SSR (they only render client-side once the boundary
    // resolves). The `pending` *attribute* branch is still a GAP (defensive
    // fallback to the children body).
    let pending_snippet = find_snippet(&node.fragment, "pending");

    // The children fragment with the `failed`/`pending` snippets filtered out
    // (upstream `children_nodes`). Snippets are rendered as their own hoisted
    // function declarations, never as inline template content.
    let children_nodes: Vec<TemplateNode> = node
        .fragment
        .nodes
        .iter()
        .filter(|child| !is_boundary_snippet(child))
        .cloned()
        .collect();
    let children_fragment = Fragment {
        nodes: children_nodes,
        ..node.fragment.clone()
    };

    // children_body:
    // - with a `pending` snippet → `[push('<!--[!-->'), <pending body>, push('<!--]-->')]`
    //   (写经 `build_pending_snippet_block` → `build_template([block_open_else,
    //   visit(snippet.body), block_close])`). The real children are skipped.
    // - otherwise → `[push('<!--[-->'), <children block>, push('<!--]-->')]`.
    // SvelteBoundary slot / snippet body IS an `is_text_first` parent.
    let children_body: Vec<Statement<'a>> = if let Some(pending) = pending_snippet {
        let pending_block = build_fragment_block(&pending.body, true, state);
        let b = state.b;
        vec![
            b.stmt(b.call("$$renderer.push", vec![marker(state, BLOCK_OPEN_ELSE)])),
            pending_block,
            b.stmt(b.call("$$renderer.push", vec![marker(state, BLOCK_CLOSE)])),
        ]
    } else {
        let children_block = build_fragment_block(&children_fragment, true, state);
        let b = state.b;
        vec![
            b.stmt(b.call("$$renderer.push", vec![marker(state, BLOCK_OPEN)])),
            children_block,
            b.stmt(b.call("$$renderer.push", vec![marker(state, BLOCK_CLOSE)])),
        ]
    };

    // No `failed` branch → skip the boundary wrapper, push children_body inline.
    if failed_snippet.is_none() && failed_attribute.is_none() {
        for stmt in children_body {
            state.template.push(TemplateEntry::Stmt(stmt));
        }
        return;
    }

    // props = { failed[: <attr value>] }.
    let mut props: Vec<ObjectPropertyKind<'a>> = Vec::new();
    // The `failed` fn, plus where it should land: HOISTABLE (`can_hoist`)
    // snippets go onto `state.body` (the component-body top, ahead of ALL
    // template content); non-hoistable ones are emitted INLINE into the CURRENT
    // block, immediately ahead of the `$$renderer.boundary(...)` call.
    let mut failed_fn: Option<Statement<'a>> = None;
    let mut failed_fn_hoist = false;
    if let Some(snippet) = failed_snippet {
        // 写经 upstream `context.visit(failed_snippet, context.state)` →
        // `SnippetBlock.js`: `statements = can_hoist ? state.hoisted : state.init`.
        // For a TOP-LEVEL boundary a `failed` snippet whose body references only
        // its own params hoists to the component-body top (ahead of the template
        // `push(...)` calls); otherwise it stays in the surrounding block, right
        // before the call — so a NESTED boundary's `failed` lands inside the outer
        // boundary's `($$renderer) => { … }` callback.
        //
        // Upstream's `can_hoist` is `is_root_level && body_refs_only_own_params`.
        // Our analyze computes the body-reference part on `metadata.can_hoist`, but
        // does NOT bump its depth counters for `<svelte:boundary>`, so a
        // boundary-NESTED snippet wrongly reports `can_hoist == true`. Re-impose the
        // root-level gate here with the server-side `fragment_depth` (root fragment
        // = 1; any nested block / boundary body ≥ 2): hoist only when the snippet
        // body is hoistable AND the boundary is at the top level.
        failed_fn = Some(build_boundary_snippet(snippet, "failed", state));
        failed_fn_hoist = snippet.metadata.can_hoist && state.fragment_depth <= 1;
        props.push(state.b.init("failed", state.b.id("failed")));
    } else if let Some(Attribute::Attribute(attr)) = failed_attribute {
        // `failed={expr}` (no snippet): `{ failed: <expr> }` (shorthand when the
        // expression is the bare identifier `failed`).
        let value = failed_attribute_value(&attr.value, state);
        props.push(state.b.init("failed", value));
    }

    // Emit the `failed` fn declaration: hoistable → component-body top
    // (`state.body`); otherwise inline into the CURRENT block, immediately ahead
    // of the boundary call (写经 `statements.push(fn)` onto `state.hoisted` /
    // `state.init` respectively).
    if let Some(fn_decl) = failed_fn {
        if failed_fn_hoist {
            state.body.push(fn_decl);
        } else {
            state.template.push(TemplateEntry::Stmt(fn_decl));
        }
    }

    // $$renderer.boundary(props, ($$renderer) => { <children_body> })
    let b = state.b;
    let props_obj = b.object(props);
    let arrow = b.arrow(
        b.params(vec![b.id_pat("$$renderer")], None),
        b.body(children_body),
        false,
        false,
    );
    let call = b.call("$$renderer.boundary", vec![props_obj, arrow]);
    state.template.push(TemplateEntry::Stmt(b.stmt(call)));
}

/// A hydration marker (`<!--[-->` / `<!--]-->`) as a single-quasi template
/// literal — the shape `build_template` emits via `b.literal(...)` coalesced into
/// `$$renderer.push(`...`)` (the text oracle uses backtick markers too).
fn marker<'a>(state: &ServerTransformState<'a>, text: &str) -> oxc_ast::ast::Expression<'a> {
    state.b.template(vec![text], vec![])
}

/// Build a `function name($$renderer, ...params) { <body> }` declaration for a
/// boundary `failed` / `pending` snippet — the same shape as the `SnippetBlock`
/// visitor / `component.rs::build_snippet_declaration`, returned for inline
/// (component-local) emission rather than module-scope hoisting.
fn build_boundary_snippet<'a>(
    snippet: &SnippetBlock,
    name: &str,
    state: &mut ServerTransformState<'a>,
) -> Statement<'a> {
    let b = state.b;
    let mut patterns = vec![b.id_pat("$$renderer")];
    for param in &snippet.parameters {
        let pat_name = param
            .identifier_name()
            .map(|s| s.to_string())
            .unwrap_or_else(|| "undefined".to_string());
        patterns.push(b.id_pat(&pat_name));
    }
    let params = b.params(patterns, None);
    // SnippetBlock body IS an `is_text_first` parent.
    let body_block = super::shared::build_fragment_body(&snippet.body, true, state);
    let fn_body = state.b.body(body_block);
    state.b.function_declaration(name, params, fn_body, false)
}

/// Build the value expression for a `failed={...}` attribute. A single-expression
/// value (`failed={expr}` / `failed="{expr}"`) becomes the read-wrapped
/// expression; a bare-`true` / static-text value falls back to `true`
/// (defensive — `failed` is always an expression in practice).
fn failed_attribute_value<'a>(
    value: &crate::ast::template::AttributeValue,
    state: &mut ServerTransformState<'a>,
) -> oxc_ast::ast::Expression<'a> {
    use crate::ast::template::{AttributeValue, AttributeValuePart};
    match value {
        AttributeValue::Expression(tag) => state.visit_expr(&tag.expression),
        AttributeValue::Sequence(parts) if parts.len() == 1 => match &parts[0] {
            AttributeValuePart::ExpressionTag(tag) => state.visit_expr(&tag.expression),
            AttributeValuePart::Text(t) => state.b.string(t.data.as_str()),
        },
        _ => state.b.bool(true),
    }
}

/// Find a `{#snippet name(...)}` child of the boundary fragment by name.
fn find_snippet<'f>(fragment: &'f Fragment, name: &str) -> Option<&'f SnippetBlock> {
    fragment.nodes.iter().find_map(|node| match node {
        TemplateNode::SnippetBlock(snippet) if snippet.expression.is_identifier(name) => {
            Some(&**snippet)
        }
        _ => None,
    })
}

/// Find a plain `name=...` attribute on the boundary element by name.
fn find_attribute<'a>(attributes: &'a [Attribute], name: &str) -> Option<&'a Attribute> {
    attributes
        .iter()
        .find(|attr| matches!(attr, Attribute::Attribute(a) if a.name == name))
}

/// Whether `child` is a `failed` / `pending` snippet (filtered out of the
/// rendered children fragment).
fn is_boundary_snippet(child: &TemplateNode) -> bool {
    matches!(
        child,
        TemplateNode::SnippetBlock(snippet)
            if snippet.expression.is_identifier("failed")
                || snippet.expression.is_identifier("pending")
    )
}
