//! Async blocker calculation for instance-level declarations.
//!
//! Analyzes the instance's top level statements to calculate which bindings need to wait on which
//! top level statements. This includes indirect blockers such as functions referencing async top level statements.
//!
//! Corresponds to `calculate_blockers()` in Svelte's `2-analyze/index.js`.

use super::scope::Scope;
use super::types::{ComponentAnalysis, JsAnalysis};
use serde_json::Value as JsonValue;
use std::collections::{HashMap, HashSet};

/// Analyzes the instance's top level statements to calculate which bindings need to wait on which
/// top level statements. This includes indirect blockers such as functions referencing async top level statements.
///
/// Corresponds to `calculate_blockers()` in `svelte/packages/svelte/src/compiler/phases/2-analyze/index.js`.
///
/// # Arguments
///
/// * `instance` - The instance script analysis
/// * `scopes` - Map of scopes for nested blocks
/// * `analysis` - The component analysis (modified in-place)
pub fn calculate_blockers(
    instance: &JsAnalysis,
    scopes: &HashMap<usize, Scope>,
    analysis: &mut ComponentAnalysis,
) {
    let _instance_ast = &instance.scope; // We need the AST body

    // In the Rust implementation, we work with the pre-parsed JSON AST
    // The official compiler walks through instance.ast.body
    // For now, we'll need to access the instance script content
    if analysis.instance_script_content.is_none() {
        return;
    }

    // Track which bindings are touched by expressions
    let _touch = |expression: &JsonValue, scope: &Scope, touched: &mut HashSet<String>| {
        touch_bindings(
            expression,
            scope,
            touched,
            &instance.scope,
            &mut HashSet::new(),
        );
    };

    // Track which bindings are read/written by statements
    let _trace_references =
        |node: &JsonValue, reads: &mut HashSet<String>, writes: &mut HashSet<String>| {
            trace_bindings(
                node,
                reads,
                writes,
                &instance.scope,
                scopes,
                &mut HashSet::new(),
            );
        };

    let _awaited = false;
    let _functions: Vec<JsonValue> = Vec::new();

    // Parse the instance AST body
    // In the real implementation, this would come from the parsed JavaScript AST
    // For now, we work with the assumption that the AST is available as JSON

    // The instance body sections will be populated by walking through statements
    // This is a placeholder - actual implementation needs access to parsed AST

    // For each statement in instance.ast.body:
    // 1. Check if it's an import (hoisted)
    // 2. Check if it contains await (awaited = true)
    // 3. Categorize as sync or async
    // 4. For async statements, calculate blockers
}

/// Touch all bindings referenced in an expression.
/// Corresponds to the `touch` inner function in `calculate_blockers`.
fn touch_bindings(
    expression: &JsonValue,
    _scope: &Scope,
    touched: &mut HashSet<String>,
    _root_scope: &Scope,
    seen: &mut HashSet<String>,
) {
    // Recursively walk the expression and find all identifier references
    // For each identifier that is a reference, add the binding to `touched`
    // and recursively touch all assignments to that binding

    if let Some(node_type) = expression.get("type").and_then(|t| t.as_str()) {
        match node_type {
            "Identifier" => {
                if let Some(name) = expression.get("name").and_then(|n| n.as_str()) {
                    if seen.contains(name) {
                        return;
                    }
                    seen.insert(name.to_string());
                    touched.insert(name.to_string());

                    // TODO: For each assignment to this binding, recursively touch
                    // This requires access to binding.assignments
                }
            }
            "MemberExpression" => {
                if let Some(object) = expression.get("object") {
                    touch_bindings(object, _scope, touched, _root_scope, seen);
                }
                if let Some(property) = expression.get("property")
                    && expression
                        .get("computed")
                        .and_then(|c| c.as_bool())
                        .unwrap_or(false)
                {
                    touch_bindings(property, _scope, touched, _root_scope, seen);
                }
            }
            "CallExpression" => {
                if let Some(callee) = expression.get("callee") {
                    touch_bindings(callee, _scope, touched, _root_scope, seen);
                }
                if let Some(arguments) = expression.get("arguments").and_then(|a| a.as_array()) {
                    for arg in arguments {
                        touch_bindings(arg, _scope, touched, _root_scope, seen);
                    }
                }
            }
            // Add more expression types as needed
            _ => {
                // Recursively walk all properties
                if let Some(obj) = expression.as_object() {
                    for (_, value) in obj {
                        if value.is_object() {
                            touch_bindings(value, _scope, touched, _root_scope, seen);
                        } else if let Some(arr) = value.as_array() {
                            for item in arr {
                                touch_bindings(item, _scope, touched, _root_scope, seen);
                            }
                        }
                    }
                }
            }
        }
    }
}

