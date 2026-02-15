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
    // to detect case 1 during body traversal. Cases 2 and 3 are checked statically below
    // by inspecting the binding's reassigned/mutated flags.
    let mut uses_index = each_node_meta.contains_group_binding;

    // Check if the each item binding is reassigned or mutated (e.g., via bind: directives).
    // This corresponds to the assign/mutate transform callbacks in the official compiler
    // which set uses_index = true.
    if !uses_index && let Some(context_expr) = &node.context {
        let Expression::Value(val) = context_expr;
        if let serde_json::Value::Object(obj) = val {
            let ctx_type = obj.get("type").and_then(|v| v.as_str());
            if ctx_type == Some("Identifier") {
                // Simple identifier context - check its binding
                if let Some(name) = obj.get("name").and_then(|v| v.as_str())
                    && let Some(binding) = context.state.get_binding(name)
                    && (binding.reassigned || binding.mutated)
                {
                    uses_index = true;
                }
            } else if ctx_type == Some("ObjectPattern") || ctx_type == Some("ArrayPattern") {
                // Destructured context - check all bindings from the pattern
                let mut declared_names = Vec::new();
                collect_pattern_names(obj, &mut declared_names);
                for name in &declared_names {
                    if let Some(binding) = context.state.get_binding(name)
                        && (binding.reassigned || binding.mutated)
                    {
                        uses_index = true;
                        break;
                    }
                }
            }
        }
    }

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
        } else if !node.metadata.transitive_deps.is_empty() {
            // Use transitive_deps from analysis if available
            for binding_idx in &node.metadata.transitive_deps {
                if let Some(binding) = context.state.scope_root.bindings.get(*binding_idx) {
                    invalidation_exprs.push(binding.name.clone());
                }
            }
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

    // Restore the previous each_index state (for nested each blocks)
    context.state.each_index_name = saved_each_index_name;
    context.state.each_index_used.set(saved_each_index_used);

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
///
/// In Svelte's implementation, this checks if `binding.scope.function_depth < context.state.scope.function_depth`.
/// Since template scopes have higher function_depth than instance scopes, any dependency
/// declared in the instance scope is considered "external" from the template's perspective.
///
/// For simplicity, we check if the expression has any dependencies at all. In runes mode,
/// dependencies from the instance scope (where $state variables are declared) are always
/// considered external because the template operates at a higher function_depth level.
fn has_external_dependencies(
    metadata: &crate::ast::template::EachBlockMetadata,
    _context: &ComponentContext,
) -> bool {
    // If the expression has any dependencies (binding references), those are from
    // the instance scope and are considered external from the each block's perspective.
    //
    // This matches the JS behavior where:
    // - Instance scope has function_depth = 1
    // - Template/EachBlock scopes have function_depth >= 3
    // - Any binding from instance scope (function_depth 1) is < template scope (function_depth 3+)
    // - Therefore it's considered an external dependency
    !metadata.expression.dependencies.is_empty()
}

/// Check if the each block has an animate directive on any direct child element.
fn has_animate_directive(node: &EachBlock) -> bool {
    if node.key.is_none() {
        return false;
    }

    // Check if any child element has an animate directive
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
    // Check if the expression is an identifier or member expression
    let obj_name = get_object_name(&node.expression)?;

    // Check if it's a store subscription
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
                        // Extract root object recursively
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
///
/// In Svelte's implementation (lines 119-127 of EachBlock.js):
/// ```javascript
/// for (const [name] of context.state.scope.declarations) {
///     if (context.state.scope.parent?.get(name) != null) {
///         collection_id = context.state.scope.root.unique('$$array');
///         break;
///     }
/// }
/// ```
///
/// This checks if any declaration in the each block's scope shadows something
/// from the parent scope. This is needed because we need access to the array
/// expression when bindings are reassigned, to invalidate the array.
fn get_collection_id_if_needed(node: &EachBlock, context: &ComponentContext) -> Option<String> {
    // Get the names declared in this each block's scope
    let mut declared_names: Vec<String> = Vec::new();

    // Add names from context pattern - can be simple identifier or destructuring
    if let Some(ctx) = &node.context {
        let Expression::Value(val) = ctx;
        if let serde_json::Value::Object(obj) = val {
            collect_pattern_names(obj, &mut declared_names);
        }
    }

    // Add index name if present
    if let Some(index_name) = &node.index {
        declared_names.push(index_name.to_string());
    }

    // Check if any of these names exist in the parent scope
    // We use the scope's parent field to get the parent scope index
    if let Some(parent_idx) = context.state.scope.parent {
        for name in &declared_names {
            // Look for a binding with this name in the parent scope
            for binding in &context.state.scope_root.bindings {
                if &binding.name == name && binding.scope_index == parent_idx {
                    // Found a binding with the same name in the parent scope
                    // This means we have shadowing, so we need a collection_id
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
                    if let Some(prop_obj) = prop.as_object() {
                        // Get the value part of the property (the binding)
                        if let Some(value) = prop_obj.get("value").and_then(|v| v.as_object()) {
                            collect_pattern_names(value, names);
                        }
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
            // e.g., { a = default } - get the left side
            if let Some(left) = obj.get("left").and_then(|l| l.as_object()) {
                collect_pattern_names(left, names);
            }
        }
        Some("RestElement") => {
            // e.g., ...rest
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
    // If the each block contains group bindings or has no explicit index,
    // use the metadata-generated index
    if metadata.contains_group_binding {
        if let Some(ref index) = metadata.index {
            b::id(index)
        } else {
            b::id("$$index")
        }
    } else if let Some(ref index_name) = node.index {
        // Use the node's explicit index name
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
        // Check if context is a simple identifier
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
        // Collect transitive dependencies for invalidation
        let mut transitive_deps: Vec<JsExpr> = Vec::new();

        if let Some(coll_id) = collection_id {
            // If we have a collection_id, add it to transitive deps
            transitive_deps.push(b::call(b::id(coll_id), vec![]));
        } else {
            // Add transitive deps from metadata
            for binding_idx in &node.metadata.transitive_deps {
                if let Some(binding) = context.state.scope_root.bindings.get(*binding_idx) {
                    transitive_deps.push(b::id(&binding.name));
                }
            }
        }

        // Also collect parent each block transitive deps
        for parent_node in &context.path {
            if let TemplateNode::EachBlock(parent_each) = parent_node {
                for binding_idx in &parent_each.metadata.transitive_deps {
                    if let Some(binding) = context.state.scope_root.bindings.get(*binding_idx) {
                        transitive_deps.push(b::id(&binding.name));
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

    // Add store invalidation to sequence
    if let Some(inv_store) = invalidate_store {
        sequence.push(inv_store);
    }

    use crate::compiler::phases::phase3_transform::client::types::IdentifierTransform;

    // Handle index transform
    // When EACH_INDEX_REACTIVE flag is set, wrap index reads with $.get()
    // Always register index transform with is_defined: true since indices are always numbers
    if let Some(index_name) = &node.index {
        let index_reactive = (flags & EACH_INDEX_REACTIVE) != 0;
        context.state.transform.insert(
            index_name.to_string(),
            IdentifierTransform {
                read: if index_reactive {
                    Some(|node| {
                        // Wrap with $.get(node)
                        b::call(b::member_path("$.get"), vec![node])
                    })
                } else {
                    None
                },
                assign: None,
                mutate: None,
                update: None,
                skip_proxy: false,
                // Each block indices are always numbers, never null/undefined
                is_defined: true,
                // Index is only reactive in keyed each blocks with index
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
            // Simple identifier - set up read/assign/mutate transforms
            // Register transform for the each item
            // When EACH_ITEM_REACTIVE flag is set, wrap reads with $.get()
            let item_reactive = (flags & EACH_ITEM_REACTIVE) != 0;

            // Register the transform for this identifier
            // The read function wraps with $.get() if item is reactive
            if item_reactive {
                context.state.transform.insert(
                    name.to_string(),
                    IdentifierTransform {
                        read: Some(|node| {
                            // Wrap with $.get(node)
                            b::call(b::member_path("$.get"), vec![node])
                        }),
                        assign: None,
                        mutate: None,
                        update: None,
                        skip_proxy: false,
                        // Each items can be any value including null/undefined
                        is_defined: false,
                        // Item is reactive when EACH_ITEM_REACTIVE flag is set
                        is_reactive: true,
                    },
                );
            }

            // If there's a group binding, we need to create an alias for the index
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

    // Handle destructured context pattern (e.g., {#each items as { a, b }})
    // This corresponds to lines 251-293 in the official EachBlock.js
    // We create getter functions for each destructured property
    if let Some(context_expr) = &node.context {
        let Expression::Value(val) = context_expr;
        if let serde_json::Value::Object(obj) = val {
            let ctx_type = obj.get("type").and_then(|v| v.as_str());

            // Only handle destructuring patterns, not simple identifiers (already handled above)
            if ctx_type == Some("ObjectPattern") || ctx_type == Some("ArrayPattern") {
                let item_reactive = (flags & EACH_ITEM_REACTIVE) != 0;

                // Build the unwrapped item expression: $.get($$item) if reactive, else $$item
                let unwrapped_item = if item_reactive {
                    "$.get($$item)".to_string()
                } else {
                    "$$item".to_string()
                };

                // Extract paths from the destructuring pattern
                let paths = extract_destructured_paths(obj, &unwrapped_item, false);

                // For each path, create a getter declaration
                // This matches the official EachBlock.js lines 264-292
                for path in paths {
                    if path.has_default_value {
                        // When there's a default value, use $.derived_safe_equal
                        // to ensure the default is only evaluated once.
                        // Expected output: let name = $.derived_safe_equal(() => $.fallback(expr, default));
                        let fallback_expr = build_fallback_expression(
                            &path.expression,
                            path.default_value.as_ref(),
                            context,
                        );
                        declarations.push(JsStatement::Raw(format!(
                            "let {} = $.derived_safe_equal(() => {});",
                            path.name, fallback_expr
                        )));

                        // Register transform that reads with $.get()
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
                        // No default value - use simple getter thunk
                        // Expected output: let name = () => expr;
                        declarations.push(JsStatement::Raw(format!(
                            "let {} = () => {};",
                            path.name, path.expression
                        )));

                        // Register transform for this name that calls the getter
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
    /// The expression to access the value (e.g., "$$item.a")
    expression: String,
    /// Whether this path has a default value (from AssignmentPattern)
    has_default_value: bool,
    /// The default value expression JSON (if has_default_value is true)
    default_value: Option<serde_json::Value>,
}

/// Extract property paths from a destructuring pattern.
/// Returns a list of DestructuredPath with info about default values.
fn extract_destructured_paths(
    obj: &serde_json::Map<String, serde_json::Value>,
    base_expr: &str,
    has_parent_default: bool,
) -> Vec<DestructuredPath> {
    let mut paths = Vec::new();

    match obj.get("type").and_then(|v| v.as_str()) {
        Some("ObjectPattern") => {
            if let Some(props) = obj.get("properties").and_then(|p| p.as_array()) {
                for prop in props {
                    if let Some(prop_obj) = prop.as_object() {
                        let prop_type = prop_obj.get("type").and_then(|v| v.as_str());

                        if prop_type == Some("Property") {
                            // Get the key (property name being accessed)
                            let key = prop_obj.get("key").and_then(|k| k.as_object());
                            let key_name = key.and_then(|k| k.get("name")).and_then(|n| n.as_str());

                            // Get the value (the binding name or nested pattern)
                            let value = prop_obj.get("value");

                            if let (Some(key_name), Some(value)) = (key_name, value) {
                                let prop_expr = format!("{}.{}", base_expr, key_name);

                                if let Some(value_obj) = value.as_object() {
                                    let value_type = value_obj.get("type").and_then(|v| v.as_str());

                                    if value_type == Some("Identifier") {
                                        let binding_name = value_obj
                                            .get("name")
                                            .and_then(|n| n.as_str())
                                            .unwrap_or(key_name);
                                        paths.push(DestructuredPath {
                                            name: binding_name.to_string(),
                                            expression: prop_expr,
                                            has_default_value: has_parent_default,
                                            default_value: None,
                                        });
                                    } else if value_type == Some("ObjectPattern")
                                        || value_type == Some("ArrayPattern")
                                    {
                                        let nested = extract_destructured_paths(
                                            value_obj,
                                            &prop_expr,
                                            has_parent_default,
                                        );
                                        paths.extend(nested);
                                    } else if value_type == Some("AssignmentPattern")
                                        && let Some(left) =
                                            value_obj.get("left").and_then(|l| l.as_object())
                                        && left.get("type").and_then(|t| t.as_str())
                                            == Some("Identifier")
                                    {
                                        let binding_name = left
                                            .get("name")
                                            .and_then(|n| n.as_str())
                                            .unwrap_or(key_name);
                                        let default_val = value_obj.get("right").cloned();
                                        paths.push(DestructuredPath {
                                            name: binding_name.to_string(),
                                            expression: prop_expr,
                                            has_default_value: true,
                                            default_value: default_val,
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = obj.get("elements").and_then(|e| e.as_array()) {
                for (i, elem) in elements.iter().enumerate() {
                    if elem.is_null() {
                        continue;
                    }

                    if let Some(elem_obj) = elem.as_object() {
                        let elem_type = elem_obj.get("type").and_then(|v| v.as_str());
                        let index_expr = format!("{}[{}]", base_expr, i);

                        if elem_type == Some("Identifier") {
                            let binding_name = elem_obj
                                .get("name")
                                .and_then(|n| n.as_str())
                                .unwrap_or("$$unknown");
                            paths.push(DestructuredPath {
                                name: binding_name.to_string(),
                                expression: index_expr,
                                has_default_value: has_parent_default,
                                default_value: None,
                            });
                        } else if elem_type == Some("ObjectPattern")
                            || elem_type == Some("ArrayPattern")
                        {
                            let nested = extract_destructured_paths(
                                elem_obj,
                                &index_expr,
                                has_parent_default,
                            );
                            paths.extend(nested);
                        } else if elem_type == Some("AssignmentPattern")
                            && let Some(left) = elem_obj.get("left").and_then(|l| l.as_object())
                            && left.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                        {
                            let binding_name = left
                                .get("name")
                                .and_then(|n| n.as_str())
                                .unwrap_or("$$unknown");
                            let default_val = elem_obj.get("right").cloned();
                            paths.push(DestructuredPath {
                                name: binding_name.to_string(),
                                expression: index_expr,
                                has_default_value: true,
                                default_value: default_val,
                            });
                        }
                    }
                }
            }
        }
        _ => {}
    }

    paths
}

/// Build a $.fallback(expression, default) call expression as a string.
///
/// This matches the official `build_fallback` in `svelte/packages/svelte/src/compiler/utils/ast.js`,
/// including the `unthunk` optimization from `builders.js`.
///
/// For simple default values (Identifier, Literal): `$.fallback(expr, default)`
/// For CallExpression with 0 args and Identifier callee: `$.fallback(expr, callee, true)` (unthunk optimization)
/// For other complex defaults: `$.fallback(expr, () => default, true)`
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
        } else {
            // Complex default - check for the unthunk optimization:
            // When the default is `func()` (CallExpression with 0 args and Identifier callee),
            // just pass `func` instead of `() => func()`.
            if let Some(obj) = default_val.as_object()
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
                let default_expr =
                    convert_expression(&Expression::Value(default_val.clone()), context);
                let default_str =
                    crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr(
                        &default_expr,
                    );
                format!("$.fallback({}, () => {}, true)", expression, default_str)
            }
        }
    } else {
        // No default value - shouldn't happen when has_default_value is true
        expression.to_string()
    }
}

/// Check if a default value expression is "simple" (doesn't need thunking in $.fallback).
/// Matches the official `is_simple_expression` logic.
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
        // Convert the key expression
        let key_expr = convert_expression(key, context);

        // Build arrow function with context pattern
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

    // Default: use $.index for non-keyed each blocks
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
///
/// This uses the Fragment visitor which handles:
/// - Template creation and hoisting
/// - Child node processing
/// - Render effect generation
/// - Append statement generation
fn visit_fragment(fragment: &Fragment, context: &mut ComponentContext) -> JsBlockStatement {
    // EachBlock body IS a root fragment within its callback - needs $.next()
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
                // Handle object destructuring pattern
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
                // Handle array destructuring pattern
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
                    // For the default value, we'd need to convert to JsExpr
                    // For now, just use the left pattern
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
        // Test case where key and context are the same identifier
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
        // Test case where key and context are different identifiers
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
