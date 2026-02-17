//! Server-side each block visitor.

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use crate::ast::template::{EachBlock, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::escape_html;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_each_block(&mut self, block: &EachBlock) -> Result<(), TransformError> {
        // Get the iterable expression from the parser
        let start = block.expression.start().unwrap_or(0) as usize;
        let end = block.expression.end().unwrap_or(0) as usize;
        let iterable = if end > start && end <= self.source.len() {
            self.source[start..end].trim().to_string()
        } else {
            "[]".to_string()
        };

        // Transform store subscriptions ($store -> $.store_get())
        let iterable = self.transform_store_refs(&iterable);

        // Get the context variable name (None if no "as" clause)
        let context_name = if let Some(ref context) = block.context {
            let ctx_start = context.start().unwrap_or(0) as usize;
            let ctx_end = context.end().unwrap_or(0) as usize;
            if ctx_end > ctx_start && ctx_end <= self.source.len() {
                Some(self.source[ctx_start..ctx_end].trim().to_string())
            } else {
                None
            }
        } else {
            None
        };

        // Get optional index name from the parser
        let index_name = block.index.as_ref().map(|idx| idx.to_string());

        // Filter body nodes - skip leading/trailing whitespace
        let body_nodes: Vec<_> = block.body.nodes.iter().collect();
        let len = body_nodes.len();

        // Determine indices to process (skip leading/trailing whitespace)
        let mut start_idx = 0;
        let mut end_idx = len;

        // Skip leading whitespace
        while start_idx < len {
            if let TemplateNode::Text(text) = body_nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Skip trailing whitespace
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Collect trimmed body nodes (owned)
        let mut trimmed_body_nodes: Vec<TemplateNode> = body_nodes
            .iter()
            .skip(start_idx)
            .take(end_idx - start_idx)
            .copied()
            .cloned()
            .collect();

        // Trim leading whitespace from first text node and trailing whitespace from last text node
        // This handles cases like `{#each items as item}\ncontent\n{/each}`
        if !trimmed_body_nodes.is_empty() {
            // Trim leading whitespace from first text node
            if let TemplateNode::Text(ref mut text) = trimmed_body_nodes[0] {
                let trimmed_data = text.data.trim_start().to_string();
                text.data = trimmed_data.into();
            }
            // Trim trailing whitespace from last text node
            let last_idx = trimmed_body_nodes.len() - 1;
            if let TemplateNode::Text(ref mut text) = trimmed_body_nodes[last_idx] {
                let trimmed_data = text.data.trim_end().to_string();
                text.data = trimmed_data.into();
            }
        }

        // Check if this fragment is standalone (only contains a single RenderTag/Component)
        let is_standalone = Self::is_standalone_fragment(&trimmed_body_nodes);

        // Generate body parts with the appropriate skip_hydration_boundaries flag
        let mut body_generator = self.new_child_generator(is_standalone);

        // Remove constant_vars that are shadowed by the each block's context pattern.
        // E.g., `{#each items as {method}}` shadows any outer `method` constant.
        if let Some(ref ctx_name) = context_name {
            let shadowed_names = extract_pattern_names(ctx_name);
            for name in &shadowed_names {
                body_generator.constant_vars.remove(name);
            }
            // Also remove index name if it shadows a constant
            if let Some(ref idx) = index_name {
                body_generator.constant_vars.remove(idx);
            }
        }

        // Check if first node is text or expression - if so, add comment marker
        // This prevents text from being fused with surroundings (hydration marker)
        if start_idx < end_idx {
            if let TemplateNode::ExpressionTag(_) = body_nodes[start_idx] {
                body_generator.output_parts.push(OutputPart::Comment);
            } else if let TemplateNode::Text(text) = body_nodes[start_idx] {
                // Only add comment if text has non-whitespace content after trimming
                if !text.data.trim().is_empty() {
                    body_generator.output_parts.push(OutputPart::Comment);
                }
            }
        }

        // Track if previous node was a ConstTag to skip whitespace after it
        let mut prev_was_const = false;
        let nodes_to_process: Vec<_> = body_nodes
            .iter()
            .skip(start_idx)
            .take(end_idx - start_idx)
            .collect();
        let num_nodes = nodes_to_process.len();

        for (i, node) in nodes_to_process.into_iter().enumerate() {
            // Skip whitespace-only text after ConstTag
            if prev_was_const
                && let TemplateNode::Text(text) = node
                && text.data.trim().is_empty()
            {
                prev_was_const = false;
                continue;
            }
            prev_was_const = matches!(node, TemplateNode::ConstTag(_));

            // Special handling for first/last text nodes to trim whitespace
            if let TemplateNode::Text(text) = node {
                let mut data = text.data.to_string();
                // Trim leading whitespace from first text node
                if i == 0 {
                    data = data.trim_start().to_string();
                }
                // Trim trailing whitespace from last text node
                if i == num_nodes - 1 {
                    data = data.trim_end().to_string();
                }
                // Output the trimmed text
                if !data.is_empty() {
                    body_generator
                        .output_parts
                        .push(OutputPart::Html(escape_html(&data)));
                }
            } else {
                body_generator.generate_node(node, false)?;
            }
        }

        // Generate fallback content if there's an {:else} clause
        let fallback = if let Some(ref fallback_fragment) = block.fallback {
            let mut fallback_generator = ServerCodeGenerator::new(
                self.component_name.clone(),
                self.source.clone(),
                None,
                None,
                None,
                self.use_async,
            );
            fallback_generator.constant_vars = self.constant_vars.clone();
            // Trim leading/trailing whitespace from fallback fragment nodes
            let mut fallback_nodes: Vec<TemplateNode> = fallback_fragment.nodes.to_vec();
            // Skip leading whitespace-only text nodes
            let start = fallback_nodes
                .iter()
                .position(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))
                .unwrap_or(fallback_nodes.len());
            // Skip trailing whitespace-only text nodes
            let end = fallback_nodes
                .iter()
                .rposition(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))
                .map(|i| i + 1)
                .unwrap_or(0);
            fallback_nodes = fallback_nodes[start..end].to_vec();
            // Trim leading whitespace from first text node
            if let Some(TemplateNode::Text(text)) = fallback_nodes.first_mut() {
                let trimmed = text.data.trim_start().to_string();
                text.data = trimmed.into();
            }
            // Trim trailing whitespace from last text node
            if let Some(TemplateNode::Text(text)) = fallback_nodes.last_mut() {
                let trimmed = text.data.trim_end().to_string();
                text.data = trimmed.into();
            }
            // Add comment marker before fallback if first node is text or expression
            // This matches the behavior of the main each body
            if let Some(first_node) = fallback_nodes.first() {
                match first_node {
                    TemplateNode::Text(text) if !text.data.trim().is_empty() => {
                        fallback_generator.output_parts.push(OutputPart::Comment);
                    }
                    TemplateNode::ExpressionTag(_) => {
                        fallback_generator.output_parts.push(OutputPart::Comment);
                    }
                    _ => {}
                }
            }
            for node in &fallback_nodes {
                fallback_generator.generate_node(node, false)?;
            }
            Some(fallback_generator.output_parts)
        } else {
            None
        };

        self.output_parts.push(OutputPart::EachBlock {
            iterable,
            context_name,
            index_name,
            body: body_generator.output_parts,
            fallback,
        });

        Ok(())
    }
}

