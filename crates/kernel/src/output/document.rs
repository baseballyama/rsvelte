//! A Prettier-compatible document IR and printer, shared by every formatter.
//!
//! Documents live in an arena ([`LayoutInstructions`]) and are addressed by
//! [`LayoutInstructionIdentifier`], so building a document allocates growing vectors instead of one
//! box per node. Text is either `&'static str` or a slice of the arena's string buffer.
//!
//! The printer is a port of Prettier's `printDocToString` (prettier 3.x): the same modes, the same
//! `fits` with its rest commands and `mustBeFlat`, the same `fill`, group identifiers for `ifBreak`
//! and `indentIfBreak`, re-measuring after a hard line in flat mode, and trailing-whitespace
//! trimming at hard lines only. A formatter that builds the same document as Prettier gets the same
//! text.
//!
//! One addition: [`LayoutInstructions::flat_only`] marks a layout whose broken form a formatter has
//! not ported. If it does not fit flat, [`LayoutInstructions::print`] refuses instead of printing a
//! layout Prettier would not.

use std::num::NonZeroU32;

pub use super::width::string_width;
use crate::performance::buffer_pool;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct LayoutInstructionIdentifier(u32);

impl LayoutInstructionIdentifier {
    #[must_use]
    pub const fn index(self) -> u32 {
        self.0
    }
}

/// Names a group so that [`LayoutInstructions::if_break_of`] and
/// [`LayoutInstructions::indent_if_break`] can follow its mode.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct GroupIdentifier(NonZeroU32);

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum LineKind {
    /// Space when flat.
    Normal,
    /// Nothing when flat.
    Soft,
    /// Always a newline; breaks enclosing groups.
    Hard,
    /// Always a newline, without indentation; breaks enclosing groups.
    Literal,
}

#[derive(Clone, Copy, Debug)]
enum Node {
    Static(&'static str),
    Text {
        start: u32,
        len: u32,
        width: u32,
    },
    Line(LineKind),
    Concat {
        start: u32,
        len: u32,
    },
    Group {
        start: u32,
        len: u32,
        breaks_line: bool,
        identifier: Option<GroupIdentifier>,
    },
    Fill {
        start: u32,
        len: u32,
    },
    Indent(LayoutInstructionIdentifier),
    /// Prettier's `dedent` (`align(-1)`): drops the innermost indentation level.
    Dedent(LayoutInstructionIdentifier),
    IfBreak {
        broken: LayoutInstructionIdentifier,
        flat: LayoutInstructionIdentifier,
        group: Option<GroupIdentifier>,
    },
    IndentIfBreak {
        document: LayoutInstructionIdentifier,
        group: GroupIdentifier,
    },
    BreakParent,
    FlatOnly(LayoutInstructionIdentifier),
}

/// The document arena. Its buffers come from and go back to [`crate::performance::buffer_pool`], so
/// a worker formatting one file after another reuses their capacity.
#[derive(Debug)]
pub struct LayoutInstructions {
    nodes: Vec<Node>,
    /// Per node, Prettier's `willBreak`: it holds a hard line, a break-parent or a group built
    /// broken. A node only refers to nodes made before it, so this is known when it is made, and
    /// it is also what Prettier's `propagateBreaks` leaves in a group's `break`.
    breaks: Vec<bool>,
    children: Vec<LayoutInstructionIdentifier>,
    buffer: String,
    groups: u32,
}

#[derive(Debug)]
pub struct PrintOptions {
    pub width: usize,
    /// `None` for tabs.
    pub indent_spaces: Option<usize>,
    /// Width of one tab of indentation.
    pub tab_width: usize,
}

impl Default for PrintOptions {
    fn default() -> Self {
        Self {
            width: 80,
            indent_spaces: Some(2),
            tab_width: 2,
        }
    }
}

/// A [`LayoutInstructions::flat_only`] layout did not fit on its line.
#[derive(Debug, PartialEq, Eq)]
pub struct Refused;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum TraceMode {
    Flat,
    Break,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum GroupDecision {
    Fits,
    DoesNotFit,
    Broken,
    ParentFlat,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum TraceEvent {
    Group {
        document: LayoutInstructionIdentifier,
        position: usize,
        remaining: isize,
        mode: TraceMode,
        decision: GroupDecision,
    },
    Fill {
        document: LayoutInstructionIdentifier,
        position: usize,
        content_fits: bool,
        separator_fits: Option<bool>,
    },
    Refused {
        document: LayoutInstructionIdentifier,
        position: usize,
    },
    Remeasure {
        position: usize,
    },
}

/// The arena's columns come from the thread's [`buffer_pool`], under this type's key, and go back
/// to it in the reverse order.
impl Default for LayoutInstructions {
    fn default() -> Self {
        Self {
            nodes: buffer_pool::take_keyed::<Self, _>(),
            breaks: buffer_pool::take_keyed::<Self, _>(),
            children: buffer_pool::take_keyed::<Self, _>(),
            buffer: buffer_pool::take_string::<Self>(),
            groups: 0,
        }
    }
}

impl Drop for LayoutInstructions {
    fn drop(&mut self) {
        buffer_pool::give_string::<Self>(std::mem::take(&mut self.buffer));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.children));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.breaks));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.nodes));
    }
}

