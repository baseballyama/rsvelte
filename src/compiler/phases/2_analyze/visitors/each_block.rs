//! EachBlock visitor.
//!
//! Analyzes {#each} blocks.
//!
//! Corresponds to Svelte's `2-analyze/visitors/EachBlock.js`.

use rustc_hash::FxHashSet;

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

    // Each blocks create opaque sibling boundaries because elements can repeat
    // across iterations, nest, and wrap around, creating complex sibling
    // relationships that Phase 2 analysis doesn't fully model.
    context.analysis.css.has_opaque_elements = true;

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

    // Visit the body and fallback
    fragment::analyze(&mut block.body, context)?;

    // Pop EachBlock context
    context.each_block_stack.pop();

    if let Some(ref mut fallback) = block.fallback {
        fragment::analyze(fallback, context)?;
    }

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
    if !context.analysis.runes {
        // TODO: Implement legacy reactivity handling
        // This involves:
        // 1. Checking if context variables are mutated
        // 2. Collecting transitive dependencies
        // 3. Marking dependencies as state if mutated
        //
        // The JavaScript code:
        //   let mutated =
        //       !!node.context &&
        //       extract_identifiers(node.context).some((id) => {
        //           const binding = context.state.scope.get(id.name);
        //           return !!binding?.mutated;
        //       });
        //
        //   for (const binding of node.metadata.expression.dependencies) {
        //       collect_transitive_dependencies(binding, node.metadata.transitive_deps);
        //   }
        //
        //   if (mutated) {
        //       for (const binding of node.metadata.transitive_deps) {
        //           if (
        //               binding.kind === 'normal' &&
        //               (binding.declaration_kind === 'const' ||
        //                   binding.declaration_kind === 'let' ||
        //                   binding.declaration_kind === 'var')
        //           ) {
        //               binding.kind = 'state';
        //           }
        //       }
        //   }
    }

    // Mark the subtree as dynamic
    super::shared::fragment::mark_subtree_dynamic(&context.path);

    Ok(())
}

/// Collect transitive dependencies for legacy reactivity.
///
/// This function recursively collects all dependencies of a binding,
/// following the chain of legacy_reactive bindings.
///
/// Corresponds to `collect_transitive_dependencies` in EachBlock.js.
#[allow(dead_code)]
fn collect_transitive_dependencies(
    binding: &Binding,
    bindings: &mut FxHashSet<usize>,
    binding_idx: usize,
) {
    // Avoid cycles
    if bindings.contains(&binding_idx) {
        return;
    }
    bindings.insert(binding_idx);

    // If this is a legacy reactive binding, collect its dependencies
    if binding.kind == BindingKind::LegacyReactive {
        // TODO: Implement legacy_dependencies tracking
        // This requires adding a legacy_dependencies field to Binding
        // For now, this is a placeholder
    }
}

/// Alias for visit function.
pub fn visit_each_block(
    block: &mut EachBlock,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(block, context)
}
