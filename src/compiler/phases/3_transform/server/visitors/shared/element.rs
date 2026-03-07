//! Server-side element rendering utilities.
//!
//! This module contains functions for building element attributes and spread
//! handling during SSR. It corresponds to
//! `svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/shared/element.js`.

use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, ClassDirective, RegularElement,
    SpreadAttribute, StyleDirective, SvelteDynamicElement,
};
use crate::compiler::constants::{
    ELEMENT_IS_INPUT, ELEMENT_IS_NAMESPACED, ELEMENT_PRESERVE_ATTRIBUTE_CASE,
};
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::compiler::phases::phase3_transform::server::types::{
    ComponentServerTransformState, TemplateItem,
};
use crate::compiler::phases::phase3_transform::shared::{
    escape_attr, is_boolean_attribute, is_custom_element_node,
};

use super::utils::{build_attribute_value, convert_expression_simple};

/// Represents either a regular attribute or a spread attribute.
/// Used when processing attributes that may contain spreads.
enum AttributeOrSpread<'a> {
    Attribute(&'a AttributeNode),
    Spread(&'a SpreadAttribute),
}

/// Whitespace-insensitive attributes (can be normalized).
const WHITESPACE_INSENSITIVE_ATTRIBUTES: &[&str] = &["class", "style"];

/// Check if a class attribute value needs to be wrapped in $.clsx().
///
/// Corresponds to the condition in Attribute.js for setting needs_clsx:
/// - The value is a single Expression (not a Sequence or True)
/// - The expression type is NOT Literal, TemplateLiteral, or BinaryExpression
///
/// This is needed for class={x} where x is a variable, array, or object,
/// because Svelte's clsx function normalizes these to proper class strings.
fn needs_clsx(attr_value: &AttributeValue) -> bool {
    // Helper to check if an expression type needs clsx
    let expr_needs_clsx = |expr_type: &str| -> bool {
        // Needs clsx if NOT a simple literal, template literal, or binary expression
        !matches!(
            expr_type,
            "Literal" | "TemplateLiteral" | "BinaryExpression"
        )
    };

    match attr_value {
        AttributeValue::Expression(expr_tag) => {
            // Get expression type
            let expr_type = expr_tag.expression.node_type().unwrap_or("");
            expr_needs_clsx(expr_type)
        }
        // Also check for Sequence with single ExpressionTag (for quoted expressions like class="{x}")
        AttributeValue::Sequence(parts) if parts.len() == 1 => {
            if let AttributeValuePart::ExpressionTag(expr_tag) = &parts[0] {
                let expr_type = expr_tag.expression.node_type().unwrap_or("");
                expr_needs_clsx(expr_type)
            } else {
                // Single text part doesn't need clsx
                false
            }
        }
        // Multiple parts (mixed text and expressions) or True don't need clsx
        _ => false,
    }
}

/// Builds element attributes for server-side rendering.
///
/// This function processes all attributes on an element and adds them to the
/// template output. It handles:
/// - Regular attributes
/// - Spread attributes
/// - Class and style directives
/// - Bind directives
/// - Event handlers (special cases only)
///
/// Some attributes (like `value` for textarea) are returned as content instead
/// of being added as attributes.
///
/// Corresponds to `build_element_attributes()` in `element.js`.
///
/// # Arguments
///
/// * `node` - The element node
/// * `state` - The component server transform state
/// * `transform` - A function to transform expressions (e.g., for async optimization)
///
/// # Returns
///
/// Optional content expression (for textarea value or contenteditable bindings)
pub fn build_element_attributes<F>(
    node: &dyn ElementNode,
    state: &mut ComponentServerTransformState,
    transform: F,
) -> Option<JsExpr>
where
    F: Fn(JsExpr) -> JsExpr + Clone,
{
    let mut attributes: Vec<AttributeOrSpread> = Vec::new();
    let mut class_directives: Vec<&ClassDirective> = Vec::new();
    let mut style_directives: Vec<&StyleDirective> = Vec::new();
    let mut content: Option<JsExpr> = None;
    let mut has_spread = false;
    let mut events_to_capture: std::collections::HashSet<String> = std::collections::HashSet::new();

    // Collect attributes by type
    for attribute in node.get_attributes() {
        match attribute {
            Attribute::Attribute(attr) => {
                // Handle special cases
                if attr.name == "value" {
                    if node.get_name() == "textarea" {
                        // Textarea value becomes content
                        let value =
                            build_attribute_value(&attr.value, transform.clone(), false, false);
                        content = Some(JsExpr::Call(JsCallExpression {
                            callee: Box::new(JsExpr::Member(JsMemberExpression {
                                object: Box::new(JsExpr::Identifier("$".into())),
                                property: JsMemberProperty::Identifier("escape".into()),
                                computed: false,
                                optional: false,
                            })),
                            arguments: vec![value],
                            optional: false,
                        }));
                    } else if node.get_name() != "select" {
                        // For select, value attribute is omitted
                        attributes.push(AttributeOrSpread::Attribute(attr));
                    }
                } else if is_event_attribute(&attr.name) {
                    // Event handlers are generally omitted in SSR
                    // Special case: onload/onerror for certain elements
                    if (attr.name == "onload" || attr.name == "onerror")
                        && is_load_error_element(node.get_name())
                    {
                        events_to_capture.insert(attr.name.to_string());
                    }
                } else if attr.name != "defaultValue" && attr.name != "defaultChecked" {
                    // Regular attributes
                    attributes.push(AttributeOrSpread::Attribute(attr));
                }
            }
            Attribute::BindDirective(bind) => {
                if bind.name == "value" && node.get_name() == "select" {
                    continue;
                }
                // Skip bind:value for file inputs
                if bind.name == "value" {
                    let is_file_input = node.get_attributes().iter().any(|a| {
                        if let Attribute::Attribute(attr) = a {
                            if attr.name == "type"
                                && let AttributeValue::Sequence(parts) = &attr.value
                            {
                                return parts.first().is_some_and(|p| {
                                    matches!(p, AttributeValuePart::Text(t) if t.data == "file")
                                });
                            }
                            false
                        } else {
                            false
                        }
                    });
                    if is_file_input {
                        continue;
                    }
                }
                if bind.name == "this" {
                    continue;
                }

                // Check if this binding should be omitted in SSR
                // TODO: Full binding_properties check
                let omit_in_ssr = matches!(
                    bind.name.as_str(),
                    "clientWidth"
                        | "clientHeight"
                        | "offsetWidth"
                        | "offsetHeight"
                        | "contentRect"
                        | "contentBoxSize"
                        | "borderBoxSize"
                        | "devicePixelContentBoxSize"
                        | "naturalWidth"
                        | "naturalHeight"
                        | "videoWidth"
                        | "videoHeight"
                        | "duration"
                        | "buffered"
                        | "played"
                        | "seekable"
                        | "seeking"
                        | "ended"
                        | "readyState"
                        | "currentTime"
                        | "playbackRate"
                        | "paused"
                        | "volume"
                        | "muted"
                        | "innerWidth"
                        | "innerHeight"
                        | "outerWidth"
                        | "outerHeight"
                        | "scrollX"
                        | "scrollY"
                        | "online"
                        | "devicePixelRatio"
                );
                if omit_in_ssr {
                    continue;
                }

                // Convert bind directive expression to a value
                let expression = convert_expression_simple(&bind.expression);

                // Handle content-editable bindings
                if matches!(
                    bind.name.as_str(),
                    "innerHTML" | "textContent" | "innerText"
                ) {
                    content = Some(expression);
                } else if bind.name == "value" && node.get_name() == "textarea" {
                    content = Some(JsExpr::Call(JsCallExpression {
                        callee: Box::new(JsExpr::Member(JsMemberExpression {
                            object: Box::new(JsExpr::Identifier("$".into())),
                            property: JsMemberProperty::Identifier("escape".into()),
                            computed: false,
                            optional: false,
                        })),
                        arguments: vec![expression],
                        optional: false,
                    }));
                } else if bind.name == "group" {
                    // bind:group requires special handling with value attribute
                    // For now, skip group bindings in the simple case
                    // TODO: Implement full group binding logic
                    continue;
                } else {
                    // General case: treat as a dynamic attribute
                    let name = get_attribute_name(node, &bind.name);

                    if !has_spread {
                        // In non-spread path, generate $.attr() call directly
                        state.template.push(TemplateItem::Expression(JsExpr::Call(
                            JsCallExpression {
                                callee: Box::new(JsExpr::Member(JsMemberExpression {
                                    object: Box::new(JsExpr::Identifier("$".into())),
                                    property: JsMemberProperty::Identifier("attr".into()),
                                    computed: false,
                                    optional: false,
                                })),
                                arguments: if is_boolean_attribute(&name) {
                                    vec![
                                        JsExpr::Literal(JsLiteral::String(name.clone().into())),
                                        expression,
                                        JsExpr::Literal(JsLiteral::Boolean(true)),
                                    ]
                                } else {
                                    vec![
                                        JsExpr::Literal(JsLiteral::String(name.clone().into())),
                                        expression,
                                    ]
                                },
                                optional: false,
                            },
                        )));
                    }
                    // In spread path, the binding expression will be handled by
                    // the spread object building code
                }
            }
            Attribute::SpreadAttribute(spread) => {
                has_spread = true;
                attributes.push(AttributeOrSpread::Spread(spread));
                if is_load_error_element(node.get_name()) {
                    events_to_capture.insert("onload".to_string());
                    events_to_capture.insert("onerror".to_string());
                }
            }
            Attribute::ClassDirective(class_dir) => {
                class_directives.push(class_dir);
            }
            Attribute::StyleDirective(style_dir) => {
                style_directives.push(style_dir);
            }
            Attribute::UseDirective(_) => {
                if is_load_error_element(node.get_name()) {
                    events_to_capture.insert("onload".to_string());
                    events_to_capture.insert("onerror".to_string());
                }
            }
            _ => {}
        }
    }

    if has_spread {
        // Use spread attributes path
        build_element_spread_attributes(
            node,
            &attributes,
            &style_directives,
            &class_directives,
            state,
            transform.clone(),
        );
    } else {
        // Simple attributes path - more efficient
        let css_hash = if node.is_scoped() {
            Some(state.analysis.css.hash.as_str())
        } else {
            None
        };

        for attr_or_spread in attributes {
            // In non-spread path, we should only have regular attributes
            let attr = match attr_or_spread {
                AttributeOrSpread::Attribute(a) => a,
                AttributeOrSpread::Spread(_) => continue, // Should not happen in this path
            };
            let name = get_attribute_name(node, &attr.name);
            let can_use_literal = (name != "class" || class_directives.is_empty())
                && (name != "style" || style_directives.is_empty());

            if can_use_literal
                && (matches!(attr.value, AttributeValue::True(_)) || is_text_attribute(&attr.value))
            {
                // Static attribute - can be inlined
                let mut literal_value = if let JsExpr::Literal(lit) = build_attribute_value(
                    &attr.value,
                    transform.clone(),
                    WHITESPACE_INSENSITIVE_ATTRIBUTES.contains(&name.as_str()),
                    false,
                ) {
                    match lit {
                        JsLiteral::String(s) => s,
                        JsLiteral::Boolean(b) => b.to_string().into(),
                        JsLiteral::Number(n) => n.to_string().into(),
                        _ => compact_str::CompactString::default(),
                    }
                } else {
                    compact_str::CompactString::default()
                };

                // Add CSS hash to class
                if name == "class"
                    && let Some(hash) = css_hash
                {
                    literal_value = format!("{} {}", literal_value, hash)
                        .trim()
                        .to_string()
                        .into();
                }

                if name != "class" || !literal_value.is_empty() {
                    let attr_str = if is_boolean_attribute(&name) && literal_value == "true" {
                        format!(" {}", attr.name)
                    } else if literal_value == "true" {
                        format!(" {}=\"\"", attr.name)
                    } else {
                        format!(" {}=\"{}\"", attr.name, literal_value)
                    };

                    state
                        .template
                        .push(TemplateItem::Expression(JsExpr::Literal(
                            JsLiteral::String(attr_str.clone().into()),
                        )));
                }

                continue;
            }

            let value = build_attribute_value(
                &attr.value,
                transform.clone(),
                WHITESPACE_INSENSITIVE_ATTRIBUTES.contains(&name.as_str()),
                false,
            );

            // Pre-escape and inline literal attributes
            if can_use_literal && let JsExpr::Literal(lit) = &value {
                let lit_value = match lit {
                    JsLiteral::String(s) => s.clone(),
                    JsLiteral::Boolean(b) => b.to_string().into(),
                    JsLiteral::Number(n) => n.to_string().into(),
                    _ => compact_str::CompactString::default(),
                };
                let mut escaped = escape_attr(&lit_value);
                if name == "class"
                    && let Some(hash) = css_hash
                {
                    escaped = format!("{} {}", escaped, hash).trim().to_string();
                }
                let attr_str = format!(" {}=\"{}\"", name, escaped);
                state
                    .template
                    .push(TemplateItem::Expression(JsExpr::Literal(
                        JsLiteral::String(attr_str.clone().into()),
                    )));
                continue;
            }

            if name == "class" {
                // Wrap in $.clsx() if needed (for dynamic class expressions)
                let class_value = if needs_clsx(&attr.value) {
                    JsExpr::Call(JsCallExpression {
                        callee: Box::new(JsExpr::Member(JsMemberExpression {
                            object: Box::new(JsExpr::Identifier("$".into())),
                            property: JsMemberProperty::Identifier("clsx".into()),
                            computed: false,
                            optional: false,
                        })),
                        arguments: vec![value],
                        optional: false,
                    })
                } else {
                    value
                };
                state
                    .template
                    .push(TemplateItem::Expression(build_attr_class(
                        &class_directives,
                        class_value,
                        css_hash,
                        transform.clone(),
                    )));
            } else if name == "style" {
                state
                    .template
                    .push(TemplateItem::Expression(build_attr_style(
                        &style_directives,
                        value,
                        transform.clone(),
                    )));
            } else {
                state
                    .template
                    .push(TemplateItem::Expression(JsExpr::Call(JsCallExpression {
                        callee: Box::new(JsExpr::Member(JsMemberExpression {
                            object: Box::new(JsExpr::Identifier("$".into())),
                            property: JsMemberProperty::Identifier("attr".into()),
                            computed: false,
                            optional: false,
                        })),
                        arguments: if is_boolean_attribute(&name) {
                            vec![
                                JsExpr::Literal(JsLiteral::String(name.clone().into())),
                                value,
                                JsExpr::Literal(JsLiteral::Boolean(true)),
                            ]
                        } else {
                            vec![
                                JsExpr::Literal(JsLiteral::String(name.clone().into())),
                                value,
                            ]
                        },
                        optional: false,
                    })));
            }
        }
    }

    // Add captured event handlers
    for event in events_to_capture {
        let attr_str = format!(" {}=\"this.__e=event\"", event);
        state
            .template
            .push(TemplateItem::Expression(JsExpr::Literal(
                JsLiteral::String(attr_str.clone().into()),
            )));
    }

    content
}

/// Builds element spread attributes using $.attributes().
///
/// This path is taken when the element has spread attributes, which require
/// runtime merging of attributes.
fn build_element_spread_attributes<F>(
    element: &dyn ElementNode,
    attributes: &[AttributeOrSpread],
    style_directives: &[&StyleDirective],
    class_directives: &[&ClassDirective],
    state: &mut ComponentServerTransformState,
    transform: F,
) where
    F: Fn(JsExpr) -> JsExpr + Clone,
{
    let args = prepare_element_spread(
        element,
        attributes,
        style_directives,
        class_directives,
        state,
        transform,
    );

    let call = JsExpr::Call(JsCallExpression {
        callee: Box::new(JsExpr::Member(JsMemberExpression {
            object: Box::new(JsExpr::Identifier("$".into())),
            property: JsMemberProperty::Identifier("attributes".into()),
            computed: false,
            optional: false,
        })),
        arguments: args,
        optional: false,
    });

    state.template.push(TemplateItem::Expression(call));
}

/// Prepares arguments for $.attributes() call.
///
/// Returns: [object, css_hash, classes, styles, flags]
fn prepare_element_spread<F>(
    element: &dyn ElementNode,
    attributes: &[AttributeOrSpread],
    style_directives: &[&StyleDirective],
    class_directives: &[&ClassDirective],
    state: &ComponentServerTransformState,
    transform: F,
) -> Vec<JsExpr>
where
    F: Fn(JsExpr) -> JsExpr + Clone,
{
    let mut flags = 0;

    // Calculate flags
    if element.is_svg() || element.is_mathml() {
        flags |= ELEMENT_IS_NAMESPACED | ELEMENT_PRESERVE_ATTRIBUTE_CASE;
    } else if is_custom_element_node(element.get_name()) {
        flags |= ELEMENT_PRESERVE_ATTRIBUTE_CASE;
    } else if element.get_name() == "input" {
        flags |= ELEMENT_IS_INPUT;
    }

    // Build attribute object with spread support
    let mut properties: Vec<JsObjectMember> = Vec::new();
    for attr_or_spread in attributes {
        match attr_or_spread {
            AttributeOrSpread::Attribute(attr) => {
                let name = get_attribute_name(element, &attr.name);
                let value = build_attribute_value(
                    &attr.value,
                    transform.clone(),
                    WHITESPACE_INSENSITIVE_ATTRIBUTES.contains(&name.as_str()),
                    false,
                );

                properties.push(JsObjectMember::Property(JsProperty {
                    key: make_property_key(name),
                    value: Box::new(value),
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                    method: false,
                }));
            }
            AttributeOrSpread::Spread(spread) => {
                // Convert the spread expression to JsExpr and add as spread element
                let spread_expr = convert_expression_simple(&spread.expression);
                let transformed_expr = transform(spread_expr);
                properties.push(JsObjectMember::SpreadElement(Box::new(transformed_expr)));
            }
        }
    }

    let object = JsExpr::Object(JsObjectExpression { properties });

    let mut args = vec![object];

    // CSS hash
    let css_hash = if element.is_scoped() {
        Some(JsExpr::Literal(JsLiteral::String(
            state.analysis.css.hash.clone().into(),
        )))
    } else {
        None
    };
    args.push(css_hash.unwrap_or_else(|| JsExpr::Identifier("undefined".into())));

    // Classes
    let classes = if !class_directives.is_empty() {
        let properties = class_directives
            .iter()
            .map(|dir| {
                JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Identifier(dir.name.clone()),
                    value: Box::new(JsExpr::Identifier(dir.name.clone())), // TODO: Visit expression
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                    method: false,
                })
            })
            .collect();
        Some(JsExpr::Object(JsObjectExpression { properties }))
    } else {
        None
    };
    args.push(classes.unwrap_or_else(|| JsExpr::Identifier("undefined".into())));

    // Styles
    let styles = if !style_directives.is_empty() {
        let properties = style_directives
            .iter()
            .map(|dir| {
                let value = if matches!(dir.value, AttributeValue::True(_)) {
                    JsExpr::Identifier(dir.name.clone())
                } else {
                    build_attribute_value(&dir.value, transform.clone(), true, false)
                };

                JsObjectMember::Property(JsProperty {
                    key: make_property_key(dir.name.to_string()),
                    value: Box::new(value),
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                    method: false,
                })
            })
            .collect();
        Some(JsExpr::Object(JsObjectExpression { properties }))
    } else {
        None
    };
    args.push(styles.unwrap_or_else(|| JsExpr::Identifier("undefined".into())));

    // Flags
    if flags != 0 {
        args.push(JsExpr::Literal(JsLiteral::Number(flags as f64)));
    }

    args
}

