//! HtmlTag visitor - handles {@html} directives.
//!
//! Corresponds to HtmlTag.js in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/HtmlTag.js`.

use crate::ast::template::HtmlTag;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Transform an @html directive.
///
/// The {@html} directive renders raw HTML content. It:
/// 1. Pushes a comment anchor to the template (`<!>`)
/// 2. Generates `$.html(node, expression)` call where expression is:
///    - The raw expression if it's already a getter function (e.g., from $.prop())
///    - Wrapped in a thunk `() => expression` otherwise
///
/// In legacy mode, props like `foo` from `export let foo` are getter functions
/// created by `$.prop()`. When we read them, the transform converts `foo` to `foo()`.
/// The `thunk` optimization then converts `() => foo()` back to just `foo`.
pub fn html_tag(node: &HtmlTag, context: &mut ComponentContext) -> JsStatement {
    // Push comment anchor to template
    context.state.template.push_comment(None);

    // Build the expression for the content
    let expression = convert_expression(&node.expression, context);

    // Apply transforms (e.g., prop reads become calls: foo -> foo())
    let transformed_expression = apply_transforms_to_expression(&expression, context);

    // Check namespace for SVG/MathML
    let is_svg = context.state.metadata.namespace == "svg";
    let is_mathml = context.state.metadata.namespace == "mathml";

    // Create thunk and apply unthunk optimization
    // b.thunk creates () => expression, then unthunk optimizes:
    // - () => foo() becomes foo (if foo is a function call with no args matching params)
    // - () => expr stays as () => expr otherwise
    let thunked = thunk(transformed_expression);

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

/// Create a thunk (lazy evaluation wrapper) and optimize it.
///
/// This corresponds to `b.thunk()` in the official Svelte compiler:
/// - Creates `() => expression`
/// - Applies `unthunk()` to optimize away unnecessary wrappers
///
/// Optimizations:
/// - `() => foo()` becomes `foo` (function call with no args)
/// - Other expressions stay wrapped
fn thunk(expression: JsExpr) -> JsExpr {
    let arrow = b::arrow(vec![], expression);
    unthunk(arrow)
}

/// Optimize away unnecessary arrow function wrappers.
///
/// Corresponds to `unthunk()` in `svelte/packages/svelte/src/compiler/utils/builders.js`:
/// - `() => foo()` (call with no args) → `foo` (the callee directly)
/// - Other patterns stay as-is
fn unthunk(expression: JsExpr) -> JsExpr {
    if let JsExpr::Arrow(ref arrow) = expression {
        // Only optimize non-async arrow functions with no params
        // Check if body is a call expression with no arguments: () => foo() becomes foo
        if !arrow.is_async
            && arrow.params.is_empty()
            && let JsArrowBody::Expression(body_expr) = &arrow.body
            && let JsExpr::Call(call) = &**body_expr
            && call.arguments.is_empty()
            && let JsExpr::Identifier(_) = &*call.callee
        {
            return (*call.callee).clone();
        }
    }
    expression
}
