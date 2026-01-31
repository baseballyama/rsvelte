//! Program visitor for client-side transformation.
//!
//! Corresponds to `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Program.js`.
//!
//! This visitor handles the Program node and sets up transformations for:
//! - Legacy mode `$$props` sanitization
//! - Mutated imports in legacy mode
//! - Store subscriptions ($store)
//! - Props (prop and bindable_prop)
//! - State transformers
//!
//! # Note on Implementation
//!
//! The JavaScript version uses closures extensively to capture state for transformations.
//! In Rust, we cannot use closures that capture variables as function pointers.
//! Instead, we mark which identifiers need transformation and handle the actual
//! transformation during the visitor traversal phase.

use crate::compiler::phases::phase2_analyze::scope::{BindingKind, DeclarationKind};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::shared::declarations::add_state_transformers;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Visit a Program node and set up transformations.
///
/// This corresponds to the `Program()` function in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Program.js`.
///
/// # Arguments
///
/// * `context` - The component context containing state and scope information
///
/// # Returns
///
/// Returns the transformed program if needed, or None to continue with default traversal.
///
/// # Implementation Note
///
/// This is a simplified version that marks which bindings need special handling.
/// The actual transformations are applied during the expression visitor phase.
/// This avoids the need for closures that capture state, which can't be used
/// as function pointers in Rust.
pub fn visit_program(context: &mut ComponentContext) -> Option<JsProgram> {
    // Legacy mode transformations (non-runes)
    if !context.state.analysis.runes {
        // Mark $$props for transformation to $$sanitized_props
        // This will be handled during identifier visiting

        // Handle mutated imports in instance scope
        if let Some(ref _instance) = context.state.analysis.instance {
            // Iterate through scope declarations to find mutated imports
            for (_name, binding_idx) in &context.state.scope.declarations {
                if let Some(binding) = context.state.scope_root.bindings.get(*binding_idx) {
                    // Check if this is a mutated import
                    if binding.declaration_kind == DeclarationKind::Import && binding.mutated {
                        // Mark this import for reactive wrapping
                        // The actual transformation will happen during visitor traversal
                        // For now, we just note that this needs special handling
                    }
                }
            }
        }
    }

    // Add state transformers for all reactive bindings
    // This sets up read/assign/mutate/update transforms that wrap identifiers with $.get(), $.set(), etc.
    add_state_transformers(context);

    // Handle store subscriptions, props, and state bindings for all modes
    for (name, binding_idx) in context.state.scope.declarations.clone() {
        if let Some(binding) = context.state.scope_root.bindings.get(binding_idx) {
            // Mark different binding types for transformation
            match binding.kind {
                BindingKind::StoreSub => {
                    // Store subscriptions need special transformation
                    // Corresponds to the store_sub handling in Program.js:
                    //
                    // context.state.transform[name] = {
                    //     read: b.call,                           // $store → $store()
                    //     assign: (_, value) => b.call('$.store_set', get_store(), value),
                    //     mutate: (node, mutation) => b.call('$.store_mutate', ...),
                    //     update: (node) => b.call(node.prefix ? '$.update_pre_store' : '$.update_store', ...)
                    // };
                    //
                    // The store variable name starts with '$', e.g., '$count'
                    // The underlying store is 'count' (without the '$')

                    let transform = IdentifierTransform {
                        read: Some(store_sub_read),
                        assign: Some(store_sub_assign),
                        mutate: Some(store_sub_mutate),
                        update: Some(store_sub_update),
                        skip_proxy: false,
                        is_defined: false,
                        // Store subscriptions are reactive
                        is_reactive: true,
                    };

                    context.state.transform.insert(name.clone(), transform);
                }
                BindingKind::Prop | BindingKind::BindableProp => {
                    // Props need special handling based on whether they're sources
                    // Will be transformed during visitor traversal
                }
                BindingKind::State | BindingKind::RawState | BindingKind::Derived => {
                    // State variables need $.get() wrapping
                    // Transforms are set up by add_state_transformers above
                }
                BindingKind::LegacyReactive => {
                    // Legacy reactive statements need special handling
                }
                _ => {}
            }
        }
    }

    // If this is the instance script, we might need async transformation
    // For now, we skip this as it requires complex AST traversal
    if context.state.is_instance {
        // The instance body would need transformation for async support
        // This is handled separately in the full implementation
    }

    // Continue with default traversal
    None
}

/// Check if a binding is a prop source (needs $.prop() wrapping).
///
/// Corresponds to `is_prop_source()` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/utils.js`.
#[allow(dead_code)]
fn is_prop_source_binding(
    binding: &crate::compiler::phases::phase2_analyze::scope::Binding,
    state: &ComponentClientTransformState,
) -> bool {
    // In runes mode, props are sources if they're updated
    if state.analysis.runes {
        return binding.is_updated();
    }

    // In legacy mode, props are sources if they're reassigned or mutated
    binding.reassigned || binding.mutated
}

// ============================================================================
// Store subscription transform functions
// ============================================================================

/// Transform a store subscription read.
///
/// Transforms `$store` → `$store()` (function call).
///
/// In the generated code, `$store` is a function that returns the store value:
/// ```javascript
/// const $store = () => $.store_get(store, '$store', $$stores);
/// ```
/// So reading `$store` becomes `$store()`.
fn store_sub_read(node: JsExpr) -> JsExpr {
    b::call(node, vec![])
}

