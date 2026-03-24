//! Text node visitor for client-side transformation.
//!
//! Text nodes in Svelte are handled differently depending on their context:
//! - Standalone text nodes are created with `$.text(data)`
//! - Text nodes mixed with expressions are handled by `process_children` in fragment.js
//!
//! This visitor handles the simple case where a text node needs to be visited
//! individually. In most cases, text nodes are processed as part of fragment
//! children processing.
//!
//! Corresponds to inline Text handling in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Fragment.js`.

use crate::ast::template::Text;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;

/// Visit a Text node and generate client-side code.
///
/// Creates a text node using `$.text(data)` and appends it to the current anchor.
/// This is typically used for standalone text nodes. When text nodes are mixed
/// with expressions, they are handled by `process_children` instead.
///
/// # Arguments
///
/// * `node` - The Text node to transform
/// * `context` - The component transformation context
///
/// # Returns
///
/// Returns a TransformResult containing the transformation output.
///
/// # Example
///
/// For a simple text node:
/// ```svelte
/// <div>Hello, world!</div>
/// ```
///
/// Generates:
/// ```js
/// const text = $.text("Hello, world!");
/// $.append($$anchor, text);
/// ```
pub fn visit_text(node: &Text, context: &mut ComponentContext) -> TransformResult {
    // Generate a unique identifier for this text node
    let id_name = context.state.memoizer.generate_id("text");
    let id = b::id(&id_name);

    // Create the text node: const text = $.text("data")
    let text_call = b::call(
        &context.arena,
        b::member_path(&context.arena, "$.text"),
        vec![b::string(node.data.to_string())],
    );

    let var_stmt = b::var_decl(&context.arena, &id_name, Some(text_call));

    // Add to initialization statements
    context.state.init.push(var_stmt);

    // Append to anchor: $.append($$anchor, text)
    let append_stmt = b::stmt(
        &context.arena,
        b::call(
            &context.arena,
            b::member_path(&context.arena, "$.append"),
            vec![b::id("$$anchor"), id],
        ),
    );

    TransformResult::Statement(append_stmt)
}
