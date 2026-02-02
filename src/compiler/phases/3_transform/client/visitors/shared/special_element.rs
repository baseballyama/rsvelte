//! Special element visitor for client-side transformation.
//!
//! Handles `<svelte:body>`, `<svelte:document>`, and `<svelte:window>` elements.
//!
//! Corresponds to `visit_special_element` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/special_element.js`.

use crate::ast::template::*;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;

/// Visit a special Svelte element (body, document, or window).
///
/// Special elements bind to global objects and are processed differently
/// from regular elements.
///
/// # Arguments
///
/// * `node` - The special element node (SvelteBody, SvelteDocument, or SvelteWindow)
/// * `id` - The identifier to use for the element reference (e.g., "window", "document", "body")
/// * `context` - The component transformation context
///
/// # Behavior
///
/// - Creates a new state with `node` set to the specified identifier
/// - Processes all attributes on the element:
///   - `OnDirective` attributes are added to state.init as statements
///   - Other attributes are visited normally
pub fn visit_special_element(
    node: SpecialElementNode,
    id: &str,
    context: &mut ComponentContext,
) -> TransformResult {
    // Create a new state with the node set to the identifier
    let mut new_state = context.state.clone();
    new_state.node = b::id(id);

    // Process all attributes
    let attributes = match &node {
        SpecialElementNode::SvelteBody(body) => &body.attributes,
        SpecialElementNode::SvelteDocument(doc) => &doc.attributes,
        SpecialElementNode::SvelteWindow(win) => &win.attributes,
    };

    for attribute in attributes {
        match attribute {
            Attribute::OnDirective(on_directive) => {
                // OnDirective: visit and add to state.init as a statement
                let result = visit_on_directive(on_directive, &new_state, context);
                if let TransformResult::Expression(expr) = result {
                    new_state.init.push(b::stmt(expr));
                }
            }
            _ => {
                // Other attributes: just visit them
                visit_attribute(attribute, &new_state, context);
            }
        }
    }

    // Update the context state
    context.state = new_state;

    TransformResult::None
}

/// Special element node types.
///
/// Represents the different types of special Svelte elements.
#[derive(Debug, Clone)]
pub enum SpecialElementNode {
    /// `<svelte:body>` element
    SvelteBody(SvelteElement),

    /// `<svelte:document>` element
    SvelteDocument(SvelteElement),

    /// `<svelte:window>` element
    SvelteWindow(SvelteElement),
}

/// Visit an OnDirective attribute.
///
/// Transforms event handlers on special elements.
fn visit_on_directive(
    _on_directive: &OnDirective,
    _state: &ComponentClientTransformState,
    _context: &mut ComponentContext,
) -> TransformResult {
    // TODO: Implement OnDirective transformation
    // This would:
    // 1. Extract the event name and handler
    // 2. Generate appropriate event listener code
    // 3. Return an expression that can be added to init
    TransformResult::None
}

/// Visit a generic attribute.
///
/// Processes attributes other than OnDirective.
fn visit_attribute(
    attribute: &Attribute,
    state: &ComponentClientTransformState,
    context: &mut ComponentContext,
) -> TransformResult {
    // Create a new context with the special element's node
    let old_node = context.state.node.clone();
    context.state.node = state.node.clone();

    let result = match attribute {
        Attribute::UseDirective(use_directive) => {
            // Handle use: directives on special elements
            let stmt = super::super::use_directive::use_directive(use_directive, context);
            context.state.init.push(stmt);
            TransformResult::None
        }
        // TODO: Handle other directive types as needed
        // - BindDirective
        // - ClassDirective
        // - StyleDirective
        // - TransitionDirective
        // - AnimateDirective
        _ => TransformResult::None,
    };

    // Restore the original node
    context.state.node = old_node;
    result
}
