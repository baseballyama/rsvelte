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
//! Script bodies and template expressions go through `rsvelte_javascript`'s formatter, style bodies
//! through `rsvelte_stylesheet`'s; anything neither covers is an [`Unsupported`] error, never an
//! approximation.

use std::borrow::Cow;

pub use rsvelte_javascript::format::Unsupported;
use rsvelte_javascript::format::{Formatter, Options as JavaScriptOptions};
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_kernel::output::document::{
    GroupIdentifier, LayoutInstructionIdentifier, LayoutInstructions, PrintOptions, Refused,
};
use rsvelte_kernel::source::positions::{LineIndex, Span};

use crate::syntax_tree::{
    Attribute, AttributeKind, DirectiveExpression, DirectiveName, SingleFileComponent,
    TagAttributes, TemplateNode, TemplateNodeIdentifier,
};

type R<T> = Result<T, Unsupported>;

const PRINT_WIDTH: usize = 80;
const TAB_WIDTH: usize = 2;

/// prettier's `CSS_DISPLAY_TAGS` (from `html-ua-styles`, with its special cases), for the tags
/// whose display is not `inline`.
const STYLESHEET_DISPLAY: &[(&str, &str)] = &[
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
/// `lines` is `source_text`'s, which the pipeline builds once per document.
pub fn format(c: &SingleFileComponent, source_text: &str, lines: &LineIndex) -> R<String> {
    let tree = Tree::build(c, source_text, lines)?;
    let mut docs = LayoutInstructions::new();
    let javascript = Formatter::new(
        &c.javascript,
        source_text,
        lines,
        &mut docs,
        JavaScriptOptions::default(),
    );
    let mut p = Printer {
        c,
        source_text,
        t: &tree,
        javascript,
    };
    let children = p.children(ROOT)?;
    let body = p.javascript.docs.group(&children);
    let h = p.javascript.docs.hardline();
    let root = p.javascript.docs.concat(&[body, h]);
    let options = PrintOptions {
        width: PRINT_WIDTH,
        indent_spaces: Some(TAB_WIDTH),
        tab_width: TAB_WIDTH,
    };
    docs.print(root, &options)
        .map_err(|Refused| Unsupported::nowhere("a layout that does not fit on one line"))
}

const ROOT: usize = 0;

#[derive(Debug)]
enum Kind2<'a> {
    Root,
    Element {
        name: &'a str,
        attributes: Attributes<'a>,
        embed: Embed,
    },
    Text(Cow<'a, str>),
    Interpolation(NodeIdentifier),
}

#[derive(Debug, Clone, Copy)]
enum Attributes<'a> {
    Template(&'a [Attribute]),
    Block(&'a [TagAttributes]),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Embed {
    None,
    Script(NodeIdentifier),
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
            open_end: span.end_offset,
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
    source_text: &'a str,
}

const fn is_markup_ws(b: u8) -> bool {
    matches!(b, b' ' | b'\t' | b'\n' | b'\x0c' | b'\r')
}

fn only_ws(s: &str) -> bool {
    s.bytes().all(is_markup_ws)
}

impl<'a> Tree<'a> {
    fn build(c: &'a SingleFileComponent, source_text: &'a str, lines: &'a LineIndex) -> R<Self> {
        // The parser has read the document, so its offsets fit in `u32`.
        let len = source_text.len() as u32;
        let mut t = Tree {
            n: vec![Node::new(Kind2::Root, usize::MAX, Span::new(0, len))],
            lines,
            source_text,
        };
        let mut blocks: Vec<(Span, usize)> = Vec::new();
        if let Some(tpl) = &c.template {
            let identifier = t.push(
                Kind2::Element {
                    name: "template",
                    attributes: Attributes::Block(&tpl.attributes),
                    embed: Embed::None,
                },
                ROOT,
                tpl.span,
            );
            t.n[identifier].open_end = tpl.content.start_offset;
            t.n[identifier].close_start = Some(tpl.content.end_offset);
            let children = t.template_nodes(c, identifier, c.children(tpl.root))?;
            t.n[identifier].children = children;
            blocks.push((tpl.span, identifier));
        }
        if let Some(s) = &c.script {
            let identifier = t.block(
                "script",
                &s.attributes,
                Embed::Script(s.program),
                s.span,
                s.content,
            );
            blocks.push((s.span, identifier));
        }
        for (i, s) in c.styles.iter().enumerate() {
            if s.attributes.iter().any(|(n, v)| {
                n.text(source_text) == "lang" && v.is_some_and(|v| v.text(source_text) != "css")
            }) {
                return Err(Unsupported::at("a style language other than CSS", s.span));
            }
            let identifier = t.block("style", &s.attributes, Embed::Style(i), s.span, s.content);
            blocks.push((s.span, identifier));
        }
        blocks.sort_by_key(|b| b.0.start_offset);
        let mut at = 0;
        for (i, &(span, identifier)) in blocks.iter().enumerate() {
            let gap = &source_text[at as usize..span.start_offset as usize];
            if !only_ws(gap) {
                return Err(Unsupported::at(
                    "content between the blocks",
                    Span::new(at, span.start_offset),
                ));
            }
            if !gap.is_empty() {
                t.n[identifier].has.leading = true;
                if i > 0 {
                    t.n[blocks[i - 1].1].has.trailing = true;
                }
            }
            at = span.end_offset;
        }
        if !only_ws(&source_text[at as usize..]) {
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
        attributes: &'a [TagAttributes],
        embed: Embed,
        span: Span,
        content: Span,
    ) -> usize {
        let identifier = self.push(
            Kind2::Element {
                name,
                attributes: Attributes::Block(attributes),
                embed,
            },
            ROOT,
            span,
        );
        self.n[identifier].open_end = content.start_offset;
        self.n[identifier].close_start = Some(content.end_offset);
        let text = content.text(self.source_text);
        if only_ws(text) {
            self.n[identifier].has.dangling = !text.is_empty();
        } else {
            let t = self.push(Kind2::Text(Cow::Borrowed(text)), identifier, content);
            self.n[identifier].children = vec![t];
        }
        identifier
    }

    fn template_nodes(
        &mut self,
        c: &'a SingleFileComponent,
        parent: usize,
        children: &[TemplateNodeIdentifier],
    ) -> R<Vec<usize>> {
        let mut out = Vec::with_capacity(children.len());
        for &k in children {
            let identifier = match *c.node(k) {
                TemplateNode::Text { span } => self.push(
                    Kind2::Text(Cow::Borrowed(span.text(self.source_text))),
                    parent,
                    span,
                ),
                TemplateNode::Comment { span, .. } => {
                    return Err(Unsupported::at("a template comment", span));
                }
                TemplateNode::Interpolation { expression, span } => {
                    self.push(Kind2::Interpolation(expression), parent, span)
                }
                TemplateNode::Element {
                    name,
                    attributes,
                    children,
                    start_tag,
                    self_closing,
                    span,
                } => {
                    let tag = name.text(self.source_text);
                    if REFUSED_TAGS.contains(&tag) || tag.contains('-') || tag.contains(':') {
                        return Err(Unsupported::at("this element", name));
                    }
                    let attributes = c.attributes(attributes);
                    let identifier = self.push(
                        Kind2::Element {
                            name: tag,
                            attributes: Attributes::Template(attributes),
                            embed: Embed::None,
                        },
                        parent,
                        span,
                    );
                    self.n[identifier].open_end = start_tag.end_offset;
                    let void = VOID_TAGS.contains(&tag);
                    self.n[identifier].self_closing = void || self_closing;
                    if !void && !self_closing {
                        let close = self.source_text[..span.end_offset as usize]
                            .rfind("</")
                            .ok_or_else(|| {
                                Unsupported::at("an element without an end tag", span)
                            })?;
                        self.n[identifier].close_start =
                            Some(span.start_offset + (close - span.start_offset as usize) as u32);
                    }
                    let children = self.template_nodes(c, identifier, c.children(children))?;
                    self.n[identifier].children = children;
                    identifier
                }
            };
            out.push(identifier);
        }
        Ok(out)
    }

    fn link(&mut self) {
        for i in 0..self.n.len() {
            let children = self.n[i].children.clone();
            for (j, &k) in children.iter().enumerate() {
                self.n[k].parent = i;
                self.n[k].prev = j.checked_sub(1).map(|p| children[p]);
                self.n[k].next = children.get(j + 1).copied();
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
            let children = std::mem::take(&mut self.n[i].children);
            if children.len() == 1
                && let Kind2::Text(t) = &self.n[children[0]].kind
                && only_ws(t)
            {
                self.n[i].has.dangling = true;
                continue;
            }
            let mut out: Vec<usize> = Vec::with_capacity(children.len());
            let mut pending_leading = false;
            for (j, &k) in children.iter().enumerate() {
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
                        .trim_start_matches(|c: char| c.is_ascii() && is_markup_ws(c as u8))
                        .len();
                let trimmed_end = text
                    .trim_end_matches(|c: char| c.is_ascii() && is_markup_ws(c as u8))
                    .len();
                if lead == text.len() {
                    if let Some(&p) = out.last() {
                        self.n[p].has.trailing = true;
                    }
                    pending_leading = j + 1 < children.len();
                    continue;
                }
                let trail = text.len() - trimmed_end;
                let value = match text {
                    Cow::Borrowed(s) => Cow::Borrowed(&s[lead..trimmed_end]),
                    Cow::Owned(s) => Cow::Owned(s[lead..trimmed_end].to_owned()),
                };
                let span = self.n[k].span;
                self.n[k].span = Span::new(
                    span.start_offset + u32::try_from(lead).expect("fits"),
                    span.end_offset - u32::try_from(trail).expect("fits"),
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
                    pending_leading = j + 1 < children.len();
                }
                out.push(k);
            }
            self.n[i].children = out;
        }
    }

    /// `addStylesheetDisplay` and `addIsSelfClosing`.
    fn display_and_closing(&mut self) {
        for i in 1..self.n.len() {
            let display = match self.n[i].kind {
                Kind2::Element { .. } if self.n[i].parent == ROOT => "block",
                Kind2::Element { name, .. } => STYLESHEET_DISPLAY
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
            let children = self.n[i].children.clone();
            if children.is_empty() {
                let d = self.n[i].display;
                self.n[i].sensitive.dangling =
                    !Self::is_block_like(d) && d != "inline-block" && !self.is_script_like(i);
                continue;
            }
            for &k in &children {
                self.n[k].sensitive.leading = self.is_leading_sensitive(k);
                self.n[k].sensitive.trailing = self.is_trailing_sensitive(k);
            }
            for (j, &k) in children.iter().enumerate() {
                if j > 0 {
                    self.n[k].sensitive.leading =
                        self.n[children[j - 1]].sensitive.trailing && self.n[k].sensitive.leading;
                }
                if j + 1 < children.len() {
                    self.n[k].sensitive.trailing =
                        self.n[children[j + 1]].sensitive.leading && self.n[k].sensitive.trailing;
                }
            }
        }
    }

    /// `mergeSimpleElementIntoText`: `a<b>x</b>c` becomes one text.
    fn merge_simple_elements(&mut self) {
        for i in 0..self.n.len() {
            let mut j = 0;
            while j < self.n[i].children.len() {
                let children = &self.n[i].children;
                let k = children[j];
                let simple = self.is_simple_element(k, j, children);
                if !simple {
                    j += 1;
                    continue;
                }
                let (prev, next) = (children[j - 1], children[j + 1]);
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
                self.n[prev].span =
                    Span::new(self.n[prev].span.start_offset, self.n[next].span.end_offset);
                self.n[prev].sensitive.trailing = self.n[next].sensitive.trailing;
                self.n[prev].has.trailing = self.n[next].has.trailing;
                self.n[i].children.drain(j..=j + 1);
            }
        }
    }

    fn is_simple_element(&self, k: usize, j: usize, children: &[usize]) -> bool {
        let n = &self.n[k];
        let Kind2::Element {
            attributes: Attributes::Template(attributes),
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
        attributes.is_empty()
            && !t.bytes().any(is_markup_ws)
            && !self.n[child].has.leading
            && !self.n[child].has.trailing
            && n.sensitive.leading
            && !n.has.leading
            && n.sensitive.trailing
            && !n.has.trailing
            && j > 0
            && j + 1 < children.len()
            && self.is_text(children[j - 1])
            && self.is_text(children[j + 1])
    }

    fn line(&self, at: u32) -> u32 {
        self.lines.line_column(at).line
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
    c: &'a SingleFileComponent,
    source_text: &'a str,
    t: &'a Tree<'a>,
    javascript: Formatter<'d>,
}

impl<'a> Printer<'a, '_> {
    const fn d(&mut self) -> &mut LayoutInstructions {
        self.javascript.docs
    }

    fn lit(&mut self, s: &'static str) -> LayoutInstructionIdentifier {
        self.d().lit(s)
    }

    fn cat(&mut self, items: &[LayoutInstructionIdentifier]) -> LayoutInstructionIdentifier {
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

    fn open_start_marker(&mut self, i: usize) -> LayoutInstructionIdentifier {
        match self.n(i).kind {
            Kind2::Interpolation(_) => self.lit("{{"),
            Kind2::Element { name, .. } => self.d().text(&format!("<{name}")),
            _ => unreachable!("only tags have markers"),
        }
    }

    fn close_start_marker(&mut self, i: usize) -> LayoutInstructionIdentifier {
        let name = self.t.name(i).expect("an element");
        self.d().text(&format!("</{name}"))
    }

    fn close_end_marker(&mut self, i: usize) -> LayoutInstructionIdentifier {
        match self.n(i).kind {
            Kind2::Interpolation(_) => self.lit("}}"),
            Kind2::Element { .. } if self.n(i).self_closing => self.lit("/>"),
            _ => self.lit(">"),
        }
    }

    fn closing_tag(&mut self, i: usize) -> LayoutInstructionIdentifier {
        let start = if self.n(i).self_closing {
            self.d().nil()
        } else {
            self.closing_tag_start(i)
        };
        let end = self.closing_tag_end(i);
        self.cat(&[start, end])
    }

    fn closing_tag_start(&mut self, i: usize) -> LayoutInstructionIdentifier {
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

    fn closing_tag_end(&mut self, i: usize) -> LayoutInstructionIdentifier {
        if self.close_end_borrowed(i) {
            return self.d().nil();
        }
        let marker = self.close_end_marker(i);
        let suffix = self.closing_tag_suffix(i);
        self.cat(&[marker, suffix])
    }

    fn closing_tag_suffix(&mut self, i: usize) -> LayoutInstructionIdentifier {
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

    fn opening_tag_prefix(&mut self, i: usize) -> LayoutInstructionIdentifier {
        if self.borrows_parent_open_end(i) {
            return self.lit(">");
        }
        if self.borrows_prev_close_end(i) {
            let p = self.n(i).prev.expect("a previous sibling");
            return self.close_end_marker(p);
        }
        self.d().nil()
    }

    fn opening_tag_start(&mut self, i: usize) -> LayoutInstructionIdentifier {
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

    fn opening_tag(&mut self, i: usize) -> R<LayoutInstructionIdentifier> {
        let start = self.opening_tag_start(i);
        let attributes = self.attributes(i)?;
        let end = if self.n(i).self_closing
            || self
                .first(i)
                .is_some_and(|f| self.borrows_parent_open_end(f))
        {
            self.d().nil()
        } else {
            self.lit(">")
        };
        Ok(self.cat(&[start, attributes, end]))
    }

    /// `printAttributes`.
    fn attributes(&mut self, i: usize) -> R<LayoutInstructionIdentifier> {
        let Kind2::Element { attributes, .. } = self.n(i).kind else {
            unreachable!("an element")
        };
        let printed = match attributes {
            Attributes::Template(list) => list
                .iter()
                .map(|a| self.attribute(a))
                .collect::<R<Vec<_>>>()?,
            Attributes::Block(list) => list
                .iter()
                .map(|&(name, value)| self.plain_attribute(name.text(self.source_text), value))
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
    fn plain_attribute(
        &mut self,
        name: &str,
        value: Option<Span>,
    ) -> R<LayoutInstructionIdentifier> {
        let Some(v) = value else {
            return Ok(self.d().text(name));
        };
        let raw = v.text(self.source_text);
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
    fn attribute(&mut self, a: &Attribute) -> R<LayoutInstructionIdentifier> {
        let name = a.name.text(self.source_text);
        let Some(v) = a.value else {
            return Ok(self.d().text(name));
        };
        let raw = v.text(self.source_text);
        match &a.kind {
            AttributeKind::Static => {
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
            AttributeKind::Directive(d) => {
                if raw.contains(['&', '"']) {
                    return Err(Unsupported::at("an entity or quote in a directive", v));
                }
                let value = match (&d.exp, d.name) {
                    (DirectiveExpression::For(f), _) => self.v_for(&f.parameters, f.source)?,
                    (DirectiveExpression::Expression(e), DirectiveName::Bind) => {
                        self.attribute_expression(*e, true)?
                    }
                    (DirectiveExpression::Expression(e), _) => {
                        self.attribute_expression(*e, false)?
                    }
                    (DirectiveExpression::None, _) => return Ok(self.d().text(name)),
                };
                let open = self.d().text(&format!("{name}=\""));
                let g = self.d().group(&[value]);
                let close = self.lit("\"");
                Ok(self.cat(&[open, g, close]))
            }
        }
    }

    fn expression(
        &mut self,
        e: NodeIdentifier,
        markup_attribute: bool,
    ) -> R<LayoutInstructionIdentifier> {
        self.javascript.set_options(JavaScriptOptions {
            markup_attribute,
            ..JavaScriptOptions::default()
        });
        let d = self.javascript.format_expression(e);
        self.javascript.set_options(JavaScriptOptions::default());
        d
    }

    /// `formatAttributeValue` with `shouldHugJavaScriptExpression`; `vue` for `__vue_expression`
    /// (`v-bind`), which also hugs string and template literals.
    fn attribute_expression(
        &mut self,
        e: NodeIdentifier,
        vue: bool,
    ) -> R<LayoutInstructionIdentifier> {
        let document = self.expression(e, true)?;
        let hug = match self.c.javascript.kind(e) {
            Kind::Object(_) | Kind::Array(_) => true,
            Kind::String | Kind::Template { .. } => vue,
            _ => false,
        };
        if hug {
            return Ok(self.d().group(&[document]));
        }
        let soft = self.d().softline();
        let inner = self.cat(&[soft, document]);
        let indentation = self.d().indent(inner);
        let soft = self.d().softline();
        Ok(self.cat(&[indentation, soft]))
    }

    /// `printVueVForDirective`.
    fn v_for(
        &mut self,
        parameters: &[NodeIdentifier],
        source: NodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let syntax_tree: &SyntaxTree = &self.c.javascript;
        if parameters
            .iter()
            .any(|&p| !matches!(syntax_tree.kind(p), Kind::Identifier(_)))
        {
            return Err(Unsupported::nowhere("a destructuring v-for alias"));
        }
        let mut printed = Vec::new();
        for &p in parameters {
            printed.push(self.javascript.parameter(p)?);
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
            let indentation = self.d().indent(inner);
            let open = self.lit("(");
            let soft = self.d().softline();
            let close = self.lit(")");
            self.cat(&[open, indentation, soft, close])
        };
        let left = self.d().group(&[left]);
        let left = self.d().group(&[left]);
        let source_text_start_offset = (syntax_tree
            .source_location(source)
            .span()
            .expect("a parsed source")
            .start_offset) as usize;
        let attribute_start_offset = (syntax_tree
            .source_location(parameters[0])
            .span()
            .expect("a parsed alias")
            .start_offset) as usize;
        let between = &self.source_text[attribute_start_offset..source_text_start_offset];
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
        self.n(i).next.is_some_and(|x| {
            self.t.line(self.n(i).span.end_offset) + 1 < self.t.line(self.n(x).span.start_offset)
        })
    }

    fn has_leading_line_break(&self, i: usize) -> bool {
        let n = self.n(i);
        n.has.leading
            && n.prev.map_or_else(
                || {
                    n.parent == ROOT
                        || self.t.line(self.n(n.parent).open_end) < self.t.line(n.span.start_offset)
                },
                |p| self.t.line(self.n(p).span.end_offset) < self.t.line(n.span.start_offset),
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
                            .is_some_and(|c| self.t.line(c) > self.t.line(n.span.end_offset))
                },
                |x| self.t.line(self.n(x).span.start_offset) > self.t.line(n.span.end_offset),
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
        let has_attributes =
            matches!(nx.kind, Kind2::Element { attributes, .. } if attributes_len(attributes) > 0);
        if (self.borrows_next_open_start(prev)
            && (!nx.children.is_empty() || nx.self_closing || has_attributes))
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

    fn between_doc(&mut self, b: Between) -> LayoutInstructionIdentifier {
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
    fn children(&mut self, i: usize) -> R<Vec<LayoutInstructionIdentifier>> {
        let children = self.n(i).children.clone();
        if self.force_break_children(i) {
            let mut out = vec![self.d().break_parent()];
            for &k in &children {
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
        let identifiers: Vec<GroupIdentifier> = children
            .iter()
            .map(|_| self.d().new_group_identifier())
            .collect();
        let mut out = Vec::new();
        for (index, &k) in children.iter().enumerate() {
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
                    leading.push(self.d().if_break_of(nil, soft, identifiers[index - 1]));
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
            let inner = self.d().group_with_identifier(&inner, identifiers[index]);
            leading.push(inner);
            let outer = self.d().group(&leading);
            out.extend(prev_parts);
            out.push(outer);
            out.extend(next_parts);
        }
        Ok(out)
    }

    // ---- printer-html.js, print/element.js -------------------------------------------

    fn print(&mut self, i: usize) -> R<LayoutInstructionIdentifier> {
        match &self.n(i).kind {
            Kind2::Element { .. } => self.element(i),
            Kind2::Text(_) => self.text(i),
            Kind2::Interpolation(e) => {
                let e = *e;
                let start = self.opening_tag_start(i);
                let expression = self.expression(e, false)?;
                let l = self.d().line();
                let inner = self.cat(&[l, expression]);
                let indentation = self.d().indent(inner);
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
                Ok(self.cat(&[start, indentation, after, end]))
            }
            Kind2::Root => unreachable!("the root is printed by `format`"),
        }
    }

    fn text(&mut self, i: usize) -> R<LayoutInstructionIdentifier> {
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
    fn embedded(&mut self, embed: Embed) -> R<LayoutInstructionIdentifier> {
        match embed {
            Embed::Script(program) => {
                let document = self.javascript.program(program)?;
                let mut v = vec![document];
                self.d().trim_right(&mut v, LayoutInstructions::is_line);
                Ok(self.cat(&v))
            }
            Embed::Style(index) => {
                let style = &self.c.styles[index];
                let stylesheet =
                    rsvelte_stylesheet::format::format(self.source_text, &style.sheet, "", "  ")?;
                if stylesheet
                    .lines()
                    .any(|l| rsvelte_kernel::output::document::string_width(l) > PRINT_WIDTH)
                {
                    return Err(Unsupported::at(
                        "a CSS line longer than the print width",
                        style.span,
                    ));
                }
                let mut parts = Vec::new();
                for (j, line) in stylesheet.trim_end_matches('\n').split('\n').enumerate() {
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
    fn element(&mut self, i: usize) -> R<LayoutInstructionIdentifier> {
        let n = self.n(i);
        let children = n.children.clone();
        let should_hug = children.len() == 1 && {
            let f = self.n(children[0]);
            matches!(f.kind, Kind2::Interpolation(_))
                && f.sensitive.leading
                && !f.has.leading
                && f.sensitive.trailing
                && !f.has.trailing
        };
        let gid = self.d().new_group_identifier();
        let opening = self.opening_tag(i)?;
        let opening = self.d().group_with_identifier(&[opening], gid);
        if children.is_empty() {
            let n = self.n(i);
            let inner = if n.has.dangling && n.sensitive.dangling {
                self.d().line()
            } else {
                self.d().nil()
            };
            let closing = self.closing_tag(i);
            return Ok(self.d().group(&[opening, inner, closing]));
        }
        let first = children[0];
        let last = *children.last().expect("non-empty");
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

const fn attributes_len(a: Attributes<'_>) -> usize {
    match a {
        Attributes::Template(l) => l.len(),
        Attributes::Block(l) => l.len(),
    }
}
