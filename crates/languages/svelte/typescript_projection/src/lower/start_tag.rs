//! Where svelte2tsx's `transform` of a start tag leaves the text it generates there, which is
//! where svelte-check reports a finding on that text: the source ranges it moves out of the tag,
//! and the runs between them it removes and writes as one space.

use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Attribute, AttributeKind, AttributeValue, Part, Range};
use rsvelte_typescript_tree::node_span;

use super::Builder;

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
        if end + 1 < self.end && !self.moves.clone().any(|(start, _)| start == end) {
            end + 1
        } else {
            end
        }
    }

    /// The offset of the source character the last character of a move ending at `end` maps to.
    pub(super) fn last_character(&self, end: u32) -> u32 {
        self.extended(end) - 1
    }

    /// Where text appended after the moves maps: the last space a removed run is written as,
    /// of those `transform` moves after the text it generates. With whitespace after the tag
    /// name, it moves the space of each run between two moves but the `<`'s, and of the run after
    /// the last move, less the character it deletes, when that leaves more than one.
    pub(super) fn last_space(&self) -> Option<u32> {
        if !self.moves_runs {
            return None;
        }
        let mut moves = self.moves.clone();
        let (_, first) = moves.next()?;
        let mut removed = self.extended(first);
        let mut space = None;
        for (start, end) in moves {
            if removed < start && start < self.end {
                space = Some(removed);
            }
            removed = self.extended(end);
        }
        if removed + 2 < self.end {
            space = Some(removed + 1);
        }
        space
    }

    /// Where text written before the moves maps: the last removed run `transform` leaves in
    /// place, the `<`'s at least. Without whitespace after the tag name it leaves each run, and
    /// with it only the run after the last move when one character is left of it.
    pub(super) fn unmoved_space(&self) -> u32 {
        let mut moves = self.moves.clone();
        let Some((_, first)) = moves.next() else {
            return self.start;
        };
        let mut removed = self.extended(first);
        let mut space = self.start;
        for (start, end) in moves {
            if !self.moves_runs && removed < start && start < self.end {
                space = removed;
            }
            removed = self.extended(end);
        }
        if removed + 1 < self.end && !(self.moves_runs && removed + 2 < self.end) {
            space = removed + 1;
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
        let moves = std::iter::once((name.start_offset, name.end_offset))
            .chain(whitespace)
            .chain(
                (self.component.attributes(attributes).iter())
                    .flat_map(|attribute| self.attribute_moves(attribute)),
            )
            // `transform` skips an empty range.
            .filter(|(start, end)| start < end);
        StartTag {
            moves,
            start: tag.start_offset,
            end: tag.end_offset,
            moves_runs,
        }
    }

    /// The ranges svelte2tsx copies of `attribute`: its name or the directive's, then each part
    /// of its value, or for a shorthand or a spread the expression alone.
    fn attribute_moves(
        &self,
        attribute: &Attribute,
    ) -> impl Iterator<Item = (u32, u32)> + Clone + '_ {
        let span = |span: Span| (span.start_offset, span.end_offset);
        let javascript = &self.component.javascript;
        let parts = match attribute.value {
            AttributeValue::Parts(parts) => self.component.parts(parts),
            AttributeValue::True => &[],
        };
        let directive = attribute
            .directive_name(&self.component.modifiers)
            .map(span);
        let (head, value) = match attribute.kind {
            AttributeKind::Spread => (
                Some((
                    attribute.span.start_offset + 1,
                    attribute.span.end_offset - 1,
                )),
                false,
            ),
            // The slot a component's child fills is read from its name alone.
            AttributeKind::Attribute
                if attribute.shorthand
                    || (self.component_parent && self.slot_text(attribute).is_some()) =>
            {
                (None, true)
            }
            AttributeKind::Attribute => (Some(span(attribute.name)), true),
            // `bind:this` assigns the instance to its expression.
            AttributeKind::Bind
                if directive.is_some_and(|(start, end)| {
                    &self.source[start as usize..end as usize] == "this"
                }) =>
            {
                (None, true)
            }
            AttributeKind::Bind if attribute.shorthand => (directive, false),
            AttributeKind::Bind | AttributeKind::On | AttributeKind::Let => (directive, true),
            _ => (None, false),
        };
        let value = (parts.iter().filter(move |_| value)).map(move |part| match *part {
            Part::Text(text) => span(text),
            Part::Expression { expression, .. } => {
                span(node_span(javascript.get_expression(expression)))
            }
        });
        head.into_iter().chain(value)
    }

    /// Where svelte-check reports a finding on what the last `let:` of a start tag destructures:
    /// at the last character svelte2tsx copies of it.
    pub(super) fn last_let_read(&self, name: Span, tag: Span, attributes: Range) -> Option<u32> {
        let attribute = (self.component.attributes(attributes).iter())
            .rfind(|attribute| attribute.kind == AttributeKind::Let)?;
        let (_, end) = self.attribute_moves(attribute).last()?;
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
