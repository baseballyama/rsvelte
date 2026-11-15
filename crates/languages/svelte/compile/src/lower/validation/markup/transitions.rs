//! Upstream's transition checks of an element.

use super::super::super::special::invalid;
use super::{Attribute, AttributeValue, Diagnostic};

/// Upstream's `transition_duplicate` and `transition_conflict`: one intro and one outro per
/// element, whatever their modifiers.
pub(super) fn check(attributes: &[Attribute]) -> Result<(), Diagnostic> {
    let kind = |intro: bool, outro: bool| match (intro, outro) {
        (true, true) => "transition",
        (true, false) => "in",
        _ => "out",
    };
    let (mut intro, mut outro) = (None, None);
    for a in attributes {
        let AttributeValue::Transition {
            intro: is_intro,
            outro: is_outro,
            ..
        } = a.value
        else {
            continue;
        };
        let existing = intro
            .filter(|_| is_intro)
            .or_else(|| outro.filter(|_| is_outro));
        if let Some((existing_intro, existing_outro)) = existing {
            let (a_kind, b_kind) = (
                kind(existing_intro, existing_outro),
                kind(is_intro, is_outro),
            );
            return if a_kind == b_kind {
                invalid(
                    "transition_duplicate",
                    &format!("Cannot use multiple `{a_kind}:` directives on a single element"),
                    a.span,
                )
            } else {
                invalid(
                    "transition_conflict",
                    &format!("Cannot use `{a_kind}:` alongside existing `{b_kind}:` directive"),
                    a.span,
                )
            };
        }
        if is_intro {
            intro = Some((is_intro, is_outro));
        }
        if is_outro {
            outro = Some((is_intro, is_outro));
        }
    }
    Ok(())
}
