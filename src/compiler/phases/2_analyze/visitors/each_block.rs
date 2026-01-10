//! EachBlock visitor.
//!
//! Analyzes {#each} blocks.
//!
//! Corresponds to Svelte's `2-analyze/visitors/EachBlock.js`.

use std::collections::HashSet;

use super::super::{AnalysisError, Binding, BindingKind};
use super::VisitorContext;
use super::shared::fragment;
use super::shared::utils::{validate_block_not_empty, validate_opening_tag};
use crate::ast::template::EachBlock;

/// Visit an each block.
///
/// The {#each} block iterates over an array or iterable, creating a scope
/// for the iteration variable(s). In Svelte 4 (non-runes), it also handles
/// special dependency tracking for reactivity.
///
/// Corresponds to `EachBlock(node, context)` in EachBlock.js.
pub fn visit(block: &mut EachBlock, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate that the tag starts with '{#' (no whitespace in runes mode)
    validate_opening_tag(block.start as usize, &context.analysis.source, '#')?;

    // Validate that the body and fallback are not empty (warn if only whitespace)
    validate_block_not_empty(Some(&block.body))?;
    validate_block_not_empty(block.fallback.as_ref())?;

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

    // TODO: Set node.metadata.keyed = is_keyed
    // This requires adding metadata to EachBlock nodes

    // If keyed but no context, error
    if is_keyed && block.context.is_none() {
        // TODO: Implement proper error for each_key_without_as
        return Err(AnalysisError::Validation(
            "Each key requires 'as' binding".to_string(),
        ));
    }

    // TODO: Visit the expression in parent scope
    // The JavaScript code does:
    //   context.visit(node.expression, {
    //       ...context.state,
    //       expression: node.metadata.expression,
    //       scope: context.state.scope.parent
    //   });
    //
    // This requires:
    // 1. Implementing visitor for Expression nodes
    // 2. Supporting scope changes during visiting
    // 3. Adding metadata.expression to EachBlock nodes

    // Mark that we have control flow affecting sibling relationships
    context.analysis.css.has_control_flow = true;

    // Increment block depth for child analysis
    context.block_depth += 1;

    // Visit the body and fallback
    fragment::analyze(&mut block.body, context)?;
    if let Some(ref mut fallback) = block.fallback {
        fragment::analyze(fallback, context)?;
    }

    // TODO: Visit the key expression if present
    // context.visit(node.key)

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
    bindings: &mut HashSet<usize>,
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
