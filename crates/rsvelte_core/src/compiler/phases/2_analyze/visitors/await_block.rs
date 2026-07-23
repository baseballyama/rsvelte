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
use super::shared::utils::{
    validate_block_not_empty, validate_opening_tag, walk_js_expression, walk_js_expression_node,
};
use crate::ast::template::AwaitBlock;
use crate::ast::typed_expr::JsNode;
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
pub fn visit<'a, 'b: 'a>(
    block: &mut AwaitBlock<'b>,
    context: &mut VisitorContext<'a>,
) -> Result<(), AnalysisError> {
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
                let substr = crate::compiler::utils::char_boundary_lookback(
                    &context.analysis.source,
                    start,
                    10,
                );
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
                let substr = crate::compiler::utils::char_boundary_lookback(
                    &context.analysis.source,
                    start,
                    10,
                );
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
    if let Some(node_ref) = block.expression.try_as_node_ref() {
        walk_js_expression_node(node_ref, context, &mut block.metadata.expression)?;
        collect_pickled_awaits_node(
            node_ref,
            &mut context.analysis.pickled_awaits,
            context.parse_arena,
        );
    } else {
        let value = block.expression.as_json();
        walk_js_expression(value, context, &mut block.metadata.expression)?;
        collect_pickled_awaits(value, &mut context.analysis.pickled_awaits);
    }

    // Walk the value pattern's computed property key expressions to detect mutations.
    // For example: {#await promise then { [`prop${num++}`]: ... }}
    // The `num++` in the computed key needs to be detected as a reassignment.
    if let Some(ref value_pattern) = block.value {
        let mut dummy_metadata = crate::ast::template::ExpressionMetadata::default();
        if let Some(node_ref) = value_pattern.try_as_node_ref() {
            walk_pattern_computed_keys_node(node_ref, context, &mut dummy_metadata)?;
        } else {
            walk_pattern_computed_keys(value_pattern.as_json(), context, &mut dummy_metadata)?;
        }
    }

    // Also walk the error pattern's computed property key expressions
    if let Some(ref error_pattern) = block.error {
        let mut dummy_metadata = crate::ast::template::ExpressionMetadata::default();
        if let Some(node_ref) = error_pattern.try_as_node_ref() {
            walk_pattern_computed_keys_node(node_ref, context, &mut dummy_metadata)?;
        } else {
            walk_pattern_computed_keys(error_pattern.as_json(), context, &mut dummy_metadata)?;
        }
    }

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
        .push(super::FragmentOwnerType::AwaitBlock);

    // Analyze the pending block (shown while awaiting)
    // Pending block has its own scope (mirrors upstream: Fragment always creates child scope)
    if let Some(ref mut pending) = block.pending {
        let old_scope = context.scope;
        if let Some(&pending_scope) = context.analysis.root.template_scope_map.get(&block.start) {
            context.scope = pending_scope;
        }
        fragment::analyze(pending, context)?;
        context.scope = old_scope;
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
    context.is_direct_child_of_snippet = was_direct_snippet;

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

/// Walk a destructuring pattern and visit any computed property key expressions.
/// JsNode-based version of `walk_pattern_computed_keys`.
fn walk_pattern_computed_keys_node(
    pattern: &JsNode,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    match pattern {
        JsNode::ObjectPattern { properties, .. } => {
            for prop in arena.get_js_children(*properties) {
                match prop {
                    JsNode::RestElement { argument, .. } => {
                        walk_pattern_computed_keys_node(
                            arena.get_js_node(*argument),
                            context,
                            metadata,
                        )?;
                    }
                    JsNode::Property {
                        key,
                        value,
                        computed,
                        ..
                    } => {
                        if *computed {
                            walk_expression_for_mutations_node(
                                arena.get_js_node(*key),
                                context,
                                metadata,
                            )?;
                        }
                        walk_pattern_computed_keys_node(
                            arena.get_js_node(*value),
                            context,
                            metadata,
                        )?;
                    }
                    _ => {}
                }
            }
        }
        JsNode::ArrayPattern { elements, .. } => {
            for elem in elements.iter().flatten() {
                walk_pattern_computed_keys_node(elem, context, metadata)?;
            }
        }
        JsNode::AssignmentPattern { left, .. } => {
            walk_pattern_computed_keys_node(arena.get_js_node(*left), context, metadata)?;
        }
        _ => {}
    }
    Ok(())
}

/// Walk a JavaScript expression and detect mutations (UpdateExpression, AssignmentExpression).
/// JsNode-based version of `walk_expression_for_mutations`.
fn walk_expression_for_mutations_node(
    expression: &JsNode,
    context: &mut VisitorContext,
    metadata: &mut crate::ast::template::ExpressionMetadata,
) -> Result<(), AnalysisError> {
    // Walk for metadata (dependency tracking, state detection, etc.)
    walk_js_expression_node(expression, context, metadata)?;

    // Additionally, recursively walk all sub-expressions looking for mutations
    mark_mutations_recursive_node(expression, context);

    Ok(())
}

/// Recursively walk a JsNode expression tree to find and mark UpdateExpression and
/// AssignmentExpression nodes, calling mark_binding_mutation_node for each.
fn mark_mutations_recursive_node(expression: &JsNode, context: &mut VisitorContext) {
    let arena = context.parse_arena;
    match expression {
        JsNode::UpdateExpression { argument, .. } => {
            super::assignment_expression::mark_binding_mutation_node(
                arena.get_js_node(*argument),
                context,
            );
        }
        JsNode::AssignmentExpression { left, right, .. } => {
            super::assignment_expression::mark_binding_mutation_node(
                arena.get_js_node(*left),
                context,
            );
            mark_mutations_recursive_node(arena.get_js_node(*right), context);
        }
        JsNode::TemplateLiteral { expressions, .. } => {
            for expr in arena.get_js_children(*expressions) {
                mark_mutations_recursive_node(expr, context);
            }
        }
        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. } => {
            mark_mutations_recursive_node(arena.get_js_node(*left), context);
            mark_mutations_recursive_node(arena.get_js_node(*right), context);
        }
        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            mark_mutations_recursive_node(arena.get_js_node(*test), context);
            mark_mutations_recursive_node(arena.get_js_node(*consequent), context);
            mark_mutations_recursive_node(arena.get_js_node(*alternate), context);
        }
        JsNode::CallExpression {
            callee, arguments, ..
        }
        | JsNode::NewExpression {
            callee, arguments, ..
        } => {
            mark_mutations_recursive_node(arena.get_js_node(*callee), context);
            for arg in arena.get_js_children(*arguments) {
                mark_mutations_recursive_node(arg, context);
            }
        }
        JsNode::SequenceExpression { expressions, .. } => {
            for expr in arena.get_js_children(*expressions) {
                mark_mutations_recursive_node(expr, context);
            }
        }
        JsNode::MemberExpression {
            object,
            property,
            computed,
            ..
        } => {
            mark_mutations_recursive_node(arena.get_js_node(*object), context);
            if *computed {
                mark_mutations_recursive_node(arena.get_js_node(*property), context);
            }
        }
        JsNode::UnaryExpression { argument, .. } => {
            mark_mutations_recursive_node(arena.get_js_node(*argument), context);
        }
        _ => {}
    }
}

