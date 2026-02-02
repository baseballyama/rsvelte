//! Attribute visitor for client-side transformation.
//!
//! Corresponds to `Attribute.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Attribute.js`.

use crate::ast::template::{Attribute, AttributeNode};
use crate::compiler::phases::phase3_transform::client::types::ComponentContext;
use crate::compiler::utils::can_delegate_event;

/// Visit an Attribute node and generate client-side code.
///
/// This visitor handles regular attributes and event attributes (on:*).
/// For event attributes, it delegates to `visit_event_attribute`.
///
/// # Arguments
///
/// * `node` - The attribute node to visit
/// * `context` - The component transformation context
///
/// # Corresponds to
///
/// `Attribute` function in `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Attribute.js`:
///
/// ```javascript
/// export function Attribute(node, context) {
///     if (is_event_attribute(node)) {
///         visit_event_attribute(node, context);
///     }
/// }
/// ```
pub fn visit_attribute(node: &Attribute, context: &mut ComponentContext) {
    // Check if this is an event attribute (on:*)
    if let Some(attr_node) = is_event_attribute(node) {
        visit_event_attribute(attr_node, context);
    }
}

/// Check if an attribute is an event attribute.
///
/// An event attribute:
/// 1. Must be an `AttributeNode` (not a directive or spread)
/// 2. Must have a name starting with "on"
/// 3. Must contain a single expression value
///
/// Corresponds to `is_event_attribute` in
/// `svelte/packages/svelte/src/compiler/utils/ast.js`:
///
/// ```javascript
/// export function is_event_attribute(attribute) {
///     return is_expression_attribute(attribute) && attribute.name.startsWith('on');
/// }
/// ```
pub fn is_event_attribute(attribute: &Attribute) -> Option<&AttributeNode> {
    match attribute {
        Attribute::Attribute(attr_node) => {
            // Check if name starts with "on"
            if !attr_node.name.starts_with("on") {
                return None;
            }

            // Check if value is an expression
            if is_expression_attribute_value(&attr_node.value) {
                Some(attr_node)
            } else {
                None
            }
        }
        _ => None,
    }
}

/// Check if an attribute value is an expression.
///
/// An expression attribute contains:
/// - A single ExpressionTag (not wrapped in array), OR
/// - A single-element array containing an ExpressionTag
///
/// Corresponds to `is_expression_attribute` in
/// `svelte/packages/svelte/src/compiler/utils/ast.js`:
///
/// ```javascript
/// export function is_expression_attribute(attribute) {
///     return (
///         (attribute.value !== true && !Array.isArray(attribute.value)) ||
///         (Array.isArray(attribute.value) &&
///             attribute.value.length === 1 &&
///             attribute.value[0].type === 'ExpressionTag')
///     );
/// }
/// ```
fn is_expression_attribute_value(value: &crate::ast::template::AttributeValue) -> bool {
    use crate::ast::template::{AttributeValue, AttributeValuePart};

    match value {
        // Boolean value (true) is not an expression
        AttributeValue::True(_) => false,

        // Direct expression (not in array)
        AttributeValue::Expression(_) => true,

        // Sequence (array) - check if it's a single ExpressionTag
        AttributeValue::Sequence(parts) => {
            parts.len() == 1 && matches!(parts[0], AttributeValuePart::ExpressionTag(_))
        }
    }
}

