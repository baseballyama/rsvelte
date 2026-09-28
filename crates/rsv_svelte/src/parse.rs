//! The template parser: markup, `{expression}` tags, `{#if}` blocks, one instance `<script>` and
//! one `<style>`. Expressions are parsed by rsv_js in place, and the parser, not a brace scan,
//! decides where each one ends.

use crate::ast::*;
use rsv_js::parser::{parse_expression_prefix, parse_program};
use rsv_js::{Ast, NodeId};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::source::Span;

type R<T> = Result<T, Diagnostic>;

const VOID_ELEMENTS: &[&str] = &[
    "area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link",
    "meta", "param", "source", "track", "wbr",
];

pub fn is_void(name: &str) -> bool {
    VOID_ELEMENTS.iter().any(|v| v.eq_ignore_ascii_case(name))
}

pub fn parse(src: &str) -> R<Component> {
    let mut p = P {
        src,
        b: src.as_bytes(),
        pos: 0,
        c: Component {
            js: Ast::new(),
            nodes: Vec::new(),
            kids: Vec::new(),
            attrs: Vec::new(),
            parts: Vec::new(),
            root: Range::default(),
            instance: None,
            program: NodeId::NONE,
            style: None,
            template_exprs: Vec::new(),
        },
        ts: false,
    };
    // The script's language decides how template expressions parse, so read it first.
    p.ts = script_is_ts(src);
    let root = p.fragment(End::Eof)?;
    p.c.root = root;
    p.c.program = match &p.c.instance {
        Some(s) => s.program,
        None => p.c.js.program(&[], Span::new(0, 0)),
    };
    Ok(p.c)
}

/// What closes the fragment being read.
#[derive(Clone, Copy)]
enum End<'a> {
    Eof,
    Tag(&'a str),
    Block,
}

struct P<'a> {
    src: &'a str,
    b: &'a [u8],
    pos: usize,
    c: Component,
    ts: bool,
}

/// Ports upstream's `regex_lang_attribute` (1-parse/index.js): the first `<script …lang=…>` outside
/// a comment decides, and only the exact value `ts` means TypeScript.
fn script_is_ts(src: &str) -> bool {
    let mut from = 0;
    loop {
        let rest = &src[from..];
        let Some(i) = rest.find(['<']) else {
            return false;
        };
        let at = &rest[i..];
        if let Some(body) = at.strip_prefix("<!--") {
            match body.find("-->") {
                Some(end) => from += i + 4 + end + 3,
                None => return false,
            }
            continue;
        }
        from += i + 1;
        let Some(after) = at.strip_prefix("<script") else {
            continue;
        };
        if !after.starts_with(|c: char| c.is_ascii_whitespace()) {
            continue;
        }
        let tag = &after[..after.find('>').unwrap_or(after.len())];
        // `[^>]*` is greedy, so the regex binds to the last `lang=` in the tag.
        let Some(l) = tag.rfind("lang=") else {
            continue;
        };
        let value = tag[l + 5..].trim_start_matches(['"', '\'']);
        let end = value.find(['"', '\'', ' ', '>']).unwrap_or(value.len());
        if end == 0 {
            continue;
        }
        return &value[..end] == "ts";
    }
}

impl<'a> P<'a> {
    fn err<X>(&self, message: impl Into<String>) -> R<X> {
        self.err_at(Span::new(self.pos as u32, self.pos as u32), message)
    }

    fn err_at<X>(&self, span: Span, message: impl Into<String>) -> R<X> {
        Err(Diagnostic::error("parse_error", message.into(), span))
    }