/// Collect pickled await positions from an expression tree.
///
/// An await expression is "pickled" when it's NOT the last evaluated expression
/// in the reactive context. This means there are more expressions to evaluate
/// after the await, and the reactive context needs to be preserved.
///
/// This is a post-processing pass that walks the expression tree and checks
/// each AwaitExpression's position relative to its parent.
pub fn collect_pickled_awaits(expr: &serde_json::Value, pickled: &mut rustc_hash::FxHashSet<u32>) {
    collect_pickled_awaits_inner(expr, pickled, true);
}

fn collect_pickled_awaits_inner(
    expr: &serde_json::Value,
    pickled: &mut rustc_hash::FxHashSet<u32>,
    is_last: bool,
) {
    let expr_type = expr.get("type").and_then(|t| t.as_str());

    match expr_type {
        Some("AwaitExpression") => {
            if !is_last && let Some(start) = expr.get("start").and_then(|s| s.as_u64()) {
                pickled.insert(start as u32);
            }
            // Also recurse into argument
            if let Some(argument) = expr.get("argument") {
                collect_pickled_awaits_inner(argument, pickled, true);
            }
        }
        Some("BinaryExpression") | Some("LogicalExpression") | Some("AssignmentExpression") => {
            // Left side is NOT last (right side evaluates after it)
            if let Some(left) = expr.get("left") {
                collect_pickled_awaits_inner(left, pickled, false);
            }
            // Right side inherits parent's is_last
            if let Some(right) = expr.get("right") {
                collect_pickled_awaits_inner(right, pickled, is_last);
            }
        }
        Some("CallExpression") | Some("NewExpression") => {
            // Callee is not last if there are arguments
            if let Some(callee) = expr.get("callee") {
                let has_args = expr
                    .get("arguments")
                    .and_then(|a| a.as_array())
                    .map(|a| !a.is_empty())
                    .unwrap_or(false);
                collect_pickled_awaits_inner(
                    callee,
                    pickled,
                    if has_args { false } else { is_last },
                );
            }
            if let Some(serde_json::Value::Array(args)) = expr.get("arguments") {
                for (i, arg) in args.iter().enumerate() {
                    let arg_is_last = i == args.len() - 1 && is_last;
                    collect_pickled_awaits_inner(arg, pickled, arg_is_last);
                }
            }
        }
        Some("ConditionalExpression") => {
            if let Some(test) = expr.get("test") {
                collect_pickled_awaits_inner(test, pickled, false);
            }
            if let Some(consequent) = expr.get("consequent") {
                collect_pickled_awaits_inner(consequent, pickled, is_last);
            }
            if let Some(alternate) = expr.get("alternate") {
                collect_pickled_awaits_inner(alternate, pickled, is_last);
            }
        }
        Some("SequenceExpression") => {
            if let Some(serde_json::Value::Array(exprs)) = expr.get("expressions") {
                for (i, e) in exprs.iter().enumerate() {
                    let e_is_last = i == exprs.len() - 1 && is_last;
                    collect_pickled_awaits_inner(e, pickled, e_is_last);
                }
            }
        }
        Some("ArrayExpression") => {
            if let Some(serde_json::Value::Array(elements)) = expr.get("elements") {
                for (i, e) in elements.iter().enumerate() {
                    let e_is_last = i == elements.len() - 1 && is_last;
                    collect_pickled_awaits_inner(e, pickled, e_is_last);
                }
            }
        }
        Some("MemberExpression") => {
            if let Some(object) = expr.get("object") {
                let computed = expr
                    .get("computed")
                    .and_then(|c| c.as_bool())
                    .unwrap_or(false);
                collect_pickled_awaits_inner(
                    object,
                    pickled,
                    if computed { false } else { is_last },
                );
            }
            if let Some(property) = expr.get("property") {
                let computed = expr
                    .get("computed")
                    .and_then(|c| c.as_bool())
                    .unwrap_or(false);
                if computed {
                    collect_pickled_awaits_inner(property, pickled, is_last);
                }
            }
        }
        Some("TemplateLiteral") => {
            if let Some(serde_json::Value::Array(exprs)) = expr.get("expressions") {
                for (i, e) in exprs.iter().enumerate() {
                    let e_is_last = i == exprs.len() - 1 && is_last;
                    collect_pickled_awaits_inner(e, pickled, e_is_last);
                }
            }
        }
        Some("ObjectExpression") => {
            if let Some(serde_json::Value::Array(props)) = expr.get("properties") {
                for (i, p) in props.iter().enumerate() {
                    let p_is_last = i == props.len() - 1 && is_last;
                    if let Some(value) = p.get("value") {
                        collect_pickled_awaits_inner(value, pickled, p_is_last);
                    }
                }
            }
        }
        Some("UnaryExpression") => {
            if let Some(argument) = expr.get("argument") {
                collect_pickled_awaits_inner(argument, pickled, is_last);
            }
        }
        Some("ArrowFunctionExpression") | Some("FunctionExpression") => {
            // Don't cross function boundaries
        }
        _ => {
            // For other nodes, recursively walk children
            // This handles ExpressionStatement, VariableDeclarator, etc.
        }
    }
}

