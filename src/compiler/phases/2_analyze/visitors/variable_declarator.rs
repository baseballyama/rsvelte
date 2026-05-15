//! VariableDeclarator visitor.
//!
//! Analyzes variable declarators, detects runes ($state, $derived, $props),
//! and validates patterns.
//!
//! Corresponds to Svelte's `2-analyze/visitors/VariableDeclarator.js`.

use super::super::{AnalysisError, errors, warnings};
use super::VisitorContext;
use super::shared::utils;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::BindingKind;
use serde_json::Value;

/// Visit a variable declarator.
///
/// Corresponds to `VariableDeclarator` in VariableDeclarator.js.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Ensure no conflict with module imports
    utils::ensure_no_module_import_conflict(node, context)?;

    // Collect svelte-ignore codes from the parent VariableDeclaration's leading comments.
    // This is needed to suppress warnings like `non_reactive_update` when the declaration
    // has a `// svelte-ignore non_reactive_update` comment.
    let ignore_codes = collect_ignore_codes_from_parent(context);
    if !ignore_codes.is_empty() {
        // Store ignore codes on all bindings declared in this declarator
        if let Some(id) = node.get("id") {
            store_ignore_codes_on_bindings(id, &ignore_codes, context);
        }
    }

    if context.analysis.runes {
        // Runes mode path
        visit_runes_mode(node, context)?;
    } else {
        // Non-runes mode - check for invalid rune usage
        visit_non_runes_mode(node, context)?;
    }

    // Handle visitation order
    if let Some(init) = node.get("init") {
        let rune = get_rune(init, context);

        if rune.as_deref() == Some("$props") {
            // For $props(), visit the id with incremented function_depth
            // to prevent erroneous `state_referenced_locally` warnings
            if let Some(id) = node.get("id") {
                let original_depth = context.function_depth;
                context.function_depth += 1;
                super::script::walk_js_node(id, context)?;
                context.function_depth = original_depth;
            }

            // Visit init normally
            super::script::walk_js_node(init, context)?;
        } else {
            // Normal visitation - visit both id and init
            if let Some(id) = node.get("id") {
                super::script::walk_js_node(id, context)?;
            }
            super::script::walk_js_node(init, context)?;
        }
    } else {
        // No init - just visit the id
        if let Some(id) = node.get("id") {
            super::script::walk_js_node(id, context)?;
        }
    }

    Ok(())
}

/// Process variable declarator in runes mode.
fn visit_runes_mode(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let init = node.get("init");
    let rune = init.and_then(|i| get_rune(i, context));

    // Extract paths from the pattern
    let paths = if let Some(id) = node.get("id") {
        extract_paths(id)
    } else {
        Vec::new()
    };

    // Validate identifier names
    // NOTE: In runes mode, we don't pass function_depth to match Svelte behavior
    // where all variable declarations are validated regardless of function depth
    for path in &paths {
        if let Some(name) = path.get("name").and_then(|n| n.as_str())
            && let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name)
        {
            let binding = &context.analysis.root.bindings[binding_idx];
            utils::validate_identifier_name(binding, None)?;
        }
    }

    // Process rune initializers
    if let Some(ref rune_name) = rune {
        match rune_name.as_str() {
            "$state" | "$state.raw" | "$derived" | "$derived.by" | "$props" => {
                update_binding_kinds(&paths, rune_name, node, context)?;
            }
            _ => {}
        }
        // For $state/$state.raw/$derived, extract the rune argument as
        // the binding's initial value so scope.evaluate() can determine
        // if the value is "known" (e.g. $state('y1') -> 'y1' is known).
        if matches!(rune_name.as_str(), "$state" | "$state.raw" | "$derived")
            && let Some(init_node) = init
        {
            let rune_arg = init_node
                .get("arguments")
                .and_then(|a| a.as_array())
                .and_then(|a| a.first());
            if let Some(arg) = rune_arg {
                for path in &paths {
                    if let Some(name) = path.get("name").and_then(|n| n.as_str())
                        && let Some(bi) = context.analysis.root.find_binding_any_scope(name)
                    {
                        let b = &mut context.analysis.root.bindings[bi];
                        // For $derived, always store the argument expression (even non-literals)
                        // so that Phase 3 can analyze dependencies to determine if the value is "known".
                        // For $state/$state.raw, only store literals (non-literal state is reactive by proxy).
                        b.initial = extract_literal_string(arg).or_else(|| {
                            if matches!(rune_name.as_str(), "$derived") {
                                Some(arg.to_string())
                            } else {
                                None
                            }
                        });
                        b.initial_is_defined = is_expression_defined(arg);
                        // Store the AST node type of the initial value for should_proxy()
                        b.initial_node_type =
                            arg.get("type").and_then(|t| t.as_str()).map(String::from);
                        if b.initial_node_type.as_deref() == Some("Identifier") {
                            b.initial_identifier_name =
                                arg.get("name").and_then(|n| n.as_str()).map(String::from);
                        }
                    }
                }
            }
        }
    } else if let Some(init) = init {
        // Non-rune variable declaration - set initial value for constant folding
        for path in &paths {
            if let Some(name) = path.get("name").and_then(|n| n.as_str()) {
                // Prefer a position-based lookup so that identical names in
                // sibling block scopes each get their own `initial_node_type`
                // populated (e.g., several `const newText = \`...\`` in different
                // if-branches). Fall back to scope-chain / any-scope lookup.
                let id_start = path.get("start").and_then(|s| s.as_u64()).map(|s| s as u32);
                let binding_idx = id_start
                    .and_then(|pos| {
                        context
                            .analysis
                            .root
                            .bindings
                            .iter()
                            .position(|b| b.name == name && b.declaration_start == Some(pos))
                    })
                    .or_else(|| context.analysis.root.get_binding(name, context.scope))
                    .or_else(|| context.analysis.root.find_binding_any_scope(name));
                if let Some(binding_idx) = binding_idx {
                    let binding = &mut context.analysis.root.bindings[binding_idx];
                    binding.initial = extract_literal_string(init);
                    binding.initial_is_defined = is_expression_defined(init);
                    // Store the AST node type of the initial value for should_proxy()
                    binding.initial_node_type =
                        init.get("type").and_then(|t| t.as_str()).map(String::from);
                    if binding.initial_node_type.as_deref() == Some("Identifier") {
                        binding.initial_identifier_name =
                            init.get("name").and_then(|n| n.as_str()).map(String::from);
                    }
                }
            }
        }
    }

    // Handle $props() specifically
    if rune.as_deref() == Some("$props") {
        process_props_declaration(node, context)?;
    }

    Ok(())
}

