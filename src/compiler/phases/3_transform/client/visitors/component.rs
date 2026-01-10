//! Component visitor for client-side transformation.
//!
//! Corresponds to `Component.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Component.js`.
//!
//! This visitor handles the transformation of Svelte component instances
//! (e.g., `<MyComponent />`) to client-side JavaScript code.

use crate::ast::template::Component;
use crate::compiler::phases::phase3_transform::client::types::ComponentContext;
use crate::compiler::phases::phase3_transform::client::visitors::shared::component::{
    ComponentNode, build_component,
};

/// Visit a Component node and generate client-side code.
///
/// This function corresponds to the `Component` visitor in the JavaScript compiler.
/// It generates the necessary JavaScript to instantiate a Svelte component.
///
/// # Arguments
///
/// * `node` - The Component AST node
/// * `context` - The component transformation context
///
/// # Behavior
///
/// The visitor:
/// 1. Extracts the component name and location information
/// 2. Calls `build_component` from shared utilities to generate instantiation code
/// 3. Pushes the result to the context's init statements
///
/// # Example
///
/// Given this Svelte code:
/// ```svelte
/// <MyComponent prop={value} on:click={handler} />
/// ```
///
/// This visitor generates code like:
/// ```javascript
/// MyComponent(anchor, { prop: value, $$events: { click: handler } });
/// ```
pub fn visit_component(node: &Component, context: &mut ComponentContext) {
    // Extract component name
    let component_name = node.name.to_string();

    // Build component instantiation statement
    let component = build_component(
        ComponentNode::Component(node.clone()),
        component_name,
        context,
    );

    // Add to init statements (run once during component creation)
    context.state.init.push(component);
}
