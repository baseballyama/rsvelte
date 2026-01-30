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
#[cfg(test)]
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsLiteral;
use crate::compiler::phases::phase3_transform::js_ast::nodes::{
    JsExpr, JsObjectMember, JsStatement, JsTemplateLiteral,
};

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
            // Extract the expression from the ExpressionTag using the full expression converter
            let expression = extract_expression_from_tag_with_context(expr_tag, context);
            let metadata = extract_metadata_from_tag(expr_tag);

            // Check for reactive state using the comprehensive check that considers transforms
            let has_state =
                super::utils::expression_has_reactive_state(&expr_tag.expression, context);

            // Memoize if needed
            let memoized = memoize(expression, &metadata);

            AttributeValueResult {
                value: memoized,
                has_state,
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
                    let expression = extract_expression_from_tag_with_context(expr_tag, context);
                    let metadata = extract_metadata_from_tag(expr_tag);

                    // Check for reactive state using the comprehensive check that considers transforms
                    let has_state =
                        super::utils::expression_has_reactive_state(&expr_tag.expression, context);

                    let memoized = memoize(expression, &metadata);

                    AttributeValueResult {
                        value: memoized,
                        has_state,
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
    // Pre-allocate for typical attribute value complexity
    let mut quasis = Vec::with_capacity(4);
    let mut expressions = Vec::with_capacity(4);
    let mut has_state = false;
    let mut current_text = String::with_capacity(64);

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

                if metadata.has_state() {
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
/// This function converts the parsed ExpressionTag to a JsExpr using the
/// expression_converter module.
fn extract_expression_from_tag_with_context(
    expr_tag: &ExpressionTag,
    context: &mut ComponentContext,
) -> JsExpr {
    use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;

    // Use the expression converter to properly convert the expression
    convert_expression(&expr_tag.expression, context)
}

/// Extract the JavaScript expression from an ExpressionTag (simple version without context).
///
/// This is a fallback for cases where we don't have mutable access to context.
/// It only handles simple expressions like identifiers.
fn extract_expression_from_tag(expr_tag: &ExpressionTag) -> JsExpr {
    use crate::ast::js::Expression;

    // For simple cases, we can convert directly
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
            // Check if this is a literal value (number, string, boolean, null)
            // Literal values never have state
            let is_literal = is_literal_value(val);

            if is_literal {
                (false, false, false)
            } else {
                let expr_str = val.to_string();
                (
                    expr_str.contains('('),
                    expr_str.contains('.'),
                    // Only mark as having state if it references $state or $derived runes
                    // or is an identifier that might be reactive
                    expr_str.contains("$state") || expr_str.contains("$derived"),
                )
            }
        }
    };

    let mut metadata = ExpressionMetadata::default();
    metadata.set_has_call(has_call);
    metadata.set_has_await(false); // TODO: Detect await
    metadata.set_has_state(has_state);
    metadata.set_has_member_expression(has_member);
    metadata.set_has_assignment(false); // TODO: Detect assignment
    metadata.set_dynamic(false);
    // blockers defaults to empty Vec
    metadata
}

/// Check if a JSON value represents a literal (non-reactive) value.
///
/// Literals include: numbers, strings, booleans, null, undefined
/// These never have state and don't need reactive wrappers.
fn is_literal_value(val: &serde_json::Value) -> bool {
    match val {
        serde_json::Value::Null => true,
        serde_json::Value::Bool(_) => true,
        serde_json::Value::Number(_) => true,
        serde_json::Value::String(_) => true,
        serde_json::Value::Object(obj) => {
            // Check if this is a Literal AST node
            if let Some(serde_json::Value::String(node_type)) = obj.get("type") {
                matches!(
                    node_type.as_str(),
                    "Literal"
                        | "NumericLiteral"
                        | "StringLiteral"
                        | "BooleanLiteral"
                        | "NullLiteral"
                )
            } else {
                false
            }
        }
        serde_json::Value::Array(_) => false,
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
    let mut properties = Vec::with_capacity(class_directives.len());

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
    let mut normal_properties = Vec::with_capacity(style_directives.len());
    let mut important_properties = Vec::with_capacity(2);

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

/// Build an attribute effect for elements with spread attributes.
///
/// Corresponds to `build_attribute_effect` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/element.js`.
///
/// When an element has spread attributes, we use `$.attribute_effect()` to handle
/// all attributes and event handlers together. This ensures proper order is maintained
/// and event handlers can be overridden by spreads.
///
/// # Arguments
///
/// * `attributes` - Regular attributes and spread attributes
/// * `class_directives` - Class directives (class:foo)
/// * `style_directives` - Style directives (style:color)
/// * `context` - The component context
/// * `element_id` - The element identifier
/// * `css_hash` - The CSS hash for scoping
///
/// # Example Output
///
/// ```js
/// var event_handler = () => $.set(changed, 'a');
/// $.attribute_effect(div, () => ({ ...props, ona: event_handler }));
/// ```
pub fn build_attribute_effect(
    attributes: &[crate::ast::template::Attribute],
    class_directives: &[ClassDirective],
    style_directives: &[StyleDirective],
    context: &mut ComponentContext,
    element_id: JsExpr,
    css_hash: &str,
) {
    use crate::ast::template::Attribute;
    use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;

    // Pre-allocate based on number of attributes
    let mut properties: Vec<JsObjectMember> = Vec::with_capacity(attributes.len());
    let mut event_handler_decls: Vec<JsStatement> = Vec::with_capacity(4);

    for attribute in attributes {
        match attribute {
            Attribute::Attribute(attr) => {
                // Build the attribute value
                let result = build_attribute_value(&attr.value, context, |expr, _metadata| expr);

                // Check if this is an event attribute
                // Apply state transforms to expression (converts state variable refs to $.get())
                let transformed_value =
                    super::utils::apply_transforms_to_expression(&result.value, context);

                if is_event_attribute_node(attr) {
                    // Check if the value is an arrow function or function expression
                    if is_function_expression(&transformed_value) {
                        // Give the event handler a stable ID so it isn't removed and readded on every update
                        let id = context.state.memoizer.generate_id("event_handler");
                        event_handler_decls.push(b::var_decl(&id, Some(transformed_value)));
                        properties.push(b::prop(attr.name.to_string(), b::id(&id)));
                    } else {
                        properties.push(b::prop(attr.name.to_string(), transformed_value));
                    }
                } else {
                    properties.push(b::prop(attr.name.to_string(), transformed_value));
                }
            }
            Attribute::SpreadAttribute(spread) => {
                // Convert the spread expression
                let spread_expr = convert_expression(&spread.expression, context);
                // Apply transforms to handle state variables ($.get() wrapping)
                let transformed_expr =
                    super::utils::apply_transforms_to_expression(&spread_expr, context);
                properties.push(b::spread(transformed_expr));
            }
            _ => {}
        }
    }

    // Add class directives
    if !class_directives.is_empty() {
        let class_obj = build_class_directives_object(class_directives, context);
        // Use $.CLASS as the key - using computed property
        properties.push(b::prop_computed(b::member_path("$.CLASS"), class_obj));
    }

    // Add style directives
    if !style_directives.is_empty() {
        let style_obj = build_style_directives_object(style_directives, context);
        // Use $.STYLE as the key - using computed property
        properties.push(b::prop_computed(b::member_path("$.STYLE"), style_obj));
    }

    // Add event handler declarations first
    for decl in event_handler_decls {
        context.state.init.push(decl);
    }

    // Build the attribute effect call
    // $.attribute_effect(element, () => ({ ...attrs }), sync_values?, async_values?, blockers?, css_hash?)
    let obj = b::object(properties);
    let arrow = b::arrow(vec![], obj);

    let mut args = vec![element_id, arrow];

    // For now, we don't handle memoization - pass undefined for sync/async values
    // This matches the simple case without complex expressions

    // Add CSS hash if present
    if !css_hash.is_empty() {
        // Need to add undefined placeholders for sync_values, async_values, blockers
        args.push(b::undefined());
        args.push(b::undefined());
        args.push(b::undefined());
        args.push(b::string(css_hash));
    }

    context
        .state
        .init
        .push(b::stmt(b::call(b::member_path("$.attribute_effect"), args)));
}

/// Check if an attribute node is an event attribute (starts with "on").
fn is_event_attribute_node(attr: &crate::ast::template::AttributeNode) -> bool {
    attr.name.starts_with("on")
}

/// Check if an expression is a function expression (arrow or function).
fn is_function_expression(expr: &JsExpr) -> bool {
    matches!(expr, JsExpr::Arrow(_) | JsExpr::Function(_))
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
    use std::rc::Rc;

    #[test]
    fn test_build_attribute_value_true() {
        // Create a minimal context (this would need proper setup in real tests)
        let analysis = ComponentAnalysis::new("", &Default::default());
        let scope = crate::compiler::phases::phase2_analyze::scope::Scope::new(None);
        let scope_root = crate::compiler::phases::phase2_analyze::scope::ScopeRoot::new();
        let options = Rc::new(TransformOptions::default());
        let state = ComponentClientTransformState::new(
            &scope,
            &scope_root,
            &analysis,
            b::id("node"),
            options,
        );
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
        let options = Rc::new(TransformOptions::default());
        let state = ComponentClientTransformState::new(
            &scope,
            &scope_root,
            &analysis,
            b::id("node"),
            options,
        );
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

    #[test]
    fn test_is_literal_value_number() {
        // Number AST node: { "type": "Literal", "value": 5 }
        let val = serde_json::json!({
            "type": "Literal",
            "value": 5
        });
        assert!(
            is_literal_value(&val),
            "Literal number should be detected as literal"
        );
    }

    #[test]
    fn test_is_literal_value_identifier() {
        // Identifier AST node: { "type": "Identifier", "name": "foo" }
        let val = serde_json::json!({
            "type": "Identifier",
            "name": "foo"
        });
        assert!(
            !is_literal_value(&val),
            "Identifier should not be detected as literal"
        );
    }

    #[test]
    fn test_is_literal_value_raw_number() {
        // Raw JSON number
        let val = serde_json::json!(5);
        assert!(
            is_literal_value(&val),
            "Raw number should be detected as literal"
        );
    }

    #[test]
    fn test_parse_literal_attribute() {
        // Test that literal attributes (a={5}) are correctly parsed
        // and recognized as non-reactive (has_state = false)
        let input = "<Test a={5} />";
        let result = crate::parse(input, Default::default()).unwrap();

        // Find the Component node
        let mut found_component = false;
        for node in &result.fragment.nodes {
            if let crate::ast::template::TemplateNode::Component(comp) = node {
                found_component = true;
                assert_eq!(comp.name.to_string(), "Test");

                for attr in &comp.attributes {
                    if let crate::ast::template::Attribute::Attribute(a) = attr {
                        assert_eq!(a.name.as_str(), "a");

                        // The attribute value should be an Expression
                        if let crate::ast::template::AttributeValue::Expression(expr_tag) = &a.value
                        {
                            let crate::ast::js::Expression::Value(val) = &expr_tag.expression;

                            // Should be recognized as a literal
                            assert!(
                                is_literal_value(val),
                                "Numeric literal should be detected as literal"
                            );

                            // Metadata should have has_state = false
                            let metadata = extract_metadata_from_tag(expr_tag);
                            assert!(!metadata.has_state(), "Literal value should not have state");
                        } else {
                            panic!("Expected Expression attribute value");
                        }
                    }
                }
            }
        }
        assert!(found_component, "Should find Component node");
    }
}
