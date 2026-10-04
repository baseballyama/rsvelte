//! Selector matching against an element model owned by the embedding language.

use crate::syntax_tree::{
    AttributeOperator, Combinator, ComplexSelector, RelativeSelector, RuleIdentifier, Simple,
};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Match {
    Yes,
    No,
    /// Depends on runtime values (a dynamic `class`, an unknown tag); counts as a match.
    Maybe,
}

pub trait Element: Copy {
    fn text<'a>(
        &'a self,
        source: &'a str,
        span: rsvelte_kernel::source::positions::Span,
    ) -> &'a str {
        span.text(source)
    }
    fn same(&self, other: Self) -> bool;
    fn unknown_sibling(&self, _adjacent: bool) -> bool {
        false
    }
    fn nesting(&self, _rule: RuleIdentifier) -> Match {
        Match::Maybe
    }
    /// `None` when the tag is only known at runtime.
    fn tag_name(&self) -> Option<&str>;
    fn class(&self, name: &str) -> Match;
    fn identifier(&self, name: &str) -> Match;
    fn attribute(&self, name: &str) -> Match;
    fn attribute_matches(
        &self,
        name: &str,
        _operator: AttributeOperator,
        _value: &str,
        _insensitive: Option<bool>,
    ) -> Match {
        match self.attribute(name) {
            Match::No => Match::No,
            _ => Match::Maybe,
        }
    }
    fn parent(&self) -> Option<Self>;
    fn parents(&self) -> impl Iterator<Item = Self> {
        self.parent().into_iter()
    }
    fn ancestors(&self) -> impl Iterator<Item = Self> {
        let mut at = self.parent();
        std::iter::from_fn(move || {
            let parent = at?;
            at = parent.parent();
            Some(parent)
        })
    }
    fn descendants(&self) -> impl Iterator<Item = Self> {
        let mut pending: Vec<_> = self.children().collect();
        std::iter::from_fn(move || {
            let at = pending.pop()?;
            pending.extend(at.children());
            Some(at)
        })
    }
    fn previous_sibling(&self) -> Option<Self> {
        None
    }
    fn previous_siblings(&self, adjacent: bool) -> impl Iterator<Item = Self> {
        let mut current = self.previous_sibling();
        std::iter::from_fn(move || {
            let element = current?;
            current = if adjacent {
                None
            } else {
                element.previous_sibling()
            };
            Some(element)
        })
    }
    fn first_child(&self) -> Option<Self> {
        None
    }
    fn next_sibling(&self) -> Option<Self> {
        None
    }
    fn children(&self) -> impl Iterator<Item = Self> {
        let mut at = self.first_child();
        std::iter::from_fn(move || {
            let element = at?;
            at = element.next_sibling();
            Some(element)
        })
    }
    fn following_siblings(&self, adjacent: bool) -> impl Iterator<Item = Self> {
        let mut at = self.next_sibling();
        std::iter::from_fn(move || {
            let element = at?;
            at = if adjacent {
                None
            } else {
                element.next_sibling()
            };
            Some(element)
        })
    }
}

/// `:global(...)` or `:global` as the whole compound.
#[must_use]
pub fn is_global(source_text: &str, rel: &RelativeSelector) -> bool {
    if rel.global {
        return true;
    }
    if let Simple::PseudoElement { name, .. } = rel.simple.first()
        && name.text(source_text).starts_with("view-transition")
    {
        return true;
    }
    (rel.simple
        .first()
        .is_pseudo(source_text, &["global", "host"])
        || rel
            .simple
            .iter()
            .any(|simple| simple.is_pseudo(source_text, &["root"])))
        && !rel.simple.iter().any(|simple| {
            if simple.is_pseudo(source_text, &["is", "where", "has"]) {
                return true;
            }
            match simple {
                Simple::PseudoClass { selectors, .. }
                    if simple.is_pseudo(source_text, &["not"]) =>
                {
                    selectors.iter().any(|selector| {
                        selector.parts.iter().any(|part| {
                            part.simple.iter().any(|argument| {
                                !matches!(
                                    argument,
                                    Simple::PseudoClass { .. } | Simple::PseudoElement { .. }
                                )
                            })
                        })
                    })
                }
                _ => false,
            }
        })
}

/// Whether `selector` can select `el` (a [`Match::Maybe`] anywhere counts as yes).
pub fn matches<E: Element>(source_text: &str, selector: &ComplexSelector, el: E) -> bool {
    matches_with(source_text, selector, el, &mut |_, _| {}, &mut |_| {})
}

pub fn matches_with<E: Element, S: FnMut(E, &RelativeSelector) + ?Sized, U: FnMut(u32) + ?Sized>(
    source_text: &str,
    selector: &ComplexSelector,
    el: E,
    scoped: &mut S,
    used: &mut U,
) -> bool {
    let matched = match_from(source_text, &selector.parts, el, scoped, used, None);
    if matched {
        used(selector.id);
    }
    matched
}

