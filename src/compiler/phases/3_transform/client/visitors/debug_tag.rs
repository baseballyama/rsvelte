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
            let snapshot_call = b::call(b::member_path("$.snapshot"), vec![visited]);

            // In non-runes mode, additionally wrap with $.untrack(b.thunk(...))
            let value = if context.state.analysis.runes {
                snapshot_call
            } else {
                b::call(b::member_path("$.untrack"), vec![b::thunk(snapshot_call)])
            };

            b::prop(name, value)
        })
        .collect();

    let object = b::object(properties);

    // Create console.log(object)
    let call = b::call(b::member_path("console.log"), vec![object]);

    // Wrap in $.template_effect(() => { console.log({...}); debugger; })
    let effect_body = vec![b::stmt(call), b::debugger()];
    let effect = b::call(
        b::member_path("$.template_effect"),
        vec![b::thunk_block(effect_body)],
    );

    context.state.init.push(b::stmt(effect));
}

/// Get the name of an identifier expression.
///
/// Extracts the "name" field from an Identifier AST node.
fn get_identifier_name(expr: &Expression) -> Option<String> {
    let Expression::Value(val) = expr;
    if let serde_json::Value::Object(obj) = val
        && obj.get("type").and_then(|v| v.as_str()) == Some("Identifier")
    {
        obj.get("name").and_then(|v| v.as_str()).map(String::from)
    } else {
        None
    }
}
