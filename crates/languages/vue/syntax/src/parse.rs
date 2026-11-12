//! The single-file component parser: the top-level blocks (compiler-sfc's `parse`) and the
//! template inside `<template>` (compiler-core's tokenizer, in its `sfc` mode).
//!
//! It reads one `<template>`, one `<script setup>` and any number of `<style>` blocks; the
//! template holds elements, text, comments, `{{ }}` interpolations, static attributes and the
//! `v-bind`/`:`, `v-on`/`@` (with modifiers), `v-if`/`v-else-if`/`v-else`, `v-for` and `v-model`
//! (with modifiers) directives. Anything else is refused.
//!
//! As upstream, an interpolation ends at the first `}}` and an attribute value at its closing
//! quote; the text in between is then parsed as JavaScript (TypeScript under `lang="ts"`).

use oxc_span::SourceType;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::Tokens;
use rsvelte_typescript_tree::{Builder, ExpressionIdentifier, ProgramIdentifier, Tree};

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
pub(crate) fn is_void(name: &str) -> bool {
    VOID_TAGS.contains(&name)
}

/// # Errors
///
/// A `parse_error` [`Diagnostic`] at the first syntax error, or at syntax this parser does not
/// support; `js_parse_error` / `css_parse_error` from the embedded parsers.
pub fn parse(source_text: &str) -> R<SingleFileComponent> {
    let (javascript, (c, program)) = Tree::build(source_text, |builder| {
        let mut p = P {
            source_text: builder.source_text(),
            b: source_text.as_bytes(),
            position: 0,
            builder,
            c: Markup {
                nodes: Vec::new(),
                children: Vec::new(),
                attributes: Vec::new(),
                template: None,
                script: None,
                styles: Vec::new(),
                typescript: script_is_typescript(source_text),
                tokens: Tokens::with_capacity(source_text.len() / 4),
            },
        };
        p.blocks()?;
        let program = match &p.c.script {
            Some(s) => s.program,
            None => p
                .builder
                .program(Span::new(0, 0), p.source_type())
                .map_err(javascript_error)?,
        };
        Ok((p.c, program))
    })?;
    Ok(SingleFileComponent {
        javascript,
        nodes: c.nodes,
        children: c.children,
        attributes: c.attributes,
        template: c.template,
        script: c.script,
        program,
        styles: c.styles,
        typescript: c.typescript,
        tokens: c.tokens,
    })
}

/// The component without its JavaScript, while the parser fills the arena.
struct Markup {
    nodes: Vec<TemplateNode>,
    children: Vec<TemplateNodeIdentifier>,
    attributes: Vec<Attribute>,
    template: Option<Template>,
    script: Option<Script>,
    styles: Vec<Style>,
    typescript: bool,
    tokens: Tokens<TokenType>,
}

/// oxc's error, under the code compiler-sfc's callers give a JavaScript syntax error.
#[cold]
fn javascript_error(e: impl Into<Diagnostic>) -> Diagnostic {
    let mut e = e.into();
    e.code = "js_parse_error".into();
    e
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

struct P<'a, 'b> {
    source_text: &'a str,
    b: &'b [u8],
    position: usize,
    builder: &'b mut Builder<'a>,
    c: Markup,
}

impl<'a> P<'a, '_> {
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

    const fn source_type(&self) -> SourceType {
        if self.c.typescript {
            SourceType::ts()
        } else {
            SourceType::mjs()
        }
    }

    /// Copies what the JavaScript parser recorded for the part read last, which lies in
    /// `start_offset..end_offset`, into the component's tokens.
    fn javascript_region(&mut self, start_offset: u32, end_offset: u32) {
        let mut at = start_offset;
        for r in self.builder.recorded() {
            self.c
                .tokens
                .push(TokenType::Whitespace, Span::new(at, r.span.start_offset));
            self.c.tokens.push(
                r.kind
                    .map_or(TokenType::JavaScriptComment, TokenType::JavaScript),
                r.span,
            );
            at = r.span.end_offset;
        }
        self.c
            .tokens
            .push(TokenType::Whitespace, Span::new(at, end_offset));
    }

    /// `range` as one expression, with nothing but whitespace and comments around it.
    fn expression(&mut self, range: Span) -> R<ExpressionIdentifier> {
        let (expression, end) = self
            .builder
            .read_expression_before(range.start_offset, range.end_offset, self.source_type())
            .map_err(javascript_error)?;
        let read = self
            .builder
            .recorded()
            .last()
            .map_or(end, |r| r.span.end_offset.max(end));
        let rest = Span::new(read, range.end_offset);
        if !rest.text(self.source_text).trim_ascii().is_empty() {
            return Err(Diagnostic::error(
                "js_parse_error",
                "Unexpected token",
                rest,
            ));
        }
        self.javascript_region(range.start_offset, range.end_offset);
        Ok(self.builder.keep_expression(expression))
    }

    fn program(&mut self, content: Span) -> R<ProgramIdentifier> {
        let program = self
            .builder
            .program(content, self.source_type())
            .map_err(javascript_error)?;
        self.javascript_region(content.start_offset, content.end_offset);
        Ok(program)
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
}

mod blocks;
mod template;
