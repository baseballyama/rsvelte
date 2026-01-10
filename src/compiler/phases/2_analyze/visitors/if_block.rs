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
    // TODO: validate_block_not_empty for consequent and alternate
    // TODO: validate_opening_tag if in runes mode

    // Mark that we have control flow affecting sibling relationships
    // This corresponds to mark_subtree_dynamic(context.path) in the JS version
    context.analysis.css.has_control_flow = true;

    // Analyze the test expression with metadata tracking
    // Set context.expression to point to block.metadata.expression
    let metadata_ptr = &mut block.metadata.expression as *mut _;
    let saved_expression = context.expression;
    context.expression = Some(metadata_ptr);

    // Visit the test expression (this would walk the JS AST and set metadata fields)
    // For now, we'll do basic analysis
    // TODO: Implement full expression visitor that walks the JS AST
    // and sets has_await, has_call, etc.
    analyze_test_expression(&block.test, context)?;

    // Restore previous expression context
    context.expression = saved_expression;

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

/// Analyze the test expression and populate metadata.
///
/// This is a simplified version. A full implementation would walk the JavaScript
/// AST to detect await expressions, call expressions, member expressions, etc.
fn analyze_test_expression(
    _test: &crate::ast::js::Expression,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Get the current expression metadata if set
    if let Some(metadata_ptr) = context.expression {
        let metadata = unsafe { &mut *metadata_ptr };

        // TODO: Walk the JS AST to detect:
        // - has_await: Check for AwaitExpression nodes
        // - has_call: Check for CallExpression nodes
        // - has_member_expression: Check for MemberExpression nodes
        // - has_assignment: Check for AssignmentExpression nodes
        // - dependencies: Track identifier references
        // - references: Track all identifier references

        // For now, just set defaults
        metadata.has_await = false;
        metadata.has_call = false;
        metadata.has_member_expression = false;
        metadata.has_assignment = false;
    }

    Ok(())
}

/// Alias for visit function.
pub fn visit_if_block(
    block: &mut IfBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(block, context)
}
