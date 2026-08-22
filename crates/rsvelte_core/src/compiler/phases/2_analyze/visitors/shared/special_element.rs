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
    span: (u32, u32),
    context: &VisitorContext,
) -> Result<(), AnalysisError> {
    match name {
        "svelte:head"
            // Upstream rejects on `parent.type !== 'Root'` — the immediate parent,
            // not a depth. A counter reproduces that only for the containers its
            // own list happens to name.
            if !context.in_root_fragment => {
                return Err(AnalysisError::validation(
                    "svelte_meta_invalid_placement",
                    "`<svelte:head>` tags cannot be inside elements or blocks",
                ));
            }
        "svelte:body" | "svelte:window" | "svelte:document"
            // Same root-only rule as `svelte:head` above.
            if !context.in_root_fragment => {
                return Err(AnalysisError::validation(
                    "svelte_meta_invalid_placement",
                    format!("`<{}>` tags cannot be inside elements or blocks", name),
                ));
            }
        "svelte:self"
            // Upstream accepts exactly IfBlock / EachBlock / SnippetBlock / Component
            // as a parent, so neither `block_depth` (it counts an `{#await}`) nor
            // `component_depth` (it counts a `<svelte:component>`) can stand in.
            if context.svelte_self_parent_depth == 0 => {
                return Err(super::super::super::errors::svelte_self_invalid_placement()
                    .at(span.0, span.1));
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
