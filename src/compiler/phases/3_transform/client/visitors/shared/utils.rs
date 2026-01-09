//! Utility functions for component transformation.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/utils.js`.

use crate::ast::template::TemplateNode;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use std::collections::HashMap;

/// Build an expression with legacy reactivity handling.
///
/// Corresponds to `build_expression` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/utils.js`.
///
/// # Arguments
///
/// * `context` - The component context
/// * `expression` - The JS expression to build
/// * `metadata` - Expression metadata (dependencies, state references, etc.)
///
/// # Returns
///
/// Returns a transformed expression with reactivity tracking if needed.
pub fn build_expression(
    context: &mut ComponentContext,
    expression: &JsExpr,
    metadata: &ExpressionMetadata,
) -> JsExpr {
    // In runes mode, expressions are already reactive
    if context.state.analysis.runes || context.state.analysis.maybe_runes {
        return expression.clone();
    }

    // Legacy mode: wrap in reactivity tracking if the expression references state
    if metadata.has_state {
        // TODO: Implement legacy reactivity wrapping
        // For now, return the expression as-is
        return expression.clone();
    }

    expression.clone()
}

/// Build bind:this directive.
///
/// Corresponds to `build_bind_this` in utils.js.
///
/// # Arguments
///
/// * `expression` - The bind expression (getter/setter pair or simple identifier)
/// * `value` - The value to bind (usually an element reference)
/// * `context` - The component context
///
/// # Returns
///
/// Returns a call to `$.bind_this()` with appropriate getter/setter.
pub fn build_bind_this(
    expression: BindExpression,
    value: JsExpr,
    _context: &mut ComponentContext,
) -> JsExpr {
    match expression {
        BindExpression::Simple(expr) => {
            // Simple identifier: just pass it as both getter and setter
            // $.bind_this(value, () => expr, (v) => { expr = v })
            let getter = b::arrow(vec![], expr.clone());
            let setter = b::arrow_block(
                vec![b::id_pattern("$$value")],
                vec![b::stmt(b::assign(expr, b::id("$$value")))],
            );

            b::call(b::member_path("$.bind_this"), vec![value, getter, setter])
        }

        BindExpression::Sequence(getter_expr, setter_expr) => {
            // Already have getter/setter pair
            b::call(
                b::member_path("$.bind_this"),
                vec![value, getter_expr, setter_expr],
            )
        }
    }
}

/// Validate a binding in dev mode.
///
/// In development mode, this adds validation to ensure bindings
/// are used correctly.
pub fn validate_binding(
    _state: &mut ComponentClientTransformState,
    _binding: &BindDirective,
    _expression: &JsMemberExpression,
) {
    // TODO: Implement dev mode validation
    // This would check:
    // - Binding is to a valid target
    // - Target is not read-only
    // - etc.
}

/// Add Svelte metadata for dev mode.
///
/// Wraps an expression with metadata about its source location
/// for better debugging in development mode.
pub fn add_svelte_meta(
    expression: JsExpr,
    _node: &TemplateNode,
    _block_type: &str,
    _additional: Option<HashMap<String, String>>,
) -> JsStatement {
    // TODO: Check if in dev mode
    // TODO: Get location from node
    // TODO: Wrap in $.add_svelte_meta call

    // For now, just return the expression as a statement
    b::stmt(expression)
}

/// Build a template effect.
///
/// Template effects run when their dependencies change and update the DOM.
///
/// # Arguments
///
/// * `statements` - The statements to run in the effect
/// * `dependencies` - Optional list of dependencies
///
/// # Returns
///
/// Returns a call to `$.template_effect()` or `$.template_effect_with_values()`.
pub fn build_template_effect(
    statements: Vec<JsStatement>,
    dependencies: Option<Vec<JsExpr>>,
) -> JsStatement {
    let effect_fn = b::arrow_block(vec![], statements);

    if let Some(deps) = dependencies {
        // $.template_effect_with_values(() => { ... }, [deps])
        b::stmt(b::call(
            b::member_path("$.template_effect_with_values"),
            vec![effect_fn, b::array(deps)],
        ))
    } else {
        // $.template_effect(() => { ... })
        b::stmt(b::call(
            b::member_path("$.template_effect"),
            vec![effect_fn],
        ))
    }
}

/// Build a render statement.
///
/// Wraps statements in a render function for conditional or repeated rendering.
pub fn build_render_statement(statements: Vec<JsStatement>) -> JsExpr {
    b::arrow_block(vec![], statements)
}

/// Bind expression types.
#[derive(Debug, Clone)]
pub enum BindExpression {
    /// Simple identifier binding (e.g., bind:this={myRef})
    Simple(JsExpr),

    /// Getter/setter pair (e.g., for complex member expressions)
    Sequence(JsExpr, JsExpr),
}

/// Bind directive metadata.
///
/// Placeholder for bind directive information.
/// TODO: Replace with actual BindDirective from AST when available.
#[derive(Debug, Clone)]
pub struct BindDirective {
    /// The name of the property being bound
    pub name: String,

    /// The expression being bound to
    pub expression: JsExpr,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_template_effect_simple() {
        let statements = vec![b::stmt(b::call(
            b::id("console.log"),
            vec![b::string("test")],
        ))];

        let effect = build_template_effect(statements, None);

        // Should generate $.template_effect(() => { ... })
        match effect {
            JsStatement::Expression(expr) => {
                let JsExpressionStatement { expression } = expr;
                match *expression {
                    JsExpr::Call(_) => {
                        // Success - generated a call expression
                    }
                    _ => panic!("Expected call expression"),
                }
            }
            _ => panic!("Expected expression statement"),
        }
    }

    #[test]
    fn test_build_template_effect_with_deps() {
        let statements = vec![b::stmt(b::call(b::id("console.log"), vec![b::id("count")]))];

        let deps = vec![b::id("count")];

        let effect = build_template_effect(statements, Some(deps));

        // Should generate $.template_effect_with_values(() => { ... }, [count])
        match effect {
            JsStatement::Expression(expr) => {
                let JsExpressionStatement { expression } = expr;
                match *expression {
                    JsExpr::Call(_) => {
                        // Success - generated a call expression
                    }
                    _ => panic!("Expected call expression"),
                }
            }
            _ => panic!("Expected expression statement"),
        }
    }
}
