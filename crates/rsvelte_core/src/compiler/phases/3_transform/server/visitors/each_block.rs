//! Server-side each block visitor.

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use crate::ast::template::{EachBlock, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::utils::is_svelte_whitespace_only;

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

        // Get optional index name from the parser.
        // This mirrors the official compiler's EachBlock.js (server):
        //   const index = each_node_meta.contains_group_binding || !node.index ? each_node_meta.index : b.id(node.index);
        //   if (index.name !== node.index && node.index != null) { each.push(b.let(node.index, index)); }
        //
        // When contains_group_binding is true OR no user-provided index:
        //   Use metadata.index ($$index / $$index_1 / etc.) assigned during phase 2 scope creation.
        //   Phase 2 assigns these in post-order (children first), matching the official compiler's
        //   scope.root.unique('$$index') call order.
        // When the user provides an explicit index (e.g., `{#each items as item, i}`)
        //   AND there's no group binding: use the user's index name directly.
        let (index_name, index_alias) =
            if block.metadata.contains_group_binding || block.index.is_none() {
                // Use the unique $$index_N name for the loop variable
                let meta_index = block.metadata.index.clone();
                // The original user-defined index name becomes an alias inside the loop body
                let alias = block.index.as_ref().map(|idx| idx.to_string());
                (meta_index, alias)
            } else {
                (block.index.as_ref().map(|idx| idx.to_string()), None)
            };

        // Filter body nodes - skip leading/trailing whitespace
        let body_nodes: Vec<_> = block.body.nodes.iter().collect();
        let len = body_nodes.len();

        // Determine indices to process (skip leading/trailing whitespace)
        // Skip whitespace trimming when preserveWhitespace is set
        let mut start_idx = 0;
        let mut end_idx = len;

        if !self.preserve_whitespace {
            // Skip leading whitespace and (unless preserved) comments.
            // Upstream's clean_nodes filters comments FIRST and then trims
            // leading whitespace, so `\n<!-- c -->\n{#if ...}` has no leading
            // text at all.
            while start_idx < len {
                match body_nodes[start_idx] {
                    TemplateNode::Text(text) if is_svelte_whitespace_only(&text.data) => {
                        start_idx += 1;
                    }
                    TemplateNode::Comment(_) if !self.preserve_comments => {
                        start_idx += 1;
                    }
                    _ => break,
                }
            }

            // Skip trailing whitespace and (unless preserved) comments
            while end_idx > start_idx {
                match body_nodes[end_idx - 1] {
                    TemplateNode::Text(text) if is_svelte_whitespace_only(&text.data) => {
                        end_idx -= 1;
                    }
                    TemplateNode::Comment(_) if !self.preserve_comments => {
                        end_idx -= 1;
                    }
                    _ => break,
                }
            }
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
        // Skip when preserveWhitespace is set
        if !self.preserve_whitespace && !trimmed_body_nodes.is_empty() {
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
        let is_standalone = self.is_standalone_fragment(&trimmed_body_nodes);

        // Generate body parts with the appropriate skip_hydration_boundaries flag
        let mut body_generator = self.new_child_generator(is_standalone);
        // Only mark in_block_body when the each EXPRESSION itself is async
        // (which means the body will be wrapped in child_block/async_block).
        // When the each expression is NOT async, the body is a plain for loop
        // and async expressions inside it still need $.save() wrapping.
        if block.metadata.expression.is_async() {
            body_generator.in_block_body = true;
        }

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
            // Also remove the index alias (original user-defined name) if present
            if let Some(ref alias) = index_alias {
                body_generator.constant_vars.remove(alias);
            }
        }

        // Check if first visible node is text or expression - if so, add comment marker
        // This prevents text from being fused with surroundings (hydration marker)
        // Skip ConstTag and SnippetBlock nodes since they don't produce HTML output.
        if start_idx < end_idx {
            let mut first_visible = start_idx;
            let mut prev_hoisted = false;
            while first_visible < end_idx {
                match body_nodes[first_visible] {
                    TemplateNode::ConstTag(_)
                    | TemplateNode::DeclarationTag(_)
                    | TemplateNode::SnippetBlock(_) => {
                        first_visible += 1;
                        prev_hoisted = true;
                    }
                    TemplateNode::Text(text)
                        if prev_hoisted && is_svelte_whitespace_only(&text.data) =>
                    {
                        first_visible += 1;
                        prev_hoisted = false;
                    }
                    _ => break,
                }
            }
            if first_visible < end_idx {
                if let TemplateNode::ExpressionTag(_) = body_nodes[first_visible] {
                    body_generator.output_parts.push(OutputPart::Comment);
                } else if let TemplateNode::Text(text) = body_nodes[first_visible] {
                    // Only add comment if text has non-whitespace content after trimming,
                    // OR if preserveWhitespace is set (whitespace-only text will be output as content)
                    if self.preserve_whitespace || !is_svelte_whitespace_only(&text.data) {
                        body_generator.output_parts.push(OutputPart::Comment);
                    }
                }
            }
        }

        // Track if previous node was a ConstTag to skip whitespace after it
        let mut prev_was_const = false;
        // Track whether the previous visible text ended with whitespace, for collapsing
        // whitespace across removed comments / hoisted nodes. Mirrors clean_nodes:
        // `prev_is_text_ending_with_whitespace` strips (rather than collapses) the
        // leading whitespace of the following text node.
        let mut prev_text_ends_with_ws = false;
        let nodes_to_process_ref: Vec<_> = body_nodes
            .iter()
            .skip(start_idx)
            .take(end_idx - start_idx)
            .collect();
        let num_nodes = nodes_to_process_ref.len();

        // Compute last meaningful content index (ignoring hoisted nodes and ws-only text)
        // This is used to properly trim trailing whitespace from the last non-hoisted text/element.
        let last_meaningful_idx = {
            let mut idx = None;
            for (j, n) in nodes_to_process_ref.iter().enumerate() {
                let is_hoisted = matches!(n, TemplateNode::ConstTag(_))
                    || matches!(n, TemplateNode::SnippetBlock(_))
                    || (matches!(n, TemplateNode::Comment(_)) && !self.preserve_comments);
                let is_ws_only =
                    matches!(n, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data));
                if !is_hoisted && !is_ws_only {
                    idx = Some(j);
                }
            }
            idx
        };

        for (i, node) in nodes_to_process_ref.iter().enumerate() {
            let node = *node;
            // Skip whitespace-only text after ConstTag (unless preserving whitespace)
            if !self.preserve_whitespace
                && prev_was_const
                && let TemplateNode::Text(text) = node
                && is_svelte_whitespace_only(&text.data)
            {
                prev_was_const = false;
                continue;
            }
            prev_was_const = matches!(node, TemplateNode::ConstTag(_));

            // Flush accumulated async consts before processing non-const content
            if !matches!(node, TemplateNode::ConstTag(_))
                && !matches!(node, TemplateNode::SnippetBlock(_))
            {
                body_generator.flush_async_consts();
            }

            // Apply clean_nodes-style whitespace handling with expression tag context.
            // This matches the official compiler where clean_nodes collapses leading/trailing
            // whitespace but preserves internal whitespace and whitespace adjacent to ExpressionTags.
            if let TemplateNode::Text(text) = node {
                let mut data = text.data.to_string();

                // Determine whether prev/next non-hoisted sibling is an ExpressionTag.
                let prev_is_expr = {
                    let mut pi = i;
                    loop {
                        if pi == 0 {
                            break false;
                        }
                        pi -= 1;
                        let pn = nodes_to_process_ref[pi];
                        let pn_hoisted = matches!(pn, TemplateNode::ConstTag(_))
                            || matches!(pn, TemplateNode::SnippetBlock(_));
                        if !pn_hoisted {
                            break matches!(pn, TemplateNode::ExpressionTag(_));
                        }
                    }
                };
                let next_is_expr = {
                    let mut ni = i + 1;
                    loop {
                        if ni >= num_nodes {
                            break false;
                        }
                        let nn = nodes_to_process_ref[ni];
                        let nn_hoisted = matches!(nn, TemplateNode::ConstTag(_))
                            || matches!(nn, TemplateNode::SnippetBlock(_));
                        if !nn_hoisted {
                            break matches!(nn, TemplateNode::ExpressionTag(_));
                        }
                        ni += 1;
                    }
                };

                if !self.preserve_whitespace {
                    // Trim leading whitespace from first text node
                    if i == 0 {
                        data = data.trim_start().to_string();
                    }
                    // When the previous visible text ended with whitespace (e.g. either
                    // side of a removed comment), strip this node's leading whitespace
                    // entirely instead of collapsing it to a second space.
                    if prev_text_ends_with_ws {
                        data = data
                            .trim_start_matches(|c: char| {
                                matches!(c, ' ' | '\t' | '\r' | '\n' | '\x0C')
                            })
                            .to_string();
                    }
                    // Trim trailing whitespace from last meaningful text node
                    // Use last_meaningful_idx to account for hoisted nodes at the end
                    let is_last = last_meaningful_idx.map_or(i == num_nodes - 1, |li| i >= li);
                    if is_last {
                        data = data.trim_end().to_string();
                    }
                }
                prev_text_ends_with_ws = data.ends_with([' ', '\t', '\r', '\n']);
                // Output the text with expression context for proper whitespace handling
                if !data.is_empty() {
                    let mut modified_text = text.clone();
                    modified_text.data = data.into();
                    body_generator.generate_text_with_expr_context(
                        &modified_text,
                        prev_is_expr,
                        next_is_expr,
                    )?;
                }
            } else {
                // Comments (when not preserved) and hoisted nodes are transparent for
                // whitespace collapsing; any other node resets the tracking.
                let transparent = matches!(node, TemplateNode::Comment(_) if !self.preserve_comments)
                    || matches!(
                        node,
                        TemplateNode::ConstTag(_)
                            | TemplateNode::DeclarationTag(_)
                            | TemplateNode::SnippetBlock(_)
                    );
                if !transparent {
                    prev_text_ends_with_ws = false;
                }
                body_generator.generate_node(node, false)?;
            }
        }

        // Flush accumulated async const tags
        body_generator.flush_async_consts();

        // Generate fallback content if there's an {:else} clause
        let fallback = if let Some(ref fallback_fragment) = block.fallback {
            let mut fallback_generator = ServerCodeGenerator::new(
                self.component_name.clone(),
                self.source.clone(),
                None,
                None,
                self.analysis,
                self.use_async,
            );
            fallback_generator.constant_vars = self.constant_vars.clone();
            fallback_generator.current_scope_index = self.current_scope_index;
            fallback_generator.const_promises_counter = self.const_promises_counter.clone();
            fallback_generator.const_blocker_map = self.const_blocker_map.clone();
            fallback_generator.is_typescript = self.is_typescript;
            fallback_generator.dev = self.dev;
            fallback_generator.uses_store_subs = self.uses_store_subs;
            // Fallback is also inside the child_block(async ...) so it should not use $.save()
            fallback_generator.in_block_body = true;
            // Trim leading/trailing whitespace from fallback fragment nodes
            let mut fallback_nodes: Vec<TemplateNode> = fallback_fragment.nodes.to_vec();
            // Skip leading whitespace-only text nodes
            let start = fallback_nodes
                .iter()
                .position(
                    |n| !matches!(n, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data)),
                )
                .unwrap_or(fallback_nodes.len());
            // Skip trailing whitespace-only text nodes
            let end = fallback_nodes
                .iter()
                .rposition(
                    |n| !matches!(n, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data)),
                )
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
                    TemplateNode::Text(text) if !is_svelte_whitespace_only(&text.data) => {
                        fallback_generator.output_parts.push(OutputPart::Comment);
                    }
                    TemplateNode::ExpressionTag(_) => {
                        fallback_generator.output_parts.push(OutputPart::Comment);
                    }
                    _ => {}
                }
            }
            // Track prev_was_const for fallback nodes too
            let mut fb_prev_was_const = false;
            for node in &fallback_nodes {
                // Skip whitespace-only text after ConstTag
                if !self.preserve_whitespace
                    && fb_prev_was_const
                    && let TemplateNode::Text(text) = node
                    && is_svelte_whitespace_only(&text.data)
                {
                    fb_prev_was_const = false;
                    continue;
                }
                fb_prev_was_const = matches!(node, TemplateNode::ConstTag(_));

                // Flush accumulated async consts before processing non-const content
                if !matches!(node, TemplateNode::ConstTag(_))
                    && !matches!(node, TemplateNode::SnippetBlock(_))
                {
                    fallback_generator.flush_async_consts();
                }

                fallback_generator.generate_node(node, false)?;
            }
            // Flush remaining async consts
            fallback_generator.flush_async_consts();

            // Apply const-tag-level async wrapping
            let fb_const_blocker_map = fallback_generator.const_blocker_map.borrow();
            let fb_parts = if !fb_const_blocker_map.is_empty() {
                Self::apply_const_async_wrapping(
                    &fallback_generator.output_parts,
                    &fb_const_blocker_map,
                )
            } else {
                fallback_generator.output_parts
            };
            drop(fb_const_blocker_map);

            Some(fb_parts)
        } else {
            None
        };

        // Apply const-tag-level async wrapping to body parts
        let body_const_blocker_map = body_generator.const_blocker_map.borrow();
        let body_parts = if !body_const_blocker_map.is_empty() {
            Self::apply_const_async_wrapping(&body_generator.output_parts, &body_const_blocker_map)
        } else {
            body_generator.output_parts
        };
        drop(body_const_blocker_map);

        self.output_parts.push(OutputPart::EachBlock {
            iterable,
            context_name,
            index_name,
            index_alias,
            body: body_parts,
            fallback,
        });

        Ok(())
    }
}

/// Extract variable names from a destructuring pattern string.
/// Handles: simple identifiers, object destructuring `{a, b}`, array destructuring `[a, b]`,
/// and nested patterns. Also handles renaming like `{method: m}`.
pub(crate) fn extract_pattern_names(pattern: &str) -> Vec<String> {
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
