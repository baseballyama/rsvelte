//! Where svelte2tsx's `transform` of a start tag leaves the text it generates there, which is
//! where svelte-check reports a finding on that text: the source ranges it moves out of the tag,
//! and the runs between them it removes and writes as one space.

use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Attribute, AttributeKind, AttributeValue, Part, Range};
use rsvelte_typescript_tree::node_span;

use super::Builder;
use super::element::is_dynamic;

/// The moves of one start tag, `(start, end)` in source order, before `transform` extends them.
pub(super) struct StartTag<M> {
    moves: M,
    /// The tag's `<`.
    start: u32,
    /// Where `transform` stops: after the tag's `>`.
    end: u32,
    /// Whether whitespace follows the tag name, which svelte2tsx removes first.
    moves_runs: bool,
}

impl<M: Iterator<Item = (u32, u32)> + Clone> StartTag<M> {
    /// svelte2tsx's `transform` extends a move over the character after it, which the text it
    /// writes next overwrites, unless that is the tag's last character or another move starts
    /// there.
    pub(super) fn extended(&self, end: u32) -> u32 {
        self.extended_unless(end, self.moves.clone().any(|(start, _)| start == end))
    }

    const fn extended_unless(&self, end: u32, moved: bool) -> u32 {
        if end + 1 < self.end && !moved {
            end + 1
        } else {
            end
        }
    }

    /// The offset of the source character the last character of a move ending at `end` maps to.
    pub(super) fn last_character(&self, end: u32) -> u32 {
        self.extended(end) - 1
    }

    /// Where each run `transform` removes after a move starts, and the move it ends at, if any.
    fn runs(&self) -> impl Iterator<Item = (u32, Option<u32>)> {
        let mut moves = self.moves.clone().peekable();
        std::iter::from_fn(move || {
            let (_, end) = moves.next()?;
            let next = moves.peek().map(|&(start, _)| start);
            Some((self.extended_unless(end, next == Some(end)), next))
        })
    }

    /// Where text appended after the moves maps: the last space a removed run is written as,
    /// of those `transform` moves after the text it generates. With whitespace after the tag
    /// name, it moves the space of each run between two moves but the `<`'s, and of the run after
    /// the last move, less the character it deletes, when that leaves more than one.
    pub(super) fn last_space(&self) -> Option<u32> {
        if !self.moves_runs {
            return None;
        }
        let mut space = None;
        for (removed, next) in self.runs() {
            match next {
                Some(start) if removed < start && start < self.end => space = Some(removed),
                None if removed + 2 < self.end => space = Some(removed + 1),
                _ => {}
            }
        }
        space
    }

    /// Where text written before the moves maps: the last removed run `transform` leaves in
    /// place, the `<`'s at least. Without whitespace after the tag name it leaves each run, and
    /// with it only the run after the last move when one character is left of it.
    pub(super) fn unmoved_space(&self) -> u32 {
        let mut space = self.start;
        for (removed, next) in self.runs() {
            match next {
                Some(start) if !self.moves_runs && removed < start && start < self.end => {
                    space = removed;
                }
                None if removed + 1 < self.end && !(self.moves_runs && removed + 2 < self.end) => {
                    space = removed + 1;
                }
                _ => {}
            }
        }
        space
    }
}

