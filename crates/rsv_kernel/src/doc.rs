//! A Prettier-compatible document IR and printer, shared by every formatter.
//!
//! Documents live in an arena ([`Docs`]) and are addressed by [`DocId`], so building a document
//! allocates growing vectors instead of one box per node. Text is either `&'static str` or a slice
//! of the arena's string buffer.
//!
//! The printer is a port of Prettier's `printDocToString` (prettier 3.x): the same modes, the same
//! `fits` with its rest commands and `mustBeFlat`, the same `fill`, group ids for `ifBreak` and
//! `indentIfBreak`, re-measuring after a hard line in flat mode, and trailing-whitespace trimming at
//! hard lines only. A formatter that builds the same document as Prettier gets the same text.
//!
//! One addition: [`Docs::flat_only`] marks a layout whose broken form a formatter has not ported.
//! If it does not fit flat, [`Docs::print`] refuses instead of printing a layout Prettier would not.

use std::num::NonZeroU32;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct DocId(u32);

/// Names a group so that [`Docs::if_break_of`] and [`Docs::indent_if_break`] can follow its mode.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct GroupId(NonZeroU32);

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
    },
    Line(LineKind),
    Concat {
        start: u32,
        len: u32,
    },
    Group {
        start: u32,
        len: u32,
        brk: bool,
        id: Option<GroupId>,
    },
    Fill {
        start: u32,
        len: u32,
    },
    Indent(DocId),
    /// Prettier's `dedent` (`align(-1)`): drops the innermost indentation level.
    Dedent(DocId),
    IfBreak {
        broken: DocId,
        flat: DocId,
        group: Option<GroupId>,
    },
    IndentIfBreak {
        doc: DocId,
        group: GroupId,
    },
    BreakParent,
    FlatOnly(DocId),
}

#[derive(Default)]
pub struct Docs {
    nodes: Vec<Node>,
    kids: Vec<DocId>,
    buf: String,
    groups: u32,
}

pub struct PrintOptions {
    pub width: usize,
    /// `None` for tabs.
    pub indent_spaces: Option<usize>,
    /// Width of one tab of indentation.
    pub tab_width: usize,
}

impl Default for PrintOptions {
    fn default() -> Self {
        PrintOptions {
            width: 80,
            indent_spaces: Some(2),
            tab_width: 2,
        }
    }
}

/// A [`Docs::flat_only`] layout did not fit on its line.
#[derive(Debug, PartialEq, Eq)]
pub struct Refused;

impl Docs {
    pub fn new() -> Docs {
        Docs::default()
    }

    fn push(&mut self, n: Node) -> DocId {
        self.nodes.push(n);
        DocId(self.nodes.len() as u32 - 1)
    }

    fn list(&mut self, items: &[DocId]) -> (u32, u32) {
        let start = self.kids.len() as u32;
        self.kids.extend_from_slice(items);
        (start, items.len() as u32)
    }

    pub fn nil(&mut self) -> DocId {
        self.push(Node::Static(""))
    }

    pub fn lit(&mut self, s: &'static str) -> DocId {
        self.push(Node::Static(s))
    }

    pub fn text(&mut self, s: &str) -> DocId {
        let start = self.buf.len() as u32;
        self.buf.push_str(s);
        self.push(Node::Text {
            start,
            len: s.len() as u32,
        })
    }

    pub fn line(&mut self) -> DocId {
        self.push(Node::Line(LineKind::Normal))
    }

    pub fn softline(&mut self) -> DocId {
        self.push(Node::Line(LineKind::Soft))
    }

    pub fn hardline(&mut self) -> DocId {
        self.push(Node::Line(LineKind::Hard))
    }

    pub fn literalline(&mut self) -> DocId {
        self.push(Node::Line(LineKind::Literal))
    }

    pub fn break_parent(&mut self) -> DocId {
        self.push(Node::BreakParent)
    }

    pub fn concat(&mut self, items: &[DocId]) -> DocId {
        let (start, len) = self.list(items);
        self.push(Node::Concat { start, len })
    }

    pub fn group(&mut self, items: &[DocId]) -> DocId {
        self.group_node(items, false, None)
    }