/// Collect pickled await positions from a JsNode expression tree.
///
/// An await expression is "pickled" when it's NOT the last evaluated expression
/// in the reactive context. This is a JsNode-based version of `collect_pickled_awaits`.
pub fn collect_pickled_awaits_node(
    expr: &JsNode,
    pickled: &mut rustc_hash::FxHashSet<u32>,
    arena: &crate::ast::arena::ParseArena,
) {
    collect_pickled_awaits_inner_node(expr, pickled, true, arena);
}

fn collect_pickled_awaits_inner_node(
    expr: &JsNode,
    pickled: &mut rustc_hash::FxHashSet<u32>,
    is_last: bool,
    arena: &crate::ast::arena::ParseArena,
) {
    match expr {
        JsNode::AwaitExpression {
            start, argument, ..
        } => {
            if !is_last {
                pickled.insert(*start);
            }
            // Also recurse into argument
            collect_pickled_awaits_inner_node(arena.get_js_node(*argument), pickled, true, arena);
        }
        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. }
        | JsNode::AssignmentExpression { left, right, .. } => {
            // Left side is NOT last (right side evaluates after it)
            collect_pickled_awaits_inner_node(arena.get_js_node(*left), pickled, false, arena);
            // Right side inherits parent's is_last
            collect_pickled_awaits_inner_node(arena.get_js_node(*right), pickled, is_last, arena);
        }
        JsNode::CallExpression {
            callee, arguments, ..
        }
        | JsNode::NewExpression {
            callee, arguments, ..
        } => {
            // Callee is not last if there are arguments
            let args = arena.get_js_children(*arguments);
            let has_args = !args.is_empty();
            collect_pickled_awaits_inner_node(
                arena.get_js_node(*callee),
                pickled,
                if has_args { false } else { is_last },
                arena,
            );
            for (i, arg) in args.iter().enumerate() {
                let arg_is_last = i == args.len() - 1 && is_last;
                collect_pickled_awaits_inner_node(arg, pickled, arg_is_last, arena);
            }
        }
        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            collect_pickled_awaits_inner_node(arena.get_js_node(*test), pickled, false, arena);
            collect_pickled_awaits_inner_node(
                arena.get_js_node(*consequent),
                pickled,
                is_last,
                arena,
            );
            collect_pickled_awaits_inner_node(
                arena.get_js_node(*alternate),
                pickled,
                is_last,
                arena,
            );
        }
        JsNode::SequenceExpression { expressions, .. } => {
            let exprs = arena.get_js_children(*expressions);
            for (i, e) in exprs.iter().enumerate() {
                let e_is_last = i == exprs.len() - 1 && is_last;
                collect_pickled_awaits_inner_node(e, pickled, e_is_last, arena);
            }
        }
        JsNode::ArrayExpression { elements, .. } => {
            for (i, e) in elements.iter().enumerate() {
                let e_is_last = i == elements.len() - 1 && is_last;
                if let Some(elem) = e {
                    collect_pickled_awaits_inner_node(elem, pickled, e_is_last, arena);
                }
            }
        }
        JsNode::MemberExpression {
            object,
            property,
            computed,
            ..
        } => {
            collect_pickled_awaits_inner_node(
                arena.get_js_node(*object),
                pickled,
                if *computed { false } else { is_last },
                arena,
            );
            if *computed {
                collect_pickled_awaits_inner_node(
                    arena.get_js_node(*property),
                    pickled,
                    is_last,
                    arena,
                );
            }
        }
        JsNode::TemplateLiteral { expressions, .. } => {
            let exprs = arena.get_js_children(*expressions);
            for (i, e) in exprs.iter().enumerate() {
                let e_is_last = i == exprs.len() - 1 && is_last;
                collect_pickled_awaits_inner_node(e, pickled, e_is_last, arena);
            }
        }
        JsNode::ObjectExpression { properties, .. } => {
            let props = arena.get_js_children(*properties);
            for (i, p) in props.iter().enumerate() {
                let p_is_last = i == props.len() - 1 && is_last;
                if let JsNode::Property { value, .. } = p {
                    collect_pickled_awaits_inner_node(
                        arena.get_js_node(*value),
                        pickled,
                        p_is_last,
                        arena,
                    );
                }
            }
        }
        JsNode::UnaryExpression { argument, .. } => {
            collect_pickled_awaits_inner_node(
                arena.get_js_node(*argument),
                pickled,
                is_last,
                arena,
            );
        }
        JsNode::ArrowFunctionExpression { .. }
        | JsNode::FunctionExpression { .. }
        | JsNode::FunctionDeclaration { .. } => {
            // Don't cross function boundaries
        }
        _ => {
            // For other nodes, no further recursion needed
        }
    }
}
