//! Server-side snippet block visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::strip_ts_type_annotation;
use super::super::types::{OutputPart, SnippetDef};
use crate::ast::template::{Fragment, SnippetBlock, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::escape_html;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_snippet_block(
        &mut self,
        block: &SnippetBlock,
    ) -> Result<(), TransformError> {
        // Extract snippet name from expression
        let name_start = block.expression.start().unwrap_or(0) as usize;
        let name_end = block.expression.end().unwrap_or(0) as usize;
        let name = if name_end > name_start && name_end <= self.source.len() {
            self.source[name_start..name_end].trim().to_string()
        } else {
            "snippet".to_string()
        };

        // Extract parameters (strip TypeScript type annotations)
        let params: Vec<String> = block
            .parameters
            .iter()
            .map(|p| {
                let start = p.start().unwrap_or(0) as usize;
                let end = p.end().unwrap_or(0) as usize;
                if end > start && end <= self.source.len() {
                    strip_ts_type_annotation(&self.source[start..end])
                } else {
                    String::new()
                }
            })
            .filter(|s| !s.is_empty())
            .collect();

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

        // Collect non-empty nodes
        let body_nodes: Vec<_> = block.body.nodes.iter().collect();
        let len = body_nodes.len();

        // Find first non-whitespace node
        let mut start_idx = 0;
        while start_idx < len {
            if let TemplateNode::Text(text) = body_nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Find last non-whitespace node
        let mut end_idx = len;
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Compute standalone-ness for the trimmed fragment
        let is_standalone = Self::is_standalone_fragment(
            &body_nodes[start_idx..end_idx]
                .iter()
                .map(|n| (*n).clone())
                .collect::<Vec<_>>(),
        );
        body_generator.skip_hydration_boundaries = is_standalone;

        // Check if first node is text or expression tag - if so, we need hydration marker
        // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/utils.js clean_nodes()
        // This prevents text from being fused with its surroundings during hydration
        if !is_standalone {
            let first_node = body_nodes.get(start_idx);
            let is_text_first = matches!(
                first_node,
                Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
            );

            // Add hydration marker if first content is text
            if is_text_first {
                body_generator
                    .output_parts
                    .push(OutputPart::Html("<!---->".to_string()));
            }
        }

        // Generate body content, trimming whitespace properly
        // Track previous non-output nodes (like ConstTag) to skip whitespace after them
        let mut prev_was_const_tag = false;
        for (i, node) in body_nodes
            .iter()
            .enumerate()
            .skip(start_idx)
            .take(end_idx - start_idx)
        {
            if i == start_idx {
                // First node - if it's text, trim leading whitespace but preserve trailing space
                // if there is a following node (the space separates text from expression/element)
                if let TemplateNode::Text(text) = node {
                    let trimmed = text.data.trim_start();
                    // Check if there's a next node - preserve trailing space if so
                    let next_node = body_nodes.get(i + 1);
                    let needs_trailing_space = next_node.is_some()
                        && text.data.chars().last().is_some_and(|c| c.is_whitespace());

                    let trimmed_end = trimmed.trim_end();
                    if !trimmed_end.is_empty() {
                        let mut content = escape_html(trimmed_end);
                        if needs_trailing_space {
                            content.push(' ');
                        }
                        body_generator.output_parts.push(OutputPart::Html(content));
                    }
                    prev_was_const_tag = false;
                    continue;
                }
            }

            // Skip whitespace-only text nodes after ConstTag
            if prev_was_const_tag
                && let TemplateNode::Text(text) = node
                && text.data.trim().is_empty()
            {
                continue;
            }

            // Track if current node is a ConstTag
            prev_was_const_tag = matches!(node, TemplateNode::ConstTag(_));

            body_generator.generate_node(node, false)?;
        }

        // Determine if the snippet can be hoisted to module level
        // Use metadata.can_hoist from the analyze phase
        let can_hoist = block.metadata.can_hoist;

        // Store the snippet definition
        self.snippets.push(SnippetDef {
            name,
            params,
            body_parts: body_generator.output_parts,
            can_hoist,
        });

        Ok(())
    }

    /// Generate snippet body parts
    pub(crate) fn generate_snippet_body(
        &mut self,
        fragment: &Fragment,
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

        // Collect non-empty nodes
        let body_nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = body_nodes.len();

        // Find first non-whitespace node
        let mut start_idx = 0;
        while start_idx < len {
            if let TemplateNode::Text(text) = body_nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Find last non-whitespace node
        let mut end_idx = len;
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Check if first node is text or expression tag - if so, we need hydration marker
        // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/utils.js clean_nodes()
        // This prevents text from being fused with its surroundings during hydration
        let first_node = body_nodes.get(start_idx);
        let is_text_first = matches!(
            first_node,
            Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
        );

        // Add hydration marker if first content is text
        if is_text_first {
            body_generator
                .output_parts
                .push(OutputPart::Html("<!---->".to_string()));
        }

        // Generate body content
        for (i, node) in body_nodes
            .iter()
            .enumerate()
            .skip(start_idx)
            .take(end_idx - start_idx)
        {
            if i == start_idx {
                // First node - if it's text, trim leading whitespace but preserve trailing space
                // if there is a following node (the space separates text from expression/element)
                if let TemplateNode::Text(text) = node {
                    let trimmed = text.data.trim_start();
                    // Check if there's a next node - preserve trailing space if so
                    let next_node = body_nodes.get(i + 1);
                    let needs_trailing_space = next_node.is_some()
                        && text.data.chars().last().is_some_and(|c| c.is_whitespace());

                    let trimmed_end = trimmed.trim_end();
                    if !trimmed_end.is_empty() {
                        let mut content = escape_html(trimmed_end);
                        if needs_trailing_space {
                            content.push(' ');
                        }
                        body_generator.output_parts.push(OutputPart::Html(content));
                    }
                    continue;
                }
            }
            body_generator.generate_node(node, false)?;
        }

        Ok(body_generator.output_parts)
    }
}
