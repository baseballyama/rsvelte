//! A document's JavaScript and TypeScript as oxc trees, all in one arena.
//!
//! Every span is an offset into the whole document: a `<script>` element and a template
//! expression parse in place, so the trees and the embedding language share one position type.

#![expect(
    clippy::multiple_crate_versions,
    reason = "oxc's own proc macros need both syn 2 and syn 3"
)]

use oxc_allocator::Allocator;
use oxc_ast::ast::{Expression, Program};
use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::Span;

mod cell {
    #![allow(
        clippy::mem_forget,
        reason = "self_cell's expansion forgets its guard on purpose"
    )]

    use oxc_allocator::Allocator;

    use super::Parsed;

    self_cell::self_cell!(
        pub(super) struct Cell {
            owner: Allocator,
            #[covariant]
            dependent: Parsed,
        }
    );
}

use cell::Cell;

struct Parsed<'a> {
    source_text: &'a str,
    programs: Vec<Program<'a>>,
    expressions: Vec<Expression<'a>>,
}

/// The trees parsed from one document, and the arena that holds them.
pub struct Tree(Cell);

impl std::fmt::Debug for Tree {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let parsed = self.0.borrow_dependent();
        f.debug_struct("Tree")
            .field("programs", &parsed.programs.len())
            .field("expressions", &parsed.expressions.len())
            .finish_non_exhaustive()
    }
}

/// A program parsed by [`Builder::program`].
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ProgramIdentifier(u32);

/// An expression parsed by [`Builder::expression_at`].
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ExpressionIdentifier(u32);

/// Parses parts of one document into its arena.
pub struct Builder<'a> {
    allocator: &'a Allocator,
    source_text: &'a str,
    programs: Vec<Program<'a>>,
    expressions: Vec<Expression<'a>>,
}

impl Tree {
    /// Copies the document's text into a new arena, and lets `parse` read the parts it needs.
    ///
    /// # Errors
    ///
    /// The first error `parse` returns.
    pub fn build(
        document: &Document,
        parse: impl for<'a> FnOnce(&mut Builder<'a>) -> Result<(), Diagnostic>,
    ) -> Result<Self, Diagnostic> {
        Cell::try_new(Allocator::default(), |allocator| {
            let mut builder = Builder {
                allocator,
                source_text: allocator.alloc_str(&document.text),
                programs: Vec::new(),
                expressions: Vec::new(),
            };
            parse(&mut builder)?;
            Ok(Parsed {
                source_text: builder.source_text,
                programs: builder.programs,
                expressions: builder.expressions,
            })
        })
        .map(Self)
    }

    /// A document that is one program, such as a `.ts` file.
    ///
    /// # Errors
    ///
    /// The first syntax error.
    pub fn program(document: &Document, source_type: SourceType) -> Result<Self, Diagnostic> {
        Self::build(document, |builder| {
            builder
                .parse_program(builder.source_text, 0, source_type)
                .map(drop)
        })
    }

    #[must_use]
    pub fn source_text(&self) -> &str {
        self.0.borrow_dependent().source_text
    }

    #[must_use]
    pub fn get_program(&self, identifier: ProgramIdentifier) -> &Program<'_> {
        &self.0.borrow_dependent().programs[identifier.0 as usize]
    }

    #[must_use]
    pub fn get_expression(&self, identifier: ExpressionIdentifier) -> &Expression<'_> {
        &self.0.borrow_dependent().expressions[identifier.0 as usize]
    }
}

impl std::fmt::Debug for Builder<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Builder")
            .field("programs", &self.programs.len())
            .field("expressions", &self.expressions.len())
            .finish_non_exhaustive()
    }
}

impl<'a> Builder<'a> {
    /// Parses `range` of the document as a program, such as the body of a `<script>` element.
    ///
    /// # Errors
    ///
    /// The first syntax error.
    pub fn program(
        &mut self,
        range: Span,
        source_type: SourceType,
    ) -> Result<ProgramIdentifier, Diagnostic> {
        let text = &self.source_text[..range.end_offset as usize];
        self.parse_program(text, range.start_offset, source_type)
    }

    /// Parses `text[start..]`, where `text` is the document up to the program's end.
    fn parse_program(
        &mut self,
        text: &'a str,
        start: u32,
        source_type: SourceType,
    ) -> Result<ProgramIdentifier, Diagnostic> {
        let parsed = Parser::new(self.allocator, text, source_type)
            .with_start(start)
            .parse();
        if !parsed.diagnostics.is_empty() {
            return Err(diagnostic(parsed.diagnostics, start));
        }
        let identifier = ProgramIdentifier(identifier(self.programs.len()));
        self.programs.push(parsed.program);
        Ok(identifier)
    }

    /// Parses the expression that starts at `start`, and returns where it ends.
    ///
    /// # Errors
    ///
    /// The first syntax error in the expression.
    pub fn expression_at(
        &mut self,
        start: u32,
        source_type: SourceType,
    ) -> Result<(ExpressionIdentifier, u32), Diagnostic> {
        let (expression, end) = Parser::new(self.allocator, self.source_text, source_type)
            .parse_expression_at(start)
            .map_err(|errors| diagnostic(errors, start))?;
        let identifier = ExpressionIdentifier(identifier(self.expressions.len()));
        self.expressions.push(expression);
        Ok((identifier, end))
    }
}

/// A list index as an identifier: a document holds fewer than `u32::MAX` bytes, so fewer parts.
fn identifier(index: usize) -> u32 {
    u32::try_from(index).expect("a document has fewer than u32::MAX parts")
}

/// The first error, at the place oxc labels, or at `fallback` when it labels none.
fn diagnostic(errors: impl IntoIterator<Item = OxcDiagnostic>, fallback: u32) -> Diagnostic {
    let Some(error) = errors.into_iter().next() else {
        return Diagnostic::error(
            "parse_error",
            "invalid syntax",
            Span::new(fallback, fallback),
        );
    };
    let span = error.labels.first().map_or_else(
        || Span::new(fallback, fallback),
        |label| Span::new(label.offset(), label.offset() + label.len()),
    );
    Diagnostic::error("parse_error", error.message.to_string(), span)
}

#[cfg(test)]
mod tests;