/// Transform a store subscription assignment.
///
/// Transforms `$store = value` → `$.store_set(store, value)`.
///
/// # Arguments
///
/// * `node` - The store subscription identifier (e.g., `$store`)
/// * `value` - The value being assigned
/// * `_needs_proxy` - Whether the value needs to be proxified (not used for stores)
fn store_sub_assign(node: JsExpr, value: JsExpr, _needs_proxy: bool) -> JsExpr {
    // Extract store name from $store → store
    let store_name = if let JsExpr::Identifier(ref name) = node {
        name.strip_prefix('$').unwrap_or(name).to_string()
    } else {
        "unknown".to_string()
    };

    b::call(
        b::member_path("$.store_set"),
        vec![b::id(&store_name), value],
    )
}

/// Transform a store subscription mutation.
///
/// Transforms mutations like `$store.prop = value` to:
/// ```javascript
/// $.store_mutate(store, $.untrack($store).prop = value, $.untrack($store))
/// ```
///
/// The key insight is that within the mutation expression, we need to replace
/// `$store` (which would normally become `$store()`) with `$.untrack($store)`
/// to avoid tracking the store read inside the mutation.
///
/// # Arguments
///
/// * `node` - The store subscription identifier (e.g., `$store`)
/// * `mutation` - The mutation expression (e.g., `$store.prop = value`)
fn store_sub_mutate(node: JsExpr, mutation: JsExpr) -> JsExpr {
    // Extract store name from $store → store
    let store_name = if let JsExpr::Identifier(ref name) = node {
        name.strip_prefix('$').unwrap_or(name).to_string()
    } else {
        "unknown".to_string()
    };

    // We need to untrack the store read, for consistency with Svelte 4
    let untracked = b::call(b::member_path("$.untrack"), vec![node.clone()]);

    // Replace $store with $.untrack($store) in the mutation expression
    // This follows the official Svelte compiler's replace() function
    let transformed_mutation = replace_store_with_untracked(&mutation, &untracked);

    b::call(
        b::member_path("$.store_mutate"),
        vec![b::id(&store_name), transformed_mutation, untracked],
    )
}

/// Replace the base store reference with an untracked version in a mutation expression.
///
/// For a member expression like `$store.prop.nested`, this recursively walks down
/// to the base identifier and replaces it with the untracked version.
///
/// Corresponds to the `replace()` function in the official Svelte compiler's
/// `Program.js` store_sub mutate transform.
fn replace_store_with_untracked(expr: &JsExpr, untracked: &JsExpr) -> JsExpr {
    match expr {
        JsExpr::Assignment(assign) => {
            // For assignment expressions, we need to replace the store ref in the left side
            let transformed_left = replace_store_with_untracked(assign.left.as_ref(), untracked);
            JsExpr::Assignment(JsAssignmentExpression {
                operator: assign.operator,
                left: Box::new(transformed_left),
                right: assign.right.clone(),
            })
        }
        JsExpr::Member(member) => {
            // Recursively replace in the object part of the member expression
            let transformed_object = replace_store_with_untracked(&member.object, untracked);
            JsExpr::Member(JsMemberExpression {
                object: Box::new(transformed_object),
                property: member.property.clone(),
                computed: member.computed,
                optional: member.optional,
            })
        }
        JsExpr::Update(update) => {
            // For update expressions like ++$store.prop
            let transformed_argument = replace_store_with_untracked(&update.argument, untracked);
            JsExpr::Update(JsUpdateExpression {
                operator: update.operator,
                argument: Box::new(transformed_argument),
                prefix: update.prefix,
            })
        }
        // When we reach an identifier or call expression at the base, replace it with untracked
        JsExpr::Identifier(_) | JsExpr::Call(_) => untracked.clone(),
        // For any other expression, return it unchanged (shouldn't happen in normal cases)
        _ => expr.clone(),
    }
}

/// Transform a store subscription update expression (++ or --).
///
/// Transforms `$store++` to `$.update_store(store, $store(), 1)` or
/// `++$store` to `$.update_pre_store(store, $store(), 1)`.
///
/// # Arguments
///
/// * `operator` - The update operator (++ or --)
/// * `argument` - The store subscription identifier (e.g., `$store`)
/// * `prefix` - Whether the operator is prefix (++$store) or postfix ($store++)
fn store_sub_update(operator: JsUpdateOp, argument: JsExpr, prefix: bool) -> JsExpr {
    // Extract store name from $store → store
    let store_name = if let JsExpr::Identifier(ref name) = argument {
        name.strip_prefix('$').unwrap_or(name).to_string()
    } else {
        "unknown".to_string()
    };

    let method = if prefix {
        "$.update_pre_store"
    } else {
        "$.update_store"
    };

    // Build the current value accessor: $store()
    let current_value = b::call(argument, vec![]);

    let mut args = vec![b::id(&store_name), current_value];

    // For decrement, pass -1 as the delta
    if operator == JsUpdateOp::Decrement {
        args.push(b::number(-1.0));
    }

    b::call(b::member_path(method), args)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::CompileOptions;
    use crate::compiler::phases::phase2_analyze::scope::{Binding, Scope, ScopeRoot};
    use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
    use std::rc::Rc;

    #[test]
    fn test_visit_program() {
        // Create a minimal component analysis
        let source = "let count = 0;";
        let options = CompileOptions::default();
        let analysis = ComponentAnalysis::new(source, &options);
        let scope_root = ScopeRoot::new();
        let transform_options = Rc::new(TransformOptions::default());

        let state = ComponentClientTransformState::new(
            &scope_root.scope,
            &scope_root,
            &analysis,
            crate::compiler::phases::phase3_transform::js_ast::builders::id("root"),
            transform_options,
        );

        let visit_fn = |_ctx: &mut ComponentContext,
                        _node: &crate::ast::template::TemplateNode,
                        _state: Option<&ComponentClientTransformState>|
         -> TransformResult { TransformResult::None };

        let mut context = ComponentContext::new(state, visit_fn);

        // Visit the program - should return None (continue with default traversal)
        let result = visit_program(&mut context);
        assert!(result.is_none());
    }
}
