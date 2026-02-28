//! EachBlock visitor for client-side transformation.
//!
//! This module handles the transformation of `{#each}` blocks into client-side
//! JavaScript code. It corresponds to
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/EachBlock.js`.
//!
//! # Overview
//!
//! The EachBlock visitor generates code for iterating over arrays and rendering
//! template nodes for each item. It handles:
//!
//! - Keyed and unkeyed each blocks
//! - Item and index reactivity
//! - Animate directives
//! - Fallback content
//! - Store invalidation
//! - Legacy mode reactivity
//!
//! # Generated Code
//!
//! For a simple each block like:
//!
//! ```svelte
//! {#each items as item}
//!   <div>{item}</div>
//! {/each}
//! ```
//!
//! This generates:
//!
//! ```js
//! $.each(anchor, flags, () => items, $.index, (anchor, item) => {
//!   // render item template
//! });
//! ```

#![allow(clippy::too_many_arguments)]

use crate::ast::js::Expression;
use crate::ast::template::{Attribute, EachBlock, Fragment, TemplateNode};
use crate::compiler::constants::*;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase3_transform::client::types::{
    ComponentContext, EachBindingContext,
};
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::fragment::fragment as visit_fragment_impl;
// Note: get_value from declarations is available if needed for reactive index/item access
use crate::compiler::phases::phase3_transform::client::types::ExpressionMetadata;
#[allow(unused_imports)]
use crate::compiler::phases::phase3_transform::client::visitors::shared::declarations::get_value;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::{
    add_svelte_meta, apply_transforms_to_expression, build_expression,
};
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use rustc_hash::FxHashMap;
use std::cell::Cell;
use std::rc::Rc;

