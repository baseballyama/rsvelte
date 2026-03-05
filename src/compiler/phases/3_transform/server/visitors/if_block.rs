//! Server-side if block visitor.

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use crate::ast::template::{Fragment, IfBlock, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::utils::is_svelte_whitespace_only;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_if_block(&mut self, block: &IfBlock) -> Result<(), TransformError> {
        // Get the test expression from the source
        let start = block.test.start().unwrap_or(0) as usize;
        let end = block.test.end().unwrap_or(0) as usize;
        let test_expr = if end > start && end <= self.source.len() {
            self.source[start..end].trim().to_string()
        } else {
            "false".to_string()
        };

        // Transform store subscriptions ($store -> $.store_get())
        let test_expr = self.transform_store_refs(&test_expr);
        // Transform special legacy variables ($$props -> $$sanitized_props)
        let test_expr = self.transform_special_vars(&test_expr);

        // Generate consequent body parts
        let consequent_body = self.generate_if_branch_body(&block.consequent)?;

        // Generate alternate body parts if present
        let alternate_body = if let Some(ref alternate) = block.alternate {
            Some(self.generate_if_branch_body(alternate)?)
        } else {
            None
        };

        self.output_parts.push(OutputPart::IfBlock {
            test_expr,
            consequent_body,
            alternate_body,
            is_elseif: block.elseif,
        });

        Ok(())
    }

    /// Generate body parts for an if/else branch, handling nested IfBlocks for else-if chains.
    pub(crate) fn generate_if_branch_body(
        &mut self,
        fragment: &Fragment,
    ) -> Result<Vec<OutputPart>, TransformError> {
        // Check if this fragment contains only a single IfBlock (else-if case)
        let nodes: Vec<_> = fragment.nodes.iter().collect();

        // Filter out whitespace-only text nodes
        let meaningful_nodes: Vec<_> = nodes
            .iter()
            .filter(|n| {
                if let TemplateNode::Text(text) = n {
                    !is_svelte_whitespace_only(&text.data)
                } else {
                    true
                }
            })
            .collect();

        // If there's exactly one node and it's an IfBlock with elseif=true, this is an else-if chain.
        // When elseif=false, it's a separate {#if} block nested inside {:else}, not a chain.
        if meaningful_nodes.len() == 1
            && let TemplateNode::IfBlock(nested_if) = meaningful_nodes[0]
            && nested_if.elseif
        {
            // For else-if, we return a nested IfBlock OutputPart directly
            let nested_test_start = nested_if.test.start().unwrap_or(0) as usize;
            let nested_test_end = nested_if.test.end().unwrap_or(0) as usize;
            let nested_test_expr =
                if nested_test_end > nested_test_start && nested_test_end <= self.source.len() {
                    self.source[nested_test_start..nested_test_end]
                        .trim()
                        .to_string()
                } else {
                    "false".to_string()
                };
            let nested_test_expr = self.transform_store_refs(&nested_test_expr);
            let nested_test_expr = self.transform_special_vars(&nested_test_expr);

            let nested_consequent = self.generate_if_branch_body(&nested_if.consequent)?;
            let nested_alternate = if let Some(ref alt) = nested_if.alternate {
                Some(self.generate_if_branch_body(alt)?)
            } else {
                None
            };

            return Ok(vec![OutputPart::IfBlock {
                test_expr: nested_test_expr,
                consequent_body: nested_consequent,
                alternate_body: nested_alternate,
                is_elseif: true,
            }]);
        }

        // Standard case: generate body parts for the branch
        let len = nodes.len();
        let mut start_idx = 0;
        let mut end_idx = len;

        // Skip leading whitespace and comments (comments don't produce output)
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

        // Skip trailing whitespace and comments
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

        // Collect trimmed nodes (owned) - nodes is Vec<&TemplateNode> so we need to clone
        let mut trimmed_nodes: Vec<TemplateNode> = nodes
            .iter()
            .take(end_idx)
            .skip(start_idx)
            .map(|n| (*n).clone())
            .collect();

        // Trim leading whitespace from first text node and trailing whitespace from last text node
        // This handles cases like `{#if cond}\nmid\n{/if}` which should output `mid` not ` mid `
        if !trimmed_nodes.is_empty() {
            // Find the first text node (may be after ConstTag or other non-output nodes)
            for node in trimmed_nodes.iter_mut() {
                if let TemplateNode::Text(text) = node {
                    let trimmed_data = text.data.trim_start().to_string();
                    text.data = trimmed_data.into();
                    break;
                }
                // Skip non-output nodes like ConstTag
                if !matches!(node, TemplateNode::ConstTag(_)) {
                    break;
                }
            }
            // Find the last text node (may be before trailing non-output nodes)
            for node in trimmed_nodes.iter_mut().rev() {
                if let TemplateNode::Text(text) = node {
                    let trimmed_data = text.data.trim_end().to_string();
                    text.data = trimmed_data.into();
                    break;
                }
                if !matches!(node, TemplateNode::ConstTag(_)) {
                    break;
                }
            }
        }

        // Sort ConstTag nodes topologically (matching official compiler's sort_const_tags)
        trimmed_nodes = self.sort_const_tags_owned(trimmed_nodes);

        // Check if this fragment is standalone (only contains a single RenderTag/Component)
        let is_standalone = Self::is_standalone_fragment(&trimmed_nodes);

        // Generate body parts with the appropriate skip_hydration_boundaries flag
        let mut body_generator = self.new_child_generator(is_standalone);
        // Mark that we're inside a block body so async expressions don't use $.save()
        body_generator.in_block_body = true;
        body_generator.in_if_body = true;

        for node in &trimmed_nodes {
            body_generator.generate_node(node, false)?;
        }

        // Include any snippets defined inside the block as inline SnippetFunction parts
        // This handles cases like `{#if true}{#snippet test()}{/snippet}{/if}`
        // where the snippet function needs to be emitted inside the if-block body
        let mut parts = body_generator.output_parts;
        for snippet in body_generator.snippets {
            parts.push(OutputPart::SnippetFunction {
                name: snippet.name,
                params: snippet.params,
                body: snippet.body_parts,
            });
        }

        Ok(parts)
    }
}
