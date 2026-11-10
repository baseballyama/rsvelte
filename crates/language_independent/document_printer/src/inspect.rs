//! Read-only questions about a document.

use crate::{LayoutInstructionIdentifier, LayoutInstructions, Measure, Node};

impl LayoutInstructions {
    pub(crate) fn children(&self, start: u32, len: u32) -> &[LayoutInstructionIdentifier] {
        &self.children[start as usize..(start + len) as usize]
    }

    /// prettier-plugin-svelte's `isEmptyDoc`.
    #[must_use]
    pub fn is_empty(&self, mut d: LayoutInstructionIdentifier) -> bool {
        // Wrappers nest as deep as the input, so they are followed by a loop.
        loop {
            match self.nodes[d.0 as usize] {
                n @ (Node::Static(_) | Node::Text { .. }) => return self.str_of(n).is_empty(),
                Node::Line(_) => return true,
                Node::Concat { len, .. } | Node::Group { len, .. } => return len == 0,
                Node::Indent(x) | Node::Dedent(x) | Node::FlatOnly { content: x, .. } => d = x,
                Node::IndentIfBreak { document, .. } => d = document,
                Node::Fill { start, len } => {
                    return self.children(start, len).iter().all(|&k| self.is_empty(k));
                }
                Node::IfBreak { .. } | Node::BreakParent | Node::Embedded { .. } => return false,
            }
        }
    }

    /// prettier-plugin-svelte's `isLine`.
    #[must_use]
    pub fn is_line(&self, d: LayoutInstructionIdentifier) -> bool {
        // Concats nest as deep as the input, so they are opened from a stack, first child on top
        // so that a doc that is not a line ends the walk as early as the recursion did.
        let mut pending = vec![d];
        while let Some(d) = pending.pop() {
            match self.nodes[d.0 as usize] {
                Node::Line(_) => {}
                Node::Concat { start, len } => {
                    pending.extend(self.children(start, len).iter().rev());
                }
                _ => return false,
            }
        }
        true
    }

    /// Prettier's `willBreak`: the document holds a hard line, a break-parent or a broken group.
    ///
    /// # Panics
    ///
    /// If `d` was made by another [`LayoutInstructions`].
    #[must_use]
    pub fn will_break(&self, d: LayoutInstructionIdentifier) -> bool {
        self.measure(d).breaks()
    }

    pub(crate) fn measure(&self, d: LayoutInstructionIdentifier) -> Measure {
        self.measures[d.0 as usize]
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
