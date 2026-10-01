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

use rsvelte_javascript::parser::{parse_expression, parse_parameters, parse_program};
use rsvelte_javascript::{NodeIdentifier, SyntaxTree};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::Tokens;

use crate::syntax_tree::{
    Attribute, AttributeKind, Directive, DirectiveExpression, DirectiveName, LoopExpression, Range,
    Script, SingleFileComponent, Style, TagAttributes, Template, TemplateNode,
    TemplateNodeIdentifier, TokenType,
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
pub fn parse(source_text: &str) -> R<SingleFileComponent> {
    let mut p = P {
        source_text,
        b: source_text.as_bytes(),
        position: 0,
        c: SingleFileComponent {
            javascript: SyntaxTree::new(),
            nodes: Vec::new(),
            children: Vec::new(),
            attributes: Vec::new(),
            template: None,
            script: None,
            program: NodeIdentifier::NONE,
            styles: Vec::new(),
            typescript: script_is_typescript(source_text),
            tokens: Tokens::with_capacity(source_text.len() / 4),
        },
    };
    p.blocks()?;
    p.c.program = match &p.c.script {
        Some(s) => s.program,
        None => p.c.javascript.program(&[], Span::new(0, 0)),
    };
    Ok(p.c)
}

/// The template's expressions are TypeScript when the script is: compileScript passes `isTS` to the
/// template compiler. Read before parsing, because the template may come first.
fn script_is_typescript(source_text: &str) -> bool {
    let mut from = 0;
    while let Some(i) = source_text[from..].find("<script") {
        let at = from + i + "<script".len();
        from = at;
        if !source_text[at..].starts_with(|c: char| c.is_ascii_whitespace() || c == '>') {
            continue;
        }
        let tag = &source_text[at..at
            + source_text[at..]
                .find('>')
                .unwrap_or(source_text.len() - at)];
        return tag
            .split_ascii_whitespace()
            .any(|a| matches!(a, "lang=\"ts\"" | "lang='ts'" | "lang=ts"));
    }
    false
}

struct P<'a> {
    source_text: &'a str,
    b: &'a [u8],
    position: usize,
    c: SingleFileComponent,
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

    fn token(&mut self, kind: TokenType, start_offset: usize) {
        self.c
            .tokens
            .push(kind, Span::new(start_offset as u32, self.position as u32));
    }

    fn eat_token(&mut self, kind: TokenType, n: usize) {
        let start_offset = self.position;
        self.position += n;
        self.token(kind, start_offset);
    }

    fn skip_ws(&mut self) {
        let start_offset = self.position;
        while self.peek().is_some_and(|c| c.is_ascii_whitespace()) {
            self.position += 1;
        }
        self.token(TokenType::Whitespace, start_offset);
    }

    /// Copies what the JavaScript parser recorded in `start_offset..end_offset` into the
    /// component's tokens.
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

    const fn marks(&self) -> (usize, usize) {
        (
            self.c.javascript.tokens.len(),
            self.c.javascript.comments.len(),
        )
    }

    fn expression(&mut self, range: Span) -> R<NodeIdentifier> {
        let (t, c) = self.marks();
        let e = parse_expression(
            &mut self.c.javascript,
            self.source_text,
            range,
            self.c.typescript,
        )
        .map_err(|e| Diagnostic::error("js_parse_error", e.message, e.span))?;
        self.javascript_region(range.start_offset, range.end_offset, t, c);
        Ok(e)
    }

    fn push(&mut self, n: TemplateNode) -> TemplateNodeIdentifier {
        self.c.nodes.push(n);
        (self.c.nodes.len() - 1) as TemplateNodeIdentifier
    }

    fn range_of(v: &mut Vec<TemplateNodeIdentifier>, items: Vec<TemplateNodeIdentifier>) -> Range {
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
                self.eat_token(TokenType::MarkupComment, end + 3);
            } else if rest.starts_with("<template") && self.tag_ends_at("<template".len()) {
                self.template()?;
            } else if rest.starts_with("<script") && self.tag_ends_at("<script".len()) {
                self.script()?;
            } else if rest.starts_with("<style") && self.tag_ends_at("<style".len()) {
                self.style()?;
            } else if rest.starts_with('<') {
                return self.err("custom blocks are not supported yet");
            } else {
                let start_offset = self.position;
                self.position += rest.find('<').unwrap_or(rest.len());
                let kind = if self.source_text[start_offset..self.position]
                    .trim_ascii()
                    .is_empty()
                {
                    TokenType::Whitespace
                } else {
                    TokenType::Text
                };
                self.token(kind, start_offset);
            }
        }
    }

    fn tag_ends_at(&self, n: usize) -> bool {
        self.b
            .get(self.position + n)
            .is_some_and(|&c| c.is_ascii_whitespace() || c == b'>' || c == b'/')
    }

    /// `(name, unquoted value)` pairs of a block's start tag, through its `>`.
    fn open_tag_attributes(&mut self) -> R<Vec<TagAttributes>> {
        self.eat_token(TokenType::TagOpen, 1);
        let start_offset = self.position;
        while self.peek().is_some_and(|c| c.is_ascii_alphanumeric()) {
            self.position += 1;
        }
        self.token(TokenType::TagName, start_offset);
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
                        let Some(q @ (b'"' | b'\'')) = self.peek() else {
                            return self.err("expected a quoted value");
                        };
                        let v = self.position + 1;
                        let Some(len) = self.source_text[v..].find(q as char) else {
                            return self.err("unterminated attribute value");
                        };
                        value = Some(Span::new(v as u32, (v + len) as u32));
                        self.eat_token(TokenType::Quote, 1);
                        self.eat_token(TokenType::AttributeText, len);
                        self.eat_token(TokenType::Quote, 1);
                    }
                    attributes.push((name, value));
                }
            }
        }
    }

    /// Raw text up to `</tag>`; leaves `position` at the closing tag.
    fn raw_text(&mut self, tag: &str) -> R<Span> {
        let close = format!("</{tag}>");
        let start_offset = self.position;
        let Some(len) = self.rest().find(&close) else {
            return self.err(format!("`<{tag}>` was left open"));
        };
        self.position += len;
        Ok(Span::new(start_offset as u32, (start_offset + len) as u32))
    }

    fn close_tag(&mut self, tag: &str) -> R<()> {
        if !self.rest().starts_with("</") || !self.rest()[2..].starts_with(tag) {
            return self.err(format!("expected `</{tag}>`"));
        }
        self.eat_token(TokenType::EndTagOpen, 2);
        self.eat_token(TokenType::TagName, tag.len());
        self.skip_ws();
        if self.peek() != Some(b'>') {
            return self.err("expected `>`");
        }
        self.eat_token(TokenType::TagEnd, 1);
        Ok(())
    }

    fn template(&mut self) -> R<()> {
        let start_offset = self.position;
        let attributes = self.open_tag_attributes()?;
        if let Some((name, _)) = attributes
            .iter()
            .find(|(n, _)| matches!(n.text(self.source_text), "lang" | "src" | "functional"))
        {
            return Self::err_at(*name, "this template attribute is not supported yet");
        }
        if self.c.template.is_some() {
            return self.err("a component can have only one <template>");
        }
        let content_start_offset = self.position;
        let root = self.fragment(Some("template"))?;
        let content = Span::new(content_start_offset as u32, self.position as u32);
        self.close_tag("template")?;
        self.c.template = Some(Template {
            span: Span::new(start_offset as u32, self.position as u32),
            attributes,
            content,
            root,
        });
        Ok(())
    }

    fn script(&mut self) -> R<()> {
        let start_offset = self.position;
        let attributes = self.open_tag_attributes()?;
        let has = |name: &str| {
            attributes
                .iter()
                .find(|(n, _)| n.text(self.source_text) == name)
        };
        if has("setup").is_none() {
            return Self::err_at(
                Span::new(start_offset as u32, self.position as u32),
                "only <script setup> is supported yet",
            );
        }
        if let Some((name, _)) = has("src") {
            return Self::err_at(*name, "an external script is not supported yet");
        }
        if let Some((name, Some(lang))) = has("lang")
            && !matches!(lang.text(self.source_text), "ts" | "js")
        {
            return Self::err_at(*name, "this script language is not supported");
        }
        let content = self.raw_text("script")?;
        if self.c.script.is_some() {
            return Self::err_at(content, "a component can have only one <script setup>");
        }
        let (t, c) = self.marks();
        let program = parse_program(
            &mut self.c.javascript,
            self.source_text,
            content,
            self.c.typescript,
        )
        .map_err(|e| Diagnostic::error("js_parse_error", e.message, e.span))?;
        self.javascript_region(content.start_offset, content.end_offset, t, c);
        self.close_tag("script")?;
        self.c.script = Some(Script {
            span: Span::new(start_offset as u32, self.position as u32),
            attributes,
            content,
            program,
        });
        Ok(())
    }

    fn style(&mut self) -> R<()> {
        let start_offset = self.position;
        let attributes = self.open_tag_attributes()?;
        if let Some((name, _)) = attributes
            .iter()
            .find(|(n, _)| matches!(n.text(self.source_text), "lang" | "src" | "module"))
        {
            return Self::err_at(*name, "this style attribute is not supported yet");
        }
        let scoped = attributes
            .iter()
            .any(|(n, _)| n.text(self.source_text) == "scoped");
        let content = self.raw_text("style")?;
        self.c.tokens.push(TokenType::Stylesheet, content);
        self.close_tag("style")?;
        let sheet = rsvelte_stylesheet::parse(self.source_text, content)
            .map_err(|e| Diagnostic::error("css_parse_error", e.message, e.span))?;
        self.c.styles.push(Style {
            span: Span::new(start_offset as u32, self.position as u32),
            attributes,
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
                    None => Ok(Self::range_of(&mut self.c.children, items)),
                };
            }
            if rest.starts_with("</") {
                return Ok(Self::range_of(&mut self.c.children, items));
            }
            if rest.starts_with("<!--") {
                items.push(self.comment()?);
            } else if rest.starts_with('<') {
                items.push(self.element()?);
            } else if rest.starts_with("{{") {
                items.push(self.interpolation()?);
            } else {
                let start_offset = self.position;
                let len = match (rest.find('<'), rest.find("{{")) {
                    (Some(a), Some(b)) => a.min(b),
                    (a, b) => a.or(b).unwrap_or(rest.len()),
                };
                self.position += len;
                self.token(TokenType::Text, start_offset);
                items.push(self.push(TemplateNode::Text {
                    span: Span::new(start_offset as u32, self.position as u32),
                }));
            }
        }
    }

    fn comment(&mut self) -> R<TemplateNodeIdentifier> {
        let start_offset = self.position;
        let Some(end) = self.rest().find("-->") else {
            return self.err("unterminated comment");
        };
        let data = Span::new((start_offset + 4) as u32, (start_offset + end) as u32);
        self.eat_token(TokenType::MarkupComment, end + 3);
        Ok(self.push(TemplateNode::Comment {
            span: Span::new(start_offset as u32, self.position as u32),
            data,
        }))
    }

    fn interpolation(&mut self) -> R<TemplateNodeIdentifier> {
        let start_offset = self.position;
        let Some(end) = self.rest().find("}}") else {
            return self.err("interpolation end sign was not found");
        };
        self.eat_token(TokenType::InterpolationOpen, 2);
        let inner = Span::new(self.position as u32, (start_offset + end) as u32);
        let expression = self.expression(inner)?;
        self.position = inner.end_offset as usize;
        self.eat_token(TokenType::InterpolationClose, 2);
        Ok(self.push(TemplateNode::Interpolation {
            expression,
            span: Span::new(start_offset as u32, self.position as u32),
        }))
    }

    fn element(&mut self) -> R<TemplateNodeIdentifier> {
        let start_offset = self.position;
        self.eat_token(TokenType::TagOpen, 1);
        let name_start_offset = self.position;
        while self
            .peek()
            .is_some_and(|c| c.is_ascii_alphanumeric() || c == b'-')
        {
            self.position += 1;
        }
        let name = Span::new(name_start_offset as u32, self.position as u32);
        if name.is_empty() {
            return self.err("expected a tag name");
        }
        self.token(TokenType::TagName, name_start_offset);
        let name_text = name.text(self.source_text);
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
        let (attributes, self_closing) = self.attributes()?;
        let start_tag = Span::new(start_offset as u32, self.position as u32);
        let children = if self_closing || is_void(name_text) {
            Range {
                start: self.c.children.len() as u32,
                len: 0,
            }
        } else {
            let children = self.fragment(Some(name_text))?;
            self.close_tag(name_text)?;
            children
        };
        Ok(self.push(TemplateNode::Element {
            name,
            attributes,
            children,
            start_tag,
            self_closing,
            span: Span::new(start_offset as u32, self.position as u32),
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
                    self.eat_token(TokenType::TagEnd, 1);
                    break false;
                }
                Some(b'/') if self.rest().starts_with("/>") => {
                    self.eat_token(TokenType::SelfClose, 2);
                    break true;
                }
                Some(_) => list.push(self.attribute()?),
            }
        };
        let start = self.c.attributes.len() as u32;
        let len = list.len() as u32;
        self.c.attributes.extend(list);
        Ok((Range { start, len }, self_closing))
    }

    fn attribute(&mut self) -> R<Attribute> {
        let start_offset = self.position;
        while self
            .peek()
            .is_some_and(|c| !c.is_ascii_whitespace() && !matches!(c, b'=' | b'>' | b'"' | b'\''))
            && !self.rest().starts_with("/>")
        {
            self.position += 1;
        }
        let name = Span::new(start_offset as u32, self.position as u32);
        if name.is_empty() {
            return self.err("expected an attribute name");
        }
        self.token(TokenType::AttributeName, start_offset);
        let directive = self.directive_name(name)?;
        self.skip_ws();
        let (value, quoted) = if self.peek() == Some(b'=') {
            self.eat_token(TokenType::Eq, 1);
            self.skip_ws();
            match self.peek() {
                Some(q @ (b'"' | b'\'')) => {
                    self.eat_token(TokenType::Quote, 1);
                    let v = self.position;
                    let Some(len) = self.rest().find(q as char) else {
                        return self.err("unterminated attribute value");
                    };
                    self.position += len;
                    (Some(Span::new(v as u32, self.position as u32)), true)
                }
                Some(_) => {
                    let v = self.position;
                    while self
                        .peek()
                        .is_some_and(|c| !c.is_ascii_whitespace() && c != b'>')
                    {
                        self.position += 1;
                    }
                    (Some(Span::new(v as u32, self.position as u32)), false)
                }
                None => return self.err("expected an attribute value"),
            }
        } else {
            (None, false)
        };
        let kind = match directive {
            None => {
                if let Some(v) = value {
                    self.position = v.start_offset as usize;
                    self.eat_token(TokenType::AttributeText, v.len() as usize);
                }
                AttributeKind::Static
            }
            Some((dir, arg)) => {
                let exp = match (dir, value) {
                    (DirectiveName::Else, None) => DirectiveExpression::None,
                    (DirectiveName::Else, Some(v)) => {
                        return Self::err_at(v, "v-else has no expression");
                    }
                    (_, None) => return Self::err_at(name, "a directive needs an expression"),
                    (DirectiveName::For, Some(v)) => {
                        DirectiveExpression::For(self.for_expression(v)?)
                    }
                    (_, Some(v)) => DirectiveExpression::Expression(self.expression(v)?),
                };
                AttributeKind::Directive(Directive {
                    name: dir,
                    arg,
                    exp,
                })
            }
        };
        if let Some(v) = value {
            self.position = v.end_offset as usize;
            if quoted {
                self.eat_token(TokenType::Quote, 1);
            }
        }
        Ok(Attribute {
            name,
            kind,
            value,
            quoted,
            span: Span::new(start_offset as u32, self.position as u32),
        })
    }

    /// `:arg`, `@arg` and `v-name:arg`; `None` for a static attribute.
    fn directive_name(&self, name: Span) -> R<Option<(DirectiveName, Option<Span>)>> {
        let text = name.text(self.source_text);
        let (dir, arg_start_offset) = match text.as_bytes()[0] {
            b':' => (DirectiveName::Bind, 1),
            b'@' => (DirectiveName::On, 1),
            b'#' | b'.' => return Self::err_at(name, "this directive is not supported yet"),
            _ if text.starts_with("v-") => {
                let end = text.find(':').unwrap_or(text.len());
                let dir = match &text[2..end] {
                    "bind" => DirectiveName::Bind,
                    "on" => DirectiveName::On,
                    "if" => DirectiveName::If,
                    "else-if" => DirectiveName::ElseIf,
                    "else" => DirectiveName::Else,
                    "for" => DirectiveName::For,
                    _ => return Self::err_at(name, "this directive is not supported yet"),
                };
                (dir, (end + 1).min(text.len()))
            }
            _ => return Ok(None),
        };
        if text[arg_start_offset..].contains(['.', '[']) {
            return Self::err_at(
                name,
                "directive modifiers and dynamic arguments are not supported yet",
            );
        }
        let arg = (arg_start_offset < text.len())
            .then(|| Span::new(name.start_offset + arg_start_offset as u32, name.end_offset));
        if matches!(dir, DirectiveName::Bind | DirectiveName::On) && arg.is_none() {
            return Self::err_at(name, "an object v-bind or v-on is not supported yet");
        }
        Ok(Some((dir, arg)))
    }

    /// compiler-core's `parseForExpression`: `forAliasRE` splits the value at ` in ` / ` of `, the
    /// aliases lose their parentheses, and each part is parsed on its own.
    fn for_expression(&mut self, v: Span) -> R<LoopExpression> {
        let text = v.text(self.source_text);
        let Some((alias_end, kw_start_offset)) = split_for(text) else {
            return Self::err_at(v, "v-for has invalid expression");
        };
        let at = |i: usize| v.start_offset + i as u32;
        let alias = &text[..alias_end];
        let trimmed_start_offset = alias.len() - alias.trim_start().len();
        let trimmed = alias.trim();
        let (inner_start_offset, inner_end_offset) =
            if trimmed.starts_with('(') && trimmed.ends_with(')') {
                (
                    trimmed_start_offset + 1,
                    trimmed_start_offset + trimmed.len() - 1,
                )
            } else {
                (trimmed_start_offset, trimmed_start_offset + trimmed.len())
            };
        self.position = v.start_offset as usize;
        self.skip_to(at(trimmed_start_offset), TokenType::Whitespace);
        if inner_start_offset > trimmed_start_offset {
            self.eat_token(TokenType::ForParen, 1);
        }
        let (t, c) = self.marks();
        let parameters = parse_parameters(
            &mut self.c.javascript,
            self.source_text,
            Span::new(at(inner_start_offset), at(inner_end_offset)),
            self.c.typescript,
        )
        .map_err(|e| Diagnostic::error("js_parse_error", e.message, e.span))?;
        self.javascript_region(at(inner_start_offset), at(inner_end_offset), t, c);
        self.position = at(inner_end_offset) as usize;
        if inner_start_offset > trimmed_start_offset {
            self.eat_token(TokenType::ForParen, 1);
        }
        self.skip_to(at(kw_start_offset), TokenType::Whitespace);
        self.eat_token(TokenType::ForKeyword, 2);
        let source = self.expression(Span::new(at(kw_start_offset + 2), v.end_offset))?;
        if parameters.is_empty() {
            return Self::err_at(v, "v-for has no alias");
        }
        Ok(LoopExpression { parameters, source })
    }

    fn skip_to(&mut self, to: u32, kind: TokenType) {
        let start_offset = self.position;
        self.position = to as usize;
        self.token(kind, start_offset);
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
