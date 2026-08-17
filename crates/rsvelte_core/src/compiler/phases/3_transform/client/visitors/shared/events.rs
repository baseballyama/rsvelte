//! Event handler utilities.
//!
//! Corresponds to utilities in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/events.js`.

use compact_str::CompactString;

use crate::ast::arena::ParseArena;
use crate::ast::js::Expression;
use crate::ast::template::OnDirective;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::for_each_js_child;
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

/// True when the handler expression (or any descendant outside a function
/// body) contains a `CallExpression`. Phase 3 memoises any handler that
/// contains a call, regardless of whether the callee is "pure" — see
/// `expression_tag_has_call` in `shared/element.rs` for the same broad
/// semantics applied to `ExpressionTag`.
fn expression_has_any_call(expr: &Expression) -> bool {
    // The typed walk needs the serialize arena to resolve child ids; without one
    // installed there is nothing to walk but the JSON.
    if let Some(node) = expr.try_as_node_ref()
        && let Some(found) = crate::ast::arena::try_with_current_serialize_arena(|arena| {
            typed_walk_for_call(node, arena)
        })
    {
        return found;
    }
    json_walk_for_call(expr.as_json())
}

/// Typed counterpart of `json_walk_for_call`, including its function boundary:
/// a function node answers `false` without its body, params or id being looked
/// at, even when it is the root.
fn typed_walk_for_call(node: &JsNode, arena: &ParseArena) -> bool {
    match node {
        JsNode::CallExpression { .. } => return true,
        JsNode::ArrowFunctionExpression { .. }
        | JsNode::FunctionExpression { .. }
        | JsNode::FunctionDeclaration { .. } => return false,
        _ => {}
    }

    let mut found = false;
    for_each_js_child(node, arena, &mut |child| {
        if !found {
            found = typed_walk_for_call(child, arena);
        }
    });
    found
}

