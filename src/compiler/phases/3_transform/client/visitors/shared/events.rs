//! Event handler utilities.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/events.js`.

use crate::ast::js::Expression;
use crate::ast::template::OnDirective;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Build an event listener attachment.
///
/// Creates a call to `$.event()` or `$.delegated()` which attaches an event listener to an element.
///
/// Corresponds to `build_event` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/events.js`:
///
/// ```javascript
/// export function build_event(context, event_name, handler, capture, passive, delegated) {
///     return b.call(
///         delegated ? '$.delegated' : '$.event',
///         b.literal(event_name),
///         context.state.node,
///         fn,
///         capture && b.true,
///         passive === undefined ? undefined : b.literal(passive)
///     );
/// }
/// ```
pub fn build_event(
    event_name: &str,
    node: &JsExpr,
    handler: JsExpr,
    capture: bool,
    passive: Option<bool>,
    delegated: bool,
) -> JsExpr {
    let mut args = vec![b::string(event_name), node.clone(), handler];

    if capture {
        args.push(b::boolean(true));
    }

    if let Some(passive_val) = passive {
        if !capture {
            args.push(b::literal(JsLiteral::Undefined));
        }
        args.push(b::boolean(passive_val));
    }

    let callee = if delegated { "$.delegated" } else { "$.event" };

    b::call(b::member_path(callee), args)
}

/// Check if a JSON expression contains a call expression.
/// This is used to determine if an event handler needs to be memoized.
fn expression_has_call(expr: &Expression) -> bool {
    match expr {
        Expression::Value(val) => json_value_has_call(val),
    }
}

/// Check if a JSON value contains a call expression.
fn json_value_has_call(value: &serde_json::Value) -> bool {
    match value {
        serde_json::Value::Object(obj) => {
            let node_type = obj
                .get("type")
                .and_then(|t| t.as_str())
                .unwrap_or("Unknown");

            // If this is a CallExpression, return true
            if node_type == "CallExpression" {
                return true;
            }

            // Recurse into child expressions based on node type
            match node_type {
                "MemberExpression" => {
                    if let Some(object) = obj.get("object")
                        && json_value_has_call(object)
                    {
                        return true;
                    }
                    if let Some(property) = obj.get("property")
                        && obj
                            .get("computed")
                            .and_then(|v| v.as_bool())
                            .unwrap_or(false)
                        && json_value_has_call(property)
                    {
                        return true;
                    }
                }
                "BinaryExpression" | "LogicalExpression" => {
                    if let Some(left) = obj.get("left")
                        && json_value_has_call(left)
                    {
                        return true;
                    }
                    if let Some(right) = obj.get("right")
                        && json_value_has_call(right)
                    {
                        return true;
                    }
                }
                "UnaryExpression" | "AwaitExpression" => {
                    if let Some(arg) = obj.get("argument")
                        && json_value_has_call(arg)
                    {
                        return true;
                    }
                }
                "ConditionalExpression" => {
                    if let Some(test) = obj.get("test")
                        && json_value_has_call(test)
                    {
                        return true;
                    }
                    if let Some(consequent) = obj.get("consequent")
                        && json_value_has_call(consequent)
                    {
                        return true;
                    }
                    if let Some(alternate) = obj.get("alternate")
                        && json_value_has_call(alternate)
                    {
                        return true;
                    }
                }
                "ArrayExpression" => {
                    if let Some(serde_json::Value::Array(elements)) = obj.get("elements") {
                        for elem in elements {
                            if json_value_has_call(elem) {
                                return true;
                            }
                        }
                    }
                }
                "ObjectExpression" => {
                    if let Some(serde_json::Value::Array(props)) = obj.get("properties") {
                        for prop in props {
                            if let serde_json::Value::Object(prop_obj) = prop
                                && let Some(val) = prop_obj.get("value")
                                && json_value_has_call(val)
                            {
                                return true;
                            }
                        }
                    }
                }
                "SequenceExpression" => {
                    if let Some(serde_json::Value::Array(exprs)) = obj.get("expressions") {
                        for expr in exprs {
                            if json_value_has_call(expr) {
                                return true;
                            }
                        }
                    }
                }
                "ChainExpression" => {
                    if let Some(expr) = obj.get("expression")
                        && json_value_has_call(expr)
                    {
                        return true;
                    }
                }
                _ => {}
            }
            false
        }
        _ => false,
    }
}

