//! Formats a component the way prettier 3 formats a `.vue` file.
//!
//! The options are `printWidth: 80`, two-space indentation, `htmlWhitespaceSensitivity: "css"`,
//! `bracketSameLine: false` and `vueIndentScriptAndStyle: false`. This is prettier's HTML printer
//! (`language-html`), not a Vue-specific one: the file is an HTML document whose root elements
//! are the blocks.
//!
//! The port keeps prettier's two stages. `Tree::build` is `print-preprocess` (whitespace
//! extraction, CSS display, space sensitivity, simple-element merging) over a tree of its own,
//! since the preprocessing rewrites text and removes nodes. `Printer` is `printChildren`,
//! `printElement` and the tag helpers of `print/tag.js`, one function per upstream function.
//! Script bodies and template expressions go through `rsv_js`'s formatter, style bodies through
//! `rsv_css`'s; anything neither covers is an [`Unsupported`] error, never an approximation.

use std::borrow::Cow;

pub use rsv_js::format::Unsupported;
use rsv_js::format::{Formatter, Options as JsOptions};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::doc::{DocId, Docs, GroupId, PrintOptions, Refused};
use rsv_kernel::source::{LineIndex, Span};

use crate::ast::{Attr, AttrKind, DirExp, DirName, Sfc, TId, TNode, TagAttr};

type R<T> = Result<T, Unsupported>;

const PRINT_WIDTH: usize = 80;
const TAB_WIDTH: usize = 2;

/// prettier's `CSS_DISPLAY_TAGS` (from `html-ua-styles`, with its special cases), for the tags
/// whose display is not `inline`.
const CSS_DISPLAY: &[(&str, &str)] = &[
    ("area", "none"),
    ("base", "none"),
    ("basefont", "none"),
    ("datalist", "none"),
    ("head", "none"),
    ("link", "none"),
    ("meta", "none"),
    ("noembed", "none"),
    ("noframes", "none"),
    ("param", "block"),
    ("rp", "none"),
    ("script", "block"),
    ("style", "none"),
    ("title", "none"),
    ("html", "block"),
    ("body", "block"),
    ("address", "block"),
    ("blockquote", "block"),
    ("center", "block"),
    ("dialog", "block"),
    ("div", "block"),
    ("figure", "block"),
    ("figcaption", "block"),
    ("footer", "block"),
    ("form", "block"),
    ("header", "block"),
    ("hr", "block"),
    ("legend", "block"),
    ("listing", "block"),
    ("main", "block"),
    ("p", "block"),
    ("plaintext", "block"),
    ("pre", "block"),
    ("search", "block"),
    ("xmp", "block"),
    ("slot", "contents"),
    ("ruby", "ruby"),
    ("rt", "ruby-text"),
    ("article", "block"),
    ("aside", "block"),
    ("h1", "block"),
    ("h2", "block"),
    ("h3", "block"),
    ("h4", "block"),
    ("h5", "block"),
    ("h6", "block"),
    ("hgroup", "block"),
    ("nav", "block"),
    ("section", "block"),
    ("dir", "block"),
    ("dd", "block"),
    ("dl", "block"),
    ("dt", "block"),
    ("menu", "block"),
    ("ol", "block"),
    ("ul", "block"),
    ("li", "list-item"),
    ("table", "table"),
    ("caption", "table-caption"),
    ("colgroup", "table-column-group"),
    ("col", "table-column"),
    ("thead", "table-header-group"),
    ("tbody", "table-row-group"),
    ("tfoot", "table-footer-group"),
    ("tr", "table-row"),
    ("td", "table-cell"),
    ("th", "table-cell"),
    ("input", "inline-block"),
    ("button", "inline-block"),
    ("fieldset", "block"),
    ("details", "block"),
    ("summary", "block"),
    ("marquee", "inline-block"),
    ("option", "block"),
    ("optgroup", "block"),
    ("select", "inline-block"),
    ("source", "block"),
    ("track", "block"),
    ("meter", "inline-block"),
    ("progress", "inline-block"),
    ("object", "inline-block"),
    ("video", "inline-block"),
    ("audio", "inline-block"),
];

/// Elements whose `white-space` is not `normal` (`CSS_WHITE_SPACE_TAGS`) or whose attributes
/// prettier formats with a language this port does not have.
const REFUSED_TAGS: &[&str] = &[
    "listing",
    "plaintext",
    "pre",
    "xmp",
    "textarea",
    "svg",
    "math",
];

/// `@vue/shared`'s `VOID_TAGS`, which the HTML parser prettier uses agrees with.
const VOID_TAGS: &[&str] = &[
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source",
    "track", "wbr",
];

/// # Errors
///
/// [`Unsupported`] if the component holds a construct this formatter does not print.
pub fn format(c: &Sfc, src: &str) -> R<String> {
    let lines = LineIndex::new(src);
    let tree = Tree::build(c, src, &lines)?;
    let mut docs = Docs::new();
    let js = Formatter::new(&c.js, src, &lines, &mut docs, JsOptions::default());
    let mut p = Printer {
        c,
        src,
        t: &tree,
        js,
    };
    let children = p.children(ROOT)?;
    let body = p.js.docs.group(&children);
    let h = p.js.docs.hardline();
    let root = p.js.docs.concat(&[body, h]);
    let opts = PrintOptions {
        width: PRINT_WIDTH,
        indent_spaces: Some(TAB_WIDTH),
        tab_width: TAB_WIDTH,
    };
    docs.print(root, &opts)
        .map_err(|Refused| Unsupported::nowhere("a layout that does not fit on one line"))
}

const ROOT: usize = 0;

#[derive(Debug)]
enum Kind2<'a> {
    Root,
    Element {
        name: &'a str,
        attrs: Attrs<'a>,
        embed: Embed,
    },
    Text(Cow<'a, str>),
    Interpolation(NodeId),
}

