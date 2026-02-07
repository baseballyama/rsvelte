//! AwaitExpression visitor.
//!
//! Analyzes await expressions in JavaScript code.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AwaitExpression.js`.

use super::VisitorContext;
use crate::ast::template::TemplateNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit an await expression.
///
/// Corresponds to the `AwaitExpression` function in AwaitExpression.js.
///
/// This function validates that await expressions are used correctly:
/// - Top-level await (TLA) requires `experimental.async` and runes mode
/// - Await in template expressions requires `experimental.async` and runes mode
/// - Tracks await expressions that precede other expressions for reactivity preservation
///
/// # Arguments
///
/// * `node` - The await expression node (from serde_json::Value)
/// * `context` - The visitor context
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Determine if this is top-level await (TLA)
    // TLA is when we're in the instance script at function depth 1
    let tla = context.function_depth == 1;

    // Check if this await is in a reactive expression
    // Note: In full implementation, we would check:
    // - if in $derived() and at same function depth
    // - if in template expression (via expression metadata)
    // For now, we'll make a simplified check
    let in_reactive = false; // TODO: Implement full reactive expression detection

    // Preserve context for awaits that precede other expressions in template or $derived(...)
    if in_reactive && !is_last_evaluated_expression(&context.path, node) {
        // TODO: Add to pickled_awaits set
        // context.analysis.pickled_awaits.insert(node);
    }

    // Determine if this await requires suspension
    let suspend = tla;

    // TODO: Check if we're in a template expression (via context.state.expression)
    // if context.state.expression {
    //     context.state.expression.has_await = true;
    //     suspend = true;
    // }

    // Disallow top-level `await` or `await` in template expressions
    // unless a) in runes mode and b) opted into `experimental.async`
    if suspend {
        // Check for experimental.async option
        // TODO: Access compile options to check experimental.async
        // For now, we'll skip this check
        // if !context.state.options.experimental.async {
        //     return Err(AnalysisError::ValidationWithCode {
        //         code: "experimental_async".to_string(),
        //         message: "Top-level await is experimental and requires the 'experimental.async' option".to_string(),
        //     });
        // }

        // Check for runes mode
        if !context.analysis.runes {
            return Err(AnalysisError::ValidationWithCode {
                code: "legacy_await_invalid".to_string(),
                message: "Top-level await is only allowed in Svelte 5 with runes mode".to_string(),
            });
        }
    }

    // Visit the argument expression (context.next() in JS version)
    // This is important for walking into the awaited expression to find
    // calls like tick() that may set needs_context
    if let Some(argument) = node.get("argument") {
        super::script::walk_js_node(argument, context)?;
    }

    Ok(())
}

/// Check if an expression is reactive (inside template or $derived).
///
/// Corresponds to `is_reactive_expression` in AwaitExpression.js.
///
/// # Arguments
///
/// * `path` - The path from root to current node
/// * `in_derived` - Whether we're inside a $derived function
#[allow(dead_code)]
fn is_reactive_expression(path: &[&TemplateNode], in_derived: bool) -> bool {
    if in_derived {
        return true;
    }

    // Walk up the path to find a reactive context
    for node in path.iter().rev() {
        // Check if we hit a function boundary (which would mean no reactive context)
        // In the JS version, they check for ArrowFunctionExpression, FunctionExpression, FunctionDeclaration
        // Since our TemplateNode doesn't include JS expressions, we can't fully implement this
        // TODO: Implement when we have proper JS expression tracking

        // Check if the parent has metadata (indicating reactive context)
        // In the JS version: if (parent.metadata) return true;
        // We don't have metadata on TemplateNode yet
        // For now, assume any template node means reactive context
        match node {
            TemplateNode::ExpressionTag(_)
            | TemplateNode::HtmlTag(_)
            | TemplateNode::ConstTag(_) => return true,
            _ => {}
        }
    }

    false
}

/// Check if an expression is the last evaluated expression in its context.
///
/// Corresponds to `is_last_evaluated_expression` in AwaitExpression.js.
///
/// This determines if an await expression's result is immediately used,
/// in which case we don't need to preserve reactivity tracking.
///
/// # Arguments
///
/// * `path` - The path from root to current node
/// * `node` - The current expression node
#[allow(dead_code)]
fn is_last_evaluated_expression(path: &[&TemplateNode], _node: &Value) -> bool {
    // Walk up the path to find if this is the last evaluated expression
    for template_node in path.iter().rev() {
        // Check for ConstTag - its contents should all get preserve-reactivity treatment
        if matches!(template_node, TemplateNode::ConstTag(_)) {
            return false;
        }

        // Check if we found a node with metadata (reactive context)
        // If so, this is the last expression in that context
        match template_node {
            TemplateNode::ExpressionTag(_) | TemplateNode::HtmlTag(_) => return true,
            _ => {}
        }

        // In the full implementation, we would check the expression tree structure
        // to determine if this await is in the last position. For example:
        // - In ArrayExpression, check if it's the last element
        // - In BinaryExpression, check if it's the right operand
        // - In CallExpression, check if it's the last argument
        // Since we don't have access to the full JS AST here, we'll return false
    }

    false
}
