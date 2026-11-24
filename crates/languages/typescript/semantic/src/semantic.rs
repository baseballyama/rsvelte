//! Scopes, symbols and references over a document's oxc trees, from `oxc_semantic`.
//!
//! The analysis keeps the trees alive beside it, so its nodes and the trees' nodes are the same
//! references. A host language such as Svelte adds its template through an [`oxc_semantic::Host`],
//! so one [`Scoping`] holds the scripts' and the template's symbols.

use oxc_semantic::{AstNodes, Scoping, SemanticBuilder, SemanticBuilderReturn};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_typescript_tree::scratch::{Arenas, Pool};
use rsvelte_typescript_tree::{Locator, ProgramIdentifier, SyntaxError, Tree};

thread_local! {
    static SCOPING_ARENAS: Arenas = const { Arenas::new(Vec::new()) };
}

/// The arenas of [`Scoping`]s, which are smaller than the trees they analyze.
static SCOPINGS: Pool = Pool::new(&SCOPING_ARENAS);

mod cell;
mod walk;

// Only what the tasks read: the whole `oxc_semantic::Semantic` is not covariant once a crate in
// the build turns on oxc's `jsdoc` feature, as `oxc_linter` does.
struct Analyzed<'a> {
    /// `None` only while [`Semantic`] drops, which takes it to give its scoping arena back.
    scoping: Option<Scoping>,
    nodes: AstNodes<'a>,
    /// The errors a module rejects that the parser does not, in the order acorn meets them:
    /// `delete x`, a name declared twice, an octal escape, ….
    syntax_errors: Box<[SyntaxError]>,
}

impl Analyzed<'_> {
    const fn scoping(&self) -> &Scoping {
        self.scoping.as_ref().expect("taken only while dropping")
    }
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
        // No task reads JSDoc, which `oxc_linter` turns on for the whole build.
        SemanticBuilder::new()
            .with_check_syntax_error(true)
            .with_build_nodes(true)
            .with_build_jsdoc(false)
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
            let syntax_errors = syntax_errors(tree, &analysis);
            let (scoping, nodes) = analysis.semantic.into_scoping_and_nodes();
            Analyzed {
                scoping: Some(scoping),
                nodes,
                syntax_errors,
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

    fn analyzed(&self) -> &Analyzed<'_> {
        self.0.borrow_dependent()
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
        self.javascript_syntax_error()
            .map(|error| &error.diagnostic)
    }

    /// [`Self::syntax_error`], with what acorn reports for it.
    #[must_use]
    pub fn javascript_syntax_error(&self) -> Option<&SyntaxError> {
        self.javascript_syntax_errors().first()
    }

    /// Every error a module rejects that the parser does not report, with what acorn reports for
    /// each, in the order acorn meets them.
    #[must_use]
    pub fn javascript_syntax_errors(&self) -> &[SyntaxError] {
        &self.0.borrow_dependent().syntax_errors
    }

    /// Every node with its parent and scope.
    #[must_use]
    pub fn nodes(&self) -> &AstNodes<'_> {
        &self.analyzed().nodes
    }
}

/// The errors of `analysis` a module rejects that the parser does not, in the order acorn
/// meets them.
fn syntax_errors(tree: &Tree, analysis: &SemanticBuilderReturn<'_>) -> Box<[SyntaxError]> {
    let mut errors = analysis.diagnostics.errors().peekable();
    if errors.peek().is_none() {
        return Box::default();
    }
    // Each error reads only the nodes around and in its labels.
    let nodes = walk::ByStart::new(analysis.semantic.nodes());
    let visit = |locator: &mut Locator| nodes.visit(locator);
    let text = tree.source_text();
    let mut reported: Box<[SyntaxError]> = errors
        .filter(|error| tree.reports(error, visit))
        .map(|error| rsvelte_typescript_tree::analysis_error(error, text, visit))
        .collect();
    // oxc checks the programs one after another, not in the order acorn reads them.
    reported.sort_by_key(SyntaxError::acorn_raised_at);
    reported
}

// The scoping arena goes back to this thread's pool, as the tree's arena does.
impl Drop for Semantic {
    fn drop(&mut self) {
        let scoping = self
            .0
            .with_dependent_mut(|_, analyzed| analyzed.scoping.take());
        if let Some(scoping) = scoping {
            SCOPINGS.give_back(scoping.into_allocator());
        }
    }
}

mod acorn_scope;
mod parts;
pub use parts::empty_program;
#[cfg(test)]
mod tests;