/// Builds a class attribute with directives.
fn build_attr_class<F>(
    class_directives: &[&ClassDirective],
    expression: JsExpr,
    css_hash: Option<&str>,
    _transform: F,
) -> JsExpr
where
    F: Fn(JsExpr) -> JsExpr + Clone,
{
    let directives = if !class_directives.is_empty() {
        let properties = class_directives
            .iter()
            .map(|dir| {
                JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Literal(JsLiteral::String(dir.name.clone())),
                    value: Box::new(JsExpr::Identifier(dir.name.clone())), // TODO: Visit expression
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                    method: false,
                })
            })
            .collect();
        Some(JsExpr::Object(JsObjectExpression { properties }))
    } else {
        None
    };

    let css_hash_expr = css_hash.map(|hash| JsExpr::Literal(JsLiteral::String(hash.into())));

    JsExpr::Call(JsCallExpression {
        callee: Box::new(JsExpr::Member(JsMemberExpression {
            object: Box::new(JsExpr::Identifier("$".into())),
            property: JsMemberProperty::Identifier("attr_class".into()),
            computed: false,
            optional: false,
        })),
        arguments: vec![
            expression,
            css_hash_expr.unwrap_or_else(|| JsExpr::Identifier("undefined".into())),
            directives.unwrap_or_else(|| JsExpr::Identifier("undefined".into())),
        ],
        optional: false,
    })
}

