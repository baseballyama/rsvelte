//! Special element utilities.
//!
//! Functions for handling special Svelte elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/special-element.js`.

use super::super::super::AnalysisError;
use super::super::VisitorContext;

/// Validate special element placement.
pub fn validate_special_element_placement(
    name: &str,
    context: &VisitorContext,
) -> Result<(), AnalysisError> {
    match name {
        "svelte:head"
            // svelte:head can only appear at the top level
            if context.is_inside_element_or_block() => {
                return Err(AnalysisError::validation(
                    "svelte_meta_invalid_placement",
                    "`<svelte:head>` tags cannot be inside elements or blocks",
                ));
            }
        "svelte:body" | "svelte:window" | "svelte:document"
            // These can only appear at the top level (not inside elements or blocks)
            if context.is_inside_element_or_block() => {
                return Err(AnalysisError::validation(
                    "svelte_meta_invalid_placement",
                    format!("`<{}>` tags cannot be inside elements or blocks", name),
                ));
            }
        "svelte:self"
            // svelte:self must be inside a conditional, loop, snippet, or component.
            // The official Svelte checks context.path for IfBlock, EachBlock, Component, or SnippetBlock.
            // We check block_depth (IfBlock, EachBlock, AwaitBlock, SnippetBlock) and component_depth (Component).
            if context.block_depth == 0 && context.component_depth == 0 => {
                return Err(AnalysisError::validation(
                    "svelte_self_invalid_placement",
                    "`<svelte:self>` components can only exist inside {#if}, {#each}, {#snippet} blocks or component `children` snippets",
                ));
            }
        _ => {}
    }

    Ok(())
}

/// Disallow children for specific special elements.
///
/// Corresponds to `disallow_children` in special-element.js.
///
/// Some special elements like `<svelte:body>`, `<svelte:document>`, etc.
/// cannot have children.
///
/// # Arguments
///
/// * `name` - The special element name
/// * `fragment` - The fragment containing potential children
pub fn disallow_children(
    name: &str,
    fragment: &crate::ast::template::Fragment,
) -> Result<(), AnalysisError> {
    if !fragment.nodes.is_empty() {
        return Err(super::super::super::errors::svelte_meta_invalid_content(
            name,
        ));
    }
    Ok(())
}
