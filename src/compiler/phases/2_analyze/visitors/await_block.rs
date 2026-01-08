//! AwaitBlock visitor.
//!
//! Analyzes {#await} blocks.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AwaitBlock.js`.

use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::AwaitBlock;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an await block.
pub fn visit(block: &AwaitBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark that we have control flow affecting sibling relationships
    context.analysis.css.has_control_flow = true;

    // Analyze the expression
    // In a full implementation, we would analyze the expression for references

    // Increment block depth for child analysis
    context.block_depth += 1;

    // Analyze the pending block
    if let Some(ref pending) = block.pending {
        fragment::analyze(pending, context)?;
    }

    // Analyze the then block (creates a scope for the value)
    if let Some(ref then) = block.then {
        fragment::analyze(then, context)?;
    }

    // Analyze the catch block (creates a scope for the error)
    if let Some(ref catch) = block.catch {
        fragment::analyze(catch, context)?;
    }

    // Decrement block depth
    context.block_depth -= 1;

    Ok(())
}

/// Alias for visit function.
pub fn visit_await_block(
    block: &AwaitBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(block, context)
}
