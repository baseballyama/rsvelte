//! Where svelte2tsx's `transform` of a start tag leaves the text it generates there, which is
//! where svelte-check reports a finding on that text: the source ranges it moves out of the tag,
//! and the runs between them it removes and writes as one space.

use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Attribute, AttributeKind, AttributeValue, Part, Range};
use rsvelte_typescript_tree::node_span;

use super::Builder;

/// The moves of one start tag, each `(start, end)` once `transform` has extended it.
pub(super) struct StartTag {
    moves: Vec<(u32, u32)>,
    /// Where the tag starts, at its `<`.
    start: u32,
    /// Where `transform` stops: after the tag's `>`.
    end: u32,
    /// Whether whitespace follows the tag name, which svelte2tsx removes first.
    moves_runs: bool,
}

impl StartTag {
    /// Whether a move starts at `offset`.
    fn moves_at(&self, offset: u32) -> bool {
        self.moves.iter().any(|&(start, _)| start == offset)
    }

    /// svelte2tsx's `transform` extends a move over the character after it, which the text it
    /// writes next overwrites, unless that is the tag's last character or another move starts
    /// there.
    pub(super) fn extended(&self, end: u32) -> u32 {
        if end + 1 < self.end && !self.moves_at(end) {
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
        let mut moves: Vec<(u32, u32)> = (self.moves.iter())
            .map(|&(start, end)| (start, self.extended(end)))
            .collect();
        moves.sort_unstable();
        let mut removed = moves.first().map_or(self.start, |&(start, _)| start);
        let mut space = None;
        for (start, end) in moves {
            if removed < start && start < self.end {
                space = Some(removed);
            }
            removed = end;
        }
        if removed + 2 < self.end {
            space = Some(removed + 1);
        }
        space
    }
}

impl Builder<'_> {
    /// The moves of a start tag at `tag` with the tag name `name`, as svelte2tsx writes a
    /// component's: its name, the whitespace after it, and the ranges each attribute copies.
    pub(super) fn start_tag(&self, name: Span, tag: Span, attributes: Range) -> StartTag {
        let mut moves = vec![(name.start_offset, name.end_offset)];
        let after_name = name.end_offset as usize;
        let moves_runs = self.source[after_name..].starts_with(is_ecmascript_whitespace);
        if moves_runs {
            moves.push((name.end_offset, name.end_offset + 1));
        }
        for attribute in self.component.attributes(attributes) {
            self.attribute_moves(attribute, &mut moves);
        }
        StartTag {
            moves,
            start: tag.start_offset,
            end: tag.end_offset,
            moves_runs,
        }
    }

    /// The ranges svelte2tsx copies of `attribute`: its name or the directive's, then each part
    /// of its value, or for a shorthand or a spread the expression alone.
    fn attribute_moves(&self, attribute: &Attribute, moves: &mut Vec<(u32, u32)>) {
        let span = |span: Span| (span.start_offset, span.end_offset);
        let javascript = &self.component.javascript;
        let parts = match attribute.value {
            AttributeValue::Parts(parts) => self.component.parts(parts),
            AttributeValue::True => &[],
        };
        let value = parts.iter().map(|part| match *part {
            Part::Text(text) => span(text),
            Part::Expression { expression, .. } => {
                span(node_span(javascript.get_expression(expression)))
            }
        });
        let directive = attribute.directive_name(&self.component.modifiers);
        match attribute.kind {
            AttributeKind::Spread => moves.push((
                attribute.span.start_offset + 1,
                attribute.span.end_offset - 1,
            )),
            AttributeKind::Attribute if attribute.shorthand => moves.extend(value),
            AttributeKind::Attribute => {
                moves.push(span(attribute.name));
                moves.extend(value);
            }
            // `bind:this` assigns the instance to its expression.
            AttributeKind::Bind if directive.is_some_and(|d| d.text(self.source) == "this") => {
                moves.extend(value);
            }
            AttributeKind::Bind if attribute.shorthand => moves.extend(directive.map(span)),
            AttributeKind::Bind | AttributeKind::On | AttributeKind::Let => {
                moves.extend(directive.map(span));
                moves.extend(value);
            }
            _ => {}
        }
    }

    /// Where svelte-check reports a finding on what the last `let:` of a start tag destructures:
    /// at the last character svelte2tsx copies of it.
    pub(super) fn last_let_read(&self, name: Span, tag: Span, attributes: Range) -> Option<u32> {
        let attribute = (self.component.attributes(attributes).iter())
            .rfind(|attribute| attribute.kind == AttributeKind::Let)?;
        let mut moves = Vec::new();
        self.attribute_moves(attribute, &mut moves);
        let &(_, end) = moves.last()?;
        Some(self.start_tag(name, tag, attributes).last_character(end))
    }
}

#[cfg(test)]
mod tests;
