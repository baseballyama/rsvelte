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

// Allow lints for this file as it contains many TODO stubs
#![allow(irrefutable_let_patterns)]
#![allow(unreachable_patterns)]
#![allow(dead_code)]
#![allow(clippy::too_many_arguments)]

use crate::ast::js::Expression;
use crate::ast::template::{Attribute, EachBlock, TemplateNode};
use crate::compiler::constants::*;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase3_transform::client::types::ComponentContext;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::add_svelte_meta;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

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

    // Expression should be evaluated in the parent scope, not the scope
    // created by the each block itself
    // (parent scope index is stored in context.state.scope.parent)

    // Build the collection expression in parent scope
    let collection = build_expression_in_parent_scope(node, context);

    // Add comment placeholder for uncontrolled blocks
    if !each_node_meta.is_controlled {
        context.state.template.push_comment(None);
    }

    // Calculate flags
    let mut flags = 0;

    // Index reactive flag
    if each_node_meta.keyed && node.index.is_some() {
        flags |= EACH_INDEX_REACTIVE;
    }

    // Check if key is the same as the item (optimization)
    let key_is_item = is_key_same_as_item(node);

    // Check if expression uses store subscriptions
    let uses_store = uses_store_subscription(each_node_meta);

    // Determine if items should be reactive
    if should_make_items_reactive(each_node_meta, context, key_is_item, uses_store) {
        flags |= EACH_ITEM_REACTIVE;
    }

    // Item immutability flag (runes mode)
    if context.state.analysis.runes && !uses_store {
        flags |= EACH_ITEM_IMMUTABLE;
    }

    // Animation flag
    if has_animate_directive(node) {
        flags |= EACH_IS_ANIMATED;
    }

    // Controlled flag
    if each_node_meta.is_controlled {
        flags |= EACH_IS_CONTROLLED;
    }

    // Determine store to invalidate
    let store_to_invalidate = get_store_to_invalidate(node, context);

    // Check if we need a collection ID (for shadowing)
    let collection_id = get_collection_id_if_needed(context);

    // Setup child state
    let child_state = setup_child_state(context, store_to_invalidate.clone());
    let key_state = setup_key_state(context);

    // Generate unique identifiers
    let index = generate_index_identifier(node, each_node_meta);
    let item = generate_item_identifier(node);

    // Setup index and item transforms
    let (uses_index, key_uses_index, declarations) = setup_transforms(
        node,
        each_node_meta,
        context,
        &index,
        &item,
        flags,
        collection.clone(),
        collection_id.clone(),
        &child_state,
        &key_state,
    );

    // Build the key function
    let key_function = build_key_function(node, context, &key_state, key_uses_index, &index);

    // Build render arguments
    let render_args = build_render_args(&index, &item, uses_index, collection_id.as_ref());

    // Build the each call arguments
    let each_call_args = build_each_call_args(
        node,
        context,
        flags,
        collection,
        key_function,
        render_args,
        declarations,
        &child_state,
    );

    // Add validation in dev mode
    if context.state.dev && node.metadata.keyed {
        add_dev_validation(context, &each_call_args);
    }

    // Handle async expressions
    if node.metadata.expression.is_async() {
        wrap_in_async(node, context, each_call_args);
    } else {
        // Add to init statements
        for arg in each_call_args {
            context.state.init.push(arg);
        }
    }
}

/// Build the collection expression in the parent scope.
fn build_expression_in_parent_scope(node: &EachBlock, _context: &ComponentContext) -> JsExpr {
    // TODO: Implement build_expression utility
    // For now, convert the AST expression to JsExpr
    convert_expression(&node.expression)
}

/// Check if the key expression is the same as the item identifier.
fn is_key_same_as_item(node: &EachBlock) -> bool {
    if let (Some(key), Some(context)) = (&node.key, &node.context) {
        // Both must be identifiers with the same name
        if let (Expression::Value(key_val), Expression::Value(ctx_val)) = (key, context) {
            if let (serde_json::Value::Object(key_obj), serde_json::Value::Object(ctx_obj)) =
                (key_val, ctx_val)
            {
                let key_type = key_obj.get("type").and_then(|v| v.as_str());
                let ctx_type = ctx_obj.get("type").and_then(|v| v.as_str());
                let key_name = key_obj.get("name").and_then(|v| v.as_str());
                let ctx_name = ctx_obj.get("name").and_then(|v| v.as_str());

                return key_type == Some("Identifier")
                    && ctx_type == Some("Identifier")
                    && key_name == ctx_name;
            }
        }
    }
    false
}

/// Check if the expression uses store subscriptions.
fn uses_store_subscription(metadata: &crate::ast::template::EachBlockMetadata) -> bool {
    // TODO: Implement dependency checking
    // For now, return false as a placeholder
    false
}

/// Determine if items should be made reactive.
fn should_make_items_reactive(
    metadata: &crate::ast::template::EachBlockMetadata,
    context: &ComponentContext,
    key_is_item: bool,
    uses_store: bool,
) -> bool {
    // TODO: Check expression dependencies against function depth
    // For now, use simplified logic
    !context.state.analysis.runes || !key_is_item || uses_store
}

