//! A Wadler/Prettier-style document IR and printer, shared by every formatter.
//!
//! Documents live in an arena ([`Docs`]) and are addressed by [`DocId`], so building a document
//! allocates two growing vectors instead of one box per node. Text is either `&'static str` or a
//! slice of the arena's string buffer.
//!
//! Semantics follow Prettier's printer: a `group` prints flat when its content fits in the remaining
//! width up to the next possible break, a hard line breaks every enclosing group, `fill` packs
//! content/separator pairs, and trailing whitespace is trimmed at every newline.

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct DocId(u32);

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
    Text { start: u32, len: u32 },
    Line(LineKind),
    Concat { start: u32, len: u32 },
    Group { start: u32, len: u32, brk: bool },
    Fill { start: u32, len: u32 },
    Indent(DocId),
    IfBreak { broken: DocId, flat: DocId },
    BreakParent,
}

#[derive(Default)]
pub struct Docs {
    nodes: Vec<Node>,
    kids: Vec<DocId>,
    buf: String,
}

pub struct PrintOptions {
    pub width: usize,
    /// `None` for tabs.
    pub indent_spaces: Option<usize>,
    /// Width a tab counts for when measuring.
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
        let (start, len) = self.list(items);
        self.push(Node::Group {
            start,
            len,
            brk: false,
        })
    }

    /// A group that always breaks.
    pub fn group_broken(&mut self, items: &[DocId]) -> DocId {
        let (start, len) = self.list(items);
        self.push(Node::Group {
            start,
            len,
            brk: true,
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

    pub fn if_break(&mut self, broken: DocId, flat: DocId) -> DocId {
        self.push(Node::IfBreak { broken, flat })
    }

    fn kids(&self, start: u32, len: u32) -> &[DocId] {
        &self.kids[start as usize..(start + len) as usize]
    }

    /// Marks every group containing a hard line or break-parent as broken (Prettier's propagateBreaks).
    fn propagate_breaks(&mut self, root: DocId) -> bool {
        let mut memo = vec![None::<bool>; self.nodes.len()];
        self.breaks(root, &mut memo)
    }

    fn breaks(&mut self, id: DocId, memo: &mut Vec<Option<bool>>) -> bool {
        if let Some(b) = memo[id.0 as usize] {
            return b;
        }
        let b = match self.nodes[id.0 as usize] {
            Node::Line(LineKind::Hard | LineKind::Literal) | Node::BreakParent => true,
            Node::Static(_) | Node::Text { .. } | Node::Line(_) => false,
            Node::Indent(d) => self.breaks(d, memo),
            Node::IfBreak { broken, flat } => {
                let a = self.breaks(broken, memo);
                let b = self.breaks(flat, memo);
                a || b
            }
            Node::Concat { start, len } | Node::Fill { start, len } => {
                let kids: Vec<DocId> = self.kids(start, len).to_vec();
                let mut any = false;
                for k in kids {
                    any |= self.breaks(k, memo);
                }
                any
            }
            Node::Group { start, len, brk } => {
                let kids: Vec<DocId> = self.kids(start, len).to_vec();
                let mut any = brk;
                for k in kids {
                    any |= self.breaks(k, memo);
                }
                if any {
                    self.nodes[id.0 as usize] = Node::Group {
                        start,
                        len,
                        brk: true,
                    };
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

    pub fn print(&mut self, root: DocId, opts: &PrintOptions) -> String {
        self.propagate_breaks(root);
        let mut p = Printer {
            docs: self,
            opts,
            out: String::new(),
            pos: 0,
        };
        p.run(root);
        p.out
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
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
}

type Cmd = (u32, Mode, Item);

struct Printer<'a> {
    docs: &'a Docs,
    opts: &'a PrintOptions,
    out: String,
    pos: usize,
}

impl Printer<'_> {
    fn width(&self, s: &str) -> usize {
        s.chars()
            .map(|c| if c == '\t' { self.opts.tab_width } else { 1 })
            .sum()
    }

    fn newline(&mut self, indent: u32, literal: bool) {
        while self.out.ends_with([' ', '\t']) {
            self.out.pop();
        }
        self.out.push('\n');
        self.pos = 0;
        if literal {
            return;
        }
        for _ in 0..indent {
            match self.opts.indent_spaces {
                Some(n) => {
                    for _ in 0..n {
                        self.out.push(' ');
                    }
                    self.pos += n;
                }
                None => {
                    self.out.push('\t');
                    self.pos += self.opts.tab_width;
                }
            }
        }
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
            };
            match self.docs.nodes[id.0 as usize] {
                n @ (Node::Static(_) | Node::Text { .. }) => {
                    let s = self.docs.str_of(n);
                    self.pos += self.width(s);
                    self.out.push_str(s);
                }
                Node::Line(kind) => match (mode, kind) {
                    (Mode::Flat, LineKind::Normal) => {
                        self.out.push(' ');
                        self.pos += 1;
                    }
                    (Mode::Flat, LineKind::Soft) => {}
                    (_, LineKind::Literal) => self.newline(ind, true),
                    _ => self.newline(ind, false),
                },
                Node::BreakParent => {}
                Node::Concat { start, len } => {
                    for &k in self.docs.kids(start, len).iter().rev() {
                        stack.push((ind, mode, Item::Doc(k)));
                    }
                }
                Node::Indent(d) => stack.push((ind + 1, mode, Item::Doc(d))),
                Node::IfBreak { broken, flat } => stack.push((
                    ind,
                    mode,
                    Item::Doc(if mode == Mode::Break { broken } else { flat }),
                )),
                Node::Group { start, len, brk } => {
                    let next_mode = if brk {
                        Mode::Break
                    } else if mode == Mode::Flat {
                        Mode::Flat
                    } else {
                        let rem = self.opts.width as isize - self.pos as isize;
                        if self.fits(&[(ind, Mode::Flat, Item::Doc(id))], &stack, rem) {
                            Mode::Flat
                        } else {
                            Mode::Break
                        }
                    };
                    for &k in self.docs.kids(start, len).iter().rev() {
                        stack.push((ind, next_mode, Item::Doc(k)));
                    }
                }
                Node::Fill { start, len } => stack.push((ind, mode, Item::Fill { start, len })),
            }
        }
    }

    /// Prettier's fill: print each content flat if it fits, and break a separator only when the
    /// following content would not fit on the current line.
    fn fill(&mut self, ind: u32, mode: Mode, start: u32, len: u32, stack: &mut Vec<Cmd>) {
        if len == 0 {
            return;
        }
        let kids = self.docs.kids(start, len);
        let rem = self.opts.width as isize - self.pos as isize;
        let content = (ind, Mode::Flat, Item::Doc(kids[0]));
        let content_mode = if self.fits(&[content], &[], rem) {
            Mode::Flat
        } else {
            mode
        };
        if len == 1 {
            stack.push((ind, content_mode, Item::Doc(kids[0])));
            return;
        }
        let sep = kids[1];
        if len == 2 {
            stack.push((ind, content_mode, Item::Doc(sep)));
            stack.push((ind, content_mode, Item::Doc(kids[0])));
            return;
        }
        let pair = [
            content,
            (ind, Mode::Flat, Item::Doc(sep)),
            (ind, Mode::Flat, Item::Doc(kids[2])),
        ];
        let sep_mode = if self.fits(&pair, &[], rem) {
            Mode::Flat
        } else {
            mode
        };
        stack.push((
            ind,
            mode,
            Item::Fill {
                start: start + 2,
                len: len - 2,
            },
        ));
        stack.push((ind, sep_mode, Item::Doc(sep)));
        stack.push((ind, content_mode, Item::Doc(kids[0])));
    }

    /// Whether `next` fits in `rem` columns, continuing into `rest` (in its own modes) until the
    /// first line break that the rest would print.
    fn fits(&self, next: &[Cmd], rest: &[Cmd], mut rem: isize) -> bool {
        let mut work: Vec<Cmd> = next.iter().rev().copied().collect();
        let mut rest_i = rest.len();
        loop {
            if rem < 0 {
                return false;
            }
            let (ind, mode, item) = match work.pop() {
                Some(c) => c,
                None if rest_i == 0 => return true,
                None => {
                    rest_i -= 1;
                    rest[rest_i]
                }
            };
            let id = match item {
                Item::Doc(id) => id,
                Item::Fill { start, len } => {
                    for &k in self.docs.kids(start, len).iter().rev() {
                        work.push((ind, mode, Item::Doc(k)));
                    }
                    continue;
                }
            };
            match self.docs.nodes[id.0 as usize] {
                n @ (Node::Static(_) | Node::Text { .. }) => {
                    rem -= self.width(self.docs.str_of(n)) as isize
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
                    for &k in self.docs.kids(start, len).iter().rev() {
                        work.push((ind, mode, Item::Doc(k)));
                    }
                }
                Node::Group { start, len, brk } => {
                    let m = if brk { Mode::Break } else { mode };
                    for &k in self.docs.kids(start, len).iter().rev() {
                        work.push((ind, m, Item::Doc(k)));
                    }
                }
                Node::Indent(d) => work.push((ind + 1, mode, Item::Doc(d))),
                Node::IfBreak { broken, flat } => work.push((
                    ind,
                    mode,
                    Item::Doc(if mode == Mode::Break { broken } else { flat }),
                )),
            }
        }
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

    #[test]
    fn group_prints_flat_when_it_fits_and_breaks_otherwise() {
        let mut d = Docs::new();
        let g = call(&mut d, &["a", "b"]);
        assert_eq!(d.print(g, &PrintOptions::default()), "f(a, b)");
        let mut d = Docs::new();
        let long = "x".repeat(50);
        let g = call(&mut d, &[&long, &long]);
        assert_eq!(
            d.print(g, &PrintOptions::default()),
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
        assert_eq!(
            d.print(
                g,
                &PrintOptions {
                    indent_spaces: None,
                    ..Default::default()
                }
            ),
            "a\n\tb\n"
        );
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
        let out = d.print(
            f,
            &PrintOptions {
                width: 20,
                ..Default::default()
            },
        );
        assert!(out.lines().all(|l| l.len() <= 20), "{out}");
        assert_eq!(out.lines().next().unwrap(), "word word word word");
    }
}
