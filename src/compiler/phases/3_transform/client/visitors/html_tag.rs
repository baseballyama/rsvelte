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
/// In the official Svelte compiler (HtmlTag.js):
///   const expression = build_expression(context, node.expression, node.metadata.expression);
///   b.stmt(b.call('$.html', context.state.node, b.thunk(expression), ...))
pub fn html_tag(node: &HtmlTag, context: &mut ComponentContext) -> JsStatement {
    // Push comment anchor to template
    context.state.template.push_comment(None);

    // Build the expression for the content using convert_expression first
    let expression = convert_expression(&node.expression, context);

    // Use build_expression which applies transforms AND handles legacy
    // reactivity wrapping (deep_read_state/untrack) based on metadata from phase 2.
    // This matches the official compiler's: build_expression(context, node.expression, node.metadata.expression)
    let metadata = ExpressionMetadata::from_template_metadata(&node.metadata.expression);
    let built_expression = build_expression(context, &expression, &metadata);

    // Check namespace for SVG/MathML
    let is_svg = context.state.metadata.namespace == "svg";
    let is_mathml = context.state.metadata.namespace == "mathml";

    // Create thunk and apply unthunk optimization
    // b.thunk creates () => expression, then unthunk optimizes:
    // - () => foo() becomes foo (if foo is a function call with no args matching params)
    // - () => expr stays as () => expr otherwise
    let thunked = b::thunk(built_expression);

    // Build arguments: $.html(node, thunked_expression, is_svg?, is_mathml?)
    let mut args = vec![context.state.node.clone(), thunked];

    if is_svg {
        args.push(b::boolean(true));
    } else if is_mathml {
        // Need to push false for svg first, then true for mathml
        args.push(b::boolean(false));
        args.push(b::boolean(true));
    }

    // Note: Ignoring `is_ignored(node, 'hydration_html_changed')` for now
    // as we don't have that infrastructure yet

    b::stmt(b::call(b::member_path("$.html"), args))
}
