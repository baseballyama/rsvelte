//! The constructors: each node is pushed after the nodes it refers to.

use std::num::NonZeroU32;

use crate::width::is_printable_ascii;
use crate::{
    GroupIdentifier, LayoutInstructionIdentifier, LayoutInstructions, LineKind, Measure, Node,
    string_width,
};

impl LayoutInstructions {
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    #[expect(
        clippy::inline_always,
        reason = "inlined into each constructor, `measure_of` folds to that constructor's node kind"
    )]
    #[inline(always)]
    pub(crate) fn push(&mut self, n: Node) -> LayoutInstructionIdentifier {
        let measure = self.measure_of(n);
        self.measures.push(measure);
        self.nodes.push(n);
        LayoutInstructionIdentifier(self.nodes.len() as u32 - 1)
    }

    #[expect(
        clippy::inline_always,
        reason = "out of line from `push`, which every constructor runs, it cost 0.37%"
    )]
    #[inline(always)]
    pub(crate) fn measure_of(&self, n: Node) -> Measure {
        let list = |children: &[LayoutInstructionIdentifier]| {
            children
                .iter()
                .fold(Measure::flat(0), |m, &k| m.then(self.measure(k)))
        };
        match n {
            Node::Line(LineKind::Hard | LineKind::Literal) | Node::BreakParent => Measure::BREAKING,
            Node::Static(s) => Measure::flat(s.len() as u32),
            Node::Text { width, .. } => Measure::flat(width),
            Node::Line(LineKind::Normal) => Measure::flat(1),
            Node::Line(LineKind::Soft) => Measure::flat(0),
            Node::Indent(d) | Node::Dedent(d) | Node::FlatOnly(d) => self.measure(d),
            Node::IndentIfBreak { document, .. } => self.measure(document),
            Node::IfBreak {
                broken,
                flat,
                group,
            } => {
                if self.will_break(broken) || self.will_break(flat) {
                    Measure::BREAKING
                } else if group.is_some() {
                    Measure::WALKED
                } else {
                    self.measure(flat)
                }
            }
            Node::Concat { start, len } | Node::Fill { start, len } => {
                list(self.children(start, len))
            }
            Node::Group {
                start,
                len,
                breaks_line,
                ..
            } => {
                if breaks_line {
                    Measure::BREAKING
                } else {
                    list(self.children(start, len))
                }
            }
        }
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
            width: string_width(&self.buffer[start..]) as u32,
        })
    }

    pub fn text(&mut self, s: &str) -> LayoutInstructionIdentifier {
        let start = self.buffer.len() as u32;
        self.buffer.push_str(s);
        self.push(Node::Text {
            start,
            len: s.len() as u32,
            width: string_width(s) as u32,
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

    pub fn concat(&mut self, items: &[LayoutInstructionIdentifier]) -> LayoutInstructionIdentifier {
        let (start, len) = self.list(items);
        self.push(Node::Concat { start, len })
    }

    pub fn group(&mut self, items: &[LayoutInstructionIdentifier]) -> LayoutInstructionIdentifier {
        self.group_node(items, false, None)
    }

    /// Prettier's `group(…, { shouldBreak: true })`.
    pub fn group_broken(
        &mut self,
        items: &[LayoutInstructionIdentifier],
    ) -> LayoutInstructionIdentifier {
        self.group_node(items, true, None)
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
        self.group_node(items, false, Some(identifier))
    }

    pub(crate) fn group_node(
        &mut self,
        items: &[LayoutInstructionIdentifier],
        breaks_line: bool,
        identifier: Option<GroupIdentifier>,
    ) -> LayoutInstructionIdentifier {
        let (start, len) = self.list(items);
        self.push(Node::Group {
            start,
            len,
            breaks_line,
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

    pub fn if_break(
        &mut self,
        broken: LayoutInstructionIdentifier,
        flat: LayoutInstructionIdentifier,
    ) -> LayoutInstructionIdentifier {
        self.push(Node::IfBreak {
            broken,
            flat,
            group: None,
        })
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
            group: Some(group),
        })
    }

    pub fn indent_if_break(
        &mut self,
        document: LayoutInstructionIdentifier,
        group: GroupIdentifier,
    ) -> LayoutInstructionIdentifier {
        self.push(Node::IndentIfBreak { document, group })
    }

    /// Refuses a layout that does not fit flat. Hard lines still break.
    pub fn flat_only(&mut self, d: LayoutInstructionIdentifier) -> LayoutInstructionIdentifier {
        self.push(Node::FlatOnly(d))
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
