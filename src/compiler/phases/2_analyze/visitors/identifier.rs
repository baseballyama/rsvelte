//! Identifier visitor.
//!
//! Analyzes identifier references.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Identifier.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::function::is_rune;
use super::shared::utils::is_reference;
use crate::compiler::phases::phase2_analyze::{AnalysisError, BindingKind, errors};
use serde_json::Value;

/// Visit an identifier.
///
/// This is one of the most complex visitors, handling:
/// - Reference detection
/// - Rune validation
/// - Special variable handling ($$slots, $$props, $$restProps, arguments)
/// - Dependency tracking
/// - Various warnings for state usage
///
/// # Arguments
///
/// * `node` - The Identifier AST node
/// * `context` - The visitor context
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Get the parent node from js_path
    let parent = if context.js_path.len() >= 2 {
        Some(&context.js_path[context.js_path.len() - 2])
    } else {
        None
    };

    // Check if this identifier is a reference (not a declaration or property key)
    if !is_reference(node, parent) {
        return Ok(());
    }

    // Mark the subtree as dynamic
    mark_subtree_dynamic(&context.path);

    let name = match node.get("name").and_then(|n| n.as_str()) {
        Some(n) => n,
        None => return Ok(()),
    };

    // Check for `arguments` outside of functions
    if name == "arguments" {
        let is_in_function = context.js_path.iter().any(|n| {
            matches!(
                n.get("type").and_then(|t| t.as_str()),
                Some("FunctionDeclaration") | Some("FunctionExpression")
            )
        });

        if !is_in_function {
            return Err(errors::invalid_arguments_usage());
        }
    }

    // Handle $$slots
    if name == "$$slots" {
        context.analysis.uses_slots = true;
    }

    // Handle runes in runes mode
    if context.analysis.runes && is_rune(name) {
        // Check if this is actually a rune (not a store subscription)
        let is_store_sub =
            if let Some(binding_idx) = context.analysis.root.scope.declarations.get(name) {
                let binding = &context.analysis.root.bindings[*binding_idx];
                binding.kind == BindingKind::StoreSub
            } else {
                false
            };

        // Also check for store without $ prefix
        let has_store_binding = if let Some(store_name) = name.strip_prefix('$') {
            context
                .analysis
                .root
                .scope
                .declarations
                .contains_key(store_name)
        } else {
            false
        };

        if !context.analysis.root.scope.declarations.contains_key(name)
            && !is_store_sub
            && !has_store_binding
        {
            // This is a rune - validate it
            return validate_rune_usage(node, name, &context.js_path);
        }
    }

    // Look up the binding
    let binding_idx = match context.analysis.root.scope.declarations.get(name) {
        Some(idx) => *idx,
        None => return Ok(()), // No binding, might be a global
    };

    // Handle legacy mode special variables
    if !context.analysis.runes {
        if name == "$$props" {
            context.analysis.uses_props = true;
        }

        if name == "$$restProps" {
            context.analysis.uses_rest_props = true;
        }
    }

    // Track dependencies and references in the current expression
    if let Some(expression_ptr) = context.expression {
        let expression = unsafe { &mut *expression_ptr };
        expression.dependencies.insert(binding_idx);
        expression.references.insert(binding_idx);

        // Check if this reference involves state
        let binding = &context.analysis.root.bindings[binding_idx];
        let involves_state = binding.kind != BindingKind::Static
            && (binding.kind == BindingKind::Prop
                || binding.kind == BindingKind::BindableProp
                || binding.kind == BindingKind::RestProp
                || !binding.is_function());

        if involves_state {
            expression.has_state = true;
        }
    }

    // TODO: Implement state reference validation
    // TODO: Implement reactive declaration warnings
    // TODO: Implement template declaration validation

    Ok(())
}

/// Validate rune usage (member expressions, call expressions).
///
/// Handles validation of rune syntax like `$state()`, `$derived.by()`, etc.
fn validate_rune_usage(
    node: &Value,
    rune_name: &str,
    js_path: &[Value],
) -> Result<(), AnalysisError> {
    let mut _current_node = node;
    let mut path_idx = if js_path.len() >= 2 {
        js_path.len() - 2
    } else {
        return Ok(());
    };

    let mut current_rune_name = rune_name.to_string();

    // Walk up through MemberExpression chain to build the full rune name
    while path_idx > 0 {
        let parent = &js_path[path_idx];

        if parent.get("type").and_then(|t| t.as_str()) != Some("MemberExpression") {
            break;
        }

        // Check for computed property
        if parent
            .get("computed")
            .and_then(|c| c.as_bool())
            .unwrap_or(false)
        {
            return Err(errors::rune_invalid_computed_property());
        }

        // Build the full rune name
        if let Some(property) = parent.get("property") {
            if let Some(prop_name) = property.get("name").and_then(|n| n.as_str()) {
                let full_name = format!("{}.{}", current_rune_name, prop_name);

                if !is_rune(&full_name) {
                    // Check for renamed runes
                    if full_name == "$effect.active" {
                        return Err(errors::rune_renamed("$effect.active", "$effect.tracking"));
                    }

                    if full_name == "$state.frozen" {
                        return Err(errors::rune_renamed("$state.frozen", "$state.raw"));
                    }

                    if full_name == "$state.is" {
                        return Err(errors::rune_removed("$state.is"));
                    }

                    return Err(errors::rune_invalid_name(&full_name));
                }

                current_rune_name = full_name;
                _current_node = parent;
                path_idx -= 1;
            } else {
                break;
            }
        } else {
            break;
        }
    }

    // After walking the MemberExpression chain, check if it's a CallExpression
    if path_idx > 0 {
        let parent = &js_path[path_idx];
        if parent.get("type").and_then(|t| t.as_str()) != Some("CallExpression") {
            return Err(errors::rune_missing_parentheses());
        }
    }

    Ok(())
}
