//! Upstream's printer (esrap) places a program's comments with one cursor over them in source
//! order: before each node with a position it writes the comments that start before the node,
//! after each statement or list item those on the same line, and at the end of a list the rest
//! before the list's end. A node without a position writes none, so a comment waits for the next
//! node that has one. Where esrap's layout depends on a comment, the printer asks the cursor
//! before it prints: whether a list breaks over lines, whether an empty body opens a line.

use oxc_ast::Comment;
use oxc_codegen::{CommentHook, CommentWriter};
use oxc_span::Span;

/// How esrap ends a comment it writes.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Shape {
    /// A line comment, which the line ends after.
    Line,
    /// A block comment on one line.
    Block,
    /// A block comment over lines, which esrap ends with a line break.
    BlockOverLines,
}

impl Shape {
    const fn breaks_line(self) -> bool {
        matches!(self, Self::Line | Self::BlockOverLines)
    }
}

/// What the cursor needs of a comment.
#[derive(Clone, Copy)]
struct Note {
    span: Span,
    shape: Shape,
    /// A block comment esrap reads as a `JSDoc` cast of the expression after it.
    jsdoc_type: bool,
    /// Only blank space and comments come before it on its line.
    starts_line: bool,
    /// Only blank space and comments come after it on its line.
    ends_line: bool,
}

pub(super) struct CommentCursor<'a> {
    text: &'a str,
    /// The comments the cursor writes, in source order; annotations are the printer's own.
    comments: Vec<Note>,
    next: usize,
    /// How many nodes are being printed.
    depth: usize,
    /// The depth of each node that opened `JSDoc` casts, with how many.
    casts: Vec<(usize, usize)>,
}

impl<'a> CommentCursor<'a> {
    pub(super) fn new(text: &'a str, comments: &[Comment]) -> Self {
        let mut comments: Vec<Note> = (comments.iter())
            .filter(|c| !(c.is_pure() || c.is_no_side_effects() || c.is_annotation()))
            .map(|c| Note {
                span: c.span,
                shape: if c.is_line() {
                    Shape::Line
                } else if c.span.source_text(text).contains('\n') {
                    Shape::BlockOverLines
                } else {
                    Shape::Block
                },
                jsdoc_type: c.is_block() && jsdoc_type(c.span.source_text(text)),
                starts_line: false,
                ends_line: false,
            })
            .collect();
        comments.sort_unstable_by_key(|c| c.span.start);
        mark_lines(text, &mut comments);
        Self {
            text,
            comments,
            next: 0,
            depth: 0,
            casts: Vec::new(),
        }
    }

    /// Whether a line break separates the two positions, in either order.
    fn breaks_between(&self, a: u32, b: u32) -> bool {
        let (from, to) = if a <= b { (a, b) } else { (b, a) };
        (self.text.get(from as usize..to as usize))
            .is_some_and(|t| t.contains(['\n', '\r', '\u{2028}', '\u{2029}']))
    }

    /// Whether `b` is on a later line than `a`.
    fn later_line(&self, a: u32, b: u32) -> bool {
        a < b && self.breaks_between(a, b)
    }

    fn write(&self, out: &mut CommentWriter<'_, '_>, comment: &Note) {
        out.write(comment.span.source_text(self.text));
    }

    /// esrap's `flush_comments_until`: every comment that starts before `to`. Returns how many
    /// `JSDoc` casts it opened.
    fn flush_until(
        &mut self,
        out: &mut CommentWriter<'_, '_>,
        from: Option<u32>,
        to: u32,
        pad: bool,
        expression: bool,
    ) -> usize {
        let mut first = true;
        let mut casts = 0;
        while let Some(&comment) = self.comments.get(self.next).filter(|c| c.span.start < to) {
            let ends_line = comment.shape.breaks_line() || self.later_line(comment.span.end, to);
            if first && from.is_some_and(|from| self.later_line(from, comment.span.start)) {
                out.newline();
            }
            first = false;
            self.write(out, &comment);
            let cast = expression && comment.jsdoc_type;
            if cast {
                out.write(" (");
                casts += 1;
            }
            if ends_line {
                out.newline();
            } else if pad && !cast {
                out.space();
            }
            self.next += 1;
        }
        casts
    }
}