/// Builds a style attribute with directives.
fn build_attr_style<F>(
    style_directives: &[&StyleDirective],
    expression: JsExpr,
    transform: F,
) -> JsExpr
where
    F: Fn(JsExpr) -> JsExpr + Clone,
{
    let directives = if !style_directives.is_empty() {
        // Separate normal and important properties
        let mut normal_properties = Vec::new();
        let mut important_properties = Vec::new();

        for dir in style_directives {
            let value = if matches!(dir.value, AttributeValue::True(_)) {
                JsExpr::Identifier(dir.name.clone())
            } else {
                build_attribute_value(&dir.value, transform.clone(), true, false)
            };

            let mut name = dir.name.to_string();
            // Lowercase unless it's a custom property (--var)
            if !name.starts_with("--") {
                name = name.to_lowercase();
            }

            let property = JsObjectMember::Property(JsProperty {
                key: make_property_key(name),
                value: Box::new(value),
                kind: JsPropertyKind::Init,
                computed: false,
                shorthand: false,
                method: false,
            });

            if dir.modifiers.iter().any(|m| m.as_str() == "important") {
                important_properties.push(property);
            } else {
                normal_properties.push(property);
            }
        }

        if !important_properties.is_empty() {
            Some(JsExpr::Array(JsArrayExpression {
                elements: vec![
                    Some(JsExpr::Object(JsObjectExpression {
                        properties: normal_properties,
                    })),
                    Some(JsExpr::Object(JsObjectExpression {
                        properties: important_properties,
                    })),
                ],
            }))
        } else {
            Some(JsExpr::Object(JsObjectExpression {
                properties: normal_properties,
            }))
        }
    } else {
        None
    };

    JsExpr::Call(JsCallExpression {
        callee: Box::new(JsExpr::Member(JsMemberExpression {
            object: Box::new(JsExpr::Identifier("$".into())),
            property: JsMemberProperty::Identifier("attr_style".into()),
            computed: false,
            optional: false,
        })),
        arguments: vec![
            expression,
            directives.unwrap_or_else(|| JsExpr::Identifier("undefined".into())),
        ],
        optional: false,
    })
}