/// Visit an event attribute and generate event listener code.
///
/// Generates code to attach event listeners to elements.
/// Handles:
/// - Event name extraction and normalization
/// - Capture event detection (e.g., oncapture)
/// - Event handler building
/// - Delegated vs. non-delegated events
///
/// # Arguments
///
/// * `node` - The attribute node (must start with "on")
/// * `context` - The component transformation context
///
/// # Corresponds to
///
/// `visit_event_attribute` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/events.js`:
///
/// ```javascript
/// export function visit_event_attribute(node, context) {
///     let capture = false;
///     let event_name = node.name.slice(2);
///     if (is_capture_event(event_name)) {
///         event_name = event_name.slice(0, -7);
///         capture = true;
///     }
///
///     const tag = Array.isArray(node.value)
///         ? node.value[0]
///         : node.value;
///
///     let handler = build_event_handler(tag.expression, tag.metadata.expression, context);
///
///     if (node.metadata.delegated) {
///         if (!context.state.events.has(event_name)) {
///             context.state.events.add(event_name);
///         }
///         context.state.init.push(
///             b.stmt(b.assignment('=', b.member(context.state.node, b.id('__' + event_name, node.name_loc)), handler))
///         );
///     } else {
///         const statement = b.stmt(
///             build_event(event_name, context.state.node, handler, capture, is_passive_event(event_name) ? true : undefined)
///         );
///         const type = context.path.at(-1).type;
///         if (type === 'SvelteDocument' || type === 'SvelteWindow' || type === 'SvelteBody') {
///             context.state.init.push(statement);
///         } else {
///             context.state.after_update.push(statement);
///         }
///     }
/// }
/// ```
pub fn visit_event_attribute(node: &AttributeNode, context: &mut ComponentContext) {
    use crate::compiler::phases::phase3_transform::js_ast::builders as b;

    // Extract event name (remove "on" prefix)
    let mut event_name = &node.name[2..];
    let mut capture = false;

    // Check if this is a capture event (e.g., "oncapture" -> "on" + event + "capture")
    if is_capture_event(event_name) {
        // Remove "capture" suffix
        event_name = &event_name[..event_name.len() - 7];
        capture = true;
    }

    // Extract the expression tag from the attribute value
    let expr_tag = extract_expression_tag(&node.value);

    // Build the event handler
    let handler = build_event_handler(expr_tag, context);

    // Determine if this event should be delegated.
    //
    // Event delegation is used when:
    // 1. The event is delegatable (click, input, etc. - see can_delegate_event())
    // 2. The element containing this attribute is a RegularElement (not SvelteElement or special elements)
    // 3. The event is not in capture mode
    //
    // Since visit_event_attribute is only called from visit_regular_element when
    // processing a RegularElement's attributes, the element is always a RegularElement.
    // So we just need to check if the event type is delegatable and not captured.
    //
    // Note: SvelteElement would need separate handling if we add that visitor.
    let delegated = !capture && can_delegate_event(event_name);

    if delegated {
        // Delegated event: assign handler to element property
        if !context.state.events.contains(event_name) {
            context.state.events.insert(event_name.to_string());
        }

        let handler_property_name = format!("__{}", event_name);
        let assignment = b::assign(
            b::member(context.state.node.clone(), &handler_property_name),
            handler,
        );

        context.state.init.push(b::stmt(assignment));
    } else {
        // Non-delegated event: use $.event()
        let passive = is_passive_event(event_name);

        let event_call = build_event(event_name, &context.state.node, handler, capture, passive);
        let statement = b::stmt(event_call);

        // Check if the parent is a special element (svelte:window, svelte:document, svelte:body)
        let is_special_element = context.current_parent().is_some_and(|parent| {
            use crate::ast::template::TemplateNode;
            matches!(
                parent,
                TemplateNode::SvelteWindow(_)
                    | TemplateNode::SvelteDocument(_)
                    | TemplateNode::SvelteBody(_)
            )
        });

        if is_special_element {
            // Special elements: run parent-first (init)
            context.state.init.push(statement);
        } else {
            // Regular elements: run after update
            context.state.after_update.push(statement);
        }
    }
}

/// Extract the expression tag from an attribute value.
///
/// Handles both direct ExpressionTag and single-element Sequence cases.
pub fn extract_expression_tag(
    value: &crate::ast::template::AttributeValue,
) -> &crate::ast::template::ExpressionTag {
    use crate::ast::template::{AttributeValue, AttributeValuePart};

    match value {
        AttributeValue::Expression(tag) => tag,
        AttributeValue::Sequence(parts) if parts.len() == 1 => {
            if let AttributeValuePart::ExpressionTag(tag) = &parts[0] {
                tag
            } else {
                panic!("Expected ExpressionTag in single-element sequence");
            }
        }
        _ => panic!("Expected expression attribute value"),
    }
}

