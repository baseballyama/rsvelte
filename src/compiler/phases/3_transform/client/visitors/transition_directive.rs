//! Transition directive visitor for client-side transformation.
//!
//! Corresponds to `TransitionDirective` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/TransitionDirective.js`.

use crate::ast::template::TransitionDirective;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::{
    apply_transforms_to_expression, parse_directive_name,
};
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;

/// Transition flag constants.
/// Corresponds to constants in `svelte/packages/svelte/src/internal/client/constants.js`.
pub const TRANSITION_IN: u32 = 1;
pub const TRANSITION_OUT: u32 = 1 << 1; // 2
pub const TRANSITION_GLOBAL: u32 = 1 << 2; // 4

/// Visit a transition directive.
///
/// Generates code to apply transitions to elements using the `$.transition` runtime function.
/// The transition is registered in the `after_update` hook to ensure it runs after `bind:this`.
///
/// # Arguments
///
/// * `node` - The transition directive node
/// * `context` - The component transformation context
///
/// # Behavior
///
/// - Calculates flags based on modifiers (global) and direction (intro/outro)
/// - Wraps the transition name in a thunk
/// - If expression is provided, wraps it in a thunk as well
/// - Adds the transition call to the `after_update` array
/// - If the expression is async (has blockers), wrap in `$.run_after_blockers`
///
/// # Implementation
///
/// The JavaScript implementation:
/// ```javascript
/// export function TransitionDirective(node, context) {
///     let flags = node.modifiers.includes('global') ? TRANSITION_GLOBAL : 0;
///     if (node.intro) flags |= TRANSITION_IN;
///     if (node.outro) flags |= TRANSITION_OUT;
///
///     const args = [
///         b.literal(flags),
///         context.state.node,
///         b.thunk(context.visit(parse_directive_name(node.name)))
///     ];
///
///     if (node.expression) {
///         args.push(b.thunk(context.visit(node.expression)));
///     }
///
///     // in after_update to ensure it always happens after bind:this
///     let statement = b.stmt(b.call('$.transition', ...args));
///
///     if (node.metadata.expression.is_async()) {
///         statement = b.stmt(
///             b.call(
///                 '$.run_after_blockers',
///                 node.metadata.expression.blockers(),
///                 b.thunk(b.block([statement]))
///             )
///         );
///     }
///
///     context.state.after_update.push(statement);
/// }
/// ```
pub fn transition_directive(node: &TransitionDirective, context: &mut ComponentContext) {
    // Calculate flags based on modifiers and direction
    let mut flags: u32 = 0;

    // Check for 'global' modifier
    if node.modifiers.iter().any(|m| m.as_str() == "global") {
        flags |= TRANSITION_GLOBAL;
    }

    // Add intro/outro flags
    if node.intro {
        flags |= TRANSITION_IN;
    }
    if node.outro {
        flags |= TRANSITION_OUT;
    }

    // Parse the directive name (e.g., "fade" or "custom.transition")
    let name_expr = parse_directive_name(&node.name);

    // Build arguments: [flags, node, () => name, (() => expression)?]
    let mut args = vec![
        b::number(flags as f64),
        context.state.node.clone(),
        b::thunk(name_expr),
    ];

    // If expression is provided, add it as a thunk
    // We apply transforms first so that prop getters like `foo` become `foo()`,
    // which allows the unthunk optimization to simplify `() => foo()` to `foo`.
    if let Some(ref expr) = node.expression {
        let visited_expr = convert_expression(expr, context);
        let transformed_expr = apply_transforms_to_expression(&visited_expr, context);
        args.push(b::thunk(transformed_expr));
    }

    // Build the transition call: $.transition(flags, node, () => name, (() => expr)?)
    let mut statement = b::stmt(b::call(b::member_path("$.transition"), args));

    // Check if the expression is async and wrap in $.run_after_blockers if needed
    if let Some(ref metadata) = node.metadata
        && metadata.expression.is_async()
    {
        // Convert blockers to JsExpr array
        let blockers_array = convert_blockers(&metadata.expression.blockers, context);

        statement = b::stmt(b::call(
            b::member_path("$.run_after_blockers"),
            vec![blockers_array, b::arrow_block(vec![], vec![statement])],
        ));
    }

    // Add to after_update to ensure it runs after bind:this
    context.state.after_update.push(statement);
}

/// Convert Expression blockers to a JS array expression.
///
/// This helper converts the blocking dependencies from the directive metadata
/// into a JS array that can be passed to $.run_after_blockers.
///
/// Each blocker expression is converted from the parser's Expression type
/// to the transform phase's JsExpr type using the expression converter.
fn convert_blockers(
    blockers: &[crate::ast::js::Expression],
    context: &mut ComponentContext,
) -> JsExpr {
    let blocker_exprs: Vec<_> = blockers
        .iter()
        .map(|blocker| convert_expression(blocker, context))
        .collect();

    b::array(blocker_exprs)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transition_flags() {
        // Test flag constants
        assert_eq!(TRANSITION_IN, 1);
        assert_eq!(TRANSITION_OUT, 2);
        assert_eq!(TRANSITION_GLOBAL, 4);

        // Test combined flags
        let mut flags = 0u32;
        flags |= TRANSITION_IN;
        flags |= TRANSITION_OUT;
        assert_eq!(flags, 3);

        flags |= TRANSITION_GLOBAL;
        assert_eq!(flags, 7);
    }
}
