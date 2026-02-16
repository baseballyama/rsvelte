//! Server-side visitors for template transformation.
//!
//! This module contains visitor implementations for each AST node type.
//! Each visitor is responsible for generating server-side JavaScript code
//! for its specific node type.
//!
//! # Architecture
//!
//! The visitor pattern matches the official Svelte compiler structure at
//! `svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/`.
//!
//! Each visitor file contains an `impl ServerCodeGenerator` block with the
//! relevant `generate_*` methods for that node type.

pub mod shared;

// Visitor modules - each handles a specific AST node type
pub mod await_block;
pub mod component;
pub mod const_tag;
pub mod each_block;
pub mod element;
pub mod expression_tag;
pub mod fragment;
pub mod html_tag;
pub mod if_block;
pub mod render_tag;
pub mod select_element;
pub mod snippet_block;
pub mod svelte_boundary;
pub mod svelte_component;
pub mod svelte_element;
pub mod svelte_head;
pub mod text;
pub mod title_element;

use super::ServerCodeGenerator;
use super::types::OutputPart;
use crate::ast::template::{DebugTag, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_node(
        &mut self,
        node: &TemplateNode,
        is_root: bool,
    ) -> Result<(), TransformError> {
        match node {
            TemplateNode::Text(text) => self.generate_text(text, is_root),
            TemplateNode::RegularElement(element) => self.generate_element(element),
            TemplateNode::ExpressionTag(tag) => self.generate_expression_tag(tag),
            TemplateNode::Component(component) => self.generate_component_usage(component),
            TemplateNode::IfBlock(block) => self.generate_if_block(block),
            TemplateNode::EachBlock(block) => self.generate_each_block(block),
            TemplateNode::AwaitBlock(block) => self.generate_await_block(block),
            TemplateNode::KeyBlock(block) => self.generate_key_block(block),
            TemplateNode::SnippetBlock(block) => self.generate_snippet_block(block),
            TemplateNode::RenderTag(tag) => self.generate_render_tag(tag),
            TemplateNode::HtmlTag(tag) => self.generate_html_tag(tag),
            TemplateNode::SvelteElement(elem) => self.generate_svelte_element(elem),
            TemplateNode::SvelteBoundary(boundary) => self.generate_svelte_boundary(boundary),
            TemplateNode::SvelteHead(head) => self.generate_svelte_head(head),
            TemplateNode::ConstTag(tag) => self.generate_const_tag(tag),
            TemplateNode::TitleElement(title) => self.generate_title_element(title),
            TemplateNode::SvelteComponent(elem) => self.generate_svelte_component(elem),
            TemplateNode::SvelteSelf(elem) => self.generate_svelte_self(elem),
            TemplateNode::DebugTag(tag) => self.generate_debug_tag(tag),
            _ => Ok(()),
        }
    }

    /// Generate server-side code for {@debug} tag.
    /// Emits `console.log({ ...identifiers }); debugger;`
    fn generate_debug_tag(&mut self, tag: &DebugTag) -> Result<(), TransformError> {
        // Build identifier list from source
        let mut ident_names = Vec::new();
        for ident in &tag.identifiers {
            let start = ident.start().unwrap_or(0) as usize;
            let end = ident.end().unwrap_or(0) as usize;
            if end > start && end <= self.source.len() {
                let name = self.source[start..end].trim().to_string();
                ident_names.push(name);
            }
        }

        if ident_names.is_empty() {
            // {@debug} with no identifiers - just emit debugger
            self.output_parts
                .push(OutputPart::RawStatement("debugger;".to_string()));
        } else {
            // {@debug expr1, expr2} - emit console.log({ expr1, expr2 }); debugger;
            let obj_entries = ident_names.join(", ");
            self.output_parts.push(OutputPart::RawStatement(format!(
                "console.log({{ {} }});\ndebugger;",
                obj_entries
            )));
        }

        Ok(())
    }
}
