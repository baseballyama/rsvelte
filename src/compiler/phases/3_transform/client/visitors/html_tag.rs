//! HtmlTag visitor - handles {@html} directives.
//!
//! Corresponds to HtmlTag.js in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/HtmlTag.js`.

use crate::ast::template::HtmlTag;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_expression;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Transform an @html directive.
///
/// The {@html} directive renders raw HTML content. It:
/// 1. Pushes a comment anchor to the template (`<!>`)
/// 2. Generates `$.html(node, expression)` call where expression is built
///    using `build_expression` which handles:
///    - Transform application (prop reads become calls: foo -> foo())
///    - Legacy reactivity wrapping (deep_read_state/untrack) when needed
///    - Thunk optimization
///
/// When the expression contains `await`, wraps in `$.async()`:
///   $.async(node, blockers, [() => expression], (node, $$html) => {
///       $.html(node, () => $.get($$html));
///   });
///
/// In the official Svelte compiler (HtmlTag.js):
///   const expression = build_expression(context, node.expression, node.metadata.expression);
///   b.stmt(b.call('$.html', context.state.node, b.thunk(expression), ...))
pub fn html_tag(node: &HtmlTag, context: &mut ComponentContext) -> JsStatement {
    // Push comment anchor to template
    context.state.template.push_comment(None);

    let has_await = node.metadata.expression.has_await()
        || super::shared::utils::expression_has_await(&node.expression);

    // Build the expression for the content using convert_expression first
    let expression = convert_expression(&node.expression, context);

    // Use build_expression which applies transforms AND handles legacy
    // reactivity wrapping (deep_read_state/untrack) based on metadata from phase 2.
    // This matches the official compiler's: build_expression(context, node.expression, node.metadata.expression)
    let metadata = ExpressionMetadata::from_template_metadata(&node.metadata.expression);
    let built_expression = build_expression(context, &expression, &metadata);

    // Check blocker_map for blocked identifiers referenced in the built expression
    let blocker_exprs_for_html = context.state.get_blockers_for_expr(&built_expression);
    let has_blockers = !blocker_exprs_for_html.is_empty();

    // When has_await, the html uses $.get($$html) instead of the original expression
    let html_expr = if has_await {
        b::call(b::member_path("$.get"), vec![b::id("$$html")])
    } else {
        built_expression.clone()
    };

    // Check namespace for SVG/MathML
    let is_svg = context.state.metadata.namespace == "svg";
    let is_mathml = context.state.metadata.namespace == "mathml";

    // Create thunk and apply unthunk optimization
    let thunked = b::thunk(html_expr);

    // Build arguments: $.html(node, thunked_expression, is_svg?, is_mathml?)
    let mut html_args = vec![context.state.node.clone(), thunked];

    if is_svg {
        html_args.push(b::boolean(true));
    } else if is_mathml {
        html_args.push(b::boolean(false));
        html_args.push(b::boolean(true));
    }

    let html_statement = b::stmt(b::call(b::member_path("$.html"), html_args));

    // If the expression has await or blockers, wrap in $.async()
    if has_await || has_blockers {
        // $.async(node, blockers, async_values, callback)
        let blockers_expr = if has_blockers {
            b::array(blocker_exprs_for_html)
        } else {
            b::array(vec![])
        };

        let async_values = if has_await {
            // Strip the top-level await from the expression since $.async handles
            // the awaiting internally. The expression becomes a thunk returning the Promise.
            b::array(vec![b::thunk(b::strip_await(built_expression))])
        } else {
            b::undefined()
        };

        // Callback params: (node, $$html) when has_await, (node) when only blockers
        let node_name = match &context.state.node {
            JsExpr::Identifier(name) => name.clone(),
            _ => "node".to_string(),
        };
        let mut callback_params = vec![b::id_pattern(&node_name)];
        if has_await {
            callback_params.push(b::id_pattern("$$html"));
        }

        let callback = b::arrow_block(callback_params, vec![html_statement]);

        b::stmt(b::call(
            b::member_path("$.async"),
            vec![
                context.state.node.clone(),
                blockers_expr,
                async_values,
                callback,
            ],
        ))
    } else {
        html_statement
    }
}