/// Check if the each block has an animate directive.
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
    let obj_name = match &node.expression {
        Expression::Value(val) => {
            if let serde_json::Value::Object(obj) = val {
                match obj.get("type").and_then(|v| v.as_str()) {
                    Some("Identifier") => obj.get("name").and_then(|v| v.as_str()),
                    Some("MemberExpression") => {
                        // Extract root object
                        extract_root_identifier(obj)
                    }
                    _ => None,
                }
            } else {
                None
            }
        }
        _ => None,
    }?;

    // Check if it's a store subscription
    let binding = context.state.get_binding(obj_name)?;
    if matches!(binding.kind, BindingKind::StoreSub) {
        Some(obj_name.to_string())
    } else {
        None
    }
}

/// Extract the root identifier from a member expression.
fn extract_root_identifier(obj: &serde_json::Map<String, serde_json::Value>) -> Option<&str> {
    let mut current = obj;
    loop {
        let object = current.get("object")?;
        if let serde_json::Value::Object(obj_map) = object {
            if obj_map.get("type").and_then(|v| v.as_str()) == Some("Identifier") {
                return obj_map.get("name").and_then(|v| v.as_str());
            }
            current = obj_map;
        } else {
            return None;
        }
    }
}

/// Get a unique collection ID if the inner scope shadows outer scope variables.
fn get_collection_id_if_needed(context: &ComponentContext) -> Option<String> {
    // Check if any declaration in the current scope shadows a parent scope declaration
    // Note: In the Rust implementation, we would need to traverse up the scope chain
    // through the scope tree to check parent scopes. This is a simplified version.

    // TODO: Implement proper parent scope checking
    // For now, check if parent exists and has declarations
    if context.state.scope.parent.is_some() {
        for (name, _) in &context.state.scope.declarations {
            // We should check parent scope here, but we need access to scope root
            // to navigate the scope tree by index.
            // For now, generate a unique ID if we have a parent scope
            let scope_hash = context.state.scope.declarations.len();
            return Some(format!("$$array_{}", scope_hash));
        }
    }
    None
}

/// Setup the child state for rendering each items.
fn setup_child_state<'a>(
    context: &ComponentContext<'a>,
    store_to_invalidate: Option<String>,
) -> ComponentClientTransformState<'a> {
    let mut child_state = context.state.clone();
    child_state.transform.clear();

    // Store the store to invalidate
    // TODO: Add store_to_invalidate field to ComponentClientTransformState

    child_state
}

/// Setup the key state for evaluating key expressions.
fn setup_key_state<'a>(context: &ComponentContext<'a>) -> ComponentClientTransformState<'a> {
    let mut key_state = context.state.clone();
    key_state.transform.clear();
    key_state
}

/// Generate the index identifier.
fn generate_index_identifier(
    node: &EachBlock,
    metadata: &crate::ast::template::EachBlockMetadata,
) -> JsExpr {
    if metadata.contains_group_binding || node.index.is_none() {
        // Use the metadata index
        if let Some(ref index) = metadata.index {
            b::id(index)
        } else {
            b::id("$$index")
        }
    } else {
        // Use the node's index
        b::id(node.index.as_ref().unwrap().as_str())
    }
}

/// Generate the item identifier.
fn generate_item_identifier(node: &EachBlock) -> JsExpr {
    if let Some(context) = &node.context {
        // Check if context is a simple identifier
        if let Expression::Value(val) = context {
            if let serde_json::Value::Object(obj) = val {
                if obj.get("type").and_then(|v| v.as_str()) == Some("Identifier") {
                    if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                        return b::id(name);
                    }
                }
            }
        }
    }
    b::id("$$item")
}

/// Setup transforms for index and item, returning (uses_index, key_uses_index, declarations).
fn setup_transforms(
    node: &EachBlock,
    metadata: &crate::ast::template::EachBlockMetadata,
    context: &mut ComponentContext,
    index: &JsExpr,
    item: &JsExpr,
    flags: i32,
    collection: JsExpr,
    collection_id: Option<String>,
    child_state: &ComponentClientTransformState,
    key_state: &ComponentClientTransformState,
) -> (bool, bool, Vec<JsStatement>) {
    let mut uses_index = metadata.contains_group_binding;
    let mut key_uses_index = false;
    let mut declarations = Vec::new();

    // TODO: Implement transform setup
    // This involves:
    // 1. Setting up index transform
    // 2. Setting up item transform (simple or destructured)
    // 3. Generating declarations for derived values
    // 4. Tracking which variables are used

    (uses_index, key_uses_index, declarations)
}

/// Build the key function for the each block.
fn build_key_function(
    node: &EachBlock,
    context: &mut ComponentContext,
    key_state: &ComponentClientTransformState,
    key_uses_index: bool,
    index: &JsExpr,
) -> JsExpr {
    if node.metadata.keyed {
        if let Some(key) = &node.key {
            // Transform the key expression
            let key_expr = convert_expression(key);

            // Build arrow function
            if let Some(context_expr) = &node.context {
                let pattern = convert_to_pattern(context_expr);

                let params = if key_uses_index {
                    vec![pattern, convert_to_pattern_from_expr(index)]
                } else {
                    vec![pattern]
                };

                return b::arrow(params, key_expr);
            }
        }
    }

    // Default: use $.index
    b::member(b::id("$"), "index")
}

