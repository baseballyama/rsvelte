//! Special element utilities.
//!
//! Functions for handling special Svelte elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/special-element.js`.

use super::super::super::AnalysisError;
use super::super::VisitorContext;

/// Check if a tag name is a special Svelte element.
pub fn is_special_element(name: &str) -> bool {
    matches!(
        name,
        "svelte:self"
            | "svelte:component"
            | "svelte:element"
            | "svelte:fragment"
            | "svelte:head"
            | "svelte:body"
            | "svelte:window"
            | "svelte:document"
            | "svelte:options"
            | "svelte:boundary"
    )
}

/// Validate special element placement.
pub fn validate_special_element_placement(
    name: &str,
    context: &VisitorContext,
) -> Result<(), AnalysisError> {
    match name {
        "svelte:head" => {
            // svelte:head can only appear at the top level
            if context.path.iter().any(|node| {
                matches!(
                    node,
                    crate::ast::template::TemplateNode::RegularElement(_)
                        | crate::ast::template::TemplateNode::Component(_)
                )
            }) {
                return Err(AnalysisError::Validation(
                    "svelte:head can only appear at the top level of your component".to_string(),
                ));
            }
        }
        "svelte:body" | "svelte:window" | "svelte:document" => {
            // These can only appear at the top level
            if context.path.iter().any(|node| {
                matches!(
                    node,
                    crate::ast::template::TemplateNode::RegularElement(_)
                        | crate::ast::template::TemplateNode::Component(_)
                )
            }) {
                return Err(AnalysisError::Validation(format!(
                    "{} can only appear at the top level of your component",
                    name
                )));
            }
        }
        "svelte:self" => {
            // svelte:self must be inside a conditional or loop
            let in_conditional_or_loop = context.path.iter().any(|node| {
                matches!(
                    node,
                    crate::ast::template::TemplateNode::IfBlock(_)
                        | crate::ast::template::TemplateNode::EachBlock(_)
                        | crate::ast::template::TemplateNode::AwaitBlock(_)
                        | crate::ast::template::TemplateNode::SnippetBlock(_)
                )
            });

            if !in_conditional_or_loop {
                return Err(AnalysisError::Validation(
                    "svelte:self can only be used inside an if block, each block, await block, or snippet"
                        .to_string(),
                ));
            }
        }
        _ => {}
    }

    Ok(())
}

/// Get the allowed attributes for a special element.
pub fn get_allowed_attributes(name: &str) -> &'static [&'static str] {
    match name {
        "svelte:head" => &[],
        "svelte:body" => &["on:", "use:"],
        "svelte:window" => &["on:", "bind:"],
        "svelte:document" => &["on:", "bind:"],
        "svelte:fragment" => &["slot"],
        "svelte:self" => &[], // Accepts all props like a component
        "svelte:component" => &["this"],
        "svelte:element" => &["this"],
        "svelte:options" => &[
            "runes",
            "namespace",
            "customElement",
            "css",
            "immutable",
            "accessors",
        ],
        "svelte:boundary" => &["onerror", "failed"],
        _ => &[],
    }
}
