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
///
/// This is the main entry point for fragment analysis from the root level.
/// It delegates to shared/fragment.rs for the actual node processing, which
/// includes const_tag_cycle checking.
pub fn analyze(fragment: &mut Fragment, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // The shared::fragment::analyze function handles:
    // - Checking for cyclical dependencies between ConstTag nodes
    // - Visiting each child node
    super::shared::fragment::analyze(fragment, context)?;

    // Handle svelte-ignore comments for this fragment
    let runes = context.analysis.runes;

    // Collect ignore information for nodes that need it
    // Note: The actual node visiting is already done by shared::fragment::analyze
    // This is just for tracking ignores at the root level
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

    // The ignore handling is used during validation to suppress warnings
    // Store ignore info if needed for future validation passes
    let _ = ignore_info; // Currently not used, but available for future warning suppression

    Ok(())
}

/// Alias for analyze function.
pub fn visit_fragment(
    fragment: &mut Fragment,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    analyze(fragment, context)
}