/// Build the render arguments (anchor, item, [index], [collection_id]).
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

/// Build the arguments for the $.each() call.
fn build_each_call_args(
    node: &EachBlock,
    context: &mut ComponentContext,
    flags: i32,
    collection: JsExpr,
    key_function: JsExpr,
    render_args: Vec<JsExpr>,
    declarations: Vec<JsStatement>,
    child_state: &ComponentClientTransformState,
) -> Vec<JsStatement> {
    // Build the render function body
    let mut body = declarations;

    // Visit the each block body
    // TODO: Transform node.body into statements
    // let block_statements = visit_fragment(&node.body, context, child_state);
    // body.extend(block_statements);

    // Build the render function
    let render_fn = b::arrow_block(
        render_args
            .into_iter()
            .map(|e| convert_expr_to_pattern(&e))
            .collect(),
        body,
    );

    // Build thunk for collection
    let is_async = node.metadata.expression.is_async();
    let has_await = node.metadata.expression.has_await;
    let collection_thunk = b::thunk(collection.clone());

    // Build $.each() call arguments
    let mut args = vec![
        context.state.node.clone(),
        b::number(flags as f64),
        if is_async {
            b::thunk(b::call(
                b::member(b::id("$"), "get"),
                vec![b::id("$$collection")],
            ))
        } else {
            collection_thunk
        },
        key_function,
        render_fn,
    ];

    // Add fallback function if present
    if let Some(fallback) = &node.fallback {
        // TODO: Transform fallback fragment
        // let fallback_fn = b::arrow_block(vec![b::id_pattern("$$anchor")], visit_fragment(fallback, context, child_state));
        // args.push(fallback_fn);
    }

    // Build the $.each() call
    let each_call = b::call(b::member(b::id("$"), "each"), args);

    vec![add_svelte_meta(
        each_call,
        &TemplateNode::EachBlock(node.clone()),
        "each",
        None,
    )]
}

/// Add dev mode validation.
fn add_dev_validation(context: &mut ComponentContext, statements: &[JsStatement]) {
    // TODO: Add $.validate_each_keys() call
}

/// Wrap the each block in $.async() for async expressions.
fn wrap_in_async(node: &EachBlock, context: &mut ComponentContext, statements: Vec<JsStatement>) {
    // TODO: Implement async wrapping
    // This involves calling $.async() with the collection getter and blockers
}

// =============================================================================
// Utility Functions
// =============================================================================

/// Convert an AST Expression to a JsExpr.
fn convert_expression(expr: &Expression) -> JsExpr {
    // TODO: Implement full expression conversion
    // For now, return a placeholder
    match expr {
        Expression::Value(val) => {
            // Try to convert JSON value to JsExpr
            if let serde_json::Value::Object(obj) = val {
                if let Some(type_str) = obj.get("type").and_then(|v| v.as_str()) {
                    match type_str {
                        "Identifier" => {
                            if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                                return b::id(name);
                            }
                        }
                        "Literal" => {
                            if let Some(value) = obj.get("value") {
                                return convert_literal_value(value);
                            }
                        }
                        _ => {}
                    }
                }
            }
            b::id("$$unknown")
        }
        _ => b::id("$$unknown"),
    }
}

/// Convert a JSON literal value to JsExpr.
fn convert_literal_value(value: &serde_json::Value) -> JsExpr {
    match value {
        serde_json::Value::String(s) => b::string(s),
        serde_json::Value::Number(n) => {
            if let Some(f) = n.as_f64() {
                b::number(f)
            } else {
                b::number(0.0)
            }
        }
        serde_json::Value::Bool(b) => b::boolean(*b),
        serde_json::Value::Null => b::null(),
        _ => b::null(),
    }
}

/// Convert an expression to a pattern.
fn convert_to_pattern(expr: &Expression) -> JsPattern {
    // TODO: Implement pattern conversion
    // For now, return identifier pattern
    if let Expression::Value(val) = expr {
        if let serde_json::Value::Object(obj) = val {
            if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                return b::id_pattern(name);
            }
        }
    }
    b::id_pattern("$$unknown")
}

/// Convert a JsExpr to a pattern.
fn convert_to_pattern_from_expr(expr: &JsExpr) -> JsPattern {
    match expr {
        JsExpr::Identifier(name) => b::id_pattern(name),
        _ => b::id_pattern("$$unknown"),
    }
}

/// Convert a JsExpr reference to a pattern.
fn convert_expr_to_pattern(expr: &JsExpr) -> JsPattern {
    match expr {
        JsExpr::Identifier(name) => b::id_pattern(name),
        _ => b::id_pattern("$$param"),
    }
}

use crate::compiler::phases::phase3_transform::client::types::ComponentClientTransformState;