// =============================================================================
// Helper functions
// =============================================================================

/// Check if a string is a valid JavaScript identifier.
fn is_valid_js_identifier(s: &str) -> bool {
    if s.is_empty() {
        return false;
    }
    let mut chars = s.chars();
    // First character must be a letter, underscore, or dollar sign
    let first = chars.next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }
    // Rest can also include digits
    chars.all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Creates a JsPropertyKey, using Literal for invalid identifiers (e.g., kebab-case).
fn make_property_key(name: String) -> JsPropertyKey {
    if is_valid_js_identifier(&name) {
        JsPropertyKey::Identifier(name.into())
    } else {
        JsPropertyKey::Literal(JsLiteral::String(name.into()))
    }
}

/// Gets the normalized attribute name for an element.
fn get_attribute_name(element: &dyn ElementNode, name: &str) -> String {
    if !element.is_svg() && !element.is_mathml() {
        name.to_lowercase()
    } else {
        name.to_string()
    }
}

/// Checks if an attribute is an event attribute.
fn is_event_attribute(name: &str) -> bool {
    name.starts_with("on")
}

/// Checks if an element supports load/error events.
fn is_load_error_element(name: &str) -> bool {
    matches!(
        name,
        "body" | "embed" | "iframe" | "img" | "link" | "object" | "script" | "style" | "track"
    )
}

