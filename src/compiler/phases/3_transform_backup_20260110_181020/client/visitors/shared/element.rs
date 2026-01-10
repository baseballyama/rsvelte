//! Element attribute handling utilities.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/element.js`.

use crate::ast::template::{AttributeValue, AttributeValuePart, ExpressionTag};
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

/// Build class setter.
///
/// Creates a call to set a class on an element.
pub fn build_set_class(element: JsExpr, name: &str, value: JsExpr) -> JsStatement {
    b::stmt(b::call(
        b::member_path("$.set_class"),
        vec![element, b::string(name), value],
    ))
}

/// Build style setter.
///
/// Creates a call to set a style property on an element.
pub fn build_set_style(element: JsExpr, name: &str, value: JsExpr) -> JsStatement {
    b::stmt(b::call(
        b::member_path("$.set_style"),
        vec![element, b::string(name), value],
    ))
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
