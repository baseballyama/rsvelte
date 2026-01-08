//! EachBlock visitor.
//!
//! Analyzes {#each} blocks.
//!
//! Corresponds to Svelte's `2-analyze/visitors/EachBlock.js`.

use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::EachBlock;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an each block.
pub fn visit(block: &EachBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark that we have control flow affecting sibling relationships
    context.analysis.css.has_control_flow = true;

    // Analyze the expression
    // In a full implementation, we would analyze the expression for references

    // Create a new scope for the each block
    // The context binding and index are declared in this scope

    // Analyze the body
    fragment::analyze(&block.body, context)?;

    // Analyze the fallback if present
    if let Some(ref fallback) = block.fallback {
        fragment::analyze(fallback, context)?;
    }

    Ok(())
}

/// Alias for visit function.
pub fn visit_each_block(
    block: &EachBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(block, context)
}
