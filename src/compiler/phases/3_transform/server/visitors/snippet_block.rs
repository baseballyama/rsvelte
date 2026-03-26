//! Server-side snippet block visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::strip_ts_type_annotation;
use super::super::types::{OutputPart, SnippetDef};
use crate::ast::template::{Fragment, SnippetBlock, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::{escape_html, sanitize_template_string};
use crate::compiler::phases::phase3_transform::utils::is_svelte_whitespace_only;

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
        // We extract parameter info from the Expression's JSON structure rather than
        // relying solely on source spans, because optional markers (e.g., `c?: number = 5`)
        // can cause parser span offsets to be incorrect when `?` is stripped during parsing.
        let params: Vec<String> = block
            .parameters
            .iter()
            .map(|p| Self::extract_snippet_param(p, &self.source))
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
        body_generator.const_promises_counter = self.const_promises_counter.clone();
        body_generator.const_blocker_map = self.const_blocker_map.clone();
        body_generator.dev = self.dev;
        body_generator.is_typescript = self.is_typescript;

        // Collect non-empty nodes
        let body_nodes: Vec<_> = block.body.nodes.iter().collect();
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
                        let mut content = escape_html(&sanitize_template_string(trimmed_end));
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
                && is_svelte_whitespace_only(&text.data)
            {
                continue;
            }

            // Track if current node is a ConstTag
            prev_was_const_tag = matches!(node, TemplateNode::ConstTag(_));

            // Flush accumulated async consts before processing non-const content
            if !matches!(node, TemplateNode::ConstTag(_))
                && !matches!(node, TemplateNode::SnippetBlock(_))
            {
                body_generator.flush_async_consts();
            }

            body_generator.generate_node(node, false)?;
        }

        // Final flush for any remaining async consts
        body_generator.flush_async_consts();

        // Apply const-tag-level async wrapping to snippet body parts
        let const_blocker_map = body_generator.const_blocker_map.borrow();
        let body_parts = if !const_blocker_map.is_empty() {
            Self::apply_const_async_wrapping(&body_generator.output_parts, &const_blocker_map)
        } else {
            body_generator.output_parts
        };
        drop(const_blocker_map);

        // Determine if the snippet can be hoisted to module level
        // Use metadata.can_hoist from the analyze phase
        let can_hoist = block.metadata.can_hoist;

        // Store the snippet definition
        self.snippets.push(SnippetDef {
            name,
            params,
            body_parts,
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
        body_generator.const_promises_counter = self.const_promises_counter.clone();
        body_generator.const_blocker_map = self.const_blocker_map.clone();
        body_generator.dev = self.dev;
        body_generator.is_typescript = self.is_typescript;

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
                        let mut content = escape_html(&sanitize_template_string(trimmed_end));
                        if needs_trailing_space {
                            content.push(' ');
                        }
                        body_generator.output_parts.push(OutputPart::Html(content));
                    }
                    continue;
                }
            }
            // Flush accumulated async consts before processing non-const content
            if !matches!(node, TemplateNode::ConstTag(_))
                && !matches!(node, TemplateNode::SnippetBlock(_))
            {
                body_generator.flush_async_consts();
            }

            body_generator.generate_node(node, false)?;
        }

        // Final flush for any remaining async consts
        body_generator.flush_async_consts();

        // Apply const-tag-level async wrapping
        let const_blocker_map = body_generator.const_blocker_map.borrow();
        let body_parts = if !const_blocker_map.is_empty() {
            Self::apply_const_async_wrapping(&body_generator.output_parts, &const_blocker_map)
        } else {
            body_generator.output_parts
        };
        drop(const_blocker_map);

        Ok(body_parts)
    }

    /// Extract a snippet parameter string from an Expression, stripping TypeScript
    /// type annotations. This uses the Expression's JSON structure to correctly
    /// handle cases where the source span may be incorrect (e.g., when optional
    /// markers like `?` were stripped during parsing, shifting span positions).
    fn extract_snippet_param(expr: &crate::ast::js::Expression, source: &str) -> String {
        let json = expr.as_json();

        // Check the node type
        let node_type = json.get("type").and_then(|t| t.as_str()).unwrap_or("");

        match node_type {
            "AssignmentPattern" => {
                // Has a default value: e.g., `c: number = 5` or `c = 5`
                // Extract the left side (parameter name/pattern) and right side (default value)
                let left = json.get("left");
                let right = json.get("right");

                // Extract the left side as a stripped parameter name
                let left_str = if let Some(left_val) = left {
                    let left_expr = crate::ast::js::Expression::Value(left_val.clone());
                    Self::extract_param_name_from_json(left_val, source).unwrap_or_else(|| {
                        // Fallback: use span
                        let start = left_expr.start().unwrap_or(0) as usize;
                        let end = left_expr.end().unwrap_or(0) as usize;
                        if end > start && end <= source.len() {
                            strip_ts_type_annotation(&source[start..end])
                        } else {
                            String::new()
                        }
                    })
                } else {
                    String::new()
                };

                // Extract the right side (default value) from source using its span
                let right_str = if let Some(right_val) = right {
                    let right_expr = crate::ast::js::Expression::Value(right_val.clone());
                    let start = right_expr.start().unwrap_or(0) as usize;
                    let end = right_expr.end().unwrap_or(0) as usize;
                    if end > start && end <= source.len() {
                        let val = source[start..end].trim().to_string();
                        // SequenceExpression (comma expression) needs parentheses to preserve semantics
                        // e.g., `c = (2, 3)` - the span covers `2, 3` but we need `(2, 3)`
                        let right_type =
                            right_val.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        if right_type == "SequenceExpression" {
                            format!("({})", val)
                        } else {
                            val
                        }
                    } else {
                        // Fallback: try to get value from JSON
                        Self::extract_snippet_literal_value(right_val)
                    }
                } else {
                    String::new()
                };

                if left_str.is_empty() {
                    return String::new();
                }
                if right_str.is_empty() {
                    left_str
                } else {
                    format!("{} = {}", left_str, right_str)
                }
            }
            "ObjectPattern" | "ArrayPattern" => {
                // Destructured parameter: e.g., `{ c }: {c: number}`
                // Use the source span and strip type annotation
                let start = expr.start().unwrap_or(0) as usize;
                let end = expr.end().unwrap_or(0) as usize;
                if end > start && end <= source.len() {
                    strip_ts_type_annotation(&source[start..end])
                } else {
                    String::new()
                }
            }
            _ => {
                // Simple identifier or other: e.g., `c: number` or `c`
                // Use the source span and strip type annotation
                let start = expr.start().unwrap_or(0) as usize;
                let end = expr.end().unwrap_or(0) as usize;
                if end > start && end <= source.len() {
                    strip_ts_type_annotation(&source[start..end])
                } else {
                    // Fallback: try to get name from JSON
                    Self::extract_param_name_from_json(&json, source).unwrap_or_default()
                }
            }
        }
    }

    /// Extract a parameter name from a JSON value (Identifier node).
    fn extract_param_name_from_json(json: &serde_json::Value, _source: &str) -> Option<String> {
        let node_type = json.get("type").and_then(|t| t.as_str())?;
        match node_type {
            "Identifier" => json
                .get("name")
                .and_then(|n| n.as_str())
                .map(|s| s.to_string()),
            "ObjectPattern" => {
                // Reconstruct from properties
                let props = json.get("properties").and_then(|p| p.as_array())?;
                let parts: Vec<String> = props
                    .iter()
                    .filter_map(|prop| {
                        let key = prop.get("key")?;
                        let key_name = key.get("name").and_then(|n| n.as_str())?;
                        Some(key_name.to_string())
                    })
                    .collect();
                Some(format!("{{ {} }}", parts.join(", ")))
            }
            _ => None,
        }
    }

    /// Extract a literal value from a JSON expression node (for snippet default values).
    fn extract_snippet_literal_value(json: &serde_json::Value) -> String {
        let node_type = json.get("type").and_then(|t| t.as_str()).unwrap_or("");
        match node_type {
            "Literal" | "NumericLiteral" => {
                if let Some(raw) = json.get("raw").and_then(|r| r.as_str()) {
                    raw.to_string()
                } else if let Some(val) = json.get("value") {
                    match val {
                        serde_json::Value::Number(n) => n.to_string(),
                        serde_json::Value::String(s) => format!("'{}'", s),
                        serde_json::Value::Bool(b) => b.to_string(),
                        serde_json::Value::Null => "null".to_string(),
                        _ => String::new(),
                    }
                } else {
                    String::new()
                }
            }
            "Identifier" => json
                .get("name")
                .and_then(|n| n.as_str())
                .unwrap_or("")
                .to_string(),
            _ => String::new(),
        }
    }
}
