//! IfBlock visitor for client-side transformation.
//!
//! Corresponds to `IfBlock` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/IfBlock.js`.

use crate::ast::template::{Fragment, IfBlock, TemplateNode};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::fragment::fragment as visit_fragment_impl;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::{
    add_svelte_meta, build_expression,
};
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Visit an if block.
///
/// Generates code to conditionally render the consequent or alternate branches.
/// Uses the `$.if` runtime function to handle reactive conditionals.
///
/// # Arguments
///
/// * `node` - The if block node
/// * `context` - The component transformation context
///
/// # Behavior
///
/// - Creates arrow functions for the consequent and alternate branches
/// - Visits the consequent and alternate fragments using the Fragment visitor
/// - Generates a call to `$.if(anchor, ($$render) => { if (test) $$render(consequent) ... })`
/// - If the condition is async, wraps the entire block in `$.async()`
/// - Handles elseif chains specially for transition behavior
///
/// # Generated Code
///
/// For a simple if block like `{#if condition}content{/if}`, this generates:
///
/// ```javascript
/// {
///     var consequent = ($$anchor) => {
///         // Fragment body for the consequent
///     };
///
///     $.if(node, ($$render) => {
///         if (condition) $$render(consequent);
///     });
/// }
/// ```
pub fn if_block(node: &IfBlock, context: &mut ComponentContext) {
    // Push a comment placeholder into the template
    // This is where the if block content will be dynamically inserted
    context.state.template.push_comment(None);

    // Collect statements to build the if block
    let mut statements = Vec::new();

    // Visit the consequent fragment using the Fragment visitor
    // The Fragment visitor handles template creation and hoisting
    let consequent_block = visit_fragment(&node.consequent, context, false);
    let consequent_id_name = context.state.memoizer.generate_id("consequent");
    let consequent_id = b::id(&consequent_id_name);

    // Create: var consequent = ($$anchor) => { ... }
    statements.push(b::var_decl(
        &consequent_id_name,
        Some(b::arrow_block(
            vec![b::id_pattern("$$anchor")],
            consequent_block.body,
        )),
    ));

    // Handle the alternate branch if present
    let alternate_id = if let Some(ref alternate_fragment) = node.alternate {
        let alternate_block = visit_fragment(alternate_fragment, context, false);
        let alternate_id_name = context.state.memoizer.generate_id("alternate");
        let alt_id = b::id(&alternate_id_name);

        // Create: var alternate = ($$anchor) => { ... }
        statements.push(b::var_decl(
            &alternate_id_name,
            Some(b::arrow_block(
                vec![b::id_pattern("$$anchor")],
                alternate_block.body,
            )),
        ));

        Some(alt_id)
    } else {
        None
    };

    // Check if the expression is async (from Phase 2 analysis metadata)
    let is_async = node.metadata.expression.is_async();

    // Convert the test expression first
    let converted_expr = convert_expression(&node.test, context);

    // Build the expression with proper reactivity handling
    // This corresponds to: const expression = build_expression(context, node.test, node.metadata.expression);
    let expr_metadata = ExpressionMetadata {
        has_call: node.metadata.expression.has_call,
        has_await: node.metadata.expression.has_await,
        has_state: node.metadata.expression.has_state,
        has_member_expression: node.metadata.expression.has_member_expression,
        has_assignment: node.metadata.expression.has_assignment,
        ..Default::default()
    };
    let expression = build_expression(context, &converted_expr, &expr_metadata);

    // If async, wrap in $.get($$condition), otherwise use the expression directly
    let test = if is_async {
        b::call(b::member_path("$.get"), vec![b::id("$$condition")])
    } else {
        expression.clone()
    };

    // Build the args for $.if()
    // Args: [anchor, ($$render) => { if (test) $$render(consequent) else $$render(alternate, false) }]
    let mut args = vec![
        context.state.node.clone(),
        // Create the render callback: ($$render) => { if (test) ... }
        b::arrow_block(
            vec![b::id_pattern("$$render")],
            vec![b::if_stmt(
                test,
                b::stmt(b::call(b::id("$$render"), vec![consequent_id])),
                alternate_id.map(|alt_id| {
                    b::stmt(b::call(b::id("$$render"), vec![alt_id, b::boolean(false)]))
                }),
            )],
        ),
    ];

    // Handle elseif: add true as third argument
    // This affects transition behavior
    // We treat:
    //   {#if x}...{:else}{#if y}...{/if}{/if}
    // differently from:
    //   {#if x}...{:else if y}...{/if}
    // In the first case, the transition will only play when `y` changes,
    // but in the second it should play when `x` or `y` change — both are considered 'local'
    if node.elseif {
        args.push(b::boolean(true));
    }

    // Create the $.if() call
    let if_call = b::call(b::member_path("$.if"), args);

    // Add metadata (for dev mode source location tracking)
    let if_statement = add_svelte_meta(if_call, &TemplateNode::IfBlock(node.clone()), "if", None);
    statements.push(if_statement);

    // If async, wrap in $.async()
    if is_async {
        // Get blockers from metadata (Phase 2 analysis)
        // In the JS implementation: node.metadata.expression.blockers()
        // For now, use empty array as blockers collection is not yet implemented in Phase 2
        let blockers = b::array(vec![]);

        // Create the thunk array
        // In JS: b.array([b.thunk(expression, node.metadata.expression.has_await)])
        let has_await = node.metadata.expression.has_await;
        let expression_array = if has_await {
            // For async expressions with await, mark the thunk as async
            b::array(vec![b::async_thunk(expression.clone())])
        } else {
            b::array(vec![b::thunk(expression.clone())])
        };

        // Extract the anchor parameter name from context.state.node
        // Typically this will be an identifier like "$$anchor"
        let anchor_param = match &context.state.node {
            JsExpr::Identifier(name) => b::id_pattern(name),
            _ => b::id_pattern("$$anchor"), // Fallback
        };

        // Create: $.async(anchor, blockers, [() => expr], (anchor, $$condition) => { ... })
        let async_call = b::call(
            b::member_path("$.async"),
            vec![
                context.state.node.clone(),
                blockers,
                expression_array,
                b::arrow_block(vec![anchor_param, b::id_pattern("$$condition")], statements),
            ],
        );

        context.state.init.push(b::stmt(async_call));
    } else {
        // Not async: just add the block of statements
        context.state.init.push(b::block(statements));
    }
}

/// Visit a fragment and return its block statement.
///
/// This is a helper function that uses the Fragment visitor to process
/// a fragment and returns the generated block statement with template
/// creation, hoisting, and content rendering.
///
/// `is_root_fragment` controls whether `$.next()` can be generated for
/// text-first content. For IfBlock consequent/alternate, this should be `false`
/// because they handle their own templates independently.
fn visit_fragment(
    fragment: &Fragment,
    context: &mut ComponentContext<'_>,
    is_root_fragment: bool,
) -> JsBlockStatement {
    // Use the Fragment visitor which handles:
    // - Template creation (root_x = $.from_html(...))
    // - Hoisting template declarations to context.state.hoisted
    // - Creating fragment instance (var fragment = root_x())
    // - Processing child nodes
    // - Appending to anchor ($.append($$anchor, fragment))
    visit_fragment_impl(fragment, context, is_root_fragment)
}
