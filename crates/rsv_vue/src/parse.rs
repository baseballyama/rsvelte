//! The single-file component parser: the top-level blocks (compiler-sfc's `parse`) and the
//! template inside `<template>` (compiler-core's tokenizer, in its `sfc` mode).
//!
//! It reads one `<template>`, one `<script setup>` and any number of `<style>` blocks; the
//! template holds elements, text, comments, `{{ }}` interpolations, static attributes and the
//! `v-bind`/`:`, `v-on`/`@`, `v-if`/`v-else-if`/`v-else` and `v-for` directives. Anything else is
//! refused.
//!
//! As upstream, an interpolation ends at the first `}}` and an attribute value at its closing
//! quote; the text in between is then parsed as JavaScript (TypeScript under `lang="ts"`).

use rsv_js::parser::{parse_expression, parse_params, parse_program};
use rsv_js::{Ast, NodeId};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::source::Span;
use rsv_kernel::token::Tokens;

use crate::ast::{
    Attr, AttrKind, DirExp, DirName, Directive, ForExp, Range, Script, Sfc, Style, TId, TNode,
    TagAttr, Template, Tk,
};

type R<T> = Result<T, Diagnostic>;

/// `@vue/shared`'s `VOID_TAGS`.
const VOID_TAGS: &[&str] = &[
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source",
    "track", "wbr",
];

#[must_use]
pub fn is_void(name: &str) -> bool {
    VOID_TAGS.contains(&name)
}

/// # Errors
///
/// A `parse_error` [`Diagnostic`] at the first syntax error, or at syntax this parser does not
/// support; `js_parse_error` / `css_parse_error` from the embedded parsers.
pub fn parse(src: &str) -> R<Sfc> {
    let mut p = P {
        src,
        b: src.as_bytes(),
        pos: 0,
        c: Sfc {
            js: Ast::new(),
            nodes: Vec::new(),
            kids: Vec::new(),
            attrs: Vec::new(),
            template: None,
            script: None,
            program: NodeId::NONE,
            styles: Vec::new(),
            ts: script_is_ts(src),
            tokens: Tokens::with_capacity(src.len() / 4),
        },
    };
    p.blocks()?;
    p.c.program = match &p.c.script {
        Some(s) => s.program,
        None => p.c.js.program(&[], Span::new(0, 0)),
    };
    Ok(p.c)
}

/// The template's expressions are TypeScript when the script is: compileScript passes `isTS` to the
/// template compiler. Read before parsing, because the template may come first.
fn script_is_ts(src: &str) -> bool {
    let mut from = 0;
    while let Some(i) = src[from..].find("<script") {
        let at = from + i + "<script".len();
        from = at;
        if !src[at..].starts_with(|c: char| c.is_ascii_whitespace() || c == '>') {
            continue;
        }
        let tag = &src[at..at + src[at..].find('>').unwrap_or(src.len() - at)];
        return tag
            .split_ascii_whitespace()
            .any(|a| matches!(a, "lang=\"ts\"" | "lang='ts'" | "lang=ts"));
    }
    false
}

struct P<'a> {
    src: &'a str,
    b: &'a [u8],
    pos: usize,
    c: Sfc,
}

impl<'a> P<'a> {
    fn err<X>(&self, message: impl Into<String>) -> R<X> {
        Self::err_at(Span::new(self.pos as u32, self.pos as u32), message)
    }

    fn err_at<X>(span: Span, message: impl Into<String>) -> R<X> {
        Err(Diagnostic::error("parse_error", message.into(), span))
    }

