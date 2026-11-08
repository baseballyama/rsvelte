//! Read-only questions about a document.

use crate::{LayoutInstructionIdentifier, LayoutInstructions, Node};

impl LayoutInstructions {
    pub(crate) fn children(&self, start: u32, len: u32) -> &[LayoutInstructionIdentifier] {
        &self.children[start as usize..(start + len) as usize]
    }

    /// prettier-plugin-svelte's `isEmptyDoc`.
    #[must_use]
    pub fn is_empty(&self, d: LayoutInstructionIdentifier) -> bool {
        match self.nodes[d.0 as usize] {
            n @ (Node::Static(_) | Node::Text { .. }) => self.str_of(n).is_empty(),
            Node::Line(_) => true,
            Node::Concat { len, .. } | Node::Group { len, .. } => len == 0,
            Node::Indent(x) | Node::Dedent(x) | Node::FlatOnly(x) => self.is_empty(x),
            Node::IndentIfBreak { document, .. } => self.is_empty(document),
            Node::Fill { start, len } => {
                self.children(start, len).iter().all(|&k| self.is_empty(k))
            }
            Node::IfBreak { .. } | Node::BreakParent => false,
        }
    }

    /// prettier-plugin-svelte's `isLine`.
    #[must_use]
    pub fn is_line(&self, d: LayoutInstructionIdentifier) -> bool {
        match self.nodes[d.0 as usize] {
            Node::Line(_) => true,
            Node::Concat { start, len } => {
                self.children(start, len).iter().all(|&k| self.is_line(k))
            }
            _ => false,
        }
    }

    /// Prettier's `willBreak`: the document holds a hard line, a break-parent or a broken group.
    ///
    /// # Panics
    ///
    /// If `d` was made by another [`LayoutInstructions`].
    #[must_use]
    pub fn will_break(&self, d: LayoutInstructionIdentifier) -> bool {
        self.breaks[d.0 as usize]
    }

    #[must_use]
    pub fn is_break_parent(&self, d: LayoutInstructionIdentifier) -> bool {
        matches!(self.nodes[d.0 as usize], Node::BreakParent)
    }

    /// The literal text of a text node, if `d` is one.
    #[must_use]
    pub fn as_str(&self, d: LayoutInstructionIdentifier) -> Option<&str> {
        match self.nodes[d.0 as usize] {
            n @ (Node::Static(_) | Node::Text { .. }) => Some(self.str_of(n)),
            _ => None,
        }
    }

    pub(crate) fn str_of(&self, n: Node) -> &str {
        match n {
            Node::Static(s) => s,
            Node::Text { start, len, .. } => &self.buffer[start as usize..(start + len) as usize],
            _ => "",
        }
    }
}