#[derive(Debug, Clone, Copy)]
enum Attrs<'a> {
    Template(&'a [Attr]),
    Block(&'a [TagAttr]),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Embed {
    None,
    Script(NodeId),
    Style(usize),
}

#[derive(Debug)]
struct Node<'a> {
    kind: Kind2<'a>,
    parent: usize,
    children: Vec<usize>,
    prev: Option<usize>,
    next: Option<usize>,
    /// `sourceSpan`.
    span: Span,
    /// `startSourceSpan.end`, for an element.
    open_end: u32,
    /// `endSourceSpan.start`, for an element with an end tag.
    close_start: Option<u32>,
    display: &'static str,
    /// `hasLeadingSpaces`, `hasTrailingSpaces`, `hasDanglingSpaces`.
    has: Sides,
    /// `isLeadingSpaceSensitive`, `isTrailingSpaceSensitive`, `isDanglingSpaceSensitive`.
    sensitive: Sides,
    self_closing: bool,
}

/// Whitespace facts about a node's two sides and, for a container, its empty inside.
#[derive(Debug, Clone, Copy, Default)]
struct Sides {
    leading: bool,
    trailing: bool,
    dangling: bool,
}

impl<'a> Node<'a> {
    const fn new(kind: Kind2<'a>, parent: usize, span: Span) -> Self {
        Node {
            kind,
            parent,
            children: Vec::new(),
            prev: None,
            next: None,
            span,
            open_end: span.hi,
            close_start: None,
            display: "inline",
            has: Sides {
                leading: false,
                trailing: false,
                dangling: false,
            },
            sensitive: Sides {
                leading: false,
                trailing: false,
                dangling: false,
            },
            self_closing: false,
        }
    }
}

/// The preprocessed document (`print-preprocess.js`).
#[derive(Debug)]
struct Tree<'a> {
    n: Vec<Node<'a>>,
    lines: &'a LineIndex,
    src: &'a str,
}

const fn is_html_ws(b: u8) -> bool {
    matches!(b, b' ' | b'\t' | b'\n' | b'\x0c' | b'\r')
}

fn only_ws(s: &str) -> bool {
    s.bytes().all(is_html_ws)
}

impl<'a> Tree<'a> {
    fn build(c: &'a Sfc, src: &'a str, lines: &'a LineIndex) -> R<Self> {
        // The parser has read the document, so its offsets fit in `u32`.
        let len = src.len() as u32;
        let mut t = Tree {
            n: vec![Node::new(Kind2::Root, usize::MAX, Span::new(0, len))],
            lines,
            src,
        };
        let mut blocks: Vec<(Span, usize)> = Vec::new();
        if let Some(tpl) = &c.template {
            let id = t.push(
                Kind2::Element {
                    name: "template",
                    attrs: Attrs::Block(&tpl.attrs),
                    embed: Embed::None,
                },
                ROOT,
                tpl.span,
            );
            t.n[id].open_end = tpl.content.lo;
            t.n[id].close_start = Some(tpl.content.hi);
            let kids = t.template_nodes(c, id, c.children(tpl.root))?;
            t.n[id].children = kids;
            blocks.push((tpl.span, id));
        }
        if let Some(s) = &c.script {
            let id = t.block(
                "script",
                &s.attrs,
                Embed::Script(s.program),
                s.span,
                s.content,
            );
            blocks.push((s.span, id));
        }
        for (i, s) in c.styles.iter().enumerate() {
            if s.attrs
                .iter()
                .any(|(n, v)| n.text(src) == "lang" && v.is_some_and(|v| v.text(src) != "css"))
            {
                return Err(Unsupported::at("a style language other than CSS", s.span));
            }
            let id = t.block("style", &s.attrs, Embed::Style(i), s.span, s.content);
            blocks.push((s.span, id));
        }
        blocks.sort_by_key(|b| b.0.lo);
        let mut at = 0;
        for (i, &(span, id)) in blocks.iter().enumerate() {
            let gap = &src[at as usize..span.lo as usize];
            if !only_ws(gap) {
                return Err(Unsupported::at(
                    "content between the blocks",
                    Span::new(at, span.lo),
                ));
            }
            if !gap.is_empty() {
                t.n[id].has.leading = true;
                if i > 0 {
                    t.n[blocks[i - 1].1].has.trailing = true;
                }
            }
            at = span.hi;
        }
        if !only_ws(&src[at as usize..]) {
            return Err(Unsupported::at(
                "content after the blocks",
                Span::new(at, len),
            ));
        }
        if at < len
            && let Some(&(_, last)) = blocks.last()
        {
            t.n[last].has.trailing = true;
        }
        t.n[ROOT].children = blocks.iter().map(|b| b.1).collect();
        t.extract_whitespace();
        t.link();
        t.display_and_closing();
        t.space_sensitivity();
        t.merge_simple_elements();
        t.link();
        Ok(t)
    }

    fn push(&mut self, kind: Kind2<'a>, parent: usize, span: Span) -> usize {
        self.n.push(Node::new(kind, parent, span));
        self.n.len() - 1
    }

    /// A `<script>` or `<style>` block: one raw text child, or none when only whitespace.
    fn block(
        &mut self,
        name: &'static str,
        attrs: &'a [TagAttr],
        embed: Embed,
        span: Span,
        content: Span,
    ) -> usize {
        let id = self.push(
            Kind2::Element {
                name,
                attrs: Attrs::Block(attrs),
                embed,
            },
            ROOT,
            span,
        );
        self.n[id].open_end = content.lo;
        self.n[id].close_start = Some(content.hi);
        let text = content.text(self.src);
        if only_ws(text) {
            self.n[id].has.dangling = !text.is_empty();
        } else {
            let t = self.push(Kind2::Text(Cow::Borrowed(text)), id, content);
            self.n[id].children = vec![t];
        }
        id
    }

