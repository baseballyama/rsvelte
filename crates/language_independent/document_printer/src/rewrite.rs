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

    fn replace_parts(
        &mut self,
        owner: LayoutInstructionIdentifier,
        parts: &[LayoutInstructionIdentifier],
    ) {
        let (s, l) = self.list(parts);
        match &mut self.nodes[owner.0 as usize] {
            Node::Concat { start, len }
            | Node::Fill { start, len }
            | Node::Group { start, len, .. } => {
                *start = s;
                *len = l;
            }
            _ => unreachable!("only lists have parts"),
        }
        // Removing parts can only clear a break, and trims run innermost first, so the parts'
        // answers are already current.
        let i = owner.0 as usize;
        if self.breaks[i] {
            self.breaks[i] = self.breaks_of(self.nodes[i]);
        }
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

    pub fn trim_left(
        &mut self,
        docs: &mut Vec<LayoutInstructionIdentifier>,
        ws: fn(&Self, LayoutInstructionIdentifier) -> bool,
    ) {
        let first = docs
            .iter()
            .position(|&d| !self.is_empty(d) && !ws(self, d))
            .unwrap_or(docs.len());
        if first > 0 {
            let removed: Vec<LayoutInstructionIdentifier> = docs.drain(..first).collect();
            if removed.iter().all(|&d| self.is_empty(d)) {
                self.trim_left(docs, ws);
            }
        } else if let Some(&d) = docs.first()
            && let Some((start, len)) = self.parts(d)
        {
            let mut inner = self.children(start, len).to_vec();
            self.trim_left(&mut inner, ws);
            self.replace_parts(d, &inner);
        }
    }

    pub fn trim_right(
        &mut self,
        docs: &mut Vec<LayoutInstructionIdentifier>,
        ws: fn(&Self, LayoutInstructionIdentifier) -> bool,
    ) {
        let keep = docs
            .iter()
            .rposition(|&d| !self.is_empty(d) && !ws(self, d))
            .map_or(0, |i| i + 1);
        if keep < docs.len() {
            let removed: Vec<LayoutInstructionIdentifier> = docs.drain(keep..).collect();
            if removed.iter().all(|&d| self.is_empty(d)) {
                self.trim_right(docs, ws);
            }
        } else if let Some(&d) = docs.last()
            && let Some((start, len)) = self.parts(d)
        {
            let mut inner = self.children(start, len).to_vec();
            self.trim_right(&mut inner, ws);
            self.replace_parts(d, &inner);
        }
    }
}
