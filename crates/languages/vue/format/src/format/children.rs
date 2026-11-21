//! prettier's `print/children.js`.
use rsvelte_document_printer::{GroupIdentifier, LayoutInstructionIdentifier};

use super::{Attributes, NodeIdentifier, NodeKind, Printer, R};

#[derive(Clone, Copy, PartialEq, Eq)]
enum Between {
    None,
    Soft,
    Line,
    Hard,
}

const fn attributes_len(a: Attributes<'_>) -> usize {
    match a {
        Attributes::Template(l) => l.len(),
        Attributes::Block(l) => l.len(),
    }
}

impl Printer<'_, '_, '_> {
    pub(super) fn force_next_empty_line(&self, i: NodeIdentifier) -> bool {
        self.node(i).next.is_some_and(|x| {
            self.tree.line(self.node(i).span.end_offset) + 1
                < self.tree.line(self.node(x).span.start_offset)
        })
    }

    pub(super) fn has_leading_line_break(&self, i: NodeIdentifier) -> bool {
        let n = self.node(i);
        n.has.leading
            && n.prev.map_or_else(
                || {
                    self.tree.is_top_level(i)
                        || self.tree.line(self.node(self.tree.parent(i)).open_end)
                            < self.tree.line(n.span.start_offset)
                },
                |p| {
                    self.tree.line(self.node(p).span.end_offset)
                        < self.tree.line(n.span.start_offset)
                },
            )
    }

    pub(super) fn has_trailing_line_break(&self, i: NodeIdentifier) -> bool {
        let n = self.node(i);
        n.has.trailing
            && n.next.map_or_else(
                || {
                    self.tree.is_top_level(i)
                        || self
                            .node(self.tree.parent(i))
                            .close_start
                            .is_some_and(|c| self.tree.line(c) > self.tree.line(n.span.end_offset))
                },
                |x| {
                    self.tree.line(self.node(x).span.start_offset)
                        > self.tree.line(n.span.end_offset)
                },
            )
    }

    pub(super) fn surrounding_hardline(&self, i: NodeIdentifier) -> bool {
        matches!(self.tree.name(i), Some("script" | "select"))
    }

    pub(super) fn prefer_hardline_leading(&self, i: NodeIdentifier) -> bool {
        self.surrounding_hardline(i)
            || self
                .node(i)
                .prev
                .is_some_and(|p| self.prefer_hardline_trailing(p))
            || (self.has_leading_line_break(i) && self.has_trailing_line_break(i))
    }

    pub(super) fn prefer_hardline_trailing(&self, i: NodeIdentifier) -> bool {
        self.surrounding_hardline(i)
            || self.tree.name(i) == Some("br")
            || (self.has_leading_line_break(i) && self.has_trailing_line_break(i))
    }

    /// `printBetweenLine`.
    fn between(&self, prev: NodeIdentifier, next: NodeIdentifier) -> Between {
        if self.text_like(prev) && self.text_like(next) {
            let p = self.node(prev);
            if p.sensitive.trailing {
                if !p.has.trailing {
                    return Between::None;
                }
                return if self.prefer_hardline_leading(next) {
                    Between::Hard
                } else {
                    Between::Line
                };
            }
            return if self.prefer_hardline_leading(next) {
                Between::Hard
            } else {
                Between::Soft
            };
        }
        let nx = self.node(next);
        let has_attributes = matches!(
            nx.kind,
            NodeKind::Element { attributes, .. } if attributes_len(attributes) > 0
        );
        if (self.borrows_next_open_start(prev)
            && (!nx.children.is_empty() || nx.self_closing || has_attributes))
            || (self.tree.is_element(prev)
                && self.node(prev).self_closing
                && self.borrows_prev_close_end(next))
        {
            return Between::None;
        }
        let deep_borrow = self.borrows_prev_close_end(next)
            && self.last(prev).is_some_and(|l| {
                self.borrows_parent_close_start(l)
                    && self
                        .last(l)
                        .is_some_and(|ll| self.borrows_parent_close_start(ll))
            });
        if !nx.sensitive.leading || self.prefer_hardline_leading(next) || deep_borrow {
            return Between::Hard;
        }
        if nx.has.leading {
            Between::Line
        } else {
            Between::Soft
        }
    }

    fn between_doc(&mut self, b: Between) -> LayoutInstructionIdentifier {
        match b {
            Between::None => self.docs.nil(),
            Between::Soft => self.docs.softline(),
            Between::Line => self.docs.line(),
            Between::Hard => self.docs.hardline(),
        }
    }

    pub(super) fn force_break_children(&self, i: NodeIdentifier) -> bool {
        let n = self.node(i);
        self.tree.is_element(i)
            && !n.children.is_empty()
            && (matches!(
                self.tree.name(i),
                Some("html" | "head" | "ul" | "ol" | "select")
            ) || (n.display.starts_with("table") && n.display != "table-cell"))
    }

    pub(super) fn force_break_content(&self, i: NodeIdentifier) -> bool {
        let n = self.node(i);
        let has_non_text_child =
            |c: NodeIdentifier| self.node(c).children.iter().any(|&g| !self.tree.is_text(g));
        self.force_break_children(i)
            || (self.tree.is_element(i)
                && !n.children.is_empty()
                && (matches!(self.tree.name(i), Some("body" | "script" | "style"))
                    || n.children.iter().any(|&c| has_non_text_child(c))))
            || (n.children.len() == 1 && {
                let f = n.children[0];
                !self.tree.is_text(f)
                    && self.has_leading_line_break(f)
                    && (!self.node(f).sensitive.trailing || self.has_trailing_line_break(f))
            })
    }

    /// `printChildren`.
    pub(super) fn children(&mut self, i: NodeIdentifier) -> R<Vec<LayoutInstructionIdentifier>> {
        let children = self.node(i).children.clone();
        if self.force_break_children(i) {
            let mut out = vec![self.docs.break_parent()];
            for &k in &children {
                if let Some(p) = self.node(k).prev {
                    let b = self.between(p, k);
                    if b != Between::None {
                        out.push(self.between_doc(b));
                        if self.force_next_empty_line(p) {
                            out.push(self.docs.hardline());
                        }
                    }
                }
                out.push(self.print(k)?);
            }
            return Ok(out);
        }
        let identifiers: Vec<GroupIdentifier> = children
            .iter()
            .map(|_| self.docs.new_group_identifier())
            .collect();
        let mut out = Vec::new();
        for (index, &k) in children.iter().enumerate() {
            let prev = self.node(k).prev;
            let next = self.node(k).next;
            if self.text_like(k) {
                if let Some(p) = prev
                    && self.text_like(p)
                {
                    let b = self.between(p, k);
                    if b != Between::None {
                        if self.force_next_empty_line(p) {
                            let h1 = self.docs.hardline();
                            let h2 = self.docs.hardline();
                            out.extend([h1, h2]);
                        } else {
                            out.push(self.between_doc(b));
                        }
                    }
                }
                out.push(self.print(k)?);
                continue;
            }
            let mut prev_parts = Vec::new();
            let mut leading = Vec::new();
            let mut trailing = Vec::new();
            let mut next_parts = Vec::new();
            let prev_between = prev.map_or(Between::None, |p| self.between(p, k));
            let next_between = next.map_or(Between::None, |x| self.between(k, x));
            if prev_between != Between::None {
                let p = prev.expect("a previous sibling");
                if self.force_next_empty_line(p) {
                    prev_parts.push(self.docs.hardline());
                    prev_parts.push(self.docs.hardline());
                } else if prev_between == Between::Hard {
                    prev_parts.push(self.docs.hardline());
                } else if self.text_like(p) {
                    leading.push(self.between_doc(prev_between));
                } else {
                    let nil = self.docs.nil();
                    let soft = self.docs.softline();
                    leading.push(self.docs.if_break_of(nil, soft, identifiers[index - 1]));
                }
            }
            if next_between != Between::None {
                let x = next.expect("a next sibling");
                if self.force_next_empty_line(k) {
                    if self.text_like(x) {
                        next_parts.push(self.docs.hardline());
                        next_parts.push(self.docs.hardline());
                    }
                } else if next_between == Between::Hard {
                    if self.text_like(x) {
                        next_parts.push(self.docs.hardline());
                    }
                } else {
                    trailing.push(self.between_doc(next_between));
                }
            }
            let child = self.print(k)?;
            let mut inner = vec![child];
            inner.extend(trailing);
            let inner = self.docs.group_with_identifier(&inner, identifiers[index]);
            leading.push(inner);
            let outer = self.docs.group(&leading);
            out.extend(prev_parts);
            out.push(outer);
            out.extend(next_parts);
        }
        Ok(out)
    }
}
