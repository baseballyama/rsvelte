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
use crate::compiler::phases::phase3_transform::client::types::ComponentContext;
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
    // In the JS implementation, uses_index is set to true when the index is read
    // via a transform callback. Since we don't have that mechanism, we use a
    // simplified approach: if an index is explicitly declared, assume it's used.
    // This is conservative (may include index when not needed) but correct.
    let mut uses_index = each_node_meta.contains_group_binding || node.index.is_some();
    let key_uses_index = false; // Will be set properly when visiting key

    // Build declarations for the render function body
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

    // Visit the each block body to get the body block
    // The Fragment visitor handles template creation and hoisting
    let body_block = visit_fragment(&node.body, context);

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
    let has_await = node.metadata.expression.has_await;

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
    let expr_metadata = ExpressionMetadata {
        has_call: node.metadata.expression.has_call,
        has_await: node.metadata.expression.has_await,
        has_state: node.metadata.expression.has_state,
        has_member_expression: node.metadata.expression.has_member_expression,
        has_assignment: node.metadata.expression.has_assignment,
        ..Default::default()
    };

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
    let mut declared_names: Vec<&str> = Vec::new();

    // Add context pattern name if it's a simple identifier
    if let Some(ctx) = &node.context {
        let Expression::Value(val) = ctx;
        if let serde_json::Value::Object(obj) = val
            && obj.get("type").and_then(|v| v.as_str()) == Some("Identifier")
            && let Some(name) = obj.get("name").and_then(|v| v.as_str())
        {
            declared_names.push(name);
        }
    }

    // Add index name if present
    if let Some(index_name) = &node.index {
        declared_names.push(index_name.as_str());
    }

    // Check if any of these names exist in the parent scope
    // We use the scope's parent field to get the parent scope index
    if let Some(parent_idx) = context.state.scope.parent {
        for name in declared_names {
            // Look for a binding with this name in the parent scope
            for binding in &context.state.scope_root.bindings {
                if binding.name == name && binding.scope_index == parent_idx {
                    // Found a binding with the same name in the parent scope
                    // This means we have shadowing, so we need a collection_id
                    // Use a simple counter based on the number of bindings
                    return Some(format!(
                        "$$array_{}",
                        context.state.scope_root.bindings.len()
                    ));
                }
            }
        }
    }

    None
}

/// Generate the index identifier.
fn generate_index_identifier(
    node: &EachBlock,
    metadata: &crate::ast::template::EachBlockMetadata,
) -> JsExpr {
    // If the each block contains group bindings or has no explicit index,
    // use the metadata-generated index
    if metadata.contains_group_binding || node.index.is_none() {
        if let Some(ref index) = metadata.index {
            b::id(index)
        } else {
            b::id("$$index")
        }
    } else {
        // Use the node's explicit index name
        b::id(node.index.as_ref().unwrap().as_str())
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
    if let Some(index_name) = &node.index {
        let index_reactive = (flags & EACH_INDEX_REACTIVE) != 0;
        if index_reactive {
            context.state.transform.insert(
                index_name.to_string(),
                IdentifierTransform {
                    read: Some(|node| {
                        // Wrap with $.get(node)
                        b::call(b::member_path("$.get"), vec![node])
                    }),
                    assign: None,
                    mutate: None,
                    update: None,
                },
            );
        }
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

    // Handle destructured context pattern
    // This is more complex and would involve extract_paths in the full implementation
    // For now, we handle the simple cases

    declarations
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
