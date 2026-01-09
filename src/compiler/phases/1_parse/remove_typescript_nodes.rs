//! TypeScript node removal.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/remove_typescript_nodes.js`
//!
//! It provides functionality to remove TypeScript-specific AST nodes from JavaScript code.
//! This is necessary because Svelte needs to work with pure JavaScript, and TypeScript
//! annotations need to be stripped out during parsing.

use serde_json::{Map, Value as JsonValue};

use crate::error::ParseError;

/// Empty statement node (equivalent to `b.empty` in JavaScript)
fn empty_statement() -> JsonValue {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        JsonValue::String("EmptyStatement".to_string()),
    );
    JsonValue::Object(obj)
}

/// Get the start position from a node
fn get_start(node: &JsonValue) -> usize {
    node.get("start")
        .and_then(|v| v.as_u64())
        .map(|n| n as usize)
        .unwrap_or(0)
}

/// Get the end position from a node
fn get_end(node: &JsonValue) -> usize {
    node.get("end")
        .and_then(|v| v.as_u64())
        .map(|n| n as usize)
        .unwrap_or(0)
}

/// Get the node type
fn get_type(node: &JsonValue) -> Option<&str> {
    node.get("type").and_then(|v| v.as_str())
}

/// Remove the first 'this' parameter from function parameters
fn remove_this_param(node: &mut JsonValue) {
    if let Some(params) = node.get_mut("params").and_then(|v| v.as_array_mut()) {
        if let Some(first) = params.first() {
            if get_type(first) == Some("Identifier") {
                if let Some(name) = first.get("name").and_then(|v| v.as_str()) {
                    if name == "this" {
                        params.remove(0);
                    }
                }
            }
        }
    }
}

/// Remove TypeScript-specific fields from a node
fn remove_typescript_fields(node: &mut JsonValue) {
    if let Some(obj) = node.as_object_mut() {
        obj.remove("typeAnnotation");
        obj.remove("typeParameters");
        obj.remove("typeArguments");
        obj.remove("returnType");
        obj.remove("accessibility");
        obj.remove("readonly");
        obj.remove("definite");
        obj.remove("override");
    }
}

