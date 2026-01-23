//! SvelteElement visitor.
//!
//! Analyzes <svelte:element> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteElement.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::js::Expression;
use crate::ast::template::{Attribute, SvelteDynamicElement};

/// Visit a svelte:element.
pub fn visit(
    element: &mut SvelteDynamicElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Mark that we have dynamic elements (can't safely prune type selectors)
    context.analysis.css.has_dynamic_elements = true;

    // Check that svelte:element has a 'this' attribute with a value
    // The 'tag' field is populated from the 'this' attribute during parsing
    // If it's null/undefined or empty, the 'this' attribute is missing or has no value
    let has_valid_this = match &element.tag {
        Expression::Value(value) => {
            // Check if it's a non-null value
            !value.is_null()
        }
    };

    if !has_valid_this {
        return Err(errors::svelte_element_missing_this());
    }

    // Check for invalid bindings on svelte:element
    // bind:value, bind:files, bind:group can only be used with specific elements
    for attr in &element.attributes {
        if let Attribute::BindDirective(bind) = attr {
            let name = bind.name.as_str();
            match name {
                "value" => {
                    return Err(AnalysisError::validation(
                        "bind_invalid_target",
                        "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`",
                    ));
                }
                "files" => {
                    return Err(AnalysisError::validation(
                        "bind_invalid_target",
                        "`bind:files` can only be used with `<input type=\"file\">`",
                    ));
                }
                "group" => {
                    return Err(AnalysisError::validation(
                        "bind_invalid_target",
                        "`bind:group` can only be used with `<input type=\"checkbox\">` or `<input type=\"radio\">`",
                    ));
                }
                "checked" => {
                    return Err(AnalysisError::validation(
                        "bind_invalid_target",
                        "`bind:checked` can only be used with `<input type=\"checkbox\">` or `<input type=\"radio\">`",
                    ));
                }
                _ => {}
            }
        }
    }

    // Analyze children
    fragment::analyze(&mut element.fragment, context)?;

    Ok(())
}
