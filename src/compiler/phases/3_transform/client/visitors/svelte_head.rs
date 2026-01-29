//! SvelteHead visitor for client-side transformation.
//!
//! Handles `<svelte:head>` elements for document head manipulation.
//!
//! Corresponds to `SvelteHead.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/SvelteHead.js`.

use crate::ast::template::{Fragment, SvelteElement};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::fragment::fragment;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;

/// Visit a SvelteHead node and generate client-side code.
///
/// Generates code like:
/// ```js
/// $.head('hash', ($$anchor) => {
///     // head content
/// });
/// ```
pub fn svelte_head(node: &SvelteElement, context: &mut ComponentContext) {
    // Generate the head content
    let content_fragment = Fragment {
        nodes: node.fragment.nodes.clone(),
        ..Default::default()
    };

    // Visit the content fragment (not root, since we're inside head)
    let content_block = fragment(&content_fragment, context, false);

    // Generate a payload hash for hydration validation
    // The official compiler uses a hash of the head content for SSR validation
    // For now, we use a simple hash based on template position
    let hash = generate_head_hash(context);

    // Build the head call: $.head('hash', ($$anchor) => { ... })
    let content_fn = b::arrow_block(vec![b::id_pattern("$$anchor")], content_block.body);

    let head_call = b::stmt(b::call(
        b::member_path("$.head"),
        vec![b::string(&hash), content_fn],
    ));

    context.state.init.push(head_call);
}

/// Generate a hash for the svelte:head element.
///
/// This hash is used for payload validation during hydration.
/// The official Svelte compiler uses a hash based on the element position
/// in the source code.
fn generate_head_hash(context: &ComponentContext) -> String {
    // Simple hash based on current init statements count
    // In the official compiler, this is derived from the source position
    let counter = context.state.init.len() + context.state.update.len();
    format!("{:x}s{:03}", counter % 256, counter % 1000)
}
