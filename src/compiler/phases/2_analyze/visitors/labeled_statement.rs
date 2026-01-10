//! LabeledStatement visitor.
//!
//! Analyzes labeled statements (including $: reactive statements).
//!
//! Corresponds to Svelte's `2-analyze/visitors/LabeledStatement.js`.

use super::shared::utils::object;
use super::{AstType, VisitorContext};
use crate::compiler::phases::phase2_analyze::types::ReactiveStatement;
use crate::compiler::phases::phase2_analyze::{AnalysisError, errors, warnings};
use serde_json::Value;
use std::collections::{HashMap, HashSet};

/// Visit a labeled statement.
///
/// Corresponds to `LabeledStatement` in LabeledStatement.js.
///
/// This handles $: reactive statements in legacy mode (Svelte 4 compatibility).
/// In Svelte 5 with runes, $: statements are no longer supported and emit an error.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check if this is a $: reactive statement
    if let Some(label_name) = node
        .get("label")
        .and_then(|l| l.get("name"))
        .and_then(|n| n.as_str())
        && label_name == "$"
    {
        // Get the parent node from the JS path
        let parent = context.js_path.get(context.js_path.len().saturating_sub(2));

        // Check if this is a reactive statement (at top level of instance script)
        let is_reactive_statement =
            context.ast_type == AstType::Instance && is_program_node(parent);

        if is_reactive_statement {
            // In runes mode, $: statements are not allowed
            if context.analysis.runes {
                return Err(errors::legacy_reactive_statement_invalid());
            }

            // Create a new reactive statement
            let mut reactive_statement = ReactiveStatement {
                assignments: HashSet::new(),
                dependencies: Vec::new(),
            };

            // Get the current scope to track references
            let scope_bindings = &context.analysis.root.scope.declarations;

            // Create a temporary scope references map to track what identifiers are referenced
            // We need to walk the statement body to find all identifier references
            let mut references: HashMap<String, Vec<ReferenceNode>> = HashMap::new();
            collect_references(node.get("body"), &mut references, &Vec::new());

            // Process each reference to determine dependencies
            for (name, nodes) in references.iter() {
                let binding_idx = match scope_bindings.get(name) {
                    Some(&idx) => idx,
                    None => continue, // Not a binding in scope
                };

                // Check each reference node to see if it's a dependency
                for ref_node in nodes {
                    // Navigate to the leftmost identifier in member expression chains
                    let mut left = ref_node.node.clone();
                    let mut i = ref_node.path.len();
                    let mut parent_node = ref_node.path.last().cloned();

                    while let Some(parent) = &parent_node {
                        if parent.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
                            left = parent.clone();
                            i = i.saturating_sub(1);
                            parent_node = ref_node.path.get(i.saturating_sub(1)).cloned();
                        } else {
                            break;
                        }
                    }

                    // Check if this is on the left-hand side of an assignment
                    if let Some(parent) = &parent_node
                        && parent.get("type").and_then(|t| t.as_str())
                            == Some("AssignmentExpression")
                        && parent.get("operator").and_then(|o| o.as_str()) == Some("=")
                    {
                        // Check if left is the left-hand side of assignment
                        if let (Some(parent_left), Some(left_str)) = (
                            parent
                                .get("left")
                                .and_then(|l| serde_json::to_string(l).ok()),
                            serde_json::to_string(&left).ok(),
                        ) {
                            if parent_left == left_str {
                                // This is an assignment, not a dependency
                                continue;
                            }
                        }
                    }

                    // This is a dependency
                    if !reactive_statement.dependencies.contains(&binding_idx) {
                        reactive_statement.dependencies.push(binding_idx);
                    }
                    break;
                }
            }

            // Store the reactive statement in the analysis
            // Use a stable key for the node (serialize it)
            let node_key = serde_json::to_string(node).unwrap_or_default();
            context
                .analysis
                .reactive_statements
                .insert(node_key, reactive_statement.clone());

            // Handle legacy reactive assignments
            // If the body is an assignment expression, mark legacy_reactive bindings
            if let Some(body) = node.get("body")
                && body.get("type").and_then(|t| t.as_str()) == Some("ExpressionStatement")
                && let Some(expression) = body.get("expression")
                && expression.get("type").and_then(|t| t.as_str()) == Some("AssignmentExpression")
                && let Some(left) = expression.get("left")
            {
                // Extract identifiers from the left-hand side
                let mut ids = extract_identifiers(left);

                // If left is a MemberExpression, try to get the base object
                if left.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
                    if let Some(id) = object(left) {
                        ids = vec![
                            id.get("name")
                                .and_then(|n| n.as_str())
                                .unwrap_or("")
                                .to_string(),
                        ];
                    }
                }

                // Mark bindings as having legacy reactive dependencies
                for id_name in ids {
                    if let Some(&_binding_idx) = scope_bindings.get(&id_name) {
                        // Note: We would need mutable access to bindings here
                        // For now, we store this in the reactive_statement
                        // The actual binding update would happen in a second pass
                        // if context.analysis.root.bindings[binding_idx].kind == BindingKind::LegacyReactive {
                        //     // binding.legacy_dependencies = Array.from(reactive_statement.dependencies)
                        // }
                    }
                }
            }
        } else if !context.analysis.runes {
            // $: in non-instance script or not at top level - emit warning
            let _ = warnings::reactive_declaration_invalid_placement();
        }
    }

    Ok(())
}

