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
    add_svelte_meta, build_expression,
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

    let key_uses_index = false; // Will be set properly when visiting key

    // Save the current transform map - each block creates a child scope for transforms
    // This prevents transforms registered for this block's item/index from leaking to
    // sibling each blocks. Reference: EachBlock.js lines 129-133
    let saved_transform = context.state.transform.clone();

    // Build declarations for the render function body
    // This will insert transforms for the item and index into context.state.transform
    let declarations = build_declarations(
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
    let saved_each_index_used = context.state.each_index_used.get();

    // Set the current each block's index name and reset the used flag.
    // During body traversal, apply_transforms_to_expression_with_shadowed will
    // set each_index_used to true if the index identifier is encountered.
    if let Some(ref index_name) = node.index {
        context.state.each_index_name = Some(index_name.to_string());
        context.state.each_index_used.set(false);
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
    // Since our analysis doesn't populate transitive_deps yet, we derive invalidation
    // from the collection expression and parent each block collection expressions.
    let mut invalidation_exprs = Vec::new();
    if !context.state.analysis.runes {
        if let Some(ref coll_id) = collection_id {
            invalidation_exprs.push(format!("{}()", coll_id));
        } else {
            // Fallback: use the collection expression as the invalidation target.
            // This is correct because in the official compiler, transitive_deps
            // typically contains the expression dependencies of the collection,
            // which in simple cases is just the collection variable itself.
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
        destructured_update_paths: FxHashMap::default(),
    });

    // Visit the each block body to get the body block
    // The Fragment visitor handles template creation and hoisting
    let body_block = visit_fragment(&node.body, context);

    // Pop the each binding context
    context.state.each_binding_context.pop();

    // Check if bindings set the binding_used flag (meaning bind_directive generated
    // an each-block-aware setter that needs $$index)
    if binding_used.get() {
        uses_index = true;
    }

    // After visiting the body, check if the index was actually used
    if node.index.is_some() && context.state.each_index_used.get() {
        uses_index = true;
    }

    // After visiting the body, check if the each item was assigned or mutated.
    // This mirrors the official Svelte compiler's dynamic approach where assign/mutate
    // transform callbacks set uses_index = true.
    if context.state.each_item_assign_or_mutate.get() {
        uses_index = true;
    }

    // Restore the previous each_index state (for nested each blocks)
    context.state.each_index_name = saved_each_index_name;
    context.state.each_index_used.set(saved_each_index_used);

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
                    _ => None,
                }
            } else {
                None
            }
        }
    }
}

/// Get a unique collection ID if the inner scope shadows outer scope variables.
fn get_collection_id_if_needed(node: &EachBlock, context: &ComponentContext) -> Option<String> {
    let mut declared_names: Vec<String> = Vec::new();

    if let Some(ctx) = &node.context {
        let Expression::Value(val) = ctx;
        if let serde_json::Value::Object(obj) = val {
            collect_pattern_names(obj, &mut declared_names);
        }
    }

    if let Some(index_name) = &node.index {
        declared_names.push(index_name.to_string());
    }

    if let Some(parent_idx) = context.state.scope.parent {
        for name in &declared_names {
            for binding in &context.state.scope_root.bindings {
                if &binding.name == name && binding.scope_index == parent_idx {
                    return Some("$$array".to_string());
                }
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
) -> Vec<JsStatement> {
    let mut declarations = Vec::new();

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
                        read: Some(|node| b::call(b::member_path("$.get"), vec![node])),
                        assign: None,
                        mutate: None,
                        update: None,
                        skip_proxy: false,
                        is_defined: false,
                        is_reactive: true,
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
                            read: Some(|node| b::call(b::member_path("$.get"), vec![node])),
                            assign: None,
                            mutate: None,
                            update: None,
                            skip_proxy: false,
                            is_defined: false,
                            is_reactive: true,
                        },
                    );
                }

                // For each path, create a getter declaration
                for path in paths {
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
                                read: Some(|node| b::call(b::member_path("$.get"), vec![node])),
                                assign: None,
                                mutate: None,
                                update: None,
                                skip_proxy: false,
                                is_defined: false,
                                is_reactive: true,
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
                                read: Some(|node| b::call(node, vec![])),
                                assign: None,
                                mutate: None,
                                update: None,
                                skip_proxy: false,
                                is_defined: false,
                                is_reactive: true,
                            },
                        );
                    }
                }
            }
        }
    }

    declarations
}

/// Information about a destructured path from a pattern.
struct DestructuredPath {
    /// The binding name
    name: String,
    /// The expression to access the value
    expression: String,
    /// Whether this path has a default value (from AssignmentPattern)
    has_default_value: bool,
    /// The default value expression JSON (if has_default_value is true)
    default_value: Option<serde_json::Value>,
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
                has_default_value,
                default_value: None,
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
                                    } else if key_type == Some("Literal")
                                        && let Some(val) = key.get("value")
                                    {
                                        excluded_keys.push(format!("'{}'", val));
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
                                        expression: rest_expression,
                                        has_default_value,
                                        default_value: None,
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
                                let prop_expr = if computed || key_type != Some("Identifier") {
                                    let key_expr_str = format_json_expr_for_key(key_obj);
                                    format!("{}[{}]", expression, key_expr_str)
                                } else {
                                    let key_name = key_obj
                                        .get("name")
                                        .and_then(|n| n.as_str())
                                        .unwrap_or("unknown");
                                    format!("{}.{}", expression, key_name)
                                };

                                if let Some(value_obj) = value.as_object() {
                                    _extract_destructured_paths(
                                        paths,
                                        inserts,
                                        value_obj,
                                        &prop_expr,
                                        &prop_expr,
                                        has_default_value,
                                        array_counter,
                                    );
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
                                    expression: rest_expression,
                                    has_default_value,
                                    default_value: None,
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
                        has_default_value: true,
                        default_value: default_val,
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
            let callee_str =
                crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr(
                    &callee_expr,
                );
            format!("$.fallback({}, {}, true)", expression, callee_str)
        } else {
            let default_expr = convert_expression(&Expression::Value(default_val.clone()), context);
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
