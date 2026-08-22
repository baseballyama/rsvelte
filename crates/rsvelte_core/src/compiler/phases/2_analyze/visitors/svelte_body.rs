//! SvelteBody visitor.
//!
//! Analyzes <svelte:body> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteBody.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use super::bind_directive;
use super::on_directive;
use crate::ast::template::{Attribute, SvelteElement};

/// Visit a svelte:body.
pub fn visit(body: &mut SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for duplicate
    if context.has_svelte_body {
        return Err(errors::svelte_meta_duplicate("svelte:body").at(body.start, body.start));
    }
    context.has_svelte_body = true;

    // Validate placement (must be at top level)
    if !context.in_root_fragment {
        return Err(errors::svelte_meta_invalid_placement("svelte:body").at(body.start, body.start));
    }

    // svelte:body cannot have children
    if !body.fragment.nodes.is_empty() {
        let (start, _) = body.fragment.nodes.first().unwrap().span();
        let (_, end) = body.fragment.nodes.last().unwrap().span();
        return Err(errors::svelte_meta_invalid_content("svelte:body").at(start, end));
    }

    // Event expressions on special elements participate in normal reference analysis.
    // The target rule needs the attribute list, which the mutable loop below holds.
    for attr in &body.attributes {
        if let Attribute::BindDirective(bind) = attr {
            bind_directive::validate_binding_target(bind, "svelte:body", &body.attributes)?;
        }
    }

    for attr in &mut body.attributes {
        match attr {
            Attribute::BindDirective(bind) => {
                bind_directive::visit_with_svelte_element(bind, context)?;
            }
            Attribute::OnDirective(on) => on_directive::visit(on, context)?,
            Attribute::LetDirective(let_dir) => {
                return Err(
                    errors::let_directive_invalid_placement().at(let_dir.start, let_dir.end)
                );
            }
            Attribute::SpreadAttribute(spread) => {
                return Err(errors::svelte_body_illegal_attribute().at(spread.start, spread.end));
            }
            Attribute::Attribute(attribute) => {
                if !super::shared::utils::is_event_attribute(attribute) {
                    return Err(
                        errors::svelte_body_illegal_attribute().at(attribute.start, attribute.end)
                    );
                }
                super::attribute::visit_attribute_value_expressions(&mut attribute.value, context)?;
            }
            _ => {}
        }
    }

    Ok(())
}