/// Transform an EachBlock node into client-side JavaScript.
///
/// # Arguments
///
/// * `node` - The EachBlock AST node
/// * `context` - The component transformation context
///
/// # Implementation Notes
///
/// This function mirrors the JavaScript implementation in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/EachBlock.js`.
///
/// The implementation:
/// 1. Evaluates the collection expression in the parent scope
/// 2. Calculates flags for reactivity, animation, and control
/// 3. Sets up transforms for the item and index
/// 4. Generates the render function
/// 5. Wraps everything in $.each() or $.async() for async collections
pub fn each_block(node: &EachBlock, context: &mut ComponentContext) {
    let each_node_meta = &node.metadata;

    // Check if this each block should be treated as "controlled".
    // A controlled each block is one that is the only child of a static element.
    // This can be set either in the metadata (by analysis phase) or via the state flag
    // (set by fragment.rs process_children when it detects a single EachBlock child).
    let is_controlled = each_node_meta.is_controlled || context.state.is_controlled_each;

    // Reset the state flag after reading it
    context.state.is_controlled_each = false;

    // Expression should be evaluated in the parent scope, not the scope
    // created by the each block itself
    // Build the collection expression
    let collection = build_collection_expression(node, context);

    // Add comment placeholder for uncontrolled blocks
    if !is_controlled {
        context.state.template.push_comment(None);
    }

    // Calculate flags
    let mut flags = 0;

    // Index reactive flag - keyed each blocks with index make the index reactive
    if each_node_meta.keyed && node.index.is_some() {
        flags |= EACH_INDEX_REACTIVE;
    }

    // Check if key is the same as the item (optimization)
    let key_is_item = is_key_same_as_item(node);

    // Check if expression uses store subscriptions
    let uses_store = uses_store_subscription(each_node_meta, context);

    // Determine if items should be made reactive
    // Check if expression dependencies reference external state
    let has_external_deps = has_external_dependencies(each_node_meta, context);

    if has_external_deps && (!context.state.analysis.runes || !key_is_item || uses_store) {
        flags |= EACH_ITEM_REACTIVE;
    }

    // Item immutability flag (runes mode without store)
    if context.state.analysis.runes && !uses_store {
        flags |= EACH_ITEM_IMMUTABLE;
    }

    // Animation flag - check if any child has animate directive
    if has_animate_directive(node) {
        flags |= EACH_IS_ANIMATED;
    }

    // Controlled flag
    if is_controlled {
        flags |= EACH_IS_CONTROLLED;
    }

    // Determine store to invalidate
    let store_to_invalidate = get_store_to_invalidate(node, context);

    // Check if we need a collection ID (for scope shadowing)
    let collection_id = get_collection_id_if_needed(node, context);

    // Generate unique identifiers for index and item
    let index = generate_index_identifier(node, each_node_meta);
    let item = generate_item_identifier(node);

    // Track usage
    // In the JS implementation, uses_index is set to true dynamically when:
    //   1. The index variable is read in the body (transform read callback)
    //   2. The each item is assigned (transform assign callback, e.g. bind:value)
    //   3. The each item is mutated (transform mutate callback)
    // We use the each_index_used/each_index_name mechanism on ComponentClientTransformState
    // to detect case 1 during body traversal. For cases 2 and 3, we use
    // each_item_assign_or_mutate/each_item_names to detect item assign/mutate dynamically
    // during body traversal, matching the official compiler's closure-based approach.
    let mut uses_index = each_node_meta.contains_group_binding;

    // Determine if the key expression references the index variable.
    // In the official compiler, this is detected via a side-effect in key_state.transform[node.index].read.
    // We detect it by checking if the key expression's JSON contains an Identifier with the index name.
    let key_uses_index = if let (Some(key_expr), Some(index_name)) = (&node.key, &node.index) {
        expression_references_identifier(key_expr, index_name)
    } else {
        false
    };

    // Save the current transform map - each block creates a child scope for transforms
    // This prevents transforms registered for this block's item/index from leaking to
    // sibling each blocks. Reference: EachBlock.js lines 129-133
    let saved_transform = context.state.transform.clone();

    // Build declarations for the render function body
    // This will insert transforms for the item and index into context.state.transform
    let (declarations, destructured_update_paths) = build_declarations(
        node,
        context,
        &item,
        &index,
        flags,
        &collection,
        &collection_id,
        &store_to_invalidate,
        &mut uses_index,
    );

    // Set up index tracking before visiting the body.
    // Save the previous each_index state so we can restore it after (for nested each blocks).
    let saved_each_index_name = context.state.each_index_name.clone();
    // Save the Rc itself so we can restore the outer each's tracking Rc after body traversal
    let saved_each_index_used_rc = context.state.each_index_used.clone();

    // Set the current each block's index name and reset the used flag.
    // During body traversal, apply_transforms_to_expression_with_shadowed will
    // set each_index_used to true if the index identifier is encountered.
    if let Some(ref index_name) = node.index {
        // Push the OLD index name to the ancestor stack (if any) to allow
        // detecting when ancestor index variables are used in nested each bodies.
        // We push the OLD each_index_used Rc (not a reset copy) to the stack,
        // then replace each_index_used with a NEW Rc for the current each block.
        if let Some(ref old_index_name) = saved_each_index_name {
            // Push the existing (outer) Rc to the ancestor stack, so writes to it
            // during nested body traversal will be visible to the outer each block.
            context.state.ancestor_each_index_names.push((
                old_index_name.clone(),
                context.state.each_index_used.clone(),
            ));
        }
        context.state.each_index_name = Some(index_name.to_string());
        // Replace with a NEW Rc so the inner each doesn't share state with outer.
        // The outer Rc is now in the ancestor stack (if there was an outer index).
        context.state.each_index_used = ::std::rc::Rc::new(::std::cell::Cell::new(false));
    }

    // Set up item assign/mutate tracking before visiting the body.
    // Save the previous state so we can restore it after (for nested each blocks).
    let saved_each_item_names = context.state.each_item_names.clone();
    let saved_each_item_assign_or_mutate = context.state.each_item_assign_or_mutate.get();

    // Collect the item variable names from the context pattern.
    let mut item_names = Vec::new();
    if let Some(context_expr) = &node.context {
        let Expression::Value(val) = context_expr;
        if let serde_json::Value::Object(obj) = val {
            let ctx_type = obj.get("type").and_then(|v| v.as_str());
            if ctx_type == Some("Identifier") {
                if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                    item_names.push(name.to_string());
                }
            } else if ctx_type == Some("ObjectPattern") || ctx_type == Some("ArrayPattern") {
                collect_pattern_names(obj, &mut item_names);
            }
        }
    }
    context.state.each_item_names = item_names;
    context.state.each_item_assign_or_mutate.set(false);

    // Push the each binding context for legacy mode binding generation.
    // This allows bind_directive to generate correct getters/setters with
    // $.invalidate_inner_signals() when inside an each block.
    let item_reactive = (flags & EACH_ITEM_REACTIVE) != 0;
    let index_reactive = (flags & EACH_INDEX_REACTIVE) != 0;

    // Compute the item name
    let item_name = match &item {
        JsExpr::Identifier(name) => name.clone(),
        _ => "$$item".to_string(),
    };

    // Compute the index name
    let index_name_str = match &index {
        JsExpr::Identifier(name) => name.clone(),
        _ => "$$index".to_string(),
    };

    // Compute collection expression for invalidation
    let collection_expr_str = if let Some(ref coll_id) = collection_id {
        format!("{}()", coll_id)
    } else {
        // Generate the collection expression as a string
        crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr(&collection)
    };

    // Compute invalidation expressions from transitive deps
    // In the official compiler, transitive_deps come from analysis and contain the
    // bindings that need invalidation when an each item is mutated/assigned.
    // We use node.metadata.transitive_deps when available, falling back to the
    // collection expression or collection_id for simple cases.
    let mut invalidation_exprs = Vec::new();
    if !context.state.analysis.runes {
        if let Some(ref coll_id) = collection_id {
            // Collection is a prop ID - just call it
            invalidation_exprs.push(format!("{}()", coll_id));
        } else if !each_node_meta.transitive_deps.is_empty() {
            // Use the transitive_deps from analysis (proper dep tracking).
            // These contain the actual bindings that the collection depends on.
            // Apply transforms to get the proper getter expressions.
            use crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr;
            for binding_idx in &each_node_meta.transitive_deps {
                if let Some(binding) = context.state.scope_root.bindings.get(*binding_idx) {
                    // Skip EachItem/EachIndex bindings that belong to the CURRENT each
                    // block. These represent this block's own loop variables and should not
                    // appear in the invalidation expressions. However, EachItem/EachIndex
                    // bindings from PARENT each blocks are legitimate invalidation targets
                    // and should be kept.
                    if matches!(binding.kind, BindingKind::EachItem | BindingKind::EachIndex)
                        && (context.state.each_item_names.contains(&binding.name)
                            || Some(binding.name.clone())
                                == node.index.as_ref().map(|s| s.to_string()))
                    {
                        continue;
                    }
                    // Include bindings that are in transitive_deps for invalidation.
                    // If a binding has a read transform, apply it (e.g., $.get() for state,
                    // prop() for props). If no transform exists but the binding is in
                    // transitive_deps (e.g., import bindings), use the raw identifier since
                    // it still needs to be included in $.invalidate_inner_signals().
                    let expr = if let Some(transform) = context.state.transform.get(&binding.name) {
                        if let Some(read_fn) = &transform.read {
                            read_fn(b::id(&binding.name))
                        } else {
                            // Transform exists but no read fn - use raw identifier
                            b::id(&binding.name)
                        }
                    } else {
                        // No transform - use raw identifier for invalidation.
                        // Bindings listed in transitive_deps are there because
                        // the analysis determined they need invalidation (e.g., imports
                        // used as each block collections).
                        b::id(&binding.name)
                    };
                    let expr_str = generate_expr(&expr);
                    if !invalidation_exprs.contains(&expr_str) {
                        invalidation_exprs.push(expr_str);
                    }
                }
            }
        } else {
            // Fallback: use the collection expression as the invalidation target.
            // This is used when transitive_deps is empty (e.g., simple state variables).
            // The collection_expr_str already has transforms applied (e.g., prop()
            // calls for props, $.get() for state variables).
            invalidation_exprs.push(collection_expr_str.clone());
        }

        // Also add parent each block invalidation deps
        for parent_ctx in &context.state.each_binding_context {
            if !parent_ctx.is_runes {
                for dep in &parent_ctx.invalidation_exprs {
                    if !invalidation_exprs.contains(dep) {
                        invalidation_exprs.push(dep.clone());
                    }
                }
            }
        }
    }

    // Determine if the each item is reassigned (e.g., via bind:value).
    // We look up the EachItem binding directly from the scope root's all_scopes
    // to avoid getting the wrong binding (e.g., a same-named outer State variable).
    // The EachItem binding will have BindingKind::EachItem and the correct reassigned flag.
    let item_reassigned = if !context.state.analysis.runes {
        // Find the EachItem binding specifically (not just any binding with that name)
        let mut found_reassigned = false;
        for scope in &context.state.scope_root.all_scopes {
            if let Some(&binding_idx) = scope.declarations.get(item_name.as_str())
                && let Some(binding) = context.state.scope_root.bindings.get(binding_idx)
                && binding.kind == BindingKind::EachItem
            {
                found_reassigned = binding.reassigned;
                break;
            }
        }
        // Also check root scope
        if !found_reassigned
            && let Some(&binding_idx) = context
                .state
                .scope_root
                .scope
                .declarations
                .get(item_name.as_str())
            && let Some(binding) = context.state.scope_root.bindings.get(binding_idx)
            && binding.kind == BindingKind::EachItem
        {
            found_reassigned = binding.reassigned;
        }
        found_reassigned
    } else {
        false
    };

    // Determine if the context pattern is a simple Identifier (not destructured)
    let context_is_identifier = if let Some(context_expr) = &node.context {
        let Expression::Value(val) = context_expr;
        if let serde_json::Value::Object(obj) = val {
            obj.get("type").and_then(|v| v.as_str()) == Some("Identifier")
        } else {
            false
        }
    } else {
        false
    };

    let binding_used = Rc::new(Cell::new(false));
    context.state.each_binding_context.push(EachBindingContext {
        item_name: item_name.clone(),
        item_reactive,
        collection_expr: collection_expr_str.clone(),
        collection_id: collection_id.clone(),
        invalidation_exprs: invalidation_exprs.clone(),
        index_name: index_name_str.clone(),
        index_reactive,
        is_runes: context.state.analysis.runes,
        binding_used: binding_used.clone(),
        destructured_update_paths,
        contains_group_binding: each_node_meta.contains_group_binding,
        binding_group_name: each_node_meta.binding_group_name.clone(),
        store_to_invalidate: store_to_invalidate.clone(),
        item_reassigned,
        context_is_identifier,
    });

    // Visit the each block body to get the body block
    // The Fragment visitor handles template creation and hoisting
    let body_block = visit_fragment(&node.body, context);

    // Pop the each binding context
    context.state.each_binding_context.pop();

    // Check if bindings set the binding_used flag (meaning bind_directive generated
    // an each-block-aware setter that needs $$index).
    // IMPORTANT: In the official compiler, the assign/mutate transforms for destructured
    // patterns do NOT set uses_index = true. Only Identifier context patterns do.
    // So we only propagate binding_used to uses_index when context_is_identifier is true.
    if binding_used.get() && context_is_identifier {
        uses_index = true;
    }

    // After visiting the body, check if the index was actually used
    if node.index.is_some() && context.state.each_index_used.get() {
        uses_index = true;
    }

    // After visiting the body, check if the each item was assigned or mutated.
    // This mirrors the official Svelte compiler's dynamic approach where assign/mutate
    // transform callbacks set uses_index = true.
    // Only applies to Identifier contexts - destructured patterns don't set uses_index.
    if context.state.each_item_assign_or_mutate.get() && context_is_identifier {
        uses_index = true;
    }

    // Restore the previous each_index state (for nested each blocks)
    // Pop the ancestor stack if we pushed to it (when we had an ancestor index name)
    if node.index.is_some() && saved_each_index_name.is_some() {
        context.state.ancestor_each_index_names.pop();
    }
    context.state.each_index_name = saved_each_index_name;
    // Restore the OUTER Rc (which now has "was outer i used?" set by ancestor tracking)
    context.state.each_index_used = saved_each_index_used_rc;
    // Note: saved_each_index_used_rc already has the correct value from ancestor tracking

    // Restore the previous each_item state (for nested each blocks)
    context.state.each_item_names = saved_each_item_names;
    context
        .state
        .each_item_assign_or_mutate
        .set(saved_each_item_assign_or_mutate);

    // Restore the original transform map to prevent leaking to sibling blocks
    context.state.transform = saved_transform;

    // Build the key function
    let key_function = build_key_function(node, context, key_uses_index, &index);

    // Build render arguments: ($$anchor, item, [index], [collection_id])
    let render_args = build_render_args(&index, &item, uses_index, collection_id.as_ref());

    // Combine declarations and body statements
    // This matches JS: b.arrow(render_args, b.block(declarations.concat(block.body)))
    let mut render_body = declarations;
    render_body.extend(body_block.body);

    // Build the render function
    let render_fn = b::arrow_block(
        render_args.iter().map(convert_expr_to_pattern).collect(),
        render_body,
    );

    // Handle async expressions
    let is_async = node.metadata.expression.is_async();
    let has_await = node.metadata.expression.has_await();

    // Build the collection thunk
    let get_collection = if has_await {
        b::async_thunk(collection.clone())
    } else {
        b::thunk(collection.clone())
    };

    // For async expressions, wrap in $.get($$collection)
    let thunk = if is_async {
        b::thunk(b::call(
            b::member_path("$.get"),
            vec![b::id("$$collection")],
        ))
    } else {
        get_collection.clone()
    };

    // Build $.each() call arguments
    let mut each_args = vec![
        context.state.node.clone(),
        b::number(flags as f64),
        thunk,
        key_function,
        render_fn,
    ];

    // Add fallback function if present
    if let Some(fallback) = &node.fallback {
        let fallback_block = visit_fragment(fallback, context);
        let fallback_fn = b::arrow_block(vec![b::id_pattern("$$anchor")], fallback_block.body);
        each_args.push(fallback_fn);
    }

    // Build the $.each() call
    let each_call = b::call(b::member_path("$.each"), each_args);

    // Add svelte metadata
    let each_statement = add_svelte_meta(each_call);

    // Build statements to add to init
    let mut statements = vec![each_statement];

    // Add dev validation for keyed each blocks
    if context.state.dev && node.metadata.keyed {
        let validate_call = b::call(
            b::member_path("$.validate_each_keys"),
            vec![
                if is_async {
                    b::thunk(b::call(
                        b::member_path("$.get"),
                        vec![b::id("$$collection")],
                    ))
                } else {
                    get_collection.clone()
                },
                build_key_function(node, context, key_uses_index, &index),
            ],
        );
        statements.insert(0, b::stmt(validate_call));
    }

    // Handle async wrapping
    if is_async {
        // Get blockers from metadata (Phase 2 analysis)
        let blockers = b::array(vec![]); // TODO: Implement blockers from metadata

        // Create the collection getter array
        let collection_array = b::array(vec![get_collection]);

        // Extract anchor parameter
        let anchor_param = match &context.state.node {
            JsExpr::Identifier(name) => b::id_pattern(name),
            _ => b::id_pattern("$$anchor"),
        };

        // Create $.async() call
        let async_call = b::call(
            b::member_path("$.async"),
            vec![
                context.state.node.clone(),
                blockers,
                collection_array,
                b::arrow_block(
                    vec![anchor_param, b::id_pattern("$$collection")],
                    statements,
                ),
            ],
        );

        context.state.init.push(b::stmt(async_call));
    } else {
        // Not async - add statements directly
        for stmt in statements {
            context.state.init.push(stmt);
        }
    }
}