    fn template_nodes(&mut self, c: &'a Sfc, parent: usize, kids: &[TId]) -> R<Vec<usize>> {
        let mut out = Vec::with_capacity(kids.len());
        for &k in kids {
            let id = match *c.node(k) {
                TNode::Text { span } => self.push(
                    Kind2::Text(Cow::Borrowed(span.text(self.src))),
                    parent,
                    span,
                ),
                TNode::Comment { span, .. } => {
                    return Err(Unsupported::at("a template comment", span));
                }
                TNode::Interpolation { expr, span } => {
                    self.push(Kind2::Interpolation(expr), parent, span)
                }
                TNode::Element {
                    name,
                    attrs,
                    children,
                    start_tag,
                    self_closing,
                    span,
                } => {
                    let tag = name.text(self.src);
                    if REFUSED_TAGS.contains(&tag) || tag.contains('-') || tag.contains(':') {
                        return Err(Unsupported::at("this element", name));
                    }
                    let attrs = c.attrs(attrs);
                    let id = self.push(
                        Kind2::Element {
                            name: tag,
                            attrs: Attrs::Template(attrs),
                            embed: Embed::None,
                        },
                        parent,
                        span,
                    );
                    self.n[id].open_end = start_tag.hi;
                    let void = VOID_TAGS.contains(&tag);
                    self.n[id].self_closing = void || self_closing;
                    if !void && !self_closing {
                        let close = self.src[..span.hi as usize].rfind("</").ok_or_else(|| {
                            Unsupported::at("an element without an end tag", span)
                        })?;
                        self.n[id].close_start = Some(span.lo + (close - span.lo as usize) as u32);
                    }
                    let kids = self.template_nodes(c, id, c.children(children))?;
                    self.n[id].children = kids;
                    id
                }
            };
            out.push(id);
        }
        Ok(out)
    }

    fn link(&mut self) {
        for i in 0..self.n.len() {
            let kids = self.n[i].children.clone();
            for (j, &k) in kids.iter().enumerate() {
                self.n[k].parent = i;
                self.n[k].prev = j.checked_sub(1).map(|p| kids[p]);
                self.n[k].next = kids.get(j + 1).copied();
            }
        }
    }

    fn is_element(&self, i: usize) -> bool {
        matches!(self.n[i].kind, Kind2::Element { .. })
    }

