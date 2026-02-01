//! KeyBlock visitor.
//!
//! Analyzes {#key} blocks.
//!
//! Corresponds to Svelte's `2-analyze/visitors/KeyBlock.js`.

use super::VisitorContext;
use super::shared::fragment;
use super::shared::utils::{validate_block_not_empty, validate_opening_tag, walk_js_expression};
use crate::ast::template::KeyBlock;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a key block.
///
/// The {#key} block destroys and recreates its contents whenever the key
/// expression changes. This is useful for triggering transitions or resetting
/// component state.
///
/// Corresponds to `KeyBlock(node, context)` in KeyBlock.js.
pub fn visit(block: &mut KeyBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate that the block is not empty (warn if only whitespace)
    validate_block_not_empty(Some(&block.fragment))?;

    // In runes mode, validate that the tag starts with '{#' (no whitespace)
    if context.analysis.runes {
        validate_opening_tag(block.start as usize, &context.analysis.source, '#')?;
    }

    // Mark the subtree as dynamic
    // This is done by marking all Fragment nodes in the path as dynamic
    fragment::mark_subtree_dynamic(&context.path);

    // Visit the key expression and populate metadata
    // This tracks dependencies and references in the expression
    let crate::ast::js::Expression::Value(value) = &block.expression;
    walk_js_expression(value, context, &mut block.metadata.expression)?;

    // Clear is_direct_child_of_component since children of control flow blocks
    // are not direct children of a component
    let was_direct_child = context.is_direct_child_of_component;
    context.is_direct_child_of_component = false;

    // Visit the fragment
    fragment::analyze(&mut block.fragment, context)?;

    // Restore is_direct_child_of_component
    context.is_direct_child_of_component = was_direct_child;

    Ok(())
}

/// Alias for visit function.
pub fn visit_key_block(
    block: &mut KeyBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(block, context)
}
