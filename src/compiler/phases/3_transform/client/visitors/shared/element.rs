//! Element attribute handling utilities.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/element.js`.

use crate::ast::template::{
    AttributeValue, AttributeValuePart, ClassDirective, ExpressionTag,
    RegularElement as RegularElementNode, StyleDirective,
};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

use super::utils::build_expression;

/// Build an attribute value expression.
///
/// Corresponds to `build_attribute_value` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/element.js`.
///
/// # Arguments
///
/// * `value` - The attribute value (True, Expression, or Sequence)
/// * `context` - The component context
/// * `memoize` - Function to memoize complex expressions
///
/// # Returns
///
/// Returns the attribute value expression and whether it contains state references.
pub fn build_attribute_value<F>(
    value: &AttributeValue,
    context: &mut ComponentContext,
    memoize: F,
) -> AttributeValueResult
where
    F: Fn(JsExpr, &ExpressionMetadata) -> JsExpr,
{
    match value {
        AttributeValue::True(_) => AttributeValueResult {
            value: b::boolean(true),
            has_state: false,
        },

        AttributeValue::Expression(expr_tag) => {
            // Extract the expression from the ExpressionTag
            let expression = extract_expression_from_tag(expr_tag);
            let metadata = extract_metadata_from_tag(expr_tag);

            // Build the expression with reactivity handling
            let built = build_expression(context, &expression, &metadata);

            // Memoize if needed
            let memoized = memoize(built, &metadata);

            AttributeValueResult {
                value: memoized,
                has_state: metadata.has_state,
            }
        }

        AttributeValue::Sequence(parts) if parts.len() == 1 => {
            // Single part - handle as simple value
            match &parts[0] {
                AttributeValuePart::Text(text) => AttributeValueResult {
                    value: b::string(text.data.as_str()),
                    has_state: false,
                },

                AttributeValuePart::ExpressionTag(expr_tag) => {
                    let expression = extract_expression_from_tag(expr_tag);
                    let metadata = extract_metadata_from_tag(expr_tag);

                    let built = build_expression(context, &expression, &metadata);
                    let memoized = memoize(built, &metadata);

                    AttributeValueResult {
                        value: memoized,
                        has_state: metadata.has_state,
                    }
                }
            }
        }

        AttributeValue::Sequence(parts) => {
            // Multiple parts - build template literal
            build_template_chunk(parts, context, memoize)
        }
    }
}

/// Result of building an attribute value.
#[derive(Debug)]
pub struct AttributeValueResult {
    /// The JavaScript expression for the attribute value
    pub value: JsExpr,

    /// Whether the value contains reactive state references
    pub has_state: bool,
}

/// Build a template chunk from text and expression parts.
///
/// Creates a template literal like `foo ${expr} bar`.
fn build_template_chunk<F>(
    values: &[AttributeValuePart],
    context: &mut ComponentContext,
    memoize: F,
) -> AttributeValueResult
where
    F: Fn(JsExpr, &ExpressionMetadata) -> JsExpr,
{
    let mut quasis = Vec::new();
    let mut expressions = Vec::new();
    let mut has_state = false;
    let mut current_text = String::new();

    for part in values {
        match part {
            AttributeValuePart::Text(text) => {
                current_text.push_str(&text.data);
            }

            AttributeValuePart::ExpressionTag(expr_tag) => {
                // Push the accumulated text as a quasi
                quasis.push(b::quasi(&current_text, false));
                current_text.clear();

                // Build the expression
                let expression = extract_expression_from_tag(expr_tag);
                let metadata = extract_metadata_from_tag(expr_tag);

                let built = build_expression(context, &expression, &metadata);
                let memoized = memoize(built, &metadata);

                expressions.push(memoized);

                if metadata.has_state {
                    has_state = true;
                }
            }
        }
    }

    // Push the final text
    quasis.push(b::quasi(&current_text, true));

    AttributeValueResult {
        value: JsExpr::TemplateLiteral(JsTemplateLiteral {
            quasis,
            expressions,
        }),
        has_state,
    }
}

/// Extract the JavaScript expression from an ExpressionTag.
///
/// TODO: This is a placeholder - implement proper expression extraction
/// based on the actual ExpressionTag structure.
fn extract_expression_from_tag(expr_tag: &ExpressionTag) -> JsExpr {
    use crate::ast::js::Expression;

    // For now, convert the expression to a string and create an identifier
    // In the full implementation, this would properly parse the expression
    match &expr_tag.expression {
        Expression::Value(val) => match val {
            serde_json::Value::Object(obj) => {
                // Try to extract the identifier name
                if let Some(serde_json::Value::String(name)) = obj.get("name") {
                    b::id(name)
                } else {
                    b::id("expr")
                }
            }
            serde_json::Value::String(s) => b::id(s),
            _ => b::id("expr"),
        },
    }
}

