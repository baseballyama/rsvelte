//! A document's JavaScript and TypeScript as oxc trees, all in one arena.
//!
//! Every span is an offset into the whole document: a `<script>` element and a template
//! expression parse in place, so the trees and the embedding language share one position type.

use std::rc::Rc;

use oxc_allocator::Allocator;
use oxc_ast::ast::{
    Comment, Expression, FormalParameter, FormalParameters, Program, TSTypeParameterDeclaration,
    VariableDeclaration,
};
use oxc_diagnostics::OxcDiagnostic;
use oxc_span::SourceType;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::index::IndexVector;
use rsvelte_kernel::source::document::Document;

mod acorn_grammar;
mod builder;
pub use builder::{Holes, Recorded, RecordedPart, Rejected, TreeBuilder, WithHoles};
mod syntax_error;
pub use syntax_error::{
    Acorn, Locator, Reader, SyntaxError, TYPESCRIPT_ESLINT_UNCHECKED, analysis_error,
    babel_typescript_throws, function_as_body, syntax_error, typescript_eslint_check,
    typescript_eslint_error, typescript_estree_throws,
};

pub mod scratch;
pub use scratch::with_scratch_arena;

mod cell;

use cell::Cell;

/// The cell, which gives its arena back to the thread once no [`Tree`] shares it.
struct Kept(Option<Cell>);

impl std::ops::Deref for Kept {
    type Target = Cell;

    fn deref(&self) -> &Cell {
        self.0
            .as_ref()
            .expect("the cell is taken only when it drops")
    }
}

impl Drop for Kept {
    fn drop(&mut self) {
        if let Some(cell) = self.0.take() {
            scratch::TREES.give_back(cell.into_owner());
        }
    }
}

/// What few documents have.
struct Rare {
    acorn_rejection: Option<(u32, acorn_grammar::Rejection)>,
    /// How many pairs of parentheses wrapped each node that had any where upstream's parser keeps
    /// them, sorted by span.
    parentheses: Vec<(oxc_span::Span, u8)>,
}

struct Trees<'a> {
    source_text: &'a str,
    /// Each program, with the tokens oxc read in it, which stay in the arena anyway.
    programs: IndexVector<ProgramIdentifier, (Program<'a>, &'a [oxc_parser::Token])>,
    expressions: IndexVector<ExpressionIdentifier, Expression<'a>>,
    patterns: IndexVector<PatternIdentifier, FormalParameter<'a>>,
    parameters: IndexVector<ParametersIdentifier, FormalParameters<'a>>,
    declarations: IndexVector<DeclarationIdentifier, VariableDeclaration<'a>>,
    type_parameters: IndexVector<TypeParametersIdentifier, TSTypeParameterDeclaration<'a>>,
    /// The comments of every part but the programs, which keep their own, in document order.
    comments: Vec<Comment>,
    /// Boxed, so that a document with neither costs one pointer in every tree.
    rare: Option<Box<Rare>>,
    /// Behind a reference, so that it and the errors below take the place of one slice.
    unchecked: &'static &'static [&'static str],
    /// The errors oxc reported in the parts that the host lets pass, in order; boxed, as almost no
    /// document has one.
    #[expect(
        clippy::box_collection,
        reason = "a thin pointer keeps every tree one word smaller"
    )]
    unchecked_errors: Option<Box<Vec<SyntaxError>>>,
    as_acorn: bool,
}

/// The trees parsed from one document, and the arena that holds them.
///
/// Cloning shares them, so that a task such as scope analysis can keep them alive beside what it
/// derives.
#[derive(Clone)]
pub struct Tree(Rc<Kept>);

impl std::fmt::Debug for Tree {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let parsed = self.0.borrow_dependent();
        f.debug_struct("Tree")
            .field("programs", &parsed.programs.len())
            .field("expressions", &parsed.expressions.len())
            .finish_non_exhaustive()
    }
}

rsvelte_kernel::newtype_index!(
    /// A program parsed by [`TreeBuilder::program`].
    pub struct ProgramIdentifier;
);
rsvelte_kernel::newtype_index!(
    /// An expression a [`TreeBuilder`] keeps.
    pub struct ExpressionIdentifier;
);
rsvelte_kernel::newtype_index!(
    /// A binding pattern with its type annotation, parsed by [`TreeBuilder::pattern`].
    pub struct PatternIdentifier;
);
rsvelte_kernel::newtype_index!(
    /// A parameter list parsed by [`TreeBuilder::parameters`].
    pub struct ParametersIdentifier;
);
rsvelte_kernel::newtype_index!(
    /// A variable declaration kept by [`TreeBuilder::keep_declaration`].
    pub struct DeclarationIdentifier;
);
rsvelte_kernel::newtype_index!(
    /// A type parameter list parsed by [`TreeBuilder::type_parameters`].
    pub struct TypeParametersIdentifier;
);

