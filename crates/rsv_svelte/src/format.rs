//! Formats a component the way prettier-plugin-svelte 4.x does.
//!
//! The options are `printWidth: 80`, two-space
//! indentation, `svelteSortOrder: "options-scripts-markup-styles"`, `svelteIndentScriptAndStyle`,
//! `svelteAllowShorthand`, `bracketSameLine: false` and `htmlWhitespaceSensitivity: "css"`.
//!
//! The functions below port the plugin's `print`, `printChildren`, `printSvelteBlockChildren` and
//! its node helpers one to one, including the order in which it trims text nodes while printing:
//! the plugin mutates the text of its tree as it goes, and this port keeps that state in a side
//! table (`text`) instead of mutating the shared, immutable component.
//!
//! Script and expression bodies go through `rsv_js`'s formatter, style bodies through `rsv_css`'s.
//! Anything neither port covers is an [`Unsupported`] error, never an approximation.

use std::borrow::Cow;

pub use rsv_js::format::Unsupported;
use rsv_js::format::{Formatter, Options as JsOptions};
use rsv_kernel::doc::{DocId, Docs, PrintOptions, Refused};
use rsv_kernel::source::{LineIndex, Span};

use crate::ast::{Attr, AttrValue, Component, Part, TId, TNode, TagAttr};

type R<T> = Result<T, Unsupported>;

const PRINT_WIDTH: usize = 80;
const TAB_WIDTH: usize = 2;

/// prettier-plugin-svelte `selfClosingTags`.
const SELF_CLOSING: &[&str] = &[
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source",
    "track", "wbr",
];

/// prettier-plugin-svelte `blockElements`.
const BLOCK_ELEMENTS: &[&str] = &[
    "address",
    "article",
    "aside",
    "blockquote",
    "details",
    "dialog",
    "dd",
    "div",
    "dl",
    "dt",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "hgroup",
    "hr",
    "li",
    "main",
    "nav",
    "ol",
    "p",
    "pre",
    "section",
    "table",
    "ul",
];

/// # Errors
///
/// [`Unsupported`] if the component holds a construct this formatter does not print, or a
/// flat-only layout that does not fit.
pub fn format(c: &Component, src: &str) -> R<String> {
    let lines = LineIndex::new(src);
    let mut docs = Docs::new();
    let js = Formatter::new(&c.js, src, &lines, &mut docs, JsOptions::default());
    let mut f = Printer {
        c,
        src,
        js,
        text: vec![None; c.nodes.len()],
        in_pre: false,
    };
    let root = f.top_level()?;
    let opts = PrintOptions {
        width: PRINT_WIDTH,
        indent_spaces: Some(TAB_WIDTH),
        tab_width: TAB_WIDTH,
    };
    docs.print(root, &opts)
        .map_err(|Refused| Unsupported::nowhere("a layout that does not fit on one line"))
}

struct Printer<'a, 'd> {
    c: &'a Component,
    src: &'a str,
    js: Formatter<'d>,
    /// The plugin's mutable `raw` of each text node, once it differs from the source.
    text: Vec<Option<Cow<'a, str>>>,
    /// The plugin's `isPreTagContent(path)`.
    in_pre: bool,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum ElementKind {
    Regular,
    Component,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum BlockWs {
    None,
    Space,
    Line,
}

const fn is_collapse_ws(c: char) -> bool {
    matches!(c, '\t' | '\n' | '\x0C' | '\r' | ' ')
}

fn only_ws(s: &str) -> bool {
    s.chars().all(is_collapse_ws)
}

/// `^([\t\f\r ]*\n){n}`.
fn starts_with_linebreak(s: &str, n: usize) -> bool {
    let mut rest = s;
    for _ in 0..n {
        let t = rest.trim_start_matches(['\t', '\x0C', '\r', ' ']);
        let Some(after) = t.strip_prefix('\n') else {
            return false;
        };
        rest = after;
    }
    true
}

/// `(\n[\t\f\r ]*){n}$`.
fn ends_with_linebreak(s: &str, n: usize) -> bool {
    let mut rest = s;
    for _ in 0..n {
        let t = rest.trim_end_matches(['\t', '\x0C', '\r', ' ']);
        let Some(before) = t.strip_suffix('\n') else {
            return false;
        };
        rest = before;
    }
    true
}

impl<'a> Printer<'a, '_> {
    const fn d(&mut self) -> &mut Docs {
        &mut *self.js.docs
    }

    fn lit(&mut self, s: &'static str) -> DocId {
        self.js.docs.lit(s)
    }

    fn cat(&mut self, items: &[DocId]) -> DocId {
        self.js.docs.concat(items)
    }

    fn group(&mut self, items: &[DocId]) -> DocId {
        self.js.docs.group(items)
    }

    fn is_text(&self, id: TId) -> bool {
        matches!(self.c.node(id), TNode::Text { .. })
    }

    /// `getUnencodedText`: the raw text as the plugin currently holds it.
    fn raw(&self, id: TId) -> &str {
        match &self.text[id as usize] {
            Some(t) => t,
            None => match self.c.node(id) {
                TNode::Text { span } => span.text(self.src),
                _ => unreachable!("only text nodes have text"),
            },
        }
    }

    fn set_raw(&mut self, id: TId, s: Cow<'a, str>) {
        self.text[id as usize] = Some(s);
    }

    fn trim_left(&mut self, id: TId) {
        let t = self.raw_cow(id);
        let t = match t {
            Cow::Borrowed(b) => Cow::Borrowed(b.trim_start_matches(is_collapse_ws)),
            Cow::Owned(o) => Cow::Owned(o.trim_start_matches(is_collapse_ws).to_owned()),
        };
        self.set_raw(id, t);
    }

    fn trim_right(&mut self, id: TId) {
        let t = self.raw_cow(id);
        let t = match t {
            Cow::Borrowed(b) => Cow::Borrowed(b.trim_end_matches(is_collapse_ws)),
            Cow::Owned(o) => Cow::Owned(o.trim_end_matches(is_collapse_ws).to_owned()),
        };
        self.set_raw(id, t);
    }

    fn raw_cow(&self, id: TId) -> Cow<'a, str> {
        match &self.text[id as usize] {
            Some(Cow::Borrowed(b)) => Cow::Borrowed(b),
            Some(Cow::Owned(o)) => Cow::Owned(o.clone()),
            None => match self.c.node(id) {
                TNode::Text { span } => Cow::Borrowed(span.text(self.src)),
                _ => unreachable!("only text nodes have text"),
            },
        }
    }

