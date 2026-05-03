//! Identifier visitor.
//!
//! Analyzes identifier references.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Identifier.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::function::is_rune;
use super::shared::utils::{is_reference, is_reference_for_identifier_typed};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::{AnalysisError, BindingKind, errors, warnings};
use serde_json::Value;

/// Visit an identifier (Value-based path).
///
/// This extracts the name, start, and end from the Value node, checks
/// `is_reference`, then delegates to shared logic in `visit_identifier_inner`.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Get the parent node from js_path
    let parent: Option<&Value> = if context.js_path.len() >= 2 {
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

    let start = node.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as u32;
    let end = node.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as u32;

    visit_identifier_inner(name, start, end, context)
}

/// Visit an identifier (typed JsNode path).
///
/// Fully typed implementation that avoids `to_value()` conversion.
/// Extracts fields directly from the JsNode::Identifier variant,
/// uses `is_reference_for_identifier_typed` for the reference check,
/// then delegates to `visit_identifier_inner`.
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let JsNode::Identifier {
        name, start, end, ..
    } = node
    else {
        return Ok(());
    };

    // Get parent from js_path for is_reference check
    let parent = if context.js_path.len() >= 2 {
        Some(&context.js_path[context.js_path.len() - 2])
    } else {
        None
    };

    // Use typed is_reference check — no Value conversion needed
    if !is_reference_for_identifier_typed(*start, parent, context.parse_arena) {
        return Ok(());
    }

    // Mark the subtree as dynamic
    mark_subtree_dynamic(&context.path);

    visit_identifier_inner(name.as_str(), *start, *end, context)
}

