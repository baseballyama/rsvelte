//! Scopes, symbols and references over a document's oxc trees, from `oxc_semantic`.
//!
//! The analysis keeps the trees alive beside it, so its nodes and the trees' nodes are the same
//! references. A host language such as Svelte adds its template through an [`oxc_semantic::Host`],
//! so one [`Scoping`] holds the scripts' and the template's symbols.

use oxc_semantic::{AstNodes, Scoping, SemanticBuilder, SemanticBuilderReturn};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_typescript_tree::scratch::{Arenas, Pool};
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};

thread_local! {
    static SCOPING_ARENAS: Arenas = const { Arenas::new(Vec::new()) };
}

/// The arenas of [`Scoping`]s, which are smaller than the trees they analyze.
static SCOPINGS: Pool = Pool::new(&SCOPING_ARENAS);

mod cell {
    #![allow(
        clippy::mem_forget,
        reason = "self_cell's expansion forgets its guard on purpose"
    )]

    use rsvelte_typescript_tree::Tree;

    use super::Analyzed;

    self_cell::self_cell!(
        pub(super) struct Cell {
            owner: Tree,
            #[covariant]
            dependent: Analyzed,
        }
    );
}

struct Analyzed<'a> {
    /// `None` only while [`Semantic`] drops, which takes it to give its scoping arena back.
    semantic: Option<oxc_semantic::Semantic<'a>>,
    /// The first error a module rejects that the parser does not: `delete x`, a name declared
    /// twice, an octal escape, ….
    syntax_error: Option<Diagnostic>,
}

/// The scope analysis of one document.
pub struct Semantic(cell::Cell);

impl std::fmt::Debug for Semantic {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let scoping = self.scoping();
        f.debug_struct("Semantic")
            .field("scopes", &scoping.scopes_len())
            .field("symbols", &scoping.symbols_len())
            .finish_non_exhaustive()
    }
}

impl Semantic {
    /// The builder every analysis starts from: it reports the errors the parsers leave to it,
    /// and the tasks walk to parents.
    #[must_use]
    pub fn builder<'a>() -> SemanticBuilder<'a> {
        SemanticBuilder::new()
            .with_check_syntax_error(true)
            .with_build_nodes(true)
    }

    /// Analyzes what `build` reads of `tree`, which the analysis keeps alive. `build` may adjust
    /// what the builder returns, such as a host language's writes the builder cannot see.
    pub fn build(
        tree: Tree,
        build: impl for<'a> FnOnce(&'a Tree, SemanticBuilder<'a>) -> SemanticBuilderReturn<'a>,
    ) -> Self {
        Self(cell::Cell::new(tree, |tree| {
            let builder = Self::builder().with_scoping_allocator(SCOPINGS.take());
            let analysis = build(tree, builder);
            let syntax_error = analysis.diagnostics.errors().next().map(|error| {
                rsvelte_typescript_tree::syntax_error([error.clone()], 0, 0).diagnostic
            });
            Analyzed {
                semantic: Some(analysis.semantic),
                syntax_error,
            }
        }))
    }

    /// Analyzes one program of `tree`, such as a `.ts` file.
    #[must_use]
    pub fn program(tree: Tree, program: ProgramIdentifier) -> Self {
        Self::build(tree, |tree, builder| {
            builder.build(tree.get_program(program))
        })
    }

    fn analyzed(&self) -> &oxc_semantic::Semantic<'_> {
        let semantic = self.0.borrow_dependent().semantic.as_ref();
        semantic.expect("taken only while dropping")
    }

    #[must_use]
    pub fn tree(&self) -> &Tree {
        self.0.borrow_owner()
    }

    #[must_use]
    pub fn scoping(&self) -> &Scoping {
        self.analyzed().scoping()
    }

    /// The first error a module rejects that the parser does not report.
    #[must_use]
    pub fn syntax_error(&self) -> Option<&Diagnostic> {
        self.0.borrow_dependent().syntax_error.as_ref()
    }

    /// Every node with its parent and scope.
    #[must_use]
    pub fn nodes(&self) -> &AstNodes<'_> {
        self.analyzed().nodes()
    }
}

// The scoping arena goes back to this thread's pool, as the tree's arena does.
impl Drop for Semantic {
    fn drop(&mut self) {
        let semantic = self
            .0
            .with_dependent_mut(|_, analyzed| analyzed.semantic.take());
        if let Some(semantic) = semantic {
            SCOPINGS.give_back(semantic.into_scoping().into_allocator());
        }
    }
}

#[cfg(test)]
mod tests;
