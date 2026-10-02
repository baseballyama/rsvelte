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

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::Tokens;
use rsvelte_typescript::parser::{parse_expression, parse_parameters, parse_program};
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};

use crate::syntax_tree::{
    Attribute, AttributeKind, Directive, DirectiveExpression, DirectiveName, LoopExpression, Range,
    Script, SingleFileComponent, Style, TagAttributes, Template, TemplateNode,
    TemplateNodeIdentifier, TokenType,
};

type R<T> = Result<T, Diagnostic>;

/// A directive's name, argument and modifiers.
type ParsedDirective = (DirectiveName, Option<Span>, Box<[Span]>);

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

mod blocks;
mod template;