/// Extract metadata from an ExpressionTag.
///
/// TODO: This is a placeholder - implement proper metadata extraction.
fn extract_metadata_from_tag(expr_tag: &ExpressionTag) -> ExpressionMetadata {
    use crate::ast::js::Expression;

    // For now, analyze the expression to guess metadata
    let (has_call, has_member, has_state) = match &expr_tag.expression {
        Expression::Value(val) => {
            let expr_str = val.to_string();
            (
                expr_str.contains('('),
                expr_str.contains('.'),
                expr_str.contains("$state") || expr_str.contains("$derived"),
            )
        }
    };

    ExpressionMetadata {
        has_call,
        has_await: false, // TODO: Detect await
        has_state,
        has_member_expression: has_member,
        has_assignment: false, // TODO: Detect assignment
        dynamic: false,
        blockers: Vec::new(), // TODO: Detect blockers
    }
}

/// Build attribute setter.
///
/// Creates a call to set an attribute on an element.
pub fn build_set_attribute(element: JsExpr, name: &str, value: JsExpr) -> JsStatement {
    b::stmt(b::call(
        b::member_path("$.set_attribute"),
        vec![element, b::string(name), value],
    ))
}

/// Build an object from class directives.
///
/// Corresponds to `build_class_directives_object` in RegularElement.js.
/// Creates an object like `{ foo: condition, bar: otherCondition }`.
pub fn build_class_directives_object(
    class_directives: &[ClassDirective],
    _context: &mut ComponentContext,
) -> JsExpr {
    let mut properties = Vec::new();

    for directive in class_directives {
        // Extract expression from directive
        let expression = extract_expression_from_directive(&directive.expression);
        properties.push(b::prop(directive.name.to_string(), expression));
    }

    b::object(properties)
}

/// Build an object from style directives.
///
/// Corresponds to `build_style_directives_object` in RegularElement.js.
/// Creates either:
/// - A simple object `{ color: value }` for normal styles
/// - An array `[normal, important]` if there are !important modifiers
pub fn build_style_directives_object(
    style_directives: &[StyleDirective],
    context: &mut ComponentContext,
) -> JsExpr {
    let mut normal_properties = Vec::new();
    let mut important_properties = Vec::new();

    for directive in style_directives {
        // Build the expression for this directive
        let expression = if matches!(&directive.value, AttributeValue::True(true)) {
            // style:color shorthand - use the name as an identifier
            b::id(directive.name.as_str())
        } else {
            // style:color={value} or style:color="value"
            let result = build_attribute_value(&directive.value, context, |expr, _| expr);
            result.value
        };

        // Check if this has the !important modifier
        let is_important = directive
            .modifiers
            .iter()
            .any(|m| m.as_str() == "important");

        if is_important {
            important_properties.push(b::prop(directive.name.to_string(), expression));
        } else {
            normal_properties.push(b::prop(directive.name.to_string(), expression));
        }
    }

    let normal_obj = b::object(normal_properties);

    if important_properties.is_empty() {
        normal_obj
    } else {
        // Return [normal, important] array
        b::array(vec![normal_obj, b::object(important_properties)])
    }
}

/// Build a $.set_class() call for an element with class directives.
///
/// Corresponds to `build_set_class` in shared/element.js.
///
/// Generates: `$.set_class(element, flags, class_attr, css_hash, prev, next)`
/// Where:
/// - flags: 1 for HTML elements, 0 for SVG
/// - class_attr: The static class attribute value (or "")
/// - css_hash: The CSS scoping hash (or null)
/// - prev: Previous class directives state (or {})
/// - next: Current class directives object
#[allow(clippy::too_many_arguments)]
pub fn build_set_class_call(
    _element: &RegularElementNode,
    node_expr: JsExpr,
    class_directives: &[ClassDirective],
    context: &mut ComponentContext,
    is_html: bool,
    css_hash: &str,
) -> JsExpr {
    // Build class directives object: { foo: condition, bar: otherCondition }
    let class_obj = build_class_directives_object(class_directives, context);

    // Flags: 1 for HTML, 0 for SVG
    let flags = if is_html {
        b::number(1.0)
    } else {
        b::number(0.0)
    };

    // Class attribute value (empty string if no class attribute)
    let class_attr = b::string("");

    // CSS hash for scoping (null if no hash)
    let css_binding = if css_hash.is_empty() {
        b::null()
    } else {
        b::string(css_hash)
    };

    // Previous state (empty object for initial render)
    let prev = b::empty_object();

    // $.set_class(element, flags, class_attr, css_hash, prev, next)
    b::call(
        b::member_path("$.set_class"),
        vec![node_expr, flags, class_attr, css_binding, prev, class_obj],
    )
}

