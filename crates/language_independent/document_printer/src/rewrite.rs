//! Rewrites of a built document: Prettier's `removeLines` and prettier-plugin-svelte's `trim`.

use crate::{LayoutInstructionIdentifier, LayoutInstructions, LineKind, Node};

impl LayoutInstructions {
    /// Prettier's `removeLines`: lines become a space (soft lines nothing) and `ifBreak` its flat
    /// contents, so the document prints on one line unless it holds a hard line.
    pub fn remove_lines(&mut self, d: LayoutInstructionIdentifier) -> LayoutInstructionIdentifier {
        match self.nodes[d.0 as usize] {
            Node::Line(LineKind::Normal) => self.lit(" "),
            Node::Line(LineKind::Soft) => self.nil(),
            Node::Static(_) | Node::Text { .. } | Node::Line(_) | Node::BreakParent => d,
            Node::IfBreak { flat, .. } => self.remove_lines(flat),
            Node::Indent(x) => {
                let x = self.remove_lines(x);
                self.indent(x)
            }
            Node::Dedent(x) => {
                let x = self.remove_lines(x);
                self.dedent(x)
            }
            // Without breakable lines the layout question a flat-only marks is moot.
            Node::FlatOnly(x) => self.remove_lines(x),
            Node::IndentIfBreak { document, group } => {
                let x = self.remove_lines(document);
                self.indent_if_break(x, group)
            }
            Node::Concat { start, len } => {
                let children = self.mapped_children(start, len);
                self.concat(&children)
            }
            Node::Fill { start, len } => {
                let children = self.mapped_children(start, len);
                self.fill(&children)
            }
            Node::Group {
                start,
                len,
                breaks_line,
                identifier,
            } => {
                let children = self.mapped_children(start, len);
                self.group_node(&children, breaks_line, identifier)
            }
        }
    }

    fn mapped_children(&mut self, start: u32, len: u32) -> Vec<LayoutInstructionIdentifier> {
        let children = self.children(start, len).to_vec();
        children.into_iter().map(|k| self.remove_lines(k)).collect()
    }

    /// The list a trim may descend into (prettier-plugin-svelte's `getParts`).
    fn parts(&self, d: LayoutInstructionIdentifier) -> Option<(u32, u32)> {
        match self.nodes[d.0 as usize] {
            Node::Concat { start, len }
            | Node::Fill { start, len }
            | Node::Group { start, len, .. } => Some((start, len)),
            _ => None,
        }
    }

    /// Narrows a list to `children[start..start + len]`, a part of its old range.
    fn set_parts(&mut self, owner: LayoutInstructionIdentifier, s: u32, l: u32) {
        match &mut self.nodes[owner.0 as usize] {
            Node::Concat { start, len }
            | Node::Fill { start, len }
            | Node::Group { start, len, .. } => {
                *start = s;
                *len = l;
            }
            _ => unreachable!("only lists have parts"),
        }
        // Trims run innermost first, so the parts' answers are already current.
        let i = owner.0 as usize;
        self.measures[i] = self.measure_of(self.nodes[i]);
    }

    /// prettier-plugin-svelte's `trim`: removes leading and trailing docs matching `ws`, descending
    /// into the first/last part when nothing at the current level matches.
    pub fn trim(
        &mut self,
        docs: &mut Vec<LayoutInstructionIdentifier>,
        ws: fn(&Self, LayoutInstructionIdentifier) -> bool,
    ) {
        self.trim_left(docs, ws);
        self.trim_right(docs, ws);
    }

    pub(crate) fn trim_left(
        &mut self,
        docs: &mut Vec<LayoutInstructionIdentifier>,
        ws: fn(&Self, LayoutInstructionIdentifier) -> bool,
    ) {
        let (start, len) = self.list(docs);
        let dropped = self.trim_left_range(start, len, ws);
        // The trim only narrows ranges, so nothing after `start` was added.
        self.children.truncate(start as usize);
        docs.drain(..dropped as usize);
    }

    pub fn trim_right(
        &mut self,
        docs: &mut Vec<LayoutInstructionIdentifier>,
        ws: fn(&Self, LayoutInstructionIdentifier) -> bool,
    ) {
        let (start, len) = self.list(docs);
        let kept = self.trim_right_range(start, len, ws);
        self.children.truncate(start as usize);
        docs.truncate(kept as usize);
    }

    /// Trims the head of `children[start..start + len]` and returns how many items it drops.
    fn trim_left_range(
        &mut self,
        start: u32,
        len: u32,
        ws: fn(&Self, LayoutInstructionIdentifier) -> bool,
    ) -> u32 {
        let items = self.children(start, len);
        let first = items
            .iter()
            .position(|&d| !self.is_empty(d) && !ws(self, d))
            .unwrap_or(items.len());
        // A removed whitespace doc ends the trim; removed empty docs do not.
        if first < items.len() && items[..first].iter().all(|&d| self.is_empty(d)) {
            let d = items[first];
            if let Some((s, l)) = self.parts(d) {
                let dropped = self.trim_left_range(s, l, ws);
                self.set_parts(d, s + dropped, l - dropped);
            }
        }
        first as u32
    }

    /// Trims the tail of `children[start..start + len]` and returns how many items it keeps.
    fn trim_right_range(
        &mut self,
        start: u32,
        len: u32,
        ws: fn(&Self, LayoutInstructionIdentifier) -> bool,
    ) -> u32 {
        let items = self.children(start, len);
        let keep = items
            .iter()
            .rposition(|&d| !self.is_empty(d) && !ws(self, d))
            .map_or(0, |i| i + 1);
        if keep > 0 && items[keep..].iter().all(|&d| self.is_empty(d)) {
            let d = items[keep - 1];
            if let Some((s, l)) = self.parts(d) {
                let kept = self.trim_right_range(s, l, ws);
                self.set_parts(d, s, kept);
            }
        }
        keep as u32
    }
}
