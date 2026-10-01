//! The template parser: markup, `{expression}` tags, `{#if}` blocks, one instance `<script>` and
//! one `<style>`.
//!
//! Expressions are parsed by `rsvelte_javascript` in place, and the parser, not a brace scan,
//! decides where each one ends.

use rsvelte_javascript::parser::{parse_expression_prefix, parse_program};
use rsvelte_javascript::{NodeIdentifier, SyntaxTree};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::performance::buffer_pool;
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::Tokens;

use crate::syntax::syntax_tree::{
    Attribute, AttributeValue, Component, Part, Range, Script, Style, TemplateNode,
    TemplateNodeIdentifier, TokenType,
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
pub fn parse(source_text: &str) -> R<Component> {
    let mut p = P {
        source_text,
        b: source_text.as_bytes(),
        position: 0,
        c: Component {
            javascript: SyntaxTree::new(),
            nodes: buffer_pool::take_keyed::<Component, _>(),
            children: buffer_pool::take_keyed::<Component, _>(),
            attributes: buffer_pool::take_keyed::<Component, _>(),
            parts: buffer_pool::take_keyed::<Component, _>(),
            root: Range::default(),
            instance: None,
            program: NodeIdentifier::NONE,
            style: None,
            template_expressions: buffer_pool::take_keyed::<Component, _>(),
            // The corpus averages a token per 4.8 bytes; a quarter leaves most tables unresized.
            tokens: Tokens::with_capacity(source_text.len() / 4),
        },
        typescript: false,
        open: buffer_pool::take_keyed::<P<'static>, _>(),
    };
    // The script's language decides how template expressions parse, so read it first.
    p.typescript = script_is_typescript(source_text);
    let root = p.fragment(End::Eof);
    buffer_pool::give_keyed::<P<'static>, _>(std::mem::take(&mut p.open));
    p.c.root = root?;
    p.c.program = match &p.c.instance {
        Some(s) => s.program,
        None => p.c.javascript.program(&[], Span::new(0, 0)),
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
    source_text: &'a str,
    b: &'a [u8],
    position: usize,
    c: Component,
    typescript: bool,
    /// The children of the fragments being read, innermost last: a fragment's go to
    /// [`Component::children`] in one run when it closes.
    open: Vec<TemplateNodeIdentifier>,
}

/// Ports upstream's `regex_lang_attribute` (1-parse/index.js): the first `<script …lang=…>` outside
/// a comment decides, and only the exact value `ts` means TypeScript.
fn script_is_typescript(source_text: &str) -> bool {
    let mut from = 0;
    loop {
        let rest = &source_text[from..];
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
        Self::err_at(
            Span::new(self.position as u32, self.position as u32),
            message,
        )
    }

    fn err_at<X>(span: Span, message: impl Into<String>) -> R<X> {
        Err(Diagnostic::error("parse_error", message.into(), span))
    }

    fn rest(&self) -> &'a str {
        &self.source_text[self.position..]
    }

    fn peek(&self) -> Option<u8> {
        self.b.get(self.position).copied()
    }

    fn skip_ws(&mut self) {
        let start_offset = self.position;
        while self.peek().is_some_and(|c| c.is_ascii_whitespace()) {
            self.position += 1;
        }
        self.token(TokenType::Whitespace, start_offset);
    }

    /// Records `lo..position` as one token.
    fn token(&mut self, kind: TokenType, start_offset: usize) {
        self.c
            .tokens
            .push(kind, Span::new(start_offset as u32, self.position as u32));
    }

    /// Advances over `n` bytes as one token.
    fn eat_token(&mut self, kind: TokenType, n: usize) {
        let start_offset = self.position;
        self.position += n;
        self.token(kind, start_offset);
    }

    /// Copies what the JavaScript parser consumed in `start_offset..end_offset` (its tokens and
    /// comments since the counts given) into the component's tokens, with the whitespace
    /// between them.
    fn javascript_region(
        &mut self,
        start_offset: u32,
        end_offset: u32,
        tokens_from: usize,
        comments_from: usize,
    ) {
        let mut at = start_offset;
        for (kind, span) in self.c.javascript.recorded_since(tokens_from, comments_from) {
            self.c
                .tokens
                .push(TokenType::Whitespace, Span::new(at, span.start_offset));
            self.c.tokens.push(
                kind.map_or(TokenType::JavaScriptComment, TokenType::JavaScript),
                span,
            );
            at = span.end_offset;
        }
        self.c
            .tokens
            .push(TokenType::Whitespace, Span::new(at, end_offset));
    }

    fn push(&mut self, n: TemplateNode) -> TemplateNodeIdentifier {
        self.c.nodes.push(n);
        (self.c.nodes.len() - 1) as TemplateNodeIdentifier
    }

    /// Moves the children gathered since `open` to [`Component::children`].
    fn close(&mut self, open: usize) -> Range {
        let start = self.c.children.len() as u32;
        self.c.children.extend_from_slice(&self.open[open..]);
        self.open.truncate(open);
        Range {
            start,
            len: self.c.children.len() as u32 - start,
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
                let start_offset = self.position;
                let expression = self.expression_tag()?;
                let span = Span::new(start_offset as u32, self.position as u32);
                self.push(TemplateNode::Expression { expression, span })
            } else {
                let start_offset = self.position;
                let len = rest.find(['<', '{']).unwrap_or(rest.len());
                self.position += len;
                self.token(TokenType::Text, start_offset);
                self.push(TemplateNode::Text {
                    span: Span::new(start_offset as u32, self.position as u32),
                })
            };
            self.open.push(child);
        }
    }

    fn comment(&mut self) -> R<TemplateNodeIdentifier> {
        let start_offset = self.position;
        let Some(end) = self.rest().find("-->") else {
            return self.err("unterminated comment");
        };
        let data = Span::new((start_offset + 4) as u32, (start_offset + end) as u32);
        self.position += end + 3;
        self.token(TokenType::MarkupComment, start_offset);
        Ok(self.push(TemplateNode::Comment {
            span: Span::new(start_offset as u32, self.position as u32),
            data,
        }))
    }

    /// `{expression}` starting at `{`; returns with `position` after the `}`.
    fn expression_tag(&mut self) -> R<NodeIdentifier> {
        self.eat_token(TokenType::MustacheOpen, 1);
        let expression = self.expression()?;
        self.close_mustache()?;
        Ok(expression)
    }

    fn close_mustache(&mut self) -> R<()> {
        self.skip_ws();
        if self.peek() != Some(b'}') {
            return self.err("expected `}`");
        }
        self.eat_token(TokenType::MustacheClose, 1);
        Ok(())
    }

    fn expression(&mut self) -> R<NodeIdentifier> {
        let (tokens, comments) = (
            self.c.javascript.tokens.len(),
            self.c.javascript.comments.len(),
        );
        let start_offset = self.position as u32;
        let (expression, next) = parse_expression_prefix(
            &mut self.c.javascript,
            self.source_text,
            self.position as u32,
            self.source_text.len() as u32,
            self.typescript,
        )
        .map_err(|e| Diagnostic::error("js_parse_error", e.message, e.span))?;
        self.javascript_region(start_offset, next, tokens, comments);
        self.position = next as usize;
        self.c.template_expressions.push(expression);
        Ok(expression)
    }

    fn tag_name(&mut self) -> Span {
        let start_offset = self.position;
        while self
            .peek()
            .is_some_and(|c| c.is_ascii_alphanumeric() || matches!(c, b'-' | b':' | b'.'))
        {
            self.position += 1;
        }
        self.token(TokenType::TagName, start_offset);
        Span::new(start_offset as u32, self.position as u32)
    }

    fn element(&mut self) -> R<TemplateNodeIdentifier> {
        let start_offset = self.position;
        self.eat_token(TokenType::TagOpen, 1);
        let name = self.tag_name();
        if name.is_empty() {
            return self.err("expected a tag name");
        }
        let (attributes, self_closing) = self.attributes()?;
        let start_tag = Span::new(start_offset as u32, self.position as u32);
        let name_text = name.text(self.source_text);
        let children = if self_closing || is_void(name_text) {
            Range {
                start: self.c.children.len() as u32,
                len: 0,
            }
        } else {
            let children = self.fragment(End::Tag(name_text))?;
            let close = format!("</{name_text}");
            if !self.rest().starts_with(&close) {
                return self.err(format!("expected `</{name_text}>`"));
            }
            self.eat_token(TokenType::EndTagOpen, 2);
            self.eat_token(TokenType::TagName, name_text.len());
            self.skip_ws();
            if self.peek() != Some(b'>') {
                return self.err("expected `>`");
            }
            self.eat_token(TokenType::TagEnd, 1);
            children
        };
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(self.push(TemplateNode::Element {
            name,
            attributes,
            children,
            start_tag,
            self_closing,
            span,
        }))
    }

    /// Reads attributes up to and including `>` or `/>`.
    fn attributes(&mut self) -> R<(Range, bool)> {
        let start = self.c.attributes.len();
        loop {
            self.skip_ws();
            match self.peek() {
                None => return self.err("unterminated start tag"),
                Some(b'>') => {
                    self.eat_token(TokenType::TagEnd, 1);
                    break;
                }
                Some(b'/') if self.rest().starts_with("/>") => {
                    self.eat_token(TokenType::SelfClose, 2);
                    return Ok((self.attributes_since(start), true));
                }
                Some(b'{') => {
                    let start_offset = self.position;
                    if self.rest()[1..].trim_start().starts_with("...") {
                        return self.err("spread attributes are not supported yet");
                    }
                    let expression = self.expression_tag()?;
                    let span = Span::new(start_offset as u32, self.position as u32);
                    let name = match self.c.javascript.kind(expression) {
                        rsvelte_javascript::Kind::Identifier(_) => self
                            .c
                            .javascript
                            .source_location(expression)
                            .span()
                            .expect("parsed from source"),
                        _ => {
                            return Self::err_at(
                                span,
                                "expected an identifier in a shorthand attribute",
                            );
                        }
                    };
                    let parts = self.c.parts.len();
                    self.c.parts.push(Part::Expression { expression, span });
                    let parts = self.parts_since(parts);
                    self.c.attributes.push(Attribute {
                        name,
                        value: AttributeValue::Parts(parts),
                        span,
                        quoted: false,
                        shorthand: true,
                    });
                }
                Some(_) => {
                    let a = self.attribute()?;
                    self.c.attributes.push(a);
                }
            }
        }
        Ok((self.attributes_since(start), false))
    }

    /// The attributes pushed since there were `start`: an element's are read in one run, since
    /// nothing inside an attribute is an attribute.
    const fn attributes_since(&self, start: usize) -> Range {
        Range {
            start: start as u32,
            len: (self.c.attributes.len() - start) as u32,
        }
    }

    /// The parts pushed since there were `start`: an attribute's are read in one run.
    const fn parts_since(&self, start: usize) -> Range {
        Range {
            start: start as u32,
            len: (self.c.parts.len() - start) as u32,
        }
    }

    fn attribute(&mut self) -> R<Attribute> {
        let start_offset = self.position;
        while self.peek().is_some_and(|c| {
            !c.is_ascii_whitespace() && !matches!(c, b'=' | b'>' | b'/' | b'"' | b'\'' | b'{')
        }) {
            self.position += 1;
        }
        let name = Span::new(start_offset as u32, self.position as u32);
        if name.is_empty() {
            return self.err("expected an attribute name");
        }
        self.token(TokenType::AttributeName, start_offset);
        if name.text(self.source_text).contains(':') {
            return Self::err_at(name, "directives are not supported yet");
        }
        self.skip_ws();
        if self.peek() != Some(b'=') {
            return Ok(Attribute {
                name,
                value: AttributeValue::True,
                span: name,
                quoted: false,
                shorthand: false,
            });
        }
        self.eat_token(TokenType::Eq, 1);
        self.skip_ws();
        let quoted = matches!(self.peek(), Some(b'"' | b'\''));
        let start = self.c.parts.len();
        match self.peek() {
            Some(q @ (b'"' | b'\'')) => {
                self.eat_token(TokenType::Quote, 1);
                self.attribute_chunks(Some(q))?;
                if self.c.parts.len() == start {
                    let at = self.position as u32;
                    self.c.parts.push(Part::Text(Span::new(at, at)));
                }
                self.eat_token(TokenType::Quote, 1);
            }
            Some(b'{') => {
                let s = self.position;
                let expression = self.expression_tag()?;
                self.c.parts.push(Part::Expression {
                    expression,
                    span: Span::new(s as u32, self.position as u32),
                });
            }
            Some(_) => self.attribute_chunks(None)?,
            None => return self.err("expected an attribute value"),
        }
        let parts = self.parts_since(start);
        Ok(Attribute {
            name,
            value: AttributeValue::Parts(parts),
            span: Span::new(start_offset as u32, self.position as u32),
            quoted,
            shorthand: false,
        })
    }

    /// Text and `{…}` chunks up to the closing quote (left unconsumed) or, unquoted, to
    /// whitespace/`>`.
    fn attribute_chunks(&mut self, quote: Option<u8>) -> R<()> {
        let mut text_start_offset = self.position;
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
                if self.position > text_start_offset {
                    let text =
                        Part::Text(Span::new(text_start_offset as u32, self.position as u32));
                    self.c.parts.push(text);
                    self.token(TokenType::AttributeText, text_start_offset);
                }
                if at_end {
                    return Ok(());
                }
                let s = self.position;
                let expression = self.expression_tag()?;
                self.c.parts.push(Part::Expression {
                    expression,
                    span: Span::new(s as u32, self.position as u32),
                });
                text_start_offset = self.position;
            } else {
                self.position += 1;
            }
        }
    }

    fn block(&mut self) -> R<TemplateNodeIdentifier> {
        let start_offset = self.position;
        if !self.rest().starts_with("{#if") {
            return self.err("only `{#if}` blocks are supported yet");
        }
        self.eat_token(TokenType::BlockOpen, 4);
        self.if_block(start_offset, false)
    }

    /// After `{#if` or `{:else if`: the test, the branches, and the closing `{/if}`.
    fn if_block(&mut self, start_offset: usize, elseif: bool) -> R<TemplateNodeIdentifier> {
        let test = self.expression()?;
        self.close_mustache()?;
        let consequent = self.fragment(End::Block)?;
        let alternate = if self.rest().starts_with("{:else") {
            self.eat_token(TokenType::BlockOpen, "{:else".len());
            self.skip_ws();
            if self.rest().starts_with("if")
                && !self
                    .b
                    .get(self.position + 2)
                    .is_some_and(u8::is_ascii_alphanumeric)
            {
                let inner_start_offset = self.position;
                self.eat_token(TokenType::BlockKeyword, 2);
                let inner = self.if_block(inner_start_offset, true)?;
                let start = self.c.children.len() as u32;
                self.c.children.push(inner);
                let span = Span::new(start_offset as u32, self.position as u32);
                return Ok(self.push(TemplateNode::If {
                    test,
                    consequent,
                    alternate: Some(Range { start, len: 1 }),
                    elseif,
                    span,
                }));
            }
            if self.peek() != Some(b'}') {
                return self.err("expected `}` after `{:else`");
            }
            self.eat_token(TokenType::MustacheClose, 1);
            Some(self.fragment(End::Block)?)
        } else {
            None
        };
        if !self.rest().starts_with("{/if}") {
            return self.err("expected `{/if}`");
        }
        self.eat_token(TokenType::BlockOpen, "{/if".len());
        self.eat_token(TokenType::MustacheClose, 1);
        let span = Span::new(start_offset as u32, self.position as u32);
        Ok(self.push(TemplateNode::If {
            test,
            consequent,
            alternate,
            elseif,
            span,
        }))
    }

    /// `(name, quoted value)` pairs of a `<script>`/`<style>` start tag.
    fn open_tag_attributes(&mut self) -> R<Vec<(Span, Option<Span>)>> {
        self.eat_token(TokenType::TagOpen, 1);
        let _name = self.tag_name();
        let mut attributes = Vec::new();
        loop {
            self.skip_ws();
            match self.peek() {
                None => return self.err("unterminated start tag"),
                Some(b'>') => {
                    self.eat_token(TokenType::TagEnd, 1);
                    return Ok(attributes);
                }
                Some(_) => {
                    let n = self.position;
                    while self
                        .peek()
                        .is_some_and(|c| !c.is_ascii_whitespace() && !matches!(c, b'=' | b'>'))
                    {
                        self.position += 1;
                    }
                    let name = Span::new(n as u32, self.position as u32);
                    self.token(TokenType::AttributeName, n);
                    let mut value = None;
                    if self.peek() == Some(b'=') {
                        self.eat_token(TokenType::Eq, 1);
                        if let Some(q @ (b'"' | b'\'')) = self.peek() {
                            let v = self.position + 1;
                            let Some(len) = self.source_text[v..].find(q as char) else {
                                return self.err("unterminated attribute value");
                            };
                            value = Some(Span::new(v as u32, (v + len) as u32));
                            self.eat_token(TokenType::Quote, 1);
                            self.eat_token(TokenType::AttributeText, len);
                            self.eat_token(TokenType::Quote, 1);
                        } else {
                            return self.err("expected a quoted value");
                        }
                    }
                    attributes.push((name, value));
                }
            }
        }
    }

    /// Raw text up to `</tag>` (HTML raw-text elements end at the first closing tag).
    /// Leaves `position` at the closing tag: the caller records the content's tokens, then calls
    /// [`Self::close_raw`].
    fn raw_text(&mut self, tag: &str) -> R<Span> {
        let close = format!("</{tag}>");
        let start_offset = self.position;
        let Some(len) = self.rest().find(&close) else {
            return self.err(format!("`<{tag}>` was left open"));
        };
        self.position += len;
        Ok(Span::new(start_offset as u32, (start_offset + len) as u32))
    }

    fn close_raw(&mut self, tag: &str) {
        self.eat_token(TokenType::EndTagOpen, 2);
        self.eat_token(TokenType::TagName, tag.len());
        self.eat_token(TokenType::TagEnd, 1);
    }

    fn script(&mut self) -> R<()> {
        let start_offset = self.position;
        let attributes = self.open_tag_attributes()?;
        for (name, value) in &attributes {
            if name.text(self.source_text) == "module"
                || value.is_some_and(|v| v.text(self.source_text) == "module")
            {
                return Self::err_at(*name, "module scripts are not supported yet");
            }
        }
        let typescript = self.typescript;
        let content = self.raw_text("script")?;
        if self.c.instance.is_some() {
            return Self::err_at(content, "a component can have only one instance script");
        }
        let (tokens, comments) = (
            self.c.javascript.tokens.len(),
            self.c.javascript.comments.len(),
        );
        let program = parse_program(
            &mut self.c.javascript,
            self.source_text,
            content,
            typescript,
        )
        .map_err(|e| Diagnostic::error("js_parse_error", e.message, e.span))?;
        self.javascript_region(content.start_offset, content.end_offset, tokens, comments);
        self.close_raw("script");
        let span = Span::new(start_offset as u32, self.position as u32);
        self.c.instance = Some(Script {
            span,
            attributes,
            content,
            program,
            typescript,
        });
        Ok(())
    }

    fn style(&mut self) -> R<()> {
        let start_offset = self.position;
        let attributes = self.open_tag_attributes()?;
        let content = self.raw_text("style")?;
        if self.c.style.is_some() {
            return Self::err_at(content, "a component can have only one style");
        }
        self.c.tokens.push(TokenType::Stylesheet, content);
        self.close_raw("style");
        let sheet = rsvelte_stylesheet::parse(self.source_text, content)
            .map_err(|e| Diagnostic::error("css_parse_error", e.message, e.span))?;
        self.c.style = Some(Style {
            span: Span::new(start_offset as u32, self.position as u32),
            attributes,
            sheet,
        });
        Ok(())
    }
}
