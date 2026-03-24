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

/// Collect all flattened if/elseif branches from an IfBlock chain.
///
/// This traverses the alternate chain and collects each IfBlock that has
/// `elseif: true` into a flat list. This mirrors the official compiler's
/// `node.metadata.flattened` array.
///
/// Returns a list of IfBlock references starting with `node`, followed by
/// all elseif branches in order. The final else (plain Fragment) is NOT
/// included — it can be found as `result.last().alternate`.
/// Find an elseif IfBlock in a fragment, ignoring whitespace-only text nodes.
///
/// Returns `Some(inner)` only if the fragment contains an IfBlock with `elseif: true`
/// and no other non-whitespace content. This mirrors the official compiler's
/// `alt.nodes.length === 1 && alt.nodes[0].type === 'IfBlock'` check, but is more
/// lenient about surrounding whitespace text nodes (which our parser sometimes emits).
fn get_elseif_block(fragment: &crate::ast::template::Fragment) -> Option<&IfBlock> {
    let mut found: Option<&IfBlock> = None;
    for node in &fragment.nodes {
        match node {
            TemplateNode::Text(text) => {
                // Skip whitespace-only text nodes
                if !text.data.trim().is_empty() {
                    return None;
                }
            }
            TemplateNode::IfBlock(inner) if inner.elseif => {
                if found.is_some() {
                    return None; // Multiple IfBlocks — not a simple elseif chain
                }
                found = Some(inner);
            }
            _ => return None, // Non-whitespace, non-elseif content
        }
    }
    found
}

fn collect_branches(node: &IfBlock) -> Vec<&IfBlock> {
    let mut branches: Vec<&IfBlock> = vec![node];
    let mut current = node;
    while let Some(fragment) = &current.alternate {
        if let Some(inner) = get_elseif_block(fragment) {
            // Don't flatten if this else-if has an await expression.
            // This matches the official compiler's analysis phase (IfBlock.js):
            // if has_await or has_more_blockers_than(parent), don't flatten.
            // When not flattened, the else-if becomes a nested block with its own
            // $.async() wrapper.
            if inner.metadata.expression.has_await() {
                break;
            }
            branches.push(inner);
            current = inner;
        } else {
            break;
        }
    }
    branches
}

