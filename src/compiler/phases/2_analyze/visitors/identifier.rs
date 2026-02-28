//! Identifier visitor.
//!
//! Analyzes identifier references.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Identifier.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::function::is_rune;
use super::shared::utils::is_reference;
use crate::compiler::phases::phase2_analyze::{AnalysisError, BindingKind, errors, warnings};
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

    // Check if this reference is inside an ExportSpecifier (e.g., `export { x }`)
    // Corresponds to the official compiler's filter: r.path.at(-1)?.type !== 'ExportSpecifier'
    let is_export_specifier = context.js_path.last().is_some_and(|parent| {
        parent.get("type").and_then(|t| t.as_str()) == Some("ExportSpecifier")
    });

    context.analysis.root.bindings[binding_idx].add_reference_with_flags(
        start as u32,
        end as u32,
        is_template_reference,
        is_reactive_declaration_reference,
        is_style_directive_reference,
        is_export_specifier,
    );

    // Mark direct template read when in template scope and not inside a function.
    // This is used by non_reactive_update warning to distinguish direct template
    // reads from event handler callback reads.
    // Corresponds to the official compiler's check: path[0].type === 'Fragment'
    // and not inside any FunctionDeclaration/FunctionExpression/ArrowFunctionExpression.
    //
    // Skip for bind:this references - bind:this has special handling in bind_directive.rs
    // where it only sets has_direct_template_read when inside a conditional block
    // (IfBlock, EachBlock, AwaitBlock, KeyBlock). At the top level, bind:this doesn't
    // need state since the element reference never changes.
    if is_template_reference && context.function_depth == 0 && !context.in_bind_this {
        context.analysis.root.bindings[binding_idx].has_direct_template_read = true;
    }

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

    // Implement state_referenced_locally warning
    // Corresponds to Svelte's Identifier.js L104-152
    //
    // The official compiler has `node !== binding.node` check to skip warnings for the
    // declaration identifier itself. We approximate this by checking if the identifier
    // is inside a VariableDeclarator's `id` pattern (which is the declaration site).
    let is_declaration_node = context.js_path.iter().any(|ancestor| {
        let ancestor_type = ancestor.get("type").and_then(|t| t.as_str());
        if ancestor_type == Some("VariableDeclarator") {
            // Check if the current node's position falls within the `id` pattern range
            if let (Some(id_start), Some(id_end), Some(node_start)) = (
                ancestor
                    .get("id")
                    .and_then(|id| id.get("start"))
                    .and_then(|s| s.as_u64()),
                ancestor
                    .get("id")
                    .and_then(|id| id.get("end"))
                    .and_then(|e| e.as_u64()),
                node.get("start").and_then(|s| s.as_u64()),
            ) {
                return node_start >= id_start && node_start < id_end;
            }
        }
        false
    });

    if context.analysis.runes && !is_declaration_node {
        let binding = &context.analysis.root.bindings[binding_idx];
        let instance_scope = context.analysis.root.instance_scope_index;

        // Determine the function_depth of the binding's scope
        // Module scope (0) = function_depth 0, instance scope = function_depth 1
        let binding_function_depth = if binding.scope_index == 0 {
            0
        } else if binding.scope_index == instance_scope {
            1
        } else {
            // For other scopes, we can't easily determine the function depth.
            // Skip the warning for non-top-level bindings.
            usize::MAX
        };

        // Check if the current function_depth matches the binding's scope function_depth
        if context.function_depth == binding_function_depth {
            // Check binding kind eligibility
            let is_eligible_kind = match binding.kind {
                // State: warn if reassigned, or if the initial value is a primitive
                // (in the official compiler this checks should_proxy on the initial argument)
                // We simplify: warn for all $state bindings that are reassigned
                BindingKind::State => {
                    binding.reassigned || {
                        // Also warn if the initial $state() call has an argument that won't be proxied
                        // We approximate: check if initial_node_type is a primitive type
                        binding.initial_node_type.as_deref().is_some_and(|t| {
                            matches!(
                                t,
                                "Literal"
                                    | "TemplateLiteral"
                                    | "BinaryExpression"
                                    | "UnaryExpression"
                                    | "ConditionalExpression"
                                    | "LogicalExpression"
                            )
                        })
                    }
                }
                BindingKind::RawState | BindingKind::Derived => true,
                BindingKind::Prop | BindingKind::RestProp => true,
                _ => false,
            };

            if is_eligible_kind {
                // Check this is a read, not a write
                // parent.type !== 'AssignmentExpression' || parent.left !== node
                // parent.type !== 'UpdateExpression'
                let is_write = if let Some(parent) = parent {
                    let parent_type = parent.get("type").and_then(|t| t.as_str());
                    match parent_type {
                        Some("AssignmentExpression") => {
                            // Check if node is the left side
                            parent
                                .get("left")
                                .and_then(|l| l.get("start"))
                                .and_then(|s| s.as_u64())
                                == node.get("start").and_then(|s| s.as_u64())
                        }
                        Some("UpdateExpression") => true,
                        _ => false,
                    }
                } else {
                    false
                };

                if !is_write {
                    // Determine the warning type: "closure" or "derived"
                    // Walk up the js_path to find if we're inside a $state() or $state.raw() call
                    let mut warning_type = "closure";

                    let path_len = context.js_path.len();
                    if path_len >= 2 {
                        let mut i = path_len - 1; // Start from the parent of the current node
                        loop {
                            if i == 0 {
                                break;
                            }
                            i -= 1;
                            let ancestor = &context.js_path[i];
                            let ancestor_type = ancestor.get("type").and_then(|t| t.as_str());

                            // Stop at function boundaries
                            if matches!(
                                ancestor_type,
                                Some("ArrowFunctionExpression")
                                    | Some("FunctionDeclaration")
                                    | Some("FunctionExpression")
                            ) {
                                break;
                            }

                            // Check if this is a CallExpression and the next path element
                            // is in its arguments
                            if ancestor_type == Some("CallExpression") {
                                // Check if the callee is $state or $state.raw
                                if let Some(callee) = ancestor.get("callee") {
                                    let is_state_rune = callee.get("name").and_then(|n| n.as_str())
                                        == Some("$state")
                                        || (callee.get("type").and_then(|t| t.as_str())
                                            == Some("MemberExpression")
                                            && callee.get("object").and_then(|o| {
                                                o.get("name").and_then(|n| n.as_str())
                                            }) == Some("$state")
                                            && callee.get("property").and_then(|p| {
                                                p.get("name").and_then(|n| n.as_str())
                                            }) == Some("raw"));

                                    if is_state_rune {
                                        warning_type = "derived";
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    context
                        .analysis
                        .warnings
                        .push(warnings::state_referenced_locally(name, warning_type));
                }
            }
        }
    }

    // Implement reactive_declaration_module_script_dependency warning
    // Corresponds to Svelte's Identifier.js L154-159
    if context.in_reactive_declaration {
        let binding = &context.analysis.root.bindings[binding_idx];
        // Check if binding is in module scope (scope_index == 0) and is reassigned
        if binding.scope_index == 0 && binding.reassigned {
            context
                .analysis
                .warnings
                .push(warnings::reactive_declaration_module_script_dependency());
        }
    }

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
