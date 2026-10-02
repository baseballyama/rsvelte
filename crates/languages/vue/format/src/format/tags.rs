use super::{Kind2, LayoutInstructionIdentifier, Node, Printer, R};

impl<'a> Printer<'a, '_> {
    pub(super) fn lit(&mut self, s: &'static str) -> LayoutInstructionIdentifier {
        self.d().lit(s)
    }

    pub(super) fn cat(
        &mut self,
        items: &[LayoutInstructionIdentifier],
    ) -> LayoutInstructionIdentifier {
        self.d().concat(items)
    }

    pub(super) fn n(&self, i: usize) -> &'a Node<'a> {
        &self.t.n[i]
    }

    pub(super) fn first(&self, i: usize) -> Option<usize> {
        self.n(i).children.first().copied()
    }

    pub(super) fn last(&self, i: usize) -> Option<usize> {
        self.n(i).children.last().copied()
    }

    /// `isTextLikeNode` (there are no comments).
    pub(super) fn text_like(&self, i: usize) -> bool {
        self.t.is_text(i)
    }

    /// `isTextLikeNode(getLastDescendant(node))`; an interpolation's last descendant is its text.
    pub(super) fn last_descendant_text_like(&self, i: usize) -> bool {
        match self.n(i).kind {
            Kind2::Text(_) | Kind2::Interpolation(_) => true,
            _ => self
                .last(i)
                .is_some_and(|l| self.last_descendant_text_like(l)),
        }
    }

    // ---- print/tag.js ----------------------------------------------------------------

    pub(super) fn borrows_prev_close_end(&self, i: usize) -> bool {
        let n = self.n(i);
        n.prev.is_some_and(|p| !self.text_like(p)) && n.sensitive.leading && !n.has.leading
    }

    pub(super) fn borrows_last_child_close_end(&self, i: usize) -> bool {
        self.last(i).is_some_and(|l| {
            let l2 = self.n(l);
            l2.sensitive.trailing && !l2.has.trailing && !self.last_descendant_text_like(l)
        })
    }

    pub(super) fn borrows_parent_close_start(&self, i: usize) -> bool {
        let n = self.n(i);
        n.next.is_none()
            && !n.has.trailing
            && n.sensitive.trailing
            && self.last_descendant_text_like(i)
    }

    pub(super) fn borrows_next_open_start(&self, i: usize) -> bool {
        let n = self.n(i);
        n.next.is_some_and(|x| !self.text_like(x))
            && self.text_like(i)
            && n.sensitive.trailing
            && !n.has.trailing
    }

    pub(super) fn borrows_parent_open_end(&self, i: usize) -> bool {
        let n = self.n(i);
        n.prev.is_none() && n.sensitive.leading && !n.has.leading
    }

    pub(super) fn open_start_marker(&mut self, i: usize) -> LayoutInstructionIdentifier {
        match self.n(i).kind {
            Kind2::Interpolation(_) => self.lit("{{"),
            Kind2::Element { name, .. } => self.d().text(&format!("<{name}")),
            _ => unreachable!("only tags have markers"),
        }
    }

    pub(super) fn close_start_marker(&mut self, i: usize) -> LayoutInstructionIdentifier {
        let name = self.t.name(i).expect("an element");
        self.d().text(&format!("</{name}"))
    }

    pub(super) fn close_end_marker(&mut self, i: usize) -> LayoutInstructionIdentifier {
        match self.n(i).kind {
            Kind2::Interpolation(_) => self.lit("}}"),
            Kind2::Element { .. } if self.n(i).self_closing => self.lit("/>"),
            _ => self.lit(">"),
        }
    }

    pub(super) fn closing_tag(&mut self, i: usize) -> LayoutInstructionIdentifier {
        let start = if self.n(i).self_closing {
            self.d().nil()
        } else {
            self.closing_tag_start(i)
        };
        let end = self.closing_tag_end(i);
        self.cat(&[start, end])
    }

    pub(super) fn closing_tag_start(&mut self, i: usize) -> LayoutInstructionIdentifier {
        if self
            .last(i)
            .is_some_and(|l| self.borrows_parent_close_start(l))
        {
            return self.d().nil();
        }
        let prefix = if self.borrows_last_child_close_end(i) {
            let l = self.last(i).expect("a last child");
            self.close_end_marker(l)
        } else {
            self.d().nil()
        };
        let marker = self.close_start_marker(i);
        self.cat(&[prefix, marker])
    }

    /// Whether the next sibling (or, for a last child, the parent) prints this node's
    /// closing-tag end marker.
    pub(super) fn close_end_borrowed(&self, i: usize) -> bool {
        let n = self.n(i);
        n.next.map_or_else(
            || self.borrows_last_child_close_end(n.parent),
            |x| self.borrows_prev_close_end(x),
        )
    }

    pub(super) fn closing_tag_end(&mut self, i: usize) -> LayoutInstructionIdentifier {
        if self.close_end_borrowed(i) {
            return self.d().nil();
        }
        let marker = self.close_end_marker(i);
        let suffix = self.closing_tag_suffix(i);
        self.cat(&[marker, suffix])
    }

    pub(super) fn closing_tag_suffix(&mut self, i: usize) -> LayoutInstructionIdentifier {
        if self.borrows_parent_close_start(i) {
            let p = self.n(i).parent;
            return self.close_start_marker(p);
        }
        if self.borrows_next_open_start(i) {
            let x = self.n(i).next.expect("a next sibling");
            return self.open_start_marker(x);
        }
        self.d().nil()
    }

    pub(super) fn opening_tag_prefix(&mut self, i: usize) -> LayoutInstructionIdentifier {
        if self.borrows_parent_open_end(i) {
            return self.lit(">");
        }
        if self.borrows_prev_close_end(i) {
            let p = self.n(i).prev.expect("a previous sibling");
            return self.close_end_marker(p);
        }
        self.d().nil()
    }

    pub(super) fn opening_tag_start(&mut self, i: usize) -> LayoutInstructionIdentifier {
        if self
            .n(i)
            .prev
            .is_some_and(|p| self.borrows_next_open_start(p))
        {
            return self.d().nil();
        }
        let prefix = self.opening_tag_prefix(i);
        let marker = self.open_start_marker(i);
        self.cat(&[prefix, marker])
    }

    pub(super) fn opening_tag(&mut self, i: usize) -> R<LayoutInstructionIdentifier> {
        let start = self.opening_tag_start(i);
        let attributes = self.attributes(i)?;
        let end = if self.n(i).self_closing
            || self
                .first(i)
                .is_some_and(|f| self.borrows_parent_open_end(f))
        {
            self.d().nil()
        } else {
            self.lit(">")
        };
        Ok(self.cat(&[start, attributes, end]))
    }
}
