//! EachBlock visitor.
//!
//! Analyzes {#each} blocks.
//!
//! Corresponds to Svelte's `2-analyze/visitors/EachBlock.js`.

use indexmap::IndexSet;

use super::super::{AnalysisError, Binding, BindingKind, errors};
use super::shared::fragment;
use super::shared::utils::{validate_block_not_empty, validate_opening_tag, walk_js_expression};
use super::{EachBlockContext, VisitorContext};
use crate::ast::template::{EachBlock, TemplateNode};

/// Visit an each block.
///
/// The {#each} block iterates over an array or iterable, creating a scope
/// for the iteration variable(s). In Svelte 4 (non-runes), it also handles
/// special dependency tracking for reactivity.
///
/// Corresponds to `EachBlock(node, context)` in EachBlock.js.
pub fn visit(block: &mut EachBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check if inside a textarea (logic blocks not allowed)
    if context.element_ancestors.iter().any(|a| a == "textarea") {
        return Err(errors::block_invalid_placement("{#each ...}"));
    }

    // Validate that the tag starts with '{#' (no whitespace in runes mode)
    validate_opening_tag(block.start as usize, &context.analysis.source, '#')?;

    // Validate that the body and fallback are not empty (warn if only whitespace)
    if let Some(warning) = validate_block_not_empty(Some(&block.body))? {
        context.emit_warning(warning);
    }
    if let Some(warning) = validate_block_not_empty(block.fallback.as_ref())? {
        context.emit_warning(warning);
    }

    // Check if the context identifier is a rune name (invalid)
    if let Some(ref context_expr) = block.context {
        // Extract identifier name if it's a simple Identifier
        if let Some(name) = context_expr.as_json().get("name").and_then(|n| n.as_str())
            && (name == "$state" || name == "$derived")
        {
            return Err(super::super::errors::state_invalid_placement(name));
        }
    }

    // Determine if this is a keyed block
    // A block is keyed if:
    // 1. It has a key expression
    // 2. The key is not just the index variable (i.e., not `{#each items as item, i (i)}`)
    let is_keyed = if let Some(ref key) = block.key {
        // Check if key is an identifier
        let key_name = key.as_json().get("name").and_then(|n| n.as_str());

        // If key is not an identifier, or there's no index, or the names don't match, it's keyed
        key_name.is_none()
            || block.index.is_none()
            || key_name != block.index.as_ref().map(|s| s.as_str())
    } else {
        false
    };

    // Set metadata
    block.metadata.keyed = is_keyed;

    // If keyed but no context, error
    if is_keyed && block.context.is_none() {
        return Err(errors::each_key_without_as());
    }

    // Visit the expression in parent scope
    // Extract the JavaScript expression value
    let crate::ast::js::Expression::Value(value) = &block.expression;
    walk_js_expression(value, context, &mut block.metadata.expression)?;

    // Mark that we have control flow affecting sibling relationships
    context.analysis.css.has_control_flow = true;

    // Note: Each blocks are NOT opaque - they are handled by Phase 2 control flow
    // analysis in control_flow.rs, which correctly models sibling relationships
    // across each body and fallback branches.

    // Increment block depth for child analysis
    context.block_depth += 1;

    // Count non-empty children for animate: validation
    let child_count = block
        .body
        .nodes
        .iter()
        .filter(|n| match n {
            TemplateNode::Comment(_) => false,
            TemplateNode::ConstTag(_) => false,
            TemplateNode::Text(text) => !text.data.trim().is_empty(),
            _ => true,
        })
        .count();

    // Push EachBlock context for animate: validation
    context.each_block_stack.push(Some(EachBlockContext {
        has_key: block.key.is_some(),
        child_count,
    }));

    // Clear is_direct_child_of_component since children of control flow blocks
    // are not direct children of a component
    let was_direct_child = context.is_direct_child_of_component;
    context.is_direct_child_of_component = false;

    // Push fragment owner type for const_tag placement validation
    context
        .fragment_owner_stack
        .push(super::FragmentOwnerType::EachBlock);

    // Update context.scope to the each block's scope for proper scope chain lookup
    // This is critical: identifiers inside the each block body need to resolve
    // EachItem bindings (like `item`) from the each block's scope, not the parent scope.
    let old_scope = context.scope;
    if let Some(&each_scope) = context.analysis.root.template_scope_map.get(&block.start) {
        context.scope = each_scope;
    }

    // Walk the context pattern's default values so that identifiers in defaults
    // (e.g., `{#each array as { a = default_value_1 }}`) are visited and references counted.
    // The official Svelte's zimmerframe walker automatically visits the context pattern,
    // but our implementation needs to explicitly walk the default values.
    if let Some(ref context_expr) = block.context {
        walk_pattern_defaults(context_expr.as_json(), context)?;
    }

    // Visit the body and fallback
    fragment::analyze(&mut block.body, context)?;

    // Pop EachBlock context
    context.each_block_stack.pop();

    // Fallback is still in the each block's scope (same scope as body)
    if let Some(ref mut fallback) = block.fallback {
        fragment::analyze(fallback, context)?;
    }

    // Restore scope
    context.scope = old_scope;

    // Pop fragment owner type
    context.fragment_owner_stack.pop();

    // Restore is_direct_child_of_component
    context.is_direct_child_of_component = was_direct_child;

    // Visit the key expression if present
    // IMPORTANT: Use a separate metadata for the key expression, NOT block.metadata.expression.
    // In the official Svelte compiler, the key is visited without the expression metadata context,
    // so its dependencies are NOT added to node.metadata.expression.dependencies.
    // Adding key dependencies to expression metadata would incorrectly set EACH_ITEM_REACTIVE
    // in cases where the iterable has no external dependencies but the key does.
    if let Some(key) = &block.key {
        let crate::ast::js::Expression::Value(value) = key;
        let mut key_metadata = crate::ast::template::ExpressionMetadata::default();
        walk_js_expression(value, context, &mut key_metadata)?;
    }

    // Decrement block depth
    context.block_depth -= 1;

    // In Svelte 4 (non-runes mode), handle legacy reactivity
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/EachBlock.js L47-76
    if !context.analysis.runes {
        // Collect transitive dependencies from expression dependencies.
        // These are used by the transform phase for invalidation signals.
        for binding_idx in &block.metadata.expression.dependencies {
            let binding_idx = *binding_idx;
            if binding_idx < context.analysis.root.bindings.len() {
                let decl_kind = context.analysis.root.bindings[binding_idx].declaration_kind;
                if !matches!(
                    decl_kind,
                    super::super::super::phase2_analyze::scope::DeclarationKind::Function
                ) {
                    collect_transitive_dependencies_impl(
                        binding_idx,
                        &context.analysis.root.bindings,
                        &mut block.metadata.transitive_deps,
                    );
                }
            }
        }

        // NOTE: Binding promotion (Normal -> State) is NOT done here because it would
        // happen during analyze_template(), before runes auto-detection. Promoting to
        // State here would cause is_rune() to return true, falsely triggering runes mode.
        // Instead, promotion is handled by promote_each_expression_bindings() in mod.rs,
        // which runs AFTER runes detection.
    }

    // Mark the subtree as dynamic
    super::shared::fragment::mark_subtree_dynamic(&context.path);

    Ok(())
}