impl Tree {
    /// Copies `source_text` into a new arena, and lets `parse` read the parts it needs.
    ///
    /// # Errors
    ///
    /// The first error `parse` returns.
    pub fn build<T>(
        source_text: &str,
        parse: impl for<'a> FnOnce(&mut TreeBuilder<'a>) -> Result<T, Diagnostic>,
    ) -> Result<(Self, T), Diagnostic> {
        Self::build_keeping_parts(source_text, parse).map_err(|(error, _)| error)
    }

    /// [`Self::build`], which keeps on an error the parts `parse` read before it, for a host
    /// whose parser raises errors in them before the one `parse` returns.
    ///
    /// # Errors
    ///
    /// The first error `parse` returns, and the trees of the parts it read.
    #[expect(
        clippy::missing_panics_doc,
        reason = "`parse` has returned once the cell is built"
    )]
    pub fn build_keeping_parts<T>(
        source_text: &str,
        parse: impl for<'a> FnOnce(&mut TreeBuilder<'a>) -> Result<T, Diagnostic>,
    ) -> Result<(Self, T), (Diagnostic, Self)> {
        let mut output = None;
        let cell = Cell::new(scratch::TREES.take(), |allocator| {
            let mut builder = TreeBuilder::new(allocator, allocator.alloc_str(source_text));
            output = Some(parse(&mut builder));
            builder.finish()
        });
        let tree = Self(Rc::new(Kept(Some(cell))));
        match output.expect("`parse` returned") {
            Ok(output) => Ok((tree, output)),
            Err(error) => Err((error, tree)),
        }
    }

    /// A document that is one program, such as a `.ts` file.
    ///
    /// # Errors
    ///
    /// The first syntax error.
    pub fn program(
        document: &Document,
        source_type: SourceType,
    ) -> Result<(Self, ProgramIdentifier), Diagnostic> {
        Self::build(&document.text, |builder| {
            let whole =
                rsvelte_kernel::source::positions::Span::new(0, builder.source_text().len() as u32);
            builder
                .program(whole, source_type)
                .map_err(Diagnostic::from)
        })
    }

    /// The arena the trees live in, where a task such as the formatter allocates what it builds.
    #[must_use]
    pub fn allocator(&self) -> &Allocator {
        self.0.borrow_owner()
    }

    #[must_use]
    pub fn source_text(&self) -> &str {
        self.0.borrow_dependent().source_text
    }

    /// acorn's error at the first syntax oxc parsed and acorn does not, when the builder noted it.
    #[must_use]
    pub fn acorn_rejection(&self) -> Option<SyntaxError> {
        (self.0.borrow_dependent().rare.as_ref())
            .and_then(|rare| rare.acorn_rejection)
            .map(acorn_grammar::rejection)
    }

    /// The syntax errors oxc reported in the parts that the host the builder read for lets pass,
    /// which another reader of them, such as typescript-eslint or Babel, may throw on.
    #[must_use]
    pub fn unchecked_errors(&self) -> &[SyntaxError] {
        self.0
            .borrow_dependent()
            .unchecked_errors
            .as_deref()
            .map_or(&[], Vec::as_slice)
    }

    /// Whether the host the builder read for reports `error`, an error of an analysis of the
    /// trees whose nodes `visit` hands to [`Locator::enter`].
    #[must_use]
    pub fn reports(&self, error: &OxcDiagnostic, visit: impl FnOnce(&mut Locator)) -> bool {
        let trees = self.0.borrow_dependent();
        syntax_error::reported(error, trees.unchecked, trees.as_acorn, visit)
    }

    #[must_use]
    pub fn get_program(&self, identifier: ProgramIdentifier) -> &Program<'_> {
        &self.0.borrow_dependent().programs[identifier].0
    }

    /// The tokens of a program, comments excluded, in document order; none for a program a host
    /// built.
    #[must_use]
    pub fn get_program_tokens(&self, identifier: ProgramIdentifier) -> &[oxc_parser::Token] {
        self.0.borrow_dependent().programs[identifier].1
    }

    #[must_use]
    pub fn get_expression(&self, identifier: ExpressionIdentifier) -> &Expression<'_> {
        &self.0.borrow_dependent().expressions[identifier]
    }

    #[must_use]
    pub fn get_pattern(&self, identifier: PatternIdentifier) -> &FormalParameter<'_> {
        &self.0.borrow_dependent().patterns[identifier]
    }

    #[must_use]
    pub fn get_parameters(&self, identifier: ParametersIdentifier) -> &FormalParameters<'_> {
        &self.0.borrow_dependent().parameters[identifier]
    }

    #[must_use]
    pub fn get_declaration(&self, identifier: DeclarationIdentifier) -> &VariableDeclaration<'_> {
        &self.0.borrow_dependent().declarations[identifier]
    }

    #[must_use]
    pub fn get_type_parameters(
        &self,
        identifier: TypeParametersIdentifier,
    ) -> &TSTypeParameterDeclaration<'_> {
        &self.0.borrow_dependent().type_parameters[identifier]
    }

    /// Every program, with its identifier, in the order kept.
    pub fn programs(&self) -> impl ExactSizeIterator<Item = (ProgramIdentifier, &Program<'_>)> {
        (self.0.borrow_dependent().programs.iter_enumerated())
            .map(|(identifier, (program, _))| (identifier, program))
    }

    /// Every expression kept apart from a program, with its identifier, in the order kept.
    pub fn expressions(
        &self,
    ) -> impl ExactSizeIterator<Item = (ExpressionIdentifier, &Expression<'_>)> {
        self.0.borrow_dependent().expressions.iter_enumerated()
    }

    /// Every declaration kept apart from a program, with its identifier, in the order kept.
    pub fn declarations(
        &self,
    ) -> impl ExactSizeIterator<Item = (DeclarationIdentifier, &VariableDeclaration<'_>)> {
        self.0.borrow_dependent().declarations.iter_enumerated()
    }

    /// Every pattern kept apart from a program, with its identifier, in the order kept.
    pub fn patterns(
        &self,
    ) -> impl ExactSizeIterator<Item = (PatternIdentifier, &FormalParameter<'_>)> {
        self.0.borrow_dependent().patterns.iter_enumerated()
    }

    /// Every parameter list kept apart from a program, with its identifier, in the order kept.
    pub fn parameters(
        &self,
    ) -> impl ExactSizeIterator<Item = (ParametersIdentifier, &FormalParameters<'_>)> {
        self.0.borrow_dependent().parameters.iter_enumerated()
    }

    /// Every type parameter list kept apart from a program, with its identifier, in the order
    /// kept.
    pub fn type_parameters(
        &self,
    ) -> impl ExactSizeIterator<Item = (TypeParametersIdentifier, &TSTypeParameterDeclaration<'_>)>
    {
        self.0.borrow_dependent().type_parameters.iter_enumerated()
    }

    /// The comments outside the programs, in document order.
    #[must_use]
    pub fn comments(&self) -> &[Comment] {
        &self.0.borrow_dependent().comments
    }

    /// Whether any node upstream's parser keeps parentheses around had them.
    #[must_use]
    pub fn has_parentheses(&self) -> bool {
        self.parentheses_table()
            .is_some_and(|table| !table.is_empty())
    }

    /// How many pairs of parentheses the source wrapped around the node at `span`, in a snippet's
    /// parameters or around a `bind:` value, the places upstream's parser keeps them.
    #[must_use]
    pub fn parentheses(&self, span: oxc_span::Span) -> u8 {
        let Some(parentheses) = self.parentheses_table() else {
            return 0;
        };
        parentheses
            .binary_search_by_key(&(span.start, span.end), |&(s, _)| (s.start, s.end))
            .map_or(0, |i| parentheses[i].1)
    }

    fn parentheses_table(&self) -> Option<&[(oxc_span::Span, u8)]> {
        let rare = self.0.borrow_dependent().rare.as_deref()?;
        Some(&rare.parentheses)
    }
}

mod computation;
pub use computation::{Parsed, Script, is_jsx, is_typescript, matches, register};

/// The document span of an oxc node, whose offsets are already the document's.
#[must_use]
pub const fn document_span(span: oxc_span::Span) -> rsvelte_kernel::source::positions::Span {
    rsvelte_kernel::source::positions::Span::new(span.start, span.end)
}

/// The document span of an oxc node.
#[must_use]
pub fn node_span(node: &impl oxc_span::GetSpan) -> rsvelte_kernel::source::positions::Span {
    document_span(node.span())
}

/// Upstream's `regex_is_valid_identifier` and `regex_valid_identifier`, both
/// `/^[a-zA-Z_$][a-zA-Z_$0-9]*$/`: an ASCII-only name that can follow a `.`.
#[must_use]
pub fn is_valid_identifier(name: &str) -> bool {
    let mut chars = name.chars();
    chars
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}

#[cfg(test)]
mod tests;
