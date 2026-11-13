//! Svelte's rules for which compounds a `:global` or a global-like pseudo-class leaves unscoped.

use rsvelte_stylesheet_syntax::syntax_tree::{RelativeSelector, Simple};

/// Whether a compound leaves every element it selects unscoped: Svelte's `is_global` or
/// `is_global_like`, or a compound after a `:global` block in its chain.
#[must_use]
pub fn is_global(source_text: &str, rel: &RelativeSelector) -> bool {
    rel.global || is_explicitly_global(source_text, rel) || is_global_like(source_text, rel)
}

/// Svelte's `is_global`: `:global`, or a `:global(...)` that every other selector of its compound
/// leaves unscoped, as `.x` in `:global(button).x` does not.
#[must_use]
pub fn is_explicitly_global(source_text: &str, rel: &RelativeSelector) -> bool {
    let first = rel.simple.first();
    first.is_pseudo(source_text, &["global"])
        && (matches!(
            first,
            Simple::PseudoClass {
                arguments: None,
                ..
            }
        ) || rel.simple.iter().all(|simple| {
            matches!(simple, Simple::PseudoElement { .. })
                || is_unscoped_pseudo_class(source_text, simple)
        }))
}

/// Svelte's `is_outer_global`: `:global`, or a `:global(...)` whose compound holds only
/// pseudo-classes and pseudo-elements, which may still scope what their arguments hold.
pub(super) fn is_outer_global(source_text: &str, rel: &RelativeSelector) -> bool {
    let first = rel.simple.first();
    first.is_pseudo(source_text, &["global"])
        && (matches!(
            first,
            Simple::PseudoClass {
                arguments: None,
                ..
            }
        ) || rel.simple.iter().all(|simple| {
            matches!(
                simple,
                Simple::PseudoClass { .. } | Simple::PseudoElement { .. }
            )
        }))
}

/// Svelte's `is_unscoped_pseudo_class`: a pseudo-class that does not scope its compound.
#[must_use]
pub fn is_unscoped_pseudo_class(source_text: &str, simple: &Simple) -> bool {
    let Simple::PseudoClass {
        arguments,
        selectors,
        ..
    } = simple
    else {
        return false;
    };
    let scoping = simple.is_pseudo(source_text, &["has", "is", "where"])
        || (simple.is_pseudo(source_text, &["not"])
            && arguments.is_some()
            && !selectors.iter().all(|s| s.parts.len() == 1));
    !scoping
        || arguments.is_none()
        || selectors.iter().all(|s| {
            s.parts
                .iter()
                .all(|part| is_explicitly_global(source_text, part))
        })
}

/// Svelte's `is_global_like`, without the compounds after a `:global` block.
fn is_global_like(source_text: &str, rel: &RelativeSelector) -> bool {
    let pseudo_only = rel.simple.iter().all(|simple| {
        matches!(
            simple,
            Simple::PseudoClass { .. } | Simple::PseudoElement { .. }
        )
    });
    let first = rel.simple.first();
    let unscoped_first = first.is_pseudo(source_text, &["host"])
        || matches!(first, Simple::PseudoElement { name, .. } if matches!(
            name.text(source_text),
            "view-transition"
                | "view-transition-group"
                | "view-transition-old"
                | "view-transition-new"
                | "view-transition-image-pair"
        ));
    (pseudo_only && unscoped_first)
        || (rel
            .simple
            .iter()
            .any(|s| s.is_pseudo(source_text, &["root"]))
            && !rel
                .simple
                .iter()
                .any(|s| s.is_pseudo(source_text, &["has"])))
}
