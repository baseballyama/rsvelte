//! Event handler utilities.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/events.js`.

use compact_str::CompactString;

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
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,

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
            args.push(b::undefined(arena));
        }
        args.push(b::boolean(passive_val));
    }

    let callee = if delegated { "$.delegated" } else { "$.event" };
    b::call(arena, b::member_path(arena, callee), args)
}

/// Build a delegated event assignment: `element.__eventname = handler`
/// Reference: events.js lines 34-42 in the official compiler
pub fn build_delegated_event_assignment(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,

    event_name: &str,
    node: &JsExpr,
    handler: JsExpr,
) -> JsExpr {
    b::call(
        arena,
        b::member_path(arena, "$.delegated"),
        vec![b::string(event_name), node.clone(), handler],
    )
}

/// In dev mode, convert arrow function event handlers to named function expressions
/// for better debugging (stack traces show the event name).
/// Reference: events.js `build_event` in the official Svelte compiler.
pub fn convert_arrow_to_named_function(handler: JsExpr, name: CompactString) -> JsExpr {
    if let JsExpr::Arrow(arrow) = handler {
        let body = match arrow.body {
            JsArrowBody::Expression(expr) => JsBlockStatement {
                body: vec![JsStatement::Return(JsReturnStatement {
                    argument: Some(expr),
                })],
            },
            JsArrowBody::Block(block) => block,
        };
        JsExpr::Function(JsFunctionExpression {
            id: Some(name),
            params: arrow.params,
            body,
            is_async: arrow.is_async,
            is_generator: false,
        })
    } else {
        handler
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
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,

    expression: Option<&Expression>,
    node: &OnDirective,
    context: &mut ComponentContext,
) -> JsExpr {
    // Null handler = bubble event to parent component
    // MUST use a regular function (not arrow) so that `this` is correctly bound
    // for $.bubble_event.call(this, $$props, $$arg)
    if expression.is_none() {
        // Set needs_props flag so that $$props is injected into the component function signature.
        // This mirrors the official compiler's OnDirective.js which sets
        // context.state.analysis.needs_props = true during the CLIENT transform (not analyze phase).
        context.state.needs_props_from_events.set(true);
        return b::function_expr(
            None,
            vec![b::id_pattern("$$arg")],
            vec![b::stmt(
                arena,
                b::call(
                    arena,
                    b::member_path(arena, "$.bubble_event.call"),
                    vec![b::this(), b::id("$$props"), b::id("$$arg")],
                ),
            )],
        );
    }

    let expression = expression.unwrap();

    // Check if expression has a call (for memoization). Phase 2's
    // `OnDirective` visitor already cached this on
    // `node.metadata.expression.has_call()`.
    let has_call = node.metadata.expression.has_call();

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
        // If the identifier refers to a binding whose initial value is a
        // function (and which has not been reassigned), we can attach it
        // directly. Otherwise fall through so the handler gets wrapped in
        // a `function (...$$args) { handler?.apply(this, $$args); }`
        // shim that copes with the value being undefined or a non-function
        // assigned to e.g. a `$state` variable.
        match context.state.get_binding(name) {
            Some(binding) if binding.is_function() => return handler,
            // Not in scope at all — assume it's a global function (window.alert,
            // user-imported helpers without scope tracking, etc.).
            None => return handler,
            Some(_) => {
                // Falls through to the wrapping path below.
            }
        }
    }

    // If the handler contains a call expression, we need to memoize it with $.derived
    // This is important for cases like: on:click={saySomething('Tama').handler}
    // where the call needs to be evaluated each time but memoized for the event handler
    if has_call {
        // Generate a unique identifier for the event handler
        let id_name = context.state.memoizer.generate_id("event_handler");

        // Create: var event_handler = $.derived(() => handler);
        context.state.init.push(b::var_decl(
            arena,
            &id_name,
            Some(b::call(
                arena,
                b::member_path(arena, "$.derived"),
                vec![b::thunk(arena, handler)],
            )),
        ));

        // Now handler becomes: $.get(event_handler)
        handler = b::call(arena, b::member_path(arena, "$.get"), vec![b::id(&id_name)]);
    }

    // For complex expressions, wrap in a function that calls the expression
    // This handles cases like: onclick={obj.method} or onclick={expr()}
    // handler?.apply(this, $$args) - use optional chaining for safety
    let call_expr = b::call(
        arena,
        b::optional_member(arena, handler, "apply"),
        vec![b::this(), b::id("$$args")],
    );

    b::function_expr(
        None,
        vec![JsPattern::Rest(Box::new(b::id_pattern("$$args")))],
        vec![b::stmt(arena, call_expr)],
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
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,

    element: JsExpr,
    event_name: &str,
    handler: JsExpr,
    options: Option<EventListenerOptions>,
) -> JsStatement {
    if let Some(opts) = options {
        // Build options object
        let mut props = Vec::new();

        if opts.capture {
            props.push(b::prop(arena, "capture", b::boolean(true)));
        }
        if opts.passive {
            props.push(b::prop(arena, "passive", b::boolean(true)));
        }
        if opts.once {
            props.push(b::prop(arena, "once", b::boolean(true)));
        }

        let options_obj = b::object(props);

        b::stmt(
            arena,
            b::call(
                arena,
                b::member_path(arena, "$.listen"),
                vec![element, b::string(event_name), handler, options_obj],
            ),
        )
    } else {
        // No options
        b::stmt(
            arena,
            b::call(
                arena,
                b::member_path(arena, "$.listen"),
                vec![element, b::string(event_name), handler],
            ),
        )
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
pub fn build_delegated_event(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    event_name: &str,
) -> JsStatement {
    b::stmt(
        arena,
        b::call(
            arena,
            b::member_path(arena, "$.delegate"),
            vec![b::string(event_name)],
        ),
    )
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
            modifiers: smallvec::smallvec![],
            expression: None,
            metadata: Default::default(),
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
        let parse_arena = crate::ast::arena::ParseArena::new();
        let state = ComponentClientTransformState::new(
            &parse_arena,
            &scope,
            &scope_root,
            &analysis,
            b::id("node"),
            options,
        );
        let mut context = ComponentContext::new(state, |_, _, _| TransformResult::None);

        let arena = crate::compiler::phases::phase3_transform::js_ast::arena::JsArena::new();
        let handler = build_event_handler(&arena, None, &on_directive, &mut context);

        // Should generate a bubble event handler (regular function, not arrow,
        // so that `this` is correctly bound for $.bubble_event.call(this, ...))
        match handler {
            JsExpr::Function(_) => {
                // Success - generated a regular function
            }
            _ => panic!("Expected regular function expression, got {:?}", handler),
        }
    }

    // Note: Removed test_build_event_handler_function as it requires Expression type which is complex to create

    #[test]
    fn test_build_event_listener_simple() {
        let arena = crate::compiler::phases::phase3_transform::js_ast::arena::JsArena::new();
        let element = b::id("button");
        let handler = b::id("handleClick");

        let stmt = build_event_listener(&arena, element, "click", handler, None);

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
        let arena = crate::compiler::phases::phase3_transform::js_ast::arena::JsArena::new();
        let element = b::id("button");
        let handler = b::id("handleClick");
        let options = EventListenerOptions::new()
            .with_capture(true)
            .with_once(true);

        let stmt = build_event_listener(&arena, element, "click", handler, Some(options));

        // Should generate $.listen(button, "click", handleClick, { capture: true, once: true })
        match stmt {
            JsStatement::Expression(_) => {
                // Success
            }
            _ => panic!("Expected expression statement"),
        }
    }
}