    /// Prettier's `group(…, { shouldBreak: true })`.
    pub fn group_broken(&mut self, items: &[DocId]) -> DocId {
        self.group_node(items, true, None)
    }

    pub fn new_group_id(&mut self) -> GroupId {
        self.groups += 1;
        GroupId(NonZeroU32::new(self.groups).expect("counter starts at 1"))
    }

    /// Prettier's `group(…, { id })`.
    pub fn group_with_id(&mut self, items: &[DocId], id: GroupId) -> DocId {
        self.group_node(items, false, Some(id))
    }

    fn group_node(&mut self, items: &[DocId], brk: bool, id: Option<GroupId>) -> DocId {
        let (start, len) = self.list(items);
        self.push(Node::Group {
            start,
            len,
            brk,
            id,
        })
    }

    /// Alternating content and separators: `[c0, sep0, c1, sep1, c2, …]`.
    pub fn fill(&mut self, items: &[DocId]) -> DocId {
        let (start, len) = self.list(items);
        self.push(Node::Fill { start, len })
    }

    pub fn indent(&mut self, d: DocId) -> DocId {
        self.push(Node::Indent(d))
    }

    pub fn dedent(&mut self, d: DocId) -> DocId {
        self.push(Node::Dedent(d))
    }

    pub fn if_break(&mut self, broken: DocId, flat: DocId) -> DocId {
        self.push(Node::IfBreak {
            broken,
            flat,
            group: None,
        })
    }

    /// `ifBreak(broken, flat, { groupId })`: follows the named group instead of the enclosing one.
    pub fn if_break_of(&mut self, broken: DocId, flat: DocId, group: GroupId) -> DocId {
        self.push(Node::IfBreak {
            broken,
            flat,
            group: Some(group),
        })
    }

    pub fn indent_if_break(&mut self, doc: DocId, group: GroupId) -> DocId {
        self.push(Node::IndentIfBreak { doc, group })
    }

    /// A layout whose broken form the formatter does not implement: printing refuses when it does
    /// not fit flat. Its lines print flat (spaces or nothing); hard lines still break.
    pub fn flat_only(&mut self, d: DocId) -> DocId {
        self.push(Node::FlatOnly(d))
    }

    /// Prettier's `join(sep, docs)`.
    pub fn join(&self, sep: DocId, items: &[DocId]) -> Vec<DocId> {
        let mut out = Vec::with_capacity(items.len() * 2);
        for (i, &d) in items.iter().enumerate() {
            if i > 0 {
                out.push(sep);
            }
            out.push(d);
        }
        out
    }

    fn kids(&self, start: u32, len: u32) -> &[DocId] {
        &self.kids[start as usize..(start + len) as usize]
    }

