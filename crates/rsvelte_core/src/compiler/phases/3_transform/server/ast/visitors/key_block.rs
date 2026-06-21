//! Server `KeyBlock` visitor — the Rust port of
//! `3-transform/server/visitors/KeyBlock.js` (sync path).
//!
//! Upstream (写経):
//! ```js
//! export function KeyBlock(node, context) {
//!     const is_async = node.metadata.expression.is_async();
//!     if (is_async) context.state.template.push(block_open);   // `<!--[-->`
//!     context.state.template.push(
//!         empty_comment,                       // `<!---->`
//!         context.visit(node.fragment),        // a `b.block([...])`
//!         empty_comment                        // `<!---->`
//!     );
//!     if (is_async) context.state.template.push(block_close);  // `<!--]-->`
//! }
//! ```
//!
//! KeyBlock just re-renders its body verbatim, wrapped in two `<!---->` anchor
//! comments. The async path (`is_async` → extra `<!--[-->` / `<!--]-->`
//! wrappers) is KNOWN GAP: it needs the `PromiseOptimiser` / blocker plumbing,
//! which is not ported in the AST pipeline yet.

use crate::ast::template::KeyBlock;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;

use super::shared::{EMPTY_COMMENT, TemplateEntry, build_fragment_block};

/// Visit a `{#key expr}...{/key}` block (sync path only).
pub fn visit_key_block<'a>(node: &KeyBlock, state: &mut ServerTransformState<'a>) {
    // KNOWN GAP: async key blocks (`node.metadata.expression.is_async()`) need
    // the `block_open` / `block_close` wrappers + blocker plumbing.

    // `<!---->` anchor before the body.
    state
        .template
        .push(TemplateEntry::Literal(EMPTY_COMMENT.to_string()));

    // The body fragment rendered as a `{ ... }` block statement.
    // KeyBlock body is NOT an `is_text_first` parent.
    let block = build_fragment_block(&node.fragment, false, state);
    state.template.push(TemplateEntry::Stmt(block));

    // `<!---->` anchor after the body.
    state
        .template
        .push(TemplateEntry::Literal(EMPTY_COMMENT.to_string()));
}
