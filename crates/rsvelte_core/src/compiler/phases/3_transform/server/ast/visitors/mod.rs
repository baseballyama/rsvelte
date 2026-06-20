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

pub mod element;
pub mod shared;

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
        // TODO: Component, SvelteElement, IfBlock, EachBlock, AwaitBlock,
        // KeyBlock, SnippetBlock, RenderTag, ConstTag, TitleElement,
        // SlotElement, Svelte* special elements, etc. — emit nothing for now.
        _ => {}
    }
}