/// Update binding kinds based on rune type.
fn update_binding_kinds(
    paths: &[Value],
    rune: &str,
    node: &Value,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    for path in paths {
        if let Some(name) = path.get("name").and_then(|n| n.as_str()) {
            // Find the correct binding for this declaration. When inside a nested function
            // (function_depth > 1, since instance script starts at depth 1), the merged
            // declarations map might return an outer binding that shadows the inner one.
            // In that case, search inner scopes for the correct binding.
            // Note: We use > 1 (not > 0) because the instance script starts at function_depth=1.
            // Instance-level declarations should use the root scope declarations directly.
            let binding_idx = if context.function_depth > 1 {
                // Search inner scopes (from deepest to shallowest) for a binding that
                // was declared INSIDE a nested function (scope_index > 1 for instance code).
                let mut found = None;
                for scope in context.analysis.root.all_scopes.iter().rev() {
                    if let Some(&idx) = scope.declarations.get(name)
                        && let Some(b) = context.analysis.root.bindings.get(idx)
                        && b.scope_index > 1
                    {
                        found = Some(idx);
                        break;
                    }
                }
                // Fall back to the declarations map
                found.or_else(|| context.analysis.root.scope.declarations.get(name).copied())
            } else {
                context.analysis.root.scope.declarations.get(name).copied()
            };

            let binding_idx = match binding_idx {
                Some(idx) => idx,
                None => continue,
            };
            let binding = &mut context.analysis.root.bindings[binding_idx];

            // Determine the binding kind based on rune and whether it's a rest element
            let is_rest = path
                .get("is_rest")
                .and_then(|r| r.as_bool())
                .unwrap_or(false);

            binding.kind = match rune {
                "$state" => BindingKind::State,
                "$state.raw" => BindingKind::RawState,
                "$derived" | "$derived.by" => BindingKind::Derived,
                "$props" => {
                    if is_rest {
                        BindingKind::RestProp
                    } else {
                        BindingKind::Prop
                    }
                }
                _ => binding.kind,
            };

            // For rest props in ObjectPattern, track excluded properties
            if rune == "$props"
                && is_rest
                && let Some(id) = node.get("id")
                && id.get("type").and_then(|t| t.as_str()) == Some("ObjectPattern")
                && let Some(properties) = id.get("properties").and_then(|p| p.as_array())
            {
                let mut exclude_props = Vec::new();

                for property in properties {
                    if property.get("type").and_then(|t| t.as_str()) == Some("RestElement") {
                        continue;
                    }

                    if let Some(key) = property.get("key") {
                        let key_name = match key.get("type").and_then(|t| t.as_str()) {
                            Some("Identifier") => {
                                key.get("name").and_then(|n| n.as_str()).map(String::from)
                            }
                            Some("Literal") => key.get("value").and_then(|v| {
                                v.as_str()
                                    .map(|s| s.to_string())
                                    .or_else(|| v.as_i64().map(|n| n.to_string()))
                            }),
                            _ => None,
                        };

                        if let Some(name) = key_name {
                            exclude_props.push(name);
                        }
                    }
                }

                // Store exclude_props in binding metadata
                let binding = &mut context.analysis.root.bindings[binding_idx];
                binding.exclude_props = exclude_props;
            }
        }
    }

    Ok(())
}

/// Process $props() declaration.
fn process_props_declaration(
    node: &Value,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let id = node.get("id");

    // Validate pattern type
    if let Some(id) = id {
        let id_type = id.get("type").and_then(|t| t.as_str());

        if !matches!(id_type, Some("ObjectPattern") | Some("Identifier")) {
            return Err(errors::props_invalid_identifier());
        }

        // Warn about custom element configuration
        // Only warn if custom element is set AND customElement.props is not specified
        let custom_elem_has_no_props = context
            .analysis
            .custom_element
            .as_ref()
            .is_some_and(|ce| ce.props.is_none());
        if custom_elem_has_no_props {
            let warn_on = if id_type == Some("Identifier") {
                true
            } else if id_type == Some("ObjectPattern") {
                // Check if there's a RestElement
                id.get("properties")
                    .and_then(|p| p.as_array())
                    .map(|props| {
                        props
                            .iter()
                            .any(|p| p.get("type").and_then(|t| t.as_str()) == Some("RestElement"))
                    })
                    .unwrap_or(false)
            } else {
                false
            };

            if warn_on {
                context.emit_warning(warnings::custom_element_props_identifier_rest());
            }
        }

        // Set needs_props flag
        context.analysis.needs_props = true;

        // Handle different pattern types
        match id_type {
            Some("Identifier") => {
                // `let props = $props()`
                if let Some(name) = id.get("name").and_then(|n| n.as_str())
                    && let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name)
                {
                    let binding = &mut context.analysis.root.bindings[binding_idx];
                    binding.initial = None; // Clear initial ($props() call)
                    binding.kind = BindingKind::RestProp;
                }
            }
            Some("ObjectPattern") => {
                // `let { a, b = 1, ...rest } = $props()`
                process_props_object_pattern(id, context)?;
            }
            _ => {}
        }
    }

    Ok(())
}