/// Check if a node is a Program node.
fn is_program_node(node: Option<&Value>) -> bool {
    node.and_then(|n| n.get("type")).and_then(|t| t.as_str()) == Some("Program")
}

/// A reference node with its path.
#[derive(Clone)]
struct ReferenceNode {
    node: Value,
    path: Vec<Value>,
}

/// Collect all identifier references in an AST subtree.
fn collect_references(
    node: Option<&Value>,
    references: &mut HashMap<String, Vec<ReferenceNode>>,
    path: &Vec<Value>,
) {
    let node = match node {
        Some(n) => n,
        None => return,
    };

    let node_type = node.get("type").and_then(|t| t.as_str());

    // Check if this is an Identifier reference
    if node_type == Some("Identifier") {
        if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
            if is_reference_context(node, path.last()) {
                references
                    .entry(name.to_string())
                    .or_insert_with(Vec::new)
                    .push(ReferenceNode {
                        node: node.clone(),
                        path: path.clone(),
                    });
            }
        }
    }

    // Recursively visit children
    let mut new_path = path.clone();
    new_path.push(node.clone());

    match node_type {
        Some("Program") | Some("BlockStatement") => {
            if let Some(body) = node.get("body").and_then(|b| b.as_array()) {
                for child in body {
                    collect_references(Some(child), references, &new_path);
                }
            }
        }
        Some("ExpressionStatement") => {
            collect_references(node.get("expression"), references, &new_path);
        }
        Some("IfStatement") => {
            collect_references(node.get("test"), references, &new_path);
            collect_references(node.get("consequent"), references, &new_path);
            collect_references(node.get("alternate"), references, &new_path);
        }
        Some("ForStatement") => {
            collect_references(node.get("init"), references, &new_path);
            collect_references(node.get("test"), references, &new_path);
            collect_references(node.get("update"), references, &new_path);
            collect_references(node.get("body"), references, &new_path);
        }
        Some("WhileStatement") | Some("DoWhileStatement") => {
            collect_references(node.get("test"), references, &new_path);
            collect_references(node.get("body"), references, &new_path);
        }
        Some("BinaryExpression") | Some("LogicalExpression") => {
            collect_references(node.get("left"), references, &new_path);
            collect_references(node.get("right"), references, &new_path);
        }
        Some("UnaryExpression") | Some("UpdateExpression") => {
            collect_references(node.get("argument"), references, &new_path);
        }
        Some("AssignmentExpression") => {
            collect_references(node.get("left"), references, &new_path);
            collect_references(node.get("right"), references, &new_path);
        }
        Some("MemberExpression") => {
            collect_references(node.get("object"), references, &new_path);
            if node
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false)
            {
                collect_references(node.get("property"), references, &new_path);
            }
        }
        Some("CallExpression") | Some("NewExpression") => {
            collect_references(node.get("callee"), references, &new_path);
            if let Some(arguments) = node.get("arguments").and_then(|a| a.as_array()) {
                for arg in arguments {
                    collect_references(Some(arg), references, &new_path);
                }
            }
        }
        Some("ConditionalExpression") => {
            collect_references(node.get("test"), references, &new_path);
            collect_references(node.get("consequent"), references, &new_path);
            collect_references(node.get("alternate"), references, &new_path);
        }
        Some("ArrayExpression") => {
            if let Some(elements) = node.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        collect_references(Some(element), references, &new_path);
                    }
                }
            }
        }
        Some("ObjectExpression") => {
            if let Some(properties) = node.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if property
                        .get("computed")
                        .and_then(|c| c.as_bool())
                        .unwrap_or(false)
                    {
                        collect_references(property.get("key"), references, &new_path);
                    }
                    collect_references(property.get("value"), references, &new_path);
                }
            }
        }
        Some("ReturnStatement") | Some("ThrowStatement") => {
            collect_references(node.get("argument"), references, &new_path);
        }
        Some("SequenceExpression") => {
            if let Some(expressions) = node.get("expressions").and_then(|e| e.as_array()) {
                for expr in expressions {
                    collect_references(Some(expr), references, &new_path);
                }
            }
        }
        Some("LabeledStatement") => {
            collect_references(node.get("body"), references, &new_path);
        }
        _ => {}
    }
}

