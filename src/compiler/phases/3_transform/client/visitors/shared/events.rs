//! Event handler utilities.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/events.js`.

use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Build an event handler function.
///
/// Corresponds to `build_event_handler` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/events.js`.
///
/// # Arguments
///
/// * `node` - The handler expression (None = bubble event to parent)
/// * `metadata` - Expression metadata
/// * `context` - The component context
///
/// # Returns
///
/// Returns a function expression that will be used as the event handler.
pub fn build_event_handler(
    node: Option<&JsExpr>,
    _metadata: &ExpressionMetadata,
    _context: &mut ComponentContext,
) -> JsExpr {
    // Null handler = bubble event to parent component
    if node.is_none() {
        return b::arrow_block(
            vec![b::id_pattern("$$event")],
            vec![b::stmt(b::call(
                b::member(b::member_path("$.bubble_event"), "call"),
                vec![b::this(), b::id("$$props"), b::id("$$event")],
            ))],
        );
    }

    let node = node.unwrap();

    // Check if the handler is already a function (arrow or function expression)
    if matches!(node, JsExpr::Arrow(_) | JsExpr::Function(_)) {
        return node.clone();
    }

    // Check if it's a simple identifier
    if let JsExpr::Identifier(_name) = node {
        // TODO: Check if this identifier refers to a function in the scope
        // For now, assume it's a function and return it as-is
        return node.clone();
    }

    // For complex expressions, wrap in a function that calls the expression
    // This handles cases like: onclick={obj.method} or onclick={expr()}
    let call_expr = b::call(
        b::member(node.clone(), "apply"),
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

    #[test]
    fn test_build_event_handler_null() {
        let metadata = ExpressionMetadata::new();
        let analysis = crate::compiler::phases::phase2_analyze::types::ComponentAnalysis::new(
            "",
            &Default::default(),
        );
        let scope = crate::compiler::phases::phase2_analyze::scope::Scope::new(None);
        let scope_root = crate::compiler::phases::phase2_analyze::scope::ScopeRoot::new();
        let state =
            ComponentClientTransformState::new(&scope, &scope_root, &analysis, b::id("node"));
        let mut context = ComponentContext::new(state, |_, _, _| TransformResult::None);

        let handler = build_event_handler(None, &metadata, &mut context);

        // Should generate a bubble event handler
        match handler {
            JsExpr::Arrow(_) => {
                // Success - generated an arrow function
            }
            _ => panic!("Expected arrow function"),
        }
    }

    #[test]
    fn test_build_event_handler_function() {
        let metadata = ExpressionMetadata::new();
        let analysis = crate::compiler::phases::phase2_analyze::types::ComponentAnalysis::new(
            "",
            &Default::default(),
        );
        let scope = crate::compiler::phases::phase2_analyze::scope::Scope::new(None);
        let scope_root = crate::compiler::phases::phase2_analyze::scope::ScopeRoot::new();
        let state =
            ComponentClientTransformState::new(&scope, &scope_root, &analysis, b::id("node"));
        let mut context = ComponentContext::new(state, |_, _, _| TransformResult::None);

        let arrow = b::arrow(vec![b::id_pattern("e")], b::id("undefined"));
        let handler = build_event_handler(Some(&arrow), &metadata, &mut context);

        // Should return the arrow function as-is
        match handler {
            JsExpr::Arrow(_) => {
                // Success
            }
            _ => panic!("Expected arrow function"),
        }
    }

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
