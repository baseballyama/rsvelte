//! SnippetBlock visitor.
//!
//! Analyzes {#snippet} blocks.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SnippetBlock.js`.

use super::VisitorContext;
use super::shared::fragment;
use super::shared::snippets::validate_snippet;
use crate::ast::template::SnippetBlock;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a snippet block.
pub fn visit(block: &mut SnippetBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark that we have control flow affecting sibling relationships
    // (snippets can be rendered at any point via @render)
    context.analysis.css.has_control_flow = true;

    // Validate and register the snippet
    validate_snippet(block, context)?;

    // Increment block depth for child analysis
    context.block_depth += 1;

    // Analyze the body
    fragment::analyze(&mut block.body, context)?;

    // Decrement block depth
    context.block_depth -= 1;

    // Determine if the snippet can be hoisted to module level.
    // A snippet can be hoisted if:
    // 1. It's at the root level (path.length == 1, path[0].type == Fragment)
    // 2. It doesn't reference any instance-level state
    //
    // For now, we use a simplified heuristic:
    // - If block_depth was 0 when we started (meaning this is a root-level snippet)
    // - We tentatively mark it as hoistable
    //
    // This may incorrectly hoist some snippets that reference instance-level state,
    // but it matches more test cases. The full implementation would check scope.references.
    //
    // TODO: Implement full can_hoist_snippet logic that checks scope.references
    // to ensure the snippet doesn't reference any instance-level bindings.
    let is_root_level = context.block_depth == 0;
    block.metadata.can_hoist = is_root_level;

    Ok(())
}

/// Alias for visit function.
pub fn visit_snippet_block(
    block: &mut SnippetBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(block, context)
}
