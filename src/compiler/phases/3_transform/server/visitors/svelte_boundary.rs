//! Server-side svelte:boundary visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::strip_ts_type_annotation;
use super::super::types::OutputPart;
use crate::ast::template::{Attribute, Fragment, SvelteElement, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::{escape_html, sanitize_template_string};
use crate::compiler::phases::phase3_transform::utils::is_svelte_whitespace_only;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_svelte_boundary(
        &mut self,
        boundary: &SvelteElement,
    ) -> Result<(), TransformError> {
        // Look for pending attribute or pending snippet
        let pending_attribute = boundary
            .attributes
            .iter()
            .find(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "pending"));

        let pending_snippet = boundary.fragment.nodes.iter().find_map(|node| {
            if let TemplateNode::SnippetBlock(snippet) = node {
                // Check if the snippet expression is named "pending"
                if snippet.expression.is_identifier("pending") {
                    return Some(snippet);
                }
            }
            None
        });

        // Generate body based on whether we have a pending snippet or attribute
        // Filter out `failed` and `pending` snippets from the fragment when generating body
        let (mut body, is_pending) = if let Some(snippet) = pending_snippet {
            // Generate body from the pending snippet - this is the pending state
            // When in pending state, the `failed` snippet is NOT included
            (self.generate_fragment_body_parts(&snippet.body)?, true)
        } else if let Some(Attribute::Attribute(pending_attr)) = pending_attribute {
            // For pending attribute, extract the expression and generate a conditional:
            // if (pending_expr) { pending_expr($$renderer) } else { main_content }
            // Reference: SvelteBoundary.js in official Svelte compiler
            let pending_expr = match &pending_attr.value {
                crate::ast::template::AttributeValue::Sequence(parts) => {
                    if parts.len() == 1 {
                        if let crate::ast::template::AttributeValuePart::ExpressionTag(expr_tag) =
                            &parts[0]
                        {
                            let start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if end > start && end <= self.source.len() {
                                Some(self.source[start..end].trim().to_string())
                            } else {
                                None
                            }
                        } else {
                            None
                        }
                    } else {
                        None
                    }
                }
                crate::ast::template::AttributeValue::Expression(expr_tag) => {
                    let start = expr_tag.expression.start().unwrap_or(0) as usize;
                    let end = expr_tag.expression.end().unwrap_or(0) as usize;
                    if end > start && end <= self.source.len() {
                        Some(self.source[start..end].trim().to_string())
                    } else {
                        None
                    }
                }
                _ => None,
            };

            if let Some(expr) = pending_expr {
                // Generate pending body: pending_expr($$renderer)
                let pending_body =
                    vec![OutputPart::RawStatement(format!("{}($$renderer);\n", expr))];

                // Generate main body (the else branch)
                let filtered_nodes: Vec<TemplateNode> = boundary
                    .fragment
                    .nodes
                    .iter()
                    .filter(|node| {
                        if let TemplateNode::SnippetBlock(snippet) = node {
                            let name = snippet.expression.identifier_name().unwrap_or("");
                            name != "failed" && name != "pending"
                        } else {
                            true
                        }
                    })
                    .cloned()
                    .collect();

                let filtered_fragment = Fragment {
                    nodes: filtered_nodes,
                    ..boundary.fragment.clone()
                };

                let main_body = self.generate_fragment_body_parts(&filtered_fragment)?;

                self.output_parts
                    .push(OutputPart::SvelteBoundaryWithPending {
                        pending_expr: expr,
                        pending_body,
                        main_body,
                    });
                return Ok(());
            } else {
                (Vec::new(), true)
            }
        } else {
            // No pending - generate the main fragment content excluding named snippets
            // Create a filtered fragment that excludes pending/failed snippets
            let filtered_nodes: Vec<TemplateNode> = boundary
                .fragment
                .nodes
                .iter()
                .filter(|node| {
                    if let TemplateNode::SnippetBlock(snippet) = node {
                        let name = snippet.expression.identifier_name().unwrap_or("");
                        // Keep everything except `failed` and `pending` snippets
                        name != "failed" && name != "pending"
                    } else {
                        true
                    }
                })
                .cloned()
                .collect();

            let filtered_fragment = Fragment {
                nodes: filtered_nodes,
                ..boundary.fragment.clone()
            };

            (
                self.generate_fragment_body_parts(&filtered_fragment)?,
                false,
            )
        };

        // Only include the `failed` snippet when NOT in pending state
        // (in pending state, the boundary renders the pending content, not the main content)
        if !is_pending {
            // Look for `failed` snippet in the boundary fragment
            let failed_snippet = boundary.fragment.nodes.iter().find_map(|node| {
                if let TemplateNode::SnippetBlock(snippet) = node
                    && snippet.expression.is_identifier("failed")
                {
                    return Some(snippet);
                }
                None
            });

            if let Some(failed) = failed_snippet {
                // Extract parameters (strip TypeScript type annotations)
                let params: Vec<String> = failed
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

                // Generate body parts for the failed snippet
                let body_parts = self.generate_snippet_body_parts(&failed.body)?;

                // Insert the `failed` snippet function after the last ConstDeclaration part
                let insert_pos = body
                    .iter()
                    .rposition(|p| matches!(p, OutputPart::ConstDeclaration(_)))
                    .map(|pos| pos + 1)
                    .unwrap_or(0);
                body.insert(
                    insert_pos,
                    OutputPart::SnippetFunction {
                        name: "failed".to_string(),
                        params,
                        body: body_parts,
                        dev: self.dev,
                    },
                );
            }
        }

        self.output_parts
            .push(OutputPart::SvelteBoundary { body, is_pending });
        Ok(())
    }

    /// Generate body parts for a snippet body (used for inline snippet functions like `failed`)
    pub(crate) fn generate_snippet_body_parts(
        &mut self,
        fragment: &Fragment,
    ) -> Result<Vec<OutputPart>, TransformError> {
        let mut body_generator = self.new_child_generator(false);

        // Collect non-empty nodes
        let body_nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = body_nodes.len();

        // Find first non-whitespace node
        let mut start_idx = 0;
        while start_idx < len {
            if let TemplateNode::Text(text) = body_nodes[start_idx]
                && is_svelte_whitespace_only(&text.data)
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
                && is_svelte_whitespace_only(&text.data)
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Check if first node is text or expression tag - if so, we need hydration marker
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
            if i == start_idx
                && let TemplateNode::Text(text) = node
            {
                let trimmed = text.data.trim_start();
                let trimmed_end = trimmed.trim_end();
                if !trimmed_end.is_empty() {
                    let content = escape_html(&sanitize_template_string(trimmed_end));
                    body_generator.output_parts.push(OutputPart::Html(content));
                }
                continue;
            }
            body_generator.generate_node(node, false)?;
        }

        Ok(body_generator.output_parts)
    }
}
