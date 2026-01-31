//! Declaration transformations for reactive state.
//!
//! This module handles the transformation of variable declarations and references
//! to use Svelte's runtime reactivity system ($.get, $.set, etc.).
//!
//! Corresponds to `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/declarations.js`.

use crate::compiler::phases::phase2_analyze::scope::{BindingKind, DeclarationKind};
use crate::compiler::phases::phase3_transform::client::types::{
    ComponentContext, IdentifierTransform,
};
use crate::compiler::phases::phase3_transform::client::utils::is_state_source;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::{
    JsAssignmentExpression, JsExpr, JsMemberExpression, JsUpdateExpression, JsUpdateOp,
};

/// Turns an identifier into a reactive getter call.
///
/// This transforms `foo` into `$.get(foo)` for reading reactive state.
///
/// # Arguments
///
/// * `node` - The identifier to wrap in a getter
///
/// # Returns
///
/// A call expression: `$.get(node)`
///
/// # Example
///
/// ```ignore
/// // Input: foo
/// // Output: $.get(foo)
/// ```
pub fn get_value(node: JsExpr) -> JsExpr {
    b::svelte_call("get", vec![node])
}

/// Safe getter for var declarations.
///
/// This transforms `foo` into `$.safe_get(foo)` for reading reactive state
/// declared with `var` (which has different scoping rules).
///
/// # Arguments
///
/// * `node` - The identifier to wrap in a safe getter
///
/// # Returns
///
/// A call expression: `$.safe_get(node)`
fn safe_get_value(node: JsExpr) -> JsExpr {
    b::svelte_call("safe_get", vec![node])
}

/// Add state transformers to the transform map.
///
/// This sets up the transformation rules for all reactive bindings in the current scope.
/// For each state source (bindings declared with $state, $derived, or legacy reactive),
/// it creates read/write/mutate/update transformers that control how the binding is
/// accessed and modified during code generation.
///
/// # Arguments
///
/// * `context` - The component context containing the transformation state
///
/// # Transform Rules
///
/// For each reactive binding, the following transformers are created:
///
/// - **read**: Wraps reads in `$.get()` (or `$.safe_get()` for var declarations)
/// - **assign**: Wraps assignments in `$.set()` calls, with optional proxying
/// - **mutate**: Wraps mutations in `$.mutate()` for legacy mode (passthrough in runes mode)
///
/// # Example
///
/// ```ignore
/// // Before:
/// let count = $state(0);
/// count = 5;
///
/// // After transformation:
/// let count = $.source(0);
/// $.set(count, 5);  // Uses the assign transformer
/// ```
pub fn add_state_transformers(context: &mut ComponentContext) {
    // Iterate over all declarations in the current scope
    for (name, binding_idx) in context.state.scope.declarations.iter() {
        // Get the binding from the root scope
        if let Some(binding) = context.state.scope_root.bindings.get(*binding_idx) {
            // Handle store subscriptions ($store)
            // Reference: Program.js lines 45-102
            if matches!(binding.kind, BindingKind::StoreSub) {
                // For store_sub bindings, the read transform just calls the getter
                // $store -> $store()
                // The mutate transform wraps mutations in $.store_mutate()
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
                continue;
            }

            // Handle props (Prop or BindableProp)
            // Reference: Program.js lines 104-136
            if matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp) {
                use crate::compiler::phases::phase3_transform::client::utils::is_prop_source;

                if is_prop_source(binding, context.state.analysis) {
                    // Prop is a "source" - accessed via function call
                    // read: b.call - transforms x to x()
                    // assign: (node, value) => b.call(node, value) - x(value)
                    let is_bindable = matches!(binding.kind, BindingKind::BindableProp);
                    let transform = IdentifierTransform {
                        read: Some(prop_source_read),
                        assign: Some(prop_source_assign),
                        mutate: Some(if is_bindable {
                            prop_bindable_mutate
                        } else {
                            prop_mutate
                        }),
                        update: Some(prop_update),
                        skip_proxy: false,
                        is_defined: false,
                        // Props are reactive
                        is_reactive: true,
                    };
                    context.state.transform.insert(name.clone(), transform);
                } else {
                    // Prop is NOT a source - accessed via $$props.name
                    // Note: we need to capture the name for the member access
                    // Since we can't capture in fn pointers, we use a different approach:
                    // For non-source props, we don't register a transform and let the
                    // default identifier handling access $$props.name directly
                    // This is handled elsewhere in the codebase
                }
                continue;
            }

            // Check if this binding needs reactive transformations
            if is_state_source(binding, context.state.analysis)
                || matches!(binding.kind, BindingKind::Derived)
                || matches!(binding.kind, BindingKind::LegacyReactive)
            {
                // Determine the read function based on declaration kind
                let read_fn: fn(JsExpr) -> JsExpr =
                    if binding.declaration_kind == DeclarationKind::Var {
                        safe_get_value
                    } else {
                        get_value
                    };

                // Determine the mutate function based on runes mode
                let mutate_fn: fn(JsExpr, JsExpr) -> JsExpr = if context.state.analysis.runes {
                    mutate_value_runes
                } else {
                    mutate_value_legacy
                };

                // Determine the assign function based on whether we need store handling
                let assign_fn = create_assign_fn(name, context);

                // Create the transform rule for this binding
                // $state.raw() variables should never use proxy (skip_proxy: true)
                let skip_proxy = matches!(binding.kind, BindingKind::RawState);
                let transform = IdentifierTransform {
                    read: Some(read_fn),
                    assign: Some(assign_fn),
                    mutate: Some(mutate_fn),
                    update: Some(update_value),
                    skip_proxy,
                    is_defined: false,
                    // State sources ($state, $derived, legacy reactive) are reactive
                    is_reactive: true,
                };

                // Register the transform in the state
                context.state.transform.insert(name.clone(), transform);
            }
        }
    }
}

