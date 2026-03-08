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

    // Check if await block is non-exhaustive (missing any of the 3 branches).
    // Non-exhaustive await blocks may render nothing in some states, creating gaps
    // in sibling chains that Phase 2 analysis doesn't fully track.
    let is_exhaustive = block.pending.is_some() && block.then.is_some() && block.catch.is_some();
    if !is_exhaustive {
        context.analysis.css.has_opaque_elements = true;
    }

    // Visit the expression to populate metadata (has_await, has_state, dependencies, etc.)
    // In the JS version: context.visit(node.expression, { ...context.state, expression: node.metadata.expression });
    let value = block.expression.as_json();
    walk_js_expression(value, context, &mut block.metadata.expression)?;

    // Walk the value pattern's computed property key expressions to detect mutations.
    // For example: {#await promise then { [`prop${num++}`]: ... }}
    // The `num++` in the computed key needs to be detected as a reassignment.
    if let Some(ref value_pattern) = block.value {
        let pattern_json = value_pattern.as_json();
        let mut dummy_metadata = crate::ast::template::ExpressionMetadata::default();
        walk_pattern_computed_keys(pattern_json, context, &mut dummy_metadata)?;
    }

    // Also walk the error pattern's computed property key expressions
    if let Some(ref error_pattern) = block.error {
        let pattern_json = error_pattern.as_json();
        let mut dummy_metadata = crate::ast::template::ExpressionMetadata::default();
        walk_pattern_computed_keys(pattern_json, context, &mut dummy_metadata)?;
    }

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
        // Update scope for the then block (value bindings like AwaitThen)
        let old_scope = context.scope;
        if let Some(&then_scope) = context
            .analysis
            .root
            .template_scope_map
            .get(&(block.start + 1))
        {
            context.scope = then_scope;
        }
        fragment::analyze(then, context)?;
        context.scope = old_scope;
    }

    // Analyze the catch block (shown on error, creates scope for error)
    if let Some(ref mut catch) = block.catch {
        // Update scope for the catch block (error bindings like AwaitCatch)
        let old_scope = context.scope;
        if let Some(&catch_scope) = context
            .analysis
            .root
            .template_scope_map
            .get(&(block.start + 2))
        {
            context.scope = catch_scope;
        }
        fragment::analyze(catch, context)?;
        context.scope = old_scope;
    }

    // Pop fragment owner type
    context.fragment_owner_stack.pop();

    // Restore is_direct_child_of_component
    context.is_direct_child_of_component = was_direct_child;

    // Decrement block depth
    context.block_depth -= 1;

    Ok(())
}

/// Walk a destructuring pattern and visit any computed property key expressions.
/// This ensures that expressions like `num++` inside `{ [`prop${num++}`]: ... }`
/// are properly analyzed for mutations and reassignments.
fn walk_pattern_computed_keys(
    pattern: &serde_json::Value,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    let pattern_type = pattern.get("type").and_then(|t| t.as_str());

    match pattern_type {
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for prop in properties {
                    let prop_type = prop.get("type").and_then(|t| t.as_str());
                    if prop_type == Some("RestElement") {
                        if let Some(argument) = prop.get("argument") {
                            walk_pattern_computed_keys(argument, context, metadata)?;
                        }
                    } else {
                        // Property node - check if it has a computed key
                        let computed = prop
                            .get("computed")
                            .and_then(|c| c.as_bool())
                            .unwrap_or(false);
                        if computed && let Some(key) = prop.get("key") {
                            walk_expression_for_mutations(key, context, metadata)?;
                        }
                        // Also recurse into the value pattern
                        if let Some(value) = prop.get("value") {
                            walk_pattern_computed_keys(value, context, metadata)?;
                        }
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        walk_pattern_computed_keys(elem, context, metadata)?;
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = pattern.get("left") {
                walk_pattern_computed_keys(left, context, metadata)?;
            }
        }
        _ => {}
    }

    Ok(())
}

/// Walk a JavaScript expression and detect mutations (UpdateExpression, AssignmentExpression).
/// This first calls walk_js_expression for metadata tracking, then recursively looks for
/// mutation expressions and marks the affected bindings.
fn walk_expression_for_mutations(
    expression: &serde_json::Value,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    // Walk for metadata (dependency tracking, state detection, etc.)
    walk_js_expression(expression, context, metadata)?;

    // Additionally, recursively walk all sub-expressions looking for mutations
    mark_mutations_recursive(expression, context);

    Ok(())
}

/// Recursively walk an expression tree to find and mark UpdateExpression and
/// AssignmentExpression nodes, calling mark_binding_mutation for each.
fn mark_mutations_recursive(expression: &serde_json::Value, context: &mut VisitorContext) {
    let expr_type = expression.get("type").and_then(|t| t.as_str());

    match expr_type {
        Some("UpdateExpression") => {
            if let Some(argument) = expression.get("argument") {
                super::assignment_expression::mark_binding_mutation(argument, context);
            }
        }
        Some("AssignmentExpression") => {
            if let Some(left) = expression.get("left") {
                super::assignment_expression::mark_binding_mutation(left, context);
            }
            // Also recurse into the right-hand side
            if let Some(right) = expression.get("right") {
                mark_mutations_recursive(right, context);
            }
        }
        Some("TemplateLiteral") => {
            if let Some(expressions) = expression.get("expressions").and_then(|e| e.as_array()) {
                for expr in expressions {
                    mark_mutations_recursive(expr, context);
                }
            }
        }
        Some("BinaryExpression") | Some("LogicalExpression") => {
            if let Some(left) = expression.get("left") {
                mark_mutations_recursive(left, context);
            }
            if let Some(right) = expression.get("right") {
                mark_mutations_recursive(right, context);
            }
        }
        Some("ConditionalExpression") => {
            if let Some(test) = expression.get("test") {
                mark_mutations_recursive(test, context);
            }
            if let Some(consequent) = expression.get("consequent") {
                mark_mutations_recursive(consequent, context);
            }
            if let Some(alternate) = expression.get("alternate") {
                mark_mutations_recursive(alternate, context);
            }
        }
        Some("CallExpression") | Some("NewExpression") => {
            if let Some(callee) = expression.get("callee") {
                mark_mutations_recursive(callee, context);
            }
            if let Some(arguments) = expression.get("arguments").and_then(|a| a.as_array()) {
                for arg in arguments {
                    mark_mutations_recursive(arg, context);
                }
            }
        }
        Some("SequenceExpression") => {
            if let Some(expressions) = expression.get("expressions").and_then(|e| e.as_array()) {
                for expr in expressions {
                    mark_mutations_recursive(expr, context);
                }
            }
        }
        Some("MemberExpression") => {
            if let Some(object) = expression.get("object") {
                mark_mutations_recursive(object, context);
            }
            let computed = expression
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false);
            if computed && let Some(property) = expression.get("property") {
                mark_mutations_recursive(property, context);
            }
        }
        Some("UnaryExpression") => {
            if let Some(argument) = expression.get("argument") {
                mark_mutations_recursive(argument, context);
            }
        }
        _ => {}
    }
}

/// Alias for visit function.
pub fn visit_await_block(
    block: &mut AwaitBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(block, context)
}