/// Process ObjectPattern in $props() declaration.
fn process_props_object_pattern(
    pattern: &Value,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
        for property in properties {
            let prop_type = property.get("type").and_then(|t| t.as_str());

            // Handle RestElement: `let { a, ...rest } = $props()`
            // The `rest` binding must be classified as RestProp so that
            // store_subscriptions.rs does not treat `$props` as a store.
            if prop_type == Some("RestElement") {
                if let Some(arg) = property.get("argument")
                    && arg.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                    && let Some(name) = arg.get("name").and_then(|n| n.as_str())
                {
                    // Try the same lookup as for Identifier pattern (root scope first)
                    let binding_idx = context
                        .analysis
                        .root
                        .scope
                        .declarations
                        .get(name)
                        .copied()
                        .or_else(|| context.analysis.root.find_binding_any_scope(name));
                    if let Some(idx) = binding_idx {
                        context.analysis.root.bindings[idx].kind = BindingKind::RestProp;
                    }
                }
                continue;
            }

            if prop_type != Some("Property") {
                continue;
            }

            // Check for computed property
            if property
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false)
            {
                return Err(errors::props_invalid_pattern());
            }

            // Check for illegal property name (starting with $$)
            if let Some(key) = property.get("key")
                && key.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                && let Some(name) = key.get("name").and_then(|n| n.as_str())
                && name.starts_with("$$")
            {
                return Err(errors::props_illegal_name());
            }

            // Get the value node (the variable being bound)
            let value = property
                .get("value")
                .and_then(|v| {
                    // Handle AssignmentPattern (default value)
                    if v.get("type").and_then(|t| t.as_str()) == Some("AssignmentPattern") {
                        v.get("left")
                    } else {
                        Some(v)
                    }
                })
                .ok_or_else(errors::props_invalid_pattern)?;

            // Value must be an Identifier
            if value.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
                return Err(errors::props_invalid_pattern());
            }

            let value_name = value
                .get("name")
                .and_then(|n| n.as_str())
                .ok_or_else(errors::props_invalid_pattern)?;

            // Get the alias (property key name)
            let alias = if let Some(key) = property.get("key") {
                match key.get("type").and_then(|t| t.as_str()) {
                    Some("Identifier") => {
                        key.get("name").and_then(|n| n.as_str()).map(String::from)
                    }
                    Some("Literal") => key.get("value").and_then(|v| {
                        v.as_str()
                            .map(|s| s.to_string())
                            .or_else(|| v.as_i64().map(|n| n.to_string()))
                    }),
                    _ => None,
                }
            } else {
                None
            }
            .ok_or_else(errors::props_invalid_pattern)?;

            // Get initial value (default value from AssignmentPattern)
            let initial = property.get("value").and_then(|v| {
                if v.get("type").and_then(|t| t.as_str()) == Some("AssignmentPattern") {
                    v.get("right")
                } else {
                    None
                }
            });

            // Update binding
            if let Some(&binding_idx) = context.analysis.root.scope.declarations.get(value_name) {
                let binding = &mut context.analysis.root.bindings[binding_idx];
                binding.prop_alias = Some(alias);

                // Default to Prop kind (will be overwritten if $bindable)
                binding.kind = BindingKind::Prop;

                // Check for $bindable() wrapper
                if let Some(init) = initial {
                    if init.get("type").and_then(|t| t.as_str()) == Some("CallExpression")
                        && let Some(callee) = init.get("callee")
                        && callee.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                        && callee.get("name").and_then(|n| n.as_str()) == Some("$bindable")
                    {
                        // Extract the argument from $bindable()
                        let bindable_arg = init
                            .get("arguments")
                            .and_then(|args| args.as_array())
                            .and_then(|args| args.first())
                            .cloned();

                        binding.initial = bindable_arg.map(|arg| {
                            // Convert to string representation
                            // TODO: Properly serialize expression
                            format!("{:?}", arg)
                        });
                        // For $bindable(), store the argument's type if available
                        let bindable_first_arg = init
                            .get("arguments")
                            .and_then(|args| args.as_array())
                            .and_then(|args| args.first());
                        binding.initial_node_type = bindable_first_arg
                            .and_then(|arg| arg.get("type"))
                            .and_then(|t| t.as_str())
                            .map(String::from);
                        if binding.initial_node_type.as_deref() == Some("Identifier") {
                            binding.initial_identifier_name = bindable_first_arg
                                .and_then(|arg| arg.get("name"))
                                .and_then(|n| n.as_str())
                                .map(String::from);
                        }
                        binding.kind = BindingKind::BindableProp;
                    } else {
                        // Regular initial value - extract literal if possible.
                        // If extract_literal_string returns None (e.g., for identifier defaults
                        // like `{children = snippet}`), still set initial to Some(...) so that
                        // is_prop_source correctly identifies this as having a default value.
                        // In the official Svelte, binding.initial is the AST node itself,
                        // and is_prop_source checks truthiness (any value = has default).
                        binding.initial =
                            extract_literal_string(init).or_else(|| Some(init.to_string()));
                        binding.initial_node_type =
                            init.get("type").and_then(|t| t.as_str()).map(String::from);
                        if binding.initial_node_type.as_deref() == Some("Identifier") {
                            binding.initial_identifier_name =
                                init.get("name").and_then(|n| n.as_str()).map(String::from);
                        }
                    }
                } else {
                    binding.initial = None;
                }
            }
        }
    }

    Ok(())
}

/// Process variable declarator in non-runes mode.
fn visit_non_runes_mode(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let init = node.get("init");

    // Extract paths from the pattern for validation
    let paths = if let Some(id) = node.get("id") {
        extract_paths(id)
    } else {
        Vec::new()
    };

    // NOTE: In non-runes mode, we do NOT validate dollar-prefix identifiers for
    // variable declarations. In the official Svelte compiler, `validate_identifier_name`
    // is only called in VariableDeclarator.js when in runes mode (not in legacy mode).
    // In legacy mode, `$foo` top-level variables become store subscriptions (not errors),
    // and `$foo` inside function bodies are allowed as local variables shadowing stores.
    // See: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/VariableDeclarator.js

    // Check for invalid rune usage
    if let Some(init) = init
        && init.get("type").and_then(|t| t.as_str()) == Some("CallExpression")
        && let Some(callee) = init.get("callee")
        && callee.get("type").and_then(|t| t.as_str()) == Some("Identifier")
        && let Some(name) = callee.get("name").and_then(|n| n.as_str())
    {
        // Check if it's a rune call
        if matches!(name, "$state" | "$derived" | "$props") {
            // Make sure it's not a store subscription
            let is_store_sub = context
                .analysis
                .root
                .scope
                .declarations
                .get(name)
                .and_then(|&idx| context.analysis.root.bindings.get(idx))
                .map(|binding| binding.kind == BindingKind::StoreSub)
                .unwrap_or(false);

            if !is_store_sub {
                return Err(errors::rune_invalid_usage(name));
            }
        }
    }

    // Set initial value for constant folding
    if let Some(init) = init {
        for path in &paths {
            if let Some(name) = path.get("name").and_then(|n| n.as_str())
                && let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name)
            {
                let binding = &mut context.analysis.root.bindings[binding_idx];
                binding.initial = extract_literal_string(init);
                binding.initial_is_defined = is_expression_defined(init);
                binding.initial_node_type =
                    init.get("type").and_then(|t| t.as_str()).map(String::from);
            }
        }
    }

    Ok(())
}