/// Walk and transform an AST node, removing TypeScript nodes
///
/// # Arguments
/// * `node` - The AST node to transform
/// * `path` - The path to the current node (for context in error reporting)
///
/// # Returns
/// The transformed node, or an empty statement if the node should be removed
pub fn remove_typescript_nodes(node: &mut JsonValue, path: &[&str]) -> Result<(), ParseError> {
    let node_type = get_type(node).unwrap_or("");

    match node_type {
        // Decorators are not supported
        "Decorator" => {
            let start = get_start(node);
            let end = get_end(node);
            return Err(ParseError::typescript_invalid_feature(
                "decorators (related TSC proposal is not stage 4 yet)",
                (start, end),
            ));
        }

        // Filter out type-only imports
        "ImportDeclaration" => {
            if let Some(import_kind) = node.get("importKind").and_then(|v| v.as_str()) {
                if import_kind == "type" {
                    *node = empty_statement();
                    return Ok(());
                }
            }

            // Filter type-only specifiers
            if let Some(specifiers) = node.get_mut("specifiers").and_then(|v| v.as_array_mut()) {
                if !specifiers.is_empty() {
                    specifiers
                        .retain(|s| s.get("importKind").and_then(|v| v.as_str()) != Some("type"));

                    if specifiers.is_empty() {
                        *node = empty_statement();
                        return Ok(());
                    }
                }
            }
        }

        // Filter out type-only exports
        "ExportNamedDeclaration" => {
            if let Some(export_kind) = node.get("exportKind").and_then(|v| v.as_str()) {
                if export_kind == "type" {
                    *node = empty_statement();
                    return Ok(());
                }
            }

            // Check if declaration became empty after visiting
            if let Some(declaration) = node.get("declaration") {
                if get_type(declaration) == Some("EmptyStatement") {
                    *node = empty_statement();
                    return Ok(());
                }
            }

            // Filter type-only specifiers
            if let Some(specifiers) = node.get_mut("specifiers").and_then(|v| v.as_array_mut()) {
                if !specifiers.is_empty() {
                    specifiers
                        .retain(|s| s.get("exportKind").and_then(|v| v.as_str()) != Some("type"));

                    if specifiers.is_empty() {
                        *node = empty_statement();
                        return Ok(());
                    }
                }
            }
        }

        "ExportDefaultDeclaration" => {
            if let Some(export_kind) = node.get("exportKind").and_then(|v| v.as_str()) {
                if export_kind == "type" {
                    *node = empty_statement();
                    return Ok(());
                }
            }
        }

        "ExportAllDeclaration" => {
            if let Some(export_kind) = node.get("exportKind").and_then(|v| v.as_str()) {
                if export_kind == "type" {
                    *node = empty_statement();
                    return Ok(());
                }
            }
        }

        // Check for accessor fields (not stage 4)
        "PropertyDefinition" => {
            if let Some(accessor) = node.get("accessor").and_then(|v| v.as_bool()) {
                if accessor {
                    let start = get_start(node);
                    let end = get_end(node);
                    return Err(ParseError::typescript_invalid_feature(
                        "accessor fields (related TSC proposal is not stage 4 yet)",
                        (start, end),
                    ));
                }
            }
        }

        // Unwrap TypeScript type assertion expressions
        "TSAsExpression"
        | "TSSatisfiesExpression"
        | "TSNonNullExpression"
        | "TSTypeAssertion"
        | "TSInstantiationExpression" => {
            if let Some(expression) = node.get("expression").cloned() {
                *node = expression;
            }
        }

        // Remove type-only declarations
        "TSInterfaceDeclaration" | "TSTypeAliasDeclaration" | "TSDeclareFunction" => {
            *node = empty_statement();
            return Ok(());
        }

        // Enums are not supported
        "TSEnumDeclaration" => {
            let start = get_start(node);
            let end = get_end(node);
            return Err(ParseError::typescript_invalid_feature(
                "enums",
                (start, end),
            ));
        }

        // Handle parameter properties
        "TSParameterProperty" => {
            let has_modifiers = node
                .get("readonly")
                .and_then(|v| v.as_bool())
                .unwrap_or(false)
                || node.get("accessibility").is_some();

            // Check if we're in a constructor
            let in_constructor = path.iter().any(|&p| p == "constructor");

            if has_modifiers && in_constructor {
                let start = get_start(node);
                let end = get_end(node);
                return Err(ParseError::typescript_invalid_feature(
                    "accessibility modifiers on constructor parameters",
                    (start, end),
                ));
            }

            if let Some(parameter) = node.get("parameter").cloned() {
                *node = parameter;
            }
        }

        // Remove 'this' parameter from functions
        "FunctionExpression" | "FunctionDeclaration" => {
            remove_this_param(node);
        }

        // Filter out declared properties from class bodies
        "ClassBody" => {
            if let Some(body) = node.get_mut("body").and_then(|v| v.as_array_mut()) {
                body.retain(|child| {
                    if get_type(child) == Some("PropertyDefinition") {
                        !child
                            .get("declare")
                            .and_then(|v| v.as_bool())
                            .unwrap_or(false)
                    } else {
                        true
                    }
                });
            }
        }

        // Handle class declarations
        "ClassDeclaration" => {
            if let Some(declare) = node.get("declare").and_then(|v| v.as_bool()) {
                if declare {
                    *node = empty_statement();
                    return Ok(());
                }
            }

            if let Some(obj) = node.as_object_mut() {
                obj.remove("abstract");
                obj.remove("implements");
                obj.remove("superTypeArguments");
            }
        }

        // Handle class expressions
        "ClassExpression" => {
            if let Some(obj) = node.as_object_mut() {
                obj.remove("implements");
                obj.remove("superTypeArguments");
            }
        }

        // Remove abstract methods
        "MethodDefinition" => {
            if let Some(is_abstract) = node.get("abstract").and_then(|v| v.as_bool()) {
                if is_abstract {
                    *node = empty_statement();
                    return Ok(());
                }
            }
        }

        // Remove declared variables
        "VariableDeclaration" => {
            if let Some(declare) = node.get("declare").and_then(|v| v.as_bool()) {
                if declare {
                    *node = empty_statement();
                    return Ok(());
                }
            }
        }

        // Handle TypeScript namespaces/modules
        "TSModuleDeclaration" => {
            if node.get("body").is_none() {
                *node = empty_statement();
                return Ok(());
            }

            // Check if namespace contains non-type nodes
            if let Some(body) = node
                .get("body")
                .and_then(|b| b.get("body"))
                .and_then(|b| b.as_array())
            {
                let has_non_type_nodes = body.iter().any(|entry| {
                    let t = get_type(entry).unwrap_or("");
                    t != "EmptyStatement"
                        && t != "TSInterfaceDeclaration"
                        && t != "TSTypeAliasDeclaration"
                });

                if has_non_type_nodes {
                    let start = get_start(node);
                    let end = get_end(node);
                    return Err(ParseError::typescript_invalid_feature(
                        "namespaces with non-type nodes",
                        (start, end),
                    ));
                }
            }

            *node = empty_statement();
            return Ok(());
        }

        _ => {}
    }

    // Remove TypeScript-specific fields from all nodes
    remove_typescript_fields(node);

    // Recursively process child nodes
    visit_children(node, path)?;

    Ok(())
}

