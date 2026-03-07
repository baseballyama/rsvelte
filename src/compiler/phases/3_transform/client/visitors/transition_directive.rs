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
    // Apply transforms (equivalent to context.visit() in JS) to handle
    // state/derived variable wrapping, e.g., $.get(derived)
    let name_expr = parse_directive_name(&node.name);
    let visited_name = apply_transforms_to_expression(&name_expr, context);

    // Build arguments: [flags, node, () => name, (() => expression)?]
    let mut args = vec![
        b::number(flags as f64),
        context.state.node.clone(),
        b::thunk(visited_name.clone()),
    ];

    // If expression is provided, add it as a thunk
    // We apply transforms first so that prop getters like `foo` become `foo()`,
    // which allows the unthunk optimization to simplify `() => foo()` to `foo`.
    let expr_for_blockers;
    if let Some(ref expr) = node.expression {
        let visited_expr = convert_expression(expr, context);
        let transformed_expr = apply_transforms_to_expression(&visited_expr, context);
        expr_for_blockers = Some(transformed_expr.clone());
        args.push(b::thunk(transformed_expr));
    } else {
        expr_for_blockers = None;
    }

    // Build the transition call: $.transition(flags, node, () => name, (() => expr)?)
    let mut statement = b::stmt(b::call(b::member_path("$.transition"), args));

    // Check if any referenced variables are blocked by async promises.
    // We check both the directive name and expression for blocker references.
    let mut blocker_check_exprs: Vec<&JsExpr> = vec![&visited_name];
    if let Some(ref expr) = expr_for_blockers {
        blocker_check_exprs.push(expr);
    }
    let blocker_exprs = get_blockers_for_exprs(&blocker_check_exprs, context);

    if !blocker_exprs.is_empty() {
        let blockers_array = b::array(blocker_exprs);
        statement = b::stmt(b::call(
            b::member_path("$.run_after_blockers"),
            vec![blockers_array, b::arrow_block(vec![], vec![statement])],
        ));
    }

    // Add to after_update to ensure it runs after bind:this
    context.state.after_update.push(statement);
}

/// Collect blocker expressions for a set of JS expressions by checking
/// all referenced identifiers against the blocker_map.
///
/// This collects identifiers from all provided expressions and calls
/// `get_blockers_for_names` once, which handles deduplication.
pub fn get_blockers_for_exprs(exprs: &[&JsExpr], context: &ComponentContext) -> Vec<JsExpr> {
    // Collect all identifiers from all expressions
    let mut all_names: Vec<compact_str::CompactString> = Vec::new();
    for expr in exprs {
        let names = collect_expr_identifiers(expr);
        for name in names {
            if !all_names.contains(&name) {
                all_names.push(name);
            }
        }
    }
    let name_refs: Vec<&str> = all_names.iter().map(|s| s.as_str()).collect();
    context.state.get_blockers_for_names(&name_refs)
}

/// Collect all identifier names from a JsExpr without crossing function boundaries.
/// This is used to find which variables a directive references for blocker checking.
fn collect_expr_identifiers(expr: &JsExpr) -> Vec<compact_str::CompactString> {
    let mut names = Vec::new();
    collect_expr_identifiers_recursive(expr, &mut names);
    names
}

fn collect_expr_identifiers_recursive(expr: &JsExpr, names: &mut Vec<compact_str::CompactString>) {
    use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
    match expr {
        JsExpr::Identifier(name) => {
            if !names.contains(name) {
                names.push(name.clone());
            }
        }
        JsExpr::Call(call) => {
            collect_expr_identifiers_recursive(&call.callee, names);
            for arg in &call.arguments {
                collect_expr_identifiers_recursive(arg, names);
            }
        }
        JsExpr::Member(member) => {
            collect_expr_identifiers_recursive(&member.object, names);
            if member.computed
                && let JsMemberProperty::Expression(prop_expr) = &member.property
            {
                collect_expr_identifiers_recursive(prop_expr, names);
            }
        }
        JsExpr::Binary(bin) => {
            collect_expr_identifiers_recursive(&bin.left, names);
            collect_expr_identifiers_recursive(&bin.right, names);
        }
        JsExpr::Logical(log) => {
            collect_expr_identifiers_recursive(&log.left, names);
            collect_expr_identifiers_recursive(&log.right, names);
        }
        JsExpr::Unary(un) => {
            collect_expr_identifiers_recursive(&un.argument, names);
        }
        JsExpr::Conditional(cond) => {
            collect_expr_identifiers_recursive(&cond.test, names);
            collect_expr_identifiers_recursive(&cond.consequent, names);
            collect_expr_identifiers_recursive(&cond.alternate, names);
        }
        JsExpr::Sequence(seq) => {
            for e in &seq.expressions {
                collect_expr_identifiers_recursive(e, names);
            }
        }
        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_expr_identifiers_recursive(e, names);
            }
        }
        JsExpr::Assignment(assign) => {
            collect_expr_identifiers_recursive(&assign.right, names);
        }
        JsExpr::Spread(inner) => {
            collect_expr_identifiers_recursive(inner, names);
        }
        // Don't cross function boundaries
        JsExpr::Arrow(_) | JsExpr::Function(_) => {}
        // Literals and other nodes don't contain identifier references we care about
        _ => {}
    }
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
