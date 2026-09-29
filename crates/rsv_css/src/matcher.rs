//! Selector matching against an element model owned by the embedding language.

use crate::ast::{Combinator, ComplexSelector, RelativeSelector, Simple};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Match {
    Yes,
    No,
    /// Depends on runtime values (a dynamic `class`, an unknown tag); counts as a match.
    Maybe,
}

pub trait Element: Copy {
    /// `None` when the tag is only known at runtime.
    fn tag_name(&self) -> Option<&str>;
    fn class(&self, name: &str) -> Match;
    fn id(&self, name: &str) -> Match;
    fn attribute(&self, name: &str) -> Match;
    fn parent(&self) -> Option<Self>;
}

/// `:global(...)` or `:global` as the whole compound.
#[must_use]
pub fn is_global(src: &str, rel: &RelativeSelector) -> bool {
    matches!(rel.simple.first(), Some(Simple::PseudoClass { name, .. }) if name.text(src) == "global")
}

/// Whether `selector` can select `el` (a [`Match::Maybe`] anywhere counts as yes).
pub fn matches<E: Element>(src: &str, selector: &ComplexSelector, el: E) -> bool {
    match_from(src, &selector.parts, el)
}

fn match_from<E: Element>(src: &str, parts: &[RelativeSelector], el: E) -> bool {
    let Some((last, rest)) = parts.split_last() else {
        return true;
    };
    if is_global(src, last) || compound(src, last, el) == Match::No {
        return is_global(src, last) && rest.is_empty();
    }
    if rest.is_empty() {
        return true;
    }
    match last
        .combinator
        .expect("every compound after the first has a combinator")
    {
        Combinator::Child => el.parent().is_some_and(|p| match_from(src, rest, p)),
        Combinator::Descendant => {
            let mut cur = el.parent();
            while let Some(p) = cur {
                if match_from(src, rest, p) {
                    return true;
                }
                cur = p.parent();
            }
            rest.iter().all(|r| is_global(src, r))
        }
        // Sibling relations are not modelled yet; assume they can hold.
        Combinator::NextSibling | Combinator::SubsequentSibling => true,
    }
}

fn compound<E: Element>(src: &str, rel: &RelativeSelector, el: E) -> Match {
    let mut result = Match::Yes;
    for s in &rel.simple {
        let m = match *s {
            Simple::Type(name) => match el.tag_name() {
                Some(tag) if tag.eq_ignore_ascii_case(name.text(src)) => Match::Yes,
                Some(_) => Match::No,
                None => Match::Maybe,
            },
            Simple::Universal(_) => Match::Yes,
            Simple::Class { name, .. } => el.class(name.text(src)),
            Simple::Id { name, .. } => el.id(name.text(src)),
            Simple::Attribute { name, .. } => el.attribute(name.text(src)),
            Simple::PseudoClass { .. } | Simple::PseudoElement { .. } => Match::Maybe,
        };
        match m {
            Match::No => return Match::No,
            Match::Maybe => result = Match::Maybe,
            Match::Yes => {}
        }
    }
    result
}