// ============================================================================
// Prop transform functions
// ============================================================================

/// Transform a prop source read.
///
/// This transforms `x` into `x()` by calling it as a function.
/// In the generated code, `$.prop()` returns a getter function.
fn prop_source_read(node: JsExpr) -> JsExpr {
    b::call(node, vec![])
}

/// Transform a prop source assignment.
///
/// This transforms `x = value` into `x(value)` by calling the setter.
fn prop_source_assign(node: JsExpr, value: JsExpr, _needs_proxy: bool) -> JsExpr {
    b::call(node, vec![value])
}

/// Transform a prop mutation (non-bindable).
///
/// For non-bindable props, mutations are passed through unchanged.
fn prop_mutate(_node: JsExpr, mutation: JsExpr) -> JsExpr {
    mutation
}

/// Transform a bindable prop mutation.
///
/// For bindable props, mutations need to notify the parent.
/// Transforms `x.prop = value` to `x(x.prop = value, true)`
fn prop_bindable_mutate(node: JsExpr, mutation: JsExpr) -> JsExpr {
    b::call(node, vec![mutation, b::boolean(true)])
}

/// Transform a prop update expression (++ or --).
///
/// Transforms `x++` to `$.update_prop(x)` or `++x` to `$.update_pre_prop(x)`.
fn prop_update(operator: JsUpdateOp, argument: JsExpr, prefix: bool) -> JsExpr {
    let method = if prefix {
        "update_pre_prop"
    } else {
        "update_prop"
    };

    let mut args = vec![argument];

    // For decrement, pass -1 as the second argument
    if operator == JsUpdateOp::Decrement {
        args.push(b::number(-1.0));
    }

    b::svelte_call(method, args)
}

/// Transform a store subscription read.
///
/// This transforms `$store` into `$store()` by calling the getter function.
///
/// # Arguments
///
/// * `node` - The store subscription identifier (e.g., `$store`)
///
/// # Returns
///
/// A call expression: `$store()`
fn store_sub_read(node: JsExpr) -> JsExpr {
    b::call(node, vec![])
}

