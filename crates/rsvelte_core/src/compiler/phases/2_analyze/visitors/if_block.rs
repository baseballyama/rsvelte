//! IfBlock visitor.
//!
//! Analyzes {#if} blocks.
//!
//! Corresponds to Svelte's `2-analyze/visitors/IfBlock.js`.

use super::super::errors;
use super::VisitorContext;
use super::shared::fragment;
use super::shared::utils::{
    validate_block_not_empty, validate_opening_tag, walk_js_expression_node,
};
use crate::ast::js::Expression;
use crate::ast::template::IfBlock;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an if block.
pub fn visit<'a, 'b: 'a>(
    block: &mut IfBlock<'b>,
    context: &mut VisitorContext<'a>,
) -> Result<(), AnalysisError> {
    // Check if inside a textarea (logic blocks not allowed)
    if context.element_ancestors.iter().any(|a| a == "textarea") {
        return Err(errors::block_invalid_placement("{#if ...}"));
    }

    // Validate block is not empty (warn if only whitespace)
    if let Some(warning) = validate_block_not_empty(Some(&block.consequent))? {
        context.emit_warning(warning);
    }
    if let Some(ref alternate) = block.alternate
        && let Some(warning) = validate_block_not_empty(Some(alternate))?
    {
        context.emit_warning(warning);
    }

    // In runes mode, validate that the tag starts with '{#' (no whitespace)
    // But skip validation for else-if blocks which start with '{:'
    if context.analysis.runes {
        let start = block.start as usize;
        if start + 1 < context.analysis.source.len() {
            let chars: Vec<char> = context.analysis.source[start..].chars().take(2).collect();
            // Only validate if this is not an else-if block (which starts with {:)
            if chars.len() >= 2 && chars[1] != ':' {
                validate_opening_tag(start, &context.analysis.source, '#')?;
            }
        }
    }

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

    // Clear is_direct_child_of_component since children of control flow blocks
    // are not direct children of a component
    let was_direct_child = context.is_direct_child_of_component;
    let was_direct_snippet = context.is_direct_child_of_snippet;
    context.is_direct_child_of_component = false;
    context.is_direct_child_of_snippet = false;

    // Push fragment owner type for const_tag placement validation
    context
        .fragment_owner_stack
        .push(super::FragmentOwnerType::IfBlock);

    // Analyze the consequent
    fragment::analyze(&mut block.consequent, context)?;

    // Analyze the alternate if present
    if let Some(ref mut alternate) = block.alternate {
        fragment::analyze(alternate, context)?;
    }

    // Pop fragment owner type
    context.fragment_owner_stack.pop();

    // Restore is_direct_child_of_component
    context.is_direct_child_of_component = was_direct_child;
    context.is_direct_child_of_snippet = was_direct_snippet;

    // Decrement block depth
    context.block_depth -= 1;

    Ok(())
}

/// Analyze the test expression and populate metadata.
///
/// Walks the JavaScript AST to detect await expressions, call expressions,
/// member expressions, assignments, and identifier references.
fn analyze_test_expression(
    test: &Expression,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Get the current expression metadata if set
    if let Some(metadata_ptr) = context.expression {
        // SAFETY: `metadata_ptr` is the `*mut ExpressionMetadata` installed on the
        // visit context by the enclosing if-block scope; it points at metadata on
        // an AST node that outlives this single-threaded traversal, and that node
        // is not otherwise borrowed here, so there is no aliasing.
        let metadata = unsafe { &mut *metadata_ptr };

        // Walk the JS AST to detect expression features
        let node = test.as_node();
        walk_js_expression_node(&node, context, metadata)?;

        // Detect pickled awaits in template test expressions.
        // Template expressions are reactive contexts, so await expressions
        // that aren't the last evaluated expression need $.save() wrapping.
        super::await_block::collect_pickled_awaits_node(
            &node,
            &mut context.analysis.pickled_awaits,
            context.parse_arena,
        );
    }

    Ok(())
}