/// Get the rune name from a CallExpression node, if it is a rune call.
///
/// Returns Some(rune_name) if the call is a rune, None otherwise.
fn get_rune(node: &Value, context: &VisitorContext) -> Option<String> {
    if node.get("type").and_then(|t| t.as_str()) != Some("CallExpression") {
        return None;
    }

    let callee = node.get("callee")?;
    let keypath = get_global_keypath(callee, context)?;

    if super::shared::function::is_rune(&keypath) {
        Some(keypath)
    } else {
        None
    }
}

/// Get the global keypath of an expression.
///
/// Corresponds to `get_global_keypath` in scope.js.
fn get_global_keypath(node: &Value, context: &VisitorContext) -> Option<String> {
    let mut n = node;
    let mut joined = String::new();

    // Handle MemberExpression chain
    while n.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        if n.get("computed").and_then(|c| c.as_bool()).unwrap_or(false) {
            return None;
        }

        let property = n.get("property")?;
        if property.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
            return None;
        }

        let prop_name = property.get("name").and_then(|n| n.as_str())?;
        joined = format!(".{}{}", prop_name, joined);

        n = n.get("object")?;
    }

    // Handle CallExpression (for patterns like `$inspect().with`)
    if n.get("type").and_then(|t| t.as_str()) == Some("CallExpression") {
        let callee = n.get("callee")?;
        if callee.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
            return None;
        }
        joined = format!("(){}", joined);
        n = callee;
    }

    // Must be an Identifier at the base
    if n.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
        return None;
    }

    let name = n.get("name").and_then(|n| n.as_str())?;

    // Check if it's a binding (if so, it's not a global/rune)
    // Must check ALL scopes (not just root) to detect imports and other declarations
    // that shadow rune names. For example, `import { state } from './store.js'`
    // means `$state(0)` is a store call, not a rune call.
    if context.analysis.root.find_binding_any_scope(name).is_some() {
        return None;
    }

    Some(format!("{}{}", name, joined))
}

/// Extract paths from a pattern (Identifier, ArrayPattern, ObjectPattern).
///
/// This is a simplified version of `extract_paths` from utils/ast.js.
/// Returns an array of path objects with `name` and `is_rest` fields.
fn extract_paths(pattern: &Value) -> Vec<Value> {
    let mut paths = Vec::new();
    extract_paths_recursive(pattern, &mut paths, false);
    paths
}

fn extract_paths_recursive(pattern: &Value, paths: &mut Vec<Value>, is_rest: bool) {
    match pattern.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => {
            paths.push(serde_json::json!({
                "name": pattern.get("name"),
                "start": pattern.get("start"),
                "is_rest": is_rest,
            }));
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        if element.get("type").and_then(|t| t.as_str()) == Some("RestElement") {
                            if let Some(argument) = element.get("argument") {
                                extract_paths_recursive(argument, paths, true);
                            }
                        } else {
                            extract_paths_recursive(element, paths, false);
                        }
                    }
                }
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if property.get("type").and_then(|t| t.as_str()) == Some("RestElement") {
                        if let Some(argument) = property.get("argument") {
                            extract_paths_recursive(argument, paths, true);
                        }
                    } else if let Some(value) = property.get("value") {
                        extract_paths_recursive(value, paths, false);
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = pattern.get("left") {
                extract_paths_recursive(left, paths, is_rest);
            }
        }
        _ => {}
    }
}

/// Check if an expression is guaranteed to produce a defined value.
fn is_expression_defined(node: &Value) -> bool {
    let Some(node_type) = node.get("type").and_then(|t| t.as_str()) else {
        return false;
    };
    match node_type {
        "Literal" => {
            if let Some(value) = node.get("value") {
                !value.is_null()
            } else {
                node.get("raw")
                    .and_then(|r| r.as_str())
                    .map(|r| r != "null")
                    .unwrap_or(false)
            }
        }
        "BinaryExpression" => {
            let op = node.get("operator").and_then(|o| o.as_str()).unwrap_or("");
            matches!(
                op,
                "==" | "!=" | "===" | "!==" | "<" | ">" | "<=" | ">=" | "instanceof" | "in"
            )
        }
        "LogicalExpression" => {
            let op = node.get("operator").and_then(|o| o.as_str()).unwrap_or("");
            if op == "??" {
                node.get("right")
                    .map(is_expression_defined)
                    .unwrap_or(false)
            } else {
                false
            }
        }
        "UnaryExpression" => {
            let op = node.get("operator").and_then(|o| o.as_str()).unwrap_or("");
            op != "void"
        }
        "ConditionalExpression" => {
            let c = node
                .get("consequent")
                .map(is_expression_defined)
                .unwrap_or(false);
            let a = node
                .get("alternate")
                .map(is_expression_defined)
                .unwrap_or(false);
            c && a
        }
        "ArrayExpression"
        | "ObjectExpression"
        | "ArrowFunctionExpression"
        | "FunctionExpression"
        | "TemplateLiteral"
        | "NewExpression" => true,
        "AssignmentExpression" => node
            .get("right")
            .map(is_expression_defined)
            .unwrap_or(false),
        "SequenceExpression" => node
            .get("expressions")
            .and_then(|e| e.as_array())
            .and_then(|arr| arr.last())
            .map(is_expression_defined)
            .unwrap_or(false),
        _ => false,
    }
}

/// Extract a literal string representation from an AST node.
///
/// For Literal nodes, returns the raw string representation (e.g., "'world'", "42").
/// For other nodes, returns None (cannot be folded at compile time).
fn extract_literal_string(node: &Value) -> Option<String> {
    let node_type = node.get("type").and_then(|t| t.as_str())?;

    match node_type {
        "Literal" => {
            // Check for raw (preferred for strings) or value
            if let Some(raw) = node.get("raw").and_then(|r| r.as_str()) {
                return Some(raw.to_string());
            }
            // Fall back to value representation
            if let Some(value) = node.get("value") {
                if let Some(s) = value.as_str() {
                    return Some(format!("'{}'", s));
                } else if let Some(n) = value.as_f64() {
                    if n.fract() == 0.0 && n.abs() < i64::MAX as f64 {
                        return Some(format!("{}", n as i64));
                    }
                    return Some(n.to_string());
                } else if let Some(b) = value.as_bool() {
                    return Some(b.to_string());
                } else if value.is_null() {
                    return Some("null".to_string());
                }
            }
            None
        }
        "Identifier" => {
            // Handle undefined and other simple identifiers
            let name = node.get("name").and_then(|n| n.as_str())?;
            if name == "undefined" {
                return Some("undefined".to_string());
            }
            // For other identifiers, we can't fold them at this stage
            None
        }
        "TemplateLiteral" => {
            // Handle template literals without expressions
            // A TemplateLiteral with no expressions is a known value at compile time
            let expressions = node.get("expressions").and_then(|e| e.as_array())?;
            if expressions.is_empty() {
                // Return the JSON string representation for is_initial_value_literal_or_known
                // to recognize it as a known value
                return Some(node.to_string());
            }
            None
        }
        _ => None,
    }
}

