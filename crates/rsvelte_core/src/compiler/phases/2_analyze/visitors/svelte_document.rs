//! SvelteDocument visitor.
//!
//! Analyzes <svelte:document> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteDocument.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use super::bind_directive;
use super::on_directive;
use crate::ast::template::{Attribute, SvelteElement};

/// Visit a svelte:document.
pub fn visit(
    document: &mut SvelteElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Check for duplicate
    if context.has_svelte_document {
        return Err(
            errors::svelte_meta_duplicate("svelte:document").at(document.start, document.start)
        );
    }
    context.has_svelte_document = true;

    // Validate placement (must be at top level)
    if !context.in_root_fragment {
        return Err(errors::svelte_meta_invalid_placement("svelte:document")
            .at(document.start, document.start));
    }

    // svelte:document cannot have children
    if !document.fragment.nodes.is_empty() {
        let (start, _) = document.fragment.nodes.first().unwrap().span();
        let (_, end) = document.fragment.nodes.last().unwrap().span();
        return Err(errors::svelte_meta_invalid_content("svelte:document").at(start, end));
    }

    // Upstream runs this whole loop before `context.next()` descends into any
    // attribute, so "does this element take arbitrary attributes at all" is
    // answered ahead of every per-directive rule below.
    for attr in &document.attributes {
        let span = match attr {
            Attribute::SpreadAttribute(spread) => Some((spread.start, spread.end)),
            Attribute::Attribute(a) if !super::shared::utils::is_event_attribute(a) => {
                Some((a.start, a.end))
            }
            _ => None,
        };
        if let Some((start, end)) = span {
            return Err(errors::illegal_element_attribute("svelte:document").at(start, end));
        }
    }

    // The target rule needs the attribute list, which the mutable loop below holds.
    for attr in &document.attributes {
        if let Attribute::BindDirective(bind) = attr {
            bind_directive::validate_binding_target(bind, "svelte:document", &document.attributes)?;
        }
    }

    for attr in &mut document.attributes {
        match attr {
            Attribute::BindDirective(bind) => {
                bind_directive::visit_with_svelte_element(bind, context)?;
            }
            Attribute::OnDirective(on) => {
                on_directive::visit(on, context)?;
            }
            Attribute::LetDirective(let_dir) => {
                // let: directives are NOT allowed on svelte:document
                return Err(
                    errors::let_directive_invalid_placement().at(let_dir.start, let_dir.end)
                );
            }
            // Event-attribute handler expressions drive `needs_context` (see
            // svelte_window for the rationale).
            Attribute::Attribute(a) => {
                super::attribute::visit_attribute_value_expressions(&mut a.value, context)?;
            }
            _ => {}
        }
    }

    Ok(())
}
