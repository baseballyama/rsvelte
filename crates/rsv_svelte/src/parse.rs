//! The template parser: markup, `{expression}` tags, `{#if}` and `{#each}` blocks, `bind:`
//! directives, one instance `<script>` and one `<style>`.
//!
//! Expressions are parsed by `rsv_js` in place, and the parser, not a brace scan,
//! decides where each one ends.

use rsv_js::ast::TsKind;
use rsv_js::lexer::T;
use rsv_js::parser::{parse_expression, parse_expression_prefix, parse_params, parse_program};
use rsv_js::{Ast, NodeId};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::pool;
use rsv_kernel::source::Span;
use rsv_kernel::token::Tokens;

use crate::ast::{
    Attr, AttrKind, AttrValue, Component, Part, Range, Script, Style, TId, TNode, Tk,
};

type R<T> = Result<T, Diagnostic>;

const VOID_ELEMENTS: &[&str] = &[
    "area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link",
    "meta", "param", "source", "track", "wbr",
];

#[must_use]
pub fn is_void(name: &str) -> bool {
    VOID_ELEMENTS.iter().any(|v| v.eq_ignore_ascii_case(name))
}

/// # Errors
///
/// A `parse_error` [`Diagnostic`] at the first syntax error in the markup, the script or the
/// style sheet, or at syntax this parser does not support.
pub fn parse(src: &str) -> R<Component> {
    let mut p = P {
        src,
        b: src.as_bytes(),
        pos: 0,
        c: Component {
            js: Ast::new(),
            nodes: pool::take_keyed::<Component, _>(),
            kids: pool::take_keyed::<Component, _>(),
            attrs: pool::take_keyed::<Component, _>(),
            parts: pool::take_keyed::<Component, _>(),
            root: Range::default(),
            instance: None,
            program: NodeId::NONE,
            style: None,
            template_exprs: pool::take_keyed::<Component, _>(),
            // The corpus averages a token per 4.8 bytes; a quarter leaves most tables unresized.
            tokens: Tokens::with_capacity(src.len() / 4),
        },
        ts: false,
        open: pool::take_keyed::<P<'static>, _>(),
    };
    // The script's language decides how template expressions parse, so read it first.
    p.ts = script_is_ts(src);
    let root = p.fragment(End::Eof);
    pool::give_keyed::<P<'static>, _>(std::mem::take(&mut p.open));
    p.c.root = root?;
    p.c.program = match &p.c.instance {
        Some(s) => s.program,
        None => p.c.js.program(&[], Span::new(0, 0)),
    };
    Ok(p.c)
}

fn js_error(e: rsv_js::parser::ParseError) -> Diagnostic {
    Diagnostic::error("js_parse_error", e.message, e.span)
}

/// The length of the identifier `s` starts with (`$` and `_` included), 0 if none.
fn identifier_len(s: &str) -> usize {
    let mut chars = s.char_indices();
    match chars.next() {
        Some((_, c)) if c == '$' || c == '_' || unicode_id_start::is_id_start(c) => {}
        _ => return 0,
    }
    chars
        .find(|&(_, c)| !(c == '$' || unicode_id_start::is_id_continue(c)))
        .map_or(s.len(), |(i, _)| i)
}