/// Trace all bindings read and written by a node.
/// Corresponds to the `trace_references` inner function in `calculate_blockers`.
fn trace_bindings(
    node: &JsonValue,
    reads: &mut HashSet<String>,
    writes: &mut HashSet<String>,
    instance_scope: &Scope,
    _scopes: &HashMap<usize, Scope>,
    seen: &mut HashSet<String>,
) {
    let node_id = format!("{:?}", node); // Simple deduplication
    if seen.contains(&node_id) {
        return;
    }
    seen.insert(node_id);

    if let Some(node_type) = node.get("type").and_then(|t| t.as_str()) {
        match node_type {
            "AssignmentExpression" => {
                // Track writes to the left side
                if let Some(left) = node.get("left") {
                    extract_pattern_identifiers(left, writes);
                }
                // Track reads on the right side
                if let Some(right) = node.get("right") {
                    extract_identifiers(right, reads);
                }
            }
            "UpdateExpression" => {
                // Track writes (x++, ++x, etc.)
                if let Some(argument) = node.get("argument") {
                    extract_pattern_identifiers(argument, writes);
                }
            }
            "CallExpression" => {
                // For now, assume everything touched by the callee ends up mutating the object
                // Special case: skip $effect as they only run once async work has completed
                // TODO: Check for $effect rune

                let mut touched = HashSet::new();
                if let Some(callee) = node.get("callee") {
                    touch_bindings(
                        callee,
                        instance_scope,
                        &mut touched,
                        instance_scope,
                        &mut HashSet::new(),
                    );
                }

                for name in touched {
                    writes.insert(name);
                }
            }
            "Identifier" => {
                // Track as a read
                if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
                    reads.insert(name.to_string());
                }
            }
            _ => {
                // Recursively process children
                if let Some(obj) = node.as_object() {
                    for (_, value) in obj {
                        if value.is_object() {
                            trace_bindings(value, reads, writes, instance_scope, _scopes, seen);
                        } else if let Some(arr) = value.as_array() {
                            for item in arr {
                                if item.is_object() {
                                    trace_bindings(
                                        item,
                                        reads,
                                        writes,
                                        instance_scope,
                                        _scopes,
                                        seen,
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/// Extract identifiers from a pattern (destructuring, etc.).
fn extract_pattern_identifiers(pattern: &JsonValue, identifiers: &mut HashSet<String>) {
    if let Some(pattern_type) = pattern.get("type").and_then(|t| t.as_str()) {
        match pattern_type {
            "Identifier" => {
                if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                    identifiers.insert(name.to_string());
                }
            }
            "ArrayPattern" => {
                if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                    for element in elements {
                        if !element.is_null() {
                            extract_pattern_identifiers(element, identifiers);
                        }
                    }
                }
            }
            "ObjectPattern" => {
                if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                    for prop in properties {
                        if let Some(value) = prop.get("value") {
                            extract_pattern_identifiers(value, identifiers);
                        }
                    }
                }
            }
            "AssignmentPattern" => {
                if let Some(left) = pattern.get("left") {
                    extract_pattern_identifiers(left, identifiers);
                }
            }
            "RestElement" => {
                if let Some(argument) = pattern.get("argument") {
                    extract_pattern_identifiers(argument, identifiers);
                }
            }
            "MemberExpression" => {
                // Member expressions can appear in patterns
                extract_identifiers(pattern, identifiers);
            }
            _ => {}
        }
    }
}

/// Extract all identifier names from an expression.
fn extract_identifiers(expression: &JsonValue, identifiers: &mut HashSet<String>) {
    if let Some(expr_type) = expression.get("type").and_then(|t| t.as_str()) {
        match expr_type {
            "Identifier" => {
                if let Some(name) = expression.get("name").and_then(|n| n.as_str()) {
                    identifiers.insert(name.to_string());
                }
            }
            "MemberExpression" => {
                if let Some(object) = expression.get("object") {
                    extract_identifiers(object, identifiers);
                }
            }
            _ => {
                // Recursively walk all properties
                if let Some(obj) = expression.as_object() {
                    for (_, value) in obj {
                        if value.is_object() {
                            extract_identifiers(value, identifiers);
                        } else if let Some(arr) = value.as_array() {
                            for item in arr {
                                if item.is_object() {
                                    extract_identifiers(item, identifiers);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