impl LayoutInstructions {
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    fn push(&mut self, n: Node) -> LayoutInstructionIdentifier {
        let breaks = self.breaks_of(n);
        self.breaks.push(breaks);
        self.nodes.push(n);
        LayoutInstructionIdentifier(self.nodes.len() as u32 - 1)
    }

    #[expect(
        clippy::inline_always,
        reason = "out of line from `push`, which every constructor runs, it cost 0.37%"
    )]
    #[inline(always)]
    fn breaks_of(&self, n: Node) -> bool {
        let any =
            |children: &[LayoutInstructionIdentifier]| children.iter().any(|&k| self.will_break(k));
        match n {
            Node::Line(LineKind::Hard | LineKind::Literal) | Node::BreakParent => true,
            Node::Static(_) | Node::Text { .. } | Node::Line(_) => false,
            Node::Indent(d) | Node::Dedent(d) | Node::FlatOnly(d) => self.will_break(d),
            Node::IndentIfBreak { document, .. } => self.will_break(document),
            Node::IfBreak { broken, flat, .. } => self.will_break(broken) || self.will_break(flat),
            Node::Concat { start, len } | Node::Fill { start, len } => {
                any(self.children(start, len))
            }
            Node::Group {
                start,
                len,
                breaks_line,
                ..
            } => breaks_line || any(self.children(start, len)),
        }
    }

    fn list(&mut self, items: &[LayoutInstructionIdentifier]) -> (u32, u32) {
        let start = self.children.len() as u32;
        self.children.extend_from_slice(items);
        (start, items.len() as u32)
    }

    pub fn nil(&mut self) -> LayoutInstructionIdentifier {
        self.push(Node::Static(""))
    }

    pub fn lit(&mut self, s: &'static str) -> LayoutInstructionIdentifier {
        self.push(Node::Static(s))
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

    fn group_node(
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

    /// A layout whose broken form the formatter does not implement: printing refuses when it does
    /// not fit flat. Its lines print flat (spaces or nothing); hard lines still break.
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

    fn children(&self, start: u32, len: u32) -> &[LayoutInstructionIdentifier] {
        &self.children[start as usize..(start + len) as usize]
    }

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

    fn str_of(&self, n: Node) -> &str {
        match n {
            Node::Static(s) => s,
            Node::Text { start, len, .. } => &self.buffer[start as usize..(start + len) as usize],
            _ => "",
        }
    }

    /// # Errors
    ///
    /// [`Refused`] when a [`LayoutInstructions::flat_only`] document does not fit in the remaining
    /// width.
    pub fn print(
        &self,
        root: LayoutInstructionIdentifier,
        options: &PrintOptions,
    ) -> Result<String, Refused> {
        let mut trace = Vec::new();
        self.print_inner::<false>(root, options, &mut trace)
    }

    /// Prints through the same implementation as [`LayoutInstructions::print`] and records each
    /// layout choice.
    ///
    /// # Errors
    ///
    /// [`Refused`] when a [`LayoutInstructions::flat_only`] document does not fit in the remaining
    /// width.
    pub fn print_with_trace(
        &self,
        root: LayoutInstructionIdentifier,
        options: &PrintOptions,
        trace: &mut Vec<TraceEvent>,
    ) -> Result<String, Refused> {
        self.print_inner::<true>(root, options, trace)
    }

    fn print_inner<const TRACE: bool>(
        &self,
        root: LayoutInstructionIdentifier,
        options: &PrintOptions,
        trace: &mut Vec<TraceEvent>,
    ) -> Result<String, Refused> {
        let mut group_modes = buffer_pool::take();
        group_modes.resize(self.groups as usize + 1, None);
        let mut p = Printer::<TRACE> {
            docs: self,
            options,
            // The text is a lower bound of the output.
            out: String::with_capacity(self.buffer.len()),
            position: 0,
            group_modes,
            scratch: buffer_pool::take(),
            remeasure: false,
            refused: false,
            trace,
        };
        let mut stack = buffer_pool::take();
        p.run(root, &mut stack);
        buffer_pool::give(stack);
        buffer_pool::give(p.scratch);
        buffer_pool::give(p.group_modes);
        if p.refused { Err(Refused) } else { Ok(p.out) }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Mode {
    Flat,
    Break,
}

#[derive(Clone, Copy)]
enum Item {
    LayoutInstruction(LayoutInstructionIdentifier),
    /// The unprinted tail `children[start..start + len]` of a fill.
    Fill {
        start: u32,
        len: u32,
    },
    /// A fill's `[content, whitespace, secondContent]`, measured as one.
    Triple([LayoutInstructionIdentifier; 3]),
}

type Command = (u32, Mode, Item);

struct Printer<'a, const TRACE: bool> {
    docs: &'a LayoutInstructions,
    options: &'a PrintOptions,
    out: String,
    position: usize,
    group_modes: Vec<Option<Mode>>,
    /// [`Printer::fits`]'s work list, kept between calls.
    scratch: Vec<Command>,
    /// Prettier's `shouldRemeasure`: a hard line was printed in flat mode.
    remeasure: bool,
    refused: bool,
    trace: &'a mut Vec<TraceEvent>,
}

impl<const TRACE: bool> Printer<'_, TRACE> {
    fn trace(&mut self, event: TraceEvent) {
        if TRACE {
            self.trace.push(event);
        }
    }

    fn newline(&mut self, indentation: u32) {
        while self.out.ends_with([' ', '\t']) {
            self.out.pop();
        }
        self.out.push('\n');
        match self.options.indent_spaces {
            Some(n) => self
                .out
                .extend(std::iter::repeat_n(' ', n * indentation as usize)),
            None => self
                .out
                .extend(std::iter::repeat_n('\t', indentation as usize)),
        }
        self.position =
            indentation as usize * self.options.indent_spaces.unwrap_or(self.options.tab_width);
    }

    fn group_mode(&self, g: GroupIdentifier) -> Option<Mode> {
        self.group_modes[g.0.get() as usize]
    }

    fn if_break_branch(
        &self,
        mode: Mode,
        broken: LayoutInstructionIdentifier,
        flat: LayoutInstructionIdentifier,
        g: Option<GroupIdentifier>,
    ) -> LayoutInstructionIdentifier {
        let m = g.map_or(mode, |g| self.group_mode(g).unwrap_or(Mode::Flat));
        if m == Mode::Break { broken } else { flat }
    }

    #[expect(
        clippy::cast_possible_wrap,
        reason = "widths and columns are far below `isize::MAX`"
    )]
    const fn remaining(&self) -> isize {
        self.options.width as isize - self.position as isize
    }

    #[expect(
        clippy::too_many_lines,
        reason = "separate text arms saved 0.11% instructions"
    )]
    fn run(&mut self, root: LayoutInstructionIdentifier, stack: &mut Vec<Command>) {
        stack.push((0, Mode::Break, Item::LayoutInstruction(root)));
        while let Some((indentation, mode, item)) = stack.pop() {
            let identifier = match item {
                Item::LayoutInstruction(identifier) => identifier,
                Item::Fill { start, len } => {
                    self.fill(indentation, mode, start, len, stack);
                    continue;
                }
                Item::Triple(ds) => {
                    stack.extend(
                        ds.iter()
                            .rev()
                            .map(|&d| (indentation, mode, Item::LayoutInstruction(d))),
                    );
                    continue;
                }
            };
            match self.docs.nodes[identifier.0 as usize] {
                Node::Static(s) => {
                    self.position += string_width(s);
                    self.out.push_str(s);
                }
                n @ Node::Text { width, .. } => {
                    self.position += width as usize;
                    self.out.push_str(self.docs.str_of(n));
                }
                Node::Line(kind) => {
                    if mode == Mode::Flat {
                        match kind {
                            LineKind::Normal => {
                                self.out.push(' ');
                                self.position += 1;
                                continue;
                            }
                            LineKind::Soft => continue,
                            LineKind::Hard | LineKind::Literal => {
                                self.remeasure = true;
                                self.trace(TraceEvent::Remeasure {
                                    position: self.position,
                                });
                            }
                        }
                    }
                    if kind == LineKind::Literal {
                        self.out.push('\n');
                        self.position = 0;
                    } else {
                        self.newline(indentation);
                    }
                }
                Node::BreakParent => {}
                Node::Concat { start, len } => {
                    let children = self.docs.children(start, len);
                    stack.extend(
                        children
                            .iter()
                            .rev()
                            .map(|&k| (indentation, mode, Item::LayoutInstruction(k))),
                    );
                }
                Node::Indent(d) => stack.push((indentation + 1, mode, Item::LayoutInstruction(d))),
                Node::Dedent(d) => stack.push((
                    indentation.saturating_sub(1),
                    mode,
                    Item::LayoutInstruction(d),
                )),
                Node::IfBreak {
                    broken,
                    flat,
                    group,
                } => {
                    let d = self.if_break_branch(mode, broken, flat, group);
                    stack.push((indentation, mode, Item::LayoutInstruction(d)));
                }
                Node::IndentIfBreak { document, group } => {
                    let extra = u32::from(self.group_mode(group) == Some(Mode::Break));
                    stack.push((indentation + extra, mode, Item::LayoutInstruction(document)));
                }
                Node::FlatOnly(d) => {
                    if mode == Mode::Break
                        && !self.fits(
                            &[(indentation, Mode::Flat, Item::LayoutInstruction(d))],
                            stack,
                            self.remaining(),
                            false,
                        )
                    {
                        // The caller gets `Refused`, not the text: stop here.
                        self.refused = true;
                        self.trace(TraceEvent::Refused {
                            document: identifier,
                            position: self.position,
                        });
                        return;
                    }
                    stack.push((indentation, Mode::Flat, Item::LayoutInstruction(d)));
                }
                Node::Group {
                    start,
                    len,
                    identifier: gid,
                    ..
                } => {
                    let (next, decision) = self.choose_group(identifier, indentation, mode, stack);
                    self.trace(TraceEvent::Group {
                        document: identifier,
                        position: self.position,
                        remaining: self.remaining(),
                        mode: match next {
                            Mode::Flat => TraceMode::Flat,
                            Mode::Break => TraceMode::Break,
                        },
                        decision,
                    });
                    if let Some(g) = gid {
                        self.group_modes[g.0.get() as usize] = Some(next);
                    }
                    let children = self.docs.children(start, len);
                    stack.extend(
                        children
                            .iter()
                            .rev()
                            .map(|&k| (indentation, next, Item::LayoutInstruction(k))),
                    );
                }
                Node::Fill { start, len } => {
                    stack.push((indentation, mode, Item::Fill { start, len }));
                }
            }
        }
    }

    fn choose_group(
        &mut self,
        identifier: LayoutInstructionIdentifier,
        indentation: u32,
        mode: Mode,
        stack: &[Command],
    ) -> (Mode, GroupDecision) {
        let breaks_line = self.docs.will_break(identifier);
        if mode == Mode::Flat && !self.remeasure {
            if breaks_line {
                (Mode::Break, GroupDecision::Broken)
            } else {
                (Mode::Flat, GroupDecision::ParentFlat)
            }
        } else {
            self.remeasure = false;
            let flat = [(indentation, Mode::Flat, Item::LayoutInstruction(identifier))];
            if breaks_line {
                (Mode::Break, GroupDecision::Broken)
            } else if self.fits(&flat, stack, self.remaining(), false) {
                (Mode::Flat, GroupDecision::Fits)
            } else {
                (Mode::Break, GroupDecision::DoesNotFit)
            }
        }
    }

    fn fill(
        &mut self,
        indentation: u32,
        mode: Mode,
        start: u32,
        len: u32,
        stack: &mut Vec<Command>,
    ) {
        if len == 0 {
            return;
        }
        let children = self.docs.children(start, len);
        let content = children[0];
        let content_fits = self.fits(
            &[(indentation, Mode::Flat, Item::LayoutInstruction(content))],
            &[],
            self.remaining(),
            true,
        );
        let content_mode = if content_fits {
            Mode::Flat
        } else {
            Mode::Break
        };
        if len == 1 {
            self.trace(TraceEvent::Fill {
                document: content,
                position: self.position,
                content_fits,
                separator_fits: None,
            });
            stack.push((indentation, content_mode, Item::LayoutInstruction(content)));
            return;
        }
        let ws = children[1];
        if len == 2 {
            self.trace(TraceEvent::Fill {
                document: content,
                position: self.position,
                content_fits,
                separator_fits: None,
            });
            stack.push((indentation, content_mode, Item::LayoutInstruction(ws)));
            stack.push((indentation, content_mode, Item::LayoutInstruction(content)));
            return;
        }
        let pair = [(
            indentation,
            Mode::Flat,
            Item::Triple([content, ws, children[2]]),
        )];
        let separator_fits = self.fits(&pair, &[], self.remaining(), true);
        let ws_mode = if separator_fits {
            Mode::Flat
        } else {
            Mode::Break
        };
        self.trace(TraceEvent::Fill {
            document: content,
            position: self.position,
            content_fits,
            separator_fits: Some(separator_fits),
        });
        let rest = Item::Fill {
            start: start + 2,
            len: len - 2,
        };
        stack.push((indentation, mode, rest));
        stack.push((indentation, ws_mode, Item::LayoutInstruction(ws)));
        stack.push((indentation, content_mode, Item::LayoutInstruction(content)));
    }

    /// Prettier's `fits`: whether `next` fits in `remaining` columns, continuing into `rest` (in
    /// its own modes) until the first line break. The work list is kept between calls.
    fn fits(
        &mut self,
        next: &[Command],
        rest: &[Command],
        remaining: isize,
        must_be_flat: bool,
    ) -> bool {
        let mut work = std::mem::take(&mut self.scratch);
        work.clear();
        work.extend(next.iter().rev().copied());
        let fits = self.fits_in(&mut work, rest, remaining, must_be_flat);
        self.scratch = work;
        fits
    }

    #[expect(
        clippy::cast_possible_wrap,
        reason = "a string's width is far below `isize::MAX`"
    )]
    fn fits_in(
        &self,
        work: &mut Vec<Command>,
        rest: &[Command],
        mut remaining: isize,
        must_be_flat: bool,
    ) -> bool {
        let mut rest_i = rest.len();
        while remaining >= 0 {
            let Some((indentation, mode, item)) = work.pop() else {
                if rest_i == 0 {
                    return true;
                }
                rest_i -= 1;
                work.push(rest[rest_i]);
                continue;
            };
            let identifier = match item {
                Item::LayoutInstruction(identifier) => identifier,
                Item::Fill { start, len } => {
                    let children = self.docs.children(start, len);
                    work.extend(
                        children
                            .iter()
                            .rev()
                            .map(|&k| (indentation, mode, Item::LayoutInstruction(k))),
                    );
                    continue;
                }
                Item::Triple(ds) => {
                    work.extend(
                        ds.iter()
                            .rev()
                            .map(|&d| (indentation, mode, Item::LayoutInstruction(d))),
                    );
                    continue;
                }
            };
            match self.docs.nodes[identifier.0 as usize] {
                Node::Static(s) => remaining -= string_width(s) as isize,
                Node::Text { width, .. } => remaining -= width as isize,
                Node::Line(kind) => {
                    if mode == Mode::Break || matches!(kind, LineKind::Hard | LineKind::Literal) {
                        return true;
                    }
                    if kind == LineKind::Normal {
                        remaining -= 1;
                    }
                }
                Node::BreakParent => {}
                Node::Concat { start, len } | Node::Fill { start, len } => {
                    let children = self.docs.children(start, len);
                    work.extend(
                        children
                            .iter()
                            .rev()
                            .map(|&k| (indentation, mode, Item::LayoutInstruction(k))),
                    );
                }
                Node::Group { start, len, .. } => {
                    let breaks_line = self.docs.will_break(identifier);
                    if must_be_flat && breaks_line {
                        return false;
                    }
                    let m = if breaks_line { Mode::Break } else { mode };
                    let children = self.docs.children(start, len);
                    work.extend(
                        children
                            .iter()
                            .rev()
                            .map(|&k| (indentation, m, Item::LayoutInstruction(k))),
                    );
                }
                Node::Indent(d) | Node::Dedent(d) | Node::IndentIfBreak { document: d, .. } => {
                    work.push((indentation, mode, Item::LayoutInstruction(d)));
                }
                Node::FlatOnly(d) => {
                    work.push((indentation, Mode::Flat, Item::LayoutInstruction(d)));
                }
                Node::IfBreak {
                    broken,
                    flat,
                    group,
                } => {
                    let d = self.if_break_branch(mode, broken, flat, group);
                    work.push((indentation, mode, Item::LayoutInstruction(d)));
                }
            }
        }
        false
    }
}

