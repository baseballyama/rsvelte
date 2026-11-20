//! Upstream's transition checks of an element.

use rsvelte_svelte_semantic::warnings::TransitionDirections;

use super::{Attribute, AttributeValue, Diagnostic};

/// Upstream's `transition_duplicate` and `transition_conflict`: the first, in attribute order.
pub(super) fn check(attributes: &[Attribute]) -> Result<(), Diagnostic> {
    let mut directions = TransitionDirections::default();
    for a in attributes {
        if let AttributeValue::Transition { intro, outro, .. } = a.value
            && let Some(error) = directions.visit(intro, outro, a.span)
        {
            return Err(error);
        }
    }
    Ok(())
}
