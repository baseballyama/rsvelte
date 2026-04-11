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
        // Transform $$props reads to $$sanitized_props in legacy mode.
        // This ensures that spread attributes ({...$$props}) use the sanitized version
        // that has internal properties (children, $$slots, $$events, $$legacy) removed.
        // Reference: Program.js L14-16
        if context.state.analysis.uses_props || context.state.analysis.uses_rest_props {
            let transform = IdentifierTransform {
                read: Some(sanitized_props_read),
                read_source: None,
                assign: None,
                mutate: None,
                update: None,
                skip_proxy: false,
                is_defined: false,
                is_reactive: true,
                replacement_id: None,
            };
            context
                .state
                .transform
                .insert("$$props".to_string(), transform);
            // `$$props` is treated as template-kind in legacy reactivity:
            // reads must be wrapped in `$.deep_read_state()`.
            context
                .state
                .transform_deep_read
                .insert("$$props".to_string(), ());
            context
                .state
                .transform_deep_read
                .insert("$$restProps".to_string(), ());
        }

        // Handle mutated imports in instance scope.
        // In legacy mode, mutated imports inside the instance script need to be wrapped
        // with $.reactive_import() so they can be re-evaluated after mutations.
        // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Program.js L18-41
        let instance_scope_index = context.state.scope_root.instance_scope_index;

        // Collect mutated instance imports from all bindings.
        // Only instance-level imports are wrapped with $.reactive_import().
        // Module-level imports (in <script module>) are NOT wrapped.
        // We check binding.scope_index == instance_scope_index to ensure we only
        // pick up instance-level imports.
        let has_instance_script = context.state.analysis.instance_script_content.is_some();
        let reactive_import_names: Vec<String> = if has_instance_script {
            context
                .state
                .scope_root
                .bindings
                .iter()
                .filter_map(|binding| {
                    if binding.declaration_kind == DeclarationKind::Import
                        && binding.mutated
                        && binding.scope_index == instance_scope_index
                    {
                        Some(binding.name.clone())
                    } else {
                        None
                    }
                })
                .collect()
        } else {
            Vec::new()
        };

        for name in reactive_import_names {
            let import_id = format!("$$_import_{}", name);

            // Register transform: reads become $$_import_X(), mutations become $$_import_X(mutation)
            let transform = IdentifierTransform {
                read: Some(reactive_import_read),
                read_source: None,
                assign: None,
                mutate: Some(reactive_import_mutate),
                update: None,
                skip_proxy: false,
                is_defined: false,
                is_reactive: true,
                replacement_id: Some(import_id.clone()),
            };

            context.state.transform.insert(name.clone(), transform);
            // Legacy reactive imports need deep_read_state wrapping, matching
            // the official compiler's `declaration_kind === 'import'` check.
            context.state.transform_deep_read.insert(name.clone(), ());

            // Generate: var $$_import_X = $.reactive_import(() => X)
            let stmt = b::var_decl(
                &context.arena,
                &import_id,
                Some(b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.reactive_import"),
                    vec![b::arrow(&context.arena, vec![], b::id(&name))],
                )),
            );
            context.state.legacy_reactive_imports.push(stmt);
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
                        read_source: None,
                        assign: Some(store_sub_assign),
                        mutate: Some(store_sub_mutate),
                        update: Some(store_sub_update),
                        skip_proxy: false,
                        is_defined: false,
                        // Store subscriptions are reactive
                        is_reactive: true,
                        replacement_id: None,
                    };

                    context.state.transform.insert(name.clone(), transform);
                }
                BindingKind::Prop | BindingKind::BindableProp => {
                    // Props need special handling based on whether they're sources.
                    // In legacy mode, props created with `export let` become getter functions
                    // via $.prop(), so reading them should call the getter: foo -> foo()
                    //
                    // Corresponds to the prop handling in Program.js:
                    // context.state.transform[name] = {
                    //     read: b.call,  // foo -> foo()
                    //     assign: (node, value) => b.call(node, value),
                    //     mutate: (node, value) => {
                    //         if (binding.kind === 'bindable_prop') return b.call(node, value, b.true);
                    //         return value;
                    //     }
                    // };
                    //
                    // Check if this prop should be a source (needs transformation)
                    if is_prop_source_binding(binding, &context.state) {
                        // For BindableProp, mutations must notify the parent: node(mutation, true)
                        // For regular Prop, mutations are passed through unchanged.
                        let mutate_fn = if matches!(binding.kind, BindingKind::BindableProp) {
                            prop_bindable_mutate
                        } else {
                            prop_mutate
                        };
                        let transform = IdentifierTransform {
                            read: Some(prop_read),
                            read_source: None,
                            assign: Some(prop_assign),
                            mutate: Some(mutate_fn),
                            update: Some(prop_update),
                            skip_proxy: false,
                            is_defined: false,
                            is_reactive: true,
                            replacement_id: None,
                        };

                        context.state.transform.insert(name.clone(), transform);
                        // Bindable props are template-kind and require
                        // deep_read_state wrapping in legacy reactivity.
                        if matches!(binding.kind, BindingKind::BindableProp) {
                            context.state.transform_deep_read.insert(name.clone(), ());
                        }
                    } else {
                        // Non-source props: read from $$props.name
                        // Corresponds to Program.js lines 125-134:
                        // context.state.transform[name] = {
                        //     read: (node) => b.member(b.id('$$props'), node)
                        // };
                        let transform = IdentifierTransform {
                            read: Some(non_source_prop_read),
                            read_source: None,
                            assign: None,
                            mutate: None,
                            update: None,
                            skip_proxy: false,
                            is_defined: false,
                            is_reactive: true,
                            replacement_id: None,
                        };

                        context.state.transform.insert(name.clone(), transform);
                    }
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
///
/// A prop is a "source" when it needs the $.prop() wrapping for reactivity.
/// In legacy mode, ALL props are sources (for coarse-grained reactivity).
/// In runes mode, only props that are accessors, reassigned, have initial values,
/// or are updated need to be sources.
fn is_prop_source_binding(
    binding: &crate::compiler::phases::phase2_analyze::scope::Binding,
    state: &ComponentClientTransformState,
) -> bool {
    // In legacy mode (not runes), ALL props are sources
    // This is because the parent component could be legacy and needs coarse-grained reactivity
    if !state.analysis.runes {
        return true;
    }

    // In runes mode, props are sources if:
    // - accessors is enabled
    // - binding is reassigned
    // - binding has an initial value
    // - binding is updated (mutated or reassigned)
    state.analysis.accessors
        || binding.reassigned
        || binding.initial.is_some()
        || binding.is_updated()
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
fn store_sub_read(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    node: JsExpr,
) -> JsExpr {
    b::call(arena, node, vec![])
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
fn store_sub_assign(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    node: JsExpr,
    value: JsExpr,
    _needs_proxy: bool,
) -> JsExpr {
    // Extract store name from $store → store
    let store_name = if let JsExpr::Identifier(ref name) = node {
        name.strip_prefix('$').unwrap_or(name).to_string()
    } else {
        "unknown".to_string()
    };

    b::call(
        arena,
        b::member_path(arena, "$.store_set"),
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
fn store_sub_mutate(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    node: JsExpr,
    mutation: JsExpr,
) -> JsExpr {
    // Extract store name from $store → store
    let store_name = if let JsExpr::Identifier(ref name) = node {
        name.strip_prefix('$').unwrap_or(name).to_string()
    } else {
        "unknown".to_string()
    };

    // We need to untrack the store read, for consistency with Svelte 4
    let untracked = b::call(
        arena,
        b::member_path(arena, "$.untrack"),
        vec![node.clone()],
    );

    // Replace $store with $.untrack($store) in the mutation expression
    // This follows the official Svelte compiler's replace() function
    let transformed_mutation = replace_store_with_untracked(arena, &mutation, &untracked);

    b::call(
        arena,
        b::member_path(arena, "$.store_mutate"),
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
fn replace_store_with_untracked(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    expr: &JsExpr,
    untracked: &JsExpr,
) -> JsExpr {
    match expr {
        JsExpr::Assignment(assign) => {
            // For assignment expressions, we need to replace the store ref in the left side
            let transformed_left =
                replace_store_with_untracked(arena, arena.get_expr(assign.left), untracked);
            JsExpr::Assignment(JsAssignmentExpression {
                operator: assign.operator,
                left: arena.alloc_expr(transformed_left),
                right: assign.right,
            })
        }
        JsExpr::Member(member) => {
            // Recursively replace in the object part of the member expression
            let transformed_object =
                replace_store_with_untracked(arena, arena.get_expr(member.object), untracked);
            JsExpr::Member(JsMemberExpression {
                object: arena.alloc_expr(transformed_object),
                property: member.property.clone(),
                computed: member.computed,
                optional: member.optional,
            })
        }
        JsExpr::Update(update) => {
            // For update expressions like ++$store.prop
            let transformed_argument =
                replace_store_with_untracked(arena, arena.get_expr(update.argument), untracked);
            JsExpr::Update(JsUpdateExpression {
                operator: update.operator,
                argument: arena.alloc_expr(transformed_argument),
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
fn store_sub_update(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    operator: JsUpdateOp,
    argument: JsExpr,
    prefix: bool,
) -> JsExpr {
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
    let current_value = b::call(arena, argument, vec![]);

    let mut args = vec![b::id(&store_name), current_value];

    // For decrement, pass -1 as the delta
    if operator == JsUpdateOp::Decrement {
        args.push(b::number(-1.0));
    }

    b::call(arena, b::member_path(arena, method), args)
}

// ============================================================================
// Prop transform functions
// ============================================================================

/// Transform a non-source prop read.
///
/// Non-source props (in runes mode: props that are not reassigned, not mutated,
/// and have no initial value) are accessed directly via `$$props.name`.
///
/// Corresponds to Program.js lines 131-134:
/// ```js
/// context.state.transform[name] = {
///     read: (node) => b.member(b.id('$$props'), node)
/// };
/// ```
fn non_source_prop_read(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    node: JsExpr,
) -> JsExpr {
    JsExpr::Member(JsMemberExpression {
        object: arena.alloc_expr(b::id("$$props")),
        property: match &node {
            JsExpr::Identifier(name) => JsMemberProperty::Identifier(name.clone()),
            _ => JsMemberProperty::Expression(arena.alloc_expr(node)),
        },
        computed: false,
        optional: false,
    })
}

/// Transform a prop read.
///
/// In legacy mode, props declared with `export let` become getter functions
/// via `$.prop()`. Reading them calls the getter: `foo` → `foo()`.
///
/// This is equivalent to `b.call` in the official compiler's transform.
fn prop_read(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    node: JsExpr,
) -> JsExpr {
    b::call(arena, node, vec![])
}

/// Transform a prop assignment.
///
/// Assigns a value to a prop getter by calling it with the value:
/// `foo = value` → `foo(value)`
///
/// # Arguments
///
/// * `node` - The prop identifier (e.g., `foo`)
/// * `value` - The value being assigned
/// * `_needs_proxy` - Whether the value needs to be proxified (not used for props)
fn prop_assign(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    node: JsExpr,
    value: JsExpr,
    _needs_proxy: bool,
) -> JsExpr {
    // Use Raw callee to prevent apply_transforms_to_expression from applying
    // the prop read transform (which would turn `items(value)` into `items()(value)`).
    let callee = match node {
        JsExpr::Identifier(ref name) => JsExpr::Raw(name.clone()),
        _ => node,
    };
    b::call(arena, callee, vec![value])
}

/// Transform a prop update expression (++ or --).
///
/// Transforms `x++` to `$.update_prop(x)` or `++x` to `$.update_pre_prop(x)`.
/// Transforms `x--` to `$.update_prop(x, -1)` or `--x` to `$.update_pre_prop(x, -1)`.
fn prop_update(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    operator: JsUpdateOp,
    argument: JsExpr,
    prefix: bool,
) -> JsExpr {
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

    b::svelte_call(arena, method, args)
}

/// Transform a regular prop mutation (passthrough).
///
/// For regular (non-bindable) props, mutations are passed through unchanged.
/// The prop transformation in the caller handles any necessary wrapping.
///
/// This corresponds to the reference implementation in Program.js:
/// ```js
/// mutate: (node, value) => {
///     return value; // passthrough for non-bindable prop
/// }
/// ```
///
/// # Arguments
///
/// * `_node` - The prop identifier (unused for passthrough)
/// * `mutation` - The mutation expression (returned as-is)
fn prop_mutate(
    _arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    _node: JsExpr,
    mutation: JsExpr,
) -> JsExpr {
    mutation
}

/// Transform a bindable prop mutation.
///
/// For bindable props, mutations must notify the parent component by calling
/// the prop function with the mutation result and `true` as a second argument:
/// `foo(mutation, true)`
///
/// This corresponds to the reference implementation in Program.js:
/// ```js
/// mutate: (node, value) => {
///     if (binding.kind === 'bindable_prop') return b.call(node, value, b.true);
/// }
/// ```
///
/// # Arguments
///
/// * `node` - The prop identifier (e.g., `foo`)
/// * `mutation` - The mutation expression (e.g., `foo()[0] = value`)
fn prop_bindable_mutate(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    node: JsExpr,
    mutation: JsExpr,
) -> JsExpr {
    // Use Raw callee to prevent apply_transforms_to_expression from applying
    // the prop read transform (which would turn `items(mutation, true)` into
    // `items()(mutation, true)`).
    let callee = match node {
        JsExpr::Identifier(ref name) => JsExpr::Raw(name.clone()),
        _ => node,
    };
    b::call(arena, callee, vec![mutation, b::boolean(true)])
}

// ============================================================================
// Reactive import transform functions
// ============================================================================

/// Transform a reactive import read.
///
/// The node will already be replaced with the `$$_import_X` identifier
/// (via the `replacement_id` mechanism). This function calls it:
/// `$$_import_X` -> `$$_import_X()`.
///
/// Corresponds to the official compiler's:
/// ```js
/// read: (_) => b.call(id)
/// ```
fn reactive_import_read(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    node: JsExpr,
) -> JsExpr {
    b::call(arena, node, vec![])
}

/// Transform a reactive import mutation.
///
/// The node will already be replaced with the `$$_import_X` identifier.
/// Mutations pass the mutation expression as the first argument:
/// `$$_import_X(mutation)`.
///
/// Corresponds to the official compiler's:
/// ```js
/// mutate: (_, mutation) => b.call(id, mutation)
/// ```
fn reactive_import_mutate(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    node: JsExpr,
    mutation: JsExpr,
) -> JsExpr {
    b::call(arena, node, vec![mutation])
}

/// Transform $$props reads to $$sanitized_props in legacy mode.
///
/// In legacy mode, $$props is replaced with $$sanitized_props which has
/// internal properties (children, $$slots, $$events, $$legacy) filtered out.
///
/// Corresponds to the official compiler's:
/// ```js
/// context.state.transform['$$props'] = {
///     read: (node) => ({ ...node, name: '$$sanitized_props' })
/// };
/// ```
fn sanitized_props_read(
    _arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    _node: JsExpr,
) -> JsExpr {
    JsExpr::Identifier("$$sanitized_props".into())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::CompileOptions;
    use crate::compiler::phases::phase2_analyze::scope::ScopeRoot;
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
        let parse_arena = crate::ast::arena::ParseArena::new();

        let state = ComponentClientTransformState::new(
            &parse_arena,
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
