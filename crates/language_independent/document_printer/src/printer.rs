//! The printer: a port of Prettier's `printDocToString`.

use rsvelte_kernel::performance::buffer_pool;

use crate::{
    Flat, GroupDecision, GroupIdentifier, LayoutInstructionIdentifier, LayoutInstructions,
    LineKind, Node, PrintOptions, Refused, TraceEvent, TraceMode,
};

impl LayoutInstructions {
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
            flat_only: 0,
            every_line: 0,
            forced_line: false,
            refused: false,
            trace,
        };
        let mut stack = buffer_pool::take();
        p.run(root, &mut stack);
        p.line_overflows();
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
    /// The end of a flat-only layout's contents.
    EndFlatOnly {
        every_line: bool,
    },
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
    /// How many flat-only layouts are being printed: inside one, a group that does not fit is
    /// refused, since the layout Prettier picks there is not built.
    flat_only: u32,
    /// How many of those check every line they print flat ([`Node::FlatOnly`]).
    every_line: u32,
    /// The current line holds text printed flat under such a layout.
    forced_line: bool,
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

    /// Ends the current line: refused when text printed flat under an every-line layout ran
    /// past the width.
    const fn line_overflows(&mut self) -> bool {
        let overflows = self.forced_line && self.position > self.options.width;
        self.forced_line = false;
        if overflows {
            self.refused = true;
        }
        overflows
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
                    if self.refused {
                        return;
                    }
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
                Item::EndFlatOnly { every_line } => {
                    self.flat_only -= 1;
                    self.every_line -= u32::from(every_line);
                    continue;
                }
            };
            match self.docs.nodes[identifier.0 as usize] {
                Node::Static(s) => {
                    self.forced_line |= mode == Mode::Flat && self.every_line > 0;
                    self.position += s.len();
                    self.out.push_str(s);
                }
                n @ Node::Text { width, .. } => {
                    self.forced_line |= mode == Mode::Flat && self.every_line > 0;
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
                    if self.line_overflows() {
                        return;
                    }
                    if kind == LineKind::Literal {
                        self.out.push('\n');
                        self.position = 0;
                    } else {
                        self.newline(indentation);
                    }
                }
                Node::BreakParent => {}
                Node::Embedded { .. } => {
                    self.refused = true;
                    return;
                }
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
                Node::FlatOnly {
                    content: d,
                    every_line,
                    ..
                } => {
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
                    self.flat_only += 1;
                    self.every_line += u32::from(every_line);
                    stack.push((indentation, mode, Item::EndFlatOnly { every_line }));
                    stack.push((indentation, Mode::Flat, Item::LayoutInstruction(d)));
                }
                Node::Group {
                    start,
                    len,
                    identifier: gid,
                    ..
                } => {
                    let (next, decision) = self.choose_group(identifier, indentation, mode, stack);
                    if decision == GroupDecision::DoesNotFit && self.flat_only > 0 {
                        self.refused = true;
                        self.trace(TraceEvent::Refused {
                            document: identifier,
                            position: self.position,
                        });
                        return;
                    }
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
        if !content_fits && self.flat_only > 0 {
            self.refused = true;
            return;
        }
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
        if !separator_fits && self.flat_only > 0 {
            self.refused = true;
            return;
        }
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
        match fits {
            Ok(fits) => fits,
            // The answer would come from a broken layout that is not built: refuse.
            Err(document) => {
                self.refused = true;
                self.trace(TraceEvent::Refused {
                    document,
                    position: self.position,
                });
                false
            }
        }
    }

    #[expect(
        clippy::too_many_lines,
        reason = "one arm per node kind, as in Prettier's `fits`"
    )]
    fn fits_in(
        &self,
        work: &mut Vec<Command>,
        rest: &[Command],
        mut remaining: isize,
        must_be_flat: bool,
    ) -> Result<bool, LayoutInstructionIdentifier> {
        let mut rest_i = rest.len();
        // A flat-only layout measured where its broken form would be: the first line break
        // there is unknown, so a "does not fit" past it is not Prettier's answer.
        let mut unknown = None;
        // Prettier's `hasPendingSpace`: a line's space counts once a string follows it.
        let mut pending = false;
        while remaining >= 0 {
            let Some((indentation, mode, item)) = work.pop() else {
                if rest_i == 0 {
                    return Ok(true);
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
                Item::EndFlatOnly { .. } => continue,
            };
            if mode == Mode::Flat
                && let Some(flat) = self.docs.measure(identifier).flat()
            {
                flat.charge(&mut remaining, &mut pending);
                continue;
            }
            match self.docs.nodes[identifier.0 as usize] {
                Node::Static("")
                | Node::Text { len: 0, .. }
                | Node::BreakParent
                | Node::Embedded { .. } => {}
                Node::Static(s) => {
                    Flat::string(s.len() as u32).charge(&mut remaining, &mut pending);
                }
                Node::Text { width, .. } => {
                    Flat::string(width).charge(&mut remaining, &mut pending);
                }
                Node::Line(kind) => {
                    if mode == Mode::Break || matches!(kind, LineKind::Hard | LineKind::Literal) {
                        return Ok(true);
                    }
                    if kind == LineKind::Normal {
                        pending = true;
                    }
                }
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
                        return Ok(false);
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
                Node::FlatOnly { content: d, .. } => {
                    if mode == Mode::Break {
                        unknown.get_or_insert(identifier);
                    }
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
        unknown.map_or(Ok(false), Err)
    }
}

#[cfg(target_pointer_width = "64")]
const _: () = assert!(size_of::<Command>() == 24, "`Command` is 24 bytes");