// Literals stay pointers rather than being copied into the text: removing `Static` makes a node
// 16 bytes but costs more instructions and bytes than it saves (measured by `tools/performance`).
#[cfg(target_pointer_width = "64")]
const _: () = assert!(size_of::<Node>() == 24, "`Node` is 24 bytes");
#[cfg(target_pointer_width = "64")]
const _: () = assert!(size_of::<Command>() == 24, "`Command` is 24 bytes");
const _: () = assert!(
    size_of::<Option<GroupIdentifier>>() == 4,
    "`Option<GroupIdentifier>` is 4 bytes"
);

#[cfg(test)]
mod tests {
    use super::*;

    fn call(d: &mut LayoutInstructions, arguments: &[&str]) -> LayoutInstructionIdentifier {
        let open = d.lit("f(");
        let mut inner = Vec::new();
        for (i, a) in arguments.iter().enumerate() {
            if i > 0 {
                inner.push(d.lit(","));
                inner.push(d.line());
            }
            inner.push(d.text(a));
        }
        let inner = d.concat(&inner);
        let soft = d.softline();
        let body = d.concat(&[soft, inner]);
        let body = d.indent(body);
        let soft2 = d.softline();
        let close = d.lit(")");
        d.group(&[open, body, soft2, close])
    }

    fn print(
        d: &LayoutInstructions,
        root: LayoutInstructionIdentifier,
        options: &PrintOptions,
    ) -> String {
        d.print(root, options).expect("no flat-only layouts")
    }