    fn is_empty_text(&self, id: TId) -> bool {
        self.is_text(id) && only_ws(self.raw(id))
    }

    fn text_starts_ws(&self, id: TId) -> bool {
        self.is_text(id) && self.raw(id).starts_with(is_collapse_ws)
    }

    fn text_ends_ws(&self, id: TId) -> bool {
        self.is_text(id) && self.raw(id).ends_with(is_collapse_ws)
    }

    fn text_starts_linebreak(&self, id: TId) -> bool {
        self.is_text(id) && starts_with_linebreak(self.raw(id), 1)
    }

    fn text_ends_linebreak(&self, id: TId, n: usize) -> bool {
        self.is_text(id) && ends_with_linebreak(self.raw(id), n)
    }

    fn element_name(&self, id: TId) -> Option<&'a str> {
        match self.c.node(id) {
            TNode::Element { name, .. } => Some(name.text(self.src)),
            _ => None,
        }
    }

    fn element_kind(name: &str) -> ElementKind {
        if name.starts_with(|c: char| c.is_ascii_uppercase()) || name.contains('.') {
            ElementKind::Component
        } else {
            ElementKind::Regular
        }
    }

    fn is_regular(&self, id: TId) -> bool {
        self.element_name(id)
            .is_some_and(|n| Self::element_kind(n) == ElementKind::Regular)
    }

    /// `isBlockElement` (with `htmlWhitespaceSensitivity: "css"`).
    fn is_block(&self, id: TId) -> bool {
        self.is_regular(id) && BLOCK_ELEMENTS.contains(&self.element_name(id).expect("element"))
    }

    /// `isInlineElement`; `in_pre` is the path's `isPreTagContent`.
    fn is_inline(&self, id: TId, in_pre: bool) -> bool {
        self.is_regular(id) && !self.is_block(id) && !in_pre
    }

    fn children(&self, id: TId) -> Vec<TId> {
        match self.c.node(id) {
            TNode::Element { children, .. } => self.c.children(*children).to_vec(),
            _ => Vec::new(),
        }
    }

    /// `printTopLevelParts` for `options-scripts-markup-styles`.
    fn top_level(&mut self) -> R<DocId> {
        self.refuse_moved_comments()?;
        let mut parts = Vec::new();
        let c = self.c;
        if let Some(script) = &c.instance {
            let body = self.script_body(script.content, script.program)?;
            let tag = self.embed_tag("script", &script.attrs, body);
            let h = self.d().hardline();
            parts.push(self.cat(&[tag, h]));
        }
        let root = self.merged_root();
        let markup = self.fragment(&root)?;
        if let Some(markup) = markup {
            parts.push(markup);
        }
        if let Some(style) = &c.style {
            let body = self.style_body(style)?;
            let tag = self.embed_tag("style", &style.attrs, body);
            let h = self.d().hardline();
            parts.push(self.cat(&[tag, h]));
        }
        let sep = self.d().hardline();
        let joined = self.d().join(sep, &parts);
        Ok(self.group(&joined))
    }

    /// The plugin moves HTML comments right before a `<script>`/`<style>` along with it, and keeps
    /// `<!-- #endregion -->` below it; neither is ported.
    fn refuse_moved_comments(&self) -> R<()> {
        let hoisted: Vec<Span> = self
            .c
            .instance
            .iter()
            .map(|s| s.span)
            .chain(self.c.style.iter().map(|s| s.span))
            .collect();
        for &id in self.c.children(self.c.root) {
            let TNode::Comment { span, data } = *self.c.node(id) else {
                continue;
            };
            let data = data.text(self.src).trim();
            if data.starts_with("prettier-ignore") {
                return Err(Unsupported::at("prettier-ignore comments", span));
            }
            for h in &hoisted {
                let before = span.hi <= h.lo && only_ws(&self.src[span.hi as usize..h.lo as usize]);
                let after = h.hi <= span.lo && only_ws(&self.src[h.hi as usize..span.lo as usize]);
                if before || (after && data.contains("endregion")) {
                    return Err(Unsupported::at(
                        "comments attached to <script> or <style>",
                        span,
                    ));
                }
            }
        }
        Ok(())
    }

    /// `mergeAdjacentTextNodesInFragment` on the root, where removing `<script>` and `<style>`
    /// leaves text nodes side by side.
    fn merged_root(&mut self) -> Vec<TId> {
        let mut out: Vec<TId> = Vec::new();
        let c = self.c;
        for &id in c.children(c.root) {
            if let Some(&prev) = out.last()
                && self.is_text(prev)
                && self.is_text(id)
            {
                self.trim_right(prev);
                let merged = format!("{}{}", self.raw(prev), self.raw(id));
                self.set_raw(prev, Cow::Owned(merged));
                continue;
            }
            out.push(id);
        }
        out
    }

    /// `embedTag` for a top-level `<script>` / `<style>`.
    fn embed_tag(&mut self, tag: &'static str, attrs: &[TagAttr], body: DocId) -> DocId {
        let mut inner = Vec::new();
        for &(name, value) in attrs {
            let line = self.d().line();
            let a = match value {
                None => {
                    let src = self.src;
                    self.d().text(name.text(src))
                }
                Some(v) => {
                    let text = format!("{}=\"{}\"", name.text(self.src), v.text(self.src));
                    self.d().text(&text)
                }
            };
            inner.push(self.cat(&[line, a]));
        }
        let soft = self.d().softline();
        inner.push(self.d().dedent(soft));
        let g = self.group(&inner);
        let attrs = self.d().indent(g);
        let lt = self.lit("<");
        let name = self.lit(tag);
        let gt = self.lit(">");
        let open = self.group(&[lt, name, attrs, gt]);
        let close = self.d().text(&format!("</{tag}>"));
        self.group(&[open, body, close])
    }

    /// `formatBodyContent` around the script's program.
    fn script_body(&mut self, content: Span, program: rsv_js::NodeId) -> R<DocId> {
        let text = content.text(self.src);
        if text.trim().is_empty() {
            return Ok(if text.is_empty() {
                self.d().nil()
            } else {
                self.d().hardline()
            });
        }
        let body = self.js.program(program)?;
        Ok(self.indented_body(body))
    }

    /// `[indent([hardline, body]), hardline]` after trimming the body's trailing lines.
    fn indented_body(&mut self, body: DocId) -> DocId {
        let mut v = vec![body];
        self.d().trim_right(&mut v, Docs::is_line);
        let h = self.d().hardline();
        let mut inner = vec![h];
        inner.extend(v);
        let inner = self.cat(&inner);
        let inner = self.d().indent(inner);
        let h = self.d().hardline();
        self.cat(&[inner, h])
    }

    fn style_body(&mut self, style: &crate::ast::Style) -> R<DocId> {
        if let Some((n, _)) = style.attrs.iter().find(|(n, v)| {
            matches!(n.text(self.src), "lang" | "type")
                && v.is_some_and(|v| v.text(self.src) != "css")
        }) {
            return Err(Unsupported::at("a style language other than CSS", *n));
        }
        let text = style.sheet.content.text(self.src);
        if text.trim().is_empty() {
            return Ok(if text.is_empty() {
                self.d().nil()
            } else {
                self.d().hardline()
            });
        }
        let css = rsv_css::format::format(self.src, &style.sheet, "", "  ")?;
        // The CSS printer makes no width decisions; it is exact only while no line has to wrap.
        if css
            .lines()
            .any(|l| TAB_WIDTH + rsv_kernel::doc::string_width(l) > PRINT_WIDTH)
        {
            return Err(Unsupported::at(
                "a CSS line longer than the print width",
                style.span,
            ));
        }
        let mut parts = Vec::new();
        for (i, line) in css.trim_end_matches('\n').split('\n').enumerate() {
            if i > 0 {
                parts.push(self.d().hardline());
            }
            parts.push(self.d().text(line));
        }
        let body = self.cat(&parts);
        Ok(self.indented_body(body))
    }

    /// `print` for the root `Fragment`; `None` for the plugin's empty result.
    fn fragment(&mut self, children: &[TId]) -> R<Option<DocId>> {
        if children.is_empty() || children.iter().all(|&c| self.is_empty_text(c)) {
            return Ok(None);
        }
        self.trim_children(children);
        let printed = self.print_children(children)?;
        let inner = self.cat(&printed);
        let mut output = vec![inner];
        self.d().trim(&mut output, |d, x| {
            d.is_line(x) || d.as_str(x).is_some_and(only_ws) || d.is_break_parent(x)
        });
        if output.iter().all(|&x| self.js.docs.is_empty(x)) {
            return Ok(None);
        }
        output.push(self.d().hardline());
        Ok(Some(self.group(&output)))
    }

    /// `trimChildren`.
    fn trim_children(&mut self, children: &[TId]) {
        let first = children
            .iter()
            .position(|&c| !self.is_empty_text(c))
            .unwrap_or(children.len() - 1);
        let last = children
            .iter()
            .rposition(|&c| !self.is_empty_text(c))
            .unwrap_or(0);
        for &c in &children[..=first] {
            if self.is_text(c) {
                self.trim_left(c);
            }
        }
        for &c in children[last..].iter().rev() {
            if self.is_text(c) {
                self.trim_right(c);
            }
        }
    }

    /// `printChildren` (outside `<pre>`).
    fn print_children(&mut self, children: &[TId]) -> R<Vec<DocId>> {
        let in_pre = self.in_pre;
        // `prepareChildren`: text emptied by earlier trims is gone.
        let prepared: Vec<TId> = children
            .iter()
            .copied()
            .filter(|&c| !(self.is_text(c) && self.raw(c).is_empty()))
            .collect();
        if prepared.is_empty() {
            return Ok(Vec::new());
        }
        let mut docs: Vec<DocId> = Vec::new();
        let mut ws_of_prev_text = false;
        let n = prepared.len();
        for i in 0..n {
            let child = prepared[i];
            if self.is_text(child) {
                ws_of_prev_text = false;
                if i == 0 || i == n - 1 {
                    docs.push(self.node(child)?);
                    continue;
                }
                let prev = prepared[i - 1];
                let next = prepared[i + 1];
                if self.text_starts_ws(child) && !self.is_empty_text(child) {
                    if self.is_inline(prev, in_pre) && !self.text_starts_linebreak(child) {
                        self.trim_left(child);
                        let last = docs.pop().expect("a previous child was printed");
                        let line = self.d().line();
                        docs.push(self.group(&[last, line]));
                    }
                    if self.is_block(prev) && !self.text_starts_linebreak(child) {
                        self.trim_left(child);
                    }
                }
                if self.text_ends_ws(child) {
                    if self.is_inline(next, in_pre) && !self.text_ends_linebreak(child, 1) {
                        ws_of_prev_text = !self.is_block(prev);
                        self.trim_right(child);
                    }
                    if self.is_block(next) && !self.text_ends_linebreak(child, 2) {
                        ws_of_prev_text = !self.is_block(prev);
                        self.trim_right(child);
                    }
                }
                docs.push(self.node(child)?);
            } else if self.is_block(child) {
                let prev = i.checked_sub(1).map(|j| prepared[j]);
                if let Some(p) = prev
                    && !self.is_block(p)
                    && (!self.is_text(p) || ws_of_prev_text || !self.text_ends_ws(p))
                {
                    docs.push(self.d().softline());
                }
                docs.push(self.node(child)?);
                if let Some(&next) = prepared.get(i + 1) {
                    let followed_by_inline = prepared
                        .get(i + 2)
                        .is_some_and(|&x| self.is_inline(x, in_pre));
                    if !self.is_text(next)
                        || ((!self.is_empty_text(next) || followed_by_inline)
                            && !self.text_starts_linebreak(next))
                    {
                        docs.push(self.d().softline());
                    }
                }
                ws_of_prev_text = false;
            } else if self.is_inline(child, in_pre) {
                let d = self.node(child)?;
                if ws_of_prev_text {
                    let line = self.d().line();
                    docs.push(self.group(&[line, d]));
                } else {
                    docs.push(d);
                }
                ws_of_prev_text = false;
            } else {
                docs.push(self.node(child)?);
                ws_of_prev_text = false;
            }
        }
        if n > 1 && prepared.iter().any(|&c| self.is_block(c)) {
            docs.push(self.d().break_parent());
        }
        Ok(docs)
    }

    /// `print` for one template node.
    fn node(&mut self, id: TId) -> R<DocId> {
        match *self.c.node(id) {
            TNode::Text { .. } => Ok(self.text_node(id)),
            TNode::Comment { data, span } => {
                let data = data.text(self.src);
                if data.trim().starts_with("prettier-ignore") {
                    return Err(Unsupported::at("prettier-ignore comments", span));
                }
                let o = self.lit("<!--");
                let t = self.d().text(data);
                let c = self.lit("-->");
                Ok(self.group(&[o, t, c]))
            }
            TNode::Expr { expr, .. } => {
                let e = self.expression(expr, false, false)?;
                let o = self.lit("{");
                let c = self.lit("}");
                Ok(self.cat(&[o, e, c]))
            }
            TNode::Element { .. } => self.element(id),
            TNode::If { .. } => self.if_block(id),
        }
    }

    /// An embedded expression (`printJS`), optionally forced onto one line or into single quotes.
    fn expression(&mut self, e: rsv_js::NodeId, single_line: bool, single_quote: bool) -> R<DocId> {
        self.js.set_options(JsOptions { single_quote });
        let d = self.js.expression(e);
        self.js.set_options(JsOptions::default());
        let d = d?;
        Ok(if single_line {
            self.d().remove_lines(d)
        } else {
            d
        })
    }

    fn text_node(&mut self, id: TId) -> DocId {
        let raw = self.raw(id).to_owned();
        if self.in_pre {
            return self.d().text(&raw);
        }
        if only_ws(&raw) {
            return self.whitespace(&raw);
        }
        let docs = self.split_text(&raw);
        self.d().fill(&docs)
    }

    /// `printWhitespace`.
    fn whitespace(&mut self, text: &str) -> DocId {
        let newlines = text.matches('\n').count();
        if newlines >= 2 {
            let a = self.d().hardline();
            let b = self.d().hardline();
            self.cat(&[a, b])
        } else if newlines == 1 {
            self.d().hardline()
        } else if !text.is_empty() {
            self.d().line()
        } else {
            self.d().nil()
        }
    }

    /// `splitTextToDocs`.
    fn split_text(&mut self, text: &str) -> Vec<DocId> {
        let words: Vec<&str> = text.split(is_collapse_ws).collect();
        let mut docs: Vec<DocId> = Vec::new();
        let mut pending_line = false;
        for (i, w) in words.iter().enumerate() {
            if i > 0 {
                pending_line = true;
            }
            if w.is_empty() {
                continue;
            }
            if pending_line {
                docs.push(self.d().line());
                pending_line = false;
            }
            docs.push(self.d().text(w));
        }
        if pending_line {
            docs.push(self.d().line());
        }
        // `split` on a run of whitespace yields empty words between; the join above collapses them
        // the way `join(line, words).filter(d => d !== '')` does.
        if starts_with_linebreak(text, 1) {
            docs[0] = self.d().hardline();
        }
        if starts_with_linebreak(text, 2) {
            let h = self.d().hardline();
            docs.insert(0, h);
        }
        if ends_with_linebreak(text, 1) {
            let last = docs.len() - 1;
            docs[last] = self.d().hardline();
        }
        if ends_with_linebreak(text, 2) {
            let h = self.d().hardline();
            docs.push(h);
        }
        docs
    }

    #[expect(
        clippy::too_many_lines,
        reason = "ports the plugin's element branch of `print` in one piece"
    )]
    fn element(&mut self, id: TId) -> R<DocId> {
        let TNode::Element {
            name,
            attrs,
            span,
            self_closing: did_self_close,
            ..
        } = *self.c.node(id)
        else {
            unreachable!("an element")
        };
        let name = name.text(self.src);
        if name.contains(':') {
            return Err(Unsupported::at("svelte: elements", span));
        }
        if name == "template"
            && attrs
                .get(&self.c.attrs)
                .iter()
                .any(|a| matches!(a.name.text(self.src), "lang" | "type"))
        {
            return Err(Unsupported::at("<template> with a language", span));
        }
        let children = self.children(id);
        let is_empty = children.iter().all(|&c| self.is_empty_text(c));
        let kind = Self::element_kind(name);
        let self_closing = is_empty && (did_self_close || SELF_CLOSING.contains(&name));
        let was_pre = self.in_pre;
        let is_pre_el = kind == ElementKind::Regular
            && matches!(name.to_ascii_lowercase().as_str(), "pre" | "textarea");
        let in_pre = was_pre || is_pre_el;

        let mut attr_docs = Vec::new();
        let c = self.c;
        for a in attrs.get(&c.attrs) {
            let line = self.d().line();
            let doc = self.attribute(a, kind)?;
            attr_docs.push(self.cat(&[line, doc]));
        }
        let lt = self.lit("<");
        let name_doc = self.d().text(name);
        if self_closing {
            let line = self.d().line();
            let dl = self.d().dedent(line);
            let mut inner = attr_docs;
            inner.push(dl);
            let g = self.group(&inner);
            let ind = self.d().indent(g);
            let close = self.lit("/>");
            return Ok(self.group(&[lt, name_doc, ind, close]));
        }

        let first = children.first().copied();
        let last = children.last().copied();
        let is_inline = kind == ElementKind::Regular && !self.is_block(id) && !in_pre;
        let hug_start = self.should_hug(id, &children, true);
        let hug_end = self.should_hug(id, &children, false);

        let mut open_inner = attr_docs;
        if (is_empty || !hug_start) && !in_pre {
            let soft = self.d().softline();
            open_inner.push(self.d().dedent(soft));
        }
        let g = self.group(&open_inner);
        let attrs_doc = self.d().indent(g);
        let opening = [lt, name_doc, attrs_doc];
        let close_full = self.d().text(&format!("</{name}>"));

        if hug_start && hug_end {
            let body = self.element_body(&children, is_empty, is_inline, in_pre)?;
            let soft = self.d().softline();
            let gt = self.lit(">");
            let close_open = self.d().text(&format!("</{name}"));
            let inner = self.group(&[gt, body, close_open]);
            let hugged = self.cat(&[soft, inner]);
            let hugged = if is_empty {
                self.group(&[hugged])
            } else {
                let ind = self.d().indent(hugged);
                self.group(&[ind])
            };
            let omit = is_empty;
            let mut parts = opening.to_vec();
            parts.push(hugged);
            if !omit {
                parts.push(self.d().softline());
            }
            parts.push(self.lit(">"));
            return Ok(self.group(&parts));
        }

        let (sep_start, sep_end) = if in_pre {
            (self.d().nil(), self.d().nil())
        } else {
            let mut sep_start = self.d().softline();
            let mut sep_end = self.d().softline();
            let mut did_set_end = false;
            if !hug_start && let Some(f) = first.filter(|&f| self.is_text(f)) {
                let l = last.expect("non-empty");
                if self.text_starts_linebreak(f) && f != l && (!is_inline || self.text_ends_ws(l)) {
                    sep_start = self.d().hardline();
                    sep_end = self.d().hardline();
                    did_set_end = true;
                } else if is_inline {
                    sep_start = self.d().line();
                }
                self.trim_left(f);
            }
            if !hug_end && let Some(l) = last.filter(|&l| self.is_text(l)) {
                if is_inline && !did_set_end {
                    sep_end = self.d().line();
                }
                self.trim_right(l);
            }
            (sep_start, sep_end)
        };

        if hug_start {
            let body = self.element_body(&children, is_empty, is_inline, in_pre)?;
            let gt = self.lit(">");
            let inner = self.group(&[gt, body]);
            let soft = self.d().softline();
            let ind = self.cat(&[soft, inner]);
            let ind = self.d().indent(ind);
            let mut parts = opening.to_vec();
            parts.extend([ind, sep_end, close_full]);
            return Ok(self.group(&parts));
        }
        if hug_end {
            let body = self.element_body(&children, is_empty, is_inline, in_pre)?;
            let close_open = self.d().text(&format!("</{name}"));
            let inner = self.group(&[body, close_open]);
            let ind = self.cat(&[sep_start, inner]);
            let ind = self.d().indent(ind);
            let gt = self.lit(">");
            let soft = self.d().softline();
            let gt2 = self.lit(">");
            let mut parts = opening.to_vec();
            parts.extend([gt, ind, soft, gt2]);
            return Ok(self.group(&parts));
        }
        let body = self.element_body(&children, is_empty, is_inline, in_pre)?;
        let gt = self.lit(">");
        let mut parts = opening.to_vec();
        if is_empty {
            parts.extend([gt, body, close_full]);
            return Ok(self.group(&parts));
        }
        let ind = self.cat(&[sep_start, body]);
        let ind = self.d().indent(ind);
        parts.extend([gt, ind, sep_end, close_full]);
        Ok(self.group(&parts))
    }

    /// The element's `body()`, printed after the separators have trimmed its first/last text.
    fn element_body(
        &mut self,
        children: &[TId],
        is_empty: bool,
        is_inline: bool,
        in_pre: bool,
    ) -> R<DocId> {
        if is_empty {
            return Ok(
                if is_inline && !children.is_empty() && self.text_starts_ws(children[0]) && !in_pre
                {
                    self.d().line()
                } else {
                    self.d().nil()
                },
            );
        }
        if in_pre {
            return self.pre(children);
        }
        let saved = self.in_pre;
        self.in_pre = false;
        let docs = self.print_children(children);
        self.in_pre = saved;
        let docs = docs?;
        Ok(self.cat(&docs))
    }

    /// `printPre`: text verbatim, line breaks as literal lines.
    fn pre(&mut self, children: &[TId]) -> R<DocId> {
        let saved = self.in_pre;
        self.in_pre = true;
        let mut out = Vec::new();
        for &c in children {
            if let TNode::Text { span } = *self.c.node(c) {
                for (j, line) in span.text(self.src).split('\n').enumerate() {
                    if j > 0 {
                        out.push(self.d().literalline());
                    }
                    out.push(self.d().text(line.strip_suffix('\r').unwrap_or(line)));
                }
            } else {
                let d = self.node(c);
                match d {
                    Ok(d) => out.push(d),
                    Err(e) => {
                        self.in_pre = saved;
                        return Err(e);
                    }
                }
            }
        }
        self.in_pre = saved;
        Ok(self.cat(&out))
    }

    /// `shouldHugStart` / `shouldHugEnd`.
    fn should_hug(&self, id: TId, children: &[TId], start: bool) -> bool {
        if self.is_block(id) {
            return false;
        }
        let Some(&edge) = (if start {
            children.first()
        } else {
            children.last()
        }) else {
            return true;
        };
        if start {
            !self.text_starts_ws(edge)
        } else {
            !self.text_ends_ws(edge)
        }
    }

    fn attribute(&mut self, a: &Attr, element: ElementKind) -> R<DocId> {
        let name = a.name.text(self.src);
        let parts = match a.value {
            AttrValue::True => return Ok(self.d().text(name)),
            AttrValue::Parts(r) => r.get(&self.c.parts).to_vec(),
        };
        let lone = matches!(parts.as_slice(), [Part::Expr { .. }]);
        if let [Part::Expr { expr, .. }] = parts.as_slice()
            && matches!(self.c.js.kind(*expr), rsv_js::Kind::Ident(_))
            && self.c.js.name(*expr) == name
        {
            let text = format!("{{{name}}}");
            return Ok(self.d().text(&text));
        }
        let mut value = Vec::new();
        let count = parts.len();
        for (i, p) in parts.iter().enumerate() {
            match *p {
                Part::Text(span) => {
                    let mut raw = span.text(self.src).to_owned();
                    if name == "class" && element == ElementKind::Regular {
                        raw = normalize_class(&raw, i + 1 == count);
                    }
                    for (j, line) in raw.split('\n').enumerate() {
                        if j > 0 {
                            value.push(self.d().literalline());
                        }
                        value.push(self.d().text(line.strip_suffix('\r').unwrap_or(line)));
                    }
                }
                Part::Expr { expr, .. } => {
                    let e = self.expression(expr, false, !lone)?;
                    let o = self.lit("{");
                    let c = self.lit("}");
                    value.push(self.cat(&[o, e, c]));
                }
            }
        }
        let n = self.d().text(name);
        let eq = self.lit("=");
        let v = self.cat(&value);
        Ok(if lone {
            self.cat(&[n, eq, v])
        } else {
            let q = self.lit("\"");
            let q2 = self.lit("\"");
            self.cat(&[n, eq, q, v, q2])
        })
    }

    fn if_block(&mut self, id: TId) -> R<DocId> {
        let TNode::If { test, cons, .. } = *self.c.node(id) else {
            unreachable!("an if block")
        };
        let open = self.lit("{#if ");
        let t = self.expression(test, true, false)?;
        let close = self.lit("}");
        let c = self.c;
        let body = self.block_children(c.children(cons))?;
        let mut def = vec![open, t, close, body];
        def.push(self.if_alternate(id)?);
        def.push(self.lit("{/if}"));
        let def = self.cat(&def);
        let bp = self.d().break_parent();
        Ok(self.group(&[def, bp]))
    }

    /// `printIfBlockAlternate`.
    fn if_alternate(&mut self, id: TId) -> R<DocId> {
        let TNode::If { alt, .. } = *self.c.node(id) else {
            unreachable!("an if block")
        };
        let Some(alt) = alt else {
            return Ok(self.d().nil());
        };
        let kids = self.c.children(alt).to_vec();
        if let [only] = kids.as_slice()
            && let TNode::If {
                test,
                cons,
                elseif: true,
                ..
            } = *self.c.node(*only)
        {
            let open = self.lit("{:else if ");
            let t = self.expression(test, true, false)?;
            let close = self.lit("}");
            let c = self.c;
            let body = self.block_children(c.children(cons))?;
            let rest = self.if_alternate(*only)?;
            return Ok(self.cat(&[open, t, close, body, rest]));
        }
        #[expect(
            clippy::literal_string_with_formatting_args,
            reason = "Svelte's `{:else}` tag"
        )]
        let open = self.lit("{:else}");
        let body = self.block_children(&kids)?;
        Ok(self.cat(&[open, body]))
    }

    /// `printSvelteBlockChildren`.
    fn block_children(&mut self, children: &[TId]) -> R<DocId> {
        if children.is_empty() {
            return Ok(self.d().nil());
        }
        let start = self.block_ws(children, true);
        let end = self.block_ws(children, false);
        let any_line = start == BlockWs::Line || end == BlockWs::Line;
        let startline = match start {
            BlockWs::None => self.d().nil(),
            _ if any_line => self.d().hardline(),
            _ => self.d().line(),
        };
        let endline = match end {
            BlockWs::None => self.d().nil(),
            _ if any_line => self.d().hardline(),
            _ => self.d().line(),
        };
        let first = children[0];
        let last = *children.last().expect("non-empty");
        if self.text_starts_ws(first) {
            self.trim_left(first);
        }
        if self.text_ends_ws(last) {
            self.trim_right(last);
        }
        let docs = self.print_children(children)?;
        let g = self.group(&docs);
        let inner = self.cat(&[startline, g]);
        let inner = self.d().indent(inner);
        Ok(self.cat(&[inner, endline]))
    }

    /// `checkWhitespaceAtStartOfSvelteBlock` / `…AtEndOfSvelteBlock`.
    fn block_ws(&self, children: &[TId], start: bool) -> BlockWs {
        let edge = if start {
            children[0]
        } else {
            *children.last().expect("non-empty")
        };
        if start {
            if self.text_starts_linebreak(edge) {
                return BlockWs::Line;
            }
            if self.text_starts_ws(edge) {
                return BlockWs::Space;
            }
            // The Svelte parser may swallow whitespace between the block's `}` and its first child.
            let lo = self.c.node(edge).span().lo as usize;
            if let Some(brace) = self.src[..(lo + 1).min(self.src.len())].rfind('}')
                && brace > 0
                && lo > brace + 1
            {
                let between = &self.src[brace + 1..lo];
                if only_ws(between) {
                    return if starts_with_linebreak(between, 1) {
                        BlockWs::Line
                    } else {
                        BlockWs::Space
                    };
                }
            }
        } else {
            if self.text_ends_linebreak(edge, 1) {
                return BlockWs::Line;
            }
            if self.text_ends_ws(edge) {
                return BlockWs::Space;
            }
            let hi = self.c.node(edge).span().hi as usize;
            if let Some(off) = self.src[hi..].find('{') {
                let brace = hi + off;
                if brace > 0 && hi < brace {
                    let between = &self.src[hi..brace];
                    if only_ws(between) {
                        return if ends_with_linebreak(between, 1) {
                            BlockWs::Line
                        } else {
                            BlockWs::Space
                        };
                    }
                }
            }
        }
        BlockWs::None
    }
}

