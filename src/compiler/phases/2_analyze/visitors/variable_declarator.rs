//! VariableDeclarator visitor.
//!
//! Analyzes variable declarators, detects runes ($state, $derived, $props),
//! and validates patterns.
//!
//! Corresponds to Svelte's `2-analyze/visitors/VariableDeclarator.js`.

use super::super::{AnalysisError, errors, warnings};
use super::VisitorContext;
use super::shared::utils;
use crate::compiler::phases::phase2_analyze::BindingKind;
use serde_json::Value;

/// Visit a variable declarator.
///
/// Corresponds to `VariableDeclarator` in VariableDeclarator.js.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Ensure no conflict with module imports
    utils::ensure_no_module_import_conflict(node, context)?;

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
                        b.initial = extract_literal_string(arg);
                        b.initial_is_defined = is_expression_defined(arg);
                        // Store the AST node type of the initial value for should_proxy()
                        b.initial_node_type =
                            arg.get("type").and_then(|t| t.as_str()).map(String::from);
                    }
                }
            }
        }
    } else if let Some(init) = init {
        // Non-rune variable declaration - set initial value for constant folding
        for path in &paths {
            if let Some(name) = path.get("name").and_then(|n| n.as_str())
                && let Some(binding_idx) = context.analysis.root.find_binding_any_scope(name)
            {
                let binding = &mut context.analysis.root.bindings[binding_idx];
                binding.initial = extract_literal_string(init);
                binding.initial_is_defined = is_expression_defined(init);
                // Store the AST node type of the initial value for should_proxy()
                binding.initial_node_type =
                    init.get("type").and_then(|t| t.as_str()).map(String::from);
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
        if let Some(name) = path.get("name").and_then(|n| n.as_str())
            && let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name)
        {
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
                // TODO: Add metadata field to Binding struct
                // binding.metadata = Some(BindingMetadata { exclude_props });
                let _ = exclude_props; // suppress unused warning for now
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
        if context.analysis.custom_element.is_some() {
            // TODO: Check context.options.customElementOptions?.props
            // For now, we'll check if it's an Identifier or has RestElement

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
                // TODO: Emit warning
                // w.custom_element_props_identifier(node);
                let _ = warnings::custom_element_props_identifier();
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
                        binding.initial_node_type = init
                            .get("arguments")
                            .and_then(|args| args.as_array())
                            .and_then(|args| args.first())
                            .and_then(|arg| arg.get("type"))
                            .and_then(|t| t.as_str())
                            .map(String::from);
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

    // Validate identifier names for dollar prefix (also applies in non-runes mode)
    for path in &paths {
        if let Some(name) = path.get("name").and_then(|n| n.as_str())
            && let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name)
        {
            let binding = &context.analysis.root.bindings[binding_idx];
            utils::validate_identifier_name(binding, Some(context.function_depth))?;
        }
    }

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