fn json_walk_for_call(val: &serde_json::Value) -> bool {
    match val {
        serde_json::Value::Object(obj) => {
            if let Some(t) = obj.get("type").and_then(|t| t.as_str()) {
                if t == "CallExpression" {
                    return true;
                }
                if matches!(
                    t,
                    "ArrowFunctionExpression" | "FunctionExpression" | "FunctionDeclaration"
                ) {
                    return false;
                }
            }
            obj.values().any(json_walk_for_call)
        }
        serde_json::Value::Array(arr) => arr.iter().any(json_walk_for_call),
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

    // Check if expression has a call (for memoization). Phase 3 uses the
    // broad "any CallExpression in the tree" semantics — see
    // `expression_tag_has_call` in `shared/element.rs` — instead of Phase 2's
    // narrower has_call (which only fires for non-pure calls).
    let _ = node;
    let has_call = expression_has_any_call(expression);

    // Convert the expression to JS
    let handler = convert_expression(expression, context);

    // Apply state transforms to ALL handlers (including inline arrow/function expressions)
    // This transforms state variable references (e.g., count += 1 -> $.set(count, $.get(count) + 1))
    use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_expression;
    let mut metadata =
        crate::compiler::phases::phase3_transform::client::types::ExpressionMetadata::default();
    metadata.set_has_state(true); // Conservative: assume handlers may reference state
    let handler = build_expression(context, &handler, &metadata);

    // Source-map spans wrap source expressions without changing their handler kind.
    let mut unspanned = &handler;
    while let JsExpr::Spanned(inner, _, _) = unspanned {
        unspanned = context.arena.get_expr(*inner);
    }

    // For inline handlers (arrow or function expression), return directly after transforms
    if matches!(unspanned, JsExpr::Arrow(_) | JsExpr::Function(_)) {
        return handler;
    }

    // Function declared in the script
    if let JsExpr::Identifier(name) = unspanned {
        // Mirrors the official compiler in `events.js`:
        //
        //   if (binding?.is_function()) return handler;
        //   if (!dev && binding?.declaration_kind !== 'import') return handler;
        //
        // i.e. attach the handler directly when (a) it's a function
        // declaration / hoisted function, or (b) outside dev, any binding that
        // is not an import — a locally-declared const/let/var whose value will
        // not change between mounts, or a name that is not in scope at all
        // (assume a global like `window.alert`). An import gets wrapped so it
        // copes with hot-reload swapping the binding, and dev wraps everything
        // else too so a throwing handler can still be reported.
        use crate::compiler::phases::phase2_analyze::scope::DeclarationKind;
        // `resolve_shadowing_snippet_binding` (not a plain `get_binding`) so a
        // block-local `{#snippet}` that shadows a same-named outer function
        // correctly resolves to the snippet — see its doc comment for why
        // `get_binding` alone can't be trusted here.
        let binding = super::utils::resolve_shadowing_snippet_binding(name, context);
        if binding.is_some_and(|b| b.is_function()) {
            return handler;
        }
        if !context.state.options.dev
            && binding.is_none_or(|b| b.declaration_kind != DeclarationKind::Import)
        {
            return handler;
        }
    }

    // For other handlers, continue processing.
    let mut handler = handler;

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
    let call_expr = if context.state.dev {
        // Dev routes the call through `$.apply` so a handler that throws can be
        // reported with the component and the source position of the attribute.
        let (line, column) = match expression.start() {
            Some(start) => crate::compiler::phases::phase3_transform::utils::locate_in_source(
                &context.state.analysis.source,
                start as usize,
            ),
            None => (0, 0),
        };
        let side_effects = super::super::attribute::expression_has_side_effects(expression);
        let remove_parens = super::super::attribute::expression_is_removable_call(
            expression,
            context.state.parse_arena,
        );

        let mut apply_args = vec![
            b::thunk(arena, handler),
            b::this(),
            b::id("$$args"),
            b::id(&context.state.analysis.name),
            b::array(vec![b::number(line as f64), b::number(column as f64)]),
        ];
        // The trailing flags are positional, so a set `remove_parens` forces the
        // `has_side_effects` slot to be filled even when it is false.
        if side_effects || remove_parens {
            apply_args.push(if side_effects {
                b::boolean(true)
            } else {
                b::undefined(arena)
            });
        }
        if remove_parens {
            apply_args.push(b::boolean(true));
        }

        b::call(arena, b::member_path(arena, "$.apply"), apply_args)
    } else {
        // handler?.apply(this, $$args) - use optional chaining for safety.
        // Upstream's handler is still its own `ChainExpression`, so the `apply`
        // member lands outside the chain and the printer parenthesises it.
        let handler = b::close_optional_chain(arena, handler);
        b::call(
            arena,
            b::optional_member(arena, handler, "apply"),
            vec![b::this(), b::id("$$args")],
        )
    };

    b::function_expr(
        None,
        vec![JsPattern::Rest(Box::new(b::id_pattern("$$args")))],
        vec![b::stmt(arena, call_expr)],
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::rc::Rc;

    fn create_test_on_directive<'a>() -> crate::ast::template::OnDirective<'a> {
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

    /// `(typed, json)` call-search answers for the handler in `<div onclick={…}>`.
    fn both_walk_for_call(expr_src: &str) -> (bool, bool) {
        let input = format!("<div onclick={{{expr_src}}}></div>");
        let allocator = oxc_allocator::Allocator::default();
        let mut result = crate::parse(&input, &allocator, Default::default()).unwrap();
        // `parse()` may leave attribute expressions deferred; both walks need a
        // resolved `Expression::Typed`.
        assert!(
            crate::compiler::phases::phase1_parse::resolve_lazy::resolve_lazy_expressions(
                &mut result,
                &input,
            )
            .is_none(),
            "`{expr_src}` should parse"
        );

        let expr = result
            .fragment
            .nodes
            .iter()
            .find_map(|node| match node {
                crate::ast::template::TemplateNode::RegularElement(el) => {
                    el.attributes.iter().find_map(|attr| match attr {
                        crate::ast::template::Attribute::Attribute(a) => match &a.value {
                            crate::ast::template::AttributeValue::Expression(tag) => {
                                Some(&tag.expression)
                            }
                            _ => None,
                        },
                        _ => None,
                    })
                }
                _ => None,
            })
            .expect("expression attribute");

        crate::ast::arena::with_serialize_arena(&result.arena, || {
            (
                typed_walk_for_call(expr.as_node_ref(), &result.arena),
                json_walk_for_call(expr.as_json()),
            )
        })
    }

    #[test]
    fn typed_walk_for_call_agrees_with_the_json_walk() {
        // (expression, expected answer) — expectations are spelled out as well
        // as compared, so a walk that never finds anything can't pass by
        // agreeing with an equally broken oracle.
        let cases: &[(&str, bool)] = &[
            ("handler", false),
            ("obj.handler", false),
            ("handler()", true),
            ("obj.handler(1)", true),
            ("a?.b()", true),
            ("new Foo(bar())", true),
            ("new Foo()", false),
            ("[a, b(), c]", true),
            ("({ k: v() })", true),
            ("cond ? a() : b", true),
            ("`x${a()}`", true),
            // Function boundary — the walk stops before the body, even at the root.
            ("() => other()", false),
            ("(function () { other(); })", false),
            // …but a sibling outside the function is still seen.
            ("[() => other(), more()]", true),
            // A call in a nested function's body stays invisible.
            ("[() => other(), plain]", false),
        ];

        for (src, expected) in cases {
            let (typed, json) = both_walk_for_call(src);
            assert_eq!(typed, json, "typed and JSON walks disagree on `{src}`");
            assert_eq!(&typed, expected, "unexpected call search for `{src}`");
        }
    }
}
