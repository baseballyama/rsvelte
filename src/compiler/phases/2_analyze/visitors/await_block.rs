//! AwaitBlock visitor.
//!
//! Analyzes {#await} blocks.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AwaitBlock.js`.

use std::sync::LazyLock;

use regex::Regex;

use super::super::errors;
use super::VisitorContext;
use super::shared::fragment;
use super::shared::utils::{validate_block_not_empty, validate_opening_tag, walk_js_expression};
use crate::ast::template::AwaitBlock;
use crate::compiler::phases::phase2_analyze::AnalysisError;

// Cached regular expressions for block syntax validation
static REGEX_THEN_BLOCK: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"\{(\s*):then\s+$").unwrap());
static REGEX_CATCH_BLOCK: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"\{(\s*):catch\s+$").unwrap());

/// Visit an await block.
///
/// Corresponds to the `AwaitBlock` function in AwaitBlock.js.
///
/// # Arguments
///
/// * `block` - The await block to analyze
/// * `context` - The visitor context
pub fn visit(block: &mut AwaitBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check if inside a textarea (logic blocks not allowed)
    if context.element_ancestors.iter().any(|a| a == "textarea") {
        return Err(errors::block_invalid_placement("{#await ...}"));
    }

    // Validate that blocks are not empty (only whitespace)
    if let Some(warning) = validate_block_not_empty(block.pending.as_ref())? {
        context.emit_warning(warning);
    }
    if let Some(warning) = validate_block_not_empty(block.then.as_ref())? {
        context.emit_warning(warning);
    }
    if let Some(warning) = validate_block_not_empty(block.catch.as_ref())? {
        context.emit_warning(warning);
    }

    // In runes mode, validate opening tag syntax
    if context.analysis.runes {
        // Validate that opening is `{#` without whitespace
        validate_opening_tag(block.start as usize, &context.analysis.source, '#')?;

        // Check for whitespace before `:then` in runes mode
        if let Some(ref value) = block.value {
            let start = value.start().unwrap_or(0) as usize;
            if start >= 10 {
                let substr = &context.analysis.source[start.saturating_sub(10)..start];
                // Match pattern: `{` followed by optional whitespace, `:then` followed by space
                if let Some(captures) = REGEX_THEN_BLOCK.captures(substr)
                    && let Some(whitespace) = captures.get(1)
                    && !whitespace.as_str().is_empty()
                {
                    return Err(AnalysisError::ValidationWithCode {
                        code: "block_unexpected_character".to_string(),
                        message: "Expected '{:then', not '{ :then'".to_string(),
                    });
                }
            }
        }

        // Check for whitespace before `:catch` in runes mode
        if let Some(ref error) = block.error {
            let start = error.start().unwrap_or(0) as usize;
            if start >= 10 {
                let substr = &context.analysis.source[start.saturating_sub(10)..start];
                // Match pattern: `{` followed by optional whitespace, `:catch` followed by space
                if let Some(captures) = REGEX_CATCH_BLOCK.captures(substr)
                    && let Some(whitespace) = captures.get(1)
                    && !whitespace.as_str().is_empty()
                {
                    return Err(AnalysisError::ValidationWithCode {
                        code: "block_unexpected_character".to_string(),
                        message: "Expected '{:catch', not '{ :catch'".to_string(),
                    });
                }
            }
        }
    }

    // Mark that control flow affects sibling relationships
    // This is used for CSS scoping analysis
    context.analysis.css.has_control_flow = true;

    // Visit the expression to populate metadata (has_await, has_state, dependencies, etc.)
    // In the JS version: context.visit(node.expression, { ...context.state, expression: node.metadata.expression });
    let crate::ast::js::Expression::Value(value) = &block.expression;
    walk_js_expression(value, context, &mut block.metadata.expression)?;

    // Increment block depth for child analysis
    context.block_depth += 1;

    // Clear is_direct_child_of_component since children of control flow blocks
    // are not direct children of a component
    let was_direct_child = context.is_direct_child_of_component;
    context.is_direct_child_of_component = false;

    // Push fragment owner type for const_tag placement validation
    context
        .fragment_owner_stack
        .push(super::FragmentOwnerType::AwaitBlock);

    // Analyze the pending block (shown while awaiting)
    if let Some(ref mut pending) = block.pending {
        fragment::analyze(pending, context)?;
    }

    // Analyze the then block (shown on success, creates scope for value)
    if let Some(ref mut then) = block.then {
        // TODO: Create a scope for the value binding if it exists
        fragment::analyze(then, context)?;
    }

    // Analyze the catch block (shown on error, creates scope for error)
    if let Some(ref mut catch) = block.catch {
        // TODO: Create a scope for the error binding if it exists
        fragment::analyze(catch, context)?;
    }

    // Pop fragment owner type
    context.fragment_owner_stack.pop();

    // Restore is_direct_child_of_component
    context.is_direct_child_of_component = was_direct_child;

    // Decrement block depth
    context.block_depth -= 1;

    Ok(())
}

/// Alias for visit function.
pub fn visit_await_block(
    block: &mut AwaitBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(block, context)
}