/// Build the collection expression in the parent scope.
fn build_collection_expression(node: &EachBlock, context: &mut ComponentContext) -> JsExpr {
    // Convert the AST expression to JsExpr using the expression converter
    let converted = convert_expression(&node.expression, context);

    // Build expression with proper reactivity handling
    let expr_metadata = ExpressionMetadata::from_template_metadata(&node.metadata.expression);

    build_expression(context, &converted, &expr_metadata)
}

/// Check if the key expression is the same as the item identifier.
fn is_key_same_as_item(node: &EachBlock) -> bool {
    let (Some(key), Some(context_expr)) = (&node.key, &node.context) else {
        return false;
    };

    // Both must be identifiers with the same name
    let Expression::Value(key_val) = key;
    let Expression::Value(ctx_val) = context_expr;

    let (serde_json::Value::Object(key_obj), serde_json::Value::Object(ctx_obj)) =
        (key_val, ctx_val)
    else {
        return false;
    };

    let key_type = key_obj.get("type").and_then(|v| v.as_str());
    let ctx_type = ctx_obj.get("type").and_then(|v| v.as_str());
    let key_name = key_obj.get("name").and_then(|v| v.as_str());
    let ctx_name = ctx_obj.get("name").and_then(|v| v.as_str());

    key_type == Some("Identifier") && ctx_type == Some("Identifier") && key_name == ctx_name
}

/// Check if the expression uses store subscriptions.
fn uses_store_subscription(
    metadata: &crate::ast::template::EachBlockMetadata,
    context: &ComponentContext,
) -> bool {
    // Check if any dependency is a store subscription
    for binding_idx in &metadata.expression.dependencies {
        if let Some(binding) = context.state.scope_root.bindings.get(*binding_idx)
            && matches!(binding.kind, BindingKind::StoreSub)
        {
            return true;
        }
    }
    false
}

/// Check if expression has external dependencies (references state outside the each block).
fn has_external_dependencies(
    metadata: &crate::ast::template::EachBlockMetadata,
    _context: &ComponentContext,
) -> bool {
    !metadata.expression.dependencies.is_empty()
}

/// Check if the each block has an animate directive on any direct child element.
fn has_animate_directive(node: &EachBlock) -> bool {
    if node.key.is_none() {
        return false;
    }

    for child in &node.body.nodes {
        match child {
            TemplateNode::RegularElement(elem) => {
                for attr in &elem.attributes {
                    if matches!(attr, Attribute::AnimateDirective(_)) {
                        return true;
                    }
                }
            }
            TemplateNode::SvelteElement(elem) => {
                for attr in &elem.attributes {
                    if matches!(attr, Attribute::AnimateDirective(_)) {
                        return true;
                    }
                }
            }
            _ => {}
        }
    }

    false
}

/// Get the store identifier that needs invalidation.
fn get_store_to_invalidate(node: &EachBlock, context: &ComponentContext) -> Option<String> {
    let obj_name = get_object_name(&node.expression)?;
    let binding = context.state.get_binding(&obj_name)?;
    if matches!(binding.kind, BindingKind::StoreSub) {
        Some(obj_name)
    } else {
        None
    }
}

/// Get the root object name from an expression.
fn get_object_name(expr: &Expression) -> Option<String> {
    match expr {
        Expression::Value(val) => {
            if let serde_json::Value::Object(obj) = val {
                match obj.get("type").and_then(|v| v.as_str()) {
                    Some("Identifier") => obj
                        .get("name")
                        .and_then(|v| v.as_str())
                        .map(|s| s.to_string()),
                    Some("MemberExpression") => {
                        if let Some(object) = obj.get("object") {
                            get_object_name(&Expression::Value(object.clone()))
                        } else {
                            None
                        }
                    }
                    // Handle LogicalExpression like `$items ?? []` by recursing into the left operand
                    Some("LogicalExpression") | Some("BinaryExpression") => {
                        if let Some(left) = obj.get("left") {
                            get_object_name(&Expression::Value(left.clone()))
                        } else {
                            None
                        }
                    }
                    _ => None,
                }
            } else {
                None
            }
        }
    }
}

