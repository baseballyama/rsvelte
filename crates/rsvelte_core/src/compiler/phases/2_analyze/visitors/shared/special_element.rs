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

/// Reject every attribute `<svelte:window>` / `<svelte:document>` / `<svelte:body>`
/// cannot carry, in one pass over the whole list.
///
/// Upstream runs this loop to completion before `context.next()` reaches any
/// individual directive, so "this element takes no arbitrary attributes" always
/// wins over "this `bind:` has no valid target".
pub fn reject_illegal_attributes(
    attributes: &[crate::ast::template::Attribute],
    error: impl Fn(u32, u32) -> AnalysisError,
) -> Result<(), AnalysisError> {
    for attr in attributes {
        match attr {
            crate::ast::template::Attribute::SpreadAttribute(spread) => {
                return Err(error(spread.start, spread.end));
            }
            crate::ast::template::Attribute::Attribute(a)
                if !super::utils::is_event_attribute(a) =>
            {
                return Err(error(a.start, a.end));
            }
            _ => {}
        }
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
