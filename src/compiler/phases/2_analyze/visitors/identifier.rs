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

    // Check for invalid $ or $$ identifiers
    // Corresponds to Svelte's L266-269 and L351-352 in 2-analyze/index.js
    if name == "$" || name.starts_with("$$") {
        // $$ prefixed names except reserved ones ($$props, $$restProps, $$slots) are illegal
        if name != "$$props" && name != "$$restProps" && name != "$$slots" {
            return Err(errors::global_reference_invalid(name));
        }
    }

    // Note: store_invalid_scoped_subscription checks are now handled in
    // store_subscriptions.rs during the initial store detection phase.
    // The check there scans all scopes to detect if the store name is
    // shadowed in any nested scope.

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

    // Handle legacy mode special variables ($$props, $$restProps) early,
    // before the binding lookup, because these may not have registered bindings.
    if !context.analysis.runes {
        if name == "$$props" {
            context.analysis.uses_props = true;
        }
        if name == "$$restProps" {
            context.analysis.uses_rest_props = true;
        }
    }

    // Handle runes in runes mode
    if context.analysis.runes && is_rune(name) {
        // Check if this is actually a rune (not a store subscription)
        let is_store_sub =
            if let Some(binding_idx) = context.analysis.root.get_binding(name, context.scope) {
                let binding = &context.analysis.root.bindings[binding_idx];
                binding.kind == BindingKind::StoreSub
            } else {
                false
            };

        // Also check for store without $ prefix
        let has_store_binding = if let Some(store_name) = name.strip_prefix('$') {
            context
                .analysis
                .root
                .get_binding(store_name, context.scope)
                .is_some()
        } else {
            false
        };

        if context
            .analysis
            .root
            .get_binding(name, context.scope)
            .is_none()
            && !is_store_sub
            && !has_store_binding
        {
            // This is a rune - validate it
            return validate_rune_usage(node, name, &context.js_path);
        }
    }

    // Look up the binding using scope chain traversal
    // This is critical: we need to find bindings in the current scope and parent scopes,
    // not just the root scope. For example, each-block items are declared in the each block's
    // scope and must be found via scope chain lookup.
    let binding_idx = match context.analysis.root.get_binding(name, context.scope) {
        Some(idx) => idx,
        None => return Ok(()), // No binding, might be a global
    };

    // Track this reference on the binding itself
    // This is used by the component_name_lowercase warning to check if an import is referenced
    // Also track if this is a template reference (for legacy state promotion)
    let (start, end) = node
        .get("start")
        .and_then(|s| s.as_u64())
        .zip(node.get("end").and_then(|e| e.as_u64()))
        .unwrap_or((0, 0));
    let is_template_reference = matches!(context.ast_type, super::AstType::Template);

    // Check if this reference is inside a `$:` reactive declaration
    // In the official Svelte compiler: path[1].type === 'LabeledStatement' && path[1].label.name === '$'
    let is_reactive_declaration_reference = context.js_path.iter().any(|ancestor| {
        ancestor.get("type").and_then(|t| t.as_str()) == Some("LabeledStatement")
            && ancestor
                .get("label")
                .and_then(|l| l.get("name"))
                .and_then(|n| n.as_str())
                == Some("$")
    });

    // Check if this reference is in a StyleDirective
    // In the official Svelte compiler, StyleDirective shorthand references are created
    // in the StyleDirective visitor (scope.js), which appends the directive node to the path.
    // In our Rust implementation, the identifier visitor is only called from JS/script
    // processing, so it never encounters StyleDirective context directly.
    // StyleDirective shorthand references (e.g., `style:height`) are handled
    // separately in style_directive.rs.
    let is_style_directive_reference = false;

    context.analysis.root.bindings[binding_idx].add_reference(
        start as u32,
        end as u32,
        is_template_reference,
        is_reactive_declaration_reference,
        is_style_directive_reference,
    );

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
            expression.set_has_state(true);
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
