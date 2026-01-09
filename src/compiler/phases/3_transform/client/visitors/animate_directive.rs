//! Animate directive visitor for client-side transformation.
//!
//! Corresponds to `AnimateDirective` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/AnimateDirective.js`.

use crate::ast::template::AnimateDirective;
use crate::compiler::phases::phase3_transform::client::types::*;

/// Visit an animate directive.
///
/// Generates code to apply animations to elements using the `$.animation` runtime function.
/// The animation is registered in the `after_update` hook to ensure it runs after `bind:this`.
///
/// # Arguments
///
/// * `node` - The animate directive node
/// * `context` - The component transformation context
///
/// # Behavior
///
/// - If the directive has no expression, uses `null` as the animation parameter
/// - Otherwise, wraps the expression in a thunk
/// - Adds the animation call to the `after_update` array
/// - TODO: If the expression is async (has blockers), wrap in `$.run_after_blockers`
pub fn animate_directive(_node: &AnimateDirective, _context: &mut ComponentContext) {
    // TODO: Implement full animate directive transformation
    //
    // Steps:
    // 1. Visit the expression if present, or use null
    // 2. Parse the directive name (e.g., "fade" or "custom.animation")
    // 3. Build the animation call: $.animation(node, () => name, expression)
    // 4. Check if the expression is async and wrap in $.run_after_blockers if needed
    // 5. Add to after_update to ensure it runs after bind:this
    //
    // For now, this is a stub implementation.

    /*
    // Build the expression: either null or a thunk containing the visited expression
    let expression = if let Some(expr) = &node.expression {
        // TODO: Visit the expression properly
        // For now, use null as placeholder
        b::null()
    } else {
        b::null()
    };

    // Parse the directive name (e.g., "fade" or "custom.animation")
    let name_expr = parse_directive_name(&node.name);

    // Build the animation call: $.animation(node, () => name, expression)
    let statement = b::stmt(b::call(
        b::member_path("$.animation"),
        vec![
            context.state.node.clone(),
            b::thunk(name_expr),
            expression,
        ],
    ));

    // TODO: Check for async blockers and wrap if needed

    // Add to after_update to ensure it runs after bind:this
    context.state.after_update.push(statement);
    */
}
