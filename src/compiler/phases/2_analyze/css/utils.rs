//! CSS utility functions.
//!
//! Provides helper functions for CSS analysis.
//!
//! Corresponds to Svelte's `2-analyze/css/utils.js`.

/// Sentinel value for unknown CSS values.
#[derive(Debug, Clone, PartialEq)]
pub struct Unknown;

/// Returns all parent rules from a rule path; root is last.
pub fn get_parent_rules<'a>(path: &[&'a serde_json::Value]) -> Vec<&'a serde_json::Value> {
    path.iter()
        .filter(|node| {
            node.get("type")
                .and_then(|t| t.as_str())
                .map(|t| t == "Rule")
                .unwrap_or(false)
        })
        .copied()
        .collect()
}

/// True if a relative selector is `:global(...)` or `:global`.
pub fn is_global(selector: &serde_json::Value) -> bool {
    if let Some(selectors) = selector.get("selectors").and_then(|s| s.as_array())
        && let Some(first) = selectors.first()
        && let Some(sel_type) = first.get("type").and_then(|t| t.as_str())
        && sel_type == "PseudoClassSelector"
        && let Some(name) = first.get("name").and_then(|n| n.as_str())
    {
        return name == "global";
    }
    false
}

/// `true` if is a pseudo class that cannot be or is not scoped.
pub fn is_unscoped_pseudo_class(selector: &serde_json::Value) -> bool {
    if let Some(sel_type) = selector.get("type").and_then(|t| t.as_str())
        && sel_type == "PseudoClassSelector"
        && let Some(name) = selector.get("name").and_then(|n| n.as_str())
    {
        // These pseudo-classes can contain scoped selectors
        let scoping_pseudo = matches!(name, "has" | "is" | "where" | "not");
        if !scoping_pseudo {
            return true;
        }

        // Check if args is null (no children to scope)
        if selector.get("args").is_none() {
            return true;
        }
    }
    false
}

/// True if is `:global(...)` or `:global`, irrespective of scoped pseudo classes.
pub fn is_outer_global(selector: &serde_json::Value) -> bool {
    if let Some(selectors) = selector.get("selectors").and_then(|s| s.as_array())
        && let Some(first) = selectors.first()
        && let Some(sel_type) = first.get("type").and_then(|t| t.as_str())
        && sel_type == "PseudoClassSelector"
        && let Some(name) = first.get("name").and_then(|n| n.as_str())
        && name == "global"
    {
        // Check if all selectors are pseudo classes/elements
        return selectors.iter().all(|s| {
            matches!(
                s.get("type").and_then(|t| t.as_str()),
                Some("PseudoClassSelector") | Some("PseudoElementSelector")
            )
        });
    }
    false
}

/// Marker for unknown values (when we can't statically determine all possible values).
const UNKNOWN_MARKER: &str = "__UNKNOWN__";

/// Get possible values from an expression chunk (Text, ExpressionTag, or direct expression).
///
/// Returns `None` if the values cannot be determined statically (dynamic expression).
/// Returns `Some(Vec<String>)` if we can determine all possible values.
///
/// This is used for class attribute analysis to determine which classes might be used.
pub fn get_possible_values(chunk: &serde_json::Value, is_class: bool) -> Option<Vec<String>> {
    let mut values = Vec::new();
    let chunk_type = chunk.get("type").and_then(|t| t.as_str());

    // Handle Text nodes
    if let Some("Text") = chunk_type
        && let Some(data) = chunk.get("data").and_then(|d| d.as_str())
    {
        values.push(data.to_string());
        return Some(values);
    }

    // Handle ExpressionTag nodes
    if let Some("ExpressionTag") = chunk_type
        && let Some(expression) = chunk.get("expression")
    {
        gather_possible_values(expression, is_class, &mut values, false);
    } else if chunk_type.is_some() {
        // Handle direct expression nodes (ObjectExpression, Identifier, etc.)
        // This happens when class={{ ... }} is parsed directly as an expression
        gather_possible_values(chunk, is_class, &mut values, false);
    }

    // Check if we encountered UNKNOWN
    if values.iter().any(|v| v == UNKNOWN_MARKER) {
        return None;
    }

    Some(values)
}

