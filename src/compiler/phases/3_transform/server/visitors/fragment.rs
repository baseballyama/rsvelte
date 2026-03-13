//! Server-side fragment visitor.

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use crate::ast::template::{Fragment, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::{escape_html, sanitize_template_string};
use crate::compiler::phases::phase3_transform::utils::{
    is_svelte_whitespace_only, svelte_trim_end, svelte_trim_start,
};

/// Infer namespace from fragment children nodes.
/// If all RegularElement children are SVG, returns "svg".
/// If all are MathML, returns "mathml".
/// Otherwise returns the parent namespace.
fn infer_namespace_from_nodes(nodes: &[&TemplateNode], parent_namespace: &str) -> String {
    // Check if all RegularElement children share the same namespace
    let mut found_namespace: Option<&str> = None;

    for node in nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                if el.metadata.svg {
                    match found_namespace {
                        None => found_namespace = Some("svg"),
                        Some("svg") => {}
                        _ => return "html".to_string(),
                    }
                } else if el.metadata.mathml {
                    match found_namespace {
                        None => found_namespace = Some("mathml"),
                        Some("mathml") => {}
                        _ => return "html".to_string(),
                    }
                } else {
                    return "html".to_string();
                }
            }
            // Recurse into control flow blocks to check their children
            TemplateNode::IfBlock(if_block) => {
                for node in &if_block.consequent.nodes {
                    if let TemplateNode::RegularElement(el) = node {
                        if el.metadata.svg {
                            match found_namespace {
                                None => found_namespace = Some("svg"),
                                Some("svg") => {}
                                _ => return "html".to_string(),
                            }
                        } else if !el.metadata.mathml {
                            return "html".to_string();
                        }
                    }
                }
            }
            TemplateNode::EachBlock(each_block) => {
                for node in &each_block.body.nodes {
                    if let TemplateNode::RegularElement(el) = node {
                        if el.metadata.svg {
                            match found_namespace {
                                None => found_namespace = Some("svg"),
                                Some("svg") => {}
                                _ => return "html".to_string(),
                            }
                        } else if !el.metadata.mathml {
                            return "html".to_string();
                        }
                    }
                }
            }
            _ => {}
        }
    }

    found_namespace
        .map(|s| s.to_string())
        .unwrap_or_else(|| parent_namespace.to_string())
}

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
        let mut body_generator = self.new_child_generator(false);

        // Get the nodes and find meaningful content bounds
        let nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = nodes.len();

        // Infer namespace from children nodes (matching official compiler's infer_namespace)
        let inferred_namespace = infer_namespace_from_nodes(&nodes, &self.namespace);
        body_generator.namespace = inferred_namespace.clone();

        // In SVG namespace, whitespace-only text nodes between non-text elements
        // can be entirely removed (matching official compiler's can_remove_entirely logic)
        let can_remove_whitespace_entirely = inferred_namespace == "svg";

        // Find first meaningful node (skip whitespace-only text, comments, and snippet blocks)
        // Snippet blocks are hoisted and don't produce inline output
        // When preserveWhitespace is set, don't skip whitespace-only text nodes
        // When preserveComments is set, don't skip comment nodes
        let mut start_idx = 0;
        if !self.preserve_whitespace {
            while start_idx < len {
                match nodes[start_idx] {
                    TemplateNode::Text(text) if is_svelte_whitespace_only(&text.data) => {
                        start_idx += 1;
                        continue;
                    }
                    TemplateNode::Comment(_) if !self.preserve_comments => {
                        start_idx += 1;
                        continue;
                    }
                    _ => break,
                }
            }
        }

        // Find last meaningful node (skip whitespace-only text, comments, and snippet blocks)
        let mut end_idx = len;
        if !self.preserve_whitespace {
            while end_idx > start_idx {
                match nodes[end_idx - 1] {
                    TemplateNode::Text(text) if is_svelte_whitespace_only(&text.data) => {
                        end_idx -= 1;
                        continue;
                    }
                    TemplateNode::Comment(_) if !self.preserve_comments => {
                        end_idx -= 1;
                        continue;
                    }
                    _ => break,
                }
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

        // Check if first visible content needs an anchor
        // If the first visible node is Text or ExpressionTag, add <!----> to prevent text fusion
        // Skip this for callbacks (like svelte:element children) since they're isolated
        // Also skip for standalone fragments (single RenderTag/Component)
        // Skip ConstTag and SnippetBlock nodes since they don't produce HTML output
        if !skip_anchor && !is_standalone && start_idx < end_idx {
            let mut first_visible = start_idx;
            let mut prev_was_hoisted = false;
            while first_visible < end_idx {
                match nodes[first_visible] {
                    TemplateNode::ConstTag(_) | TemplateNode::SnippetBlock(_) => {
                        first_visible += 1;
                        prev_was_hoisted = true;
                    }
                    // Skip whitespace-only text nodes after ConstTag/SnippetBlock,
                    // since these will be skipped in the main loop (prev_was_const_tag logic)
                    // and should not trigger the text-first anchor.
                    TemplateNode::Text(text)
                        if prev_was_hoisted && is_svelte_whitespace_only(&text.data) =>
                    {
                        first_visible += 1;
                        prev_was_hoisted = false;
                    }
                    _ => break,
                }
            }
            if first_visible < end_idx {
                let first_node = &nodes[first_visible];
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
        }

        // Generate only the meaningful nodes
        // Track when we've just output a TitleElement to trim leading whitespace from next text
        let mut just_had_title = false;
        // Track whether the previous visible text ended with whitespace, for collapsing
        // whitespace across hoisted nodes (matching clean_nodes behavior in the official compiler)
        let mut prev_text_ends_with_ws = false;
        // Track whether we've seen any non-hoisted, non-whitespace content.
        // Before the first real content, whitespace-only text after hoisted nodes
        // should be suppressed (matching the leading trim in clean_nodes after hoisting).
        let mut seen_real_content = false;
        let meaningful_nodes_raw = &nodes[start_idx..end_idx];
        // Sort ConstTag nodes topologically (matching official compiler's sort_const_tags)
        let sorted_meaningful_nodes = body_generator.sort_const_tags_in_nodes(meaningful_nodes_raw);

        let meaningful_nodes = sorted_meaningful_nodes.as_slice();
        for (i, node) in meaningful_nodes.iter().enumerate() {
            let is_last = i == meaningful_nodes.len() - 1;

            // Whitespace-only text before any real content (after hoisted/transparent nodes):
            // In the official compiler, hoisted nodes are removed before leading whitespace
            // trimming, so whitespace between hoisted nodes at the start is removed.
            // After the first real content, whitespace is handled normally via
            // prev_text_ends_with_ws collapsing.
            if !self.preserve_whitespace
                && !seen_real_content
                && let TemplateNode::Text(text) = node
                && is_svelte_whitespace_only(&text.data)
            {
                continue;
            }

            // In SVG namespace, skip whitespace-only text nodes between non-text elements.
            // This matches the official compiler's clean_nodes behavior where
            // can_remove_entirely is true for SVG (except inside <text> elements).
            if !self.preserve_whitespace
                && can_remove_whitespace_entirely
                && let TemplateNode::Text(text) = node
                && is_svelte_whitespace_only(&text.data)
            {
                continue;
            }

            // If we just had a title and this is a text node, trim leading whitespace
            if !self.preserve_whitespace
                && just_had_title
                && let TemplateNode::Text(text) = node
            {
                let mut modified_text = text.clone();
                modified_text.data = modified_text.data.trim_start().to_string().into();
                // Also trim trailing whitespace if this is the last node
                if is_last {
                    modified_text.data = modified_text.data.trim_end().to_string().into();
                }
                prev_text_ends_with_ws = modified_text.data.ends_with([' ', '\t', '\r', '\n']);
                body_generator.generate_node(&TemplateNode::Text(modified_text), false)?;
                just_had_title = false;
                seen_real_content = true;
                continue;
            }
            just_had_title = matches!(node, TemplateNode::TitleElement(_));
            let is_const_tag = matches!(node, TemplateNode::ConstTag(_));
            // Comment nodes without preserveComments are transparent (like SnippetBlock):
            // they don't produce output, don't reset whitespace tracking, and don't
            // trigger async const flushing. This matches the official compiler's
            // clean_nodes behavior which strips comments from the AST.
            let is_transparent_comment =
                matches!(node, TemplateNode::Comment(_)) && !self.preserve_comments;
            let is_hoisted = is_const_tag
                || matches!(node, TemplateNode::SnippetBlock(_))
                || is_transparent_comment;
            // Flush accumulated async consts before processing non-const content.
            // Also skip SnippetBlock and transparent comments since those are hoisted/stripped.
            if !is_hoisted {
                body_generator.flush_async_consts();
            }

            // Handle text nodes: apply whitespace collapsing matching clean_nodes behavior
            if let TemplateNode::Text(text) = node {
                let mut data = text.data.to_string();

                // Collapse leading whitespace when previous visible text ended with whitespace
                // This handles the case where a hoisted node (SnippetBlock) was between
                // two text nodes: A\n{#snippet}...{/snippet}\nB → A B (not A  B)
                if !self.preserve_whitespace && prev_text_ends_with_ws {
                    data = data
                        .trim_start_matches(|c: char| {
                            matches!(c, ' ' | '\t' | '\r' | '\n' | '\x0C')
                        })
                        .to_string();
                }

                // For the last text node, trim trailing whitespace
                if !self.preserve_whitespace && is_last {
                    data = svelte_trim_end(&data).to_string();
                }

                prev_text_ends_with_ws = data.ends_with([' ', '\t', '\r', '\n']);

                if !data.is_empty() {
                    let mut modified_text = text.clone();
                    modified_text.data = data.into();
                    body_generator.generate_node(&TemplateNode::Text(modified_text), false)?;
                    seen_real_content = true;
                }
                continue;
            }

            // Non-text node: reset prev_text_ends_with_ws if it's not hoisted/transparent
            if !is_hoisted {
                prev_text_ends_with_ws = false;
                seen_real_content = true;
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

        // Flush accumulated async const tags into $$renderer.run() call.
        // This matches the official compiler's Fragment visitor which flushes
        // async_consts after processing all children.
        body_generator.flush_async_consts();

        // Include snippets defined in this fragment as inline SnippetFunction parts.
        // In the official compiler, snippet blocks are hoisted and emitted as function
        // declarations within the same scope (matching Fragment visitor behavior).
        let mut parts = body_generator.output_parts;
        for snippet in body_generator.snippets {
            // Insert snippet function BEFORE the async consts run call
            // (snippets are hoisted in JS, so they can reference promises declared later)
            // Find the position of the last RawStatement that starts with "let " or
            // the last ConstDeclaration, and insert after that.
            let insert_pos = parts
                .iter()
                .rposition(|p| {
                    matches!(p, OutputPart::RawStatement(s) if s.starts_with("let "))
                        || matches!(p, OutputPart::ConstDeclaration(_))
                })
                .map(|pos| pos + 1)
                .unwrap_or(0);
            parts.insert(
                insert_pos,
                OutputPart::SnippetFunction {
                    name: snippet.name,
                    params: snippet.params,
                    body: snippet.body_parts,
                },
            );
        }

        // Apply const-tag-level async wrapping to fragment body parts
        let const_blocker_map = body_generator.const_blocker_map.borrow();
        let parts = if !const_blocker_map.is_empty() {
            Self::apply_const_async_wrapping(&parts, &const_blocker_map)
        } else {
            parts
        };
        drop(const_blocker_map);

        Ok(parts)
    }

    /// Generate children from a list of nodes (excluding snippets)
    pub(crate) fn generate_children_from_nodes(
        &mut self,
        nodes: &[&TemplateNode],
    ) -> Result<Option<Vec<OutputPart>>, TransformError> {
        self.generate_children_from_nodes_inner(nodes, true)
    }

    /// Same as `generate_children_from_nodes` but without the leading <!---> anchor.
    /// Used for contexts where text-first content doesn't need an anchor
    /// (e.g., slot element fallback, svelte:fragment children).
    pub(crate) fn generate_children_from_nodes_no_anchor(
        &mut self,
        nodes: &[&TemplateNode],
    ) -> Result<Option<Vec<OutputPart>>, TransformError> {
        self.generate_children_from_nodes_inner(nodes, false)
    }

    fn generate_children_from_nodes_inner(
        &mut self,
        nodes: &[&TemplateNode],
        add_text_anchor: bool,
    ) -> Result<Option<Vec<OutputPart>>, TransformError> {
        let len = nodes.len();
        if len == 0 {
            return Ok(None);
        }

        // Find first and last meaningful content
        // Skip whitespace-only text nodes and comment nodes when trimming
        // Unless preserveWhitespace/preserveComments is set
        let mut start_idx = 0;
        let mut end_idx = len;

        if !self.preserve_whitespace {
            while start_idx < len {
                match nodes[start_idx] {
                    TemplateNode::Text(text) if is_svelte_whitespace_only(&text.data) => {
                        start_idx += 1;
                        continue;
                    }
                    TemplateNode::Comment(_) if !self.preserve_comments => {
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
                    TemplateNode::Comment(_) if !self.preserve_comments => {
                        end_idx -= 1;
                        continue;
                    }
                    _ => break,
                }
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
        body_generator.preserve_whitespace = self.preserve_whitespace;
        body_generator.const_promises_counter = self.const_promises_counter.clone();
        body_generator.const_blocker_map = self.const_blocker_map.clone();

        // Check if first visible content is text/expression
        // If so, add <!---> anchor to prevent text fusion during hydration.
        // Only add if add_text_anchor is true - some contexts (slot fallback, svelte:fragment)
        // do not need the anchor as the content is isolated in its own function.
        // Skip ConstTag and SnippetBlock nodes when looking for the first visible content
        // since they don't produce HTML output.
        let mut first_visible_idx = start_idx;
        let mut prev_was_hoisted = false;
        while first_visible_idx < end_idx {
            match nodes[first_visible_idx] {
                TemplateNode::ConstTag(_) | TemplateNode::SnippetBlock(_) => {
                    first_visible_idx += 1;
                    prev_was_hoisted = true;
                }
                // Skip whitespace-only text nodes after ConstTag/SnippetBlock,
                // since these will be skipped in the main loop and should not trigger anchor.
                TemplateNode::Text(text)
                    if prev_was_hoisted && is_svelte_whitespace_only(&text.data) =>
                {
                    first_visible_idx += 1;
                    prev_was_hoisted = false;
                }
                _ => break,
            }
        }
        let first_content = nodes.get(first_visible_idx);
        let needs_anchor = add_text_anchor
            && matches!(
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

            // Flush accumulated async consts before processing non-const content
            if !matches!(node, TemplateNode::ConstTag(_))
                && !matches!(node, TemplateNode::SnippetBlock(_))
            {
                body_generator.flush_async_consts();
            }

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

                // Check if the fragment has any ConstTag children - if so, wrap in a BlockScope
                // to match the official compiler's Fragment visitor which always returns a BlockStatement
                let has_const_tags = frag_to_process
                    .iter()
                    .any(|n| matches!(n, TemplateNode::ConstTag(_)));

                // Generate fragment children into a temporary generator
                let mut frag_generator = ServerCodeGenerator::new(
                    body_generator.component_name.clone(),
                    body_generator.source.clone(),
                    None,
                    None,
                    None,
                    body_generator.use_async,
                );
                frag_generator.constant_vars = body_generator.constant_vars.clone();
                frag_generator.namespace = body_generator.namespace.clone();
                frag_generator.const_promises_counter =
                    body_generator.const_promises_counter.clone();
                frag_generator.const_blocker_map = body_generator.const_blocker_map.clone();

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
                            frag_generator
                                .output_parts
                                .push(OutputPart::Html(escape_html(&sanitize_template_string(
                                    &raw,
                                ))));
                        }
                    } else {
                        frag_generator.generate_node(fnode, false)?;
                    }
                }

                frag_generator.flush_async_consts();

                // Apply const-tag-level async wrapping to fragment body parts
                let frag_const_blocker_map = frag_generator.const_blocker_map.borrow();
                let frag_parts = if !frag_const_blocker_map.is_empty() {
                    Self::apply_const_async_wrapping(
                        &frag_generator.output_parts,
                        &frag_const_blocker_map,
                    )
                } else {
                    frag_generator.output_parts
                };
                drop(frag_const_blocker_map);

                if has_const_tags && !frag_parts.is_empty() {
                    // Wrap in a BlockScope for proper { } scoping
                    body_generator
                        .output_parts
                        .push(OutputPart::BlockScope { body: frag_parts });
                } else {
                    // No const tags - inline directly as before
                    body_generator.output_parts.extend(frag_parts);
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
                        .push(OutputPart::Html(escape_html(&sanitize_template_string(
                            &raw,
                        ))));
                }
                continue;
            }
            body_generator.generate_node(node, false)?;
        }

        // Flush accumulated async const tags
        body_generator.flush_async_consts();

        // Apply const-tag-level async wrapping to children body parts
        let const_blocker_map = body_generator.const_blocker_map.borrow();
        let body_parts = if !const_blocker_map.is_empty() {
            Self::apply_const_async_wrapping(&body_generator.output_parts, &const_blocker_map)
        } else {
            body_generator.output_parts
        };
        drop(const_blocker_map);

        Ok(Some(body_parts))
    }
}
