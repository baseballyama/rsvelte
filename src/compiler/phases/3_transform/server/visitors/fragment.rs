//! Server-side fragment visitor.

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use crate::ast::template::{Fragment, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::escape_html;
use crate::compiler::phases::phase3_transform::utils::{
    is_svelte_whitespace_only, svelte_trim_end, svelte_trim_start,
};

impl<'a> ServerCodeGenerator<'a> {
    /// Generate body parts from a fragment.
    pub(crate) fn generate_fragment_body_parts(
        &mut self,
        fragment: &Fragment,
    ) -> Result<Vec<OutputPart>, TransformError> {
        self.generate_fragment_body_parts_inner(fragment, false)
    }

    /// Generate body parts from a fragment, optionally skipping the anchor comment.
    /// The anchor is used to prevent text fusion in the main template, but is not
    /// needed inside callbacks (like svelte:element children).
    pub(crate) fn generate_fragment_body_parts_inner(
        &mut self,
        fragment: &Fragment,
        skip_anchor: bool,
    ) -> Result<Vec<OutputPart>, TransformError> {
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            self.analysis,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();

        // Get the nodes and find meaningful content bounds
        let nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = nodes.len();

        // Find first meaningful node (skip whitespace-only text, comments, and snippet blocks)
        // Snippet blocks are hoisted and don't produce inline output
        let mut start_idx = 0;
        while start_idx < len {
            match nodes[start_idx] {
                TemplateNode::Text(text) if is_svelte_whitespace_only(&text.data) => {
                    start_idx += 1;
                    continue;
                }
                TemplateNode::Comment(_) => {
                    start_idx += 1;
                    continue;
                }
                _ => break,
            }
        }

        // Find last meaningful node (skip whitespace-only text, comments, and snippet blocks)
        let mut end_idx = len;
        while end_idx > start_idx {
            match nodes[end_idx - 1] {
                TemplateNode::Text(text) if is_svelte_whitespace_only(&text.data) => {
                    end_idx -= 1;
                    continue;
                }
                TemplateNode::Comment(_) => {
                    end_idx -= 1;
                    continue;
                }
                _ => break,
            }
        }

        // Compute standalone-ness for the trimmed fragment
        let is_standalone = Self::is_standalone_fragment(
            &nodes[start_idx..end_idx]
                .iter()
                .map(|n| (*n).clone())
                .collect::<Vec<_>>(),
        );
        body_generator.skip_hydration_boundaries = is_standalone;

        // Check if first meaningful content needs an anchor
        // If the first node is Text or ExpressionTag, add <!----> to prevent text fusion
        // Skip this for callbacks (like svelte:element children) since they're isolated
        // Also skip for standalone fragments (single RenderTag/Component)
        if !skip_anchor && !is_standalone && start_idx < end_idx {
            let first_node = &nodes[start_idx];
            let needs_anchor = matches!(
                first_node,
                TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)
            );
            if needs_anchor {
                body_generator
                    .output_parts
                    .push(OutputPart::Html("<!---->".to_string()));
            }
        }

        // Generate only the meaningful nodes
        // Track when we've just output a TitleElement to trim leading whitespace from next text
        let mut just_had_title = false;
        // Track when the previous node was a ConstTag - whitespace-only text after ConstTag
        // should be skipped since ConstTag doesn't produce HTML output
        let mut prev_was_const_tag = false;
        let meaningful_nodes = &nodes[start_idx..end_idx];
        for (i, node) in meaningful_nodes.iter().enumerate() {
            let is_last = i == meaningful_nodes.len() - 1;

            // Skip whitespace-only text nodes after ConstTag
            if prev_was_const_tag
                && let TemplateNode::Text(text) = node
                && is_svelte_whitespace_only(&text.data)
            {
                prev_was_const_tag = false;
                continue;
            }

            // If we just had a title and this is a text node, trim leading whitespace
            if just_had_title && let TemplateNode::Text(text) = node {
                let mut modified_text = text.clone();
                modified_text.data = modified_text.data.trim_start().to_string().into();
                // Also trim trailing whitespace if this is the last node
                if is_last {
                    modified_text.data = modified_text.data.trim_end().to_string().into();
                }
                body_generator.generate_node(&TemplateNode::Text(modified_text), false)?;
                just_had_title = false;
                prev_was_const_tag = false;
                continue;
            }
            just_had_title = matches!(node, TemplateNode::TitleElement(_));
            prev_was_const_tag = matches!(node, TemplateNode::ConstTag(_));
            // For the last text node in a fragment, trim trailing whitespace
            // Use svelte_trim_end which does NOT trim non-breaking space (\u{00A0})
            if is_last && let TemplateNode::Text(text) = node {
                let mut modified_text = text.clone();
                modified_text.data = svelte_trim_end(&modified_text.data).to_string().into();
                body_generator.generate_node(&TemplateNode::Text(modified_text), false)?;
                continue;
            }
            body_generator.generate_node(node, false)?;
        }

        // Special case: if the only meaningful child is a lone <script> element,
        // add a comment anchor after it. This matches the official compiler's
        // clean_nodes behavior to ensure run_scripts logic works correctly.
        if meaningful_nodes.len() == 1
            && let TemplateNode::RegularElement(el) = meaningful_nodes[0]
            && el.name.as_str() == "script"
        {
            body_generator
                .output_parts
                .push(OutputPart::Html("<!---->".to_string()));
        }

        Ok(body_generator.output_parts)
    }

    /// Generate children from a list of nodes (excluding snippets)
    pub(crate) fn generate_children_from_nodes(
        &mut self,
        nodes: &[&TemplateNode],
    ) -> Result<Option<Vec<OutputPart>>, TransformError> {
        let len = nodes.len();
        if len == 0 {
            return Ok(None);
        }

        // Find first and last meaningful content
        // Skip whitespace-only text nodes and comment nodes when trimming
        let mut start_idx = 0;
        let mut end_idx = len;

        while start_idx < len {
            match nodes[start_idx] {
                TemplateNode::Text(text) if is_svelte_whitespace_only(&text.data) => {
                    start_idx += 1;
                    continue;
                }
                TemplateNode::Comment(_) => {
                    start_idx += 1;
                    continue;
                }
                _ => break,
            }
        }

        while end_idx > start_idx {
            match nodes[end_idx - 1] {
                TemplateNode::Text(text) if is_svelte_whitespace_only(&text.data) => {
                    end_idx -= 1;
                    continue;
                }
                TemplateNode::Comment(_) => {
                    end_idx -= 1;
                    continue;
                }
                _ => break,
            }
        }

        // Check if there's any meaningful content
        if start_idx >= end_idx {
            return Ok(None);
        }

        // Generate body parts
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            None,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();
        body_generator.namespace = self.namespace.clone();

        // Check if first meaningful content is text/expression
        // If so, add <!---> anchor to prevent text fusion during hydration
        let first_content = nodes.get(start_idx);
        let needs_anchor = matches!(
            first_content,
            Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
        );

        if needs_anchor {
            body_generator.output_parts.push(OutputPart::Comment);
        }

        let nodes_to_process: Vec<_> = nodes
            .iter()
            .skip(start_idx)
            .take(end_idx - start_idx)
            .collect();
        let num_nodes = nodes_to_process.len();

        for (i, node) in nodes_to_process.iter().enumerate() {
            let is_first = i == 0;
            let is_last = i == num_nodes - 1;

            // For <svelte:fragment> nodes, process their children directly (with trimming)
            // instead of emitting the fragment wrapper, so that leading/trailing whitespace
            // inside the fragment is properly trimmed.
            // Note: Unlike regular slot content, <svelte:fragment> children do NOT get a
            // <!---> anchor even if they start with text (per official Svelte compiler behavior:
            // `is_text_first` is false for SvelteFragment parent type in clean_nodes).
            if let TemplateNode::SvelteFragment(frag) = node {
                let frag_children: Vec<_> = frag.fragment.nodes.iter().collect();
                let frag_len = frag_children.len();

                // Trim leading/trailing whitespace-only text nodes
                let mut frag_start = 0;
                let mut frag_end = frag_len;
                while frag_start < frag_len {
                    match frag_children[frag_start] {
                        TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data) => {
                            frag_start += 1;
                        }
                        TemplateNode::Comment(_) => {
                            frag_start += 1;
                        }
                        _ => break,
                    }
                }
                while frag_end > frag_start {
                    match frag_children[frag_end - 1] {
                        TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data) => {
                            frag_end -= 1;
                        }
                        TemplateNode::Comment(_) => {
                            frag_end -= 1;
                        }
                        _ => break,
                    }
                }

                let frag_to_process = &frag_children[frag_start..frag_end];
                let frag_count = frag_to_process.len();

                for (fi, fnode) in frag_to_process.iter().enumerate() {
                    let is_f_first = fi == 0;
                    let is_f_last = fi == frag_count - 1;

                    if let TemplateNode::Text(text) = fnode {
                        let raw = text.data.to_string();
                        let raw = if is_f_first {
                            svelte_trim_start(&raw).to_string()
                        } else {
                            raw
                        };
                        let raw = if is_f_last {
                            svelte_trim_end(&raw).to_string()
                        } else {
                            raw
                        };
                        if !raw.is_empty() {
                            body_generator
                                .output_parts
                                .push(OutputPart::Html(escape_html(&raw)));
                        }
                    } else {
                        body_generator.generate_node(fnode, false)?;
                    }
                }
                continue;
            }

            // For text nodes, normalize whitespace
            // Use svelte_trim_start/svelte_trim_end which do NOT trim non-breaking space (\u{00A0})
            if let TemplateNode::Text(text) = node {
                let raw = text.data.to_string();

                // Trim leading whitespace from first node
                let raw = if is_first {
                    svelte_trim_start(&raw).to_string()
                } else {
                    raw
                };

                // Trim trailing whitespace from last node
                let raw = if is_last {
                    svelte_trim_end(&raw).to_string()
                } else {
                    raw
                };

                if !raw.is_empty() {
                    body_generator
                        .output_parts
                        .push(OutputPart::Html(escape_html(&raw)));
                }
                continue;
            }
            body_generator.generate_node(node, false)?;
        }

        Ok(Some(body_generator.output_parts))
    }
}
