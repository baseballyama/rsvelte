//! DebugTag visitor for client-side transformation.
//!
//! Corresponds to `DebugTag` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/DebugTag.js`.
//!
//! The DebugTag visitor handles `{@debug ...}` tags. It generates code that
//! logs variable snapshots to the console and triggers the debugger.

use crate::ast::js::Expression;
use crate::ast::template::DebugTag;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Visit a debug tag.
///
/// Generates code for `{@debug ...}` tags. These are transformed into
/// `$.template_effect` calls that log variable snapshots and trigger
/// the debugger statement.
///
/// # Generated Code
///
/// For `{@debug foo, bar}` in runes mode:
///
/// ```javascript
/// $.template_effect(() => {
///     console.log({ foo: $.snapshot(foo), bar: $.snapshot(bar) });
///     debugger;
/// });
/// ```
///
/// For `{@debug foo}` in legacy (non-runes) mode:
///
/// ```javascript
/// $.template_effect(() => {
///     console.log({ foo: $.untrack(() => $.snapshot(foo)) });
///     debugger;
/// });
/// ```
pub fn debug_tag(node: &DebugTag, context: &mut ComponentContext) {
    // Build object properties: { name1: $.snapshot(visited1), ... }
    let properties: Vec<_> = node
        .identifiers
        .iter()
        .map(|identifier| {
            // Get the identifier name for the property key
            let name = get_identifier_name(identifier).unwrap_or_default();

            // Visit the identifier (convert + apply transforms)
            // This corresponds to `context.visit(identifier)` in the official compiler
            let converted = convert_expression(identifier, context);
            let visited = apply_transforms_to_expression(&converted, context);

            // Wrap with $.snapshot()
            let snapshot_call = b::call(
                &context.arena,
                b::member_path(&context.arena, "$.snapshot"),
                vec![visited],
            );

            // In non-runes mode, additionally wrap with $.untrack(b.thunk(...))
            let value = if context.state.analysis.runes {
                snapshot_call
            } else {
                b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.untrack"),
                    vec![b::thunk(&context.arena, snapshot_call)],
                )
            };

            b::prop(&context.arena, name, value)
        })
        .collect();

    let object = b::object(properties);

    // Create console.log(object)
    let call = b::call(
        &context.arena,
        b::member_path(&context.arena, "console.log"),
        vec![object],
    );

    // Wrap in $.template_effect(() => { console.log({...}); debugger; })
    let effect_body = vec![b::stmt(&context.arena, call), b::debugger()];
    let mut args = vec![b::thunk_block(effect_body)];

    // Collect blockers for identifiers that reference top-level / const-bound
    // async-derived values. Mirrors upstream Svelte 5.55.6 `4c96b469f` which
    // wires `node.identifiers[i].name → scope.get(name)?.blocker` into the
    // `template_effect(callback, [], [], blockers)` overload so `{@debug d}`
    // for an `await`-derived `d` waits on the right `$$promises[N]`.
    let blocker_exprs: Vec<JsExpr> = {
        let map = context.state.blocker_map.borrow();
        let const_map = context.state.const_blocker_map.borrow();
        if map.is_empty() && const_map.is_empty() {
            Vec::new()
        } else {
            let mut blockers: Vec<JsExpr> = Vec::new();
            let mut seen_idx: Vec<usize> = Vec::new();
            let mut seen_ptrs: Vec<*const JsExpr> = Vec::new();
            for identifier in &node.identifiers {
                let Some(name) = get_identifier_name(identifier) else {
                    continue;
                };
                if let Some(&idx) = map.get(name.as_str()) {
                    if !seen_idx.contains(&idx) {
                        seen_idx.push(idx);
                        blockers.push(b::member_computed(
                            &context.arena,
                            b::id("$$promises"),
                            b::number(idx as f64),
                        ));
                    }
                } else if let Some(blocker_expr) = const_map.get(name.as_str()) {
                    let ptr = blocker_expr as *const JsExpr;
                    if !seen_ptrs.contains(&ptr) {
                        seen_ptrs.push(ptr);
                        blockers.push(blocker_expr.clone());
                    }
                }
            }
            blockers
        }
    };

    if !blocker_exprs.is_empty() {
        // template_effect(callback, sync_values, async_values, blockers)
        // For `{@debug …}` upstream passes the trailing `b.array([]), b.array([]), b.array(blockers)`.
        args.push(b::array(Vec::<JsExpr>::new()));
        args.push(b::array(Vec::<JsExpr>::new()));
        args.push(b::array(blocker_exprs));
    }

    let effect = b::call(
        &context.arena,
        b::member_path(&context.arena, "$.template_effect"),
        args,
    );

    context.state.init.push(b::stmt(&context.arena, effect));
}

/// Get the name of an identifier expression.
///
/// Extracts the "name" field from an Identifier AST node.
fn get_identifier_name(expr: &Expression) -> Option<String> {
    expr.identifier_name().map(String::from)
}