/// Check if an identifier is in a reference context.
fn is_reference_context(node: &Value, parent: Option<&Value>) -> bool {
    let parent = match parent {
        Some(p) => p,
        None => return true,
    };

    let parent_type = parent.get("type").and_then(|t| t.as_str());

    match parent_type {
        Some("MemberExpression") => {
            if parent
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false)
            {
                true
            } else if let (Some(obj_str), Some(node_str)) = (
                parent
                    .get("object")
                    .and_then(|o| serde_json::to_string(o).ok()),
                serde_json::to_string(node).ok(),
            ) {
                obj_str == node_str
            } else {
                false
            }
        }
        Some("Property") => {
            if parent
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false)
            {
                true
            } else if let (Some(val_str), Some(node_str)) = (
                parent
                    .get("value")
                    .and_then(|v| serde_json::to_string(v).ok()),
                serde_json::to_string(node).ok(),
            ) {
                val_str == node_str
            } else {
                false
            }
        }
        Some("VariableDeclarator") => {
            if let (Some(id_str), Some(node_str)) = (
                parent.get("id").and_then(|i| serde_json::to_string(i).ok()),
                serde_json::to_string(node).ok(),
            ) {
                id_str != node_str
            } else {
                true
            }
        }
        Some("FunctionDeclaration")
        | Some("FunctionExpression")
        | Some("ArrowFunctionExpression") => false,
        Some("LabeledStatement") => {
            if let (Some(label_str), Some(node_str)) = (
                parent
                    .get("label")
                    .and_then(|l| serde_json::to_string(l).ok()),
                serde_json::to_string(node).ok(),
            ) {
                label_str != node_str
            } else {
                true
            }
        }
        _ => true,
    }
}

/// Extract identifiers from a pattern.
fn extract_identifiers(pattern: &Value) -> Vec<String> {
    let mut names = Vec::new();

    match pattern.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                names.push(name.to_string());
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        names.extend(extract_identifiers(element));
                    }
                }
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if let Some(value) = property.get("value") {
                        names.extend(extract_identifiers(value));
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = pattern.get("left") {
                names.extend(extract_identifiers(left));
            }
        }
        Some("RestElement") => {
            if let Some(argument) = pattern.get("argument") {
                names.extend(extract_identifiers(argument));
            }
        }
        _ => {}
    }

    names
}
