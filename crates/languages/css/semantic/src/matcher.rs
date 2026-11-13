//! Selector matching against an element model owned by the embedding language.

use rsvelte_stylesheet_syntax::syntax_tree::{
    AttributeOperator, Combinator, ComplexSelector, RelativeSelector, RuleIdentifier, Simple,
};

mod global;
use global::is_outer_global;
pub use global::{is_explicitly_global, is_global, is_unscoped_pseudo_class};

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

/// Whether `selector` can select `el` (a [`Match::Maybe`] anywhere counts as yes).
pub fn matches<E: Element>(source_text: &str, selector: &ComplexSelector, el: E) -> bool {
    matches_with(source_text, selector, el, &mut |_, _| {}, &mut |_| {})
}

pub fn matches_with<
    E: Element,
    S: FnMut(E, Option<&RelativeSelector>) + ?Sized,
    U: FnMut(u32) + ?Sized,
>(
    source_text: &str,
    selector: &ComplexSelector,
    el: E,
    scoped: &mut S,
    used: &mut U,
) -> bool {
    let matched = match_from(source_text, &selector.parts, el, scoped, used, None, true);
    if matched {
        used(selector.id);
    }
    matched
}

fn match_from<
    E: Element,
    S: FnMut(E, Option<&RelativeSelector>) + ?Sized,
    U: FnMut(u32) + ?Sized,