    /// Prettier's `propagateBreaks` breaks a group around a group built broken, not only around
    /// hard lines: Prettier prints this `x\ny`.
    #[test]
    fn a_group_built_broken_breaks_its_parent() {
        let mut d = LayoutInstructions::new();
        let (x, y) = (d.lit("x"), d.lit("y"));
        let inner = d.group_broken(&[y]);
        let line = d.line();
        let outer = d.group(&[x, line, inner]);
        assert!(d.will_break(outer));
        assert_eq!(print(&d, outer, &PrintOptions::default()), "x\ny");
    }

    /// Prettier propagates breaks at print time, after a trim: a hard line trimmed away breaks
    /// nothing, here or in the groups around it.
    #[test]
    fn a_trimmed_hard_line_no_longer_breaks() {
        let mut d = LayoutInstructions::new();
        let (a, x) = (d.lit("a"), d.lit("x"));
        let hard = d.hardline();
        let inner = d.concat(&[x, hard]);
        let line = d.line();
        let outer = d.group(&[a, line, inner]);
        let mut docs = vec![outer];
        d.trim_right(&mut docs, LayoutInstructions::is_line);
        assert!(!d.will_break(inner) && !d.will_break(outer));
        assert_eq!(print(&d, outer, &PrintOptions::default()), "a x");
    }