/// Build an event handler function.
///
/// Handles:
/// - Null handler (bubble event to parent)
/// - Arrow function / function expression (use as-is)
/// - Identifier (check if it's a function binding)
/// - Complex expression (wrap in function)
///
/// # Corresponds to
///
/// `build_event_handler` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/events.js`.
pub fn build_event_handler(
    expr_tag: &crate::ast::template::ExpressionTag,
    context: &mut ComponentContext,
) -> crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr {
    use crate::compiler::phases::phase3_transform::js_ast::builders as b;
    use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;

    // Convert the expression to a JS expression using the expression converter
    use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
    let js_expr = convert_expression(&expr_tag.expression, context);

    // Apply state transforms (e.g., count++ -> $.update(count))
    use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression;
    let js_expr = apply_transforms_to_expression(&js_expr, context);

    // Check if it's already a function
    if matches!(js_expr, JsExpr::Arrow(_) | JsExpr::Function(_)) {
        return js_expr;
    }

    // Check if it's an identifier
    if let JsExpr::Identifier(name) = &js_expr {
        // Check if this identifier refers to a function in the scope
        if let Some(binding) = context.state.get_binding(name) {
            use crate::compiler::phases::phase2_analyze::scope::BindingKind;

            // If it's a function binding, use it as-is
            if matches!(binding.kind, BindingKind::Normal) {
                // TODO: Check if binding.is_function() - for now, assume it is
                return js_expr;
            }

            // If not in dev mode and it's a local variable (not import), use as-is
            use crate::compiler::phases::phase2_analyze::scope::DeclarationKind;
            if !context.state.dev && binding.declaration_kind != DeclarationKind::Import {
                return js_expr;
            }
        }
    }

    // Check if the expression contains a call
    // TODO: This should check metadata.has_call from the expression tag
    // For now, we'll do a simple check
    let has_call = expression_has_call(&expr_tag.expression);

    if has_call {
        // Memoize the handler to avoid re-evaluating on each event
        let handler_name = context.state.memoizer.generate_id("event_handler");

        // Create $.derived(() => handler)
        let thunk = b::arrow(vec![], js_expr.clone());
        let derived_call = b::call(b::member_path("$.derived"), vec![thunk]);

        context
            .state
            .init
            .push(b::var_decl(&handler_name, Some(derived_call)));

        // Use $.get(handler_id) to get the current value
        let get_call = b::call(b::member_path("$.get"), vec![b::id(&handler_name)]);

        // Wrap in a function that applies the handler
        let apply_call = b::call(
            b::member(get_call, "apply"),
            vec![b::this(), b::id("$$args")],
        );

        return b::function_expr(
            None,
            vec![b::rest_pattern(b::id_pattern("$$args"))],
            vec![b::stmt(apply_call)],
        );
    }

    // Wrap in a function that applies the expression
    let apply_call = if context.state.dev {
        // In dev mode, use $.apply() for better error messages
        // TODO: Add source location information
        b::call(
            b::member_path("$.apply"),
            vec![
                b::arrow(vec![], js_expr),
                b::this(),
                b::id("$$args"),
                b::id(&context.state.analysis.name),
                b::array(vec![b::number(0.0), b::number(0.0)]), // TODO: Add real line/column
            ],
        )
    } else {
        b::call(
            b::member(js_expr, "apply"),
            vec![b::this(), b::id("$$args")],
        )
    };

    b::function_expr(
        None,
        vec![b::rest_pattern(b::id_pattern("$$args"))],
        vec![b::stmt(apply_call)],
    )
}

/// Build an event listener call.
///
/// Creates a call to `$.event(event_name, node, handler, capture, passive)`.
///
/// # Corresponds to
///
/// `build_event` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/events.js`.
fn build_event(
    event_name: &str,
    node: &crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr,
    handler: crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr,
    capture: bool,
    passive: Option<bool>,
) -> crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr {
    use crate::compiler::phases::phase3_transform::js_ast::builders as b;

    let mut args = vec![b::string(event_name), node.clone(), handler];

    if capture {
        args.push(b::boolean(true));
    } else if passive.is_some() {
        // If passive is set but capture is not, we need to pass false for capture
        args.push(b::boolean(false));
    }

    if let Some(p) = passive {
        args.push(b::boolean(p));
    }

    b::call(b::member_path("$.event"), args)
}

/// Check if an event name indicates a capture event.
///
/// Capture events end with "capture" but exclude "gotpointercapture" and "lostpointercapture".
///
/// # Corresponds to
///
/// `is_capture_event` in `svelte/packages/svelte/src/utils.js`:
///
/// ```javascript
/// export function is_capture_event(name) {
///     return name.endsWith('capture') && name !== 'gotpointercapture' && name !== 'lostpointercapture';
/// }
/// ```
fn is_capture_event(name: &str) -> bool {
    name.ends_with("capture") && name != "gotpointercapture" && name != "lostpointercapture"
}

