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

    // Save the current namespace and force HTML namespace for head content
    // Elements like <title> should use from_html, not from_svg, even though
    // <title> is a valid SVG element in other contexts
    let saved_namespace = context.state.metadata.namespace.clone();
    context.state.metadata.namespace = "html".to_string();

    // Visit the content fragment (not root, since we're inside head)
    let content_block = fragment(&content_fragment, context, false);

    // Restore the original namespace
    context.state.metadata.namespace = saved_namespace;

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
/// The official Svelte compiler uses hash(filename) for this.
fn generate_head_hash(context: &ComponentContext) -> String {
    // Use the pre-computed filename hash from the analysis
    context.state.analysis.filename_hash.clone()
}