    #[test]
    fn group_prints_flat_when_it_fits_and_breaks_otherwise() {
        let mut d = LayoutInstructions::new();
        let g = call(&mut d, &["a", "b"]);
        assert_eq!(print(&d, g, &PrintOptions::default()), "f(a, b)");
        let mut d = LayoutInstructions::new();
        let long = "x".repeat(50);
        let g = call(&mut d, &[&long, &long]);
        assert_eq!(
            print(&d, g, &PrintOptions::default()),
            format!("f(\n  {long},\n  {long}\n)")
        );
    }

    #[test]
    fn traced_print_uses_the_production_printer() {
        let mut d = LayoutInstructions::new();
        let long = "x".repeat(50);
        let g = call(&mut d, &[&long, &long]);
        let mut trace = Vec::new();
        let out = d
            .print_with_trace(g, &PrintOptions::default(), &mut trace)
            .expect("no flat-only layouts");
        assert_eq!(out, format!("f(\n  {long},\n  {long}\n)"));
        assert_eq!(
            trace,
            vec![TraceEvent::Group {
                document: g,
                position: 0,
                remaining: 80,
                mode: TraceMode::Break,
                decision: GroupDecision::DoesNotFit,
            }]
        );
    }

    #[test]
    fn hardline_breaks_enclosing_groups_and_trims_trailing_space() {
        let mut d = LayoutInstructions::new();
        let a = d.lit("a ");
        let hard = d.hardline();
        let b = d.lit("b");
        let inner = d.concat(&[a, hard, b]);
        let indentation = d.indent(inner);
        let line = d.line();
        let group = d.group(&[indentation, line]);
        let options = PrintOptions {
            indent_spaces: None,
            ..Default::default()
        };
        assert_eq!(print(&d, group, &options), "a\n\tb\n");
    }