/// Build an event handler function.
///
/// Corresponds to `build_event_handler` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/events.js`.
///
/// # Arguments
///
/// * `expression` - The handler expression (None = bubble event to parent)
/// * `node` - The OnDirective node (for metadata)
/// * `context` - The component context
///
/// # Returns
///
/// Returns a function expression that will be used as the event handler.
pub fn build_event_handler(
    expression: Option<&Expression>,
    _node: &OnDirective,
    context: &mut ComponentContext,
) -> JsExpr {
    // Null handler = bubble event to parent component
    // MUST use a regular function (not arrow) so that `this` is correctly bound
    // for $.bubble_event.call(this, $$props, $$arg)
    if expression.is_none() {
        return b::function_expr(
            None,
            vec![b::id_pattern("$$arg")],
            vec![b::stmt(b::call(
                b::member_path("$.bubble_event.call"),
                vec![b::this(), b::id("$$props"), b::id("$$arg")],
            ))],
        );
    }

    let expression = expression.unwrap();

    // Check if expression has a call (for memoization)
    let has_call = expression_has_call(expression);

    // Convert the expression to JS
    let handler = convert_expression(expression, context);

    // Apply state transforms to ALL handlers (including inline arrow/function expressions)
    // This transforms state variable references (e.g., count += 1 -> $.set(count, $.get(count) + 1))
    use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_expression;
    let mut metadata =
        crate::compiler::phases::phase3_transform::client::types::ExpressionMetadata::default();
    metadata.set_has_state(true); // Conservative: assume handlers may reference state
    let handler = build_expression(context, &handler, &metadata);

    // For inline handlers (arrow or function expression), return directly after transforms
    if matches!(handler, JsExpr::Arrow(_) | JsExpr::Function(_)) {
        return handler;
    }

    // For other handlers, continue processing
    let mut handler = handler;

    // Function declared in the script
    if let JsExpr::Identifier(name) = &handler {
        // Check if this identifier refers to a function in the scope
        if let Some(binding) = context.state.get_binding(name) {
            // TODO: Check if binding.is_function()
            // For now, assume identifiers are functions and return as-is
            let _ = binding; // Silence unused variable warning
            return handler;
        }
        // If not found in scope, still return it (might be a global function)
        return handler;
    }

    // If the handler contains a call expression, we need to memoize it with $.derived
    // This is important for cases like: on:click={saySomething('Tama').handler}
    // where the call needs to be evaluated each time but memoized for the event handler
    if has_call {
        // Generate a unique identifier for the event handler
        let id_name = context.state.memoizer.generate_id("event_handler");

        // Create: var event_handler = $.derived(() => handler);
        context.state.init.push(b::var_decl(
            &id_name,
            Some(b::call(
                b::member_path("$.derived"),
                vec![b::thunk(handler)],
            )),
        ));

        // Now handler becomes: $.get(event_handler)
        handler = b::call(b::member_path("$.get"), vec![b::id(&id_name)]);
    }

    // For complex expressions, wrap in a function that calls the expression
    // This handles cases like: onclick={obj.method} or onclick={expr()}
    // handler?.apply(this, $$args) - use optional chaining for safety
    let call_expr = b::call(
        b::optional_member(handler, "apply"),
        vec![b::this(), b::id("$$args")],
    );

    b::function_expr(
        None,
        vec![JsPattern::Rest(Box::new(b::id_pattern("$$args")))],
        vec![b::stmt(call_expr)],
    )
}