>(
    source_text: &str,
    parts: &[RelativeSelector],
    el: E,
    scoped: &mut S,
    used: &mut U,
    boundary: Option<E>,
    trailing: bool,
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
    // Svelte drops the trailing global compounds before it matches, so the element meets the
    // compound before them.
    if trailing && is_global(source_text, last) {
        if last
            .simple
            .iter()
            .any(|s| s.is_pseudo(source_text, &["host", "root"]))
        {
            return false;
        }
        return rest.is_empty() || match_from(source_text, rest, el, scoped, used, boundary, true);
    }
    let matched = if is_global(source_text, last) {
        global_compound(source_text, last, el, scoped, used)
    } else {
        compound(source_text, last, el)
    };
    if matched == Match::No {
        return false;
    }
    if rest.is_empty() {
        if !fits_before_it(last, el, boundary, scoped) {
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
            // A parent must match what a `:global(...)` holds, as a sibling must.
            let mut found = false;
            for parent in el.parents().filter(|&p| {
                rest.last()
                    .is_none_or(|relative| global_arguments_match(source_text, relative, p))
            }) {
                found |= match_from(source_text, rest, parent, scoped, used, boundary, false);
            }
            found || el.parent().is_none() && rest.iter().all(|r| is_global(source_text, r))
        }
        Combinator::Descendant => {
            let mut found = false;
            for parent in el.ancestors() {
                if !boundary.is_some_and(|at| parent.same(at)) {
                    found |= match_from(source_text, rest, parent, scoped, used, boundary, false);
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
        // Table layout decides a cell's column, so Svelte matches it without the column's selector.
        Combinator::Column => true,
        Combinator::NextSibling | Combinator::SubsequentSibling => {
            let mut found = false;
            for sibling in el.previous_siblings(last.combinator == Some(Combinator::NextSibling)) {
                if rest
                    .last()
                    .is_none_or(|relative| global_arguments_match(source_text, relative, sibling))
                {
                    found |= match_from(source_text, rest, sibling, scoped, used, boundary, false);
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

/// Whether what comes before the first compound fits: the `:has(...)` subject it is relative to,
/// or the parent rule its implicit `&` stands for.
fn fits_before_it<E: Element, S: FnMut(E, Option<&RelativeSelector>) + ?Sized>(
    first: &RelativeSelector,
    el: E,
    boundary: Option<E>,
    scoped: &mut S,
) -> bool {
    if first.combinator == Some(Combinator::Child)
        && boundary.is_some_and(|boundary| !el.parents().any(|parent| parent.same(boundary)))
    {
        return false;
    }
    if let Some(parent) = first.parent_rule
        && first.implicit_parent
        && !matches_parent(el, parent, first.combinator, scoped)
    {
        return false;
    }
    if let Some(anchor) = boundary
        && matches!(
            first.combinator,
            Some(Combinator::NextSibling | Combinator::SubsequentSibling)
        )
        && !el
            .previous_siblings(first.combinator == Some(Combinator::NextSibling))
            .any(|at| at.same(anchor))
    {
        return false;
    }
    true
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

/// Whether the parent rule matches where Svelte's implicit `&` puts it, scoping each element it
/// matches there.
fn matches_parent<E: Element, S: FnMut(E, Option<&RelativeSelector>) + ?Sized>(
    element: E,
    rule: RuleIdentifier,
    combinator: Option<Combinator>,
    scoped: &mut S,
) -> bool {
    let combinator = combinator.unwrap_or(Combinator::Descendant);
    let mut matched = false;
    let mut visit = |candidate: E| {
        if candidate.nesting(rule) != Match::No {
            scoped(candidate, None);
            matched = true;
        }
    };
    match combinator {
        Combinator::Descendant => element.ancestors().for_each(&mut visit),
        Combinator::Child => element.parents().for_each(&mut visit),
        Combinator::NextSibling | Combinator::SubsequentSibling => element
            .previous_siblings(combinator == Combinator::NextSibling)
            .for_each(&mut visit),
        Combinator::Column => return true,
    }
    // A parent of only global selectors matches outside the component too.
    matched || element.nesting(rule) == Match::Maybe
}

/// A global compound before the last local one, which Svelte matches against the element: a lone
/// `:global(...)` through its argument, a `:root` or `:host` never, anything else always.
fn global_compound<
    E: Element,
    S: FnMut(E, Option<&RelativeSelector>) + ?Sized,
    U: FnMut(u32) + ?Sized,
>(
    source_text: &str,
    rel: &RelativeSelector,
    el: E,
    scoped: &mut S,
    used: &mut U,
) -> Match {
    if rel
        .simple
        .iter()
        .any(|s| s.is_pseudo(source_text, &["host", "root"]))
    {
        return Match::No;
    }
    let first = rel.simple.first();
    if let Simple::PseudoClass {
        arguments: Some(_),
        selectors,
        ..
    } = first
        && rel.simple.len() == 1
        && first.is_pseudo(source_text, &["global"])
    {
        let matched = selectors
            .first()
            .is_some_and(|selector| matches_with(source_text, selector, el, scoped, used));
        return if matched { Match::Yes } else { Match::No };
    }
    Match::Yes
}

/// The selectors of a compound that Svelte tests against an element: only the `:has(...)` of a
/// compound that holds `:root`.
pub fn tested<'a>(
    source_text: &'a str,
    rel: &'a RelativeSelector,
) -> impl Iterator<Item = &'a Simple> {
    let root = rel
        .simple
        .iter()
        .any(|s| s.is_pseudo(source_text, &["root"]));
    rel.simple
        .iter()
        .filter(move |s| !root || s.is_pseudo(source_text, &["has"]))
}

fn compound<E: Element>(source_text: &str, rel: &RelativeSelector, el: E) -> Match {
    let mut result = Match::Yes;
    for s in tested(source_text, rel) {
        let m = match s {
            Simple::NamespacedType { name, .. } if el.text(source_text, *name) == "*" => Match::Yes,
            Simple::Type(name) | Simple::NamespacedType { name, .. } => match el.tag_name() {
                Some(tag) if tag.eq_ignore_ascii_case(el.text(source_text, *name)) => Match::Yes,
                Some(_) => Match::No,
                None => Match::Maybe,
            },
            Simple::Universal(_) | Simple::Nth(_) => Match::Yes,
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
            // No element of a component is the shadow host.
            Simple::PseudoClass { name, .. } if el.text(source_text, *name) == "host" => Match::No,
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

fn mark<E: Element, S: FnMut(E, Option<&RelativeSelector>) + ?Sized, U: FnMut(u32) + ?Sized>(
    source: &str,
    relative: &RelativeSelector,
    element: E,
    scoped: &mut S,
    used: &mut U,
) {
    // Svelte scopes every element a compound matches, and the compound unless it is outer global.
    scoped(
        element,
        (!is_outer_global(source, relative)).then_some(relative),
    );
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
                // Svelte cannot tell whether a `:not` of more than one compound matches, so it
                // scopes the compounds before its trailing `:global`s, the element and each
                // element around it.
                "not" => {
                    for selector in selectors.iter().filter(|s| s.parts.len() > 1) {
                        used(selector.id);
                        let kept = selector
                            .parts
                            .iter()
                            .rposition(|part| {
                                !is_global(source, part)
                                    && !part.simple.first().is_global_block(source)
                            })
                            .map_or(0, |last| last + 1);
                        for part in &selector.parts[..kept] {
                            for at in std::iter::successors(Some(element), E::parent) {
                                scoped(at, Some(part));
                            }
                        }
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

fn has<E: Element, S: FnMut(E, Option<&RelativeSelector>) + ?Sized, U: FnMut(u32) + ?Sized>(
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
            let matched = match_from(
                source,
                &selector.parts,
                at,
                scoped,
                used,
                Some(element),
                true,
            );
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

fn has_descendants<
    E: Element,
    S: FnMut(E, Option<&RelativeSelector>) + ?Sized,
    U: FnMut(u32) + ?Sized,
>(
    source: &str,
    selector: &ComplexSelector,
    element: E,
    boundary: E,
    scoped: &mut S,
    used: &mut U,
) -> bool {
    let mut found = false;
    for at in element.descendants() {
        let matched = match_from(
            source,
            &selector.parts,
            at,
            scoped,
            used,
            Some(boundary),
            true,
        );
        if matched {
            used(selector.id);
        }
        found |= matched;
    }
    found
}
