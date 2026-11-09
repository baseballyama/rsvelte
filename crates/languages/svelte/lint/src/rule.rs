//! What a rule implements, built in or from a plugin.

use std::sync::Arc;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Contribution;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte::compilation::compiler_syntax_tree::CompilerSyntaxTree;
use rsvelte_svelte::semantic::resolve::Resolution;
use rsvelte_svelte::syntax::syntax_tree::Component;
use rsvelte_svelte::{Normalized, Parsed, Resolved};
use rsvelte_typescript::NodeIdentifier;
use rsvelte_typescript::scope::Semantic;
use serde::de::DeserializeOwned;
use serde_json::value::RawValue;

use crate::LintSettings;
use crate::computation::{ConditionTypes, ModuleParents, NativeConditionTypes, Parents};
use crate::types::TypeFacts;

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

/// Which documents a rule runs on.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Files {
    Components,
    /// Components and JavaScript or TypeScript modules, `.svelte.js` included.
    All,
}

/// Rules a plugin adds, named `<prefix>/<rule>` in configuration.
#[derive(Debug)]
pub struct LintPlugin {
    pub rules: &'static [&'static RuleDefinition],
}

/// The [`Contribution`] list of plugin rules; a plugin adds to it before `svelte.lint` installs.
#[derive(Debug)]
pub struct LintPlugins;

impl Contribution for LintPlugins {
    type Item = &'static LintPlugin;
}

/// A rule's options: `ESLint`'s entry without its level, and the shared settings.
#[derive(Debug)]
pub struct RuleOptions<'a> {
    pub options: &'a [Box<RawValue>],
    pub settings: &'a Arc<LintSettings>,
}

impl RuleOptions<'_> {
    /// Option `index`, decoded; `None` when it is absent.
    ///
    /// # Errors
    ///
    /// The option does not decode as `T`.
    pub fn get<T: DeserializeOwned>(&self, index: usize) -> Result<Option<T>, String> {
        self.options
            .get(index)
            .map(|raw| serde_json::from_str(raw.get()).map_err(|e| e.to_string()))
            .transpose()
    }

    /// The first option, or `T::default()`.
    ///
    /// # Errors
    ///
    /// There is more than one option, or the first does not decode as `T`.
    pub fn single<T: DeserializeOwned + Default>(&self) -> Result<T, String> {
        if self.options.len() > 1 {
            return Err("takes one option".to_owned());
        }
        Ok(self.get(0)?.unwrap_or_default())
    }

    /// # Errors
    ///
    /// There are options.
    pub fn none(&self) -> Result<(), String> {
        if self.options.is_empty() {
            Ok(())
        } else {
            Err("takes no options".to_owned())
        }
    }
}

/// The document a rule checks. Each fact is computed on first request and shared by the rules.
#[derive(Debug)]
pub struct File<'a> {
    pub context: &'a DocumentContext<'a>,
    parsed: Source<'a>,
}

#[derive(Debug)]
enum Source<'a> {
    Component(&'a Component),
    Module(&'a rsvelte_typescript::Program),
}

impl<'a> File<'a> {
    /// A parsed component or module.
    ///
    /// # Errors
    ///
    /// The source does not parse.
    pub fn new(context: &'a DocumentContext<'a>) -> Result<Self, Diagnostic> {
        let parsed = if rsvelte_svelte::matches(context.document) {
            Source::Component(context.get::<Parsed>().as_ref().map_err(Clone::clone)?)
        } else {
            Source::Module(
                context
                    .get::<rsvelte_typescript::Parsed>()
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
    pub const fn module(&self) -> Option<&'a rsvelte_typescript::Program> {
        match self.parsed {
            Source::Module(module) => Some(module),
            Source::Component(_) => None,
        }
    }

    /// The component's compiler tree; `None` for a module.
    #[must_use]
    pub fn normalized(&self) -> Option<&'a CompilerSyntaxTree> {
        self.component()?;
        self.context.get::<Normalized>().as_ref()
    }

    /// The component's resolution: scopes with the template's bindings; `None` for a module.
    #[must_use]
    pub fn resolution(&self) -> Option<&'a Resolution> {
        self.component()?;
        self.context.get::<Resolved>().as_ref()
    }

    /// The JavaScript of the document: a component's scripts and template expressions, or a
    /// module's program.
    #[must_use]
    pub const fn javascript(&self) -> &'a rsvelte_typescript::SyntaxTree {
        match self.parsed {
            Source::Component(component) => &component.javascript,
            Source::Module(module) => &module.syntax_tree,
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
            Source::Component(_) => self.resolution().map(|resolution| &resolution.sem),
            Source::Module(_) => self.context.get::<rsvelte_typescript::Resolved>().as_ref(),
        };
        semantic.expect("a parsed document resolves")
    }

    /// The condition type of each node of [`File::javascript`]: the host's type provider's, or
    /// the built-in prototype's; `None` for a module.
    #[must_use]
    pub fn condition_types(&self) -> Option<&'a TypeFacts> {
        self.component()?;
        Some(
            self.context
                .facet::<ConditionTypes>()
                .unwrap_or_else(|| self.context.get::<NativeConditionTypes>()),
        )
    }

    /// The parent of each node of [`File::javascript`].
    #[must_use]
    pub fn parents(&self) -> &'a [NodeIdentifier] {
        match self.parsed {
            Source::Component(_) => self.context.get::<Parents>(),
            Source::Module(_) => self.context.get::<ModuleParents>(),
        }
    }
}