/// Build a $.set_style() call for an element with style directives.
///
/// Corresponds to `build_set_style` in shared/element.js.
///
/// Generates: `$.set_style(element, style_attr, prev, next)`
/// Where:
/// - style_attr: The static style attribute value (or "")
/// - prev: Previous style directives state (or {})
/// - next: Current style directives object
pub fn build_set_style_call(
    node_expr: JsExpr,
    style_directives: &[StyleDirective],
    context: &mut ComponentContext,
) -> JsExpr {
    // Build style directives object
    let style_obj = build_style_directives_object(style_directives, context);

    // Style attribute value (empty string if no style attribute)
    let style_attr = b::string("");

    // Previous state (empty object for initial render)
    let prev = b::empty_object();

    // $.set_style(element, style_attr, prev, next)
    b::call(
        b::member_path("$.set_style"),
        vec![node_expr, style_attr, prev, style_obj],
    )
}

/// Extract a JavaScript expression from a directive's expression.
fn extract_expression_from_directive(expression: &crate::ast::js::Expression) -> JsExpr {
    use crate::ast::js::Expression;

    match expression {
        Expression::Value(val) => match val {
            serde_json::Value::Object(obj) => {
                // Check if it's a Literal with a value field
                if let Some(serde_json::Value::String(type_str)) = obj.get("type") {
                    if type_str == "Literal" {
                        if let Some(value) = obj.get("value") {
                            return match value {
                                serde_json::Value::Bool(b) => b::boolean(*b),
                                serde_json::Value::Number(n) => {
                                    if let Some(f) = n.as_f64() {
                                        b::number(f)
                                    } else {
                                        b::number(0.0)
                                    }
                                }
                                serde_json::Value::String(s) => b::string(s),
                                serde_json::Value::Null => b::null(),
                                _ => b::boolean(true),
                            };
                        }
                    } else if type_str == "Identifier" {
                        // It's an identifier
                        if let Some(serde_json::Value::String(name)) = obj.get("name") {
                            return b::id(name);
                        }
                    }
                }
                // Try to extract the identifier name
                if let Some(serde_json::Value::String(name)) = obj.get("name") {
                    b::id(name)
                } else {
                    b::boolean(true)
                }
            }
            serde_json::Value::Bool(b) => b::boolean(*b),
            serde_json::Value::String(s) => b::id(s),
            serde_json::Value::Number(n) => {
                if let Some(f) = n.as_f64() {
                    b::number(f)
                } else {
                    b::number(0.0)
                }
            }
            serde_json::Value::Null => b::null(),
            _ => b::boolean(true),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ast::template::Text;
    use crate::compiler::ComponentAnalysis;

    #[test]
    fn test_build_attribute_value_true() {
        // Create a minimal context (this would need proper setup in real tests)
        let analysis = ComponentAnalysis::new("", &Default::default());
        let scope = crate::compiler::phases::phase2_analyze::scope::Scope::new(None);
        let scope_root = crate::compiler::phases::phase2_analyze::scope::ScopeRoot::new();
        let state =
            ComponentClientTransformState::new(&scope, &scope_root, &analysis, b::id("node"));
        let mut context = ComponentContext::new(state, |_, _, _| TransformResult::None);

        let value = AttributeValue::True(true);
        let result = build_attribute_value(&value, &mut context, |expr, _| expr);

        assert!(!result.has_state);
        match result.value {
            JsExpr::Literal(JsLiteral::Boolean(true)) => {}
            _ => panic!("Expected true literal"),
        }
    }

    #[test]
    fn test_build_attribute_value_text() {
        let analysis = ComponentAnalysis::new("", &Default::default());
        let scope = crate::compiler::phases::phase2_analyze::scope::Scope::new(None);
        let scope_root = crate::compiler::phases::phase2_analyze::scope::ScopeRoot::new();
        let state =
            ComponentClientTransformState::new(&scope, &scope_root, &analysis, b::id("node"));
        let mut context = ComponentContext::new(state, |_, _, _| TransformResult::None);

        let value = AttributeValue::Sequence(vec![AttributeValuePart::Text(Text {
            data: "hello".into(),
            raw: "hello".into(),
            start: 0,
            end: 5,
        })]);

        let result = build_attribute_value(&value, &mut context, |expr, _| expr);

        assert!(!result.has_state);
        match result.value {
            JsExpr::Literal(JsLiteral::String(s)) => assert_eq!(s, "hello"),
            _ => panic!("Expected string literal"),
        }
    }
}