/// Visit an if block.
///
/// Generates code to conditionally render the consequent or alternate branches.
/// Uses the `$.if` runtime function to handle reactive conditionals.
///
/// This generates a flat if/else-if/else chain for elseif blocks,
/// and wraps conditions with `has_call` in `$.derived()` to avoid
/// re-running function calls unnecessarily.
///
/// # Generated Code
///
/// For `{#if a}{:else if b}{:else}{/if}`, this generates:
///
/// ```javascript
/// {
///     var consequent = ($$anchor) => { ... };
///     var consequent_1 = ($$anchor) => { ... };
///     var alternate = ($$anchor) => { ... };
///
///     $.if(node, ($$render) => {
///         if (a) $$render(consequent);
///         else if (b) $$render(consequent_1, 1);
///         else $$render(alternate, false);
///     });
/// }
/// ```
pub fn if_block(node: &IfBlock, context: &mut ComponentContext) {
    // Push a comment placeholder into the template
    context.state.template.push_comment(None);

    let mut statements = Vec::new();

    let has_await = node.metadata.expression.has_await();

    // Build the top-level expression to check for blockers
    let converted_top_expr = convert_expression(&node.test, context);
    let top_expr_metadata = ExpressionMetadata::from_template_metadata(&node.metadata.expression);
    let expression = build_expression(context, &converted_top_expr, &top_expr_metadata);

    // Check if the expression has blockers (references variables assigned after await)
    // Check both instance-level blocker_map and const-tag-level const_blocker_map.
    let blocker_exprs = context
        .state
        .get_all_blockers_for_expr(&expression, &context.arena);
    let has_blockers = !blocker_exprs.is_empty();

    // Collect all flattened if/elseif branches
    let branches = collect_branches(node);

    // For each branch, build:
    // - var consequent_n = ($$anchor) => { ... }
    // - (optional) var d = $.derived(() => test)
    // - The (test, render_stmt) pair for the chain
    struct BranchData {
        test: JsExpr,
        render_stmt: JsStatement,
    }
    let mut branch_data: Vec<BranchData> = Vec::new();

    for (index, branch) in branches.iter().enumerate() {
        // Visit the consequent fragment
        let prev_in_control_flow = context.state.in_control_flow_block;
        context.state.in_control_flow_block = true;
        let consequent_block = visit_fragment(&branch.consequent, context, false);
        context.state.in_control_flow_block = prev_in_control_flow;
        let consequent_id_name = context.state.memoizer.generate_id("consequent");
        let consequent_id = b::id(&consequent_id_name);

        // var consequent_n = ($$anchor) => { ... }
        statements.push(b::var_decl(
            &context.arena,
            &consequent_id_name,
            Some(b::arrow_block(
                vec![b::id_pattern("$$anchor")],
                consequent_block.body,
            )),
        ));

        // Build the test expression for this branch
        let test = if branch.metadata.expression.has_await() {
            // Await is resolved by the $.async wrapper — use $$condition
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.get"),
                vec![b::id("$$condition")],
            )
        } else {
            let converted = convert_expression(&branch.test, context);
            let meta = ExpressionMetadata::from_template_metadata(&branch.metadata.expression);
            let expr = build_expression(context, &converted, &meta);

            if branch.metadata.expression.has_call() {
                // Wrap in $.derived() to avoid re-running function calls
                let derived_id_name = context.state.memoizer.generate_id("d");
                let derived_id = b::id(&derived_id_name);
                statements.push(b::var_decl(
                    &context.arena,
                    &derived_id_name,
                    Some(b::call(
                        &context.arena,
                        b::member_path(&context.arena, "$.derived"),
                        vec![b::arrow(&context.arena, vec![], expr)],
                    )),
                ));
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.get"),
                    vec![derived_id],
                )
            } else {
                expr
            }
        };

        // $$render(consequent_n) or $$render(consequent_n, index) for elseif branches
        let render_stmt = if index == 0 {
            b::stmt(
                &context.arena,
                b::call(&context.arena, b::id("$$render"), vec![consequent_id]),
            )
        } else {
            b::stmt(
                &context.arena,
                b::call(
                    &context.arena,
                    b::id("$$render"),
                    vec![consequent_id, b::number(index as f64)],
                ),
            )
        };

        branch_data.push(BranchData { test, render_stmt });
    }

    // Handle the final else branch (if the last branch has a non-elseif alternate)
    let last_branch = branches.last().expect("at least one branch");
    let final_alt_stmt = if let Some(alt_fragment) = &last_branch.alternate {
        let prev_in_control_flow = context.state.in_control_flow_block;
        context.state.in_control_flow_block = true;
        let alternate_block = visit_fragment(alt_fragment, context, false);
        context.state.in_control_flow_block = prev_in_control_flow;
        let alternate_id_name = context.state.memoizer.generate_id("alternate");
        let alternate_id = b::id(&alternate_id_name);

        // var alternate = ($$anchor) => { ... }
        statements.push(b::var_decl(
            &context.arena,
            &alternate_id_name,
            Some(b::arrow_block(
                vec![b::id_pattern("$$anchor")],
                alternate_block.body,
            )),
        ));

        // $$render(alternate, false)
        Some(b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::id("$$render"),
                vec![alternate_id, b::boolean(false)],
            ),
        ))
    } else {
        None
    };

    // Build the flat if/else-if/else chain from right to left
    let mut if_chain: Option<JsStatement> = final_alt_stmt;
    for data in branch_data.into_iter().rev() {
        let new_if = b::if_stmt(&context.arena, data.test, data.render_stmt, if_chain);
        if_chain = Some(new_if);
    }

    // Build $.if() arguments
    let render_body = if let Some(chain) = if_chain {
        vec![chain]
    } else {
        vec![]
    };

    let mut args = vec![
        context.state.node.clone(),
        b::arrow_block(vec![b::id_pattern("$$render")], render_body),
    ];

    // Handle elseif: add true as third argument
    // This affects transition behavior (EFFECT_TRANSPARENT)
    if node.elseif {
        args.push(b::boolean(true));
    }

    let if_call = b::call(&context.arena, b::member_path(&context.arena, "$.if"), args);
    let if_statement = if context.state.dev {
        use crate::compiler::phases::phase3_transform::client::visitors::attribute::locate_in_source;
        let (line, col) = locate_in_source(&context.state.analysis.source, node.start as usize);
        super::shared::utils::add_svelte_meta_dev(
            &context.arena,
            if_call,
            "if",
            &context.state.analysis.name,
            line,
            col,
            None,
            true,
        )
    } else {
        add_svelte_meta(&context.arena, if_call)
    };
    statements.push(if_statement);

    // If async (has_await or has_blockers), wrap in $.async()
    if has_await || has_blockers {
        // Blockers array: collect all blocker expressions from the expression
        let blockers = if has_blockers || has_await {
            b::array(blocker_exprs)
        } else {
            b::array(vec![])
        };

        // Async values: only present when has_await
        let async_values = if has_await {
            b::array(vec![b::async_thunk(&context.arena, expression)])
        } else {
            b::undefined(&context.arena)
        };

        // Callback params: include $$condition only when has_await
        let anchor_param = match &context.state.node {
            JsExpr::Identifier(name) => b::id_pattern(name.clone()),
            _ => b::id_pattern("$$anchor"),
        };

        let params = if has_await {
            vec![anchor_param, b::id_pattern("$$condition")]
        } else {
            vec![anchor_param]
        };

        let async_call = b::call(
            &context.arena,
            b::member_path(&context.arena, "$.async"),
            vec![
                context.state.node.clone(),
                blockers,
                async_values,
                b::arrow_block(params, statements),
            ],
        );

        context.state.init.push(b::stmt(&context.arena, async_call));
    } else {
        context.state.init.push(b::block(statements));
    }
}

/// Visit a fragment and return its block statement.
fn visit_fragment(
    fragment: &Fragment,
    context: &mut ComponentContext<'_>,
    is_root_fragment: bool,
) -> JsBlockStatement {
    visit_fragment_impl(fragment, context, is_root_fragment)
}
