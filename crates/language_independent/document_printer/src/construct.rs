//! The constructors: each node is pushed after the nodes it refers to.

use std::num::NonZeroU32;

use crate::width::is_printable_ascii;
use crate::{GroupIdentifier, LayoutInstructionIdentifier, LayoutInstructions, LineKind, Node};

impl LayoutInstructions {
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    pub(crate) fn push(&mut self, n: Node) -> LayoutInstructionIdentifier {
        self.nodes.push(n);
        LayoutInstructionIdentifier(self.nodes.len() as u32 - 1)
    }

    pub(crate) fn list(&mut self, items: &[LayoutInstructionIdentifier]) -> (u32, u32) {
        let start = self.children.len() as u32;
        self.children.extend_from_slice(items);
        (start, items.len() as u32)
    }

    pub fn nil(&mut self) -> LayoutInstructionIdentifier {
        self.push(Node::Static(""))
    }

    pub fn lit(&mut self, s: &'static str) -> LayoutInstructionIdentifier {
        if is_printable_ascii(s) {
            self.push(Node::Static(s))
        } else {
            self.text(s)
        }
    }

    /// [`LayoutInstructions::text`] of `parts` written one after another, without building the
    /// string first.
    pub fn text_parts(&mut self, parts: &[&str]) -> LayoutInstructionIdentifier {
        let start = self.buffer.len();
        for p in parts {
            self.buffer.push_str(p);
        }
        self.push(Node::Text {
            start: start as u32,
            len: (self.buffer.len() - start) as u32,
        })
    }

    pub fn text(&mut self, s: &str) -> LayoutInstructionIdentifier {
        let start = self.buffer.len() as u32;
        self.buffer.push_str(s);
        self.push(Node::Text {
            start,
            len: s.len() as u32,
        })
    }

    pub fn line(&mut self) -> LayoutInstructionIdentifier {
        self.push(Node::Line(LineKind::Normal))
    }

    pub fn softline(&mut self) -> LayoutInstructionIdentifier {
        self.push(Node::Line(LineKind::Soft))
    }

    pub fn hardline(&mut self) -> LayoutInstructionIdentifier {
        self.push(Node::Line(LineKind::Hard))
    }

    pub fn literalline(&mut self) -> LayoutInstructionIdentifier {
        self.push(Node::Line(LineKind::Literal))
    }

    pub fn break_parent(&mut self) -> LayoutInstructionIdentifier {
        self.push(Node::BreakParent)
    }

    /// The `index`th of the layouts [`LayoutInstructions::lower`] is given.
    pub fn embedded(&mut self, index: u32) -> LayoutInstructionIdentifier {
        self.push(Node::Embedded(index))
    }

    pub fn concat(&mut self, items: &[LayoutInstructionIdentifier]) -> LayoutInstructionIdentifier {
        let (start, len) = self.list(items);
        self.push(Node::Concat { start, len })
    }

    pub fn group(&mut self, items: &[LayoutInstructionIdentifier]) -> LayoutInstructionIdentifier {
        self.group_node(items, None)
    }

    /// # Panics
    ///
    /// If more than `u32::MAX` group identifiers are created.
    pub const fn new_group_identifier(&mut self) -> GroupIdentifier {
        self.groups += 1;
        GroupIdentifier(NonZeroU32::new(self.groups).expect("counter starts at 1"))
    }

    /// Prettier's `group(…, { identifier })`.
    pub fn group_with_identifier(
        &mut self,
        items: &[LayoutInstructionIdentifier],
        identifier: GroupIdentifier,
    ) -> LayoutInstructionIdentifier {
        self.group_node(items, Some(identifier))
    }

    pub(crate) fn group_node(
        &mut self,
        items: &[LayoutInstructionIdentifier],
        identifier: Option<GroupIdentifier>,
    ) -> LayoutInstructionIdentifier {
        let (start, len) = self.list(items);
        self.push(Node::Group {
            start,
            len,
            identifier,
        })
    }

    /// Alternating content and separators: `[c0, sep0, c1, sep1, c2, …]`.
    pub fn fill(&mut self, items: &[LayoutInstructionIdentifier]) -> LayoutInstructionIdentifier {
        let (start, len) = self.list(items);
        self.push(Node::Fill { start, len })
    }

    pub fn indent(&mut self, d: LayoutInstructionIdentifier) -> LayoutInstructionIdentifier {
        self.push(Node::Indent(d))
    }

    pub fn dedent(&mut self, d: LayoutInstructionIdentifier) -> LayoutInstructionIdentifier {
        self.push(Node::Dedent(d))
    }

    /// `ifBreak(broken, flat, { groupIdentifier })`: follows the named group instead of the
    /// enclosing one.
    pub fn if_break_of(
        &mut self,
        broken: LayoutInstructionIdentifier,
        flat: LayoutInstructionIdentifier,
        group: GroupIdentifier,
    ) -> LayoutInstructionIdentifier {
        self.push(Node::IfBreak {
            broken,
            flat,
            group,
        })
    }

    pub fn indent_if_break(
        &mut self,
        document: LayoutInstructionIdentifier,
        group: GroupIdentifier,
    ) -> LayoutInstructionIdentifier {
        self.push(Node::IndentIfBreak { document, group })
    }

    /// Prettier's `replaceEndOfLine(text, literalline)`: pushes the lines of `text` onto `out`
    /// with a literal line between each two.
    pub fn replace_end_of_line(&mut self, text: &str, out: &mut Vec<LayoutInstructionIdentifier>) {
        for (i, line) in text.split('\n').enumerate() {
            if i > 0 {
                out.push(self.literalline());
            }
            out.push(self.text(line));
        }
    }

    /// Prettier's `join(sep, docs)`.
    #[must_use]
    pub fn join(
        &self,
        sep: LayoutInstructionIdentifier,
        items: &[LayoutInstructionIdentifier],
    ) -> Vec<LayoutInstructionIdentifier> {
        let mut out = Vec::with_capacity(items.len() * 2);
        for (i, &d) in items.iter().enumerate() {
            if i > 0 {
                out.push(sep);
            }
            out.push(d);
        }
        out
    }
}
