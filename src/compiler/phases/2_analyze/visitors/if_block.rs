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
pub fn visit(block: &IfBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Analyze the test expression
    // In a full implementation, we would analyze the expression for references

    // Analyze the consequent
    fragment::analyze(&block.consequent, context)?;

    // Analyze the alternate if present
    if let Some(ref alternate) = block.alternate {
        fragment::analyze(alternate, context)?;
    }

    Ok(())
}

/// Alias for visit function.
pub fn visit_if_block(block: &IfBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    visit(block, context)
}