    fn rest(&self) -> &'a str {
        &self.src[self.pos..]
    }

    fn peek(&self) -> Option<u8> {
        self.b.get(self.pos).copied()
    }

    fn tok(&mut self, kind: Tk, lo: usize) {
        self.c
            .tokens
            .push(kind, Span::new(lo as u32, self.pos as u32));
    }

    fn eat_tok(&mut self, kind: Tk, n: usize) {
        let lo = self.pos;
        self.pos += n;
        self.tok(kind, lo);
    }

    fn skip_ws(&mut self) {
        let lo = self.pos;
        while self.peek().is_some_and(|c| c.is_ascii_whitespace()) {
            self.pos += 1;
        }
        self.tok(Tk::Whitespace, lo);
    }

    /// Copies what the JavaScript parser recorded in `lo..hi` into the component's tokens.
    fn js_region(&mut self, lo: u32, hi: u32, tokens_from: usize, comments_from: usize) {
        let mut at = lo;
        for (kind, span) in self.c.js.recorded_since(tokens_from, comments_from) {
            self.c.tokens.push(Tk::Whitespace, Span::new(at, span.lo));
            self.c.tokens.push(kind.map_or(Tk::JsComment, Tk::Js), span);
            at = span.hi;
        }
        self.c.tokens.push(Tk::Whitespace, Span::new(at, hi));
    }

    const fn marks(&self) -> (usize, usize) {
        (self.c.js.tokens.len(), self.c.js.comments.len())
    }

    fn expression(&mut self, range: Span) -> R<NodeId> {
        let (t, c) = self.marks();
        let e = parse_expression(&mut self.c.js, self.src, range, self.c.ts)
            .map_err(|e| Diagnostic::error("js_parse_error", e.message, e.span))?;
        self.js_region(range.lo, range.hi, t, c);
        Ok(e)
    }

    fn push(&mut self, n: TNode) -> TId {
        self.c.nodes.push(n);
        (self.c.nodes.len() - 1) as TId
    }

    fn range_of(v: &mut Vec<TId>, items: Vec<TId>) -> Range {
        let start = v.len() as u32;
        let len = items.len() as u32;
        v.extend(items);
        Range { start, len }
    }

    // ---- the top level ---------------------------------------------------------------------

    fn blocks(&mut self) -> R<()> {
        loop {
            let rest = self.rest();
            if rest.is_empty() {
                return Ok(());
            }
            if rest.starts_with("<!--") {
                let Some(end) = rest.find("-->") else {
                    return self.err("unterminated comment");
                };
                self.eat_tok(Tk::HtmlComment, end + 3);
            } else if rest.starts_with("<template") && self.tag_ends_at("<template".len()) {
                self.template()?;
            } else if rest.starts_with("<script") && self.tag_ends_at("<script".len()) {
                self.script()?;
            } else if rest.starts_with("<style") && self.tag_ends_at("<style".len()) {
                self.style()?;
            } else if rest.starts_with('<') {
                return self.err("custom blocks are not supported yet");
            } else {
                let lo = self.pos;
                self.pos += rest.find('<').unwrap_or(rest.len());
                let kind = if self.src[lo..self.pos].trim_ascii().is_empty() {
                    Tk::Whitespace
                } else {
                    Tk::Text
                };
                self.tok(kind, lo);
            }
        }
    }

    fn tag_ends_at(&self, n: usize) -> bool {
        self.b
            .get(self.pos + n)
            .is_some_and(|&c| c.is_ascii_whitespace() || c == b'>' || c == b'/')
    }

    /// `(name, unquoted value)` pairs of a block's start tag, through its `>`.
    fn open_tag_attrs(&mut self) -> R<Vec<TagAttr>> {
        self.eat_tok(Tk::TagOpen, 1);
        let lo = self.pos;
        while self.peek().is_some_and(|c| c.is_ascii_alphanumeric()) {
            self.pos += 1;
        }
        self.tok(Tk::TagName, lo);
        let mut attrs = Vec::new();
        loop {
            self.skip_ws();
            match self.peek() {
                None => return self.err("unterminated start tag"),
                Some(b'>') => {
                    self.eat_tok(Tk::TagEnd, 1);
                    return Ok(attrs);
                }
                Some(_) => {
                    let n = self.pos;
                    while self
                        .peek()
                        .is_some_and(|c| !c.is_ascii_whitespace() && !matches!(c, b'=' | b'>'))
                    {
                        self.pos += 1;
                    }
                    let name = Span::new(n as u32, self.pos as u32);
                    self.tok(Tk::AttrName, n);
                    let mut value = None;
                    if self.peek() == Some(b'=') {
                        self.eat_tok(Tk::Eq, 1);
                        let Some(q @ (b'"' | b'\'')) = self.peek() else {
                            return self.err("expected a quoted value");
                        };
                        let v = self.pos + 1;
                        let Some(len) = self.src[v..].find(q as char) else {
                            return self.err("unterminated attribute value");
                        };
                        value = Some(Span::new(v as u32, (v + len) as u32));
                        self.eat_tok(Tk::Quote, 1);
                        self.eat_tok(Tk::AttrText, len);
                        self.eat_tok(Tk::Quote, 1);
                    }
                    attrs.push((name, value));
                }
            }
        }
    }

    /// Raw text up to `</tag>`; leaves `pos` at the closing tag.
    fn raw_text(&mut self, tag: &str) -> R<Span> {
        let close = format!("</{tag}>");
        let lo = self.pos;
        let Some(len) = self.rest().find(&close) else {
            return self.err(format!("`<{tag}>` was left open"));
        };
        self.pos += len;
        Ok(Span::new(lo as u32, (lo + len) as u32))
    }

    fn close_tag(&mut self, tag: &str) -> R<()> {
        if !self.rest().starts_with("</") || !self.rest()[2..].starts_with(tag) {
            return self.err(format!("expected `</{tag}>`"));
        }
        self.eat_tok(Tk::EndTagOpen, 2);
        self.eat_tok(Tk::TagName, tag.len());
        self.skip_ws();
        if self.peek() != Some(b'>') {
            return self.err("expected `>`");
        }
        self.eat_tok(Tk::TagEnd, 1);
        Ok(())
    }

    fn template(&mut self) -> R<()> {
        let lo = self.pos;
        let attrs = self.open_tag_attrs()?;
        if let Some((name, _)) = attrs
            .iter()
            .find(|(n, _)| matches!(n.text(self.src), "lang" | "src" | "functional"))
        {
            return Self::err_at(*name, "this template attribute is not supported yet");
        }
        if self.c.template.is_some() {
            return self.err("a component can have only one <template>");
        }
        let content_lo = self.pos;
        let root = self.fragment(Some("template"))?;
        let content = Span::new(content_lo as u32, self.pos as u32);
        self.close_tag("template")?;
        self.c.template = Some(Template {
            span: Span::new(lo as u32, self.pos as u32),
            attrs,
            content,
            root,
        });
        Ok(())
    }

    fn script(&mut self) -> R<()> {
        let lo = self.pos;
        let attrs = self.open_tag_attrs()?;
        let has = |name: &str| attrs.iter().find(|(n, _)| n.text(self.src) == name);
        if has("setup").is_none() {
            return Self::err_at(
                Span::new(lo as u32, self.pos as u32),
                "only <script setup> is supported yet",
            );
        }
        if let Some((name, _)) = has("src") {
            return Self::err_at(*name, "an external script is not supported yet");
        }
        if let Some((name, Some(lang))) = has("lang")
            && !matches!(lang.text(self.src), "ts" | "js")
        {
            return Self::err_at(*name, "this script language is not supported");
        }
        let content = self.raw_text("script")?;
        if self.c.script.is_some() {
            return Self::err_at(content, "a component can have only one <script setup>");
        }
        let (t, c) = self.marks();
        let program = parse_program(&mut self.c.js, self.src, content, self.c.ts)
            .map_err(|e| Diagnostic::error("js_parse_error", e.message, e.span))?;
        self.js_region(content.lo, content.hi, t, c);
        self.close_tag("script")?;
        self.c.script = Some(Script {
            span: Span::new(lo as u32, self.pos as u32),
            attrs,
            content,
            program,
        });
        Ok(())
    }

    fn style(&mut self) -> R<()> {
        let lo = self.pos;
        let attrs = self.open_tag_attrs()?;
        if let Some((name, _)) = attrs
            .iter()
            .find(|(n, _)| matches!(n.text(self.src), "lang" | "src" | "module"))
        {
            return Self::err_at(*name, "this style attribute is not supported yet");
        }
        let scoped = attrs.iter().any(|(n, _)| n.text(self.src) == "scoped");
        let content = self.raw_text("style")?;
        self.c.tokens.push(Tk::Css, content);
        self.close_tag("style")?;
        let sheet = rsv_css::parse(self.src, content)
            .map_err(|e| Diagnostic::error("css_parse_error", e.message, e.span))?;
        self.c.styles.push(Style {
            span: Span::new(lo as u32, self.pos as u32),
            attrs,
            content,
            sheet,
            scoped,
        });
        Ok(())
    }

    // ---- the template ----------------------------------------------------------------------

    /// Nodes up to the end tag of `parent` (left unconsumed).
    fn fragment(&mut self, parent: Option<&str>) -> R<Range> {
        let mut items = Vec::new();
        loop {
            let rest = self.rest();
            if rest.is_empty() {
                return match parent {
                    Some(name) => self.err(format!("`<{name}>` was left open")),
                    None => Ok(Self::range_of(&mut self.c.kids, items)),
                };
            }
            if rest.starts_with("</") {
                return Ok(Self::range_of(&mut self.c.kids, items));
            }
            if rest.starts_with("<!--") {
                items.push(self.comment()?);
            } else if rest.starts_with('<') {
                items.push(self.element()?);
            } else if rest.starts_with("{{") {
                items.push(self.interpolation()?);
            } else {
                let lo = self.pos;
                let len = match (rest.find('<'), rest.find("{{")) {
                    (Some(a), Some(b)) => a.min(b),
                    (a, b) => a.or(b).unwrap_or(rest.len()),
                };
                self.pos += len;
                self.tok(Tk::Text, lo);
                items.push(self.push(TNode::Text {
                    span: Span::new(lo as u32, self.pos as u32),
                }));
            }
        }
    }

    fn comment(&mut self) -> R<TId> {
        let lo = self.pos;
        let Some(end) = self.rest().find("-->") else {
            return self.err("unterminated comment");
        };
        let data = Span::new((lo + 4) as u32, (lo + end) as u32);
        self.eat_tok(Tk::HtmlComment, end + 3);
        Ok(self.push(TNode::Comment {
            span: Span::new(lo as u32, self.pos as u32),
            data,
        }))
    }

    fn interpolation(&mut self) -> R<TId> {
        let lo = self.pos;
        let Some(end) = self.rest().find("}}") else {
            return self.err("interpolation end sign was not found");
        };
        self.eat_tok(Tk::InterpolationOpen, 2);
        let inner = Span::new(self.pos as u32, (lo + end) as u32);
        let expr = self.expression(inner)?;
        self.pos = inner.hi as usize;
        self.eat_tok(Tk::InterpolationClose, 2);
        Ok(self.push(TNode::Interpolation {
            expr,
            span: Span::new(lo as u32, self.pos as u32),
        }))
    }

    fn element(&mut self) -> R<TId> {
        let lo = self.pos;
        self.eat_tok(Tk::TagOpen, 1);
        let name_lo = self.pos;
        while self
            .peek()
            .is_some_and(|c| c.is_ascii_alphanumeric() || c == b'-')
        {
            self.pos += 1;
        }
        let name = Span::new(name_lo as u32, self.pos as u32);
        if name.is_empty() {
            return self.err("expected a tag name");
        }
        self.tok(Tk::TagName, name_lo);
        let name_text = name.text(self.src);
        if name_text == "template"
            || name_text == "slot"
            || name_text.contains('-')
            || name_text.starts_with(|c: char| c.is_ascii_uppercase())
        {
            return Self::err_at(
                name,
                "components and template elements are not supported yet",
            );
        }
        let (attrs, self_closing) = self.attributes()?;
        let start_tag = Span::new(lo as u32, self.pos as u32);
        let children = if self_closing || is_void(name_text) {
            Range {
                start: self.c.kids.len() as u32,
                len: 0,
            }
        } else {
            let children = self.fragment(Some(name_text))?;
            self.close_tag(name_text)?;
            children
        };
        Ok(self.push(TNode::Element {
            name,
            attrs,
            children,
            start_tag,
            self_closing,
            span: Span::new(lo as u32, self.pos as u32),
        }))
    }

    /// Attributes through the `>` or `/>`.
    fn attributes(&mut self) -> R<(Range, bool)> {
        let mut list = Vec::new();
        let self_closing = loop {
            self.skip_ws();
            match self.peek() {
                None => return self.err("unterminated start tag"),
                Some(b'>') => {
                    self.eat_tok(Tk::TagEnd, 1);
                    break false;
                }
                Some(b'/') if self.rest().starts_with("/>") => {
                    self.eat_tok(Tk::SelfClose, 2);
                    break true;
                }
                Some(_) => list.push(self.attribute()?),
            }
        };
        let start = self.c.attrs.len() as u32;
        let len = list.len() as u32;
        self.c.attrs.extend(list);
        Ok((Range { start, len }, self_closing))
    }

    fn attribute(&mut self) -> R<Attr> {
        let lo = self.pos;
        while self
            .peek()
            .is_some_and(|c| !c.is_ascii_whitespace() && !matches!(c, b'=' | b'>' | b'"' | b'\''))
            && !self.rest().starts_with("/>")
        {
            self.pos += 1;
        }
        let name = Span::new(lo as u32, self.pos as u32);
        if name.is_empty() {
            return self.err("expected an attribute name");
        }
        self.tok(Tk::AttrName, lo);
        let directive = self.directive_name(name)?;
        self.skip_ws();
        let (value, quoted) = if self.peek() == Some(b'=') {
            self.eat_tok(Tk::Eq, 1);
            self.skip_ws();
            match self.peek() {
                Some(q @ (b'"' | b'\'')) => {
                    self.eat_tok(Tk::Quote, 1);
                    let v = self.pos;
                    let Some(len) = self.rest().find(q as char) else {
                        return self.err("unterminated attribute value");
                    };
                    self.pos += len;
                    (Some(Span::new(v as u32, self.pos as u32)), true)
                }
                Some(_) => {
                    let v = self.pos;
                    while self
                        .peek()
                        .is_some_and(|c| !c.is_ascii_whitespace() && c != b'>')
                    {
                        self.pos += 1;
                    }
                    (Some(Span::new(v as u32, self.pos as u32)), false)
                }
                None => return self.err("expected an attribute value"),
            }
        } else {
            (None, false)
        };
        let kind = match directive {
            None => {
                if let Some(v) = value {
                    self.pos = v.lo as usize;
                    self.eat_tok(Tk::AttrText, v.len() as usize);
                }
                AttrKind::Static
            }
            Some((dir, arg)) => {
                let exp = match (dir, value) {
                    (DirName::Else, None) => DirExp::None,
                    (DirName::Else, Some(v)) => {
                        return Self::err_at(v, "v-else has no expression");
                    }
                    (_, None) => return Self::err_at(name, "a directive needs an expression"),
                    (DirName::For, Some(v)) => DirExp::For(self.for_expression(v)?),
                    (_, Some(v)) => DirExp::Expr(self.expression(v)?),
                };
                AttrKind::Directive(Directive {
                    name: dir,
                    arg,
                    exp,
                })
            }
        };
        if let Some(v) = value {
            self.pos = v.hi as usize;
            if quoted {
                self.eat_tok(Tk::Quote, 1);
            }
        }
        Ok(Attr {
            name,
            kind,
            value,
            quoted,
            span: Span::new(lo as u32, self.pos as u32),
        })
    }

    /// `:arg`, `@arg` and `v-name:arg`; `None` for a static attribute.
    fn directive_name(&self, name: Span) -> R<Option<(DirName, Option<Span>)>> {
        let text = name.text(self.src);
        let (dir, arg_lo) = match text.as_bytes()[0] {
            b':' => (DirName::Bind, 1),
            b'@' => (DirName::On, 1),
            b'#' | b'.' => return Self::err_at(name, "this directive is not supported yet"),
            _ if text.starts_with("v-") => {
                let end = text.find(':').unwrap_or(text.len());
                let dir = match &text[2..end] {
                    "bind" => DirName::Bind,
                    "on" => DirName::On,
                    "if" => DirName::If,
                    "else-if" => DirName::ElseIf,
                    "else" => DirName::Else,
                    "for" => DirName::For,
                    _ => return Self::err_at(name, "this directive is not supported yet"),
                };
                (dir, (end + 1).min(text.len()))
            }
            _ => return Ok(None),
        };
        if text[arg_lo..].contains(['.', '[']) {
            return Self::err_at(
                name,
                "directive modifiers and dynamic arguments are not supported yet",
            );
        }
        let arg = (arg_lo < text.len()).then(|| Span::new(name.lo + arg_lo as u32, name.hi));
        if matches!(dir, DirName::Bind | DirName::On) && arg.is_none() {
            return Self::err_at(name, "an object v-bind or v-on is not supported yet");
        }
        Ok(Some((dir, arg)))
    }

    /// compiler-core's `parseForExpression`: `forAliasRE` splits the value at ` in ` / ` of `, the
    /// aliases lose their parentheses, and each part is parsed on its own.
    fn for_expression(&mut self, v: Span) -> R<ForExp> {
        let text = v.text(self.src);
        let Some((alias_end, kw_lo)) = split_for(text) else {
            return Self::err_at(v, "v-for has invalid expression");
        };
        let at = |i: usize| v.lo + i as u32;
        let alias = &text[..alias_end];
        let trimmed_lo = alias.len() - alias.trim_start().len();
        let trimmed = alias.trim();
        let (inner_lo, inner_hi) = if trimmed.starts_with('(') && trimmed.ends_with(')') {
            (trimmed_lo + 1, trimmed_lo + trimmed.len() - 1)
        } else {
            (trimmed_lo, trimmed_lo + trimmed.len())
        };
        self.pos = v.lo as usize;
        self.skip_to(at(trimmed_lo), Tk::Whitespace);
        if inner_lo > trimmed_lo {
            self.eat_tok(Tk::ForParen, 1);
        }
        let (t, c) = self.marks();
        let params = parse_params(
            &mut self.c.js,
            self.src,
            Span::new(at(inner_lo), at(inner_hi)),
            self.c.ts,
        )
        .map_err(|e| Diagnostic::error("js_parse_error", e.message, e.span))?;
        self.js_region(at(inner_lo), at(inner_hi), t, c);
        self.pos = at(inner_hi) as usize;
        if inner_lo > trimmed_lo {
            self.eat_tok(Tk::ForParen, 1);
        }
        self.skip_to(at(kw_lo), Tk::Whitespace);
        self.eat_tok(Tk::ForKeyword, 2);
        let source = self.expression(Span::new(at(kw_lo + 2), v.hi))?;
        if params.is_empty() {
            return Self::err_at(v, "v-for has no alias");
        }
        Ok(ForExp { params, source })
    }

    fn skip_to(&mut self, to: u32, kind: Tk) {
        let lo = self.pos;
        self.pos = to as usize;
        self.tok(kind, lo);
    }
}

/// `/([\s\S]*?)\s+(?:in|of)\s+(\S[\s\S]*)/`: (end of the alias, start of the keyword).
fn split_for(text: &str) -> Option<(usize, usize)> {
    let b = text.as_bytes();
    for kw in 1..b.len() {
        let is_kw = (text[kw..].starts_with("in") || text[kw..].starts_with("of"))
            && b[kw - 1].is_ascii_whitespace()
            && b.get(kw + 2).is_some_and(u8::is_ascii_whitespace);
        if !is_kw {
            continue;
        }
        let mut alias_end = kw - 1;
        while alias_end > 0 && b[alias_end - 1].is_ascii_whitespace() {
            alias_end -= 1;
        }
        let mut source = kw + 2;
        while b.get(source).is_some_and(u8::is_ascii_whitespace) {
            source += 1;
        }
        if source < b.len() {
            return Some((alias_end, kw));
        }
    }
    None
}