/// Collect svelte-ignore codes from the parent VariableDeclaration's or
/// ExportNamedDeclaration's leading comments.
fn collect_ignore_codes_from_parent(context: &VisitorContext) -> Vec<String> {
    // Look for the parent VariableDeclaration or ExportNamedDeclaration in the js_path.
    // For `export let x`, the AST is:
    //   ExportNamedDeclaration (may have leadingComments)
    //     └─ VariableDeclaration (may have leadingComments)
    //          └─ VariableDeclarator
    // We need to check both for leading comments.
    // Skip the last element in js_path (the VariableDeclarator itself) since
    // walk_js_node pushes the current node before calling visit().
    let mut codes = Vec::new();
    let path_len = context.js_path.len();
    if path_len < 2 {
        return codes;
    }
    for node in context.js_path[..path_len - 1].iter().rev() {
        let node_type = node.get("type").and_then(|t| t.as_str());
        match node_type {
            Some("VariableDeclaration") | Some("ExportNamedDeclaration") => {
                if let Some(comments) = node.get("leadingComments").and_then(|c| c.as_array()) {
                    for comment in comments {
                        if let Some(value) = comment.get("value").and_then(|v| v.as_str()) {
                            let extracted =
                                crate::compiler::phases::phase2_analyze::utils::extract_svelte_ignore(
                                    value,
                                    context.analysis.runes,
                                );
                            codes.extend(extracted);
                        }
                    }
                }
                // Stop after ExportNamedDeclaration (we've checked both levels)
                if node_type == Some("ExportNamedDeclaration") {
                    break;
                }
            }
            _ => break,
        }
    }
    codes
}

/// Store ignore codes on all bindings declared by a pattern (Identifier, ObjectPattern, ArrayPattern).
fn store_ignore_codes_on_bindings(
    id: &Value,
    ignore_codes: &[String],
    context: &mut VisitorContext,
) {
    match id.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => {
            if let Some(name) = id.get("name").and_then(|n| n.as_str())
                && let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name)
            {
                context.analysis.root.bindings[binding_idx].ignore_codes = ignore_codes.to_vec();
            }
        }
        Some("ObjectPattern") => {
            if let Some(props) = id.get("properties").and_then(|p| p.as_array()) {
                for prop in props {
                    if let Some(value) = prop.get("value") {
                        store_ignore_codes_on_bindings(value, ignore_codes, context);
                    } else if prop.get("type").and_then(|t| t.as_str()) == Some("RestElement")
                        && let Some(argument) = prop.get("argument")
                    {
                        store_ignore_codes_on_bindings(argument, ignore_codes, context);
                    }
                }
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = id.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        store_ignore_codes_on_bindings(element, ignore_codes, context);
                    }
                }
            }
        }
        Some("RestElement") => {
            if let Some(argument) = id.get("argument") {
                store_ignore_codes_on_bindings(argument, ignore_codes, context);
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = id.get("left") {
                store_ignore_codes_on_bindings(left, ignore_codes, context);
            }
        }
        _ => {}
    }
}

// ---------------------------------------------------------------------------
// Typed (JsNode) path — avoids `node.to_value()` on the hot path
// ---------------------------------------------------------------------------

/// Visit a variable declarator (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let JsNode::VariableDeclarator { id, init, .. } = node else {
        return Ok(());
    };
    let arena = context.parse_arena;
    let id_node = arena.get_js_node(*id);

    // ensure_no_module_import_conflict (typed)
    if matches!(context.ast_type, super::AstType::Instance) && context.function_depth == 1 {
        let identifiers = utils::extract_identifiers_node(id_node, arena);
        for name in identifiers {
            if context
                .analysis
                .module_scope_declarations
                .contains_key(&name)
            {
                return Err(errors::declaration_duplicate_module_import());
            }
        }
    }

    // Collect svelte-ignore codes from parent
    let ignore_codes = collect_ignore_codes_from_parent(context);
    if !ignore_codes.is_empty() {
        store_ignore_codes_on_bindings_typed(id_node, &ignore_codes, context);
    }

    // Runes/non-runes mode processing (typed)
    let init_node = init.map(|init_id| arena.get_js_node(init_id));
    if context.analysis.runes {
        visit_runes_mode_typed(id_node, init_node, context)?;
    } else {
        visit_non_runes_mode_typed(id_node, init_node, context)?;
    }

    // Handle visitation order with typed traversal
    if let Some(init_node) = init_node {
        let rune = super::shared::utils::get_rune_from_node(
            init_node,
            &context.analysis.root.scope,
            arena,
        );

        if rune.as_deref() == Some("$props") {
            let original_depth = context.function_depth;
            context.function_depth += 1;
            super::script::walk_js_node_typed(id_node, context)?;
            context.function_depth = original_depth;
            super::script::walk_js_node_typed(init_node, context)?;
        } else {
            super::script::walk_js_node_typed(id_node, context)?;
            super::script::walk_js_node_typed(init_node, context)?;
        }
    } else {
        super::script::walk_js_node_typed(id_node, context)?;
    }

    Ok(())
}

/// A lightweight path entry extracted from JsNode patterns.
struct PathEntry {
    name: String,
    is_rest: bool,
    start: u32,
}

/// Extract paths from a JsNode pattern (Identifier, ArrayPattern, ObjectPattern).
fn extract_paths_typed(pattern: &JsNode, arena: &crate::ast::arena::ParseArena) -> Vec<PathEntry> {
    let mut paths = Vec::new();
    extract_paths_typed_recursive(pattern, &mut paths, false, arena);
    paths
}