/// Walk default values in a destructuring pattern using the JS walker.
///
/// This visits the `right` side of AssignmentPattern nodes so that identifiers
/// in default values are properly counted as references. For example, in
/// `{#each array as { a = default_value_1 }}`, the `default_value_1` identifier
/// needs to be visited to count as a reference to the outer-scope binding.
fn walk_pattern_defaults(
    pattern: &serde_json::Value,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let pattern_type = pattern.get("type").and_then(|t| t.as_str());
    match pattern_type {
        Some("AssignmentPattern") => {
            // Walk the left side for nested patterns
            if let Some(left) = pattern.get("left") {
                walk_pattern_defaults(left, context)?;
            }
            // Walk the default value expression using a lightweight reference-only walker.
            // We must NOT use walk_js_node here because that would trigger MemberExpression
            // and CallExpression visitors which incorrectly set needs_context = true.
            // The official Svelte's EachBlock visitor does NOT visit the context pattern
            // during analysis — it only visits node.expression, node.body, node.key, and
            // node.fallback. We only need to count identifier references for the defaults.
            if let Some(right) = pattern.get("right") {
                walk_expression_refs_only(right, context);
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for prop in properties {
                    let prop_type = prop.get("type").and_then(|t| t.as_str());
                    if prop_type == Some("RestElement") {
                        if let Some(argument) = prop.get("argument") {
                            walk_pattern_defaults(argument, context)?;
                        }
                    } else if let Some(value) = prop.get("value") {
                        walk_pattern_defaults(value, context)?;
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        walk_pattern_defaults(elem, context)?;
                    }
                }
            }
        }
        Some("RestElement") => {
            if let Some(argument) = pattern.get("argument") {
                walk_pattern_defaults(argument, context)?;
            }
        }
        _ => {}
    }
    Ok(())
}

