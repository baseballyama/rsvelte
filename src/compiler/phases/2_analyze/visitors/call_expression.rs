//! CallExpression visitor.
//!
//! Analyzes function call expressions, particularly rune calls.
//!
//! Corresponds to Svelte's `2-analyze/visitors/CallExpression.js`.

use super::super::errors;
use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit a call expression.
///
/// This visitor handles rune calls ($state, $derived, $effect, $props, etc.)
/// and validates their usage context.
///
/// # Arguments
///
/// * `node` - The CallExpression node (as JSON Value)
/// * `context` - The visitor context
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Get the rune name if this is a rune call
    let rune = get_rune(node, context);

    // Check for spread arguments in runes (not allowed except for $inspect)
    if let Some(ref rune_name) = rune
        && rune_name != "$inspect"
        && let Some(arguments) = node.get("arguments").and_then(|a| a.as_array())
    {
        for arg in arguments {
            if arg.get("type").and_then(|t| t.as_str()) == Some("SpreadElement") {
                return Err(errors::rune_invalid_spread(rune_name));
            }
        }
    }

    // Validate specific runes
    match rune.as_deref() {
        None => {
            // Not a rune - check if it's a safe identifier call
            if let Some(callee) = node.get("callee")
                && !super::shared::utils::is_safe_identifier(callee, context)
            {
                context.analysis.needs_context = true;
            }
        }

        Some("$bindable") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count > 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$bindable",
                    "zero or one arguments",
                ));
            }

            // Check placement: must be inside $props() destructuring
            if !is_bindable_valid_placement(context) {
                return Err(errors::bindable_invalid_location());
            }

            // We need context in case the bound prop is stale
            context.analysis.needs_context = true;
        }

        Some("$host") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count > 0 {
                return Err(errors::rune_invalid_arguments("$host"));
            } else if context.analysis.custom_element.is_none() {
                // TODO: Check ast_type === 'module'
                return Err(errors::host_invalid_placement());
            }
        }

        Some("$props") => {
            if context.has_props_rune {
                return Err(errors::props_duplicate("$props"));
            }

            context.has_props_rune = true;

            // Check placement: must be top-level VariableDeclarator in instance script
            if !is_props_valid_placement(context) {
                return Err(errors::props_invalid_placement());
            }

            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count > 0 {
                return Err(errors::rune_invalid_arguments("$props"));
            }
        }

        Some("$props.id") => {
            if context.analysis.props_id.is_some() {
                return Err(errors::props_duplicate("$props.id"));
            }

            // Check placement: must be a VariableDeclarator with Identifier id at top level
            if !is_props_id_valid_placement(context) {
                return Err(errors::props_id_invalid_placement());
            }

            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count > 0 {
                return Err(errors::rune_invalid_arguments("$props.id"));
            }

            // Store the props_id identifier name
            if let Some(parent) = get_parent(context, 1)
                && let Some(id_name) = parent
                    .get("id")
                    .and_then(|id| id.get("name"))
                    .and_then(|n| n.as_str())
            {
                context.analysis.props_id = Some(id_name.to_string());
            }
        }

        Some("$state") | Some("$state.raw") | Some("$derived") | Some("$derived.by") => {
            // Check valid placement
            if !is_state_or_derived_valid_placement(context) {
                return Err(errors::state_invalid_placement(rune.as_deref().unwrap()));
            }

            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            let rune_name = rune.as_deref().unwrap();
            if rune_name == "$derived" || rune_name == "$derived.by" {
                if arg_count != 1 {
                    return Err(errors::rune_invalid_arguments_length(
                        rune_name,
                        "exactly one argument",
                    ));
                }
            } else if arg_count > 1 {
                return Err(errors::rune_invalid_arguments_length(
                    rune_name,
                    "zero or one arguments",
                ));
            }
        }

        Some("$effect") | Some("$effect.pre") => {
            // Check placement: must be an ExpressionStatement
            if !is_effect_valid_placement(context) {
                return Err(errors::effect_invalid_placement());
            }

            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count != 1 {
                return Err(errors::rune_invalid_arguments_length(
                    rune.as_deref().unwrap(),
                    "exactly one argument",
                ));
            }

            // $effect needs context
            context.analysis.needs_context = true;
        }

        Some("$effect.tracking") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count != 0 {
                return Err(errors::rune_invalid_arguments("$effect.tracking"));
            }

            // TODO: Set expression.has_state = true when we have expression metadata
        }

        Some("$effect.root") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count != 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$effect.root",
                    "exactly one argument",
                ));
            }
        }

        Some("$effect.pending") => {
            // TODO: Set expression.has_state = true when we have expression metadata
        }

        Some("$inspect") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count < 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$inspect",
                    "one or more arguments",
                ));
            }
        }

        Some("$inspect().with") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count != 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$inspect().with",
                    "exactly one argument",
                ));
            }
        }

        Some("$inspect.trace") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count > 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$inspect.trace",
                    "zero or one arguments",
                ));
            }

            // Check placement: must be first statement in function body
            if !is_inspect_trace_valid_placement(context) {
                return Err(errors::inspect_trace_invalid_placement());
            }

            // Check that it's not in a generator function
            if is_inside_generator_function(context) {
                return Err(errors::inspect_trace_generator());
            }

            // TODO: In dev mode, set scope.tracing
            // For now, just mark that we use tracing
            context.analysis.tracing = true;
        }

        Some("$state.eager") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count != 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$state.eager",
                    "exactly one argument",
                ));
            }
        }

        Some("$state.snapshot") => {
            let arg_count = node
                .get("arguments")
                .and_then(|a| a.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            if arg_count != 1 {
                return Err(errors::rune_invalid_arguments_length(
                    "$state.snapshot",
                    "exactly one argument",
                ));
            }
        }

        _ => {
            // Unknown rune or non-rune call
        }
    }

    // TODO: Handle $derived expression tracking for async deriveds
    // TODO: Handle $inspect expression tracking
    // TODO: Handle expression metadata (has_call, has_state)

    Ok(())
}

