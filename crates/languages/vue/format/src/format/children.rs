use super::{
    Between, GroupIdentifier, Kind2, LayoutInstructionIdentifier, Printer, R, ROOT, attributes_len,
};

impl Printer<'_, '_> {
    // ---- print/children.js -----------------------------------------------------------

    pub(super) fn force_next_empty_line(&self, i: usize) -> bool {
        self.n(i).next.is_some_and(|x| {
            self.t.line(self.n(i).span.end_offset) + 1 < self.t.line(self.n(x).span.start_offset)
        })
    }

    pub(super) fn has_leading_line_break(&self, i: usize) -> bool {
        let n = self.n(i);
        n.has.leading
            && n.prev.map_or_else(
                || {
                    n.parent == ROOT
                        || self.t.line(self.n(n.parent).open_end) < self.t.line(n.span.start_offset)
                },
                |p| self.t.line(self.n(p).span.end_offset) < self.t.line(n.span.start_offset),
            )
    }

    pub(super) fn has_trailing_line_break(&self, i: usize) -> bool {
        let n = self.n(i);
        n.has.trailing
            && n.next.map_or_else(
                || {
                    n.parent == ROOT
                        || self
                            .n(n.parent)
                            .close_start
                            .is_some_and(|c| self.t.line(c) > self.t.line(n.span.end_offset))
                },
                |x| self.t.line(self.n(x).span.start_offset) > self.t.line(n.span.end_offset),
            )
    }

    pub(super) fn surrounding_hardline(&self, i: usize) -> bool {
        matches!(self.t.name(i), Some("script" | "select"))
    }

    pub(super) fn prefer_hardline_leading(&self, i: usize) -> bool {
        self.surrounding_hardline(i)
            || self
                .n(i)
                .prev
                .is_some_and(|p| self.prefer_hardline_trailing(p))
            || (self.has_leading_line_break(i) && self.has_trailing_line_break(i))
    }

    pub(super) fn prefer_hardline_trailing(&self, i: usize) -> bool {
        self.surrounding_hardline(i)
            || self.t.name(i) == Some("br")
            || (self.has_leading_line_break(i) && self.has_trailing_line_break(i))
    }

    /// `printBetweenLine`.
    pub(super) fn between(&self, prev: usize, next: usize) -> Between {
        if self.text_like(prev) && self.text_like(next) {
            let p = self.n(prev);
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
        let nx = self.n(next);
        let has_attributes =
            matches!(nx.kind, Kind2::Element { attributes, .. } if attributes_len(attributes) > 0);
        if (self.borrows_next_open_start(prev)
            && (!nx.children.is_empty() || nx.self_closing || has_attributes))
            || (self.t.is_element(prev)
                && self.n(prev).self_closing
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

    pub(super) fn between_doc(&mut self, b: Between) -> LayoutInstructionIdentifier {
        match b {
            Between::None => self.d().nil(),
            Between::Soft => self.d().softline(),
            Between::Line => self.d().line(),
            Between::Hard => self.d().hardline(),
        }
    }

    pub(super) fn force_break_children(&self, i: usize) -> bool {
        let n = self.n(i);
        self.t.is_element(i)
            && !n.children.is_empty()
            && (matches!(
                self.t.name(i),
                Some("html" | "head" | "ul" | "ol" | "select")
            ) || (n.display.starts_with("table") && n.display != "table-cell"))
    }

    pub(super) fn force_break_content(&self, i: usize) -> bool {
        let n = self.n(i);
        let has_non_text_child = |c: usize| self.n(c).children.iter().any(|&g| !self.t.is_text(g));
        self.force_break_children(i)
            || (self.t.is_element(i)
                && !n.children.is_empty()
                && (matches!(self.t.name(i), Some("body" | "script" | "style"))
                    || n.children.iter().any(|&c| has_non_text_child(c))))
            || (n.children.len() == 1 && {
                let f = n.children[0];
                !self.t.is_text(f)
                    && self.has_leading_line_break(f)
                    && (!self.n(f).sensitive.trailing || self.has_trailing_line_break(f))
            })
    }

    /// `printChildren`.
    pub(super) fn children(&mut self, i: usize) -> R<Vec<LayoutInstructionIdentifier>> {
        let children = self.n(i).children.clone();
        if self.force_break_children(i) {
            let mut out = vec![self.d().break_parent()];
            for &k in &children {
                if let Some(p) = self.n(k).prev {
                    let b = self.between(p, k);
                    if b != Between::None {
                        out.push(self.between_doc(b));
                        if self.force_next_empty_line(p) {
                            out.push(self.d().hardline());
                        }
                    }
                }
                out.push(self.print(k)?);
            }
            return Ok(out);
        }
        let identifiers: Vec<GroupIdentifier> = children
            .iter()
            .map(|_| self.d().new_group_identifier())
            .collect();
        let mut out = Vec::new();
        for (index, &k) in children.iter().enumerate() {
            let prev = self.n(k).prev;
            let next = self.n(k).next;
            if self.text_like(k) {
                if let Some(p) = prev
                    && self.text_like(p)
                {
                    let b = self.between(p, k);
                    if b != Between::None {
                        if self.force_next_empty_line(p) {
                            let h1 = self.d().hardline();
                            let h2 = self.d().hardline();
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
                    prev_parts.push(self.d().hardline());
                    prev_parts.push(self.d().hardline());
                } else if prev_between == Between::Hard {
                    prev_parts.push(self.d().hardline());
                } else if self.text_like(p) {
                    leading.push(self.between_doc(prev_between));
                } else {
                    let nil = self.d().nil();
                    let soft = self.d().softline();
                    leading.push(self.d().if_break_of(nil, soft, identifiers[index - 1]));
                }
            }
            if next_between != Between::None {
                let x = next.expect("a next sibling");
                if self.force_next_empty_line(k) {
                    if self.text_like(x) {
                        next_parts.push(self.d().hardline());
                        next_parts.push(self.d().hardline());
                    }
                } else if next_between == Between::Hard {
                    if self.text_like(x) {
                        next_parts.push(self.d().hardline());
                    }
                } else {
                    trailing.push(self.between_doc(next_between));
                }
            }
            let child = self.print(k)?;
            let mut inner = vec![child];
            inner.extend(trailing);
            let inner = self.d().group_with_identifier(&inner, identifiers[index]);
            leading.push(inner);
            let outer = self.d().group(&leading);
            out.extend(prev_parts);
            out.push(outer);
            out.extend(next_parts);
        }
        Ok(out)
    }
}
