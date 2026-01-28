//! ClassBody visitor.
//!
//! Analyzes class bodies for state fields ($state, $derived, etc.).
//!
//! Corresponds to Svelte's `2-analyze/visitors/ClassBody.js`.

use rustc_hash::FxHashMap;
use std::sync::LazyLock;

use regex::Regex;
use serde_json::Value;

use super::super::errors;
use super::super::types::StateField;
use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

// Cached regex for sanitizing identifier names
static REGEX_INVALID_IDENTIFIER_CHARS: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(^[^a-zA-Z_$]|[^a-zA-Z0-9_$])").unwrap());

/// Visit a class body.
///
/// Corresponds to ClassBody() in Svelte's `2-analyze/visitors/ClassBody.js`.
///
/// This function analyzes class bodies to find state fields (properties using $state, $derived, etc.)
/// and validates that field names don't conflict. It handles both PropertyDefinition nodes
/// and assignments in the constructor (this.foo = $state(...)).
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Get the class body array
    let body = match node.get("body").and_then(|b| b.as_array()) {
        Some(b) => b,
        None => return Ok(()),
    };

    // Only analyze state fields if using runes
    if !context.analysis.runes {
        // Still need to visit children for non-runes mode to detect needs_context
        for child in body {
            super::script::walk_js_node(child, context)?;
        }
        return Ok(());
    }

    // Track private identifiers to avoid conflicts when generating deconflicted names
    let mut private_ids: Vec<String> = Vec::new();

    // Collect private identifiers from methods and properties
    for prop in body {
        let prop_type = prop.get("type").and_then(|t| t.as_str());

        if matches!(
            prop_type,
            Some("MethodDefinition") | Some("PropertyDefinition")
        ) && let Some(key) = prop.get("key")
            && key.get("type").and_then(|t| t.as_str()) == Some("PrivateIdentifier")
            && let Some(name) = key.get("name").and_then(|n| n.as_str())
        {
            private_ids.push(name.to_string());
        }
    }

    // State fields map (name -> StateField)
    let mut state_fields: FxHashMap<String, StateField> = FxHashMap::default();

    // Track all fields and their kinds to detect duplicates
    // Maps from field key (prefixed with @ for static) to kinds
    let mut fields: FxHashMap<String, Vec<String>> = FxHashMap::default();

    // Find constructor for analyzing this.x = $state(...) assignments
    let mut constructor: Option<&Value> = None;

    /// Helper function to get the name from a key (Identifier, PrivateIdentifier, or Literal)
    fn get_name(key: &Value) -> Option<String> {
        match key.get("type").and_then(|t| t.as_str()) {
            Some("Literal") => key.get("value").and_then(|v| {
                v.as_str()
                    .map(|s| s.to_string())
                    .or_else(|| v.as_i64().map(|n| n.to_string()))
            }),
            Some("PrivateIdentifier") => key
                .get("name")
                .and_then(|n| n.as_str())
                .map(|n| format!("#{}", n)),
            Some("Identifier") => key
                .get("name")
                .and_then(|n| n.as_str())
                .map(|s| s.to_string()),
            _ => None,
        }
    }

    /// Helper function to check if a value is a rune call and return the rune name
    fn get_rune(value: &Value) -> Option<String> {
        if value.get("type").and_then(|t| t.as_str()) != Some("CallExpression") {
            return None;
        }

        let callee = value.get("callee")?;

        // Handle direct rune calls ($state, $derived, etc.)
        if callee.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
            let name = callee.get("name").and_then(|n| n.as_str())?;
            if is_state_creation_rune(name) {
                return Some(name.to_string());
            }
        }

        // Handle member expression runes ($state.raw, $derived.by)
        if callee.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
            let object = callee.get("object")?;
            let property = callee.get("property")?;

            if object.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                && property.get("type").and_then(|t| t.as_str()) == Some("Identifier")
            {
                let obj_name = object.get("name").and_then(|n| n.as_str())?;
                let prop_name = property.get("name").and_then(|n| n.as_str())?;
                let full_name = format!("{}.{}", obj_name, prop_name);

                if is_state_creation_rune(&full_name) {
                    return Some(full_name);
                }
            }
        }

        None
    }

    /// Check if a name is a state creation rune
    fn is_state_creation_rune(name: &str) -> bool {
        matches!(name, "$state" | "$state.raw" | "$derived" | "$derived.by")
    }

    /// Handle a property or assignment that might be a state field
    fn handle_field(
        node: &Value,
        key: &Value,
        value: Option<&Value>,
        state_fields: &mut FxHashMap<String, StateField>,
        fields: &mut FxHashMap<String, Vec<String>>,
        is_static: bool,
    ) -> Result<(), AnalysisError> {
        let name = match get_name(key) {
            Some(n) => n,
            None => return Ok(()),
        };

        // Check if the value is a rune call
        let rune = value.and_then(get_rune);

        if let Some(rune_name) = rune {
            // Check for duplicate state fields
            if state_fields.contains_key(&name) {
                return Err(errors::state_field_duplicate(&name));
            }

            // Create the field key (prefixed with @ for static fields)
            let field_key = if is_static {
                format!("@{}", name)
            } else {
                name.clone()
            };

            // Check if there's already a method or assigned field with this name
            if let Some(existing) = fields.get(&field_key) {
                // Error if there's already a method or an assigned prop (not just a plain prop)
                if !(existing.len() == 1 && existing[0] == "prop") {
                    return Err(errors::duplicate_class_field(&field_key));
                }
            }

            // Create the state field
            // Note: In JS, the key is filled out later for public state
            // For private identifiers, use the key as-is
            let key_value = if key.get("type").and_then(|t| t.as_str()) == Some("PrivateIdentifier")
            {
                key.clone()
            } else {
                // Will be filled with private identifier later
                Value::Null
            };

            state_fields.insert(
                name,
                StateField {
                    rune_type: rune_name,
                    node: node.clone(),
                    key: key_value,
                    value: value.unwrap().clone(),
                },
            );
        }

        Ok(())
    }

    // Process property definitions and methods
    for child in body {
        let child_type = child.get("type").and_then(|t| t.as_str());

        // Handle PropertyDefinition
        if child_type == Some("PropertyDefinition") {
            let computed = child
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false);
            let is_static = child
                .get("static")
                .and_then(|s| s.as_bool())
                .unwrap_or(false);

            if !computed
                && !is_static
                && let Some(key) = child.get("key")
            {
                let value = child.get("value");
                handle_field(child, key, value, &mut state_fields, &mut fields, false)?;

                // Track the field for duplicate detection
                // Note: For private identifiers like #count, get_name returns "#count"
                // So they won't conflict with public identifiers like "count"
                if let Some(field_name) = get_name(key) {
                    let has_value = value.is_some() && !value.unwrap().is_null();
                    let kind = if has_value { "assigned_prop" } else { "prop" };

                    // Only error if there's an existing field AND it's not a state field
                    // State fields are allowed to have corresponding props
                    if let Some(existing) = fields.get(&field_name)
                        && !existing.is_empty()
                        && !state_fields.contains_key(&field_name)
                    {
                        return Err(errors::duplicate_class_field(&field_name));
                    }
                    fields.insert(field_name, vec![kind.to_string()]);
                }
            }
        }

        // Handle MethodDefinition
        if child_type == Some("MethodDefinition") {
            let kind = child
                .get("kind")
                .and_then(|k| k.as_str())
                .unwrap_or("method");

            if kind == "constructor" {
                constructor = Some(child);
            } else {
                let computed = child
                    .get("computed")
                    .and_then(|c| c.as_bool())
                    .unwrap_or(false);

                if !computed
                    && let Some(key) = child.get("key")
                    && let Some(name) = get_name(key)
                {
                    let is_static = child
                        .get("static")
                        .and_then(|s| s.as_bool())
                        .unwrap_or(false);
                    let field_key = if is_static {
                        format!("@{}", name)
                    } else {
                        name.clone()
                    };

                    if let Some(existing) = fields.get_mut(&field_key) {
                        // Check for conflicts
                        if existing.contains(&kind.to_string())
                            || existing.contains(&"prop".to_string())
                            || existing.contains(&"assigned_prop".to_string())
                        {
                            return Err(errors::duplicate_class_field(&field_key));
                        }

                        // Handle getter/setter pairs
                        if kind == "get" {
                            if existing.len() == 1 && existing[0] == "set" {
                                existing.push("get".to_string());
                                continue;
                            }
                        } else if kind == "set" {
                            if existing.len() == 1 && existing[0] == "get" {
                                existing.push("set".to_string());
                                continue;
                            }
                        } else {
                            existing.push(kind.to_string());
                            continue;
                        }

                        return Err(errors::duplicate_class_field(&field_key));
                    } else {
                        fields.insert(field_key, vec![kind.to_string()]);
                    }
                }
            }
        }
    }

    // Process constructor assignments (this.x = $state(...))
    if let Some(constructor_node) = constructor
        && let Some(value) = constructor_node.get("value")
        && let Some(body) = value.get("body")
        && let Some(body_array) = body.get("body").and_then(|b| b.as_array())
    {
        for statement in body_array {
            // Must be ExpressionStatement
            if statement.get("type").and_then(|t| t.as_str()) != Some("ExpressionStatement") {
                continue;
            }

            // Must be AssignmentExpression
            let expr = match statement.get("expression") {
                Some(e) => e,
                None => continue,
            };

            if expr.get("type").and_then(|t| t.as_str()) != Some("AssignmentExpression") {
                continue;
            }

            // Left side must be MemberExpression with ThisExpression
            let left = match expr.get("left") {
                Some(l) => l,
                None => continue,
            };

            if left.get("type").and_then(|t| t.as_str()) != Some("MemberExpression") {
                continue;
            }

            let object = match left.get("object") {
                Some(o) => o,
                None => continue,
            };

            if object.get("type").and_then(|t| t.as_str()) != Some("ThisExpression") {
                continue;
            }

            // Skip computed properties with non-literal keys
            let computed = left
                .get("computed")
                .and_then(|c| c.as_bool())
                .unwrap_or(false);
            if computed
                && let Some(property) = left.get("property")
                && property.get("type").and_then(|t| t.as_str()) != Some("Literal")
            {
                continue;
            }

            // Handle the assignment
            if let (Some(property), Some(right)) = (left.get("property"), expr.get("right")) {
                handle_field(
                    expr,
                    property,
                    Some(right),
                    &mut state_fields,
                    &mut fields,
                    false,
                )?;
            }
        }
    }

    // Generate deconflicted private identifiers for public state fields
    for (name, field) in state_fields.iter_mut() {
        // Skip private identifiers (already have keys)
        if name.starts_with('#') {
            continue;
        }

        // Replace invalid identifier characters with underscores
        let mut deconflicted = REGEX_INVALID_IDENTIFIER_CHARS
            .replace_all(name, "_")
            .to_string();

        // Ensure it doesn't conflict with existing private identifiers
        while private_ids.contains(&deconflicted) {
            deconflicted = format!("_{}", deconflicted);
        }

        private_ids.push(deconflicted.clone());

        // Create the private identifier
        field.key = serde_json::json!({
            "type": "PrivateIdentifier",
            "name": deconflicted
        });
    }

    // Store the state fields in the analysis
    // Create a unique key for this class body node
    let node_key = format!("{:?}", node); // Simple key based on the node structure
    context.analysis.classes.insert(node_key, state_fields);

    // Visit children (methods, properties, etc.)
    // This is equivalent to context.next() in the JavaScript implementation
    for child in body {
        super::script::walk_js_node(child, context)?;
    }

    Ok(())
}
