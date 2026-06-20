//! AST-based server template/script visitors (Phase-3 rewrite).
//!
//! This module hosts the Rust ports of the server visitors in
//! `submodules/svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/`.
//! Each visitor consumes a Svelte template/JS node and appends real oxc AST
//! statements/expressions to the [`super::ServerTransformState`] output buffers
//! — no text processing.
//!
//! Implemented so far: the template-walk framework ([`shared`]) plus the
//! simplest template visitors — Fragment (via [`shared::build_fragment_body`]),
//! RegularElement static path ([`element`]), Text / Comment / ExpressionTag
//! (coalesced inline by [`shared::process_children`]), and HtmlTag.
//! [`visit_node`] is the dispatch seam.
//!
//! Upstream visitor inventory (38 — `template_visitors` + `global_visitors`),
//! with remaining ports tracked as TODOs:
//!
//! Template visitors:
//! - Fragment        — done (via `shared::build_fragment_body`)
//! - RegularElement  — done (static attribute path only)
//! - Text            — done (in `process_children`)
//! - Comment         — done (in `process_children`)
//! - ExpressionTag   — done (sync, in `process_children`; async TODO)
//! - HtmlTag         — done (sync; async TODO)
//! - TODO: SvelteElement, Component, SvelteComponent, SvelteSelf,
//!   SvelteFragment, SvelteBoundary, SvelteHead, TitleElement, SlotElement,
//!   EachBlock, IfBlock, AwaitBlock, KeyBlock, SnippetBlock, RenderTag,
//!   ConstTag, BindDirective, LetDirective, ClassDirective, StyleDirective,
//!   AttachTag
//!
//! Global (script / JS) visitors — all TODO:
//! - VariableDeclaration, ExpressionStatement, CallExpression,
//!   AssignmentExpression, UpdateExpression, Identifier, MemberExpression,
//!   PropertyDefinition, ImportDeclaration (instance hoist),
//!   ExportNamedDeclaration (instance unwrap), LabeledStatement (legacy `$:`)

pub mod await_block;
pub mod component;
pub mod each_block;
pub mod element;
pub mod if_block;
pub mod key_block;
pub mod render_tag;
pub mod shared;
pub mod snippet_block;
pub mod svelte_boundary;
pub mod svelte_element;
pub mod svelte_head;
pub mod svelte_special;
pub mod title_element;

use super::ServerTransformState;
use crate::ast::template::TemplateNode;
use shared::TemplateEntry;

/// Dispatch a single non-joinable template node to its visitor.
///
/// Text / Comment / ExpressionTag are NOT routed here — they are coalesced by
/// [`shared::process_children`] directly. This handles the structural nodes
/// (elements, html-tags, …). Unported node kinds emit nothing (a `// TODO`)
/// so the walk stays total and the build correct for the supported subset.
pub fn visit_node<'a>(node: &TemplateNode, state: &mut ServerTransformState<'a>) {
    match node {
        TemplateNode::RegularElement(el) => element::visit_regular_element(el, state),
        TemplateNode::HtmlTag(tag) => {
            // `{@html expr}` (non-async): `$.html(expr)` interpolated into the
            // surrounding push template. Port of HtmlTag.js (non-async branch).
            // TODO: async branch (create_child_block).
            let visited = state.visit_expr(&tag.expression);
            let html = state.b.call("$.html", vec![visited]);
            state.template.push(TemplateEntry::Template {
                quasis: vec![String::new(), String::new()],
                exprs: vec![html],
            });
        }
        TemplateNode::IfBlock(node) => if_block::visit_if_block(node, state),
        TemplateNode::EachBlock(node) => each_block::visit_each_block(node, state),
        TemplateNode::KeyBlock(node) => key_block::visit_key_block(node, state),
        TemplateNode::SnippetBlock(node) => snippet_block::visit_snippet_block(node, state),
        TemplateNode::AwaitBlock(node) => await_block::visit_await_block(node, state),
        TemplateNode::RenderTag(node) => render_tag::visit_render_tag(node, state),
        TemplateNode::Component(node) => component::visit_component(node, state),
        TemplateNode::SvelteComponent(node) => component::visit_svelte_component(node, state),
        TemplateNode::SvelteSelf(node) => component::visit_svelte_self(node, state),
        TemplateNode::SvelteElement(node) => svelte_element::visit_svelte_element(node, state),
        TemplateNode::SvelteBoundary(node) => svelte_boundary::visit_svelte_boundary(node, state),
        TemplateNode::SvelteHead(node) => svelte_head::visit_svelte_head(node, state),
        TemplateNode::TitleElement(node) => title_element::visit_title_element(node, state),
        TemplateNode::SvelteFragment(node) => {
            // Port of upstream server `SvelteFragment` — push the visited child
            // fragment as a `{ ... }` block statement.
            // SvelteFragment is NOT an `is_text_first` parent.
            let block = shared::build_fragment_block(&node.fragment, false, state);
            state.template.push(TemplateEntry::Stmt(block));
        }
        // `<svelte:window>` / `<svelte:document>` have no upstream server visitor
        // — emit nothing (binding/handler hosts only).
        TemplateNode::SvelteWindow(node) | TemplateNode::SvelteDocument(node) => {
            svelte_special::visit_svelte_window_or_document(node, state);
        }
        // `<svelte:body>` renders its children INLINE (upstream `context.next()`).
        TemplateNode::SvelteBody(node) => svelte_special::visit_svelte_body(node, state),
        // `<svelte:options>` is compile-time-only — no server visitor, emit nothing.
        TemplateNode::SvelteOptions(node) => svelte_special::visit_svelte_options(node, state),
        // TODO: ConstTag, SlotElement, DeclarationTag, DebugTag, AttachTag —
        // emit nothing for now.
        _ => {}
    }
}