/// Transform a store subscription assignment.
///
/// This transforms `$store = value` into `$.store_set(store, value)`.
///
/// # Arguments
///
/// * `node` - The store subscription identifier (e.g., `$store`)
/// * `value` - The value being assigned
/// * `_needs_proxy` - Unused for store subscriptions
///
/// # Returns
///
/// A call expression: `$.store_set(store, value)`
fn store_sub_assign(node: JsExpr, value: JsExpr, _needs_proxy: bool) -> JsExpr {
    // Extract the store name from the $store identifier
    let store_name = if let JsExpr::Identifier(ref name) = node {
        // Remove the $ prefix
        name.strip_prefix('$').unwrap_or(name).to_string()
    } else {
        "unknown".to_string()
    };

    b::svelte_call("store_set", vec![b::id(&store_name), value])
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

/// Transform a store subscription update expression.
///
/// This transforms `$store++` into `$.update_store(store, $store())`.
///
/// # Arguments
///
/// * `operator` - The update operator (++ or --)
/// * `argument` - The store subscription identifier being updated
/// * `prefix` - Whether the operator is prefix (++$store) or postfix ($store++)
///
/// # Returns
///
/// A call to `$.update_pre_store()` (prefix) or `$.update_store()` (postfix)
fn store_sub_update(operator: JsUpdateOp, argument: JsExpr, prefix: bool) -> JsExpr {
    let method = if prefix {
        "update_pre_store"
    } else {
        "update_store"
    };

    // Extract the store name from the $store identifier
    let store_name = if let JsExpr::Identifier(ref name) = argument {
        // Remove the $ prefix
        name.strip_prefix('$').unwrap_or(name).to_string()
    } else {
        "unknown".to_string()
    };

    // Build args: store, $store()
    let mut args = vec![
        b::id(&store_name),                // store
        b::call(argument.clone(), vec![]), // $store()
    ];

    // For decrement, pass -1 as the third argument
    if operator == JsUpdateOp::Decrement {
        args.push(b::number(-1.0));
    }

    b::svelte_call(method, args)
}

/// Create an assign function for a binding, with store subscription handling if needed.
///
/// This checks if the binding has a corresponding store subscription (`$name`).
/// If so, it creates a wrapper that calls `$.store_unsub()` after the assignment.
fn create_assign_fn(name: &str, context: &ComponentContext) -> fn(JsExpr, JsExpr, bool) -> JsExpr {
    // Check if this identifier has a corresponding store subscription
    let store_name = format!("${}", name);
    let has_store_sub = context
        .state
        .scope
        .declarations
        .get(&store_name)
        .and_then(|idx| context.state.scope_root.bindings.get(*idx))
        .map(|binding| binding.kind == BindingKind::StoreSub)
        .unwrap_or(false);

    if has_store_sub {
        assign_value_with_store
    } else {
        assign_value
    }
}

/// Transform an assignment to reactive state.
///
/// This wraps assignments in `$.set()` calls to trigger reactivity.
///
/// # Arguments
///
/// * `node` - The identifier being assigned to
/// * `value` - The value being assigned
/// * `needs_proxy` - Whether the value should be proxified (for deep reactivity)
///
/// # Returns
///
/// A call expression: `$.set(node, value[, true])`
///
/// # Example
///
/// ```ignore
/// // Input: count = 5
/// // Output: $.set(count, 5)
///
/// // With proxy:
/// // Input: obj = { a: 1 }
/// // Output: $.set(obj, { a: 1 }, true)
/// ```
fn assign_value(node: JsExpr, value: JsExpr, needs_proxy: bool) -> JsExpr {
    // Build the $.set() call
    let mut args = vec![node, value];
    if needs_proxy {
        args.push(b::boolean(true));
    }

    b::svelte_call("set", args)
}

/// Transform an assignment to reactive state with store subscription cleanup.
///
/// This wraps the assignment in both `$.set()` and `$.store_unsub()`.
///
/// # Arguments
///
/// * `node` - The identifier being assigned to
/// * `value` - The value being assigned
/// * `needs_proxy` - Whether the value should be proxified
///
/// # Returns
///
/// A call expression: `$.store_unsub($.set(node, value[, true]), "$name", $$stores)`
fn assign_value_with_store(node: JsExpr, value: JsExpr, needs_proxy: bool) -> JsExpr {
    let set_call = assign_value(node.clone(), value, needs_proxy);

    // Extract the name for the store subscription
    let store_name = if let JsExpr::Identifier(ref name) = node {
        format!("${}", name)
    } else {
        // Fallback - this shouldn't happen
        "$unknown".to_string()
    };

    // Wrap in $.store_unsub()
    b::svelte_call(
        "store_unsub",
        vec![set_call, b::string(&store_name), b::id("$$stores")],
    )
}

/// Transform a mutation of reactive state in runes mode.
///
/// In runes mode, mutations are automatically reactive, so we pass them through unchanged.
///
/// # Arguments
///
/// * `_node` - The identifier being mutated (unused in runes mode)
/// * `mutation` - The mutation expression (e.g., `obj.prop = value`)
///
/// # Returns
///
/// The mutation expression unchanged
fn mutate_value_runes(_node: JsExpr, mutation: JsExpr) -> JsExpr {
    mutation
}

/// Transform a mutation of reactive state in legacy mode.
///
/// In legacy mode, mutations must be wrapped in `$.mutate()` to trigger reactivity.
///
/// # Arguments
///
/// * `node` - The identifier being mutated
/// * `mutation` - The mutation expression (e.g., `obj.prop = value`)
///
/// # Returns
///
/// A call expression: `$.mutate(node, mutation)`
fn mutate_value_legacy(node: JsExpr, mutation: JsExpr) -> JsExpr {
    b::svelte_call("mutate", vec![node, mutation])
}

/// Transform an update expression (++ or --).
///
/// This wraps increment/decrement operations in appropriate runtime calls.
///
/// # Arguments
///
/// * `operator` - The update operator (++ or --)
/// * `argument` - The identifier being updated
/// * `prefix` - Whether the operator is prefix (++x) or postfix (x++)
///
/// # Returns
///
/// A call to `$.update_pre()` (prefix) or `$.update()` (postfix)
///
/// # Example
///
/// ```ignore
/// // Prefix increment:
/// // Input: ++count
/// // Output: $.update_pre(count)
///
/// // Postfix decrement:
/// // Input: count--
/// // Output: $.update(count, -1)
/// ```
pub fn update_value(operator: JsUpdateOp, argument: JsExpr, prefix: bool) -> JsExpr {
    let method = if prefix { "update_pre" } else { "update" };

    let mut args = vec![argument];

    // For decrement, pass -1 as the second argument
    if operator == JsUpdateOp::Decrement {
        args.push(b::number(-1.0));
    }

    b::svelte_call(method, args)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::CompileOptions;
    use crate::compiler::phases::phase2_analyze::scope::{Binding, Scope, ScopeRoot};
    use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
    use std::rc::Rc;

    #[test]
    fn test_get_value() {
        let node = b::id("count");
        let result = get_value(node);

        // Should generate $.get(count)
        match result {
            JsExpr::Call(call) => {
                assert_eq!(call.arguments.len(), 1);
            }
            _ => panic!("Expected call expression"),
        }
    }

    #[test]
    fn test_safe_get_value() {
        let node = b::id("count");
        let result = safe_get_value(node);

        // Should generate $.safe_get(count)
        match result {
            JsExpr::Call(call) => {
                assert_eq!(call.arguments.len(), 1);
            }
            _ => panic!("Expected call expression"),
        }
    }

    #[test]
    fn test_assign_value_basic() {
        let node = b::id("count");
        let value = b::number(5.0);
        let result = assign_value(node, value, false);

        // Should generate $.set(count, 5)
        match result {
            JsExpr::Call(call) => {
                assert_eq!(call.arguments.len(), 2);
            }
            _ => panic!("Expected call expression"),
        }
    }

    #[test]
    fn test_assign_value_with_proxy() {
        let node = b::id("obj");
        let value = b::empty_object();
        let result = assign_value(node, value, true);

        // Should generate $.set(obj, {}, true)
        match result {
            JsExpr::Call(call) => {
                assert_eq!(call.arguments.len(), 3);
            }
            _ => panic!("Expected call expression"),
        }
    }

    #[test]
    fn test_mutate_value_runes() {
        let node = b::id("obj");
        let mutation = b::assign(b::member(node.clone(), "prop"), b::number(5.0));
        let result = mutate_value_runes(node, mutation.clone());

        // In runes mode, should return the mutation unchanged
        match result {
            JsExpr::Assignment(_) => {}
            _ => panic!("Expected assignment expression"),
        }
    }

    #[test]
    fn test_mutate_value_legacy() {
        let node = b::id("obj");
        let mutation = b::assign(b::member(node.clone(), "prop"), b::number(5.0));
        let result = mutate_value_legacy(node, mutation);

        // In legacy mode, should wrap in $.mutate()
        match result {
            JsExpr::Call(call) => {
                assert_eq!(call.arguments.len(), 2);
            }
            _ => panic!("Expected call expression"),
        }
    }

    #[test]
    fn test_update_value_increment() {
        let argument = b::id("count");
        let result = update_value(JsUpdateOp::Increment, argument, true);

        // Should generate $.update_pre(count)
        match result {
            JsExpr::Call(call) => {
                assert_eq!(call.arguments.len(), 1);
            }
            _ => panic!("Expected call expression"),
        }
    }

    #[test]
    fn test_update_value_decrement() {
        let argument = b::id("count");
        let result = update_value(JsUpdateOp::Decrement, argument, false);

        // Should generate $.update(count, -1)
        match result {
            JsExpr::Call(call) => {
                assert_eq!(call.arguments.len(), 2);
            }
            _ => panic!("Expected call expression"),
        }
    }

    #[test]
    fn test_add_state_transformers() {
        let options = CompileOptions::default();
        let mut analysis = ComponentAnalysis::new("", &options);
        analysis.runes = true;

        let mut scope_root = ScopeRoot::new();
        let mut binding = Binding::new("count".to_string(), BindingKind::State, 0);
        binding.reassigned = true;

        let binding_idx = scope_root.bindings.len();
        scope_root.bindings.push(binding);

        let mut scope = Scope::new(None);
        scope.declarations.insert("count".to_string(), binding_idx);

        let transform_options = Rc::new(
            crate::compiler::phases::phase3_transform::client::types::TransformOptions::default(),
        );
        let state =
            crate::compiler::phases::phase3_transform::client::types::ComponentClientTransformState::new(
                &scope,
                &scope_root,
                &analysis,
                b::id("anchor"),
                transform_options,
            );

        let mut context =
            crate::compiler::phases::phase3_transform::client::types::ComponentContext::new(
                state,
                |_, _, _| {
                    crate::compiler::phases::phase3_transform::client::types::TransformResult::None
                },
            );

        add_state_transformers(&mut context);

        // Should have registered a transform for "count"
        assert!(context.state.transform.contains_key("count"));
        let transform = context.state.transform.get("count").unwrap();
        assert!(transform.read.is_some());
        assert!(transform.assign.is_some());
        assert!(transform.mutate.is_some());
    }
}