/// Check if an event should use passive listeners.
///
/// Passive events are touch events that should not call preventDefault().
///
/// # Corresponds to
///
/// `is_passive_event` in `svelte/packages/svelte/src/utils.js`:
///
/// ```javascript
/// const PASSIVE_EVENTS = ['touchstart', 'touchmove'];
/// export function is_passive_event(name) {
///     return PASSIVE_EVENTS.includes(name);
/// }
/// ```
pub fn is_passive_event(name: &str) -> Option<bool> {
    if matches!(name, "touchstart" | "touchmove") {
        Some(true)
    } else {
        None
    }
}

/// Check if an expression contains a function call.
///
/// This is a simplified check - the full implementation would analyze the AST.
///
/// TODO: Use proper expression metadata from the AST.
fn expression_has_call(expression: &crate::ast::js::Expression) -> bool {
    use crate::ast::js::Expression;

    match expression {
        Expression::Value(val) => {
            if let Some(obj) = val.as_object()
                && let Some(expr_type) = obj.get("type").and_then(|v| v.as_str())
            {
                return expr_type == "CallExpression";
            }
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_capture_event() {
        assert!(is_capture_event("clickcapture"));
        assert!(is_capture_event("mousemovecapture"));
        assert!(!is_capture_event("gotpointercapture"));
        assert!(!is_capture_event("lostpointercapture"));
        assert!(!is_capture_event("click"));
    }

    #[test]
    fn test_is_passive_event() {
        assert_eq!(is_passive_event("touchstart"), Some(true));
        assert_eq!(is_passive_event("touchmove"), Some(true));
        assert_eq!(is_passive_event("click"), None);
        assert_eq!(is_passive_event("scroll"), None);
    }

    #[test]
    fn test_is_expression_attribute_value() {
        use crate::ast::js::Expression;
        use crate::ast::template::{AttributeValue, AttributeValuePart, ExpressionTag};

        // Boolean value is not an expression
        assert!(!is_expression_attribute_value(&AttributeValue::True(true)));

        // Direct expression is an expression
        let expr_tag = ExpressionTag {
            start: 0,
            end: 5,
            expression: Expression::Value(serde_json::Value::Null),
        };
        assert!(is_expression_attribute_value(&AttributeValue::Expression(
            expr_tag.clone()
        )));

        // Single-element sequence with ExpressionTag is an expression
        let sequence =
            AttributeValue::Sequence(vec![AttributeValuePart::ExpressionTag(expr_tag.clone())]);
        assert!(is_expression_attribute_value(&sequence));

        // Multi-element sequence is not considered a simple expression
        use crate::ast::template::Text;
        let multi_sequence = AttributeValue::Sequence(vec![
            AttributeValuePart::Text(Text {
                start: 0,
                end: 3,
                raw: "foo".into(),
                data: "foo".into(),
            }),
            AttributeValuePart::ExpressionTag(expr_tag),
        ]);
        assert!(!is_expression_attribute_value(&multi_sequence));
    }

    #[test]
    fn test_can_delegate_event() {
        // Delegatable events
        assert!(can_delegate_event("click"));
        assert!(can_delegate_event("input"));
        assert!(can_delegate_event("change"));
        assert!(can_delegate_event("keydown"));
        assert!(can_delegate_event("keyup"));
        assert!(can_delegate_event("mousedown"));
        assert!(can_delegate_event("mouseup"));
        assert!(can_delegate_event("mousemove"));
        assert!(can_delegate_event("dblclick"));
        assert!(can_delegate_event("contextmenu"));
        assert!(can_delegate_event("focusin"));
        assert!(can_delegate_event("focusout"));
        assert!(can_delegate_event("pointerdown"));
        assert!(can_delegate_event("pointerup"));
        assert!(can_delegate_event("touchstart"));
        assert!(can_delegate_event("touchmove"));
        assert!(can_delegate_event("touchend"));
        assert!(can_delegate_event("beforeinput"));

        // Non-delegatable events
        assert!(!can_delegate_event("scroll"));
        assert!(!can_delegate_event("focus"));
        assert!(!can_delegate_event("blur"));
        assert!(!can_delegate_event("load"));
        assert!(!can_delegate_event("resize"));
        assert!(!can_delegate_event("submit"));
    }
}
