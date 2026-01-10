//! IfBlock visitor.
//!
//! Analyzes {#if} blocks.
//!
//! Corresponds to Svelte's `2-analyze/visitors/IfBlock.js`.

use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::IfBlock;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an if block.
pub fn visit(block: &mut IfBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark that we have control flow affecting sibling relationships
    context.analysis.css.has_control_flow = true;

    // Analyze the test expression
    // In a full implementation, we would analyze the expression for references

    // Increment block depth for child analysis
    context.block_depth += 1;

    // Analyze the consequent
    fragment::analyze(&mut block.consequent, context)?;

    // Analyze the alternate if present
    if let Some(ref mut alternate) = block.alternate {
        fragment::analyze(alternate, context)?;
    }

    // Decrement block depth
    context.block_depth -= 1;

    Ok(())
}

/// Alias for visit function.
pub fn visit_if_block(block: &mut IfBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    visit(block, context)
}
