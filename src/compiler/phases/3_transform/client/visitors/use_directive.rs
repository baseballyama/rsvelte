//! UseDirective visitor for client-side transformation.
//!
//! Corresponds to `UseDirective.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/UseDirective.js`.
//!
//! This visitor handles `use:action={expression}` directives.

use crate::ast::template::UseDirective;
use crate::compiler::phases::phase3_transform::client::BindingKind;
use crate::compiler::phases::phase3_transform::client::types::ExpressionMetadata;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::{
    apply_transforms_to_expression, build_expression, expression_has_reactive_state,
    parse_directive_name,
};
use crate::compiler::phases::phase3_transform::client::visitors::transition_directive::get_blockers_for_exprs;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::{
    JsExpr, JsMemberExpression, JsMemberProperty, JsPattern, JsStatement,
};

/// Visit a UseDirective node and generate action code.
///
/// Corresponds to `UseDirective` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/UseDirective.js`:
///
/// ```javascript
/// export function UseDirective(node, context) {
///     const params = [b.id('$$node')];
///
///     if (node.expression) {
///         params.push(b.id('$$action_arg'));
///     }
///
///     const args = [
///         context.state.node,
///         b.arrow(
///             params,
///             b.maybe_call(
///                 context.visit(parse_directive_name(node.name)),
///                 ...params
///             )
///         )
///     ];
///
///     if (node.expression) {
///         args.push(b.thunk(context.visit(node.expression)));
///     }
///
///     // actions need to run after attribute updates in order with bindings/events
///     let statement = b.stmt(b.call('$.action', ...args));
///
///     if (node.metadata.expression.is_async()) {
///         statement = b.stmt(
///             b.call(
///                 '$.run_after_blockers',
///                 node.metadata.expression.blockers(),
///                 b.thunk(b.block([statement]))
///             )
///         );
///     }
///
///     context.state.init.push(statement);
///     context.next();
/// }
/// ```
pub fn use_directive(node: &UseDirective, context: &mut ComponentContext) -> JsStatement {
    // Build arrow function parameters: [$$node] or [$$node, $$action_arg]
    let mut params: Vec<JsPattern> = vec![b::id_pattern("$$node")];
    let mut arrow_args: Vec<JsExpr> = vec![b::id("$$node")];

    if node.expression.is_some() {
        params.push(b::id_pattern("$$action_arg"));
        arrow_args.push(b::id("$$action_arg"));
    }

    // Parse the directive name to get the action function reference
    // For example, "action" becomes `action`, "custom.action" becomes `custom.action`
    // Then apply transforms (equivalent to context.visit(parse_directive_name(node.name)) in JS)
    let parsed_name = parse_directive_name(&node.name);

    // Apply registered transforms (e.g., $.get() for state/derived variables)
    let mut action_name = apply_transforms_to_expression(&parsed_name, context);

    // Handle non-source props that don't have registered transforms but need $$props.name access
    // This mirrors what convert_identifier does for Prop/BindableProp bindings
    if let JsExpr::Identifier(ref name) = action_name
        && context.state.analysis.runes
        && let Some(binding) = context.state.get_binding(name)
        && matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp)
    {
        let is_source = crate::compiler::phases::phase3_transform::client::utils::is_prop_source(
            binding,
            context.state.analysis,
        );
        let is_exported = context
            .state
            .analysis
            .exports
            .iter()
            .any(|e| e.name == *name);
        if !is_source && !is_exported {
            action_name = JsExpr::Member(JsMemberExpression {
                object: Box::new(JsExpr::Identifier("$$props".into())),
                property: JsMemberProperty::Identifier(name.clone()),
                computed: false,
                optional: false,
            });
        }
    }

    // Build the maybe_call: action?.($$node) or action?.($$node, $$action_arg)
    // This is equivalent to b.maybe_call() in the JS builder
    let maybe_call = b::optional_call(action_name.clone(), arrow_args);

    // Build the arrow function: ($$node, $$action_arg) => action?.($$node, $$action_arg)
    let action_callback = b::arrow(params, maybe_call);

    // Build the arguments for $.action()
    let mut action_args = vec![context.state.node.clone(), action_callback];

    // If there's an expression argument, add the thunk
    let expr_for_blockers;
    if let Some(ref expr) = node.expression {
        // Convert the expression and apply transforms (e.g., $.get() for state variables)
        let converted = convert_expression(expr, context);

        // Check if expression has reactive state
        let has_state = expression_has_reactive_state(expr, context);

        let mut metadata = ExpressionMetadata::default();
        metadata.set_has_state(has_state);

        // Build the expression with transforms applied
        let built_expr = build_expression(context, &converted, &metadata);

        expr_for_blockers = Some(built_expr.clone());

        // Wrap in a thunk: () => expression
        action_args.push(b::thunk(built_expr));
    } else {
        expr_for_blockers = None;
    }

    // Build the $.action() call
    let action_call = b::call(b::member_path("$.action"), action_args);

    let mut statement = b::stmt(action_call);

    // Check if any referenced variables are blocked by async promises.
    // We check both the directive name and expression for blocker references.
    let mut blocker_check_exprs: Vec<&JsExpr> = vec![&action_name];
    if let Some(ref expr) = expr_for_blockers {
        blocker_check_exprs.push(expr);
    }
    let blocker_exprs = get_blockers_for_exprs(&blocker_check_exprs, context);

    if !blocker_exprs.is_empty() {
        let blockers_array = b::array(blocker_exprs);
        statement = b::stmt(b::call(
            b::member_path("$.run_after_blockers"),
            vec![blockers_array, b::arrow_block(vec![], vec![statement])],
        ));
    }

    statement
}