/// Get a unique collection ID if the inner scope shadows outer scope variables.
///
/// Replicates the official compiler's logic:
/// ```js
/// for (const [name] of context.state.scope.declarations) {
///     if (context.state.scope.parent?.get(name) != null) {
///         collection_id = context.state.scope.root.unique('$$array');
///         break;
///     }
/// }
/// ```
///
/// `context.state.scope` is the each block's own scope (containing EachItem/EachIndex bindings).
/// We iterate its declarations and check if the parent scope has the same name.
/// We use the `template_scope_map` to look up the each block's scope by its start position,
/// then check each declaration against the parent scope using `get_binding()`.
fn get_collection_id_if_needed(node: &EachBlock, context: &ComponentContext) -> Option<String> {
    // Look up the each block's scope using its start position
    let each_scope_idx = context
        .state
        .scope_root
        .template_scope_map
        .get(&node.start)?;

    let each_scope = context.state.scope_root.all_scopes.get(*each_scope_idx)?;

    // Get the parent scope index - if there's no parent, no shadowing is possible
    let parent_scope_idx = each_scope.parent?;

    // Check if any declaration in the each block's scope also exists in the parent scope chain.
    // This mirrors the official compiler's logic:
    //   for (const [name] of context.state.scope.declarations) {
    //       if (context.state.scope.parent?.get(name) != null) { ... }
    //   }
    //
    // IMPORTANT: We cannot use `scope_root.get_binding()` here because `all_scopes[0]` (the root
    // scope) has ALL declarations from ALL scopes flattened into it for backward compatibility
    // (see scope_builder.rs lines ~199-212). Walking up to scope 0 would always find every name.
    // Instead, we walk up the parent chain manually and SKIP scope 0 since its declarations
    // are polluted. Scope 0 is the module scope (for `<script context="module">`) and in the
    // official compiler it would only contain module-level declarations, not function parameters
    // or nested scope variables.
    for name in each_scope.declarations.keys() {
        let mut walk_idx = Some(parent_scope_idx);
        while let Some(idx) = walk_idx {
            // Skip scope 0 - it has ALL declarations flattened into it
            if idx == 0 {
                break;
            }
            if let Some(scope) = context.state.scope_root.all_scopes.get(idx) {
                if scope.declarations.contains_key(name.as_str()) {
                    return Some("$$array".to_string());
                }
                walk_idx = scope.parent;
            } else {
                break;
            }
        }
    }

    None
}