    /// Prettier's `removeLines`: lines become a space (soft lines nothing) and `ifBreak` its flat
    /// contents, so the document prints on one line unless it holds a hard line.
    pub fn remove_lines(&mut self, d: DocId) -> DocId {
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
            Node::IndentIfBreak { doc, group } => {
                let x = self.remove_lines(doc);
                self.indent_if_break(x, group)
            }
            Node::Concat { start, len } => {
                let kids = self.mapped_kids(start, len);
                self.concat(&kids)
            }
            Node::Fill { start, len } => {
                let kids = self.mapped_kids(start, len);
                self.fill(&kids)
            }
            Node::Group {
                start,
                len,
                brk,
                id,
            } => {
                let kids = self.mapped_kids(start, len);
                self.group_node(&kids, brk, id)
            }
        }
    }

    fn mapped_kids(&mut self, start: u32, len: u32) -> Vec<DocId> {
        let kids = self.kids(start, len).to_vec();
        kids.into_iter().map(|k| self.remove_lines(k)).collect()
    }

    /// prettier-plugin-svelte's `isEmptyDoc`.
    pub fn is_empty(&self, d: DocId) -> bool {
        match self.nodes[d.0 as usize] {
            n @ (Node::Static(_) | Node::Text { .. }) => self.str_of(n).is_empty(),
            Node::Line(_) => true,
            Node::Concat { len, .. } | Node::Group { len, .. } => len == 0,
            Node::Indent(x) | Node::Dedent(x) | Node::FlatOnly(x) => self.is_empty(x),
            Node::IndentIfBreak { doc, .. } => self.is_empty(doc),
            Node::Fill { start, len } => self.kids(start, len).iter().all(|&k| self.is_empty(k)),
            Node::IfBreak { .. } | Node::BreakParent => false,
        }
    }

    /// prettier-plugin-svelte's `isLine`.
    pub fn is_line(&self, d: DocId) -> bool {
        match self.nodes[d.0 as usize] {
            Node::Line(_) => true,
            Node::Concat { start, len } => self.kids(start, len).iter().all(|&k| self.is_line(k)),
            _ => false,
        }
    }

    /// Prettier's `willBreak`: the document holds a hard line, a break-parent or a broken group.
    pub fn will_break(&self, d: DocId) -> bool {
        match self.nodes[d.0 as usize] {
            Node::Line(LineKind::Hard | LineKind::Literal) | Node::BreakParent => true,
            Node::Group { brk: true, .. } => true,
            Node::Static(_) | Node::Text { .. } | Node::Line(_) => false,
            Node::Concat { start, len }
            | Node::Fill { start, len }
            | Node::Group { start, len, .. } => {
                self.kids(start, len).iter().any(|&k| self.will_break(k))
            }
            Node::Indent(x) | Node::Dedent(x) | Node::FlatOnly(x) => self.will_break(x),
            Node::IndentIfBreak { doc, .. } => self.will_break(doc),
            Node::IfBreak { broken, flat, .. } => self.will_break(broken) || self.will_break(flat),
        }
    }

    pub fn is_break_parent(&self, d: DocId) -> bool {
        matches!(self.nodes[d.0 as usize], Node::BreakParent)
    }

    /// The literal text of a text node, if `d` is one.
    pub fn as_str(&self, d: DocId) -> Option<&str> {
        match self.nodes[d.0 as usize] {
            n @ (Node::Static(_) | Node::Text { .. }) => Some(self.str_of(n)),
            _ => None,
        }
    }

    /// The list a trim may descend into (prettier-plugin-svelte's `getParts`).
    fn parts(&self, d: DocId) -> Option<(u32, u32)> {
        match self.nodes[d.0 as usize] {
            Node::Concat { start, len }
            | Node::Fill { start, len }
            | Node::Group { start, len, .. } => Some((start, len)),
            _ => None,
        }
    }

    fn replace_parts(&mut self, owner: DocId, parts: &[DocId]) {
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
    }

    /// prettier-plugin-svelte's `trim`: removes leading and trailing docs matching `ws`, descending
    /// into the first/last part when nothing at the current level matches.
    pub fn trim(&mut self, docs: &mut Vec<DocId>, ws: fn(&Docs, DocId) -> bool) {
        self.trim_left(docs, ws);
        self.trim_right(docs, ws);
    }

    pub fn trim_left(&mut self, docs: &mut Vec<DocId>, ws: fn(&Docs, DocId) -> bool) {
        let first = docs
            .iter()
            .position(|&d| !self.is_empty(d) && !ws(self, d))
            .unwrap_or(docs.len());
        if first > 0 {
            let removed: Vec<DocId> = docs.drain(..first).collect();
            if removed.iter().all(|&d| self.is_empty(d)) {
                self.trim_left(docs, ws);
            }
        } else if let Some(&d) = docs.first()
            && let Some((start, len)) = self.parts(d)
        {
            let mut inner = self.kids(start, len).to_vec();
            self.trim_left(&mut inner, ws);
            self.replace_parts(d, &inner);
        }
    }

    pub fn trim_right(&mut self, docs: &mut Vec<DocId>, ws: fn(&Docs, DocId) -> bool) {
        let keep = docs
            .iter()
            .rposition(|&d| !self.is_empty(d) && !ws(self, d))
            .map_or(0, |i| i + 1);
        if keep < docs.len() {
            let removed: Vec<DocId> = docs.drain(keep..).collect();
            if removed.iter().all(|&d| self.is_empty(d)) {
                self.trim_right(docs, ws);
            }
        } else if let Some(&d) = docs.last()
            && let Some((start, len)) = self.parts(d)
        {
            let mut inner = self.kids(start, len).to_vec();
            self.trim_right(&mut inner, ws);
            self.replace_parts(d, &inner);
        }
    }

    /// Prettier's `propagateBreaks`: a group holding a hard line or break-parent is broken.
    fn propagate_breaks(&mut self, root: DocId) {
        let mut memo = vec![None::<bool>; self.nodes.len()];
        self.breaks(root, &mut memo);
    }

    fn breaks(&mut self, id: DocId, memo: &mut Vec<Option<bool>>) -> bool {
        if let Some(b) = memo[id.0 as usize] {
            return b;
        }
        let b = match self.nodes[id.0 as usize] {
            Node::Line(LineKind::Hard | LineKind::Literal) | Node::BreakParent => true,
            Node::Static(_) | Node::Text { .. } | Node::Line(_) => false,
            Node::Indent(d) | Node::Dedent(d) | Node::FlatOnly(d) => self.breaks(d, memo),
            Node::IndentIfBreak { doc, .. } => self.breaks(doc, memo),
            Node::IfBreak { broken, flat, .. } => {
                let a = self.breaks(broken, memo);
                let b = self.breaks(flat, memo);
                a || b
            }
            Node::Concat { start, len } | Node::Fill { start, len } => {
                let mut any = false;
                for i in start..start + len {
                    let k = self.kids[i as usize];
                    any |= self.breaks(k, memo);
                }
                any
            }
            Node::Group { start, len, .. } => {
                let mut any = false;
                for i in start..start + len {
                    let k = self.kids[i as usize];
                    any |= self.breaks(k, memo);
                }
                if let Node::Group { brk, .. } = &mut self.nodes[id.0 as usize] {
                    *brk |= any;
                }
                any
            }
        };
        memo[id.0 as usize] = Some(b);
        b
    }

    fn str_of(&self, n: Node) -> &str {
        match n {
            Node::Static(s) => s,
            Node::Text { start, len } => &self.buf[start as usize..(start + len) as usize],
            _ => "",
        }
    }

    pub fn print(&mut self, root: DocId, opts: &PrintOptions) -> Result<String, Refused> {
        self.propagate_breaks(root);
        let mut p = Printer {
            docs: self,
            opts,
            out: String::new(),
            pos: 0,
            group_modes: vec![None; self.groups as usize + 1],
            remeasure: false,
            refused: false,
        };
        p.run(root);
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
    Doc(DocId),
    /// The unprinted tail `kids[start..start + len]` of a fill.
    Fill {
        start: u32,
        len: u32,
    },
    /// A fill's `[content, whitespace, secondContent]`, measured as one.
    Triple([DocId; 3]),
}

