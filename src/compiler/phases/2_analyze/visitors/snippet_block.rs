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

    Ok(())
}

/// Alias for visit function.
pub fn visit_snippet_block(
    block: &mut SnippetBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(block, context)
}
