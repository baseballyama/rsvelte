pub(crate) mod context;
pub(crate) mod script;
pub(crate) mod template;

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_compile::{CompileInput, Target};
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};

/// The component as the Svelte compiler reads it: a runes instance program and a Svelte HIR, in a
/// tree of their own over the `.vue` document's text.
#[derive(Debug)]
pub struct Translation {
    /// The instance program and every expression the HIR names.
    pub javascript: Tree,
    pub program: ProgramIdentifier,
    pub compiler_syntax_tree: rsvelte_svelte_semantic::compiler_syntax_tree::CompilerSyntaxTree,
}

impl Translation {
    #[must_use]
    pub(crate) const fn compile_input<'a>(
        &'a self,
        source_text: &'a str,
        filename: &'a str,
    ) -> CompileInput<'a> {
        CompileInput {
            component: rsvelte_svelte_semantic::input::ComponentInput {
                javascript: &self.javascript,
                instance: Some(self.program),
                module: None,
                compiler_syntax_tree: &self.compiler_syntax_tree,
                style: None,
                source_text,
                filename,
            },
            // Vue's text is already condensed; Svelte's cleaning would condense it again.
            preserve_whitespace: true,
        }
    }
}

/// Translates the Vue plugin's artifacts for one target.
///
/// # Errors
///
/// A `compile_unsupported` [`Diagnostic`] for what svue does not translate (the crate's doc lists
/// every refusal).
pub(crate) fn translate(
    sfc: &rsvelte_vue_syntax::syntax_tree::SingleFileComponent,
    compiler_syntax_tree: Option<&rsvelte_vue_semantic::compiler_syntax_tree::CompilerSyntaxTree>,
    resolution: &rsvelte_vue_semantic::resolve::Resolution,
    source_text: &str,
    target: Target,
) -> Result<Translation, Diagnostic> {
    context::translate(sfc, compiler_syntax_tree, resolution, source_text, target)
}