/// The length of the bracketed text `s` starts with, through its matching bracket; strings and
/// template literals are skipped. Upstream `match_bracket`.
const fn match_bracket(s: &str) -> Option<usize> {
    let b = s.as_bytes();
    let mut depth = 0usize;
    let mut i = 0;
    while i < b.len() {
        match b[i] {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i + 1);
                }
            }
            q @ (b'"' | b'\'' | b'`') => {
                i += 1;
                while i < b.len() && b[i] != q {
                    if b[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
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
    /// The children of the fragments being read, innermost last: a fragment's go to
    /// [`Component::kids`] in one run when it closes.
    open: Vec<TId>,
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

    fn skip_ws(&mut self) {
        let lo = self.pos;
        while self.peek().is_some_and(|c| c.is_ascii_whitespace()) {
            self.pos += 1;
        }
        self.tok(Tk::Whitespace, lo);
    }

    /// Records `lo..pos` as one token.
    fn tok(&mut self, kind: Tk, lo: usize) {
        self.c
            .tokens
            .push(kind, Span::new(lo as u32, self.pos as u32));
    }

    /// Advances over `n` bytes as one token.
    fn eat_tok(&mut self, kind: Tk, n: usize) {
        let lo = self.pos;
        self.pos += n;
        self.tok(kind, lo);
    }

    /// Copies what the JavaScript parser consumed in `lo..hi` (its tokens and comments since the
    /// counts given) into the component's tokens, with the whitespace between them.
    fn js_region(&mut self, lo: u32, hi: u32, tokens_from: usize, comments_from: usize) {
        let mut at = lo;
        for (kind, span) in self.c.js.recorded_since(tokens_from, comments_from) {
            self.c.tokens.push(Tk::Whitespace, Span::new(at, span.lo));
            self.c.tokens.push(kind.map_or(Tk::JsComment, Tk::Js), span);
            at = span.hi;
        }
        self.c.tokens.push(Tk::Whitespace, Span::new(at, hi));
    }

    fn push(&mut self, n: TNode) -> TId {
        self.c.nodes.push(n);
        (self.c.nodes.len() - 1) as TId
    }

    /// Moves the children gathered since `open` to [`Component::kids`].
    fn close(&mut self, open: usize) -> Range {
        let start = self.c.kids.len() as u32;
        self.c.kids.extend_from_slice(&self.open[open..]);
        self.open.truncate(open);
        Range {
            start,
            len: self.c.kids.len() as u32 - start,
        }
    }

    fn fragment(&mut self, end: End<'_>) -> R<Range> {
        let open = self.open.len();
        loop {
            let rest = self.rest();
            if rest.is_empty() {
                return match end {
                    End::Eof => Ok(self.close(open)),
                    End::Tag(name) => self.err(format!("`<{name}>` was left open")),
                    End::Block => self.err("block was left open"),
                };
            }
            if rest.starts_with("</") {
                let End::Tag(_) = end else {
                    return self.err("unexpected closing tag");
                };
                return Ok(self.close(open));
            }
            if rest.starts_with("{:") || rest.starts_with("{/") {
                let End::Block = end else {
                    return self.err("unexpected block continuation");
                };
                return Ok(self.close(open));
            }
            let child = if rest.starts_with("<!--") {
                self.comment()?
            } else if rest.starts_with("<script") && matches!(end, End::Eof) {
                self.script()?;
                continue;
            } else if rest.starts_with("<style") && matches!(end, End::Eof) {
                self.style()?;
                continue;
            } else if rest.starts_with('<') {
                self.element()?
            } else if rest.starts_with("{#") {
                self.block()?
            } else if rest.starts_with('{') {
                let lo = self.pos;
                let expr = self.expression_tag()?;
                let span = Span::new(lo as u32, self.pos as u32);
                self.push(TNode::Expr { expr, span })
            } else {
                let lo = self.pos;
                let len = rest.find(['<', '{']).unwrap_or(rest.len());
                self.pos += len;
                self.tok(Tk::Text, lo);
                self.push(TNode::Text {
                    span: Span::new(lo as u32, self.pos as u32),
                })
            };
            self.open.push(child);
        }
    }

    fn comment(&mut self) -> R<TId> {
        let lo = self.pos;
        let Some(end) = self.rest().find("-->") else {
            return self.err("unterminated comment");
        };
        let data = Span::new((lo + 4) as u32, (lo + end) as u32);
        self.pos += end + 3;
        self.tok(Tk::HtmlComment, lo);
        Ok(self.push(TNode::Comment {
            span: Span::new(lo as u32, self.pos as u32),
            data,
        }))
    }

    /// `{expression}` starting at `{`; returns with `pos` after the `}`.
    fn expression_tag(&mut self) -> R<NodeId> {
        self.eat_tok(Tk::MustacheOpen, 1);
        let expr = self.expression()?;
        self.close_mustache()?;
        Ok(expr)
    }

    fn close_mustache(&mut self) -> R<()> {
        self.skip_ws();
        if self.peek() != Some(b'}') {
            return self.err("expected `}`");
        }
        self.eat_tok(Tk::MustacheClose, 1);
        Ok(())
    }

    fn expression(&mut self) -> R<NodeId> {
        self.expression_until(self.src.len() as u32)
    }

    /// The longest expression from `pos` that ends by `limit`.
    fn expression_until(&mut self, limit: u32) -> R<NodeId> {
        let (tokens, comments) = (self.c.js.tokens.len(), self.c.js.comments.len());
        let lo = self.pos as u32;
        let (expr, next) =
            parse_expression_prefix(&mut self.c.js, self.src, self.pos as u32, limit, self.ts)
                .map_err(js_error)?;
        self.js_region(lo, next, tokens, comments);
        self.pos = next as usize;
        self.c.template_exprs.push(expr);
        Ok(expr)
    }

    /// An identifier or a destructuring pattern, parsed as a parameter: upstream `read_pattern`.
    fn pattern(&mut self) -> R<NodeId> {
        let lo = self.pos;
        let len = match self.peek() {
            Some(b'{' | b'[') => match_bracket(self.rest()).ok_or_else(|| {
                Diagnostic::error(
                    "parse_error",
                    "unterminated pattern",
                    Span::new(lo as u32, lo as u32),
                )
            })?,
            _ => identifier_len(self.rest()),
        };
        if len == 0 {
            return self.err("expected an identifier or a destructuring pattern");
        }
        let span = Span::new(lo as u32, (lo + len) as u32);
        let (tokens, comments) = (self.c.js.tokens.len(), self.c.js.comments.len());
        let params = parse_params(&mut self.c.js, self.src, span, self.ts).map_err(js_error)?;
        let [pattern] = params[..] else {
            return Self::err_at(span, "expected one pattern");
        };
        self.js_region(span.lo, span.hi, tokens, comments);
        self.pos = span.hi as usize;
        Ok(pattern)
    }

    /// An identifier, as a node of the component's [`Ast`].
    fn identifier(&mut self) -> R<NodeId> {
        let lo = self.pos;
        let len = identifier_len(self.rest());
        if len == 0 {
            return self.err("expected an identifier");
        }
        let span = Span::new(lo as u32, (lo + len) as u32);
        let (tokens, comments) = (self.c.js.tokens.len(), self.c.js.comments.len());
        let id = parse_expression(&mut self.c.js, self.src, span, self.ts).map_err(js_error)?;
        self.js_region(span.lo, span.hi, tokens, comments);
        self.pos = span.hi as usize;
        Ok(id)
    }

    /// Whether `word` is next and not the start of a longer identifier.
    fn at_word(&self, word: &str) -> bool {
        self.rest().starts_with(word)
            && !self
                .rest()
                .get(word.len()..)
                .and_then(|r| r.chars().next())
                .is_some_and(|c| c == '$' || unicode_id_start::is_id_continue(c))
    }

    fn tag_name(&mut self) -> Span {
        let lo = self.pos;
        while self
            .peek()
            .is_some_and(|c| c.is_ascii_alphanumeric() || matches!(c, b'-' | b':' | b'.'))
        {
            self.pos += 1;
        }
        self.tok(Tk::TagName, lo);
        Span::new(lo as u32, self.pos as u32)
    }

    fn element(&mut self) -> R<TId> {
        let lo = self.pos;
        self.eat_tok(Tk::TagOpen, 1);
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
            self.eat_tok(Tk::EndTagOpen, 2);
            self.eat_tok(Tk::TagName, name_text.len());
            self.skip_ws();
            if self.peek() != Some(b'>') {
                return self.err("expected `>`");
            }
            self.eat_tok(Tk::TagEnd, 1);
            children
        };
        let span = Span::new(lo as u32, self.pos as u32);
        Ok(self.push(TNode::Element {
            name,
            attrs,
            children,
            start_tag,
            self_closing,
            span,
        }))
    }

    /// Reads attributes up to and including `>` or `/>`.
    fn attributes(&mut self) -> R<(Range, bool)> {
        let start = self.c.attrs.len();
        loop {
            self.skip_ws();
            match self.peek() {
                None => return self.err("unterminated start tag"),
                Some(b'>') => {
                    self.eat_tok(Tk::TagEnd, 1);
                    break;
                }
                Some(b'/') if self.rest().starts_with("/>") => {
                    self.eat_tok(Tk::SelfClose, 2);
                    return Ok((self.attrs_since(start), true));
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
                            return Self::err_at(
                                span,
                                "expected an identifier in a shorthand attribute",
                            );
                        }
                    };
                    let parts = self.c.parts.len();
                    self.c.parts.push(Part::Expr { expr, span });
                    let parts = self.parts_since(parts);
                    self.c.attrs.push(Attr {
                        kind: AttrKind::Attribute,
                        name,
                        value: AttrValue::Parts(parts),
                        span,
                        quoted: false,
                        shorthand: true,
                    });
                }
                Some(_) => {
                    let a = self.attribute()?;
                    self.c.attrs.push(a);
                }
            }
        }
        Ok((self.attrs_since(start), false))
    }

    /// The attributes pushed since there were `start`: an element's are read in one run, since
    /// nothing inside an attribute is an attribute.
    const fn attrs_since(&self, start: usize) -> Range {
        Range {
            start: start as u32,
            len: (self.c.attrs.len() - start) as u32,
        }
    }

    /// The parts pushed since there were `start`: an attribute's are read in one run.
    const fn parts_since(&self, start: usize) -> Range {
        Range {
            start: start as u32,
            len: (self.c.parts.len() - start) as u32,
        }
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
        self.tok(Tk::AttrName, lo);
        if name.text(self.src).starts_with("bind:") {
            return self.bind_directive(lo, name);
        }
        if name.text(self.src).contains(':') {
            return Self::err_at(name, "directives other than `bind:` are not supported yet");
        }
        self.skip_ws();
        if self.peek() != Some(b'=') {
            return Ok(Attr {
                kind: AttrKind::Attribute,
                name,
                value: AttrValue::True,
                span: name,
                quoted: false,
                shorthand: false,
            });
        }
        self.eat_tok(Tk::Eq, 1);
        self.skip_ws();
        let quoted = matches!(self.peek(), Some(b'"' | b'\''));
        let start = self.c.parts.len();
        match self.peek() {
            Some(q @ (b'"' | b'\'')) => {
                self.eat_tok(Tk::Quote, 1);
                self.attribute_chunks(Some(q))?;
                if self.c.parts.len() == start {
                    let at = self.pos as u32;
                    self.c.parts.push(Part::Text(Span::new(at, at)));
                }
                self.eat_tok(Tk::Quote, 1);
            }
            Some(b'{') => {
                let s = self.pos;
                let expr = self.expression_tag()?;
                self.c.parts.push(Part::Expr {
                    expr,
                    span: Span::new(s as u32, self.pos as u32),
                });
            }
            Some(_) => self.attribute_chunks(None)?,
            None => return self.err("expected an attribute value"),
        }
        let parts = self.parts_since(start);
        Ok(Attr {
            kind: AttrKind::Attribute,
            name,
            value: AttrValue::Parts(parts),
            span: Span::new(lo as u32, self.pos as u32),
            quoted,
            shorthand: false,
        })
    }

    /// `bind:name={expression}` or `bind:name`, after the name.
    fn bind_directive(&mut self, lo: usize, name: Span) -> R<Attr> {
        let property = Span::new(name.lo + 5, name.hi);
        if identifier_len(property.text(self.src)) != property.len() as usize {
            return Self::err_at(name, "expected a property name after `bind:`");
        }
        let (at, tokens_at) = (self.pos, self.c.tokens.len());
        self.skip_ws();
        let (expr, span, shorthand) = if self.peek() == Some(b'=') {
            self.eat_tok(Tk::Eq, 1);
            self.skip_ws();
            if self.peek() != Some(b'{') {
                return self.err("expected `{` after `bind:…=`");
            }
            let s = self.pos;
            let expr = self.expression_tag()?;
            (expr, Span::new(s as u32, self.pos as u32), false)
        } else {
            // The whitespace belongs to the start tag, not to the directive.
            self.pos = at;
            self.c.tokens.truncate(tokens_at);
            let (tokens, comments) = (self.c.js.tokens.len(), self.c.js.comments.len());
            let expr =
                parse_expression(&mut self.c.js, self.src, property, self.ts).map_err(js_error)?;
            // The name's token already covers the identifier.
            self.c.js.tokens.truncate(tokens);
            self.c.js.comments.truncate(comments);
            self.c.template_exprs.push(expr);
            (expr, property, true)
        };
        let parts = self.c.parts.len();
        self.c.parts.push(Part::Expr { expr, span });
        Ok(Attr {
            kind: AttrKind::Bind,
            name,
            value: AttrValue::Parts(self.parts_since(parts)),
            span: Span::new(lo as u32, self.pos as u32),
            quoted: false,
            shorthand,
        })
    }

    /// Text and `{…}` chunks up to the closing quote (left unconsumed) or, unquoted, to
    /// whitespace/`>`.
    fn attribute_chunks(&mut self, quote: Option<u8>) -> R<()> {
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
                    let text = Part::Text(Span::new(text_lo as u32, self.pos as u32));
                    self.c.parts.push(text);
                    self.tok(Tk::AttrText, text_lo);
                }
                if at_end {
                    return Ok(());
                }
                let s = self.pos;
                let expr = self.expression_tag()?;
                self.c.parts.push(Part::Expr {
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
        self.pos += 2;
        let (is_if, is_each) = (self.at_word("if"), self.at_word("each"));
        self.pos = lo;
        if is_if {
            self.eat_tok(Tk::BlockOpen, 4);
            return self.if_block(lo, false);
        }
        if is_each {
            self.eat_tok(Tk::BlockOpen, 6);
            return self.each_block(lo);
        }
        self.err("only `{#if}` and `{#each}` blocks are supported yet")
    }

    /// After `{#each`: upstream `open` in phases/1-parse/state/tag.js, then the body, the
    /// `{:else}` fallback and `{/each}`.
    fn each_block(&mut self, lo: usize) -> R<TId> {
        if !self.peek().is_some_and(|c| c.is_ascii_whitespace()) {
            return self.err("expected whitespace");
        }
        self.skip_ws();
        let expr = self.each_expression()?;
        self.skip_ws();
        if !self.at_word("as") {
            return self.err("`{#each}` without `as` is not supported yet");
        }
        self.eat_tok(Tk::BlockKeyword, 2);
        if !self.peek().is_some_and(|c| c.is_ascii_whitespace()) {
            return self.err("expected whitespace");
        }
        self.skip_ws();
        let context = self.pattern()?;
        self.skip_ws();
        let mut index = NodeId::NONE;
        if self.peek() == Some(b',') {
            self.eat_tok(Tk::Js(T::Comma), 1);
            self.skip_ws();
            index = self.identifier()?;
            self.skip_ws();
        }
        let mut key = NodeId::NONE;
        if self.peek() == Some(b'(') {
            self.eat_tok(Tk::Js(T::LParen), 1);
            self.skip_ws();
            key = self.expression()?;
            self.skip_ws();
            if self.peek() != Some(b')') {
                return self.err("expected `)`");
            }
            self.eat_tok(Tk::Js(T::RParen), 1);
        }
        self.close_mustache()?;
        let body = self.fragment(End::Block)?;
        let mut fallback = Range {
            start: self.c.kids.len() as u32,
            len: 0,
        };
        let has_fallback = if self.rest().starts_with("{:else") {
            self.eat_tok(Tk::BlockOpen, "{:else".len());
            self.skip_ws();
            if self.peek() != Some(b'}') {
                return self.err("expected `}` after `{:else`");
            }
            self.eat_tok(Tk::MustacheClose, 1);
            fallback = self.fragment(End::Block)?;
            true
        } else {
            false
        };
        if !self.rest().starts_with("{/each") {
            return self.err("expected `{/each}`");
        }
        self.eat_tok(Tk::BlockOpen, "{/each".len());
        self.close_mustache()?;
        let span = Span::new(lo as u32, self.pos as u32);
        Ok(self.push(TNode::Each {
            expr,
            context,
            index,
            key,
            body,
            fallback,
            has_fallback,
            span,
        }))
    }

    /// The collection of an `{#each}`. With TypeScript, `items as item` reads as an assertion;
    /// as upstream, a trailing `as` that leaves no `as` after the expression is read again as
    /// the context's keyword.
    fn each_expression(&mut self) -> R<NodeId> {
        let (pos, tokens, mark) = (self.pos, self.c.tokens.len(), self.c.js.mark());
        let ts_from = self.c.js.ts.len();
        let expr = self.expression()?;
        if self.at_word("as") {
            return Ok(expr);
        }
        let end = self.c.js.tokens.iter().next_back().map(|t| t.span.hi);
        let Some(assertion) = self.c.js.ts[ts_from..]
            .iter()
            .rev()
            .find(|t| t.kind == TsKind::As && Some(t.span.hi) == end)
        else {
            return Ok(expr);
        };
        let Some(keyword) = self.src[..assertion.span.lo as usize].rfind("as") else {
            return Ok(expr);
        };
        self.pos = pos;
        self.c.tokens.truncate(tokens);
        self.c.js.rewind(mark);
        self.c.template_exprs.pop();
        self.expression_until(keyword as u32)
    }

    /// After `{#if` or `{:else if`: the test, the branches, and the closing `{/if}`.
    fn if_block(&mut self, lo: usize, elseif: bool) -> R<TId> {
        let test = self.expression()?;
        self.close_mustache()?;
        let cons = self.fragment(End::Block)?;
        let alt = if self.rest().starts_with("{:else") {
            self.eat_tok(Tk::BlockOpen, "{:else".len());
            self.skip_ws();
            if self.rest().starts_with("if")
                && !self
                    .b
                    .get(self.pos + 2)
                    .is_some_and(u8::is_ascii_alphanumeric)
            {
                let inner_lo = self.pos;
                self.eat_tok(Tk::BlockKeyword, 2);
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
            self.eat_tok(Tk::MustacheClose, 1);
            Some(self.fragment(End::Block)?)
        } else {
            None
        };
        if !self.rest().starts_with("{/if}") {
            return self.err("expected `{/if}`");
        }
        self.eat_tok(Tk::BlockOpen, "{/if".len());
        self.eat_tok(Tk::MustacheClose, 1);
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
        self.eat_tok(Tk::TagOpen, 1);
        let _name = self.tag_name();
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
                        if let Some(q @ (b'"' | b'\'')) = self.peek() {
                            let v = self.pos + 1;
                            let Some(len) = self.src[v..].find(q as char) else {
                                return self.err("unterminated attribute value");
                            };
                            value = Some(Span::new(v as u32, (v + len) as u32));
                            self.eat_tok(Tk::Quote, 1);
                            self.eat_tok(Tk::AttrText, len);
                            self.eat_tok(Tk::Quote, 1);
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
    /// Leaves `pos` at the closing tag: the caller records the content's tokens, then calls
    /// [`Self::close_raw`].
    fn raw_text(&mut self, tag: &str) -> R<Span> {
        let close = format!("</{tag}>");
        let lo = self.pos;
        let Some(len) = self.rest().find(&close) else {
            return self.err(format!("`<{tag}>` was left open"));
        };
        self.pos += len;
        Ok(Span::new(lo as u32, (lo + len) as u32))
    }

    fn close_raw(&mut self, tag: &str) {
        self.eat_tok(Tk::EndTagOpen, 2);
        self.eat_tok(Tk::TagName, tag.len());
        self.eat_tok(Tk::TagEnd, 1);
    }

    fn script(&mut self) -> R<()> {
        let lo = self.pos;
        let attrs = self.open_tag_attrs()?;
        for (name, value) in &attrs {
            if name.text(self.src) == "module"
                || value.is_some_and(|v| v.text(self.src) == "module")
            {
                return Self::err_at(*name, "module scripts are not supported yet");
            }
        }
        let ts = self.ts;
        let content = self.raw_text("script")?;
        if self.c.instance.is_some() {
            return Self::err_at(content, "a component can have only one instance script");
        }
        let (tokens, comments) = (self.c.js.tokens.len(), self.c.js.comments.len());
        let program = parse_program(&mut self.c.js, self.src, content, ts)
            .map_err(|e| Diagnostic::error("js_parse_error", e.message, e.span))?;
        self.js_region(content.lo, content.hi, tokens, comments);
        self.close_raw("script");
        let span = Span::new(lo as u32, self.pos as u32);
        self.c.instance = Some(Script {
            span,
            attrs,
            content,
            program,
            ts,
        });
        Ok(())
    }

    fn style(&mut self) -> R<()> {
        let lo = self.pos;
        let attrs = self.open_tag_attrs()?;
        let content = self.raw_text("style")?;
        if self.c.style.is_some() {
            return Self::err_at(content, "a component can have only one style");
        }
        self.c.tokens.push(Tk::Css, content);
        self.close_raw("style");
        let sheet = rsv_css::parse(self.src, content)
            .map_err(|e| Diagnostic::error("css_parse_error", e.message, e.span))?;
        self.c.style = Some(Style {
            span: Span::new(lo as u32, self.pos as u32),
            attrs,
            sheet,
        });
        Ok(())
    }
}