/// Gather possible values from an expression node.
///
/// This recursively traverses the expression AST to find all possible string values
/// that the expression could evaluate to.
fn gather_possible_values(
    node: &serde_json::Value,
    is_class: bool,
    values: &mut Vec<String>,
    is_nested: bool,
) {
    // If we already found UNKNOWN, no point continuing
    if values.iter().any(|v| v == UNKNOWN_MARKER) {
        return;
    }

    let node_type = node.get("type").and_then(|t| t.as_str());

    match node_type {
        Some("Literal") => {
            // Handle string literals
            if let Some(value) = node.get("value") {
                let string_value = match value {
                    serde_json::Value::String(s) => s.clone(),
                    serde_json::Value::Number(n) => n.to_string(),
                    serde_json::Value::Bool(b) => b.to_string(),
                    serde_json::Value::Null => String::new(),
                    _ => {
                        values.push(UNKNOWN_MARKER.to_string());
                        return;
                    }
                };
                values.push(string_value);
            }
        }

        Some("ConditionalExpression") => {
            // Handle ternary: condition ? consequent : alternate
            if let Some(consequent) = node.get("consequent") {
                gather_possible_values(consequent, is_class, values, is_nested);
            }
            if let Some(alternate) = node.get("alternate") {
                gather_possible_values(alternate, is_class, values, is_nested);
            }
        }

        Some("LogicalExpression") => {
            if let Some(operator) = node.get("operator").and_then(|o| o.as_str()) {
                if operator == "&&" {
                    // Special case for &&: left side can be included if it's falsy
                    let mut left_values = Vec::new();
                    if let Some(left) = node.get("left") {
                        gather_possible_values(left, is_class, &mut left_values, is_nested);
                    }

                    if left_values.iter().any(|v| v == UNKNOWN_MARKER) {
                        // Add falsy values unless this is a class in nested context
                        if !is_class || !is_nested {
                            values.push(String::new());
                            values.push("false".to_string());
                            values.push("NaN".to_string());
                            values.push("0".to_string());
                        }
                    } else {
                        for value in &left_values {
                            // Check if value is falsy (empty string, "false", "0", etc.)
                            let is_falsy = value.is_empty()
                                || value == "false"
                                || value == "0"
                                || value == "NaN"
                                || value == "null"
                                || value == "undefined";

                            if is_falsy && (!is_class || !is_nested) {
                                values.push(value.clone());
                            }
                        }
                    }

                    // Always add right side values
                    if let Some(right) = node.get("right") {
                        gather_possible_values(right, is_class, values, is_nested);
                    }
                } else {
                    // For || and other operators, add both sides
                    if let Some(left) = node.get("left") {
                        gather_possible_values(left, is_class, values, is_nested);
                    }
                    if let Some(right) = node.get("right") {
                        gather_possible_values(right, is_class, values, is_nested);
                    }
                }
            }
        }

        Some("ArrayExpression") if is_class => {
            // Arrays are used in class attributes: class={['foo', 'bar']}
            if let Some(elements) = node.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    // Skip null/undefined array elements
                    if !element.is_null() {
                        gather_possible_values(element, is_class, values, true);
                    }
                }
            }
        }

        Some("ObjectExpression") if is_class => {
            // Objects are used in class attributes: class={{ foo: true, bar: false }}
            if let Some(properties) = node.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if property.get("type").and_then(|t| t.as_str()) == Some("Property") {
                        let is_computed = property
                            .get("computed")
                            .and_then(|c| c.as_bool())
                            .unwrap_or(false);

                        if !is_computed {
                            if let Some(key) = property.get("key") {
                                let key_type = key.get("type").and_then(|t| t.as_str());
                                match key_type {
                                    Some("Identifier") => {
                                        if let Some(name) = key.get("name").and_then(|n| n.as_str())
                                        {
                                            values.push(name.to_string());
                                        }
                                    }
                                    Some("Literal") => {
                                        if let Some(value) =
                                            key.get("value").and_then(|v| v.as_str())
                                        {
                                            values.push(value.to_string());
                                        }
                                    }
                                    _ => {
                                        values.push(UNKNOWN_MARKER.to_string());
                                    }
                                }
                            }
                        } else {
                            values.push(UNKNOWN_MARKER.to_string());
                        }
                    } else {
                        values.push(UNKNOWN_MARKER.to_string());
                    }
                }
            }
        }

        Some("BinaryExpression") => {
            // Handle string concatenation
            if let Some(operator) = node.get("operator").and_then(|o| o.as_str()) {
                if operator == "+" {
                    // String concatenation
                    let mut left_values = Vec::new();
                    let mut right_values = Vec::new();

                    if let Some(left) = node.get("left") {
                        gather_possible_values(left, is_class, &mut left_values, is_nested);
                    }
                    if let Some(right) = node.get("right") {
                        gather_possible_values(right, is_class, &mut right_values, is_nested);
                    }

                    // If either side is unknown, the whole thing is unknown
                    if left_values.iter().any(|v| v == UNKNOWN_MARKER)
                        || right_values.iter().any(|v| v == UNKNOWN_MARKER)
                    {
                        values.push(UNKNOWN_MARKER.to_string());
                    } else {
                        // Combine all possibilities
                        for left in &left_values {
                            for right in &right_values {
                                values.push(format!("{}{}", left, right));
                            }
                        }
                    }
                } else {
                    // Other operators we can't determine statically
                    values.push(UNKNOWN_MARKER.to_string());
                }
            }
        }

        Some("TemplateLiteral") => {
            // Handle template literals: `foo ${bar} baz`
            if let Some(quasis) = node.get("quasis").and_then(|q| q.as_array())
                && let Some(expressions) = node.get("expressions").and_then(|e| e.as_array())
            {
                // If there are expressions, we can't determine the value statically
                if !expressions.is_empty() {
                    values.push(UNKNOWN_MARKER.to_string());
                } else if quasis.len() == 1 {
                    // Static template literal with no expressions
                    if let Some(value) = quasis[0]
                        .get("value")
                        .and_then(|v| v.get("cooked"))
                        .and_then(|c| c.as_str())
                    {
                        values.push(value.to_string());
                    }
                }
            }
        }

        _ => {
            // Unknown expression type - mark as unknown
            values.push(UNKNOWN_MARKER.to_string());
        }
    }
}

/// True if is `:global` (without arguments).
pub fn is_global_block_selector(selector: &serde_json::Value) -> bool {
    if let Some(sel_type) = selector.get("type").and_then(|t| t.as_str())
        && sel_type == "PseudoClassSelector"
        && let Some(name) = selector.get("name").and_then(|n| n.as_str())
    {
        return name == "global" && selector.get("args").is_none();
    }
    false
}
