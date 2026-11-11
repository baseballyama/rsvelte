//! A document's JavaScript and TypeScript as oxc trees, all in one arena.
//!
//! Every span is an offset into the whole document: a `<script>` element and a template
//! expression parse in place, so the trees and the embedding language share one position type.

use std::num::NonZeroU32;
use std::rc::Rc;

use oxc_allocator::Allocator;
use oxc_ast::ast::{
    Comment, Expression, FormalParameter, FormalParameters, Program, VariableDeclaration,
};
use oxc_span::SourceType;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;

mod builder;
pub use builder::{Builder, Recorded, syntax_error};

mod cell {
    #![allow(
        clippy::mem_forget,
        reason = "self_cell's expansion forgets its guard on purpose"
    )]

    use oxc_allocator::Allocator;

    use super::Trees;

    self_cell::self_cell!(
        pub(super) struct Cell {
            owner: Allocator,
            #[covariant]
            dependent: Trees,
        }
    );
}

use cell::Cell;

struct Trees<'a> {
    source_text: &'a str,
    programs: Vec<Program<'a>>,
    expressions: Vec<Expression<'a>>,
    patterns: Vec<FormalParameter<'a>>,
    parameters: Vec<FormalParameters<'a>>,
    declarations: Vec<VariableDeclaration<'a>>,
    /// The comments of every part but the programs, which keep their own, in document order.
    comments: Vec<Comment>,
}

/// The trees parsed from one document, and the arena that holds them.
///
/// Cloning shares them, so that a task such as scope analysis can keep them alive beside what it
/// derives.
#[derive(Clone)]
pub struct Tree(Rc<Cell>);

impl std::fmt::Debug for Tree {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let parsed = self.0.borrow_dependent();
        f.debug_struct("Tree")
            .field("programs", &parsed.programs.len())
            .field("expressions", &parsed.expressions.len())
            .finish_non_exhaustive()
    }
}

macro_rules! identifier {
    ($(#[$doc:meta])* $name:ident) => {
        $(#[$doc])*
        #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
        pub struct $name(NonZeroU32);

        impl $name {
            /// The identifier of the part at `index` of its list.
            fn at(index: usize) -> Self {
                let index = u32::try_from(index).expect("a document has fewer than u32::MAX parts");
                Self(NonZeroU32::MIN.saturating_add(index))
            }

            const fn index(self) -> usize {
                (self.0.get() - 1) as usize
            }
        }
    };
}

identifier!(
    /// A program parsed by [`Builder::program`].
    ProgramIdentifier
);
identifier!(
    /// An expression parsed by [`Builder::expression_at`].
    ExpressionIdentifier
);
identifier!(
    /// A binding pattern with its type annotation, parsed by [`Builder::pattern`].
    PatternIdentifier
);
identifier!(
    /// A parameter list parsed by [`Builder::parameters`].
    ParametersIdentifier
);
identifier!(
    /// A variable declaration kept by [`Builder::keep_declaration`].
    DeclarationIdentifier
);

impl Tree {
    /// Copies `source_text` into a new arena, and lets `parse` read the parts it needs.
    ///
    /// # Errors
    ///
    /// The first error `parse` returns.
    #[expect(
        clippy::missing_panics_doc,
        reason = "the arena is kept only after `parse` has returned its output"
    )]
    pub fn build<T>(
        source_text: &str,
        parse: impl for<'a> FnOnce(&mut Builder<'a>) -> Result<T, Diagnostic>,
    ) -> Result<(Self, T), Diagnostic> {
        let mut output = None;
        let cell = Cell::try_new(Allocator::default(), |allocator| {
            let mut builder = Builder::new(allocator, allocator.alloc_str(source_text));
            output = Some(parse(&mut builder)?);
            Ok::<_, Diagnostic>(builder.finish())
        })?;
        Ok((Self(Rc::new(cell)), output.expect("`parse` returned")))
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
            let text = builder.source_text();
            builder.parse_program(text, 0, source_type)
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

    #[must_use]
    pub fn get_program(&self, identifier: ProgramIdentifier) -> &Program<'_> {
        &self.0.borrow_dependent().programs[identifier.index()]
    }

    #[must_use]
    pub fn get_expression(&self, identifier: ExpressionIdentifier) -> &Expression<'_> {
        &self.0.borrow_dependent().expressions[identifier.index()]
    }

    #[must_use]
    pub fn get_pattern(&self, identifier: PatternIdentifier) -> &FormalParameter<'_> {
        &self.0.borrow_dependent().patterns[identifier.index()]
    }

    #[must_use]
    pub fn get_parameters(&self, identifier: ParametersIdentifier) -> &FormalParameters<'_> {
        &self.0.borrow_dependent().parameters[identifier.index()]
    }

    #[must_use]
    pub fn get_declaration(&self, identifier: DeclarationIdentifier) -> &VariableDeclaration<'_> {
        &self.0.borrow_dependent().declarations[identifier.index()]
    }

    /// Every expression kept apart from a program, with its identifier, in the order kept.
    pub fn expressions(
        &self,
    ) -> impl ExactSizeIterator<Item = (ExpressionIdentifier, &Expression<'_>)> {
        let expressions = &self.0.borrow_dependent().expressions;
        expressions
            .iter()
            .enumerate()
            .map(|(i, e)| (ExpressionIdentifier::at(i), e))
    }

    /// Every declaration kept apart from a program, with its identifier, in the order kept.
    pub fn declarations(
        &self,
    ) -> impl ExactSizeIterator<Item = (DeclarationIdentifier, &VariableDeclaration<'_>)> {
        let declarations = &self.0.borrow_dependent().declarations;
        declarations
            .iter()
            .enumerate()
            .map(|(i, d)| (DeclarationIdentifier::at(i), d))
    }

    /// Every pattern kept apart from a program, with its identifier, in the order kept.
    pub fn patterns(
        &self,
    ) -> impl ExactSizeIterator<Item = (PatternIdentifier, &FormalParameter<'_>)> {
        let patterns = &self.0.borrow_dependent().patterns;
        patterns
            .iter()
            .enumerate()
            .map(|(i, p)| (PatternIdentifier::at(i), p))
    }

    /// Every parameter list kept apart from a program, with its identifier, in the order kept.
    pub fn parameters(
        &self,
    ) -> impl ExactSizeIterator<Item = (ParametersIdentifier, &FormalParameters<'_>)> {
        let parameters = &self.0.borrow_dependent().parameters;
        parameters
            .iter()
            .enumerate()
            .map(|(i, p)| (ParametersIdentifier::at(i), p))
    }

    /// The comments outside the programs, in document order.
    #[must_use]
    pub fn comments(&self) -> &[Comment] {
        &self.0.borrow_dependent().comments
    }
}

mod computation;
pub use computation::{PLUGIN, Parsed, Script, is_jsx, is_typescript, matches, register};

#[cfg(test)]
mod tests;