fn extract_paths_typed_recursive(
    pattern: &JsNode,
    paths: &mut Vec<PathEntry>,
    is_rest: bool,
    arena: &crate::ast::arena::ParseArena,
) {
    match pattern {
        JsNode::Identifier { name, start, .. } => {
            paths.push(PathEntry {
                name: name.to_string(),
                is_rest,
                start: *start,
            });
        }
        JsNode::ArrayPattern { elements, .. } => {
            for element in elements.iter().flatten() {
                if let JsNode::RestElement { argument, .. } = element {
                    extract_paths_typed_recursive(arena.get_js_node(*argument), paths, true, arena);
                } else {
                    extract_paths_typed_recursive(element, paths, false, arena);
                }
            }
        }
        JsNode::ObjectPattern { properties, .. } => {
            for prop in arena.get_js_children(*properties) {
                if let JsNode::RestElement { argument, .. } = prop {
                    extract_paths_typed_recursive(arena.get_js_node(*argument), paths, true, arena);
                } else if let JsNode::Property { value, .. } = prop {
                    extract_paths_typed_recursive(arena.get_js_node(*value), paths, false, arena);
                }
            }
        }
        JsNode::AssignmentPattern { left, .. } => {
            extract_paths_typed_recursive(arena.get_js_node(*left), paths, is_rest, arena);
        }
        _ => {}
    }
}

/// Extract a literal string representation from a JsNode.
fn extract_literal_string_typed(node: &JsNode) -> Option<String> {
    match node {
        JsNode::Literal { raw, value, .. } => {
            if !raw.is_empty() {
                return Some(raw.to_string());
            }
            match value {
                crate::ast::typed_expr::LiteralValue::String(s) => Some(format!("'{}'", s)),
                crate::ast::typed_expr::LiteralValue::Number(n) => {
                    if n.fract() == 0.0 && n.abs() < i64::MAX as f64 {
                        Some(format!("{}", *n as i64))
                    } else {
                        Some(n.to_string())
                    }
                }
                crate::ast::typed_expr::LiteralValue::Bool(b) => Some(b.to_string()),
                crate::ast::typed_expr::LiteralValue::Null => Some("null".to_string()),
                crate::ast::typed_expr::LiteralValue::Regex(_) => None,
            }
        }
        JsNode::Identifier { name, .. } => {
            if name == "undefined" {
                Some("undefined".to_string())
            } else {
                None
            }
        }
        JsNode::TemplateLiteral { expressions, .. } => {
            if expressions.is_empty() {
                Some(node.to_json_string())
            } else {
                None
            }
        }
        _ => None,
    }
}

/// Check if a JsNode expression is guaranteed to produce a defined value.
fn is_expression_defined_typed(node: &JsNode, arena: &crate::ast::arena::ParseArena) -> bool {
    match node {
        JsNode::Literal { value, raw, .. } => match value {
            crate::ast::typed_expr::LiteralValue::Null => false,
            _ => raw.as_str() != "null",
        },
        JsNode::BinaryExpression { operator, .. } => {
            matches!(
                operator.as_str(),
                "==" | "!=" | "===" | "!==" | "<" | ">" | "<=" | ">=" | "instanceof" | "in"
            )
        }
        JsNode::LogicalExpression {
            operator, right, ..
        } if operator == "??" => is_expression_defined_typed(arena.get_js_node(*right), arena),
        JsNode::UnaryExpression { operator, .. } => operator != "void",
        JsNode::ConditionalExpression {
            consequent,
            alternate,
            ..
        } => {
            is_expression_defined_typed(arena.get_js_node(*consequent), arena)
                && is_expression_defined_typed(arena.get_js_node(*alternate), arena)
        }
        JsNode::ArrayExpression { .. }
        | JsNode::ObjectExpression { .. }
        | JsNode::ArrowFunctionExpression { .. }
        | JsNode::FunctionExpression { .. }
        | JsNode::TemplateLiteral { .. }
        | JsNode::NewExpression { .. } => true,
        JsNode::AssignmentExpression { right, .. } => {
            is_expression_defined_typed(arena.get_js_node(*right), arena)
        }
        JsNode::SequenceExpression { expressions, .. } => {
            let exprs = arena.get_js_children(*expressions);
            exprs
                .last()
                .map(|last| is_expression_defined_typed(last, arena))
                .unwrap_or(false)
        }
        JsNode::Raw(value) => is_expression_defined(value),
        _ => false,
    }
}

/// Process variable declarator in runes mode (typed).
fn visit_runes_mode_typed(
    id_node: &JsNode,
    init_node: Option<&JsNode>,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    let rune = init_node.and_then(|i| {
        super::shared::utils::get_rune_from_node(i, &context.analysis.root.scope, arena)
    });

    // Extract paths from the pattern
    let paths = extract_paths_typed(id_node, arena);

    // Validate identifier names
    for path in &paths {
        if let Some(&binding_idx) = context
            .analysis
            .root
            .scope
            .declarations
            .get(path.name.as_str())
        {
            let binding = &context.analysis.root.bindings[binding_idx];
            utils::validate_identifier_name(binding, None)?;
        }
    }

    // Process rune initializers
    if let Some(ref rune_name) = rune {
        match rune_name.as_str() {
            "$state" | "$state.raw" | "$derived" | "$derived.by" | "$props" => {
                update_binding_kinds_typed(&paths, rune_name, id_node, context)?;
            }
            _ => {}
        }
        // For $state/$state.raw/$derived, extract the rune argument as
        // the binding's initial value
        if matches!(rune_name.as_str(), "$state" | "$state.raw" | "$derived")
            && let Some(init) = init_node
        {
            let rune_arg = match init {
                JsNode::CallExpression { arguments, .. } => {
                    let args = arena.get_js_children(*arguments);
                    args.first()
                }
                _ => None,
            };
            if let Some(arg) = rune_arg {
                for path in &paths {
                    if let Some(bi) = context.analysis.root.find_binding_any_scope(&path.name) {
                        let b = &mut context.analysis.root.bindings[bi];
                        b.initial = extract_literal_string_typed(arg).or_else(|| {
                            if rune_name == "$derived" {
                                Some(arg.to_json_string())
                            } else {
                                None
                            }
                        });
                        b.initial_is_defined = is_expression_defined_typed(arg, arena);
                        b.initial_node_type = Some(arg.type_str().to_string());
                        if b.initial_node_type.as_deref() == Some("Identifier")
                            && let JsNode::Identifier { name, .. } = arg
                        {
                            b.initial_identifier_name = Some(name.to_string());
                        }
                    }
                }
            }
        }
    } else if let Some(init) = init_node {
        // Non-rune variable declaration - set initial value for constant folding
        for path in &paths {
            // Prefer position-based lookup to disambiguate same-name bindings
            // declared in sibling block scopes.
            let binding_idx = context
                .analysis
                .root
                .bindings
                .iter()
                .position(|b| b.name == path.name && b.declaration_start == Some(path.start))
                .or_else(|| context.analysis.root.get_binding(&path.name, context.scope))
                .or_else(|| context.analysis.root.find_binding_any_scope(&path.name));
            if let Some(binding_idx) = binding_idx {
                let binding = &mut context.analysis.root.bindings[binding_idx];
                binding.initial = extract_literal_string_typed(init);
                binding.initial_is_defined = is_expression_defined_typed(init, arena);
                binding.initial_node_type = Some(init.type_str().to_string());
                if binding.initial_node_type.as_deref() == Some("Identifier")
                    && let JsNode::Identifier { name, .. } = init
                {
                    binding.initial_identifier_name = Some(name.to_string());
                }
            }
        }
    }

    // Handle $props() specifically
    if rune.as_deref() == Some("$props") {
        process_props_declaration_typed(id_node, context)?;
    }

    Ok(())
}