fn match_from<E: Element, S: FnMut(E, &RelativeSelector) + ?Sized, U: FnMut(u32) + ?Sized>(
    source_text: &str,
    parts: &[RelativeSelector],
    el: E,
    scoped: &mut S,
    used: &mut U,
    boundary: Option<E>,
) -> bool {
    let Some((last, rest)) = parts.split_last() else {
        return true;
    };
    if boundary.is_some_and(|boundary| el.same(boundary))
        && !matches!(
            parts.first().and_then(|part| part.combinator),
            Some(Combinator::NextSibling | Combinator::SubsequentSibling)
        )
        && !el.parents().any(|parent| parent.same(el))
    {
        return false;
    }
    if is_global(source_text, last) {
        if last
            .simple
            .iter()
            .any(|s| s.is_pseudo(source_text, &["host", "root"]))
        {
            return false;
        }
        return rest.is_empty() || match_from(source_text, rest, el, scoped, used, boundary);
    }
    if compound(source_text, last, el) == Match::No {
        return false;
    }
    if rest.is_empty() {
        if last.combinator == Some(Combinator::Child)
            && boundary.is_some_and(|boundary| !el.parents().any(|parent| parent.same(boundary)))
        {
            return false;
        }
        if let Some(parent) = last.parent_rule
            && last.implicit_parent
            && !matches_parent(el, parent, last.combinator)
        {
            return false;
        }
        if let Some(anchor) = boundary
            && matches!(
                last.combinator,
                Some(Combinator::NextSibling | Combinator::SubsequentSibling)
            )
            && !el
                .previous_siblings(last.combinator == Some(Combinator::NextSibling))
                .any(|at| at.same(anchor))
        {
            return false;
        }
        mark(source_text, last, el, scoped, used);
        return true;
    }
    let matched = match last
        .combinator
        .expect("every compound after the first has a combinator")
    {
        Combinator::Child => {
            el.parents()
                .any(|p| match_from(source_text, rest, p, scoped, used, boundary))
                || el.parent().is_none() && rest.iter().all(|r| is_global(source_text, r))
        }
        Combinator::Descendant => {
            let mut found = false;
            for parent in el.ancestors() {
                if !boundary.is_some_and(|at| parent.same(at)) {
                    found |= match_from(source_text, rest, parent, scoped, used, boundary);
                }
            }
            found
                || rest.iter().all(|r| {
                    is_global(source_text, r)
                        || r.simple.iter().any(|s| matches!(s, Simple::Nesting(_)))
                            && r.parent_rule
                                .is_some_and(|rule| el.nesting(rule) == Match::Maybe)
                })
        }
        Combinator::NextSibling | Combinator::SubsequentSibling => {
            let mut found = false;
            for sibling in el.previous_siblings(last.combinator == Some(Combinator::NextSibling)) {
                if rest
                    .last()
                    .is_none_or(|relative| global_arguments_match(source_text, relative, sibling))
                {
                    found |= match_from(source_text, rest, sibling, scoped, used, boundary);
                }
            }
            found
                || ((el.parent().is_none()
                    || el.unknown_sibling(last.combinator == Some(Combinator::NextSibling)))
                    && rest.iter().all(|r| is_global(source_text, r)))
        }
    };
    if matched {
        mark(source_text, last, el, scoped, used);
    }
    matched
}

fn global_arguments_match<E: Element>(
    source: &str,
    relative: &RelativeSelector,
    element: E,
) -> bool {
    relative.simple.iter().all(|simple| match simple {
        Simple::PseudoClass { selectors, .. } if simple.is_pseudo(source, &["global"]) => {
            selectors.is_empty()
                || selectors
                    .iter()
                    .any(|selector| matches(source, selector, element))
        }
        _ => true,
    })
}

fn matches_parent<E: Element>(
    element: E,
    rule: RuleIdentifier,
    combinator: Option<Combinator>,
) -> bool {
    if element.nesting(rule) == Match::Maybe {
        return true;
    }
    match combinator.unwrap_or(Combinator::Descendant) {
        Combinator::Descendant => element
            .ancestors()
            .any(|parent| parent.nesting(rule) != Match::No),
        Combinator::Child => element
            .parents()
            .any(|parent| parent.nesting(rule) != Match::No),
        Combinator::NextSibling | Combinator::SubsequentSibling => element
            .previous_siblings(combinator == Some(Combinator::NextSibling))
            .any(|s| s.nesting(rule) != Match::No),
    }
}