    #[test]
    fn text_parts_is_the_text_of_its_parts_joined() {
        let mut d = LayoutInstructions::new();
        let a = d.text_parts(&["</", "div", ">"]);
        let b = d.text_parts(&[]);
        assert_eq!((d.as_str(a), d.as_str(b)), (Some("</div>"), Some("")));
        let root = d.concat(&[a, b]);
        assert_eq!(print(&d, root, &PrintOptions::default()), "</div>");
    }

    #[test]
    fn literal_line_keeps_trailing_space_and_skips_indentation() {
        let mut d = LayoutInstructions::new();
        let a = d.lit("a ");
        let l = d.literalline();
        let b = d.lit("b");
        let inner = d.concat(&[a, l, b]);
        let indentation = d.indent(inner);
        assert_eq!(print(&d, indentation, &PrintOptions::default()), "a \nb");
    }

    #[test]
    fn fill_packs_words() {
        let mut d = LayoutInstructions::new();
        let mut items = Vec::new();
        for i in 0..30 {
            if i > 0 {
                items.push(d.line());
            }
            items.push(d.lit("word"));
        }
        let f = d.fill(&items);
        let options = PrintOptions {
            width: 20,
            ..Default::default()
        };
        let out = print(&d, f, &options);
        assert!(out.lines().all(|l| l.len() <= 20), "{out}");
        assert_eq!(out.lines().next().unwrap(), "word word word word");
    }