/// Shared identifier visit logic after the reference check.
///
/// Both `visit` (Value-based) and `visit_typed` (JsNode-based) converge here
/// with the identifier's name, start, and end already extracted.
fn visit_identifier_inner(
    name: &str,
    start: u32,
    end: u32,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
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
                n.get_type_str(),
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

        // Also check if the unprefixed name has a store_sub binding
        // The official compiler: context.state.scope.get(node.name.slice(1))?.kind !== 'store_sub'
        let has_store_sub_binding = if let Some(store_name) = name.strip_prefix('$') {
            context
                .analysis
                .root
                .get_binding(store_name, context.scope)
                .map(|idx| context.analysis.root.bindings[idx].kind == BindingKind::StoreSub)
                .unwrap_or(false)
        } else {
            false
        };

        if context
            .analysis
            .root
            .get_binding(name, context.scope)
            .is_none()
            && !is_store_sub
            && !has_store_sub_binding
        {
            // This is a rune - validate it
            return validate_rune_usage(name, &context.js_path, context.parse_arena);
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
    let is_template_reference = matches!(context.ast_type, super::AstType::Template);

    // Check if this reference is inside a `$:` reactive declaration
    // In the official Svelte compiler: path[1].type === 'LabeledStatement' && path[1].label.name === '$'
    let is_reactive_declaration_reference = context.js_path.iter().any(|ancestor| {
        if ancestor.get_type_str() != Some("LabeledStatement") {
            return false;
        }
        // For typed entries, resolve the label child's name via arena
        if let Some(js_node) = ancestor.as_js_node() {
            if let JsNode::LabeledStatement { label, .. } = js_node {
                let label_node = context.parse_arena.get_js_node(*label);
                return label_node.get_field_str("name") == Some("$");
            }
            return false;
        }
        // For value entries, use JSON path
        ancestor
            .get("label")
            .and_then(|l| l.get("name"))
            .and_then(|n| n.as_str())
            == Some("$")
    });

    // Check if this reference is in a StyleDirective
    // StyleDirective shorthand references (e.g., `style:height`) are handled
    // separately in style_directive.rs.
    let is_style_directive_reference = false;

    // Check if this reference is inside an ExportSpecifier (e.g., `export { x }`)
    // Corresponds to the official compiler's filter: r.path.at(-1)?.type !== 'ExportSpecifier'
    let is_export_specifier = context
        .js_path
        .last()
        .is_some_and(|parent| parent.get_type_str() == Some("ExportSpecifier"));

    context.analysis.root.bindings[binding_idx].add_reference_with_flags(
        start,
        end,
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

    // Check for const_tag_invalid_reference:
    // When experimental.async is enabled, a {@const} declaration in a component's/boundary's
    // implicit children snippet cannot be referenced from within a named snippet at the same level.
    // Corresponds to Svelte's Identifier.js L162-191
    if context.analysis.root.bindings[binding_idx].kind == BindingKind::Template
        && context.analysis.experimental_async
    {
        check_const_tag_snippet_reference(name, binding_idx, context)?;
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
        if ancestor.get_type_str() == Some("VariableDeclarator") {
            // Check if the current node's position falls within the `id` pattern range
            let id_start = ancestor.get_child_field_start("id", context.parse_arena);
            let id_end = ancestor.get_child_field_end("id", context.parse_arena);
            if let (Some(id_s), Some(id_e)) = (id_start, id_end) {
                return start >= id_s && start < id_e;
            }
        }
        false
    });

    if context.analysis.runes && !is_declaration_node {
        let binding = &context.analysis.root.bindings[binding_idx];

        // The official Svelte compiler checks:
        //   context.state.function_depth === binding.scope.function_depth
        //
        // We now store function_depth on each Scope, matching the official compiler's
        // approach where function_depth = parent.function_depth + (porous ? 0 : 1).
        // Look up the binding's scope's function_depth from the scope tree.
        let binding_scope_depth = context
            .analysis
            .root
            .all_scopes
            .get(binding.scope_index)
            .map(|s| s.function_depth)
            .unwrap_or(0);

        // Compute absolute context function_depth:
        // - In module/instance scripts: function_depth already matches the scope tree's depth
        // - In template: template level is function_depth 2 (instance scope 1 + 1 for template)
        let absolute_context_depth = match context.ast_type {
            super::AstType::Module => context.function_depth,
            super::AstType::Instance => context.function_depth,
            super::AstType::Template => context.function_depth + 2,
        };

        // Check if the function depths match
        if absolute_context_depth == binding_scope_depth {
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

            // For var-hoisted bindings, skip warning if the reference appears before
            // the declaration in source order. The official Svelte compiler sets binding
            // kinds during the analysis walk (not during scope building), so references
            // before the declaration don't see the rune kind yet. We emulate this by
            // checking source positions.
            let is_before_declaration = binding.declaration_kind
                == crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Var
                && binding
                    .declaration_start
                    .is_some_and(|decl_start| start < decl_start);

            if is_eligible_kind && !is_before_declaration {
                // Check this is a read, not a write
                // parent.type !== 'AssignmentExpression' || parent.left !== node
                // parent.type !== 'UpdateExpression'
                let parent = if context.js_path.len() >= 2 {
                    Some(&context.js_path[context.js_path.len() - 2])
                } else {
                    None
                };

                let is_write = if let Some(parent) = parent {
                    let parent_type = parent.get_type_str();
                    match parent_type {
                        Some("AssignmentExpression") => {
                            // Check if node is the left side
                            parent
                                .get_child_field_start("left", context.parse_arena)
                                .is_some_and(|left_start| left_start == start)
                        }
                        Some("UpdateExpression") => true,
                        _ => false,
                    }
                } else {
                    false
                };

                if !is_write && !context.is_ignored("state_referenced_locally") {
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
                            let ancestor_type = ancestor.get_type_str();

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
                            // is in its arguments (not the direct argument itself).
                            // The official Svelte checks: parent.arguments.includes(context.path[i + 1])
                            // which means the reference must be nested inside an argument,
                            // not BE the direct argument.
                            if ancestor_type == Some("CallExpression") && i + 1 < path_len - 1 {
                                let is_state_rune =
                                    check_callee_is_state_rune(ancestor, context.parse_arena);

                                if is_state_rune {
                                    warning_type = "derived";
                                    break;
                                }
                            }
                        }
                    }

                    context
                        .analysis
                        .warnings
                        .push(warnings::state_referenced_locally(
                            name,
                            warning_type,
                            Some(start),
                            Some(end),
                        ));
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

/// Check if a CallExpression's callee is `$state` or `$state.raw`.
///
/// Works with both typed and value-based JsPathEntry.
fn check_callee_is_state_rune(
    call_entry: &super::JsPathEntry,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    // Try typed path first
    if let Some(callee_node) = call_entry.get_callee_typed(arena) {
        return match callee_node {
            JsNode::Identifier { name, .. } => name.as_str() == "$state",
            JsNode::MemberExpression {
                object, property, ..
            } => {
                let obj = arena.get_js_node(*object);
                let prop = arena.get_js_node(*property);
                obj.get_field_str("name") == Some("$state")
                    && prop.get_field_str("name") == Some("raw")
            }
            _ => false,
        };
    }

    // Fall back to value-based access
    if let Some(callee) = call_entry.get("callee") {
        let is_direct = callee.get("name").and_then(|n| n.as_str()) == Some("$state");
        let is_member = callee.get("type").and_then(|t| t.as_str()) == Some("MemberExpression")
            && callee
                .get("object")
                .and_then(|o| o.get("name").and_then(|n| n.as_str()))
                == Some("$state")
            && callee
                .get("property")
                .and_then(|p| p.get("name").and_then(|n| n.as_str()))
                == Some("raw");
        return is_direct || is_member;
    }

    false
}

/// Validate rune usage (member expressions, call expressions).
///
/// Handles validation of rune syntax like `$state()`, `$derived.by()`, etc.
fn validate_rune_usage(
    rune_name: &str,
    js_path: &[super::JsPathEntry],
    arena: &crate::ast::arena::ParseArena,
) -> Result<(), AnalysisError> {
    let mut path_idx = if js_path.len() >= 2 {
        js_path.len() - 2
    } else {
        return Ok(());
    };

    let mut current_rune_name = rune_name.to_string();

    // Walk up through MemberExpression chain to build the full rune name
    while path_idx > 0 {
        let parent = &js_path[path_idx];

        if parent.get_type_str() != Some("MemberExpression") {
            break;
        }

        // Check for computed property
        if parent.get_field_bool("computed").unwrap_or(false) {
            return Err(errors::rune_invalid_computed_property());
        }

        // Build the full rune name
        // Try typed path first: get the property child's name via arena
        let prop_name: Option<&str> = if let Some(js_node) = parent.as_js_node() {
            if let JsNode::MemberExpression { property, .. } = js_node {
                let prop_node = arena.get_js_node(*property);
                prop_node.get_field_str("name")
            } else {
                None
            }
        } else {
            // Fall back to value-based access for property name
            parent
                .get("property")
                .and_then(|p| p.get("name"))
                .and_then(|n| n.as_str())
        };

        if let Some(prop_name) = prop_name {
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
            path_idx -= 1;
        } else {
            break;
        }
    }

    // After walking the MemberExpression chain, check if it's a CallExpression
    if path_idx > 0 {
        let parent = &js_path[path_idx];
        if parent.get_type_str() != Some("CallExpression") {
            return Err(errors::rune_missing_parentheses());
        }
    }

    Ok(())
}

/// Public alias used by the template-side walker (`walk_js_expression_node`)
/// so it can perform the same `const_tag_invalid_reference` check that the
/// JS-side identifier visitor does. See `check_const_tag_snippet_reference`.
pub(super) fn check_const_tag_snippet_reference_public(
    name: &str,
    binding_idx: usize,
    context: &VisitorContext,
) -> Result<(), AnalysisError> {
    check_const_tag_snippet_reference(name, binding_idx, context)
}

/// Check if a {@const} binding referenced from within a named snippet of a
/// Component or SvelteBoundary is invalid.
///
/// Uses fragment_owner_stack to detect the pattern: we're inside a SnippetBlock
/// that is inside a Component or SvelteBoundary. Then checks if the binding's
/// scope matches the component/boundary's children scope.
///
/// The error should only fire when a {@const} from the parent (implicit children snippet)
/// is referenced from within a named snippet at the same level. {@const} declarations
/// inside the snippet itself are always valid.
fn check_const_tag_snippet_reference(
    name: &str,
    binding_idx: usize,
    context: &VisitorContext,
) -> Result<(), AnalysisError> {
    let binding_scope = context.analysis.root.bindings[binding_idx].scope_index;

    // Walk up the fragment_owner_stack from the end
    let stack = &context.fragment_owner_stack;
    let mut found_snippet = false;
    let mut snippet_scope: Option<usize> = None;
    let mut snippet_name: Option<String> = None;

    for i in (0..stack.len()).rev() {
        match &stack[i] {
            super::FragmentOwnerType::SnippetBlock(scope, sname) => {
                found_snippet = true;
                snippet_scope = Some(*scope);
                snippet_name = Some(sname.clone());
            }
            super::FragmentOwnerType::Component if found_snippet => {
                // For components, all named snippets trigger this check
                if snippet_scope == Some(binding_scope) {
                    return Err(errors::const_tag_invalid_reference(name));
                }
                break;
            }
            super::FragmentOwnerType::SvelteBoundary if found_snippet => {
                // For SvelteBoundary, only 'failed' and 'pending' snippets trigger this check
                // Other named snippets (like 'greet') can freely reference boundary-level {@const}
                if let Some(ref sn) = snippet_name
                    && (sn == "failed" || sn == "pending")
                    && snippet_scope == Some(binding_scope)
                {
                    return Err(errors::const_tag_invalid_reference(name));
                }
                break;
            }
            _ => {
                if found_snippet {
                    break;
                }
            }
        }
    }

    Ok(())
}
