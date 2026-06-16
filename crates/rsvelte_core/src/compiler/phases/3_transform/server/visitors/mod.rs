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
pub mod slot_element;
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
            TemplateNode::DeclarationTag(tag) => self.generate_declaration_tag(tag),
            TemplateNode::TitleElement(title) => self.generate_title_element(title),
            TemplateNode::SvelteComponent(elem) => self.generate_svelte_component(elem),
            TemplateNode::SvelteSelf(elem) => self.generate_svelte_self(elem),
            TemplateNode::DebugTag(tag) => self.generate_debug_tag(tag),
            TemplateNode::SlotElement(slot) => self.generate_slot_element(slot),
            TemplateNode::SvelteFragment(frag) => {
                // Generate children of <svelte:fragment>
                for child in &frag.fragment.nodes {
                    self.generate_node(child, false)?;
                }
                Ok(())
            }
            TemplateNode::Comment(comment) => {
                // Output HTML comments when preserve_comments is enabled
                if self.preserve_comments {
                    let data = &comment.data;
                    self.output_parts
                        .push(super::OutputPart::Html(format!("<!--{}-->", data)));
                }
                Ok(())
            }
            // <svelte:window> / <svelte:document> / <svelte:body> render
            // nothing in SSR, but comments inside their dropped event-handler
            // expressions survive in the official output (esrap re-inserts
            // them before the next positioned node).
            TemplateNode::SvelteWindow(elem)
            | TemplateNode::SvelteDocument(elem)
            | TemplateNode::SvelteBody(elem) => {
                for attr in &elem.attributes {
                    if let crate::ast::template::Attribute::OnDirective(on) = attr
                        && let Some(expr) = &on.expression
                    {
                        self.record_lost_expression_comments(
                            expr.start().unwrap_or(0) as usize,
                            expr.end().unwrap_or(0) as usize,
                        );
                    }
                }
                Ok(())
            }
            _ => Ok(()),
        }
    }

    /// Generate server-side code for {@debug} tag.
    ///
    /// Emits `console.log({ ...identifiers }); debugger;` and, when any of the
    /// referenced identifiers is bound to an async-blocked value, wraps the
    /// emitted statements in `$$renderer.async_block([<blockers>], ($$renderer) => { ... })`.
    /// Mirrors upstream Svelte 5.55.6 `4c96b469f` which routes `{@debug}` output
    /// through `create_child_block(..., b.array(blockers), false)` so a
    /// `{@debug d}` for an `await`-derived `d` waits on the right
    /// `$$promises[N]` / `promises[M]` before logging.
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

        // Compute blockers from the identifier list. Match upstream's
        // `scope.get(name)?.blocker` lookup using our two blocker maps:
        //   - `top_level_blocker_map` (`name → $$promises[N]` for async-grouped
        //     instance-script bindings, e.g. `let d = $derived(await ...)`)
        //   - `const_blocker_map` (`name → promises_K[M]` for `@const` declarations
        //     resolved inside a `$$renderer.run()` group, e.g.
        //     `{@const data = await Promise.resolve(...)}`).
        let blocker_strs: Vec<String> = {
            let const_map = self.const_blocker_map.borrow();
            let mut out: Vec<String> = Vec::new();
            for name in &ident_names {
                // Strip trailing `()` left over from derived-name source slicing
                // so we look up the bare binding name.
                let key = name.trim_end_matches("()");
                if let Some(blocker_expr) = const_map.get(key) {
                    if !out.iter().any(|b| b == blocker_expr) {
                        out.push(blocker_expr.clone());
                    }
                } else if let Some(&idx) = self.top_level_blocker_map.get(key) {
                    let expr = format!("$$promises[{}]", idx);
                    if !out.iter().any(|b| b == &expr) {
                        out.push(expr);
                    }
                }
            }
            out
        };

        if blocker_strs.is_empty() {
            // Emit `console.log({...})` and `debugger` as SEPARATE statements
            // (upstream's DebugTag visitor pushes two statements). The codegen's
            // esrap-style blank-line logic then separates them — `debugger` is a
            // DebuggerStatement, so it gets a blank line on both sides, matching
            // the official output.
            if !ident_names.is_empty() {
                self.output_parts.push(OutputPart::RawStatement(format!(
                    "console.log({{ {} }});",
                    ident_names.join(", ")
                )));
            }
            self.output_parts
                .push(OutputPart::RawStatement("debugger;".to_string()));
        } else {
            let body = if ident_names.is_empty() {
                // {@debug} with no identifiers - just emit debugger
                "debugger;".to_string()
            } else {
                // {@debug expr1, expr2} - emit console.log({ expr1, expr2 }); debugger;
                let obj_entries = ident_names.join(", ");
                format!("console.log({{ {} }});\ndebugger;", obj_entries)
            };
            // Wrap in $$renderer.async_block([blockers], ($$renderer) => { ... }).
            // Each body line is indented one level inside the arrow body so the
            // emitted code matches the indented-by-codegen pretty-printed shape.
            let inner_lines = body
                .lines()
                .map(|l| format!("\t{}", l))
                .collect::<Vec<_>>()
                .join("\n");
            self.output_parts.push(OutputPart::RawStatement(format!(
                "$$renderer.async_block([{}], ($$renderer) => {{\n{}\n}});",
                blocker_strs.join(", "),
                inner_lines
            )));
        }

        Ok(())
    }
}