/// Checks if an attribute value is text-only (single Text node).
fn is_text_attribute(value: &AttributeValue) -> bool {
    use crate::ast::template::AttributeValuePart;

    // An attribute is text-only if:
    // 1. It's True (boolean attribute)
    // 2. It's a Sequence with exactly one Text element
    match value {
        AttributeValue::True(_) => true,
        AttributeValue::Sequence(parts) => {
            parts.len() == 1 && matches!(&parts[0], AttributeValuePart::Text(_))
        }
        _ => false,
    }
}

// =============================================================================
// Element node trait
// =============================================================================

/// Trait for element-like nodes.
pub trait ElementNode {
    fn get_name(&self) -> &str;
    fn get_attributes(&self) -> &[Attribute];
    fn is_scoped(&self) -> bool;
    fn is_svg(&self) -> bool;
    fn is_mathml(&self) -> bool;
}

impl ElementNode for RegularElement {
    fn get_name(&self) -> &str {
        &self.name
    }

    fn get_attributes(&self) -> &[Attribute] {
        &self.attributes
    }

    fn is_scoped(&self) -> bool {
        self.metadata.scoped
    }

    fn is_svg(&self) -> bool {
        // TODO: Check metadata.svg
        false
    }

    fn is_mathml(&self) -> bool {
        // TODO: Check metadata.mathml
        false
    }
}

impl ElementNode for SvelteDynamicElement {
    fn get_name(&self) -> &str {
        "svelte:element"
    }

    fn get_attributes(&self) -> &[Attribute] {
        &self.attributes
    }

    fn is_scoped(&self) -> bool {
        // TODO: Check metadata.scoped
        false
    }

    fn is_svg(&self) -> bool {
        // TODO: Check metadata.svg
        false
    }

    fn is_mathml(&self) -> bool {
        // TODO: Check metadata.mathml
        false
    }
}
