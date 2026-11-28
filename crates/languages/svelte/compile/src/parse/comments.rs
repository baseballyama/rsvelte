//! JavaScript comments, and the nodes svelte's parser attaches them to.
//!
//! svelte walks each tree acorn reads before it leaves the tree, giving a node the comments
//! before it and, on the way back, the comment after it. [`attach`] walks the [`Shape`] of the
//! tree as written the way svelte walks acorn's.

use std::collections::VecDeque;
use std::ops::Range;

use rsvelte_kernel::source::positions::Span;

use super::shape::{Shape, Shaped, listed};

/// A comment as svelte keeps it.
pub(super) struct Comment {
    pub(super) span: Span,
    pub(super) block: bool,
    pub(super) value: String,
    /// Between the attributes of a tag, where svelte reads it itself.
    pub(super) in_tag: bool,
}

impl Comment {
    /// `source`'s comment at `span`, with svelte's value: a block comment over several lines loses
    /// the indentation of its first line on every line. `padded` is where a script's content
    /// starts: svelte reads a script with the text before it turned into spaces.
    pub(super) fn new(source: &str, span: Span, block: bool, padded: u32) -> Self {
        let text = span.text(source);
        let value = if block {
            &text[2..text.len() - 2]
        } else {
            &text[2..]
        };
        let value = if block && value.contains('\n') {
            let start = span.start_offset as usize;
            let line = source[..start].rfind('\n').map_or(0, |at| at + 1);
            let mut indentation = String::new();
            for (at, c) in source[line..].char_indices() {
                let at = line + at;
                if at < padded as usize {
                    // A character before the script, which svelte reads as spaces.
                    indentation.extend(std::iter::repeat_n(' ', c.len_utf16()));
                } else if matches!(c, ' ' | '\t') {
                    indentation.push(c);
                } else {
                    break;
                }
            }
            strip_line_starts(value, &indentation)
        } else {
            value.to_owned()
        };
        Self {
            span,
            block,
            value,
            in_tag: false,
        }
    }

    /// `source`'s comment at `span` between the attributes of a tag, which svelte keeps as
    /// written.
    pub(super) fn in_tag(source: &str, span: Span) -> Self {
        let text = span.text(source);
        let block = text.starts_with("/*");
        let value = if block {
            text[2..].strip_suffix("*/").unwrap_or_else(|| &text[2..])
        } else {
            &text[2..]
        };
        Self {
            span,
            block,
            value: value.to_owned(),
            in_tag: true,
        }
    }
}

/// `value` without `prefix` at the start of each of its lines, as `/^prefix/gm` removes it.
fn strip_line_starts(value: &str, prefix: &str) -> String {
    if prefix.is_empty() {
        return value.to_owned();
    }
    let mut out = String::with_capacity(value.len());
    let mut rest = value;
    loop {
        rest = rest.strip_prefix(prefix).unwrap_or(rest);
        let Some(at) = rest.find(['\n', '\r', '\u{2028}', '\u{2029}']) else {
            out.push_str(rest);
            return out;
        };
        let terminator = rest[at..].chars().next().map_or(1, char::len_utf8);
        out.push_str(&rest[..at + terminator]);
        rest = &rest[at + terminator..];
    }
}

/// The comments of each node of a shape, by the order the serializer opens the nodes.
pub(super) struct Attached {
    pub(super) leading: Vec<Vec<usize>>,
    pub(super) trailing: Vec<Vec<usize>>,
}

/// Attaches `candidates`, indices into `comments` in document order, to `shape`'s nodes.
pub(super) fn attach(
    shape: &Shape,
    comments: &[Comment],
    candidates: Range<usize>,
    source: &str,
) -> Attached {
    let count = shape.nodes.len();
    let mut children = vec![Vec::new(); count];
    for (index, node) in shape.nodes.iter().enumerate() {
        if let Some(parent) = node.parent {
            children[parent as usize].push(index as u32);
        }
    }
    let mut walk = Walk {
        nodes: &shape.nodes,
        children: &children,
        comments,
        source,
        queue: candidates.collect(),
        attached: Attached {
            leading: vec![Vec::new(); count],
            trailing: vec![Vec::new(); count],
        },
    };
    if count > 0 {
        walk.visit(0);
        let root = &shape.nodes[0];
        if let Some(&first) = walk.queue.front()
            && (comments[first].span.start_offset >= root.end || root.kind == "Program")
        {
            let rest: Vec<_> = walk.queue.drain(..).collect();
            walk.attached.trailing[0].extend(rest);
        }
    }
    walk.attached
}

struct Walk<'a> {
    nodes: &'a [Shaped],
    children: &'a [Vec<u32>],
    comments: &'a [Comment],
    source: &'a str,
    queue: VecDeque<usize>,
    attached: Attached,
}

impl Walk<'_> {
    const fn start(&self, comment: usize) -> u32 {
        self.comments[comment].span.start_offset
    }

    fn visit(&mut self, index: u32) {
        let node = &self.nodes[index as usize];
        while let Some(&comment) = self.queue.front()
            && self.start(comment) < node.start
        {
            self.queue.pop_front();
            self.attached.leading[index as usize].push(comment);
        }
        for &child in &self.children[index as usize] {
            self.visit(child);
        }
        let Some(&next) = self.queue.front() else {
            return;
        };
        let parent = node.parent.map(|parent| &self.nodes[parent as usize]);
        if parent.is_some_and(|parent| parent.end == node.end) {
            return;
        }
        let last = parent.is_some_and(|parent| {
            listed(parent.kind) == Some(node.key)
                && node.place.is_some_and(|place| place + 1 == parent.length)
        });
        if let Some(parent) = parent
            && last
        {
            // The last node of a body takes every comment up to the body's end.
            while let Some(&comment) = self.queue.front()
                && self.start(comment) < parent.end
            {
                self.queue.pop_front();
                self.attached.trailing[index as usize].push(comment);
            }
        } else if node.end <= self.start(next) {
            let between = &self.source[node.end as usize..self.start(next) as usize];
            if between
                .bytes()
                .all(|b| matches!(b, b',' | b')' | b' ' | b'\t'))
            {
                self.queue.pop_front();
                self.attached.trailing[index as usize] = vec![next];
            }
        }
    }
}

#[cfg(test)]
mod tests;
