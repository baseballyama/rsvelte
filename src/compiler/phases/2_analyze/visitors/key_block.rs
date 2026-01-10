//! KeyBlock visitor.
//!
//! Analyzes {#key} blocks.
//!
//! Corresponds to Svelte's `2-analyze/visitors/KeyBlock.js`.

use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::KeyBlock;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a key block.
pub fn visit(block: &mut KeyBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Analyze the key expression
    // In a full implementation, we would analyze the expression for references

    // Analyze the fragment
    fragment::analyze(&mut block.fragment, context)?;

    Ok(())
}

/// Alias for visit function.
pub fn visit_key_block(
    block: &mut KeyBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(block, context)
}