/// Walk an expression, only counting identifier references without triggering
/// any side effects like setting `needs_context`. This is used for default values
/// in each block destructuring patterns where we need reference counts but must
/// not affect the component's context requirements.
fn walk_expression_refs_only(node: &serde_json::Value, context: &mut VisitorContext) {
    let node_type = node.get("type").and_then(|t| t.as_str());
    match node_type {
        Some("Identifier") => {
            if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
                // Try to find binding and add a reference
                if let Some(binding_idx) = context
                    .analysis
                    .root
                    .get_binding(name, context.scope)
                    .or_else(|| context.analysis.root.find_binding_any_scope(name))
                {
                    let (start, end) = node
                        .get("start")
                        .and_then(|s| s.as_u64())
                        .zip(node.get("end").and_then(|e| e.as_u64()))
                        .unwrap_or((0, 0));
                    context.analysis.root.bindings[binding_idx].add_reference(
                        start as u32,
                        end as u32,
                        false,
                        false,
                        false,
                    );
                }
            }
        }
        _ => {
            // Recurse into child nodes
            walk_expression_children_refs_only(node, context);
        }
    }
}

/// Recursively walk child nodes of a JSON AST node, visiting only identifiers
/// for reference counting purposes.
fn walk_expression_children_refs_only(node: &serde_json::Value, context: &mut VisitorContext) {
    if let Some(obj) = node.as_object() {
        for (key, value) in obj {
            // Skip metadata/position fields
            if key == "type" || key == "start" || key == "end" || key == "loc" || key == "raw" {
                continue;
            }
            if let Some(arr) = value.as_array() {
                for item in arr {
                    if item.get("type").is_some() {
                        walk_expression_refs_only(item, context);
                    }
                }
            } else if value.get("type").is_some() {
                walk_expression_refs_only(value, context);
            }
        }
    }
}

/// Extract identifier names from a destructuring pattern.
///
/// Corresponds to `extract_identifiers` in utils/ast.js.
fn extract_identifiers_from_pattern(node: &serde_json::Value, names: &mut Vec<String>) {
    let node_type = node.get("type").and_then(|t| t.as_str());
    match node_type {
        Some("Identifier") => {
            if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
                names.push(name.to_string());
            }
        }
        Some("ObjectPattern") => {
            if let Some(props) = node.get("properties").and_then(|p| p.as_array()) {
                for prop in props {
                    let prop_type = prop.get("type").and_then(|t| t.as_str());
                    if prop_type == Some("RestElement") {
                        if let Some(arg) = prop.get("argument") {
                            extract_identifiers_from_pattern(arg, names);
                        }
                    } else if let Some(value) = prop.get("value") {
                        extract_identifiers_from_pattern(value, names);
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = node.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        extract_identifiers_from_pattern(elem, names);
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = node.get("left") {
                extract_identifiers_from_pattern(left, names);
            }
        }
        Some("RestElement") => {
            if let Some(arg) = node.get("argument") {
                extract_identifiers_from_pattern(arg, names);
            }
        }
        _ => {}
    }
}

/// Collect transitive dependencies for legacy reactivity.
///
/// This function recursively collects all dependencies of a binding,
/// following the chain of legacy_reactive bindings.
///
/// Corresponds to `collect_transitive_dependencies` in EachBlock.js.
fn collect_transitive_dependencies_impl(
    binding_idx: usize,
    bindings: &[Binding],
    deps: &mut IndexSet<usize>,
) {
    if deps.contains(&binding_idx) {
        return;
    }
    deps.insert(binding_idx);

    if binding_idx < bindings.len() && bindings[binding_idx].kind == BindingKind::LegacyReactive {
        // Follow legacy_dependencies chain to collect transitive dependencies.
        // This matches the official compiler's collect_transitive_dependencies
        // in EachBlock.js which recursively follows binding.legacy_dependencies.
        let legacy_deps = bindings[binding_idx].legacy_dependencies.clone();
        for dep_idx in legacy_deps {
            collect_transitive_dependencies_impl(dep_idx, bindings, deps);
        }
    }
}

/// Alias for visit function.
pub fn visit_each_block(
    block: &mut EachBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(block, context)
}
