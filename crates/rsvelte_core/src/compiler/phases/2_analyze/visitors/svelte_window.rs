//! SvelteWindow visitor.
//!
//! Analyzes <svelte:window> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteWindow.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use super::bind_directive;
use super::on_directive;
use crate::ast::template::{Attribute, SvelteElement};

/// Visit a svelte:window.
pub fn visit(
    window: &mut SvelteElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Check for duplicate
    if context.has_svelte_window {
        return Err(errors::svelte_meta_duplicate("svelte:window"));
    }
    context.has_svelte_window = true;

    // Validate placement (must be at top level)
    if context.is_inside_element_or_block() {
        return Err(errors::svelte_meta_invalid_placement("svelte:window"));
    }

    // svelte:window cannot have children
    if !window.fragment.nodes.is_empty() {
        return Err(AnalysisError::validation(
            "svelte_meta_invalid_content",
            "<svelte:window> cannot have children",
        ));
    }

    // Validate attributes - check for invalid ones
    for attr in &mut window.attributes {
        match attr {
            Attribute::BindDirective(bind) => {
                bind_directive::visit_with_svelte_element(bind, "svelte:window", context)?;
            }
            Attribute::OnDirective(on) => {
                on_directive::visit(on, context)?;
            }
            Attribute::LetDirective(_) => {
                // let: directives are NOT allowed on svelte:window
                return Err(errors::let_directive_invalid_placement());
            }
            Attribute::SpreadAttribute(_) => {
                // Spread attributes are NOT allowed on svelte:window
                return Err(errors::illegal_element_attribute("svelte:window"));
            }
            // Regular attributes (e.g. `onkeydown={(e) => …}`) carry expressions
            // that must be analysed — a non-safe call inside them (e.g. an imported
            // `goto(...)`) sets `needs_context`, driving the `$.push`/`$.pop`
            // component-context emission. Previously these were ignored, so a
            // `<svelte:window onkeydown={…goto(…)…}>` left `needs_context` false.
            Attribute::Attribute(a) => {
                super::attribute::visit_attribute_value_expressions(&mut a.value, context)?;
            }
            _ => {}
        }
    }

    Ok(())
}