/// Get the rune name from a CallExpression node, if it is a rune call.
///
/// Returns Some(rune_name) if the call is a rune, None otherwise.
///
/// # Arguments
///
/// * `node` - The CallExpression node
/// * `context` - The visitor context
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
/// This handles member expressions like `$state.raw` and call expressions like `$inspect().with`.
///
/// Returns the full keypath string, or None if it's not a global identifier.
///
/// # Arguments
///
/// * `node` - The expression node
/// * `context` - The visitor context
fn get_global_keypath(node: &Value, context: &VisitorContext) -> Option<String> {
    let mut n = node;
    let mut joined = String::new();

    // Handle MemberExpression chain
    while n.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        // Must not be computed
        if n.get("computed").and_then(|c| c.as_bool()).unwrap_or(false) {
            return None;
        }

        // Property must be an Identifier
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

    // Check if it's a binding (if so, it's not a rune)
    if context.analysis.root.scope.declarations.contains_key(name) {
        return None;
    }

    Some(format!("{}{}", name, joined))
}

/// Get the parent node at a specific offset in the path.
///
/// # Arguments
///
/// * `context` - The visitor context
/// * `offset` - The offset from the end (-1 for immediate parent, -2 for grandparent, etc.)
fn get_parent<'a>(_context: &'a VisitorContext, _offset: usize) -> Option<&'a Value> {
    // Note: In the Rust implementation, we don't have JS AST nodes in the path yet
    // This is a placeholder that will need to be filled in when we properly track
    // JavaScript AST nodes in the visitor context
    // TODO: Implement proper JS AST path tracking
    None
}

/// Check if $bindable is in a valid placement.
///
/// Must be inside an AssignmentPattern in an ObjectPattern in a VariableDeclarator
/// that is initialized with $props().
fn is_bindable_valid_placement(_context: &VisitorContext) -> bool {
    // TODO: Implement proper path checking once we track JS AST nodes
    // For now, return true (will be validated during transform)
    true
}

/// Check if $props is in a valid placement.
///
/// Must be a VariableDeclarator at the top level of the instance script.
fn is_props_valid_placement(_context: &VisitorContext) -> bool {
    // TODO: Implement proper path checking once we track JS AST nodes
    // For now, return true (will be validated during transform)
    true
}

/// Check if $props.id is in a valid placement.
///
/// Must be a VariableDeclarator with an Identifier id at the top level.
fn is_props_id_valid_placement(_context: &VisitorContext) -> bool {
    // TODO: Implement proper path checking once we track JS AST nodes
    // For now, return true (will be validated during transform)
    true
}

/// Check if $state/$derived is in a valid placement.
///
/// Valid placements:
/// - VariableDeclarator (not in ConstTag)
/// - PropertyDefinition (non-static, non-computed)
/// - AssignmentExpression in constructor (this.property = $state(...))
fn is_state_or_derived_valid_placement(_context: &VisitorContext) -> bool {
    // TODO: Implement proper path checking once we track JS AST nodes
    // For now, return true (will be validated during transform)
    true
}

/// Check if $effect is in a valid placement.
///
/// Must be an ExpressionStatement.
fn is_effect_valid_placement(_context: &VisitorContext) -> bool {
    // TODO: Implement proper path checking once we track JS AST nodes
    // For now, return true (will be validated during transform)
    true
}

/// Check if $inspect.trace is in a valid placement.
///
/// Must be the first statement in a function body.
fn is_inspect_trace_valid_placement(_context: &VisitorContext) -> bool {
    // TODO: Implement proper path checking once we track JS AST nodes
    // For now, return true (will be validated during transform)
    true
}

/// Check if we're inside a generator function.
fn is_inside_generator_function(_context: &VisitorContext) -> bool {
    // TODO: Implement proper path checking once we track JS AST nodes
    // For now, return false (will be validated during transform)
    false
}
