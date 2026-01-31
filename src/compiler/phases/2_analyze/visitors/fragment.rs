//! Fragment visitor.
//!
//! Analyzes template fragments.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Fragment.js`.

use super::VisitorContext;
use crate::ast::template::{Fragment, TemplateNode};
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::utils::extract_svelte_ignore;

/// Collect svelte-ignore codes from preceding comments.
///
/// This looks back through the nodes before the current index to find
/// comments that precede the node (possibly separated by text nodes).
fn collect_preceding_ignores(nodes: &[TemplateNode], idx: usize, runes: bool) -> Vec<String> {
    let mut ignores = Vec::new();

    // Look backwards through preceding nodes
    for i in (0..idx).rev() {
        match &nodes[i] {
            TemplateNode::Comment(comment) => {
                // Extract svelte-ignore codes from this comment
                let codes = extract_svelte_ignore(&comment.data, runes);
                ignores.extend(codes);
            }
            TemplateNode::Text(_) => {
                // Text nodes are OK, continue looking back
            }
            _ => {
                // Any other node type stops the search
                break;
            }
        }
    }

    ignores
}

/// Analyze a fragment.
pub fn analyze(fragment: &mut Fragment, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let runes = context.analysis.runes;

    // First pass: collect all ignore information
    // We need to separate this from visiting to avoid borrow conflicts
    let ignore_info: Vec<(usize, Vec<String>)> = fragment
        .nodes
        .iter()
        .enumerate()
        .filter_map(|(idx, node)| {
            // Skip comments and text when collecting ignores
            if matches!(node, TemplateNode::Comment(_) | TemplateNode::Text(_)) {
                None
            } else {
                let ignores = collect_preceding_ignores(&fragment.nodes, idx, runes);
                if ignores.is_empty() {
                    Some((idx, Vec::new()))
                } else {
                    Some((idx, ignores))
                }
            }
        })
        .collect();

    // Create a map for quick lookup
    let ignore_map: std::collections::HashMap<usize, Vec<String>> =
        ignore_info.into_iter().collect();

    // Second pass: visit nodes with proper ignore handling
    for (idx, node) in fragment.nodes.iter_mut().enumerate() {
        if let Some(ignores) = ignore_map.get(&idx) {
            let has_ignores = !ignores.is_empty();

            if has_ignores {
                context.push_ignore(ignores.clone());
            }

            super::visit_node(node, context)?;

            if has_ignores {
                context.pop_ignore();
            }
        } else {
            super::visit_node(node, context)?;
        }
    }
    Ok(())
}

/// Alias for analyze function.
pub fn visit_fragment(
    fragment: &mut Fragment,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    analyze(fragment, context)
}