    #[test]
    fn fill_breaks_the_separator_after_content_holding_a_broken_group() {
        let mut d = LayoutInstructions::new();
        let a = d.lit("a");
        let line = d.line();
        let b = d.lit("b");
        let content = d.group_broken(&[a, line, b]);
        let sep = d.line();
        let c = d.lit("c");
        let filled = d.fill(&[content, sep, c]);
        assert_eq!(print(&d, filled, &PrintOptions::default()), "a\nb\nc");
    }

    #[test]
    fn if_break_follows_a_named_group() {
        let mut d = LayoutInstructions::new();
        let identifier = d.new_group_identifier();
        let long = d.text(&"x".repeat(90));
        let l = d.line();
        let g = d.group_with_identifier(&[long, l], identifier);
        let yes = d.lit("broken");
        let no = d.lit("flat");
        let ib = d.if_break_of(yes, no, identifier);
        let root = d.concat(&[g, ib]);
        assert!(print(&d, root, &PrintOptions::default()).ends_with("\nbroken"));
    }

    #[test]
    fn flat_only_refuses_when_it_does_not_fit() {
        let mut d = LayoutInstructions::new();
        let short = d.lit("short");
        let ok = d.flat_only(short);
        assert_eq!(d.print(ok, &PrintOptions::default()), Ok("short".into()));
        let mut d = LayoutInstructions::new();
        let long = d.text(&"x".repeat(90));
        let bad = d.flat_only(long);
        assert_eq!(d.print(bad, &PrintOptions::default()), Err(Refused));
    }

    #[test]
    fn trim_descends_into_the_last_part() {
        let mut d = LayoutInstructions::new();
        let a = d.lit("a");
        let h = d.hardline();
        let inner = d.concat(&[a, h]);
        let mut docs = vec![inner];
        d.trim_right(&mut docs, LayoutInstructions::is_line);
        let root = d.concat(&docs);
        assert_eq!(print(&d, root, &PrintOptions::default()), "a");
    }
}
