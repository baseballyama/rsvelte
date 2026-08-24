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
        return Err(errors::svelte_meta_duplicate("svelte:window").at(window.start, window.start));
    }
    context.has_svelte_window = true;

    // Validate placement (must be at top level)
    if !context.in_root_fragment {
        return Err(
            errors::svelte_meta_invalid_placement("svelte:window").at(window.start, window.start)
        );
    }

    // svelte:window cannot have children
    if !window.fragment.nodes.is_empty() {
        let (start, _) = window.fragment.nodes.first().unwrap().span();
        let (_, end) = window.fragment.nodes.last().unwrap().span();
        return Err(errors::svelte_meta_invalid_content("svelte:window").at(start, end));
    }

    // Upstream runs this whole loop before `context.next()` descends into any
    // attribute, so "does this element take arbitrary attributes at all" is
    // answered ahead of every per-directive rule below.
    for attr in &window.attributes {
        let span = match attr {
            Attribute::SpreadAttribute(spread) => Some((spread.start, spread.end)),
            Attribute::Attribute(a) if !super::shared::utils::is_event_attribute(a) => {
                Some((a.start, a.end))
            }
            _ => None,
        };
        if let Some((start, end)) = span {
            return Err(errors::illegal_element_attribute("svelte:window").at(start, end));
        }
    }

    // The target rule needs the attribute list, which the mutable loop below holds.
    for attr in &window.attributes {
        if let Attribute::BindDirective(bind) = attr {
            bind_directive::validate_binding_target(bind, "svelte:window", &window.attributes)?;
        }
    }

    for attr in &mut window.attributes {
        match attr {
            Attribute::BindDirective(bind) => {
                bind_directive::visit_with_svelte_element(bind, context)?;
            }
            Attribute::OnDirective(on) => {
                on_directive::visit(on, context)?;
            }
            Attribute::LetDirective(let_dir) => {
                // let: directives are NOT allowed on svelte:window
                return Err(
                    errors::let_directive_invalid_placement().at(let_dir.start, let_dir.end)
                );
            }
            // Event attributes (e.g. `onkeydown={(e) => …}`) carry expressions
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
