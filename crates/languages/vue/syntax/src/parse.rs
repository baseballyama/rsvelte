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
use rsvelte_markup_syntax::is_void;
use rsvelte_markup_syntax::script_language::parse_guessing_typescript;
use rsvelte_typescript_tree::{ExpressionIdentifier, ProgramIdentifier, Tree, TreeBuilder};

use crate::syntax_tree::{
    Attribute, AttributeKind, Directive, DirectiveExpression, DirectiveName, LoopExpression, Range,
    Script, SingleFileComponent, Style, TagAttributes, Template, TemplateNode,
    TemplateNodeIdentifier, TokenType,
};

type R<T> = Result<T, Diagnostic>;

/// # Errors
///
/// A `parse_error` [`Diagnostic`] at the first syntax error, or at syntax this parser does not
/// support; `js_parse_error` or the style sheet's Svelte error from the embedded parsers.
pub fn parse(source_text: &str) -> R<SingleFileComponent> {
    parse_guessing_typescript(source_text, |typescript| parse_as(source_text, typescript))
}

/// The component, its expressions read as TypeScript or not, and the language its script gives
/// it once read.
fn parse_as(source_text: &str, typescript: bool) -> (R<SingleFileComponent>, Option<bool>) {
    let mut lang_read = None;
    let parsed = Tree::build(source_text, |builder| {
        let mut p = Parser {
            source_text: builder.source_text(),
            b: source_text.as_bytes(),
            position: 0,
            builder,
            markup: Markup {
                nodes: Vec::new(),
                children: Vec::new(),
                attributes: Vec::new(),
                template: None,
                script: None,
                styles: Vec::new(),
                typescript,
                tokens: Tokens::with_capacity(source_text.len() / 4),
            },
            lang_read: None,
        };
        let blocks = p.blocks();
        lang_read = p.lang_read;
        blocks?;
        let program = match &p.markup.script {
            Some(s) => s.program,
            None => p
                .builder
                .program(Span::new(0, 0), p.source_type())
                .map_err(javascript_error)?,
        };
        Ok((p.markup, program))
    });
    let component = parsed.map(|(javascript, (markup, program))| SingleFileComponent {
        javascript,
        nodes: markup.nodes,
        children: markup.children,
        attributes: markup.attributes,
        template: markup.template,
        script: markup.script,
        program,
        styles: markup.styles,
        typescript: markup.typescript,
        tokens: markup.tokens,
    });
    (component, lang_read)
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

struct Parser<'a, 'b> {
    source_text: &'a str,
    b: &'b [u8],
    position: usize,
    builder: &'b mut TreeBuilder<'a>,
    markup: Markup,
    /// The language the script's `lang` gives the component, once the script is read.
    lang_read: Option<bool>,
}

impl<'a> Parser<'a, '_> {
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
        self.markup
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
        if self.markup.typescript {
            SourceType::ts()
        } else {
            SourceType::mjs()
        }
    }

    /// Copies what the JavaScript parser recorded for the part read last, which lies in
    /// `start_offset..end_offset`, into the component's tokens.
    fn javascript_region(&mut self, start_offset: u32, end_offset: u32) {
        let mut at = start_offset;
        for r in self.builder.recorded().iter() {
            self.markup
                .tokens
                .push(TokenType::Whitespace, Span::new(at, r.span.start_offset));
            self.markup.tokens.push(
                r.kind
                    .map_or(TokenType::JavaScriptComment, TokenType::JavaScript),
                r.span,
            );
            at = r.span.end_offset;
        }
        self.markup
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
            .end()
            .map_or(end, |recorded| recorded.max(end));
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
        self.markup.nodes.push(n);
        (self.markup.nodes.len() - 1) as TemplateNodeIdentifier
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

#[cfg(test)]
mod tests;
