//! IfBlock visitor for client-side transformation.
//!
//! Corresponds to `IfBlock` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/IfBlock.js`.

use crate::ast::template::{IfBlock, TemplateNode};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
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
/// - Visits the consequent and alternate fragments
/// - Generates a call to `$.if(anchor, () => condition, consequent_fn, alternate_fn)`
/// - If the condition is async, wraps the entire block in `$.async()`
/// - Handles elseif chains specially for transition behavior
///
/// # Implementation
///
/// The JavaScript implementation:
/// ```javascript
/// export function IfBlock(node, context) {
///     context.state.template.push_comment();
///     const statements = [];
///
///     const consequent = /** @type {BlockStatement} */ (context.visit(node.consequent));
///     const consequent_id = b.id(context.state.scope.generate('consequent'));
///
///     statements.push(b.var(consequent_id, b.arrow([b.id('$$anchor')], consequent)));
///
///     let alternate_id;
///
///     if (node.alternate) {
///         const alternate = /** @type {BlockStatement} */ (context.visit(node.alternate));
///         alternate_id = b.id(context.state.scope.generate('alternate'));
///         statements.push(b.var(alternate_id, b.arrow([b.id('$$anchor')], alternate)));
///     }
///
///     const is_async = node.metadata.expression.is_async();
///
///     const expression = build_expression(context, node.test, node.metadata.expression);
///     const test = is_async ? b.call('$.get', b.id('$$condition')) : expression;
///
///     /** @type {Expression[]} */
///     const args = [
///         context.state.node,
///         b.arrow(
///             [b.id('$$render')],
///             b.block([
///                 b.if(
///                     test,
///                     b.stmt(b.call('$$render', consequent_id)),
///                     alternate_id && b.stmt(b.call('$$render', alternate_id, b.literal(false)))
///                 )
///             ])
///         )
///     ];
///
///     if (node.elseif) {
///         // We treat this...
///         //
///         //   {#if x}
///         //     ...
///         //   {:else}
///         //     {#if y}
///         //       <div transition:foo>...</div>
///         //     {/if}
///         //   {/if}
///         //
///         // ...slightly differently to this...
///         //
///         //   {#if x}
///         //     ...
///         //   {:else if y}
///         //     <div transition:foo>...</div>
///         //   {/if}
///         //
///         // ...even though they're logically equivalent. In the first case, the
///         // transition will only play when `y` changes, but in the second it
///         // should play when `x` or `y` change — both are considered 'local'
///         args.push(b.true);
///     }
///
///     statements.push(add_svelte_meta(b.call('$.if', ...args), node, 'if'));
///
///     if (is_async) {
///         context.state.init.push(
///             b.stmt(
///                 b.call(
///                     '$.async',
///                     context.state.node,
///                     node.metadata.expression.blockers(),
///                     b.array([b.thunk(expression, node.metadata.expression.has_await)]),
///                     b.arrow([context.state.node, b.id('$$condition')], b.block(statements))
///                 )
///             )
///         );
///     } else {
///         context.state.init.push(b.block(statements));
///     }
/// }
/// ```
pub fn if_block(node: &IfBlock, context: &mut ComponentContext) {
    // Push a comment placeholder into the template
    context.state.template.push_comment(None);

    // Collect statements to build the if block
    let mut statements = Vec::new();

    // Visit the consequent fragment and wrap it in an arrow function
    let consequent = visit_fragment(&node.consequent, context);
    let consequent_id_name = context.state.memoizer.generate_id("consequent");
    let consequent_id = b::id(&consequent_id_name);

    // Create: var consequent = ($$anchor) => { ... }
    // Note: JS uses b.var, we use var_decl for var declarations
    statements.push(b::var_decl(
        &consequent_id_name,
        Some(b::arrow_block(vec![b::id_pattern("$$anchor")], consequent)),
    ));

    // Handle the alternate branch if present
    let alternate_id = if let Some(ref alternate_fragment) = node.alternate {
        let alternate = visit_fragment(alternate_fragment, context);
        let alternate_id_name = context.state.memoizer.generate_id("alternate");
        let alt_id = b::id(&alternate_id_name);

        // Create: var alternate = ($$anchor) => { ... }
        statements.push(b::var_decl(
            &alternate_id_name,
            Some(b::arrow_block(vec![b::id_pattern("$$anchor")], alternate)),
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

/// Visit a fragment and return its statements.
///
/// This is a helper function that visits a fragment and collects
/// the generated statements.
fn visit_fragment(
    fragment: &crate::ast::template::Fragment,
    context: &mut ComponentContext<'_>,
) -> Vec<JsStatement> {
    // Save the current state
    let saved_init = std::mem::take(&mut context.state.init);
    let saved_update = std::mem::take(&mut context.state.update);

    // Visit each node in the fragment
    for node in &fragment.nodes {
        let _ = context.visit_node(node, None);
    }

    // Collect the generated init statements
    let result = std::mem::replace(&mut context.state.init, saved_init);

    // Restore the update statements
    context.state.update = saved_update;

    result
}