fn compound<E: Element>(source_text: &str, rel: &RelativeSelector, el: E) -> Match {
    let mut result = Match::Yes;
    for s in &rel.simple {
        let m = match s {
            Simple::NamespacedType { name, .. } if el.text(source_text, *name) == "*" => Match::Yes,
            Simple::Type(name) | Simple::NamespacedType { name, .. } => match el.tag_name() {
                Some(tag) if tag.eq_ignore_ascii_case(el.text(source_text, *name)) => Match::Yes,
                Some(_) => Match::No,
                None => Match::Maybe,
            },
            Simple::Universal(_) => Match::Yes,
            Simple::Nesting(_) => rel
                .parent_rule
                .map_or(Match::Maybe, |rule| el.nesting(rule)),
            Simple::Class { name, .. } => el.class(el.text(source_text, *name)),
            Simple::Identifier { name, .. } => el.identifier(el.text(source_text, *name)),
            Simple::Attribute {
                name,
                matcher,
                insensitive,
                ..
            } => match matcher {
                Some((operator, value)) => el.attribute_matches(
                    el.text(source_text, *name),
                    *operator,
                    el.text(source_text, *value),
                    *insensitive,
                ),
                None => el.attribute(el.text(source_text, *name)),
            },
            Simple::PseudoClass {
                name, selectors, ..
            } if matches!(el.text(source_text, *name), "is" | "where") => {
                if selectors
                    .iter()
                    .any(|selector| matches(source_text, selector, el) || selector.parts.len() > 1)
                {
                    Match::Maybe
                } else {
                    Match::No
                }
            }
            Simple::PseudoClass {
                name, selectors, ..
            } if el.text(source_text, *name) == "has" => {
                let external = rel
                    .simple
                    .first()
                    .is_pseudo(source_text, &["global", "root", "host"])
                    || rel
                        .parent_rule
                        .is_some_and(|rule| el.nesting(rule) == Match::Maybe);
                if selectors.iter().any(|selector| {
                    (external && matches(source_text, selector, el))
                        || has(source_text, selector, el, &mut |_, _| {}, &mut |_| {})
                }) {
                    Match::Maybe
                } else {
                    Match::No
                }
            }
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

fn mark<E: Element, S: FnMut(E, &RelativeSelector) + ?Sized, U: FnMut(u32) + ?Sized>(
    source: &str,
    relative: &RelativeSelector,
    element: E,
    scoped: &mut S,
    used: &mut U,
) {
    if !relative
        .simple
        .first()
        .is_pseudo(source, &["global", "root", "host"])
    {
        scoped(element, relative);
    }
    for simple in &relative.simple {
        if let Simple::PseudoClass {
            name, selectors, ..
        } = simple
        {
            match name.text(source) {
                "is" | "where" => {
                    for selector in selectors {
                        if !matches_with(source, selector, element, scoped, used)
                            && selector.parts.len() > 1
                        {
                            used(selector.id);
                            for relative in &selector.parts {
                                mark(source, relative, element, scoped, used);
                            }
                        }
                    }
                }
                "not" => {
                    for selector in selectors.iter().filter(|s| s.parts.len() > 1) {
                        matches_with(source, selector, element, scoped, used);
                    }
                }
                "has" => {
                    for selector in selectors {
                        if relative
                            .simple
                            .first()
                            .is_pseudo(source, &["global", "root", "host"])
                            || relative
                                .parent_rule
                                .is_some_and(|rule| element.nesting(rule) == Match::Maybe)
                        {
                            matches_with(source, selector, element, scoped, used);
                        }
                        has(source, selector, element, scoped, used);
                    }
                }
                _ => {}
            }
        }
    }
}

fn has<E: Element, S: FnMut(E, &RelativeSelector) + ?Sized, U: FnMut(u32) + ?Sized>(
    source: &str,
    selector: &ComplexSelector,
    element: E,
    scoped: &mut S,
    used: &mut U,
) -> bool {
    let leading = selector.parts.first().and_then(|p| p.combinator);
    if matches!(
        leading,
        Some(Combinator::NextSibling | Combinator::SubsequentSibling)
    ) {
        let mut found = false;
        for at in element.following_siblings(leading == Some(Combinator::NextSibling)) {
            let matched = match_from(source, &selector.parts, at, scoped, used, Some(element));
            if matched {
                used(selector.id);
            }
            found |= matched;
            found |= has_descendants(source, selector, at, element, scoped, used);
        }
        return found;
    }
    has_descendants(source, selector, element, element, scoped, used)
}

fn has_descendants<E: Element, S: FnMut(E, &RelativeSelector) + ?Sized, U: FnMut(u32) + ?Sized>(
    source: &str,
    selector: &ComplexSelector,
    element: E,
    boundary: E,
    scoped: &mut S,
    used: &mut U,
) -> bool {
    let mut found = false;
    for at in element.descendants() {
        let matched = match_from(source, &selector.parts, at, scoped, used, Some(boundary));
        if matched {
            used(selector.id);
        }
        found |= matched;
    }
    found
}