    fn name(&self, i: usize) -> Option<&'a str> {
        match self.n[i].kind {
            Kind2::Element { name, .. } => Some(name),
            _ => None,
        }
    }

    /// `isScriptLikeTag`.
    fn is_script_like(&self, i: usize) -> bool {
        matches!(self.name(i), Some("script" | "style"))
    }

    fn is_text(&self, i: usize) -> bool {
        matches!(self.n[i].kind, Kind2::Text(_))
    }

    /// `extractWhitespaces`: trims the text of every container that is not whitespace-sensitive
    /// (every one but `<script>` and `<style>`), recording where whitespace was.
    fn extract_whitespace(&mut self) {
        for i in 0..self.n.len() {
            if self.is_script_like(i) || matches!(self.n[i].kind, Kind2::Root) {
                continue;
            }
            let kids = std::mem::take(&mut self.n[i].children);
            if kids.len() == 1
                && let Kind2::Text(t) = &self.n[kids[0]].kind
                && only_ws(t)
            {
                self.n[i].has.dangling = true;
                continue;
            }
            let mut out: Vec<usize> = Vec::with_capacity(kids.len());
            let mut pending_leading = false;
            for (j, &k) in kids.iter().enumerate() {
                if pending_leading {
                    self.n[k].has.leading = true;
                    pending_leading = false;
                }
                let Kind2::Text(text) = &self.n[k].kind else {
                    out.push(k);
                    continue;
                };
                let lead = text.len()
                    - text
                        .trim_start_matches(|c: char| c.is_ascii() && is_html_ws(c as u8))
                        .len();
                let trimmed_end = text
                    .trim_end_matches(|c: char| c.is_ascii() && is_html_ws(c as u8))
                    .len();
                if lead == text.len() {
                    if let Some(&p) = out.last() {
                        self.n[p].has.trailing = true;
                    }
                    pending_leading = j + 1 < kids.len();
                    continue;
                }
                let trail = text.len() - trimmed_end;
                let value = match text {
                    Cow::Borrowed(s) => Cow::Borrowed(&s[lead..trimmed_end]),
                    Cow::Owned(s) => Cow::Owned(s[lead..trimmed_end].to_owned()),
                };
                let span = self.n[k].span;
                self.n[k].span = Span::new(
                    span.lo + u32::try_from(lead).expect("fits"),
                    span.hi - u32::try_from(trail).expect("fits"),
                );
                self.n[k].kind = Kind2::Text(value);
                if lead > 0 {
                    if let Some(&p) = out.last() {
                        self.n[p].has.trailing = true;
                    }
                    self.n[k].has.leading = true;
                }
                if trail > 0 {
                    self.n[k].has.trailing = true;
                    pending_leading = j + 1 < kids.len();
                }
                out.push(k);
            }
            self.n[i].children = out;
        }
    }

    /// `addCssDisplay` and `addIsSelfClosing`.
    fn display_and_closing(&mut self) {
        for i in 1..self.n.len() {
            let display = match self.n[i].kind {
                Kind2::Element { .. } if self.n[i].parent == ROOT => "block",
                Kind2::Element { name, .. } => CSS_DISPLAY
                    .iter()
                    .find(|(t, _)| *t == name)
                    .map_or("inline", |(_, d)| d),
                _ => "inline",
            };
            self.n[i].display = display;
            if self.is_text(i) {
                self.n[i].self_closing = true;
            }
        }
    }

    fn is_block_like(display: &str) -> bool {
        display == "block" || display == "list-item" || display.starts_with("table")
    }

    fn is_leading_sensitive(&self, i: usize) -> bool {
        let n = &self.n[i];
        let texty = |j: usize| matches!(self.n[j].kind, Kind2::Text(_) | Kind2::Interpolation(_));
        if texty(i) && n.prev.is_some_and(texty) {
            return true;
        }
        let parent = &self.n[n.parent];
        if parent.display == "none" {
            return false;
        }
        if n.prev.is_none()
            && (n.parent == ROOT
                || self.is_script_like(n.parent)
                || Self::is_block_like(parent.display)
                || parent.display == "inline-block")
        {
            return false;
        }
        if let Some(p) = n.prev
            && Self::is_block_like(self.n[p].display)
        {
            return false;
        }
        true
    }

    fn is_trailing_sensitive(&self, i: usize) -> bool {
        let n = &self.n[i];
        let texty = |j: usize| matches!(self.n[j].kind, Kind2::Text(_) | Kind2::Interpolation(_));
        if texty(i) && n.next.is_some_and(texty) {
            return true;
        }
        let parent = &self.n[n.parent];
        if parent.display == "none" {
            return false;
        }
        if n.next.is_none()
            && (n.parent == ROOT
                || self.is_script_like(n.parent)
                || Self::is_block_like(parent.display)
                || parent.display == "inline-block")
        {
            return false;
        }
        if let Some(x) = n.next
            && Self::is_block_like(self.n[x].display)
        {
            return false;
        }
        true
    }

    /// `addIsSpaceSensitive`.
    fn space_sensitivity(&mut self) {
        for i in 0..self.n.len() {
            let kids = self.n[i].children.clone();
            if kids.is_empty() {
                let d = self.n[i].display;
                self.n[i].sensitive.dangling =
                    !Self::is_block_like(d) && d != "inline-block" && !self.is_script_like(i);
                continue;
            }
            for &k in &kids {
                self.n[k].sensitive.leading = self.is_leading_sensitive(k);
                self.n[k].sensitive.trailing = self.is_trailing_sensitive(k);
            }
            for (j, &k) in kids.iter().enumerate() {
                if j > 0 {
                    self.n[k].sensitive.leading =
                        self.n[kids[j - 1]].sensitive.trailing && self.n[k].sensitive.leading;
                }
                if j + 1 < kids.len() {
                    self.n[k].sensitive.trailing =
                        self.n[kids[j + 1]].sensitive.leading && self.n[k].sensitive.trailing;
                }
            }
        }
    }

    /// `mergeSimpleElementIntoText`: `a<b>x</b>c` becomes one text.
    fn merge_simple_elements(&mut self) {
        for i in 0..self.n.len() {
            let mut j = 0;
            while j < self.n[i].children.len() {
                let kids = &self.n[i].children;
                let k = kids[j];
                let simple = self.is_simple_element(k, j, kids);
                if !simple {
                    j += 1;
                    continue;
                }
                let (prev, next) = (kids[j - 1], kids[j + 1]);
                let name = self.name(k).expect("an element");
                let inner = match &self.n[self.n[k].children[0]].kind {
                    Kind2::Text(t) => t.to_string(),
                    _ => unreachable!("a simple element holds text"),
                };
                let next_text = match &self.n[next].kind {
                    Kind2::Text(t) => t.to_string(),
                    _ => unreachable!("followed by text"),
                };
                let Kind2::Text(prev_text) = &self.n[prev].kind else {
                    unreachable!("preceded by text")
                };
                let merged = format!("{prev_text}<{name}>{inner}</{name}>{next_text}");
                self.n[prev].kind = Kind2::Text(Cow::Owned(merged));
                self.n[prev].span = Span::new(self.n[prev].span.lo, self.n[next].span.hi);
                self.n[prev].sensitive.trailing = self.n[next].sensitive.trailing;
                self.n[prev].has.trailing = self.n[next].has.trailing;
                self.n[i].children.drain(j..=j + 1);
            }
        }
    }

    fn is_simple_element(&self, k: usize, j: usize, kids: &[usize]) -> bool {
        let n = &self.n[k];
        let Kind2::Element {
            attrs: Attrs::Template(attrs),
            ..
        } = n.kind
        else {
            return false;
        };
        let [child] = n.children[..] else {
            return false;
        };
        let Kind2::Text(t) = &self.n[child].kind else {
            return false;
        };
        attrs.is_empty()
            && !t.bytes().any(is_html_ws)
            && !self.n[child].has.leading
            && !self.n[child].has.trailing
            && n.sensitive.leading
            && !n.has.leading
            && n.sensitive.trailing
            && !n.has.trailing
            && j > 0
            && j + 1 < kids.len()
            && self.is_text(kids[j - 1])
            && self.is_text(kids[j + 1])
    }

    fn line(&self, at: u32) -> u32 {
        self.lines.line_col(at).line
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Between {
    None,
    Soft,
    Line,
    Hard,
}

struct Printer<'a, 'd> {
    c: &'a Sfc,
    src: &'a str,
    t: &'a Tree<'a>,
    js: Formatter<'d>,
}

impl<'a> Printer<'a, '_> {
    const fn d(&mut self) -> &mut Docs {
        self.js.docs
    }

    fn lit(&mut self, s: &'static str) -> DocId {
        self.d().lit(s)
    }

    fn cat(&mut self, items: &[DocId]) -> DocId {
        self.d().concat(items)
    }

    fn n(&self, i: usize) -> &'a Node<'a> {
        &self.t.n[i]
    }

    fn first(&self, i: usize) -> Option<usize> {
        self.n(i).children.first().copied()
    }

    fn last(&self, i: usize) -> Option<usize> {
        self.n(i).children.last().copied()
    }

    /// `isTextLikeNode` (there are no comments).
    fn text_like(&self, i: usize) -> bool {
        self.t.is_text(i)
    }

    /// `isTextLikeNode(getLastDescendant(node))`; an interpolation's last descendant is its text.
    fn last_descendant_text_like(&self, i: usize) -> bool {
        match self.n(i).kind {
            Kind2::Text(_) | Kind2::Interpolation(_) => true,
            _ => self
                .last(i)
                .is_some_and(|l| self.last_descendant_text_like(l)),
        }
    }

    // ---- print/tag.js ----------------------------------------------------------------

    fn borrows_prev_close_end(&self, i: usize) -> bool {
        let n = self.n(i);
        n.prev.is_some_and(|p| !self.text_like(p)) && n.sensitive.leading && !n.has.leading
    }

    fn borrows_last_child_close_end(&self, i: usize) -> bool {
        self.last(i).is_some_and(|l| {
            let l2 = self.n(l);
            l2.sensitive.trailing && !l2.has.trailing && !self.last_descendant_text_like(l)
        })
    }

    fn borrows_parent_close_start(&self, i: usize) -> bool {
        let n = self.n(i);
        n.next.is_none()
            && !n.has.trailing
            && n.sensitive.trailing
            && self.last_descendant_text_like(i)
    }

    fn borrows_next_open_start(&self, i: usize) -> bool {
        let n = self.n(i);
        n.next.is_some_and(|x| !self.text_like(x))
            && self.text_like(i)
            && n.sensitive.trailing
            && !n.has.trailing
    }

    fn borrows_parent_open_end(&self, i: usize) -> bool {
        let n = self.n(i);
        n.prev.is_none() && n.sensitive.leading && !n.has.leading
    }

    fn open_start_marker(&mut self, i: usize) -> DocId {
        match self.n(i).kind {
            Kind2::Interpolation(_) => self.lit("{{"),
            Kind2::Element { name, .. } => self.d().text(&format!("<{name}")),
            _ => unreachable!("only tags have markers"),
        }
    }

    fn close_start_marker(&mut self, i: usize) -> DocId {
        let name = self.t.name(i).expect("an element");
        self.d().text(&format!("</{name}"))
    }

    fn close_end_marker(&mut self, i: usize) -> DocId {
        match self.n(i).kind {
            Kind2::Interpolation(_) => self.lit("}}"),
            Kind2::Element { .. } if self.n(i).self_closing => self.lit("/>"),
            _ => self.lit(">"),
        }
    }

    fn closing_tag(&mut self, i: usize) -> DocId {
        let start = if self.n(i).self_closing {
            self.d().nil()
        } else {
            self.closing_tag_start(i)
        };
        let end = self.closing_tag_end(i);
        self.cat(&[start, end])
    }

    fn closing_tag_start(&mut self, i: usize) -> DocId {
        if self
            .last(i)
            .is_some_and(|l| self.borrows_parent_close_start(l))
        {
            return self.d().nil();
        }
        let prefix = if self.borrows_last_child_close_end(i) {
            let l = self.last(i).expect("a last child");
            self.close_end_marker(l)
        } else {
            self.d().nil()
        };
        let marker = self.close_start_marker(i);
        self.cat(&[prefix, marker])
    }

    /// Whether the next sibling (or, for a last child, the parent) prints this node's
    /// closing-tag end marker.
    fn close_end_borrowed(&self, i: usize) -> bool {
        let n = self.n(i);
        n.next.map_or_else(
            || self.borrows_last_child_close_end(n.parent),
            |x| self.borrows_prev_close_end(x),
        )
    }

    fn closing_tag_end(&mut self, i: usize) -> DocId {
        if self.close_end_borrowed(i) {
            return self.d().nil();
        }
        let marker = self.close_end_marker(i);
        let suffix = self.closing_tag_suffix(i);
        self.cat(&[marker, suffix])
    }

    fn closing_tag_suffix(&mut self, i: usize) -> DocId {
        if self.borrows_parent_close_start(i) {
            let p = self.n(i).parent;
            return self.close_start_marker(p);
        }
        if self.borrows_next_open_start(i) {
            let x = self.n(i).next.expect("a next sibling");
            return self.open_start_marker(x);
        }
        self.d().nil()
    }

    fn opening_tag_prefix(&mut self, i: usize) -> DocId {
        if self.borrows_parent_open_end(i) {
            return self.lit(">");
        }
        if self.borrows_prev_close_end(i) {
            let p = self.n(i).prev.expect("a previous sibling");
            return self.close_end_marker(p);
        }
        self.d().nil()
    }

    fn opening_tag_start(&mut self, i: usize) -> DocId {
        if self
            .n(i)
            .prev
            .is_some_and(|p| self.borrows_next_open_start(p))
        {
            return self.d().nil();
        }
        let prefix = self.opening_tag_prefix(i);
        let marker = self.open_start_marker(i);
        self.cat(&[prefix, marker])
    }

    fn opening_tag(&mut self, i: usize) -> R<DocId> {
        let start = self.opening_tag_start(i);
        let attrs = self.attributes(i)?;
        let end = if self.n(i).self_closing
            || self
                .first(i)
                .is_some_and(|f| self.borrows_parent_open_end(f))
        {
            self.d().nil()
        } else {
            self.lit(">")
        };
        Ok(self.cat(&[start, attrs, end]))
    }

    /// `printAttributes`.
    fn attributes(&mut self, i: usize) -> R<DocId> {
        let Kind2::Element { attrs, .. } = self.n(i).kind else {
            unreachable!("an element")
        };
        let printed = match attrs {
            Attrs::Template(list) => list
                .iter()
                .map(|a| self.attribute(a))
                .collect::<R<Vec<_>>>()?,
            Attrs::Block(list) => list
                .iter()
                .map(|&(name, value)| self.plain_attribute(name.text(self.src), value))
                .collect::<R<Vec<_>>>()?,
        };
        let self_closing = self.n(i).self_closing;
        if printed.is_empty() {
            return Ok(if self_closing {
                self.lit(" ")
            } else {
                self.d().nil()
            });
        }
        let sep = self.d().line();
        let joined = self.d().join(sep, &printed);
        let l = self.d().line();
        let mut inner = vec![l];
        inner.extend(joined);
        let inner = self.cat(&inner);
        let indented = self.d().indent(inner);
        let parent = self.n(i).parent;
        let hug_end = self
            .first(i)
            .is_some_and(|f| self.borrows_parent_open_end(f))
            || (self_closing && self.borrows_last_child_close_end(parent));
        let end = match (hug_end, self_closing) {
            (true, true) => self.lit(" "),
            (true, false) => self.d().nil(),
            (false, true) => self.d().line(),
            (false, false) => self.d().softline(),
        };
        Ok(self.cat(&[indented, end]))
    }

    /// The generic `attribute` print: the value with its preferred quote.
    fn plain_attribute(&mut self, name: &str, value: Option<Span>) -> R<DocId> {
        let Some(v) = value else {
            return Ok(self.d().text(name));
        };
        let raw = v.text(self.src);
        if raw.contains(['\n', '\r']) {
            return Err(Unsupported::at("a multi-line attribute value", v));
        }
        let value = raw.replace("&apos;", "'").replace("&quot;", "\"");
        let quote = if value.matches('"').count() > value.matches('\'').count() {
            '\''
        } else {
            '"'
        };
        let escaped = if quote == '"' {
            value.replace('"', "&quot;")
        } else {
            value.replace('\'', "&apos;")
        };
        Ok(self.d().text(&format!("{name}={quote}{escaped}{quote}")))
    }

    /// A template attribute: prettier's embedded attribute printers, then the generic one.
    fn attribute(&mut self, a: &Attr) -> R<DocId> {
        let name = a.name.text(self.src);
        let Some(v) = a.value else {
            return Ok(self.d().text(name));
        };
        let raw = v.text(self.src);
        match &a.kind {
            AttrKind::Static => {
                let lower = name.to_ascii_lowercase();
                if lower.starts_with("on")
                    || matches!(lower.as_str(), "style" | "srcset" | "sizes" | "allow")
                {
                    return Err(Unsupported::at(
                        "an attribute prettier formats as code",
                        a.span,
                    ));
                }
                if name == "class" && !raw.contains("{{") {
                    let value = raw.replace("&apos;", "'").replace("&quot;", "\"");
                    let collapsed: Vec<&str> = value.split_ascii_whitespace().collect();
                    let value = collapsed.join(" ").replace('"', "&quot;");
                    return Ok(self.d().text(&format!("{name}=\"{value}\"")));
                }
                self.plain_attribute(name, a.value)
            }
            AttrKind::Directive(d) => {
                if raw.contains(['&', '"']) {
                    return Err(Unsupported::at("an entity or quote in a directive", v));
                }
                let value = match (&d.exp, d.name) {
                    (DirExp::For(f), _) => self.v_for(&f.params, f.source)?,
                    (DirExp::Expr(e), DirName::Bind) => self.attribute_expression(*e, true)?,
                    (DirExp::Expr(e), _) => self.attribute_expression(*e, false)?,
                    (DirExp::None, _) => return Ok(self.d().text(name)),
                };
                let open = self.d().text(&format!("{name}=\""));
                let g = self.d().group(&[value]);
                let close = self.lit("\"");
                Ok(self.cat(&[open, g, close]))
            }
        }
    }

    fn expression(&mut self, e: NodeId, html_attribute: bool) -> R<DocId> {
        self.js.set_options(JsOptions {
            html_attribute,
            ..JsOptions::default()
        });
        let d = self.js.expression(e);
        self.js.set_options(JsOptions::default());
        d
    }

    /// `formatAttributeValue` with `shouldHugJsExpression`; `vue` for `__vue_expression`
    /// (`v-bind`), which also hugs string and template literals.
    fn attribute_expression(&mut self, e: NodeId, vue: bool) -> R<DocId> {
        let doc = self.expression(e, true)?;
        let hug = match self.c.js.kind(e) {
            Kind::Object(_) | Kind::Array(_) => true,
            Kind::Str | Kind::Template { .. } => vue,
            _ => false,
        };
        if hug {
            return Ok(self.d().group(&[doc]));
        }
        let soft = self.d().softline();
        let inner = self.cat(&[soft, doc]);
        let ind = self.d().indent(inner);
        let soft = self.d().softline();
        Ok(self.cat(&[ind, soft]))
    }

    /// `printVueVForDirective`.
    fn v_for(&mut self, params: &[NodeId], source: NodeId) -> R<DocId> {
        let ast: &Ast = &self.c.js;
        if params
            .iter()
            .any(|&p| !matches!(ast.kind(p), Kind::Ident(_)))
        {
            return Err(Unsupported::nowhere("a destructuring v-for alias"));
        }
        let mut printed = Vec::new();
        for &p in params {
            printed.push(self.js.parameter(p)?);
        }
        let left = if let [one] = printed[..] {
            one
        } else {
            let comma = self.lit(",");
            let l = self.d().line();
            let sep = self.cat(&[comma, l]);
            let joined = self.d().join(sep, &printed);
            let g = self.d().group(&joined);
            let soft = self.d().softline();
            let inner = self.cat(&[soft, g]);
            let ind = self.d().indent(inner);
            let open = self.lit("(");
            let soft = self.d().softline();
            let close = self.lit(")");
            self.cat(&[open, ind, soft, close])
        };
        let left = self.d().group(&[left]);
        let left = self.d().group(&[left]);
        let src_lo = (ast.loc(source).span().expect("a parsed source").lo) as usize;
        let attr_lo = (ast.loc(params[0]).span().expect("a parsed alias").lo) as usize;
        let between = &self.src[attr_lo..src_lo];
        let op = if between.trim_end().ends_with("of") {
            "of"
        } else {
            "in"
        };
        let right = self.expression(source, true)?;
        let right = self.d().group(&[right]);
        let sp = self.lit(" ");
        let op = self.lit(op);
        let sp2 = self.lit(" ");
        Ok(self.cat(&[left, sp, op, sp2, right]))
    }

    // ---- print/children.js -----------------------------------------------------------

    fn force_next_empty_line(&self, i: usize) -> bool {
        self.n(i)
            .next
            .is_some_and(|x| self.t.line(self.n(i).span.hi) + 1 < self.t.line(self.n(x).span.lo))
    }

    fn has_leading_line_break(&self, i: usize) -> bool {
        let n = self.n(i);
        n.has.leading
            && n.prev.map_or_else(
                || {
                    n.parent == ROOT
                        || self.t.line(self.n(n.parent).open_end) < self.t.line(n.span.lo)
                },
                |p| self.t.line(self.n(p).span.hi) < self.t.line(n.span.lo),
            )
    }

    fn has_trailing_line_break(&self, i: usize) -> bool {
        let n = self.n(i);
        n.has.trailing
            && n.next.map_or_else(
                || {
                    n.parent == ROOT
                        || self
                            .n(n.parent)
                            .close_start
                            .is_some_and(|c| self.t.line(c) > self.t.line(n.span.hi))
                },
                |x| self.t.line(self.n(x).span.lo) > self.t.line(n.span.hi),
            )
    }

    fn surrounding_hardline(&self, i: usize) -> bool {
        matches!(self.t.name(i), Some("script" | "select"))
    }

    fn prefer_hardline_leading(&self, i: usize) -> bool {
        self.surrounding_hardline(i)
            || self
                .n(i)
                .prev
                .is_some_and(|p| self.prefer_hardline_trailing(p))
            || (self.has_leading_line_break(i) && self.has_trailing_line_break(i))
    }

    fn prefer_hardline_trailing(&self, i: usize) -> bool {
        self.surrounding_hardline(i)
            || self.t.name(i) == Some("br")
            || (self.has_leading_line_break(i) && self.has_trailing_line_break(i))
    }

    /// `printBetweenLine`.
    fn between(&self, prev: usize, next: usize) -> Between {
        if self.text_like(prev) && self.text_like(next) {
            let p = self.n(prev);
            if p.sensitive.trailing {
                if !p.has.trailing {
                    return Between::None;
                }
                return if self.prefer_hardline_leading(next) {
                    Between::Hard
                } else {
                    Between::Line
                };
            }
            return if self.prefer_hardline_leading(next) {
                Between::Hard
            } else {
                Between::Soft
            };
        }
        let nx = self.n(next);
        if (self.borrows_next_open_start(prev)
            && (!nx.children.is_empty()
                || nx.self_closing
                || matches!(nx.kind, Kind2::Element { attrs, .. } if attrs_len(attrs) > 0)))
            || (self.t.is_element(prev)
                && self.n(prev).self_closing
                && self.borrows_prev_close_end(next))
        {
            return Between::None;
        }
        let deep_borrow = self.borrows_prev_close_end(next)
            && self.last(prev).is_some_and(|l| {
                self.borrows_parent_close_start(l)
                    && self
                        .last(l)
                        .is_some_and(|ll| self.borrows_parent_close_start(ll))
            });
        if !nx.sensitive.leading || self.prefer_hardline_leading(next) || deep_borrow {
            return Between::Hard;
        }
        if nx.has.leading {
            Between::Line
        } else {
            Between::Soft
        }
    }

    fn between_doc(&mut self, b: Between) -> DocId {
        match b {
            Between::None => self.d().nil(),
            Between::Soft => self.d().softline(),
            Between::Line => self.d().line(),
            Between::Hard => self.d().hardline(),
        }
    }

    fn force_break_children(&self, i: usize) -> bool {
        let n = self.n(i);
        self.t.is_element(i)
            && !n.children.is_empty()
            && (matches!(
                self.t.name(i),
                Some("html" | "head" | "ul" | "ol" | "select")
            ) || (n.display.starts_with("table") && n.display != "table-cell"))
    }

    fn force_break_content(&self, i: usize) -> bool {
        let n = self.n(i);
        let has_non_text_child = |c: usize| self.n(c).children.iter().any(|&g| !self.t.is_text(g));
        self.force_break_children(i)
            || (self.t.is_element(i)
                && !n.children.is_empty()
                && (matches!(self.t.name(i), Some("body" | "script" | "style"))
                    || n.children.iter().any(|&c| has_non_text_child(c))))
            || (n.children.len() == 1 && {
                let f = n.children[0];
                !self.t.is_text(f)
                    && self.has_leading_line_break(f)
                    && (!self.n(f).sensitive.trailing || self.has_trailing_line_break(f))
            })
    }

    /// `printChildren`.
    fn children(&mut self, i: usize) -> R<Vec<DocId>> {
        let kids = self.n(i).children.clone();
        if self.force_break_children(i) {
            let mut out = vec![self.d().break_parent()];
            for &k in &kids {
                if let Some(p) = self.n(k).prev {
                    let b = self.between(p, k);
                    if b != Between::None {
                        out.push(self.between_doc(b));
                        if self.force_next_empty_line(p) {
                            out.push(self.d().hardline());
                        }
                    }
                }
                out.push(self.print(k)?);
            }
            return Ok(out);
        }
        let ids: Vec<GroupId> = kids.iter().map(|_| self.d().new_group_id()).collect();
        let mut out = Vec::new();
        for (idx, &k) in kids.iter().enumerate() {
            let prev = self.n(k).prev;
            let next = self.n(k).next;
            if self.text_like(k) {
                if let Some(p) = prev
                    && self.text_like(p)
                {
                    let b = self.between(p, k);
                    if b != Between::None {
                        if self.force_next_empty_line(p) {
                            let h1 = self.d().hardline();
                            let h2 = self.d().hardline();
                            out.extend([h1, h2]);
                        } else {
                            out.push(self.between_doc(b));
                        }
                    }
                }
                out.push(self.print(k)?);
                continue;
            }
            let mut prev_parts = Vec::new();
            let mut leading = Vec::new();
            let mut trailing = Vec::new();
            let mut next_parts = Vec::new();
            let prev_between = prev.map_or(Between::None, |p| self.between(p, k));
            let next_between = next.map_or(Between::None, |x| self.between(k, x));
            if prev_between != Between::None {
                let p = prev.expect("a previous sibling");
                if self.force_next_empty_line(p) {
                    prev_parts.push(self.d().hardline());
                    prev_parts.push(self.d().hardline());
                } else if prev_between == Between::Hard {
                    prev_parts.push(self.d().hardline());
                } else if self.text_like(p) {
                    leading.push(self.between_doc(prev_between));
                } else {
                    let nil = self.d().nil();
                    let soft = self.d().softline();
                    leading.push(self.d().if_break_of(nil, soft, ids[idx - 1]));
                }
            }
            if next_between != Between::None {
                let x = next.expect("a next sibling");
                if self.force_next_empty_line(k) {
                    if self.text_like(x) {
                        next_parts.push(self.d().hardline());
                        next_parts.push(self.d().hardline());
                    }
                } else if next_between == Between::Hard {
                    if self.text_like(x) {
                        next_parts.push(self.d().hardline());
                    }
                } else {
                    trailing.push(self.between_doc(next_between));
                }
            }
            let child = self.print(k)?;
            let mut inner = vec![child];
            inner.extend(trailing);
            let inner = self.d().group_with_id(&inner, ids[idx]);
            leading.push(inner);
            let outer = self.d().group(&leading);
            out.extend(prev_parts);
            out.push(outer);
            out.extend(next_parts);
        }
        Ok(out)
    }

    // ---- printer-html.js, print/element.js -------------------------------------------

    fn print(&mut self, i: usize) -> R<DocId> {
        match &self.n(i).kind {
            Kind2::Element { .. } => self.element(i),
            Kind2::Text(_) => self.text(i),
            Kind2::Interpolation(e) => {
                let e = *e;
                let start = self.opening_tag_start(i);
                let expr = self.expression(e, false)?;
                let l = self.d().line();
                let inner = self.cat(&[l, expr]);
                let ind = self.d().indent(inner);
                let after = if self
                    .n(i)
                    .next
                    .is_some_and(|x| self.borrows_prev_close_end(x))
                {
                    self.lit(" ")
                } else {
                    self.d().line()
                };
                let end = self.closing_tag_end(i);
                Ok(self.cat(&[start, ind, after, end]))
            }
            Kind2::Root => unreachable!("the root is printed by `format`"),
        }
    }

    fn text(&mut self, i: usize) -> R<DocId> {
        let parent = self.n(i).parent;
        if let Kind2::Element { embed, .. } = self.n(parent).kind
            && embed != Embed::None
        {
            let body = self.embedded(embed)?;
            let bp = self.d().break_parent();
            let prefix = self.opening_tag_prefix(i);
            let suffix = self.closing_tag_suffix(i);
            return Ok(self.cat(&[bp, prefix, body, suffix]));
        }
        let Kind2::Text(value) = &self.n(i).kind else {
            unreachable!("a text node")
        };
        let words: Vec<String> = value.split_ascii_whitespace().map(str::to_owned).collect();
        let prefix = self.opening_tag_prefix(i);
        let suffix = self.closing_tag_suffix(i);
        let mut parts = Vec::with_capacity(words.len() * 2);
        for (j, w) in words.iter().enumerate() {
            if j > 0 {
                parts.push(self.d().line());
            }
            parts.push(self.d().text(w));
        }
        parts[0] = self.cat(&[prefix, parts[0]]);
        let last = parts.len() - 1;
        parts[last] = self.cat(&[parts[last], suffix]);
        Ok(self.d().fill(&parts))
    }

    /// A script or style body, as `textToDoc` returns it (no trailing line).
    fn embedded(&mut self, embed: Embed) -> R<DocId> {
        match embed {
            Embed::Script(program) => {
                let doc = self.js.program(program)?;
                let mut v = vec![doc];
                self.d().trim_right(&mut v, Docs::is_line);
                Ok(self.cat(&v))
            }
            Embed::Style(idx) => {
                let style = &self.c.styles[idx];
                let css = rsv_css::format::format(self.src, &style.sheet, "", "  ")?;
                if css
                    .lines()
                    .any(|l| rsv_kernel::doc::string_width(l) > PRINT_WIDTH)
                {
                    return Err(Unsupported::at(
                        "a CSS line longer than the print width",
                        style.span,
                    ));
                }
                let mut parts = Vec::new();
                for (j, line) in css.trim_end_matches('\n').split('\n').enumerate() {
                    if j > 0 {
                        parts.push(self.d().hardline());
                    }
                    parts.push(self.d().text(line));
                }
                Ok(self.cat(&parts))
            }
            Embed::None => unreachable!("an embedding block"),
        }
    }

    /// `printElement`.
    fn element(&mut self, i: usize) -> R<DocId> {
        let n = self.n(i);
        let kids = n.children.clone();
        let should_hug = kids.len() == 1 && {
            let f = self.n(kids[0]);
            matches!(f.kind, Kind2::Interpolation(_))
                && f.sensitive.leading
                && !f.has.leading
                && f.sensitive.trailing
                && !f.has.trailing
        };
        let gid = self.d().new_group_id();
        let opening = self.opening_tag(i)?;
        let opening = self.d().group_with_id(&[opening], gid);
        if kids.is_empty() {
            let n = self.n(i);
            let inner = if n.has.dangling && n.sensitive.dangling {
                self.d().line()
            } else {
                self.d().nil()
            };
            let closing = self.closing_tag(i);
            return Ok(self.d().group(&[opening, inner, closing]));
        }
        let first = kids[0];
        let last = *kids.last().expect("non-empty");
        let before = if should_hug {
            let soft = self.d().softline();
            let nil = self.d().nil();
            self.d().if_break_of(soft, nil, gid)
        } else if self.n(first).has.leading && self.n(first).sensitive.leading {
            self.d().line()
        } else {
            self.d().softline()
        };
        let printed = self.children(i)?;
        let mut body = vec![before];
        body.extend(printed);
        let body = self.cat(&body);
        let body = if should_hug {
            self.d().indent_if_break(body, gid)
        } else if self.t.is_script_like(i) && self.n(i).parent == ROOT {
            body
        } else {
            self.d().indent(body)
        };
        let after = if self.close_end_borrowed(i) {
            if self.n(last).has.trailing && self.n(last).sensitive.trailing {
                self.lit(" ")
            } else {
                self.d().nil()
            }
        } else if should_hug {
            let soft = self.d().softline();
            let nil = self.d().nil();
            self.d().if_break_of(soft, nil, gid)
        } else if self.n(last).has.trailing && self.n(last).sensitive.trailing {
            self.d().line()
        } else {
            self.d().softline()
        };
        let force = if self.force_break_content(i) {
            self.d().break_parent()
        } else {
            self.d().nil()
        };
        let closing = self.closing_tag(i);
        Ok(self.d().group(&[opening, force, body, after, closing]))
    }
}

const fn attrs_len(a: Attrs<'_>) -> usize {
    match a {
        Attrs::Template(l) => l.len(),
        Attrs::Block(l) => l.len(),
    }
}
