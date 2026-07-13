//! Function analysis utilities.
//!
//! Functions for analyzing JavaScript functions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/function.js`.

use super::super::VisitorContext;
use crate::ast::arena::IdRange;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit expressions evaluated while binding function parameters without treating
/// the parameter declarations themselves as references.
pub fn visit_parameter_defaults(
    params: IdRange,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    for param in context.parse_arena.get_js_children(params) {
        visit_parameter_pattern(param, context)?;
    }
    Ok(())
}

fn visit_parameter_pattern(
    node: &JsNode,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    match node {
        JsNode::AssignmentPattern { left, right, .. } => {
            visit_parameter_pattern(arena.get_js_node(*left), context)?;
            super::super::script::walk_js_node_typed(arena.get_js_node(*right), context)
        }
        JsNode::ObjectPattern { properties, .. } => {
            for property in arena.get_js_children(*properties) {
                visit_parameter_pattern(property, context)?;
            }
            Ok(())
        }
        JsNode::ArrayPattern { elements, .. } => {
            for element in elements.iter().flatten() {
                visit_parameter_pattern(element, context)?;
            }
            Ok(())
        }
        JsNode::Property {
            key,
            value,
            computed,
            ..
        } => {
            if *computed {
                super::super::script::walk_js_node_typed(arena.get_js_node(*key), context)?;
            }
            visit_parameter_pattern(arena.get_js_node(*value), context)
        }
        JsNode::RestElement { argument, .. } => {
            visit_parameter_pattern(arena.get_js_node(*argument), context)
        }
        _ => Ok(()),
    }
}

/// Visit a function node (ArrowFunctionExpression, FunctionExpression, or FunctionDeclaration).
///
/// Corresponds to `visit_function` in function.js.
///
/// This function handles the analysis of function scopes and captures references
/// to variables from outer scopes. When inside an expression context, it tracks
/// which bindings from parent scopes are referenced within the function.
///
/// # Arguments
///
/// * `context` - The visitor context
/// * `visit_children` - A callback to visit the function's children with updated context
pub fn visit_function<F>(context: &mut VisitorContext, mut visit_children: F)
where
    F: FnMut(&mut VisitorContext),
{
    // TODO: Implement expression tracking
    // if (context.state.expression) {
    //     for (const [name] of context.state.scope.references) {
    //         const binding = context.state.scope.get(name);
    //
    //         if (binding && binding.scope.function_depth < context.state.scope.function_depth) {
    //             context.state.expression.references.add(binding);
    //         }
    //     }
    // }

    // Increment function depth for the child context
    let original_depth = context.function_depth;
    context.function_depth += 1;

    // Visit children with updated context
    // In JavaScript this is done with context.next({ ...context.state, function_depth: +1, expression: null })
    visit_children(context);

    // Restore function depth
    context.function_depth = original_depth;
}

/// Check if an identifier is a rune.
/// Uses first-byte dispatch after '$' for fast rejection.
#[inline]
pub fn is_rune(name: &str) -> bool {
    let bytes = name.as_bytes();
    if bytes.first() != Some(&b'$') || bytes.len() < 5 {
        return false;
    }
    // Dispatch on second byte for fast rejection
    match bytes[1] {
        b's' => matches!(
            name,
            "$state" | "$state.raw" | "$state.eager" | "$state.snapshot"
        ),
        b'd' => matches!(name, "$derived" | "$derived.by"),
        b'p' => matches!(name, "$props" | "$props.id"),
        b'b' => name == "$bindable",
        b'e' => matches!(
            name,
            "$effect" | "$effect.pre" | "$effect.tracking" | "$effect.root" | "$effect.pending"
        ),
        b'i' => matches!(name, "$inspect" | "$inspect().with" | "$inspect.trace"),
        b'h' => name == "$host",
        _ => false,
    }
}
