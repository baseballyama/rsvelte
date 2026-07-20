//! ClassBody visitor.
//!
//! Analyzes class bodies for state fields ($state, $derived, etc.).
//!
//! Corresponds to Svelte's `2-analyze/visitors/ClassBody.js`.

use rustc_hash::FxHashMap;

use serde_json::Value;

use super::super::errors;
use super::super::types::StateField;
use super::VisitorContext;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a class body.
///
/// Corresponds to ClassBody() in Svelte's `2-analyze/visitors/ClassBody.js`.
///
/// This function analyzes class bodies to find state fields (properties using $state, $derived, etc.)
/// and validates that field names don't conflict. It handles both PropertyDefinition nodes
/// and assignments in the constructor (this.foo = $state(...)).
/// Shared ClassBody analysis. `typed` carries the typed `JsNode::ClassBody`
/// (always present — only called from `visit_typed` in runes mode). The
/// state-field analysis runs on the `&Value` form, but child traversal uses the
/// typed walker.
fn visit_impl(
    node: &Value,
    typed: &JsNode,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Get the class body array
    let body = match node.get("body").and_then(|b| b.as_array()) {
        Some(b) => b,
        None => return Ok(()),
    };

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

        if rune.is_some() {
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

            state_fields.insert(name, StateField { node: node.clone() });
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

    // Set state_fields on context before visiting children.
    // This corresponds to context.next({ ...context.state, state_fields }) in the official compiler.
    // The state_fields are needed by validate_assignment (in AssignmentExpression visitor)
    // and PropertyDefinition visitor to detect state_field_invalid_assignment errors.
    let saved_state_fields = std::mem::replace(
        &mut context.state_fields,
        state_fields.into_iter().collect(),
    );

    // Visit children (methods, properties, etc.)
    // This is equivalent to context.next() in the JavaScript implementation.
    // Traverse children via the typed walker.
    if let JsNode::ClassBody { body: body_ids, .. } = typed {
        let arena = context.parse_arena;
        for child in arena.get_js_children(*body_ids) {
            super::script::walk_js_node_typed(child, context)?;
        }
    }

    // Restore previous state_fields
    context.state_fields = saved_state_fields;

    Ok(())
}

/// Typed visitor for ClassBody.
///
/// For non-runes mode (the common case), walks children directly using the typed
/// traversal path, avoiding the expensive `to_value()` conversion entirely.
/// For runes mode, falls back to the Value-based `visit()` since class body analysis
/// with state fields requires deep JSON introspection (and runes class bodies are rare).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if !context.analysis.runes {
        // Non-runes fast path: just walk children using typed traversal
        if let JsNode::ClassBody { body, .. } = node {
            let arena = context.parse_arena;
            for child in arena.get_js_children(*body) {
                super::script::walk_js_node_typed(child, context)?;
            }
        }
        return Ok(());
    }

    // Runes mode: the state-field analysis needs deep introspection, so run it on
    // the Value form — but traverse children via the typed walker so this no longer
    // re-enters the legacy Value walker.
    let value = node.to_value();
    visit_impl(&value, node, context)
}