type Cmd = (u32, Mode, Item);

struct Printer<'a> {
    docs: &'a Docs,
    opts: &'a PrintOptions,
    out: String,
    pos: usize,
    group_modes: Vec<Option<Mode>>,
    /// Prettier's `shouldRemeasure`: a hard line was printed in flat mode.
    remeasure: bool,
    refused: bool,
}

/// Prettier's `getStringWidth`: East Asian wide and fullwidth characters count two columns,
/// combining marks and zero-width characters none.
pub fn string_width(s: &str) -> usize {
    if s.is_ascii() {
        return s.len();
    }
    s.chars()
        .map(|c| match c as u32 {
            0x300..=0x36F | 0x200B..=0x200F => 0,
            u if is_wide(u) => 2,
            _ => 1,
        })
        .sum()
}

fn is_wide(u: u32) -> bool {
    matches!(u,
        0x1100..=0x115F | 0x2E80..=0x303E | 0x3041..=0x33FF | 0x3400..=0x4DBF | 0x4E00..=0x9FFF
        | 0xA000..=0xA4CF | 0xAC00..=0xD7A3 | 0xF900..=0xFAFF | 0xFE30..=0xFE4F | 0xFF00..=0xFF60
        | 0xFFE0..=0xFFE6 | 0x1F300..=0x1F64F | 0x1F900..=0x1F9FF | 0x20000..=0x3FFFD)
}