/// Extract variable names from a destructuring pattern string.
/// Handles: simple identifiers, object destructuring `{a, b}`, array destructuring `[a, b]`,
/// and nested patterns. Also handles renaming like `{method: m}`.
fn extract_pattern_names(pattern: &str) -> Vec<String> {
    let mut names = Vec::new();
    let trimmed = pattern.trim();

    if trimmed.starts_with('{') && trimmed.ends_with('}') {
        // Object destructuring
        let inner = &trimmed[1..trimmed.len() - 1];
        for part in split_top_level(inner) {
            let part = part.trim();
            if part.is_empty() {
                continue;
            }
            // Handle rest: ...rest
            if let Some(rest) = part.strip_prefix("...") {
                names.push(rest.trim().to_string());
                continue;
            }
            // Handle renaming: key: value or key: {nested}
            if let Some(colon_idx) = find_top_level_colon(part) {
                let value_part = part[colon_idx + 1..].trim();
                // Handle default values: name = default
                let value_part = if let Some(eq_idx) = find_top_level_eq(value_part) {
                    value_part[..eq_idx].trim()
                } else {
                    value_part
                };
                names.extend(extract_pattern_names(value_part));
            } else {
                // Simple name, possibly with default: name = default
                let name = if let Some(eq_idx) = find_top_level_eq(part) {
                    part[..eq_idx].trim()
                } else {
                    part
                };
                if is_valid_identifier(name) {
                    names.push(name.to_string());
                }
            }
        }
    } else if trimmed.starts_with('[') && trimmed.ends_with(']') {
        // Array destructuring
        let inner = &trimmed[1..trimmed.len() - 1];
        for part in split_top_level(inner) {
            let part = part.trim();
            if part.is_empty() {
                continue;
            }
            if let Some(rest) = part.strip_prefix("...") {
                names.push(rest.trim().to_string());
            } else {
                // Handle default values
                let name_part = if let Some(eq_idx) = find_top_level_eq(part) {
                    part[..eq_idx].trim()
                } else {
                    part
                };
                names.extend(extract_pattern_names(name_part));
            }
        }
    } else if is_valid_identifier(trimmed) {
        names.push(trimmed.to_string());
    }

    names
}

/// Split a string by commas, respecting nested brackets/braces.
fn split_top_level(s: &str) -> Vec<&str> {
    let mut parts = Vec::new();
    let mut depth = 0;
    let mut start = 0;
    for (i, ch) in s.char_indices() {
        match ch {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            ',' if depth == 0 => {
                parts.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    parts.push(&s[start..]);
    parts
}

/// Find the first top-level colon (not inside brackets).
fn find_top_level_colon(s: &str) -> Option<usize> {
    let mut depth = 0;
    for (i, ch) in s.char_indices() {
        match ch {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            ':' if depth == 0 => return Some(i),
            _ => {}
        }
    }
    None
}

/// Find the first top-level equals sign (not inside brackets, not ==).
fn find_top_level_eq(s: &str) -> Option<usize> {
    let mut depth = 0;
    let bytes = s.as_bytes();
    for (i, ch) in s.char_indices() {
        match ch {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            '=' if depth == 0 => {
                // Make sure it's not == or =>
                if i + 1 < bytes.len() && (bytes[i + 1] == b'=' || bytes[i + 1] == b'>') {
                    continue;
                }
                return Some(i);
            }
            _ => {}
        }
    }
    None
}

/// Check if a string is a valid JavaScript identifier.
fn is_valid_identifier(s: &str) -> bool {
    let s = s.trim();
    if s.is_empty() {
        return false;
    }
    let mut chars = s.chars();
    let first = chars.next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }
    chars.all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}
