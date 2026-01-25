//! HtmlTag visitor - handles {@html} directives.
//!
//! Corresponds to HtmlTag.js in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/HtmlTag.js`.

use crate::ast::template::HtmlTag;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Transform an @html directive.
///
/// The {@html} directive renders raw HTML content. It:
/// 1. Pushes a comment anchor to the template (`<!>`)
/// 2. Generates `$.html(node, () => expression)` call
pub fn html_tag(node: &HtmlTag, context: &mut ComponentContext) -> JsStatement {
    // Push comment anchor to template
    context.state.template.push_comment(None);

    // Build the expression for the content
    let expression = convert_expression(&node.expression, context);

    // Check namespace for SVG/MathML
    let is_svg = context.state.metadata.namespace == "svg";
    let is_mathml = context.state.metadata.namespace == "mathml";

    // Build arguments: $.html(node, () => expression, is_svg?, is_mathml?)
    let mut args = vec![
        context.state.node.clone(),
        b::arrow(vec![], expression), // b.thunk equivalent
    ];

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
