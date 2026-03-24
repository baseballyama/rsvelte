//! OnDirective visitor for client-side transformation.
//!
//! Corresponds to `OnDirective.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/OnDirective.js`.

use crate::ast::template::OnDirective;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::shared::events::{
    build_event, build_event_handler,
};
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;

const MODIFIERS: &[&str] = &[
    "stopPropagation",
    "stopImmediatePropagation",
    "preventDefault",
    "self",
    "trusted",
    "once",
];

/// Visit an OnDirective node and generate event handler code.
///
/// Corresponds to `OnDirective` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/OnDirective.js`:
///
/// ```javascript
/// export function OnDirective(node, context) {
///     if (!node.expression) {
///         context.state.analysis.needs_props = true;
///     }
///
///     let handler = build_event_handler(node.expression, node.metadata.expression, context);
///
///     for (const modifier of modifiers) {
///         if (node.modifiers.includes(modifier)) {
///             handler = b.call('$.' + modifier, handler);
///         }
///     }
///
///     const capture = node.modifiers.includes('capture');
///     const passive =
///         node.modifiers.includes('passive') ||
///         (node.modifiers.includes('nonpassive') ? false : undefined);
///
///     return build_event(node.name, context.state.node, handler, capture, passive);
/// }
/// ```
pub fn on_directive(node: &OnDirective, context: &mut ComponentContext) -> JsExpr {
    // If there's no expression, we need props (bubble event to parent)
    // The needs_props_from_events flag is set in build_event_handler when expression is None

    // Build the event handler
    let arena_ref = unsafe { &*(&context.arena as *const _) };
    let mut handler = build_event_handler(arena_ref, node.expression.as_ref(), node, context);

    // Apply modifiers
    for modifier in MODIFIERS {
        if node.modifiers.iter().any(|m| m.as_str() == *modifier) {
            let modifier_fn = format!("$.{}", modifier);
            handler = b::call(
                &context.arena,
                b::member_path(&context.arena, &modifier_fn),
                vec![handler],
            );
        }
    }

    // Check for capture and passive modifiers
    let capture = node.modifiers.iter().any(|m| m.as_str() == "capture");
    let passive = if node.modifiers.iter().any(|m| m.as_str() == "passive") {
        Some(true)
    } else if node.modifiers.iter().any(|m| m.as_str() == "nonpassive") {
        Some(false)
    } else {
        None
    };

    // In dev mode, convert arrow function handlers to named functions for better stack traces
    let handler = if context.state.options.dev {
        let name = context.state.memoizer.generate_id(&node.name);
        crate::compiler::phases::phase3_transform::client::visitors::shared::events::convert_arrow_to_named_function(handler, name.into())
    } else {
        handler
    };

    // Build the $.event() call
    build_event(
        &context.arena,
        &node.name,
        &context.state.node,
        handler,
        capture,
        passive,
    )
}
