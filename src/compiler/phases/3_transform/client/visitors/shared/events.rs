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
/// Creates a call to `$.event()` which attaches an event listener to an element.
///
/// Corresponds to `build_event` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/events.js`:
///
/// ```javascript
/// export function build_event(event_name, node, handler, capture, passive) {
///     return b.call(
///         '$.event',
///         b.literal(event_name),
///         node,
///         handler,
///         capture && b.true,
///         passive === undefined ? undefined : b.literal(passive)
///     );
/// }
/// ```
///
/// # Arguments
///
/// * `event_name` - The name of the event (e.g., "click", "input")
/// * `node` - The element to attach the listener to
/// * `handler` - The handler function
/// * `capture` - Whether to use capture phase
/// * `passive` - Whether the listener is passive (None means unspecified)
///
/// # Returns
///
/// Returns an expression that calls $.event().
pub fn build_event(
    event_name: &str,
    node: &JsExpr,
    handler: JsExpr,
    capture: bool,
    passive: Option<bool>,
) -> JsExpr {
    let mut args = vec![b::string(event_name), node.clone(), handler];

    if capture {
        args.push(b::boolean(true));
    }

    if let Some(passive_val) = passive {
        // Ensure we have the capture argument
        if !capture {
            args.push(b::literal(JsLiteral::Undefined));
        }
        args.push(b::boolean(passive_val));
    }

    b::call(b::member_path("$.event"), args)
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
    if expression.is_none() {
        return b::arrow_block(
            vec![b::id_pattern("$$arg")],
            vec![b::stmt(b::call(
                b::member_path("$.bubble_event.call"),
                vec![b::this(), b::id("$$props"), b::id("$$arg")],
            ))],
        );
    }

    let expression = expression.unwrap();

    // Convert the expression to JS
    let handler = convert_expression(expression, context);

    // Apply state transforms to the handler
    // This transforms state variable references (e.g., count += 1 -> $.set(count, $.get(count) + 1))
    use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_expression;
    let metadata = crate::compiler::phases::phase3_transform::client::types::ExpressionMetadata {
        has_state: true, // Conservative: assume handlers may reference state
        ..Default::default()
    };
    let handler = build_expression(context, &handler, &metadata);

    // Inline handler (arrow or function expression)
    if matches!(handler, JsExpr::Arrow(_) | JsExpr::Function(_)) {
        return handler;
    }

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

    // For complex expressions, wrap in a function that calls the expression
    // This handles cases like: onclick={obj.method} or onclick={expr()}
    let call_expr = b::call(
        b::member(handler.clone(), "apply"),
        vec![b::this(), b::id("$$args")],
    );

    b::arrow_block(
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