impl Printer<'_> {
    fn newline(&mut self, ind: u32) {
        while self.out.ends_with([' ', '\t']) {
            self.out.pop();
        }
        self.out.push('\n');
        match self.opts.indent_spaces {
            Some(n) => self.out.extend(std::iter::repeat_n(' ', n * ind as usize)),
            None => self.out.extend(std::iter::repeat_n('\t', ind as usize)),
        }
        self.pos = ind as usize * self.opts.indent_spaces.unwrap_or(self.opts.tab_width);
    }

    fn group_mode(&self, g: GroupId) -> Option<Mode> {
        self.group_modes[g.0.get() as usize]
    }

    fn if_break_branch(&self, mode: Mode, broken: DocId, flat: DocId, g: Option<GroupId>) -> DocId {
        let m = match g {
            Some(g) => self.group_mode(g).unwrap_or(Mode::Flat),
            None => mode,
        };
        if m == Mode::Break { broken } else { flat }
    }

    fn rem(&self) -> isize {
        self.opts.width as isize - self.pos as isize
    }

    fn run(&mut self, root: DocId) {
        let mut stack: Vec<Cmd> = vec![(0, Mode::Break, Item::Doc(root))];
        while let Some((ind, mode, item)) = stack.pop() {
            let id = match item {
                Item::Doc(id) => id,
                Item::Fill { start, len } => {
                    self.fill(ind, mode, start, len, &mut stack);
                    continue;
                }
                Item::Triple(ds) => {
                    stack.extend(ds.iter().rev().map(|&d| (ind, mode, Item::Doc(d))));
                    continue;
                }
            };
            match self.docs.nodes[id.0 as usize] {
                n @ (Node::Static(_) | Node::Text { .. }) => {
                    let s = self.docs.str_of(n);
                    self.pos += string_width(s);
                    self.out.push_str(s);
                }
                Node::Line(kind) => {
                    if mode == Mode::Flat {
                        match kind {
                            LineKind::Normal => {
                                self.out.push(' ');
                                self.pos += 1;
                                continue;
                            }
                            LineKind::Soft => continue,
                            LineKind::Hard | LineKind::Literal => self.remeasure = true,
                        }
                    }
                    if kind == LineKind::Literal {
                        self.out.push('\n');
                        self.pos = 0;
                    } else {
                        self.newline(ind);
                    }
                }
                Node::BreakParent => {}
                Node::Concat { start, len } => {
                    let kids = self.docs.kids(start, len);
                    stack.extend(kids.iter().rev().map(|&k| (ind, mode, Item::Doc(k))));
                }
                Node::Indent(d) => stack.push((ind + 1, mode, Item::Doc(d))),
                Node::Dedent(d) => stack.push((ind.saturating_sub(1), mode, Item::Doc(d))),
                Node::IfBreak {
                    broken,
                    flat,
                    group,
                } => {
                    let d = self.if_break_branch(mode, broken, flat, group);
                    stack.push((ind, mode, Item::Doc(d)));
                }
                Node::IndentIfBreak { doc, group } => {
                    let extra = u32::from(self.group_mode(group) == Some(Mode::Break));
                    stack.push((ind + extra, mode, Item::Doc(doc)));
                }
                Node::FlatOnly(d) => {
                    if mode == Mode::Break
                        && !self.fits(
                            &[(ind, Mode::Flat, Item::Doc(d))],
                            &stack,
                            self.rem(),
                            false,
                        )
                    {
                        self.refused = true;
                    }
                    stack.push((ind, Mode::Flat, Item::Doc(d)));
                }
                Node::Group {
                    start,
                    len,
                    brk,
                    id: gid,
                } => {
                    let next = if mode == Mode::Flat && !self.remeasure {
                        if brk { Mode::Break } else { Mode::Flat }
                    } else {
                        self.remeasure = false;
                        let flat = [(ind, Mode::Flat, Item::Doc(id))];
                        if !brk && self.fits(&flat, &stack, self.rem(), false) {
                            Mode::Flat
                        } else {
                            Mode::Break
                        }
                    };
                    if let Some(g) = gid {
                        self.group_modes[g.0.get() as usize] = Some(next);
                    }
                    let kids = self.docs.kids(start, len);
                    stack.extend(kids.iter().rev().map(|&k| (ind, next, Item::Doc(k))));
                }
                Node::Fill { start, len } => stack.push((ind, mode, Item::Fill { start, len })),
            }
        }
    }

    fn fill(&mut self, ind: u32, mode: Mode, start: u32, len: u32, stack: &mut Vec<Cmd>) {
        if len == 0 {
            return;
        }
        let kids = self.docs.kids(start, len);
        let content = kids[0];
        let content_fits = self.fits(
            &[(ind, Mode::Flat, Item::Doc(content))],
            &[],
            self.rem(),
            true,
        );
        let content_mode = if content_fits {
            Mode::Flat
        } else {
            Mode::Break
        };
        if len == 1 {
            stack.push((ind, content_mode, Item::Doc(content)));
            return;
        }
        let ws = kids[1];
        if len == 2 {
            stack.push((ind, content_mode, Item::Doc(ws)));
            stack.push((ind, content_mode, Item::Doc(content)));
            return;
        }
        let pair = [(ind, Mode::Flat, Item::Triple([content, ws, kids[2]]))];
        let ws_mode = if self.fits(&pair, &[], self.rem(), true) {
            Mode::Flat
        } else {
            Mode::Break
        };
        let rest = Item::Fill {
            start: start + 2,
            len: len - 2,
        };
        stack.push((ind, mode, rest));
        stack.push((ind, ws_mode, Item::Doc(ws)));
        stack.push((ind, content_mode, Item::Doc(content)));
    }

    /// Prettier's `fits`: whether `next` fits in `rem` columns, continuing into `rest` (in its own
    /// modes) until the first line break.
    fn fits(&self, next: &[Cmd], rest: &[Cmd], mut rem: isize, must_be_flat: bool) -> bool {
        let mut work: Vec<Cmd> = next.iter().rev().copied().collect();
        let mut rest_i = rest.len();
        while rem >= 0 {
            let Some((ind, mode, item)) = work.pop() else {
                if rest_i == 0 {
                    return true;
                }
                rest_i -= 1;
                work.push(rest[rest_i]);
                continue;
            };
            let id = match item {
                Item::Doc(id) => id,
                Item::Fill { start, len } => {
                    let kids = self.docs.kids(start, len);
                    work.extend(kids.iter().rev().map(|&k| (ind, mode, Item::Doc(k))));
                    continue;
                }
                Item::Triple(ds) => {
                    work.extend(ds.iter().rev().map(|&d| (ind, mode, Item::Doc(d))));
                    continue;
                }
            };
            match self.docs.nodes[id.0 as usize] {
                n @ (Node::Static(_) | Node::Text { .. }) => {
                    rem -= string_width(self.docs.str_of(n)) as isize
                }
                Node::Line(kind) => {
                    if mode == Mode::Break || matches!(kind, LineKind::Hard | LineKind::Literal) {
                        return true;
                    }
                    if kind == LineKind::Normal {
                        rem -= 1;
                    }
                }
                Node::BreakParent => {}
                Node::Concat { start, len } | Node::Fill { start, len } => {
                    let kids = self.docs.kids(start, len);
                    work.extend(kids.iter().rev().map(|&k| (ind, mode, Item::Doc(k))));
                }
                Node::Group {
                    start, len, brk, ..
                } => {
                    if must_be_flat && brk {
                        return false;
                    }
                    let m = if brk { Mode::Break } else { mode };
                    let kids = self.docs.kids(start, len);
                    work.extend(kids.iter().rev().map(|&k| (ind, m, Item::Doc(k))));
                }
                Node::Indent(d) | Node::Dedent(d) | Node::IndentIfBreak { doc: d, .. } => {
                    work.push((ind, mode, Item::Doc(d)))
                }
                Node::FlatOnly(d) => work.push((ind, Mode::Flat, Item::Doc(d))),
                Node::IfBreak {
                    broken,
                    flat,
                    group,
                } => {
                    let d = self.if_break_branch(mode, broken, flat, group);
                    work.push((ind, mode, Item::Doc(d)));
                }
            }
        }
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn call(d: &mut Docs, args: &[&str]) -> DocId {
        let open = d.lit("f(");
        let mut inner = Vec::new();
        for (i, a) in args.iter().enumerate() {
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

    fn print(d: &mut Docs, root: DocId, opts: &PrintOptions) -> String {
        d.print(root, opts).expect("no flat-only layouts")
    }

    #[test]
    fn group_prints_flat_when_it_fits_and_breaks_otherwise() {
        let mut d = Docs::new();
        let g = call(&mut d, &["a", "b"]);
        assert_eq!(print(&mut d, g, &PrintOptions::default()), "f(a, b)");
        let mut d = Docs::new();
        let long = "x".repeat(50);
        let g = call(&mut d, &[&long, &long]);
        assert_eq!(
            print(&mut d, g, &PrintOptions::default()),
            format!("f(\n  {long},\n  {long}\n)")
        );
    }

    #[test]
    fn hardline_breaks_enclosing_groups_and_trims_trailing_space() {
        let mut d = Docs::new();
        let a = d.lit("a ");
        let h = d.hardline();
        let b = d.lit("b");
        let inner = d.concat(&[a, h, b]);
        let ind = d.indent(inner);
        let l = d.line();
        let g = d.group(&[ind, l]);
        let opts = PrintOptions {
            indent_spaces: None,
            ..Default::default()
        };
        assert_eq!(print(&mut d, g, &opts), "a\n\tb\n");
    }

    #[test]
    fn literal_line_keeps_trailing_space_and_skips_indentation() {
        let mut d = Docs::new();
        let a = d.lit("a ");
        let l = d.literalline();
        let b = d.lit("b");
        let inner = d.concat(&[a, l, b]);
        let ind = d.indent(inner);
        assert_eq!(print(&mut d, ind, &PrintOptions::default()), "a \nb");
    }

    #[test]
    fn fill_packs_words() {
        let mut d = Docs::new();
        let mut items = Vec::new();
        for i in 0..30 {
            if i > 0 {
                items.push(d.line());
            }
            items.push(d.lit("word"));
        }
        let f = d.fill(&items);
        let opts = PrintOptions {
            width: 20,
            ..Default::default()
        };
        let out = print(&mut d, f, &opts);
        assert!(out.lines().all(|l| l.len() <= 20), "{out}");
        assert_eq!(out.lines().next().unwrap(), "word word word word");
    }

    #[test]
    fn if_break_follows_a_named_group() {
        let mut d = Docs::new();
        let id = d.new_group_id();
        let long = d.text(&"x".repeat(90));
        let l = d.line();
        let g = d.group_with_id(&[long, l], id);
        let yes = d.lit("broken");
        let no = d.lit("flat");
        let ib = d.if_break_of(yes, no, id);
        let root = d.concat(&[g, ib]);
        assert!(print(&mut d, root, &PrintOptions::default()).ends_with("\nbroken"));
    }

    #[test]
    fn flat_only_refuses_when_it_does_not_fit() {
        let mut d = Docs::new();
        let short = d.lit("short");
        let ok = d.flat_only(short);
        assert_eq!(d.print(ok, &PrintOptions::default()), Ok("short".into()));
        let mut d = Docs::new();
        let long = d.text(&"x".repeat(90));
        let bad = d.flat_only(long);
        assert_eq!(d.print(bad, &PrintOptions::default()), Err(Refused));
    }

    #[test]
    fn trim_descends_into_the_last_part() {
        let mut d = Docs::new();
        let a = d.lit("a");
        let h = d.hardline();
        let inner = d.concat(&[a, h]);
        let mut docs = vec![inner];
        d.trim_right(&mut docs, |d, x| d.is_line(x));
        let root = d.concat(&docs);
        assert_eq!(print(&mut d, root, &PrintOptions::default()), "a");
    }
}