/// Visit all children of a node recursively
fn visit_children(node: &mut JsonValue, path: &[&str]) -> Result<(), ParseError> {
    if let Some(obj) = node.as_object_mut() {
        for (key, value) in obj.iter_mut() {
            let mut new_path = path.to_vec();
            new_path.push(key.as_str());

            match value {
                JsonValue::Object(_) => {
                    remove_typescript_nodes(value, &new_path)?;
                }
                JsonValue::Array(arr) => {
                    for item in arr.iter_mut() {
                        if item.is_object() {
                            remove_typescript_nodes(item, &new_path)?;
                        }
                    }
                }
                _ => {}
            }
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_remove_type_import() {
        let mut node = json!({
            "type": "ImportDeclaration",
            "importKind": "type",
            "start": 0,
            "end": 10
        });

        remove_typescript_nodes(&mut node, &[]).unwrap();
        assert_eq!(get_type(&node), Some("EmptyStatement"));
    }

    #[test]
    fn test_remove_typescript_fields() {
        let mut node = json!({
            "type": "Identifier",
            "name": "foo",
            "typeAnnotation": {"type": "TSTypeAnnotation"},
            "start": 0,
            "end": 3
        });

        remove_typescript_nodes(&mut node, &[]).unwrap();
        assert!(node.get("typeAnnotation").is_none());
        assert_eq!(node.get("name").and_then(|v| v.as_str()), Some("foo"));
    }

    #[test]
    fn test_unwrap_as_expression() {
        let mut node = json!({
            "type": "TSAsExpression",
            "expression": {
                "type": "Identifier",
                "name": "x"
            },
            "start": 0,
            "end": 10
        });

        remove_typescript_nodes(&mut node, &[]).unwrap();
        assert_eq!(get_type(&node), Some("Identifier"));
        assert_eq!(node.get("name").and_then(|v| v.as_str()), Some("x"));
    }

    #[test]
    fn test_decorator_error() {
        let mut node = json!({
            "type": "Decorator",
            "start": 0,
            "end": 10
        });

        let result = remove_typescript_nodes(&mut node, &[]);
        assert!(result.is_err());
        match result {
            Err(ParseError::TypeScriptInvalidFeature { feature, .. }) => {
                assert!(feature.contains("decorators"));
            }
            _ => panic!("Expected TypeScriptInvalidFeature error"),
        }
    }

    #[test]
    fn test_remove_this_parameter() {
        let mut node = json!({
            "type": "FunctionExpression",
            "params": [
                {"type": "Identifier", "name": "this"},
                {"type": "Identifier", "name": "x"}
            ],
            "start": 0,
            "end": 20
        });

        remove_typescript_nodes(&mut node, &[]).unwrap();

        let params = node.get("params").and_then(|v| v.as_array()).unwrap();
        assert_eq!(params.len(), 1);
        assert_eq!(params[0].get("name").and_then(|v| v.as_str()), Some("x"));
    }
}