/// Collect all binding names from a pattern (identifier, object pattern, array pattern).
fn collect_pattern_names(
    obj: &serde_json::Map<String, serde_json::Value>,
    names: &mut Vec<String>,
) {
    match obj.get("type").and_then(|v| v.as_str()) {
        Some("Identifier") => {
            if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                names.push(name.to_string());
            }
        }
        Some("ObjectPattern") => {
            if let Some(props) = obj.get("properties").and_then(|p| p.as_array()) {
                for prop in props {
                    if let Some(prop_obj) = prop.as_object()
                        && let Some(value) = prop_obj.get("value").and_then(|v| v.as_object())
                    {
                        collect_pattern_names(value, names);
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = obj.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if let Some(elem_obj) = elem.as_object() {
                        collect_pattern_names(elem_obj, names);
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = obj.get("left").and_then(|l| l.as_object()) {
                collect_pattern_names(left, names);
            }
        }
        Some("RestElement") => {
            if let Some(arg) = obj.get("argument").and_then(|a| a.as_object()) {
                collect_pattern_names(arg, names);
            }
        }
        _ => {}
    }
}

/// Generate the index identifier.
fn generate_index_identifier(
    node: &EachBlock,
    metadata: &crate::ast::template::EachBlockMetadata,
) -> JsExpr {
    if metadata.contains_group_binding {
        if let Some(ref index) = metadata.index {
            b::id(index)
        } else {
            b::id("$$index")
        }
    } else if let Some(ref index_name) = node.index {
        b::id(index_name.as_str())
    } else if let Some(ref index) = metadata.index {
        b::id(index)
    } else {
        b::id("$$index")
    }
}

/// Generate the item identifier.
fn generate_item_identifier(node: &EachBlock) -> JsExpr {
    if let Some(context_expr) = &node.context {
        let Expression::Value(val) = context_expr;
        if let serde_json::Value::Object(obj) = val
            && obj.get("type").and_then(|v| v.as_str()) == Some("Identifier")
            && let Some(name) = obj.get("name").and_then(|v| v.as_str())
        {
            return b::id(name);
        }
    }
    b::id("$$item")
}

/// Build declarations for the render function body.
///
/// This sets up transforms for item and index access with proper reactivity.
fn build_declarations(
    node: &EachBlock,
    context: &mut ComponentContext,
    _item: &JsExpr,
    index: &JsExpr,
    flags: i32,
    _collection: &JsExpr,
    collection_id: &Option<String>,
    store_to_invalidate: &Option<String>,
    _uses_index: &mut bool,
) -> (Vec<JsStatement>, FxHashMap<String, String>) {
    let mut declarations = Vec::new();
    let mut destructured_update_paths: FxHashMap<String, String> = FxHashMap::default();

    // Build the invalidate_store call if needed
    let invalidate_store = store_to_invalidate.as_ref().map(|store_name| {
        b::call(
            b::member_path("$.invalidate_store"),
            vec![b::id("$$stores"), b::string(store_name)],
        )
    });

    // Build sequence for mutations (for legacy mode reactivity)
    let mut sequence: Vec<JsExpr> = Vec::new();

    // Handle legacy mode transitive dependencies
    if !context.state.analysis.runes {
        let mut transitive_deps: Vec<JsExpr> = Vec::new();

        if let Some(coll_id) = collection_id {
            transitive_deps.push(b::call(b::id(coll_id), vec![]));
        } else {
            for binding_idx in &node.metadata.transitive_deps {
                if let Some(binding) = context.state.scope_root.bindings.get(*binding_idx) {
                    // Apply transforms (e.g., $.get() for state variables)
                    let expr = if let Some(transform) = context.state.transform.get(&binding.name) {
                        if let Some(read_fn) = &transform.read {
                            read_fn(b::id(&binding.name))
                        } else {
                            b::id(&binding.name)
                        }
                    } else {
                        b::id(&binding.name)
                    };
                    transitive_deps.push(expr);
                }
            }
        }

        for parent_node in &context.path {
            if let TemplateNode::EachBlock(parent_each) = parent_node {
                for binding_idx in &parent_each.metadata.transitive_deps {
                    if let Some(binding) = context.state.scope_root.bindings.get(*binding_idx) {
                        // Apply transforms (e.g., $.get() for state variables)
                        let expr =
                            if let Some(transform) = context.state.transform.get(&binding.name) {
                                if let Some(read_fn) = &transform.read {
                                    read_fn(b::id(&binding.name))
                                } else {
                                    b::id(&binding.name)
                                }
                            } else {
                                b::id(&binding.name)
                            };
                        transitive_deps.push(expr);
                    }
                }
            }
        }

        if !transitive_deps.is_empty() {
            let invalidate_call = b::call(
                b::member_path("$.invalidate_inner_signals"),
                vec![b::thunk(b::sequence(transitive_deps))],
            );
            sequence.push(invalidate_call);
        }
    }

    if let Some(inv_store) = invalidate_store {
        sequence.push(inv_store);
    }

    use crate::compiler::phases::phase3_transform::client::types::IdentifierTransform;

    // Handle index transform
    if let Some(index_name) = &node.index {
        let index_reactive = (flags & EACH_INDEX_REACTIVE) != 0;
        context.state.transform.insert(
            index_name.to_string(),
            IdentifierTransform {
                read_source: None,
                read: if index_reactive {
                    Some(|node| b::call(b::member_path("$.get"), vec![node]))
                } else {
                    None
                },
                assign: None,
                mutate: None,
                update: None,
                skip_proxy: false,
                is_defined: true,
                is_reactive: index_reactive,
                replacement_id: None,
            },
        );
    }

    // Handle simple identifier context
    if let Some(context_expr) = &node.context {
        let Expression::Value(val) = context_expr;
        if let serde_json::Value::Object(obj) = val
            && obj.get("type").and_then(|v| v.as_str()) == Some("Identifier")
            && let Some(name) = obj.get("name").and_then(|v| v.as_str())
        {
            let item_reactive = (flags & EACH_ITEM_REACTIVE) != 0;

            if item_reactive {
                context.state.transform.insert(
                    name.to_string(),
                    IdentifierTransform {
                        read_source: None,
                        read: Some(|node| b::call(b::member_path("$.get"), vec![node])),
                        assign: None,
                        mutate: None,
                        update: None,
                        skip_proxy: false,
                        is_defined: false,
                        is_reactive: true,
                        replacement_id: None,
                    },
                );
            }

            if node.index.is_some()
                && node.metadata.contains_group_binding
                && let JsExpr::Identifier(idx_name) = index
                && let Some(original_index) = &node.index
                && idx_name != original_index.as_str()
            {
                declarations.push(b::let_decl(original_index.as_str(), Some(index.clone())));
            }
        }
    }

    // Handle destructured context pattern (e.g., {#each items as { a, b }} or {#each items as [a, b]})
    // This corresponds to lines 251-293 in the official EachBlock.js
    if let Some(context_expr) = &node.context {
        let Expression::Value(val) = context_expr;
        if let serde_json::Value::Object(obj) = val {
            let ctx_type = obj.get("type").and_then(|v| v.as_str());

            if ctx_type == Some("ObjectPattern") || ctx_type == Some("ArrayPattern") {
                let item_reactive = (flags & EACH_ITEM_REACTIVE) != 0;

                let unwrapped_item = if item_reactive {
                    "$.get($$item)".to_string()
                } else {
                    "$$item".to_string()
                };

                // Extract paths using the new extract_destructured_paths that handles
                // ArrayPattern with $.to_array() inserts and computed ObjectPattern keys
                let mut array_counter: usize = 0;
                let (paths, inserts) =
                    extract_destructured_paths(obj, &unwrapped_item, false, &mut array_counter);

                // Generate intermediate array declarations for ArrayPattern destructuring
                // This corresponds to lines 256-262 in the official EachBlock.js
                for insert in &inserts {
                    declarations.push(JsStatement::Raw(format!(
                        "var {} = $.derived(() => {});",
                        insert.id, insert.value
                    )));

                    context.state.transform.insert(
                        insert.id.clone(),
                        IdentifierTransform {
                            read_source: None,
                            read: Some(|node| b::call(b::member_path("$.get"), vec![node])),
                            assign: None,
                            mutate: None,
                            update: None,
                            skip_proxy: false,
                            is_defined: false,
                            is_reactive: true,
                            replacement_id: None,
                        },
                    );
                }

                // For each path, create a getter declaration
                for mut path in paths {
                    // If this path has a deferred computed key, convert it now
                    // using the proper expression pipeline (which applies transforms
                    // for previously-registered destructured variables like length -> length())
                    if let (Some(base_expr), Some(key_json)) =
                        (path.computed_key_base.take(), path.computed_key_json.take())
                    {
                        let key_expr = convert_expression(&Expression::Value(key_json), context);
                        // Apply transforms so identifiers like `length` become `length()`
                        let transformed_key = apply_transforms_to_expression(&key_expr, context);
                        let key_str = crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr(&transformed_key);
                        let new_expr = format!("{}[{}]", base_expr, key_str);
                        path.expression = new_expr.clone();
                        path.update_expression = new_expr;
                    }

                    // Track the update_expression for bind_directive to use in setters
                    destructured_update_paths
                        .insert(path.name.clone(), path.update_expression.clone());

                    if path.has_default_value {
                        let fallback_expr = build_fallback_expression(
                            &path.expression,
                            path.default_value.as_ref(),
                            context,
                        );
                        declarations.push(JsStatement::Raw(format!(
                            "let {} = $.derived_safe_equal(() => {});",
                            path.name, fallback_expr
                        )));

                        context.state.transform.insert(
                            path.name.clone(),
                            IdentifierTransform {
                                read_source: None,
                                read: Some(|node| b::call(b::member_path("$.get"), vec![node])),
                                assign: None,
                                mutate: None,
                                update: None,
                                skip_proxy: false,
                                is_defined: false,
                                is_reactive: true,
                                replacement_id: None,
                            },
                        );
                    } else {
                        declarations.push(JsStatement::Raw(format!(
                            "let {} = () => {};",
                            path.name, path.expression
                        )));

                        context.state.transform.insert(
                            path.name.clone(),
                            IdentifierTransform {
                                read_source: None,
                                read: Some(|node| b::call(node, vec![])),
                                assign: None,
                                mutate: None,
                                update: None,
                                skip_proxy: false,
                                is_defined: false,
                                is_reactive: true,
                                replacement_id: None,
                            },
                        );
                    }
                }
            }
        }
    }

    (declarations, destructured_update_paths)
}

/// Information about a destructured path from a pattern.
struct DestructuredPath {
    /// The binding name
    name: String,
    /// The expression to access the value (may include $.fallback for defaults)
    expression: String,
    /// The expression for writing back (without $.fallback, used as assignment LHS)
    update_expression: String,
    /// Whether this path has a default value (from AssignmentPattern)
    has_default_value: bool,
    /// The default value expression JSON (if has_default_value is true)
    default_value: Option<serde_json::Value>,
    /// The base expression before the computed key (for deferred key conversion)
    /// When set, expression contains a placeholder that needs to be replaced after transforms are registered
    computed_key_base: Option<String>,
    /// The raw JSON AST for the computed key expression (for deferred conversion)
    computed_key_json: Option<serde_json::Value>,
}

/// Information about an intermediate array declaration (for ArrayPattern destructuring).
/// Corresponds to the `inserts` array in the official compiler's `extract_paths`.
struct ArrayInsert {
    /// The unique identifier name (e.g., "$$array", "$$array_1")
    id: String,
    /// The value expression (e.g., "$.to_array($.get($$item), 2)")
    value: String,
}

/// Extract property paths from a destructuring pattern.
/// Returns (paths, inserts) where inserts are intermediate array declarations.
///
/// This mirrors the official compiler's `extract_paths` / `_extract_paths` in
/// `svelte/packages/svelte/src/compiler/utils/ast.js`.
fn extract_destructured_paths(
    obj: &serde_json::Map<String, serde_json::Value>,
    base_expr: &str,
    has_parent_default: bool,
    array_counter: &mut usize,
) -> (Vec<DestructuredPath>, Vec<ArrayInsert>) {
    let mut paths = Vec::new();
    let mut inserts = Vec::new();

    _extract_destructured_paths(
        &mut paths,
        &mut inserts,
        obj,
        base_expr,
        base_expr,
        has_parent_default,
        array_counter,
    );

    (paths, inserts)
}

/// Internal recursive function for extracting destructured paths.
fn _extract_destructured_paths(
    paths: &mut Vec<DestructuredPath>,
    inserts: &mut Vec<ArrayInsert>,
    param: &serde_json::Map<String, serde_json::Value>,
    expression: &str,
    _update_expression: &str,
    has_default_value: bool,
    array_counter: &mut usize,
) {
    match param.get("type").and_then(|v| v.as_str()) {
        Some("Identifier") => {
            let name = param
                .get("name")
                .and_then(|n| n.as_str())
                .unwrap_or("$$unknown");
            paths.push(DestructuredPath {
                name: name.to_string(),
                expression: expression.to_string(),
                update_expression: _update_expression.to_string(),
                has_default_value,
                default_value: None,
                computed_key_base: None,
                computed_key_json: None,
            });
        }
        Some("ObjectPattern") => {
            if let Some(props) = param.get("properties").and_then(|p| p.as_array()) {
                for prop in props {
                    if let Some(prop_obj) = prop.as_object() {
                        let prop_type = prop_obj.get("type").and_then(|v| v.as_str());

                        if prop_type == Some("RestElement") {
                            // RestElement in ObjectPattern: ...rest
                            // Generate: $.exclude_from_object(expression, ['key1', 'key2', ...])
                            let mut excluded_keys: Vec<String> = Vec::new();
                            for p in props {
                                if let Some(p_obj) = p.as_object()
                                    && p_obj.get("type").and_then(|t| t.as_str())
                                        == Some("Property")
                                    && let Some(key) = p_obj.get("key").and_then(|k| k.as_object())
                                {
                                    let key_type = key.get("type").and_then(|t| t.as_str());
                                    let computed = p_obj
                                        .get("computed")
                                        .and_then(|c| c.as_bool())
                                        .unwrap_or(false);

                                    if key_type == Some("Identifier")
                                        && !computed
                                        && let Some(name) = key.get("name").and_then(|n| n.as_str())
                                    {
                                        excluded_keys.push(format!("'{}'", name));
                                    } else if key_type == Some("Literal") {
                                        // Match official compiler: b.literal(String(p.key.value))
                                        if let Some(val) = key.get("value") {
                                            let val_str = match val {
                                                serde_json::Value::String(s) => s.clone(),
                                                serde_json::Value::Number(n) => {
                                                    // Match JS String(value) behavior:
                                                    // integers like 16 become "16", not "16.0"
                                                    if let Some(i) = n.as_i64() {
                                                        i.to_string()
                                                    } else if let Some(f) = n.as_f64() {
                                                        // Check if the float is actually an integer
                                                        if f.fract() == 0.0
                                                            && f.abs() < i64::MAX as f64
                                                        {
                                                            (f as i64).to_string()
                                                        } else {
                                                            n.to_string()
                                                        }
                                                    } else {
                                                        n.to_string()
                                                    }
                                                }
                                                serde_json::Value::Bool(b) => b.to_string(),
                                                _ => format!("{}", val),
                                            };
                                            excluded_keys.push(format!("'{}'", val_str));
                                        }
                                    } else if computed {
                                        // Match official compiler: b.call('String', p.key)
                                        // For computed keys, wrap in String() call
                                        let key_str = format_json_expr_for_key(key);
                                        excluded_keys.push(format!("String({})", key_str));
                                    }
                                }
                            }

                            let rest_expression = format!(
                                "$.exclude_from_object({}, [{}])",
                                expression,
                                excluded_keys.join(", ")
                            );

                            if let Some(arg) = prop_obj.get("argument").and_then(|a| a.as_object())
                            {
                                let arg_type = arg.get("type").and_then(|t| t.as_str());
                                if arg_type == Some("Identifier") {
                                    let name = arg
                                        .get("name")
                                        .and_then(|n| n.as_str())
                                        .unwrap_or("$$unknown");
                                    paths.push(DestructuredPath {
                                        name: name.to_string(),
                                        expression: rest_expression.clone(),
                                        update_expression: rest_expression,
                                        has_default_value,
                                        default_value: None,
                                        computed_key_base: None,
                                        computed_key_json: None,
                                    });
                                } else {
                                    _extract_destructured_paths(
                                        paths,
                                        inserts,
                                        arg,
                                        &rest_expression,
                                        &rest_expression,
                                        has_default_value,
                                        array_counter,
                                    );
                                }
                            }
                        } else if prop_type == Some("Property") {
                            let key = prop_obj.get("key").and_then(|k| k.as_object());
                            let value = prop_obj.get("value");
                            let computed = prop_obj
                                .get("computed")
                                .and_then(|c| c.as_bool())
                                .unwrap_or(false);

                            if let (Some(key_obj), Some(value)) = (key, value) {
                                let key_type = key_obj.get("type").and_then(|t| t.as_str());

                                // Build the property access expression
                                // If computed or key is not Identifier, use bracket notation
                                let (prop_expr, deferred_key) = if computed {
                                    // For computed keys, use format_json_expr_for_key as a
                                    // best-effort initial value, but also store the raw JSON
                                    // for later re-conversion with proper transforms
                                    let key_expr_str = format_json_expr_for_key(key_obj);
                                    (
                                        format!("{}[{}]", expression, key_expr_str),
                                        Some((
                                            expression.to_string(),
                                            serde_json::Value::Object(key_obj.clone()),
                                        )),
                                    )
                                } else if key_type != Some("Identifier") {
                                    let key_expr_str = format_json_expr_for_key(key_obj);
                                    (format!("{}[{}]", expression, key_expr_str), None)
                                } else {
                                    let key_name = key_obj
                                        .get("name")
                                        .and_then(|n| n.as_str())
                                        .unwrap_or("unknown");
                                    (format!("{}.{}", expression, key_name), None)
                                };

                                if let Some(value_obj) = value.as_object() {
                                    let paths_before = paths.len();
                                    _extract_destructured_paths(
                                        paths,
                                        inserts,
                                        value_obj,
                                        &prop_expr,
                                        &prop_expr,
                                        has_default_value,
                                        array_counter,
                                    );
                                    // Tag any newly-created paths with the deferred computed key info
                                    if let Some((base, key_json)) = deferred_key {
                                        for path in &mut paths[paths_before..] {
                                            path.computed_key_base = Some(base.clone());
                                            path.computed_key_json = Some(key_json.clone());
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            // For ArrayPattern, create an intermediate declaration to convert
            // iterables to arrays. This matches the official compiler.
            let elements = match param.get("elements").and_then(|e| e.as_array()) {
                Some(e) => e,
                None => return,
            };

            // Generate unique $$array name
            let array_id = if *array_counter == 0 {
                "$$array".to_string()
            } else {
                format!("$$array_{}", array_counter)
            };
            *array_counter += 1;

            // Check if last element is RestElement
            let last_is_rest = elements
                .last()
                .and_then(|e| e.as_object())
                .and_then(|o| o.get("type").and_then(|t| t.as_str()))
                == Some("RestElement");

            // Build the $.to_array() call expression
            let to_array_expr = if last_is_rest {
                format!("$.to_array({})", expression)
            } else {
                format!("$.to_array({}, {})", expression, elements.len())
            };

            inserts.push(ArrayInsert {
                id: array_id.clone(),
                value: to_array_expr,
            });

            // Process each element using the array_id as the base
            for (i, elem) in elements.iter().enumerate() {
                if elem.is_null() {
                    continue;
                }

                if let Some(elem_obj) = elem.as_object() {
                    let elem_type = elem_obj.get("type").and_then(|v| v.as_str());

                    if elem_type == Some("RestElement") {
                        // RestElement: ...rest => $.get($$array).slice(i)
                        let rest_expression = format!("$.get({}).slice({})", array_id, i);

                        if let Some(arg) = elem_obj.get("argument").and_then(|a| a.as_object()) {
                            let arg_type = arg.get("type").and_then(|t| t.as_str());
                            if arg_type == Some("Identifier") {
                                let name = arg
                                    .get("name")
                                    .and_then(|n| n.as_str())
                                    .unwrap_or("$$unknown");
                                paths.push(DestructuredPath {
                                    name: name.to_string(),
                                    expression: rest_expression.clone(),
                                    update_expression: rest_expression,
                                    has_default_value,
                                    default_value: None,
                                    computed_key_base: None,
                                    computed_key_json: None,
                                });
                            } else {
                                _extract_destructured_paths(
                                    paths,
                                    inserts,
                                    arg,
                                    &rest_expression,
                                    &rest_expression,
                                    has_default_value,
                                    array_counter,
                                );
                            }
                        }
                    } else {
                        // Regular element: $.get($$array)[i]
                        let array_expression = format!("$.get({})[{}]", array_id, i);

                        _extract_destructured_paths(
                            paths,
                            inserts,
                            elem_obj,
                            &array_expression,
                            &array_expression,
                            has_default_value,
                            array_counter,
                        );
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            // Default value pattern: { a = default } or [a = default]
            if let Some(left) = param.get("left").and_then(|l| l.as_object()) {
                let left_type = left.get("type").and_then(|t| t.as_str());
                let default_val = param.get("right").cloned();

                if left_type == Some("Identifier") {
                    let name = left
                        .get("name")
                        .and_then(|n| n.as_str())
                        .unwrap_or("$$unknown");
                    paths.push(DestructuredPath {
                        name: name.to_string(),
                        expression: expression.to_string(),
                        update_expression: _update_expression.to_string(),
                        has_default_value: true,
                        default_value: default_val,
                        computed_key_base: None,
                        computed_key_json: None,
                    });
                } else {
                    _extract_destructured_paths(
                        paths,
                        inserts,
                        left,
                        expression,
                        _update_expression,
                        true,
                        array_counter,
                    );
                }
            }
        }
        _ => {}
    }
}

/// Format a JSON key expression for use in computed property access.
fn format_json_expr_for_key(key_obj: &serde_json::Map<String, serde_json::Value>) -> String {
    let key_type = key_obj.get("type").and_then(|t| t.as_str());

    match key_type {
        Some("Identifier") => key_obj
            .get("name")
            .and_then(|n| n.as_str())
            .unwrap_or("unknown")
            .to_string(),
        Some("Literal") => {
            if let Some(raw) = key_obj.get("raw").and_then(|r| r.as_str()) {
                raw.to_string()
            } else if let Some(val) = key_obj.get("value") {
                match val {
                    serde_json::Value::Number(n) => n.to_string(),
                    serde_json::Value::String(s) => format!("'{}'", s),
                    _ => "null".to_string(),
                }
            } else {
                "null".to_string()
            }
        }
        Some("CallExpression") => {
            let callee = key_obj.get("callee");
            let args = key_obj
                .get("arguments")
                .and_then(|a| a.as_array())
                .cloned()
                .unwrap_or_default();

            let callee_str = if let Some(callee_val) = callee {
                if let Some(callee_obj) = callee_val.as_object() {
                    format_json_expr_for_key(callee_obj)
                } else {
                    "unknown".to_string()
                }
            } else {
                "unknown".to_string()
            };

            let args_str: Vec<String> = args
                .iter()
                .map(|a| {
                    if let Some(obj) = a.as_object() {
                        format_json_expr_for_key(obj)
                    } else if let Some(s) = a.as_str() {
                        format!("'{}'", s)
                    } else {
                        format!("{}", a)
                    }
                })
                .collect();

            format!("{}({})", callee_str, args_str.join(", "))
        }
        Some("MemberExpression") => {
            let object = key_obj.get("object").and_then(|o| o.as_object());
            let property = key_obj.get("property").and_then(|p| p.as_object());
            let computed = key_obj
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false);

            let obj_str = object.map_or("unknown".to_string(), format_json_expr_for_key);
            let prop_str = property.map_or("unknown".to_string(), format_json_expr_for_key);

            if computed {
                format!("{}[{}]", obj_str, prop_str)
            } else {
                format!("{}.{}", obj_str, prop_str)
            }
        }
        Some("BinaryExpression") => {
            let left = key_obj.get("left").and_then(|l| l.as_object());
            let right = key_obj.get("right").and_then(|r| r.as_object());
            let operator = key_obj
                .get("operator")
                .and_then(|o| o.as_str())
                .unwrap_or("+");

            let left_str = left.map_or("unknown".to_string(), format_json_expr_for_key);
            let right_str = right.map_or("unknown".to_string(), format_json_expr_for_key);

            format!("{} {} {}", left_str, operator, right_str)
        }
        Some("UnaryExpression") => {
            let argument = key_obj.get("argument").and_then(|a| a.as_object());
            let operator = key_obj
                .get("operator")
                .and_then(|o| o.as_str())
                .unwrap_or("-");
            let prefix = key_obj
                .get("prefix")
                .and_then(|p| p.as_bool())
                .unwrap_or(true);

            let arg_str = argument.map_or("unknown".to_string(), format_json_expr_for_key);

            if prefix {
                format!("{}{}", operator, arg_str)
            } else {
                format!("{}{}", arg_str, operator)
            }
        }
        Some("ConditionalExpression") => {
            let test = key_obj.get("test").and_then(|t| t.as_object());
            let consequent = key_obj.get("consequent").and_then(|c| c.as_object());
            let alternate = key_obj.get("alternate").and_then(|a| a.as_object());

            let test_str = test.map_or("unknown".to_string(), format_json_expr_for_key);
            let cons_str = consequent.map_or("unknown".to_string(), format_json_expr_for_key);
            let alt_str = alternate.map_or("unknown".to_string(), format_json_expr_for_key);

            format!("{} ? {} : {}", test_str, cons_str, alt_str)
        }
        Some("TemplateLiteral") => {
            // Simple template literal support
            let quasis = key_obj
                .get("quasis")
                .and_then(|q| q.as_array())
                .cloned()
                .unwrap_or_default();
            let expressions = key_obj
                .get("expressions")
                .and_then(|e| e.as_array())
                .cloned()
                .unwrap_or_default();

            let mut result = String::from("`");
            for (i, quasi) in quasis.iter().enumerate() {
                if let Some(raw) = quasi
                    .as_object()
                    .and_then(|q| q.get("value"))
                    .and_then(|v| v.as_object())
                    .and_then(|v| v.get("raw"))
                    .and_then(|r| r.as_str())
                {
                    result.push_str(raw);
                }
                if i < expressions.len() {
                    result.push_str("${");
                    if let Some(expr_obj) = expressions[i].as_object() {
                        result.push_str(&format_json_expr_for_key(expr_obj));
                    }
                    result.push('}');
                }
            }
            result.push('`');
            result
        }
        _ => "unknown".to_string(),
    }
}

/// Build a $.fallback(expression, default) call expression as a string.
fn build_fallback_expression(
    expression: &str,
    default_value: Option<&serde_json::Value>,
    context: &mut ComponentContext,
) -> String {
    if let Some(default_val) = default_value {
        if is_simple_default(default_val) {
            let default_expr = convert_expression(&Expression::Value(default_val.clone()), context);
            let default_expr = apply_transforms_to_expression(&default_expr, context);
            let default_str =
                crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr(
                    &default_expr,
                );
            format!("$.fallback({}, {})", expression, default_str)
        } else if let Some(obj) = default_val.as_object()
            && obj.get("type").and_then(|t| t.as_str()) == Some("CallExpression")
            && obj
                .get("arguments")
                .and_then(|a| a.as_array())
                .is_some_and(|a| a.is_empty())
            && let Some(callee) = obj.get("callee").and_then(|c| c.as_object())
            && callee.get("type").and_then(|t| t.as_str()) == Some("Identifier")
        {
            let callee_expr = convert_expression(
                &Expression::Value(serde_json::Value::Object(callee.clone())),
                context,
            );
            let callee_expr = apply_transforms_to_expression(&callee_expr, context);
            let callee_str =
                crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr(
                    &callee_expr,
                );
            format!("$.fallback({}, {}, true)", expression, callee_str)
        } else {
            let default_expr = convert_expression(&Expression::Value(default_val.clone()), context);
            let default_expr = apply_transforms_to_expression(&default_expr, context);
            let default_str =
                crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr(
                    &default_expr,
                );
            format!("$.fallback({}, () => {}, true)", expression, default_str)
        }
    } else {
        expression.to_string()
    }
}

/// Check if a default value expression is "simple" (doesn't need thunking in $.fallback).
fn is_simple_default(value: &serde_json::Value) -> bool {
    let obj = match value.as_object() {
        Some(o) => o,
        None => return true,
    };

    let expr_type = match obj.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return true,
    };

    match expr_type {
        "Literal" | "Identifier" | "ArrowFunctionExpression" | "FunctionExpression" => true,
        "ConditionalExpression" => {
            obj.get("test").map(is_simple_default).unwrap_or(true)
                && obj.get("consequent").map(is_simple_default).unwrap_or(true)
                && obj.get("alternate").map(is_simple_default).unwrap_or(true)
        }
        "BinaryExpression" | "LogicalExpression" => {
            obj.get("left").map(is_simple_default).unwrap_or(true)
                && obj.get("right").map(is_simple_default).unwrap_or(true)
        }
        "UnaryExpression" => obj.get("argument").map(is_simple_default).unwrap_or(true),
        _ => false,
    }
}

/// Build the key function for the each block.
fn build_key_function(
    node: &EachBlock,
    context: &mut ComponentContext,
    key_uses_index: bool,
    index: &JsExpr,
) -> JsExpr {
    if node.metadata.keyed
        && let Some(key) = &node.key
    {
        let key_expr = convert_expression(key, context);
        // Apply state transforms so that prop references like `id` become `id()`
        let key_expr = crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression(&key_expr, context);

        if let Some(context_expr) = &node.context {
            let pattern = convert_expression_to_pattern(context_expr);

            let params = if key_uses_index {
                vec![pattern, convert_expr_to_pattern(index)]
            } else {
                vec![pattern]
            };

            return b::arrow(params, key_expr);
        }
    }

    b::member_path("$.index")
}

/// Check if an expression references an identifier with the given name.
/// This recursively inspects the JSON AST of the expression.
fn expression_references_identifier(expr: &Expression, name: &str) -> bool {
    let Expression::Value(val) = expr;
    json_value_references_identifier(val, name)
}

/// Check if a JSON value (AST node) references an identifier with the given name.
fn json_value_references_identifier(val: &serde_json::Value, name: &str) -> bool {
    match val {
        serde_json::Value::Object(obj) => {
            // Check if this node is an Identifier with the matching name
            if let Some(serde_json::Value::String(node_type)) = obj.get("type")
                && node_type == "Identifier"
                && let Some(serde_json::Value::String(id_name)) = obj.get("name")
                && id_name == name
            {
                return true;
            }
            // Recursively check all values in the object
            for (key, child) in obj {
                // Skip position/location fields
                if key == "start" || key == "end" || key == "loc" || key == "type" {
                    continue;
                }
                if json_value_references_identifier(child, name) {
                    return true;
                }
            }
            false
        }
        serde_json::Value::Array(arr) => arr
            .iter()
            .any(|v| json_value_references_identifier(v, name)),
        _ => false,
    }
}

/// Build the render arguments ($$anchor, item, [index], [collection_id]).
fn build_render_args(
    index: &JsExpr,
    item: &JsExpr,
    uses_index: bool,
    collection_id: Option<&String>,
) -> Vec<JsExpr> {
    let mut args = vec![b::id("$$anchor"), item.clone()];

    if uses_index || collection_id.is_some() {
        args.push(index.clone());
    }

    if let Some(id) = collection_id {
        args.push(b::id(id));
    }

    args
}

/// Visit a fragment and return its block statement.
fn visit_fragment(fragment: &Fragment, context: &mut ComponentContext) -> JsBlockStatement {
    visit_fragment_impl(fragment, context, true)
}

/// Convert an AST Expression to a JsPattern.
fn convert_expression_to_pattern(expr: &Expression) -> JsPattern {
    let Expression::Value(val) = expr;
    if let serde_json::Value::Object(obj) = val {
        match obj.get("type").and_then(|v| v.as_str()) {
            Some("Identifier") => {
                if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                    return JsPattern::Identifier(name.to_string());
                }
            }
            Some("ObjectPattern") => {
                if let Some(props) = obj.get("properties").and_then(|p| p.as_array()) {
                    let properties = props
                        .iter()
                        .filter_map(|prop| {
                            let prop_obj = prop.as_object()?;
                            let key = prop_obj.get("key")?.as_object()?;
                            let key_name = key.get("name")?.as_str()?;
                            let value = prop_obj.get("value")?;

                            let value_pattern = if value.is_object() {
                                convert_expression_to_pattern(&Expression::Value(value.clone()))
                            } else {
                                JsPattern::Identifier(key_name.to_string())
                            };

                            let shorthand = prop_obj
                                .get("shorthand")
                                .and_then(|s| s.as_bool())
                                .unwrap_or(false);

                            Some(JsObjectPatternProperty::Property {
                                key: JsPropertyKey::Identifier(key_name.to_string()),
                                value: value_pattern,
                                computed: false,
                                shorthand,
                            })
                        })
                        .collect();

                    return JsPattern::Object(JsObjectPattern { properties });
                }
            }
            Some("ArrayPattern") => {
                if let Some(elems) = obj.get("elements").and_then(|e| e.as_array()) {
                    let elements = elems
                        .iter()
                        .map(|elem| {
                            if elem.is_null() {
                                None
                            } else {
                                Some(convert_expression_to_pattern(&Expression::Value(
                                    elem.clone(),
                                )))
                            }
                        })
                        .collect();

                    return JsPattern::Array(JsArrayPattern { elements });
                }
            }
            Some("RestElement") => {
                if let Some(arg) = obj.get("argument") {
                    let inner = convert_expression_to_pattern(&Expression::Value(arg.clone()));
                    return JsPattern::Rest(Box::new(inner));
                }
            }
            Some("AssignmentPattern") => {
                #[allow(unused_variables)]
                if let (Some(left), Some(_right)) = (obj.get("left"), obj.get("right")) {
                    let left_pattern =
                        convert_expression_to_pattern(&Expression::Value(left.clone()));
                    return left_pattern;
                }
            }
            _ => {}
        }
    }
    JsPattern::Identifier("$$unknown".to_string())
}

/// Convert a JsExpr reference to a pattern.
fn convert_expr_to_pattern(expr: &JsExpr) -> JsPattern {
    match expr {
        JsExpr::Identifier(name) => JsPattern::Identifier(name.clone()),
        _ => JsPattern::Identifier("$$param".to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_key_same_as_item_true() {
        let key = Expression::Value(serde_json::json!({
            "type": "Identifier",
            "name": "item"
        }));
        let context = Expression::Value(serde_json::json!({
            "type": "Identifier",
            "name": "item"
        }));

        let node = EachBlock {
            start: 0,
            end: 100,
            expression: Expression::Value(serde_json::json!({
                "type": "Identifier",
                "name": "items"
            })),
            body: Fragment::default(),
            context: Some(context),
            fallback: None,
            index: None,
            key: Some(key),
            metadata: Default::default(),
        };

        assert!(is_key_same_as_item(&node));
    }

    #[test]
    fn test_is_key_same_as_item_false() {
        let key = Expression::Value(serde_json::json!({
            "type": "Identifier",
            "name": "item.id"
        }));
        let context = Expression::Value(serde_json::json!({
            "type": "Identifier",
            "name": "item"
        }));

        let node = EachBlock {
            start: 0,
            end: 100,
            expression: Expression::Value(serde_json::json!({
                "type": "Identifier",
                "name": "items"
            })),
            body: Fragment::default(),
            context: Some(context),
            fallback: None,
            index: None,
            key: Some(key),
            metadata: Default::default(),
        };

        assert!(!is_key_same_as_item(&node));
    }

    #[test]
    fn test_generate_item_identifier_simple() {
        let context = Expression::Value(serde_json::json!({
            "type": "Identifier",
            "name": "item"
        }));

        let node = EachBlock {
            start: 0,
            end: 100,
            expression: Expression::Value(serde_json::json!({
                "type": "Identifier",
                "name": "items"
            })),
            body: Fragment::default(),
            context: Some(context),
            fallback: None,
            index: None,
            key: None,
            metadata: Default::default(),
        };

        let item = generate_item_identifier(&node);
        match item {
            JsExpr::Identifier(name) => assert_eq!(name, "item"),
            _ => panic!("Expected identifier"),
        }
    }

    #[test]
    fn test_generate_item_identifier_no_context() {
        let node = EachBlock {
            start: 0,
            end: 100,
            expression: Expression::Value(serde_json::json!({
                "type": "Identifier",
                "name": "items"
            })),
            body: Fragment::default(),
            context: None,
            fallback: None,
            index: None,
            key: None,
            metadata: Default::default(),
        };

        let item = generate_item_identifier(&node);
        match item {
            JsExpr::Identifier(name) => assert_eq!(name, "$$item"),
            _ => panic!("Expected identifier"),
        }
    }

    #[test]
    fn test_expression_references_identifier() {
        use crate::ast::js::Expression;

        // Simple identifier
        let expr = Expression::Value(serde_json::json!({
            "type": "Identifier",
            "name": "i"
        }));
        assert!(expression_references_identifier(&expr, "i"));
        assert!(!expression_references_identifier(&expr, "j"));

        // Template literal with identifier
        let expr = Expression::Value(serde_json::json!({
            "type": "TemplateLiteral",
            "expressions": [{"type": "Identifier", "name": "i"}],
            "quasis": [{"type": "TemplateElement", "value": {"raw": "", "cooked": ""}}, {"type": "TemplateElement", "value": {"raw": "", "cooked": ""}}]
        }));
        assert!(expression_references_identifier(&expr, "i"));
        assert!(!expression_references_identifier(&expr, "j"));
    }

    #[test]
    fn test_convert_simple_pattern() {
        let expr = Expression::Value(serde_json::json!({
            "type": "Identifier",
            "name": "item"
        }));

        let pattern = convert_expression_to_pattern(&expr);
        match pattern {
            JsPattern::Identifier(name) => assert_eq!(name, "item"),
            _ => panic!("Expected identifier pattern"),
        }
    }
}
