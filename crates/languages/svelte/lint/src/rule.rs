//! What a rule implements, built in or from a plugin.

use oxc_semantic::AstNodes;
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Contribution;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_semantic::compiler_syntax_tree::CompilerSyntaxTree;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_semantic::warnings::CompileWarnings;
use rsvelte_svelte_semantic::{Lowered, Resolved, Warned};
use rsvelte_svelte_syntax::Parsed;
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::{ProgramIdentifier, Script, Tree};

use crate::computation::{
    ConditionTypes, ModuleSemantic, NativeConditionTypes, SvelteConfiguration, SvelteKit,
};
use crate::project::SvelteKitProject;
use crate::types::TypeFacts;
use crate::{LintSettings, SvelteConfig};

/// A configured rule. It holds its options and the settings it needs.
pub trait SvelteRule: Send + Sync + std::fmt::Debug {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>);
}

/// A rule as configuration names it.
#[derive(Debug)]
pub struct RuleDefinition {
    /// The full name, such as `svelte/no-at-html-tags`.
    pub name: &'static str,
    pub files: Files,
    /// Reads `ESLint`'s options after the level and returns the configured rule.
    pub configure: fn(&RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String>,
}

impl rsvelte_lint_runner::catalog::Definition for RuleDefinition {
    fn name(&self) -> &'static str {
        self.name
    }
}

/// Which documents a rule runs on.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Files {
    Components,
    /// Components and JavaScript or TypeScript modules, `.svelte.js` included.
    All,
}

/// Rules a plugin adds. Each rule's name is `<prefix>/<rule>`.
pub type LintPlugin = rsvelte_lint_runner::catalog::Plugin<RuleDefinition>;

/// The [`Contribution`] list of plugin rules; a plugin adds to it before `svelte.lint` installs.
#[derive(Debug)]
pub struct LintPlugins;

impl Contribution for LintPlugins {
    type Item = &'static LintPlugin;
}

/// A rule's options: `ESLint`'s entry without its level, and the shared settings.
pub type RuleOptions<'a> = rsvelte_lint_runner::catalog::RuleOptions<'a, LintSettings>;

/// The document a rule checks. Each fact is computed on first request and shared by the rules.
#[derive(Debug)]
pub struct File<'a> {
    pub context: &'a DocumentContext<'a>,
    parsed: Source<'a>,
}

#[derive(Debug)]
enum Source<'a> {
    Component(&'a Component),
    Module(&'a Script),
}

impl<'a> File<'a> {
    /// A parsed component or module.
    ///
    /// # Errors
    ///
    /// The source does not parse.
    pub fn new(context: &'a DocumentContext<'a>) -> Result<Self, Diagnostic> {
        let parsed = if rsvelte_svelte_syntax::matches(context.document) {
            Source::Component(context.get::<Parsed>().as_ref().map_err(Clone::clone)?)
        } else {
            Source::Module(
                context
                    .get::<rsvelte_typescript_tree::Parsed>()
                    .as_ref()
                    .map_err(Clone::clone)?,
            )
        };
        Ok(Self { context, parsed })
    }

    #[must_use]
    pub fn source(&self) -> &'a str {
        self.context.source_text()
    }

    #[must_use]
    pub fn path(&self) -> &'a str {
        &self.context.document.path
    }

    /// A `.svelte.js` or `.svelte.ts` module, whose runes Svelte compiles.
    #[must_use]
    pub fn is_svelte_module(&self) -> bool {
        !self.is_component()
            && [".svelte.js", ".svelte.ts"]
                .iter()
                .any(|suffix| self.path().ends_with(suffix))
    }

    #[must_use]
    pub const fn is_component(&self) -> bool {
        matches!(self.parsed, Source::Component(_))
    }

    /// The component's surface tree; `None` for a module.
    #[must_use]
    pub const fn component(&self) -> Option<&'a Component> {
        match self.parsed {
            Source::Component(component) => Some(component),
            Source::Module(_) => None,
        }
    }

    /// A module's program; `None` for a component.
    #[must_use]
    pub const fn module(&self) -> Option<&'a Script> {
        match self.parsed {
            Source::Module(module) => Some(module),
            Source::Component(_) => None,
        }
    }

    /// The component's compiler tree; `None` for a module.
    #[must_use]
    pub fn normalized(&self) -> Option<&'a CompilerSyntaxTree> {
        self.component()?;
        self.context.get::<Lowered>().as_ref()
    }

    /// The compiler's warnings and analysis errors of the component; `None` for a module.
    #[must_use]
    pub fn compile_warnings(&self) -> Option<&'a CompileWarnings> {
        self.component()?;
        self.context.get::<Warned>().as_ref()
    }

    /// The component's resolution: scopes with the template's bindings; `None` for a module.
    #[must_use]
    pub fn resolution(&self) -> Option<&'a Resolution> {
        self.component()?;
        self.context.get::<Resolved>().as_ref()
    }

    /// The JavaScript of the document: a component's scripts and template expressions, or a
    /// module's program. A node's `node_id` is the analysis's only after [`File::semantic`].
    #[must_use]
    pub const fn javascript(&self) -> &'a Tree {
        match self.parsed {
            Source::Component(component) => &component.javascript,
            Source::Module(module) => &module.tree,
        }
    }

    /// The programs of the document in source order: a component's `<script module>` and
    /// `<script>`, or a module's one program.
    #[must_use]
    pub fn programs(&self) -> Vec<ProgramIdentifier> {
        match self.parsed {
            Source::Component(component) => {
                let mut scripts: Vec<_> =
                    component.module.iter().chain(&component.instance).collect();
                scripts.sort_by_key(|script| script.span.start_offset);
                scripts.iter().map(|script| script.program).collect()
            }
            Source::Module(module) => vec![module.root],
        }
    }

    /// Scopes over [`File::javascript`].
    ///
    /// # Panics
    ///
    /// Never: a parsed document resolves.
    #[must_use]
    pub fn semantic(&self) -> &'a Semantic {
        let semantic = match self.parsed {
            Source::Component(_) => self.resolution().map(Resolution::semantic),
            Source::Module(_) => Some(self.context.get::<ModuleSemantic>()),
        };
        semantic.expect("a parsed document resolves")
    }

    /// The condition type of each node of [`File::javascript`]: the host's type provider's, or
    /// the built-in prototype's; `None` for a module, and an error when the provider's facts do
    /// not fit.
    #[must_use]
    pub fn condition_types(&self) -> Option<Result<&'a TypeFacts, &'a str>> {
        self.component()?;
        Some(self.context.facet::<ConditionTypes>().map_or_else(
            || Ok(self.context.get::<NativeConditionTypes>()),
            |provided| provided.as_ref().map_err(String::as_str),
        ))
    }

    /// The document's `svelte.config.js` as the host provides it, or why the host cannot read
    /// it; `None` when no host provides it.
    #[must_use]
    pub fn svelte_config(&self) -> Option<Result<&'a SvelteConfig, &'a str>> {
        self.context
            .facet::<SvelteConfiguration>()
            .map(|config| config.as_ref().map_err(String::as_str))
    }

    /// Where the document is in its `SvelteKit` project as the host provides it; `None` when no
    /// host provides it.
    #[must_use]
    pub fn svelte_kit(&self) -> Option<&'a SvelteKitProject> {
        self.context.facet::<SvelteKit>()
    }

    /// Every node of [`File::javascript`] the analysis visited, with its parent and scope, in
    /// the order it visited them.
    #[must_use]
    pub fn nodes(&self) -> &'a AstNodes<'a> {
        self.semantic().nodes()
    }
}
