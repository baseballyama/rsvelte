//! Server `SnippetBlock` visitor — the Rust port of
//! `3-transform/server/visitors/SnippetBlock.js` (non-dev path).
//!
//! Upstream (写経):
//! ```js
//! export function SnippetBlock(node, context) {
//!     let fn = b.function_declaration(
//!         node.expression,                          // the snippet name id
//!         [b.id('$$renderer'), ...node.parameters], // ($$renderer, ...params)
//!         context.visit(node.body)                  // a `b.block([...])`
//!     );
//!     const statements = node.metadata.can_hoist ? context.state.hoisted
//!                                                 : context.state.init;
//!     // dev: validate_snippet_args + prevent_snippet_stringification (KNOWN GAP)
//!     statements.push(fn);
//! }
//! ```
//!
//! A snippet lowers to a `function name($$renderer, ...params) { <body> }`
//! declaration, hoisted to module scope when `can_hoist`, else emitted into the
//! component-function body. The dev-mode `$.validate_snippet_args` prologue and
//! `$.prevent_snippet_stringification` registration are KNOWN GAPs.
//!
//! 写経 gap: non-identifier snippet parameters (destructuring patterns / defaults)
//! fall back to an `undefined`-named param — the simple-sample snippets exercised
//! so far have zero or identifier-only parameters.

use crate::ast::template::SnippetBlock;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;

/// Visit a `{#snippet name(params)}...{/snippet}` block.
pub fn visit_snippet_block<'a>(node: &SnippetBlock, state: &mut ServerTransformState<'a>) {
    let b = state.b;

    // Snippet name — `node.expression` is the name identifier.
    let name = node
        .expression
        .identifier_name()
        .map(|s| s.to_string())
        .unwrap_or_else(|| "snippet".to_string());

    // Params: `$$renderer` first, then the declared parameters as binding
    // patterns. Identifier params map to `b.id_pat(name)`; anything else is a
    // KNOWN GAP (placeholder `undefined`).
    let mut patterns = vec![b.id_pat("$$renderer")];
    for param in &node.parameters {
        let pat_name = param
            .identifier_name()
            .map(|s| s.to_string())
            .unwrap_or_else(|| "undefined".to_string());
        patterns.push(b.id_pat(&pat_name));
    }
    let params = b.params(patterns, None);

    // Body: render the fragment as a `{ ... }` block, then reuse its statements
    // as the function body.
    // SnippetBlock body IS an `is_text_first` parent (upstream `clean_nodes`).
    let body_block = super::shared::build_fragment_body(&node.body, true, state);
    let fn_body = b.body(body_block);

    let fn_decl = b.function_declaration(&name, params, fn_body, false);

    // KNOWN GAP: `node.metadata.can_hoist` is the upstream hoist predicate; the
    // AST analysis does not surface it on `SnippetBlockMetadata` yet in a form
    // we read here, so we emit to `hoisted` (module scope) unconditionally,
    // matching the common hoistable case for the simple samples. Non-hoistable
    // snippets (referencing instance state) are a KNOWN GAP.
    state.hoisted.push(fn_decl);
}
