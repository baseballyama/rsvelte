//! Server-side snippet block visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::strip_ts_type_annotation;
use super::super::types::{OutputPart, SnippetDef};
use crate::ast::template::{Fragment, SnippetBlock, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::{escape_html, sanitize_template_string};
use crate::compiler::phases::phase3_transform::utils::{
    is_svelte_whitespace_only, svelte_trim_end, svelte_trim_start,
};

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
            self.analysis,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();
        body_generator.const_promises_counter = self.const_promises_counter.clone();
        body_generator.const_blocker_map = self.const_blocker_map.clone();
        body_generator.dev = self.dev;
        body_generator.is_typescript = self.is_typescript;
        body_generator.uses_store_subs = self.uses_store_subs;
        body_generator.current_scope_index = self.current_scope_index;
        // Track the snippet body's Phase-2 scope so the evaluator resolves
        // template declarations lexically (a sibling snippet's `{@const}` is
        // not reachable from this body and must not be constant-folded).
        body_generator.current_scope_index = self
            .analysis
            .and_then(|a| a.root.template_scope_map.get(&block.start).copied())
            .or(self.current_scope_index);
        // Snippet parameters shadow outer derived bindings: drop any derived
        // name that matches a parameter binding from the body's derived_names
        // / derived_var_names so we don't wrap reads of the parameter as
        // `name()` inside the body.
        let param_names = Self::collect_snippet_param_binding_names(&params);
        for name in &param_names {
            body_generator.derived_names.remove(name);
            body_generator.derived_var_names.remove(name);
        }

        // Collect non-empty nodes
        let body_nodes: Vec<_> = block.body.nodes.iter().collect();
        let len = body_nodes.len();

        // Find first non-whitespace node. Comments are removed by clean_nodes
        // (when preserveComments is off), so leading comments — and the
        // whitespace around them — are trimmed too.
        let mut start_idx = 0;
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

        // Find last non-whitespace node (trailing comments trimmed likewise)
        let mut end_idx = len;
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

        // Compute standalone-ness for the trimmed fragment
        let is_standalone = self.is_standalone_fragment(
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
            // Hoisted nodes (const / declaration / debug tags, nested
            // snippets) are lifted out by upstream's clean_nodes before the
            // text-first check, so skip them (and the whitespace runs between
            // them) when probing for the first content node.
            let mut probe = start_idx;
            let mut prev_was_hoisted = false;
            while probe < end_idx {
                match body_nodes[probe] {
                    TemplateNode::ConstTag(_)
                    | TemplateNode::DeclarationTag(_)
                    | TemplateNode::SnippetBlock(_)
                    | TemplateNode::DebugTag(_) => {
                        probe += 1;
                        prev_was_hoisted = true;
                    }
                    TemplateNode::Text(text)
                        if prev_was_hoisted && is_svelte_whitespace_only(&text.data) =>
                    {
                        probe += 1;
                        prev_was_hoisted = false;
                    }
                    _ => break,
                }
            }
            let first_node = if probe < end_idx {
                body_nodes.get(probe)
            } else {
                None
            };
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
                // if there is a following node (the space separates text from expression/element).
                // Trims use the Svelte whitespace set (` \t\r\n\x0C`), not Rust's
                // Unicode trim which would also eat `\u{00A0}` (`&nbsp;`).
                if let TemplateNode::Text(text) = node {
                    let trimmed = svelte_trim_start(&text.data);
                    // Check if there's a next node within the trimmed range -
                    // preserve trailing space if so (last text node gets its
                    // trailing whitespace trimmed, like upstream clean_nodes).
                    let next_node = if i + 1 < end_idx {
                        body_nodes.get(i + 1)
                    } else {
                        None
                    };
                    let needs_trailing_space = next_node.is_some()
                        && text
                            .data
                            .chars()
                            .last()
                            .is_some_and(|c| matches!(c, ' ' | '\t' | '\r' | '\n' | '\x0C'));

                    let trimmed_end = svelte_trim_end(trimmed);
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

            // Last node - if it's text, trim its trailing whitespace before the
            // generic Text path collapses it to a space (upstream clean_nodes
            // trims the LAST text node's trailing whitespace entirely).
            if i == end_idx - 1
                && !self.preserve_whitespace
                && let TemplateNode::Text(text) = node
            {
                let mut modified = text.clone();
                modified.data = svelte_trim_end(&modified.data).to_string().into();
                if !modified.data.is_empty() {
                    body_generator.flush_async_consts();
                    body_generator.generate_node(&TemplateNode::Text(modified), false)?;
                }
                prev_was_const_tag = false;
                continue;
            }

            // Skip whitespace-only text nodes after hoisted nodes (ConstTag,
            // nested SnippetBlock, DeclarationTag) — upstream's clean_nodes
            // hoists those out BEFORE whitespace trimming, so the whitespace
            // runs around them vanish. Dropped comments are transparent and
            // do not reset the tracking.
            if prev_was_const_tag
                && let TemplateNode::Text(text) = node
                && is_svelte_whitespace_only(&text.data)
            {
                continue;
            }

            // Track if current node is hoisted (transparent comments keep the
            // previous tracking).
            if !matches!(node, TemplateNode::Comment(_)) || self.preserve_comments {
                prev_was_const_tag = matches!(
                    node,
                    TemplateNode::ConstTag(_)
                        | TemplateNode::SnippetBlock(_)
                        | TemplateNode::DeclarationTag(_)
                );
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

        // Apply const-tag-level async wrapping to snippet body parts
        let const_blocker_map = body_generator.const_blocker_map.borrow();
        let mut body_parts = if !const_blocker_map.is_empty() {
            Self::apply_const_async_wrapping(&body_generator.output_parts, &const_blocker_map)
        } else {
            body_generator.output_parts
        };
        drop(const_blocker_map);

        // Nested snippets declared inside this snippet body are emitted as
        // function declarations within the snippet's own scope (upstream's
        // Fragment visitor hoists SnippetBlocks per fragment, including
        // snippet bodies).
        Self::splice_nested_snippets(&mut body_parts, body_generator.snippets, self.dev);

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
        body_generator.uses_store_subs = self.uses_store_subs;

        // Collect non-empty nodes
        let body_nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = body_nodes.len();

        // Find first non-whitespace node. Comments are removed by clean_nodes
        // (when preserveComments is off), so leading comments — and the
        // whitespace around them — are trimmed too.
        let mut start_idx = 0;
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

        // Find last non-whitespace node (trailing comments trimmed likewise)
        let mut end_idx = len;
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

        // Check if first node is text or expression tag - if so, we need hydration marker
        // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/utils.js clean_nodes()
        // This prevents text from being fused with its surroundings during hydration
        // Hoisted nodes (const / declaration / debug tags, nested snippets)
        // are lifted out by upstream's clean_nodes before the text-first
        // check, so skip them (and the whitespace runs between them) when
        // probing for the first content node.
        let mut probe = start_idx;
        let mut prev_was_hoisted = false;
        while probe < end_idx {
            match body_nodes[probe] {
                TemplateNode::ConstTag(_)
                | TemplateNode::DeclarationTag(_)
                | TemplateNode::SnippetBlock(_)
                | TemplateNode::DebugTag(_) => {
                    probe += 1;
                    prev_was_hoisted = true;
                }
                TemplateNode::Text(text)
                    if prev_was_hoisted && is_svelte_whitespace_only(&text.data) =>
                {
                    probe += 1;
                    prev_was_hoisted = false;
                }
                _ => break,
            }
        }
        let first_node = if probe < end_idx {
            body_nodes.get(probe)
        } else {
            None
        };
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
                // if there is a following node within the trimmed range (the
                // space separates text from expression/element). Trims use the
                // Svelte whitespace set, not Rust's Unicode trim (`&nbsp;`).
                if let TemplateNode::Text(text) = node {
                    let trimmed = svelte_trim_start(&text.data);
                    // Check if there's a next node - preserve trailing space if so
                    let next_node = if i + 1 < end_idx {
                        body_nodes.get(i + 1)
                    } else {
                        None
                    };
                    let needs_trailing_space = next_node.is_some()
                        && text
                            .data
                            .chars()
                            .last()
                            .is_some_and(|c| matches!(c, ' ' | '\t' | '\r' | '\n' | '\x0C'));

                    let trimmed_end = svelte_trim_end(trimmed);
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
            // Last node - if it's text, trim its trailing whitespace before the
            // generic Text path collapses it to a space (upstream clean_nodes
            // trims the LAST text node's trailing whitespace entirely).
            if i == end_idx - 1
                && !self.preserve_whitespace
                && let TemplateNode::Text(text) = node
            {
                let mut modified = (*text).clone();
                modified.data = svelte_trim_end(&modified.data).to_string().into();
                if !modified.data.is_empty() {
                    body_generator.flush_async_consts();
                    body_generator.generate_node(&TemplateNode::Text(modified), false)?;
                }
                continue;
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
        let mut body_parts = if !const_blocker_map.is_empty() {
            Self::apply_const_async_wrapping(&body_generator.output_parts, &const_blocker_map)
        } else {
            body_generator.output_parts
        };
        drop(const_blocker_map);

        // Nested snippets declared inside this fragment are emitted as
        // function declarations within the same scope.
        Self::splice_nested_snippets(&mut body_parts, body_generator.snippets, self.dev);

        Ok(body_parts)
    }

    /// Splice snippet definitions collected while generating a snippet body
    /// into the body parts as `SnippetFunction` declarations. Mirrors the
    /// insertion logic in `generate_fragment_body_parts_inner`: insert after
    /// the last `let `-RawStatement / ConstDeclaration so hoisted promise
    /// declarations stay first, preserving source order.
    fn splice_nested_snippets(
        parts: &mut Vec<OutputPart>,
        snippets: Vec<super::super::types::SnippetDef>,
        dev: bool,
    ) {
        if snippets.is_empty() {
            return;
        }
        let snippet_parts: Vec<OutputPart> = snippets
            .into_iter()
            .map(|snippet| OutputPart::SnippetFunction {
                name: snippet.name,
                params: snippet.params,
                body: snippet.body_parts,
                dev,
            })
            .collect();
        let insert_pos = parts
            .iter()
            .rposition(|p| {
                matches!(p, OutputPart::RawStatement(s) if s.starts_with("let "))
                    || matches!(p, OutputPart::ConstDeclaration(_))
            })
            .map(|pos| pos + 1)
            .unwrap_or(0);
        parts.splice(insert_pos..insert_pos, snippet_parts);
    }

    /// Extract the set of bound identifier names from a list of snippet
    /// parameter source strings (possibly destructured). Used to suppress
    /// outer derived-binding wrap inside the snippet body when a parameter
    /// shadows the derived.
    fn collect_snippet_param_binding_names(params: &[String]) -> Vec<String> {
        let mut names: Vec<String> = Vec::new();
        for p in params {
            collect_binding_names_from_pattern(p, &mut names);
        }
        names
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
                    Self::extract_param_name_from_json(json, source).unwrap_or_default()
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

/// Collect bound identifier names from a parameter-pattern source string.
/// Handles plain identifiers, object/array destructure patterns, defaults
/// (`name = value`), and TS type annotations (`name: number`). Recurses into
/// nested patterns.
fn collect_binding_names_from_pattern(pattern: &str, out: &mut Vec<String>) {
    let p = pattern.trim();
    if p.is_empty() {
        return;
    }
    // Strip default value: `name = expr` — only the LHS counts.
    let p_lhs = if let Some(eq) = find_top_level_eq_for_pattern(p) {
        p[..eq].trim()
    } else {
        p
    };
    if p_lhs.starts_with('{') && p_lhs.ends_with('}') {
        let inner = &p_lhs[1..p_lhs.len() - 1];
        for prop in split_top_level_comma(inner) {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }
            if let Some(rest) = prop.strip_prefix("...") {
                collect_binding_names_from_pattern(rest, out);
                continue;
            }
            if let Some(colon) = find_top_level_colon_for_pattern(prop) {
                // `key: alias_or_pattern (= default)`
                let value = prop[colon + 1..].trim();
                collect_binding_names_from_pattern(value, out);
            } else {
                // Shorthand `name (= default)` — strip type and default.
                let lhs = if let Some(eq) = find_top_level_eq_for_pattern(prop) {
                    prop[..eq].trim()
                } else {
                    prop
                };
                // Strip TS type annotation: `name: type` already handled above.
                if is_simple_ident(lhs) {
                    out.push(lhs.to_string());
                }
            }
        }
        return;
    }
    if p_lhs.starts_with('[') && p_lhs.ends_with(']') {
        let inner = &p_lhs[1..p_lhs.len() - 1];
        for elem in split_top_level_comma(inner) {
            let elem = elem.trim();
            if elem.is_empty() {
                continue;
            }
            if let Some(rest) = elem.strip_prefix("...") {
                collect_binding_names_from_pattern(rest, out);
                continue;
            }
            collect_binding_names_from_pattern(elem, out);
        }
        return;
    }
    // Plain identifier (possibly with TS type annotation `name: type`).
    if let Some(colon) = find_top_level_colon_for_pattern(p_lhs) {
        let name = p_lhs[..colon].trim();
        if is_simple_ident(name) {
            out.push(name.to_string());
        }
    } else if is_simple_ident(p_lhs) {
        out.push(p_lhs.to_string());
    }
}

fn split_top_level_comma(s: &str) -> Vec<&str> {
    let mut out = Vec::new();
    let bytes = s.as_bytes();
    let mut depth = 0i32;
    let mut start = 0usize;
    let mut i = 0usize;
    while i < bytes.len() {
        let c = bytes[i];
        match c {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            b',' if depth == 0 => {
                out.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
        i += 1;
    }
    out.push(&s[start..]);
    out
}

fn find_top_level_eq_for_pattern(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth = 0i32;
    let mut i = 0usize;
    while i < bytes.len() {
        let c = bytes[i];
        match c {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            b'=' if depth == 0 => {
                let next = bytes.get(i + 1).copied();
                if next == Some(b'=') || next == Some(b'>') {
                    i += 2;
                    continue;
                }
                let prev = if i > 0 { Some(bytes[i - 1]) } else { None };
                if matches!(prev, Some(b'!' | b'<' | b'>' | b'=')) {
                    i += 1;
                    continue;
                }
                return Some(i);
            }
            _ => {}
        }
        i += 1;
    }
    None
}

fn find_top_level_colon_for_pattern(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth = 0i32;
    let mut i = 0usize;
    while i < bytes.len() {
        let c = bytes[i];
        match c {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            b':' if depth == 0 => return Some(i),
            _ => {}
        }
        i += 1;
    }
    None
}

fn is_simple_ident(s: &str) -> bool {
    let s = s.trim();
    if s.is_empty() {
        return false;
    }
    let mut chars = s.chars();
    let Some(first) = chars.next() else {
        return false;
    };
    if !(first.is_ascii_alphabetic() || first == '_' || first == '$') {
        return false;
    }
    chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}
