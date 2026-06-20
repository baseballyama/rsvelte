//! Server `HtmlTag` visitor — the Rust port of
//! `3-transform/server/visitors/HtmlTag.js`.
//!
//! Upstream (写经):
//! ```js
//! export function HtmlTag(node, context) {
//!     const expression = b.call('$.html', context.visit(node.expression));
//!     if (node.metadata.expression.is_async()) {
//!         context.state.template.push(
//!             ...create_child_block(
//!                 [b.stmt(b.call('$$renderer.push', expression))],
//!                 node.metadata.expression.blockers(),
//!                 node.metadata.expression.has_await
//!             )
//!         );
//!     } else {
//!         context.state.template.push(expression);
//!     }
//! }
//! ```
//!
//! - Sync (`!is_async`): `$.html(expr)` is interpolated into the surrounding
//!   `push(`…${$.html(expr)}…`)` template (a `Template` entry with an empty
//!   quasi on each side).
//! - Async: the expression is `$.save`-wrapped (when it has an inline `await`
//!   AND the html-tag is a direct child of an element — `context.visit` →
//!   `AwaitExpression` visitor), then `$$renderer.push($.html(<expr>))` is routed
//!   through [`create_child_block`] (blockers → `async_block`, inline await →
//!   `child_block(async …)`).

use crate::ast::template::HtmlTag;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;

use super::shared::{
    TemplateEntry, create_child_block, expr_text_blockers, save_wrap_expr_text, text_has_await,
};

/// Visit a `{@html expr}` tag.
pub fn visit_html_tag<'a>(tag: &HtmlTag, state: &mut ServerTransformState<'a>) {
    let expr_text = state.expr_source(&tag.expression).map(|s| s.to_string());
    let blocker_indices: Vec<usize> = expr_text
        .as_deref()
        .map(|t| expr_text_blockers(state, t))
        .unwrap_or_default();
    let has_await = expr_text.as_deref().is_some_and(text_has_await);

    // 写经 `is_async()` = `has_await || has_blockers()`.
    if !has_await && blocker_indices.is_empty() {
        // Sync path: interpolate `$.html(expr)` into the surrounding push.
        let visited = state.visit_expr(&tag.expression);
        let html = state.b.call("$.html", vec![visited]);
        state.template.push(TemplateEntry::Template {
            quasis: vec![String::new(), String::new()],
            exprs: vec![html],
        });
        return;
    }

    // Async path. `context.visit(node.expression)` → `$.save`-wrap any inline
    // await when the html-tag is a direct child of an element (the
    // `AwaitExpression` parent-walk gate, mirrored by `in_element_children`).
    let visited = if has_await && state.in_element_children {
        save_wrap_expr_text(state, expr_text.as_deref().unwrap_or(""))
    } else {
        state.visit_expr(&tag.expression)
    };
    let b = state.b;
    let html = b.call("$.html", vec![visited]);
    let push = b.stmt(b.call("$$renderer.push", vec![html]));
    let wrapped = create_child_block(state, vec![push], &blocker_indices, has_await);
    for stmt in wrapped {
        state.template.push(TemplateEntry::Stmt(stmt));
    }
}