impl CommentHook for CommentCursor<'_> {
    fn before(&mut self, out: &mut CommentWriter<'_, '_>, span: Option<Span>, expression: bool) {
        self.depth += 1;
        let casts = span.map_or(0, |span| {
            self.flush_until(out, None, span.start, true, expression)
        });
        if casts > 0 {
            self.casts.push((self.depth, casts));
        }
    }

    fn after(&mut self, out: &mut CommentWriter<'_, '_>, _: Option<Span>) {
        if let Some(&(depth, casts)) = self.casts.last()
            && depth == self.depth
        {
            self.casts.pop();
            for _ in 0..casts {
                out.write(")");
            }
        }
        self.depth -= 1;
    }

    /// esrap's `reset_comment_index`: the first comment at or after the start of the body, unless
    /// the cursor is there already. A body without a position has no comments left to write.
    fn body(&mut self, owner: Option<Span>) {
        let Some(owner) = owner else {
            self.next = self.comments.len();
            return;
        };
        let here = self
            .comments
            .get(self.next)
            .is_some_and(|c| c.span.start >= owner.start)
            && (self.next.checked_sub(1))
                .and_then(|i| self.comments.get(i))
                .is_none_or(|c| c.span.start < owner.start);
        if !here {
            self.next = self
                .comments
                .partition_point(|c| c.span.start < owner.start);
        }
    }

    /// esrap's `flush_trailing_comments`: the comments on the line where the last item ended that
    /// end by `next`, written on that line.
    fn trailing(&mut self, out: &mut CommentWriter<'_, '_>, end: Option<u32>, next: Option<u32>) {
        let Some(end) = end else { return };
        while let Some(&comment) = self.comments.get(self.next) {
            if !self.trails_at(&comment, end, next) {
                break;
            }
            out.append(" ");
            out.append(comment.span.source_text(self.text));
            self.next += 1;
            match comment.shape {
                Shape::Line => {
                    out.newline();
                    return;
                }
                Shape::BlockOverLines => out.newline(),
                Shape::Block => {}
            }
        }
    }

    fn until(&mut self, out: &mut CommentWriter<'_, '_>, from: Option<u32>, to: Option<u32>) {
        if let Some(to) = to {
            self.flush_until(out, from, to, false, false);
        }
    }

    fn next_comment(&self) -> Option<u32> {
        self.comments.get(self.next).map(|c| c.span.start)
    }

    /// esrap breaks a list over lines when a comment in it writes a line break: a line comment, a
    /// block comment over lines, or one that stands before an item with a line break after it. A
    /// comment on the line of the item before it, written after that item, counts only where
    /// `trailing` says so (an argument list, not other lists).
    fn breaks(&self, first: u32, until: u32, trailing: bool) -> bool {
        self.comments[self.next..]
            .iter()
            .take_while(|c| c.span.start < until)
            .any(|c| {
                if c.span.start < first {
                    c.shape.breaks_line() || self.later_line(c.span.end, first)
                } else if c.starts_line {
                    c.shape.breaks_line() || c.ends_line
                } else {
                    trailing && c.shape.breaks_line()
                }
            })
    }

    /// The body's `body` call moves the cursor to its first comment, as esrap's
    /// `reset_comment_index` does.
    fn holds(&self, span: Span) -> bool {
        let first = self.comments.partition_point(|c| c.span.start < span.start);
        (self.comments.get(first)).is_some_and(|c| c.span.start < span.end)
    }

    fn breaks_before(&self, to: u32) -> bool {
        self.comments[self.next..]
            .iter()
            .take_while(|c| c.span.start < to)
            .any(|c| c.shape.breaks_line() || self.later_line(c.span.end, to))
    }
}

impl CommentCursor<'_> {
    /// Whether `comment` is on the line where an item ended at `end`, and ends by `next`.
    fn trails_at(&self, comment: &Note, end: u32, next: Option<u32>) -> bool {
        next.is_none_or(|next| comment.span.end <= next)
            && !self.breaks_between(end, comment.span.start)
    }
}

/// Sets what is next to each comment on its line, over the blank space and the other comments
/// around it.
fn mark_lines(text: &str, comments: &mut [Note]) {
    let is_break = |c: char| matches!(c, '\n' | '\r' | '\u{2028}' | '\u{2029}');
    let blank = |t: &str| t.chars().all(char::is_whitespace);
    for i in 0..comments.len() {
        let from = i
            .checked_sub(1)
            .map_or(0, |p| comments[p].span.end as usize);
        let gap = &text[from..comments[i].span.start as usize];
        comments[i].starts_line = match gap.rfind(is_break) {
            Some(at) => blank(&gap[at..]),
            None if blank(gap) => i.checked_sub(1).is_none_or(|p| comments[p].starts_line),
            None => false,
        };
    }
    for i in (0..comments.len()).rev() {
        let to = comments
            .get(i + 1)
            .map_or(text.len(), |n| n.span.start as usize);
        let gap = &text[comments[i].span.end as usize..to];
        comments[i].ends_line = comments[i].shape == Shape::Line
            || match gap.find(is_break) {
                Some(at) => blank(&gap[..at]),
                None if blank(gap) => comments.get(i + 1).is_none_or(|n| n.ends_line),
                None => false,
            };
    }
}

/// esrap's guess that a block comment casts the expression after it: a line starting with
/// `* @type {`.
fn jsdoc_type(comment: &str) -> bool {
    let value = comment;
    let value = value.get(2..value.len().saturating_sub(2)).unwrap_or("");
    std::iter::once(0)
        .chain(value.match_indices('\n').map(|(i, _)| i + 1))
        .any(|start| {
            (value[start..].trim_start().strip_prefix('*'))
                .and_then(|rest| rest.trim_start().strip_prefix("@type"))
                .is_some_and(|rest| rest.trim_start().starts_with('{'))
        })
}

#[cfg(test)]
mod tests;