    fn rest(&self) -> &'a str {
        &self.src[self.pos..]
    }

    fn peek(&self) -> Option<u8> {
        self.b.get(self.pos).copied()
    }

    fn skip_ws(&mut self) {
        while self.peek().is_some_and(|c| c.is_ascii_whitespace()) {
            self.pos += 1;
        }
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

    fn fragment(&mut self, end: End) -> R<Range> {
        let mut items: Vec<TId> = Vec::new();
        loop {
            let rest = self.rest();
            if rest.is_empty() {
                return match end {
                    End::Eof => Ok(Self::range_of(&mut self.c.kids, items)),
                    End::Tag(name) => self.err(format!("`<{name}>` was left open")),
                    End::Block => self.err("block was left open"),
                };
            }
            if rest.starts_with("</") {
                let End::Tag(_) = end else {
                    return self.err("unexpected closing tag");
                };
                return Ok(Self::range_of(&mut self.c.kids, items));
            }
            if rest.starts_with("{:") || rest.starts_with("{/") {
                let End::Block = end else {
                    return self.err("unexpected block continuation");
                };
                return Ok(Self::range_of(&mut self.c.kids, items));
            }
            if rest.starts_with("<!--") {
                items.push(self.comment()?);
            } else if rest.starts_with("<script") && matches!(end, End::Eof) {
                self.script()?;
            } else if rest.starts_with("<style") && matches!(end, End::Eof) {
                self.style()?;
            } else if rest.starts_with('<') {
                items.push(self.element()?);
            } else if rest.starts_with("{#") {
                items.push(self.block()?);
            } else if rest.starts_with('{') {
                let lo = self.pos;
                let expr = self.expression_tag()?;
                let span = Span::new(lo as u32, self.pos as u32);
                items.push(self.push(TNode::Expr { expr, span }));
            } else {
                let lo = self.pos;
                let len = rest.find(['<', '{']).unwrap_or(rest.len());
                self.pos += len;
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
        self.pos += end + 3;
        Ok(self.push(TNode::Comment {
            span: Span::new(lo as u32, self.pos as u32),
            data,
        }))
    }

    /// `{expression}` starting at `{`; returns with `pos` after the `}`.
    fn expression_tag(&mut self) -> R<NodeId> {
        self.pos += 1;
        let expr = self.expression()?;
        self.skip_ws();
        if self.peek() != Some(b'}') {
            return self.err("expected `}`");
        }
        self.pos += 1;
        Ok(expr)
    }

    fn expression(&mut self) -> R<NodeId> {
        let (expr, next) = parse_expression_prefix(
            &mut self.c.js,
            self.src,
            self.pos as u32,
            self.src.len() as u32,
            self.ts,
        )
        .map_err(|e| Diagnostic::error("js_parse_error", e.message, e.span))?;
        self.pos = next as usize;
        self.c.template_exprs.push(expr);
        Ok(expr)
    }

    fn tag_name(&mut self) -> Span {
        let lo = self.pos;
        while self
            .peek()
            .is_some_and(|c| c.is_ascii_alphanumeric() || matches!(c, b'-' | b':' | b'.'))
        {
            self.pos += 1;
        }
        Span::new(lo as u32, self.pos as u32)
    }

    fn element(&mut self) -> R<TId> {
        let lo = self.pos;
        self.pos += 1;
        let name = self.tag_name();
        if name.is_empty() {
            return self.err("expected a tag name");
        }
        let (attrs, self_closing) = self.attributes()?;
        let start_tag = Span::new(lo as u32, self.pos as u32);
        let name_text = name.text(self.src);
        let children = if self_closing || is_void(name_text) {
            Range {
                start: self.c.kids.len() as u32,
                len: 0,
            }
        } else {
            let children = self.fragment(End::Tag(name_text))?;
            let close = format!("</{name_text}");
            if !self.rest().starts_with(&close) {
                return self.err(format!("expected `</{name_text}>`"));
            }
            self.pos += close.len();
            self.skip_ws();
            if self.peek() != Some(b'>') {
                return self.err("expected `>`");
            }
            self.pos += 1;
            children
        };
        let span = Span::new(lo as u32, self.pos as u32);
        Ok(self.push(TNode::Element {
            name,
            attrs,
            children,
            start_tag,
            span,
        }))
    }

    /// Reads attributes up to and including `>` or `/>`.
    fn attributes(&mut self) -> R<(Range, bool)> {
        let mut list = Vec::new();
        loop {
            self.skip_ws();
            match self.peek() {
                None => return self.err("unterminated start tag"),
                Some(b'>') => {
                    self.pos += 1;
                    break;
                }
                Some(b'/') if self.rest().starts_with("/>") => {
                    self.pos += 2;
                    return Ok((self.attr_range(list), true));
                }
                Some(b'{') => {
                    let lo = self.pos;
                    if self.rest()[1..].trim_start().starts_with("...") {
                        return self.err("spread attributes are not supported yet");
                    }
                    let expr = self.expression_tag()?;
                    let span = Span::new(lo as u32, self.pos as u32);
                    let name = match self.c.js.kind(expr) {
                        rsv_js::Kind::Ident(_) => {
                            self.c.js.loc(expr).span().expect("parsed from source")
                        }
                        _ => {
                            return self
                                .err_at(span, "expected an identifier in a shorthand attribute");
                        }
                    };
                    let parts = self.part_range(vec![Part::Expr { expr, span }]);
                    list.push(Attr {
                        name,
                        value: AttrValue::Parts(parts),
                        span,
                        quoted: false,
                    });
                }
                Some(_) => list.push(self.attribute()?),
            }
        }
        Ok((self.attr_range(list), false))
    }

    fn attr_range(&mut self, list: Vec<Attr>) -> Range {
        let start = self.c.attrs.len() as u32;
        let len = list.len() as u32;
        self.c.attrs.extend(list);
        Range { start, len }
    }

    fn part_range(&mut self, list: Vec<Part>) -> Range {
        let start = self.c.parts.len() as u32;
        let len = list.len() as u32;
        self.c.parts.extend(list);
        Range { start, len }
    }

    fn attribute(&mut self) -> R<Attr> {
        let lo = self.pos;
        while self.peek().is_some_and(|c| {
            !c.is_ascii_whitespace() && !matches!(c, b'=' | b'>' | b'/' | b'"' | b'\'' | b'{')
        }) {
            self.pos += 1;
        }
        let name = Span::new(lo as u32, self.pos as u32);
        if name.is_empty() {
            return self.err("expected an attribute name");
        }
        if name.text(self.src).contains(':') {
            return self.err_at(name, "directives are not supported yet");
        }
        self.skip_ws();
        if self.peek() != Some(b'=') {
            return Ok(Attr {
                name,
                value: AttrValue::True,
                span: name,
                quoted: false,
            });
        }
        self.pos += 1;
        self.skip_ws();
        let quoted = matches!(self.peek(), Some(b'"' | b'\''));
        let parts = match self.peek() {
            Some(q @ (b'"' | b'\'')) => {
                self.pos += 1;
                let mut parts = self.attribute_chunks(Some(q))?;
                if parts.is_empty() {
                    parts.push(Part::Text(Span::new(self.pos as u32, self.pos as u32)));
                }
                self.pos += 1;
                parts
            }
            Some(b'{') => {
                let s = self.pos;
                let expr = self.expression_tag()?;
                vec![Part::Expr {
                    expr,
                    span: Span::new(s as u32, self.pos as u32),
                }]
            }
            Some(_) => self.attribute_chunks(None)?,
            None => return self.err("expected an attribute value"),
        };
        let parts = self.part_range(parts);
        Ok(Attr {
            name,
            value: AttrValue::Parts(parts),
            span: Span::new(lo as u32, self.pos as u32),
            quoted,
        })
    }

    /// Text and `{…}` chunks up to the closing quote (left unconsumed) or, unquoted, to whitespace/`>`.
    fn attribute_chunks(&mut self, quote: Option<u8>) -> R<Vec<Part>> {
        let mut parts = Vec::new();
        let mut text_lo = self.pos;
        loop {
            let c = self.peek();
            let at_end = match (quote, c) {
                (_, None) => return self.err("unterminated attribute value"),
                (Some(q), Some(c)) => c == q,
                (None, Some(c)) => {
                    c.is_ascii_whitespace() || c == b'>' || self.rest().starts_with("/>")
                }
            };
            if at_end || c == Some(b'{') {
                if self.pos > text_lo {
                    parts.push(Part::Text(Span::new(text_lo as u32, self.pos as u32)));
                }
                if at_end {
                    return Ok(parts);
                }
                let s = self.pos;
                let expr = self.expression_tag()?;
                parts.push(Part::Expr {
                    expr,
                    span: Span::new(s as u32, self.pos as u32),
                });
                text_lo = self.pos;
            } else {
                self.pos += 1;
            }
        }
    }

    fn block(&mut self) -> R<TId> {
        let lo = self.pos;
        if !self.rest().starts_with("{#if") {
            return self.err("only `{#if}` blocks are supported yet");
        }
        self.pos += 4;
        self.if_block(lo, false)
    }

    /// After `{#if` or `{:else if`: the test, the branches, and the closing `{/if}`.
    fn if_block(&mut self, lo: usize, elseif: bool) -> R<TId> {
        let test = self.expression()?;
        self.skip_ws();
        if self.peek() != Some(b'}') {
            return self.err("expected `}`");
        }
        self.pos += 1;
        let cons = self.fragment(End::Block)?;
        let alt = if self.rest().starts_with("{:else") {
            self.pos += "{:else".len();
            self.skip_ws();
            if self.rest().starts_with("if")
                && !self
                    .b
                    .get(self.pos + 2)
                    .is_some_and(|c| c.is_ascii_alphanumeric())
            {
                let inner_lo = self.pos;
                self.pos += 2;
                let inner = self.if_block(inner_lo, true)?;
                let start = self.c.kids.len() as u32;
                self.c.kids.push(inner);
                let span = Span::new(lo as u32, self.pos as u32);
                return Ok(self.push(TNode::If {
                    test,
                    cons,
                    alt: Some(Range { start, len: 1 }),
                    elseif,
                    span,
                }));
            }
            if self.peek() != Some(b'}') {
                return self.err("expected `}` after `{:else`");
            }
            self.pos += 1;
            Some(self.fragment(End::Block)?)
        } else {
            None
        };
        if !self.rest().starts_with("{/if}") {
            return self.err("expected `{/if}`");
        }
        self.pos += "{/if}".len();
        let span = Span::new(lo as u32, self.pos as u32);
        Ok(self.push(TNode::If {
            test,
            cons,
            alt,
            elseif,
            span,
        }))
    }

    /// `(name, quoted value)` pairs of a `<script>`/`<style>` start tag.
    fn open_tag_attrs(&mut self) -> R<Vec<(Span, Option<Span>)>> {
        self.pos += 1;
        let _name = self.tag_name();
        let mut attrs = Vec::new();
        loop {
            self.skip_ws();
            match self.peek() {
                None => return self.err("unterminated start tag"),
                Some(b'>') => {
                    self.pos += 1;
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
                    let mut value = None;
                    if self.peek() == Some(b'=') {
                        self.pos += 1;
                        if let Some(q @ (b'"' | b'\'')) = self.peek() {
                            let v = self.pos + 1;
                            let Some(len) = self.src[v..].find(q as char) else {
                                return self.err("unterminated attribute value");
                            };
                            value = Some(Span::new(v as u32, (v + len) as u32));
                            self.pos = v + len + 1;
                        } else {
                            return self.err("expected a quoted value");
                        }
                    }
                    attrs.push((name, value));
                }
            }
        }
    }

    /// Raw text up to `</tag>` (HTML raw-text elements end at the first closing tag).
    fn raw_text(&mut self, tag: &str) -> R<(Span, usize)> {
        let close = format!("</{tag}>");
        let lo = self.pos;
        let Some(len) = self.rest().find(&close) else {
            return self.err(format!("`<{tag}>` was left open"));
        };
        self.pos += len + close.len();
        Ok((Span::new(lo as u32, (lo + len) as u32), self.pos))
    }

    fn script(&mut self) -> R<()> {
        let lo = self.pos;
        let attrs = self.open_tag_attrs()?;
        for (name, value) in &attrs {
            if name.text(self.src) == "module"
                || value.is_some_and(|v| v.text(self.src) == "module")
            {
                return self.err_at(*name, "module scripts are not supported yet");
            }
        }
        let ts = self.ts;
        let (content, _) = self.raw_text("script")?;
        if self.c.instance.is_some() {
            return self.err_at(content, "a component can have only one instance script");
        }
        let program = parse_program(&mut self.c.js, self.src, content, ts)
            .map_err(|e| Diagnostic::error("js_parse_error", e.message, e.span))?;
        let span = Span::new(lo as u32, self.pos as u32);
        self.c.instance = Some(Script {
            span,
            content,
            program,
            ts,
        });
        Ok(())
    }

    fn style(&mut self) -> R<()> {
        let lo = self.pos;
        self.open_tag_attrs()?;
        let (content, _) = self.raw_text("style")?;
        if self.c.style.is_some() {
            return self.err_at(content, "a component can have only one style");
        }
        let sheet = rsv_css::parse(self.src, content)
            .map_err(|e| Diagnostic::error("css_parse_error", e.message, e.span))?;
        self.c.style = Some(Style {
            span: Span::new(lo as u32, self.pos as u32),
            sheet,
        });
        Ok(())
    }
}