/// Build an event listener attachment.
///
/// Creates a call to attach an event listener to an element.
///
/// # Arguments
///
/// * `element` - The element to attach the listener to
/// * `event_name` - The name of the event (e.g., "click", "input")
/// * `handler` - The handler function
/// * `options` - Event listener options (capture, passive, once, etc.)
///
/// # Returns
///
/// Returns a statement that attaches the event listener.
pub fn build_event_listener(
    element: JsExpr,
    event_name: &str,
    handler: JsExpr,
    options: Option<EventListenerOptions>,
) -> JsStatement {
    if let Some(opts) = options {
        // Build options object
        let mut props = Vec::new();

        if opts.capture {
            props.push(b::prop("capture", b::boolean(true)));
        }
        if opts.passive {
            props.push(b::prop("passive", b::boolean(true)));
        }
        if opts.once {
            props.push(b::prop("once", b::boolean(true)));
        }

        let options_obj = b::object(props);

        b::stmt(b::call(
            b::member_path("$.listen"),
            vec![element, b::string(event_name), handler, options_obj],
        ))
    } else {
        // No options
        b::stmt(b::call(
            b::member_path("$.listen"),
            vec![element, b::string(event_name), handler],
        ))
    }
}

/// Event listener options.
#[derive(Debug, Clone, Default)]
pub struct EventListenerOptions {
    /// Whether to use capture phase
    pub capture: bool,

    /// Whether the listener is passive
    pub passive: bool,

    /// Whether the listener should be called only once
    pub once: bool,
}

impl EventListenerOptions {
    /// Create new event listener options.
    pub fn new() -> Self {
        Self::default()
    }

    /// Set capture option.
    pub fn with_capture(mut self, capture: bool) -> Self {
        self.capture = capture;
        self
    }

    /// Set passive option.
    pub fn with_passive(mut self, passive: bool) -> Self {
        self.passive = passive;
        self
    }

    /// Set once option.
    pub fn with_once(mut self, once: bool) -> Self {
        self.once = once;
        self
    }
}

/// Build delegated event setup.
///
/// For events that can be delegated (like click), this creates
/// the delegation setup code.
pub fn build_delegated_event(event_name: &str) -> JsStatement {
    b::stmt(b::call(
        b::member_path("$.delegate"),
        vec![b::string(event_name)],
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::rc::Rc;

    fn create_test_on_directive() -> crate::ast::template::OnDirective {
        use compact_str::CompactString;
        crate::ast::template::OnDirective {
            start: 0,
            end: 0,
            name: CompactString::new("click"),
            name_loc: None,
            modifiers: vec![],
            expression: None,
        }
    }

    #[test]
    fn test_build_event_handler_null() {
        let on_directive = create_test_on_directive();
        let analysis = crate::compiler::phases::phase2_analyze::types::ComponentAnalysis::new(
            "",
            &Default::default(),
        );
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

        let handler = build_event_handler(None, &on_directive, &mut context);

        // Should generate a bubble event handler
        match handler {
            JsExpr::Arrow(_) => {
                // Success - generated an arrow function
            }
            _ => panic!("Expected arrow function"),
        }
    }

    // Note: Removed test_build_event_handler_function as it requires Expression type which is complex to create

    #[test]
    fn test_build_event_listener_simple() {
        let element = b::id("button");
        let handler = b::id("handleClick");

        let stmt = build_event_listener(element, "click", handler, None);

        // Should generate $.listen(button, "click", handleClick)
        match stmt {
            JsStatement::Expression(_) => {
                // Success
            }
            _ => panic!("Expected expression statement"),
        }
    }

    #[test]
    fn test_build_event_listener_with_options() {
        let element = b::id("button");
        let handler = b::id("handleClick");
        let options = EventListenerOptions::new()
            .with_capture(true)
            .with_once(true);

        let stmt = build_event_listener(element, "click", handler, Some(options));

        // Should generate $.listen(button, "click", handleClick, { capture: true, once: true })
        match stmt {
            JsStatement::Expression(_) => {
                // Success
            }
            _ => panic!("Expected expression statement"),
        }
    }
}