/// Update binding kinds based on rune type (typed).
fn update_binding_kinds_typed(
    paths: &[PathEntry],
    rune: &str,
    id_node: &JsNode,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    for path in paths {
        let binding_idx = if context.function_depth > 1 {
            let mut found = None;
            for scope in context.analysis.root.all_scopes.iter().rev() {
                if let Some(&idx) = scope.declarations.get(path.name.as_str())
                    && let Some(b) = context.analysis.root.bindings.get(idx)
                    && b.scope_index > 1
                {
                    found = Some(idx);
                    break;
                }
            }
            found.or_else(|| {
                context
                    .analysis
                    .root
                    .scope
                    .declarations
                    .get(path.name.as_str())
                    .copied()
            })
        } else {
            context
                .analysis
                .root
                .scope
                .declarations
                .get(path.name.as_str())
                .copied()
        };

        let binding_idx = match binding_idx {
            Some(idx) => idx,
            None => continue,
        };
        let binding = &mut context.analysis.root.bindings[binding_idx];

        binding.kind = match rune {
            "$state" => BindingKind::State,
            "$state.raw" => BindingKind::RawState,
            "$derived" | "$derived.by" => BindingKind::Derived,
            "$props" => {
                if path.is_rest {
                    BindingKind::RestProp
                } else {
                    BindingKind::Prop
                }
            }
            _ => binding.kind,
        };

        // For rest props in ObjectPattern, track excluded properties
        if rune == "$props"
            && path.is_rest
            && let JsNode::ObjectPattern { properties, .. } = id_node
        {
            let mut exclude_props = Vec::new();
            for property in arena.get_js_children(*properties) {
                if matches!(property, JsNode::RestElement { .. }) {
                    continue;
                }
                if let JsNode::Property { key, .. } = property {
                    let key_node = arena.get_js_node(*key);
                    let key_name = match key_node {
                        JsNode::Identifier { name, .. } => Some(name.to_string()),
                        JsNode::Literal { value, .. } => match value {
                            crate::ast::typed_expr::LiteralValue::String(s) => Some(s.to_string()),
                            crate::ast::typed_expr::LiteralValue::Number(n) => {
                                Some((*n as i64).to_string())
                            }
                            _ => None,
                        },
                        _ => None,
                    };
                    if let Some(name) = key_name {
                        exclude_props.push(name);
                    }
                }
            }
            let binding = &mut context.analysis.root.bindings[binding_idx];
            binding.exclude_props = exclude_props;
        }
    }

    Ok(())
}

/// Process $props() declaration (typed).
fn process_props_declaration_typed(
    id_node: &JsNode,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    let id_type = id_node.type_str();

    if !matches!(id_type, "ObjectPattern" | "Identifier") {
        return Err(errors::props_invalid_identifier());
    }

    // Warn about custom element configuration
    let custom_elem_has_no_props = context
        .analysis
        .custom_element
        .as_ref()
        .is_some_and(|ce| ce.props.is_none());
    if custom_elem_has_no_props {
        let warn_on = if id_type == "Identifier" {
            true
        } else if let JsNode::ObjectPattern { properties, .. } = id_node {
            arena
                .get_js_children(*properties)
                .iter()
                .any(|p| matches!(p, JsNode::RestElement { .. }))
        } else {
            false
        };

        if warn_on {
            context.emit_warning(warnings::custom_element_props_identifier_rest());
        }
    }

    context.analysis.needs_props = true;

    match id_node {
        JsNode::Identifier { name, .. } => {
            if let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name.as_str())
            {
                let binding = &mut context.analysis.root.bindings[binding_idx];
                binding.initial = None;
                binding.kind = BindingKind::RestProp;
            }
        }
        JsNode::ObjectPattern { .. } => {
            process_props_object_pattern_typed(id_node, context)?;
        }
        _ => {}
    }

    Ok(())
}

