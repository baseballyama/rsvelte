//! Lowers a document to `oxc_formatter_core`'s elements, so that oxc's printer prints it together
//! with the layouts oxc's own formatters build for the languages embedded in it.

use oxc_formatter_core::tag::{Condition, DedentMode, Group, GroupMode, Tag};
use oxc_formatter_core::{
    FormatContext, FormatElement, FormatOptions, Formatter, GroupId, IndentWidth, LineMode,
    PrintMode,
};

use crate::{GroupIdentifier, LayoutInstructionIdentifier, LayoutInstructions, LineKind, Node};

/// The document holds a layout only this crate's printer prints: a flat-only one.
#[derive(Debug, PartialEq, Eq)]
pub struct Unlowered;

/// What is left to write.
enum Step {
    Node(LayoutInstructionIdentifier),
    /// A tag, such as the end of a node already opened.
    Tag(Tag),
    /// A fill's item, in its entry.
    Entry(LayoutInstructionIdentifier),
}

struct Lowering<'d, 'e, 'a> {
    docs: &'d LayoutInstructions,
    embedded: &'e [&'e [FormatElement<'a>]],
    /// oxc's identifier of each named group, made when it is first written.
    groups: Vec<Option<GroupId>>,
    indent_width: IndentWidth,
    /// Documents nest as deep as their input, so the walk keeps its own stack.
    stack: Vec<Step>,
}

impl LayoutInstructions {
    /// Writes the document `root` to `f`, with `embedded[i]` for each
    /// [`LayoutInstructions::embedded`] node of index `i`.
    ///
    /// # Errors
    ///
    /// [`Unlowered`] if the document holds a flat-only layout.
    ///
    /// # Panics
    ///
    /// If an embedded node's index is not in `embedded`.
    pub fn lower<'a, C: FormatContext>(
        &self,
        root: LayoutInstructionIdentifier,
        embedded: &[&[FormatElement<'a>]],
        f: &mut Formatter<'_, 'a, C>,
    ) -> Result<(), Unlowered> {
        let mut lowering = Lowering {
            docs: self,
            embedded,
            groups: vec![None; self.groups as usize + 1],
            indent_width: f.options().indent_width(),
            stack: vec![Step::Node(root)],
        };
        while let Some(step) = lowering.stack.pop() {
            match step {
                Step::Node(identifier) => lowering.node(identifier, f)?,
                Step::Tag(tag) => f.write_element(FormatElement::Tag(tag)),
                Step::Entry(identifier) => {
                    f.write_element(FormatElement::Tag(Tag::StartEntry));
                    lowering.stack.push(Step::Tag(Tag::EndEntry));
                    lowering.stack.push(Step::Node(identifier));
                }
            }
        }
        Ok(())
    }
}

impl<'a> Lowering<'_, '_, 'a> {
    fn node<C: FormatContext>(
        &mut self,
        identifier: LayoutInstructionIdentifier,
        f: &mut Formatter<'_, 'a, C>,
    ) -> Result<(), Unlowered> {
        match self.docs.nodes[identifier.0 as usize] {
            Node::Static("") | Node::Text { len: 0, .. } => {}
            Node::Static(s) => f.write_element(FormatElement::text(s, self.indent_width)),
            n @ Node::Text { .. } => {
                let text = arena_text(self.docs.str_of(n), f);
                f.write_element(FormatElement::text(text, self.indent_width));
            }
            Node::Line(kind) => f.write_element(FormatElement::Line(line_mode(kind))),
            Node::BreakParent => f.write_element(FormatElement::ExpandParent),
            Node::Embedded { index, .. } => {
                f.write_elements(self.embedded[index as usize].iter().cloned());
            }
            Node::Concat { start, len } => self.children(start, len, Step::Node),
            Node::Group {
                start,
                len,
                breaks_line,
                identifier,
            } => {
                let id = identifier.map(|g| self.group(g, f));
                let mode = if breaks_line {
                    GroupMode::Expand
                } else {
                    GroupMode::Flat
                };
                let group = Group::new().with_id(id).with_mode(mode);
                self.open(f, Tag::StartGroup(group), Tag::EndGroup);
                self.children(start, len, Step::Node);
            }
            Node::Fill { start, len } => {
                self.open(f, Tag::StartFill, Tag::EndFill);
                self.children(start, len, Step::Entry);
            }
            Node::Indent(d) => {
                self.open(f, Tag::StartIndent, Tag::EndIndent);
                self.stack.push(Step::Node(d));
            }
            Node::Dedent(d) => {
                let level = DedentMode::Level;
                self.open(f, Tag::StartDedent(level), Tag::EndDedent(level));
                self.stack.push(Step::Node(d));
            }
            Node::IfBreak {
                broken,
                flat,
                group,
            } => {
                let id = group.map(|g| self.group(g, f));
                // Pushed in this order, the broken branch is written first.
                for (mode, d) in [(PrintMode::Flat, flat), (PrintMode::Expanded, broken)] {
                    self.stack.push(Step::Tag(Tag::EndConditionalContent));
                    self.stack.push(Step::Node(d));
                    let start =
                        Tag::StartConditionalContent(Condition::new(mode).with_group_id(id));
                    self.stack.push(Step::Tag(start));
                }
            }
            Node::IndentIfBreak { document, group } => {
                let id = self.group(group, f);
                let (start, end) = (
                    Tag::StartIndentIfGroupBreaks(id),
                    Tag::EndIndentIfGroupBreaks(id),
                );
                self.open(f, start, end);
                self.stack.push(Step::Node(document));
            }
            Node::FlatOnly { .. } => return Err(Unlowered),
        }
        Ok(())
    }

    /// Writes `start` and leaves `end` to write after what is pushed next.
    fn open<C>(&mut self, f: &mut Formatter<'_, 'a, C>, start: Tag, end: Tag) {
        f.write_element(FormatElement::Tag(start));
        self.stack.push(Step::Tag(end));
    }

    fn children(&mut self, start: u32, len: u32, step: fn(LayoutInstructionIdentifier) -> Step) {
        let children = self.docs.children(start, len);
        self.stack.extend(children.iter().rev().map(|&k| step(k)));
    }

    fn group<C>(&mut self, g: GroupIdentifier, f: &Formatter<'_, 'a, C>) -> GroupId {
        *self.groups[g.0.get() as usize].get_or_insert_with(|| f.state().group_id("document"))
    }
}

/// `text` in `f`'s arena. The source's `\r\n` reaches here only in text copied from it, and oxc's
/// printer writes line breaks as `\n` only.
fn arena_text<'a, C>(text: &str, f: &Formatter<'_, 'a, C>) -> &'a str {
    if text.contains('\r') {
        f.allocator().alloc_str(&text.replace("\r\n", "\n"))
    } else {
        f.allocator().alloc_str(text)
    }
}

const fn line_mode(kind: LineKind) -> LineMode {
    match kind {
        LineKind::Normal => LineMode::SoftOrSpace,
        LineKind::Soft => LineMode::Soft,
        // Prettier prints every hard line; oxc's `Hard` skips one at a line's start.
        LineKind::Hard => LineMode::ExactLineBreaks(std::num::NonZeroU32::MIN),
        LineKind::Literal => LineMode::Literal,
    }
}