/// The plugin's whitespace normalization of a `class` attribute's text on a regular element.
fn normalize_class(raw: &str, is_last_part: bool) -> String {
    // `([^ \t\n])(([ \t]+$)|([ \t]+(\r?\n))|[ \t]+)` → collapse inner runs, drop them before a
    // line break, keep them at the very end.
    let b = raw.as_bytes();
    let mut out = String::with_capacity(raw.len());
    let mut i = 0;
    while i < b.len() {
        let c = b[i];
        let run_start = i + 1;
        if !matches!(c, b' ' | b'\t' | b'\n')
            && run_start < b.len()
            && matches!(b[run_start], b' ' | b'\t')
        {
            let mut j = run_start;
            while j < b.len() && matches!(b[j], b' ' | b'\t') {
                j += 1;
            }
            out.push_str(&raw[i..run_start]);
            if j == b.len() {
                out.push_str(&raw[run_start..j]);
            } else if b[j] == b'\n' {
                out.push('\n');
                j += 1;
            } else if b[j] == b'\r' && b.get(j + 1) == Some(&b'\n') {
                out.push_str("\r\n");
                j += 2;
            } else {
                out.push(' ');
            }
            i = j;
            continue;
        }
        let ch = raw[i..].chars().next().expect("in bounds");
        out.push(ch);
        i += ch.len_utf8();
    }
    // `([^ \t\n])[ \t]+$` → `$1` at the end of the value, `$1 ` before an expression.
    let trimmed = out.trim_end_matches([' ', '\t']);
    if trimmed.len() < out.len() && !trimmed.is_empty() && !trimmed.ends_with('\n') {
        let mut s = trimmed.to_owned();
        if !is_last_part {
            s.push(' ');
        }
        return s;
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn refusal(src: &str) -> (&'static str, Option<&str>) {
        let c = crate::parse::parse(src).expect("parses");
        let u = format(&c, src).expect_err("refused");
        (u.what, u.loc.span().map(|s| s.text(src)))
    }

    #[test]
    fn a_refusal_points_at_the_construct() {
        assert_eq!(
            refusal("<p>a</p>\n<svelte:head><title>x</title></svelte:head>\n"),
            (
                "svelte: elements",
                Some("<svelte:head><title>x</title></svelte:head>")
            )
        );
        assert_eq!(
            refusal("<script>\n\tlet a = { 'b': 1 };\n</script>\n"),
            ("quoted or numeric property key", Some("'b'"))
        );
    }
}