/// Process ObjectPattern in $props() declaration (typed).
fn process_props_object_pattern_typed(
    pattern: &JsNode,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    let JsNode::ObjectPattern { properties, .. } = pattern else {
        return Ok(());
    };

    for property in arena.get_js_children(*properties) {
        // Handle RestElement
        if let JsNode::RestElement { argument, .. } = property {
            let arg_node = arena.get_js_node(*argument);
            if let JsNode::Identifier { name, .. } = arg_node {
                let binding_idx = context
                    .analysis
                    .root
                    .scope
                    .declarations
                    .get(name.as_str())
                    .copied()
                    .or_else(|| context.analysis.root.find_binding_any_scope(name));
                if let Some(idx) = binding_idx {
                    context.analysis.root.bindings[idx].kind = BindingKind::RestProp;
                }
            }
            continue;
        }

        let JsNode::Property {
            computed,
            key,
            value,
            ..
        } = property
        else {
            continue;
        };

        if *computed {
            return Err(errors::props_invalid_pattern());
        }

        let key_node = arena.get_js_node(*key);
        if let JsNode::Identifier { name, .. } = key_node
            && name.starts_with("$$")
        {
            return Err(errors::props_illegal_name());
        }

        let value_node = arena.get_js_node(*value);
        let (binding_name_node, initial_node) = match value_node {
            JsNode::AssignmentPattern { left, right, .. } => {
                (arena.get_js_node(*left), Some(arena.get_js_node(*right)))
            }
            _ => (value_node, None),
        };

        let JsNode::Identifier {
            name: value_name, ..
        } = binding_name_node
        else {
            return Err(errors::props_invalid_pattern());
        };

        let alias = match key_node {
            JsNode::Identifier { name, .. } => Some(name.to_string()),
            JsNode::Literal { value, .. } => match value {
                crate::ast::typed_expr::LiteralValue::String(s) => Some(s.to_string()),
                crate::ast::typed_expr::LiteralValue::Number(n) => Some((*n as i64).to_string()),
                _ => None,
            },
            _ => None,
        }
        .ok_or_else(errors::props_invalid_pattern)?;

        if let Some(&binding_idx) = context
            .analysis
            .root
            .scope
            .declarations
            .get(value_name.as_str())
        {
            let binding = &mut context.analysis.root.bindings[binding_idx];
            binding.prop_alias = Some(alias);
            binding.kind = BindingKind::Prop;

            if let Some(init) = initial_node {
                if let JsNode::CallExpression {
                    callee, arguments, ..
                } = init
                {
                    let callee_node = arena.get_js_node(*callee);
                    if let JsNode::Identifier { name, .. } = callee_node
                        && name == "$bindable"
                    {
                        let args = arena.get_js_children(*arguments);
                        let bindable_arg = args.first();

                        binding.initial = bindable_arg.map(|arg| format!("{:?}", arg.to_value()));
                        binding.initial_node_type =
                            bindable_arg.map(|arg| arg.type_str().to_string());
                        if binding.initial_node_type.as_deref() == Some("Identifier") {
                            binding.initial_identifier_name = bindable_arg.and_then(|arg| {
                                if let JsNode::Identifier { name, .. } = arg {
                                    Some(name.to_string())
                                } else {
                                    None
                                }
                            });
                        }
                        binding.kind = BindingKind::BindableProp;
                    } else {
                        binding.initial = extract_literal_string_typed(init)
                            .or_else(|| Some(init.to_json_string()));
                        binding.initial_node_type = Some(init.type_str().to_string());
                        if binding.initial_node_type.as_deref() == Some("Identifier")
                            && let JsNode::Identifier { name, .. } = init
                        {
                            binding.initial_identifier_name = Some(name.to_string());
                        }
                    }
                } else {
                    binding.initial = extract_literal_string_typed(init)
                        .or_else(|| Some(init.to_value().to_string()));
                    binding.initial_node_type = Some(init.type_str().to_string());
                    if binding.initial_node_type.as_deref() == Some("Identifier")
                        && let JsNode::Identifier { name, .. } = init
                    {
                        binding.initial_identifier_name = Some(name.to_string());
                    }
                }
            } else {
                binding.initial = None;
            }
        }
    }

    Ok(())
}

/// Store ignore codes on all bindings using JsNode traversal.
fn store_ignore_codes_on_bindings_typed(
    id_node: &JsNode,
    ignore_codes: &[String],
    context: &mut VisitorContext,
) {
    let arena = context.parse_arena;
    match id_node {
        JsNode::Identifier { name, .. } => {
            if let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name.as_str())
            {
                context.analysis.root.bindings[binding_idx].ignore_codes = ignore_codes.to_vec();
            }
        }
        JsNode::ObjectPattern { properties, .. } => {
            for prop in arena.get_js_children(*properties) {
                match prop {
                    JsNode::Property { value, .. } => {
                        store_ignore_codes_on_bindings_typed(
                            arena.get_js_node(*value),
                            ignore_codes,
                            context,
                        );
                    }
                    JsNode::RestElement { argument, .. } => {
                        store_ignore_codes_on_bindings_typed(
                            arena.get_js_node(*argument),
                            ignore_codes,
                            context,
                        );
                    }
                    _ => {}
                }
            }
        }
        JsNode::ArrayPattern { elements, .. } => {
            for element in elements.iter().flatten() {
                store_ignore_codes_on_bindings_typed(element, ignore_codes, context);
            }
        }
        JsNode::RestElement { argument, .. } => {
            store_ignore_codes_on_bindings_typed(
                arena.get_js_node(*argument),
                ignore_codes,
                context,
            );
        }
        JsNode::AssignmentPattern { left, .. } => {
            store_ignore_codes_on_bindings_typed(arena.get_js_node(*left), ignore_codes, context);
        }
        _ => {}
    }
}

/// Process variable declarator in non-runes mode (typed).
fn visit_non_runes_mode_typed(
    id_node: &JsNode,
    init_node: Option<&JsNode>,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;
    let paths = extract_paths_typed(id_node, arena);

    // Check for invalid rune usage
    if let Some(init) = init_node
        && let JsNode::CallExpression { callee, .. } = init
    {
        let callee_node = arena.get_js_node(*callee);
        if let JsNode::Identifier { name, .. } = callee_node
            && matches!(name.as_str(), "$state" | "$derived" | "$props")
        {
            let is_store_sub = context
                .analysis
                .root
                .scope
                .declarations
                .get(name.as_str())
                .and_then(|&idx| context.analysis.root.bindings.get(idx))
                .map(|binding| binding.kind == BindingKind::StoreSub)
                .unwrap_or(false);

            if !is_store_sub {
                return Err(errors::rune_invalid_usage(name));
            }
        }
    }

    // Set initial value for constant folding
    if let Some(init) = init_node {
        for path in &paths {
            if let Some(&binding_idx) = context
                .analysis
                .root
                .scope
                .declarations
                .get(path.name.as_str())
            {
                let binding = &mut context.analysis.root.bindings[binding_idx];
                binding.initial = extract_literal_string_typed(init);
                binding.initial_is_defined = is_expression_defined_typed(init, arena);
                binding.initial_node_type = Some(init.type_str().to_string());
                if binding.initial_node_type.as_deref() == Some("Identifier")
                    && let JsNode::Identifier { name, .. } = init
                {
                    binding.initial_identifier_name = Some(name.to_string());
                }
            }
        }
    }

    Ok(())
}
