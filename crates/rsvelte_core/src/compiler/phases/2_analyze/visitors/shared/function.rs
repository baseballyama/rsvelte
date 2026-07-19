//! Function analysis utilities.
//!
//! Functions for analyzing JavaScript functions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/function.js`.

use super::super::VisitorContext;
use crate::ast::arena::IdRange;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit function parameters — both the binding patterns (`{a, b}`, `[c]`, `...d`)
/// and any default-value expressions (`x = expr`) — through the same generic typed
/// walker used for everything else.
///
/// Corresponds to the official compiler's `context.next()` in `FunctionDeclaration.js` /
/// `FunctionExpression.js` / `ArrowFunctionExpression.js` (via `shared/function.js`'s
/// `visit_function`), which — unlike our hand-written visitors — automatically visits
/// every child of the function node, including `params`. `walk_js_node_typed` already
/// has generic recursion for `AssignmentPattern`, `ObjectPattern`, `ArrayPattern`,
/// `Property`, and `RestElement` (see `script.rs`), and `Identifier`'s `is_reference`
/// check (mirroring the `is-reference` npm package upstream uses) already returns
/// `true` — i.e. "this is a reference" — for a parameter's own declaration identifier
/// (its immediate parent is `FunctionDeclaration`/`FunctionExpression`/
/// `ArrowFunctionExpression`/`AssignmentPattern`/`ObjectPattern`/`ArrayPattern`, none of
/// which `is_reference_for_identifier_typed` special-cases as "not a reference"). So a
/// plain walk here — with no bespoke pattern traversal — reproduces upstream's behavior
/// of recording a self-reference for every parameter binding (the same self-reference
/// `VariableDeclarator` bindings already get via `variable_declarator.rs`'s direct
/// `walk_js_node_typed(id_node, ...)` calls), which existing checks such as
/// `export_let_unused`'s "more than 1 reference means used beyond the declaration"
/// heuristic rely on for other binding kinds.
pub fn visit_parameter_defaults(
    params: IdRange,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    for param in context.parse_arena.get_js_children(params) {
        super::super::script::walk_js_node_typed(param, context)?;
    }
    Ok(())
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