impl Builder<'_> {
    /// The moves of a start tag at `tag` with the tag name `name`, as svelte2tsx writes a
    /// component's: its name, the whitespace after it, and the ranges each attribute copies.
    pub(super) fn start_tag(
        &self,
        name: Span,
        tag: Span,
        attributes: Range,
    ) -> StartTag<impl Iterator<Item = (u32, u32)> + Clone + '_> {
        let after_name = name.end_offset as usize;
        let moves_runs = self.source[after_name..].starts_with(is_ecmascript_whitespace);
        let whitespace = moves_runs.then_some((name.end_offset, name.end_offset + 1));
        let dynamic = is_dynamic(name.text(self.source));
        let attributes = self.component.attributes(attributes);
        let moves = std::iter::once((name.start_offset, name.end_offset))
            .chain(whitespace)
            .chain((0..attributes.len()).flat_map(move |index| {
                self.attribute_moves(attributes, index, name.end_offset, dynamic)
            }))
            // `transform` skips an empty range.
            .filter(|(start, end)| start < end);
        StartTag {
            moves,
            start: tag.start_offset,
            end: tag.end_offset,
            moves_runs,
        }
    }

    /// The ranges svelte2tsx copies of the attribute at `index`, with the comments around it.
    fn attribute_moves<'a>(
        &'a self,
        attributes: &'a [Attribute],
        index: usize,
        name_end: u32,
        dynamic: bool,
    ) -> impl Iterator<Item = (u32, u32)> + Clone + 'a {
        let after = index
            .checked_sub(1)
            .map_or(name_end, |previous| attributes[previous].span.end_offset);
        let attribute = &attributes[index];
        // `<svelte:component this={…}>` is an expression to svelte2tsx, and no attribute, and it
        // reads the slot a component's child fills before any comment.
        let bare = self.is_this(attribute, dynamic) || self.filler_slot(attribute).is_some();
        let (leading, trailing): (&[Span], &[Span]) = if bare {
            (&[], &[])
        } else {
            self.attached_comments(attribute, after, index + 1 == attributes.len())
        };
        let (name, value) = self.copied(attribute, dynamic);
        (leading.iter().copied())
            .chain(name)
            .chain(value)
            .chain(trailing.iter().copied())
            .map(|span| (span.start_offset, span.end_offset))
    }

    fn is_this(&self, attribute: &Attribute, dynamic: bool) -> bool {
        dynamic
            && attribute.kind == AttributeKind::Attribute
            && attribute.name.text(self.source) == "this"
    }

    /// The name in a `slot` attribute that fills a slot of the parent component.
    pub(super) fn filler_slot(&self, attribute: &Attribute) -> Option<Span> {
        (self.component_parent)
            .then(|| self.slot_text(attribute))
            .flatten()
    }

    /// The ranges svelte2tsx copies of `attribute`: its name or the directive's, and its value.
    fn copied(&self, attribute: &Attribute, dynamic: bool) -> (Option<Span>, Option<Span>) {
        if let Some(slot) = self.filler_slot(attribute) {
            return (None, Some(slot));
        }
        let value = match attribute.value {
            AttributeValue::Parts(parts) => self.copied_value(self.component.parts(parts)),
            AttributeValue::True => None,
        };
        let directive = attribute.directive_name(&self.component.modifiers);
        match attribute.kind {
            AttributeKind::Spread => {
                let Span {
                    start_offset,
                    end_offset,
                } = attribute.span;
                (Some(Span::new(start_offset + 1, end_offset - 1)), None)
            }
            AttributeKind::Attribute if attribute.shorthand || self.is_this(attribute, dynamic) => {
                (None, value)
            }
            AttributeKind::Attribute => (Some(attribute.name), value),
            // `bind:this` assigns the instance to its expression.
            AttributeKind::Bind if directive.is_some_and(|n| n.text(self.source) == "this") => {
                (None, value)
            }
            AttributeKind::Bind if attribute.shorthand => (directive, None),
            AttributeKind::Bind | AttributeKind::On | AttributeKind::Let => (directive, value),
            AttributeKind::Attach => (None, value),
            _ => (None, None),
        }
    }

    /// The one range svelte2tsx copies of a value: from its first part to its last, whole but
    /// for a lone expression's braces, and the quotes of an empty one.
    fn copied_value(&self, parts: &[Part]) -> Option<Span> {
        let bounds = |part: &Part| match *part {
            Part::Text(text) => text,
            Part::Expression { span, .. } => span,
        };
        match parts {
            [] => None,
            [Part::Text(text)] if text.start_offset == text.end_offset => {
                Some(Span::new(text.start_offset - 1, text.end_offset + 1))
            }
            [Part::Expression { expression, .. }] => {
                let expression = self.component.javascript.get_expression(*expression);
                Some(node_span(expression))
            }
            [first, .., last] => Some(Span::new(
                bounds(first).start_offset,
                bounds(last).end_offset,
            )),
            [Part::Text(text)] => Some(*text),
        }
    }

    /// The comments svelte2tsx copies with `attribute`, which starts after `after`: those before
    /// it, and when it is the last, those between it and the tag's `>` with only whitespace and a
    /// `/` around them. A shorthand copies none before it, and `class:` and `style:` none at all.
    fn attached_comments(
        &self,
        attribute: &Attribute,
        after: u32,
        last: bool,
    ) -> (&[Span], &[Span]) {
        let comments = &self.component.tag_comments;
        if comments.is_empty()
            || matches!(attribute.kind, AttributeKind::Class | AttributeKind::Style)
        {
            return (&[], &[]);
        }
        let starts_before = |at: u32| comments.partition_point(|comment| comment.start_offset < at);
        let end = attribute.span.end_offset;
        let before = if attribute.kind == AttributeKind::Attribute && attribute.shorthand {
            after
        } else {
            attribute.span.start_offset
        };
        let leading = &comments[starts_before(after)..starts_before(before)];
        let Some(tag_end) = (last)
            .then(|| self.source[end as usize..].find('>'))
            .flatten()
            .map(|at| end + at as u32)
        else {
            return (leading, &[]);
        };
        let space = |from: u32, to: u32| {
            self.source[from as usize..to as usize].trim_matches(is_ecmascript_whitespace)
        };
        let after_attribute = &comments[starts_before(end)..];
        let mut search = end;
        let count = (after_attribute.iter())
            .take_while(|comment| {
                let attached =
                    comment.end_offset <= tag_end && space(search, comment.start_offset).is_empty();
                if attached {
                    search = comment.end_offset;
                }
                attached
            })
            .count();
        let rest = space(search, tag_end);
        let closes = rest.is_empty()
            || rest
                .strip_prefix('/')
                .is_some_and(|rest| rest.trim_matches(is_ecmascript_whitespace).is_empty());
        (
            leading,
            if closes {
                &after_attribute[..count]
            } else {
                &[]
            },
        )
    }

    /// Where svelte-check reports a finding on what the last `let:` of a start tag destructures:
    /// at the last character svelte2tsx copies of it. After a comment that ends the tag
    /// svelte-check drops the finding, as the line svelte2tsx writes has no mapping.
    pub(super) fn last_let_read(&self, name: Span, tag: Span, attributes: Range) -> Option<u32> {
        let attribute = (self.component.attributes(attributes).iter())
            .rfind(|attribute| attribute.kind == AttributeKind::Let)?;
        let (directive, value) = self.copied(attribute, false);
        let end = value.or(directive)?.end_offset;
        Some(self.start_tag(name, tag, attributes).last_character(end))
    }

    /// Where svelte-check reports a finding on a filler's read of its slot: at the text
    /// svelte2tsx writes before the slot's name, after the last `let:`'s `read` or else before
    /// the moves.
    pub(super) fn slot_read(
        &self,
        name: Span,
        tag: Span,
        attributes: Range,
        read: Option<u32>,
    ) -> u32 {
        read.unwrap_or_else(|| self.start_tag(name, tag, attributes).unmoved_space())
    }
}

#[cfg(test)]
mod tests;
