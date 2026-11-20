use std::path::Path;

use oxc_span::SourceType;
use rsvelte_kernel::computation::database::{Artifact, DocumentContext, Facet};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::compiler_syntax_tree::CompilerSyntaxTree;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_semantic::{Lowered, Resolved};
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_svelte_syntax::{Parsed, ParsedAsTypeScript};
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::{Script, SyntaxError, TYPESCRIPT_ESLINT_UNCHECKED, Tree};

use crate::project::SvelteKitProject;
use crate::types::TypeFacts;
use crate::{Configuration, SvelteConfig};

#[derive(Debug)]
pub(crate) struct LintConfiguration;

impl Facet for LintConfiguration {
    type Output = std::sync::Arc<Configuration>;

    const NAME: &'static str = "svelte.lint.configuration";
}

/// The component the rules read, as `svelte-eslint-parser` gives it: the compiler's, or the one
/// read as TypeScript when the compiler rejects a script that typescript-eslint parses.
///
/// The rules and lint's artifacts read [`Parsed`], [`Lowered`] and [`Resolved`] only through it,
/// so none sees the compiler's tree of a component lint reads as TypeScript. Only the compiler's
/// own result, [`crate::rule::File::compile_warnings`], reads the compiler's tree.
#[derive(Clone, Copy, Debug)]
pub(crate) struct Linted<'a> {
    context: &'a DocumentContext<'a>,
    pub(crate) component: &'a Component,
    compiler_rejected: bool,
}

impl<'a> Linted<'a> {
    /// # Errors
    ///
    /// The component does not parse as TypeScript either.
    pub(crate) fn of(context: &'a DocumentContext<'a>) -> Result<Self, &'a Diagnostic> {
        let (component, compiler_rejected) = match context.get::<Parsed>() {
            Ok(component) => (component, false),
            Err(_) => (read_as_svelte_eslint_parser(context)?, true),
        };
        Ok(Self {
            context,
            component,
            compiler_rejected,
        })
    }

    /// The template as the compiler reads it, computed on first request.
    pub(crate) fn lowered(self) -> &'a CompilerSyntaxTree {
        let lowered = if self.compiler_rejected {
            self.context.get::<LoweredAsSvelteEslintParser>()
        } else {
            self.context.get::<Lowered>()
        };
        lowered.as_ref().expect("a parsed component lowers")
    }

    /// The scopes with the template's bindings, computed on first request.
    pub(crate) fn resolution(self) -> &'a Resolution {
        let resolution = if self.compiler_rejected {
            self.context.get::<ResolvedAsSvelteEslintParser>()
        } else {
            self.context.get::<Resolved>()
        };
        resolution.as_ref().expect("a parsed component resolves")
    }
}

/// The component as [`rsvelte_svelte_syntax::parse::parse_as_svelte_eslint_parser`] reads it,
/// for a document [`Parsed`] rejects.
#[derive(Debug)]
pub(crate) struct ParsedAsSvelteEslintParser;

impl Artifact for ParsedAsSvelteEslintParser {
    type Output = Result<Component, Diagnostic>;

    const NAME: &'static str = "svelte.lint.parse_as_svelte_eslint_parser";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        rsvelte_svelte_syntax::parse::parse_as_svelte_eslint_parser(context.source_text())
    }
}

/// The component as svelte-eslint-parser reads it, for a document [`Parsed`] rejects: the one read
/// as TypeScript, which the formatter shares, unless that parse stopped at the `/>` of a
/// self-closing `<script />` or `<style />`.
///
/// # Errors
///
/// The component does not parse that way either.
pub(crate) fn read_as_svelte_eslint_parser<'a>(
    context: &'a DocumentContext<'_>,
) -> Result<&'a Component, &'a Diagnostic> {
    match context.get::<ParsedAsTypeScript>() {
        Err(error)
            if context.source_text()[error.span.start_offset as usize..].starts_with("/>") =>
        {
            context.get::<ParsedAsSvelteEslintParser>().as_ref()
        }
        parsed => parsed.as_ref(),
    }
}

/// [`Lowered`] of the component [`read_as_svelte_eslint_parser`] reads, which only lint reads.
#[derive(Debug)]
pub(crate) struct LoweredAsSvelteEslintParser;

impl Artifact for LoweredAsSvelteEslintParser {
    /// `None` when svelte-eslint-parser's reading does not parse either.
    type Output = Option<CompilerSyntaxTree>;

    const NAME: &'static str = "svelte.lint.compiler_syntax_tree_as_typescript";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component = read_as_svelte_eslint_parser(context).ok()?;
        Some(rsvelte_svelte_semantic::compiler_syntax_tree::lower(
            component,
            context.source_text(),
        ))
    }
}

/// [`Resolved`] of the component [`read_as_svelte_eslint_parser`] reads, which only lint reads.
#[derive(Debug)]
pub(crate) struct ResolvedAsSvelteEslintParser;

impl Artifact for ResolvedAsSvelteEslintParser {
    /// `None` when svelte-eslint-parser's reading does not parse either.
    type Output = Option<Resolution>;

    const NAME: &'static str = "svelte.lint.resolve_as_typescript";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component = read_as_svelte_eslint_parser(context).ok()?;
        let lowered = context.get::<LoweredAsSvelteEslintParser>().as_ref()?;
        Some(rsvelte_svelte_semantic::resolve_component(
            component, lowered,
        ))
    }
}

/// The condition type of each JS/TS node of a component, from a host's type provider
/// ([`crate::register_type_provider`]), or why they do not fit the component. Without one, rules
/// use [`NativeConditionTypes`].
#[derive(Debug)]
pub(crate) struct ConditionTypes;

impl Facet for ConditionTypes {
    type Output = Result<TypeFacts, String>;

    const NAME: &'static str = "svelte.lint.condition_types";
}

/// The built-in prototype's [`ConditionTypes`].
#[derive(Debug)]
pub(crate) struct NativeConditionTypes;

impl Artifact for NativeConditionTypes {
    type Output = TypeFacts;

    const NAME: &'static str = "svelte.lint.native_condition_types";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let linted = Linted::of(context).expect("lint requests types after parsing");
        TypeFacts::infer(linted.component, linted.resolution(), context.source_text())
    }
}

/// The scopes of a JavaScript or TypeScript module, which only lint reads.
#[derive(Debug)]
pub(crate) struct ModuleSemantic;

impl Artifact for ModuleSemantic {
    type Output = Semantic;

    const NAME: &'static str = "svelte.lint.module_semantic";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let script = module(context).expect("lint analyzes a module it reads");
        Semantic::program(script.tree.clone(), script.root)
    }
}

/// The module lint reads: the one the shared tasks parse, or, when that fails, the module read as
/// TypeScript, as typescript-eslint reads every module.
///
/// # Errors
///
/// The shared parse's error.
pub(crate) fn module<'a>(context: &'a DocumentContext<'_>) -> Result<&'a Script, &'a Diagnostic> {
    match context.get::<rsvelte_typescript_tree::Parsed>() {
        Ok(script) => Ok(script),
        Err(error) => (context.get::<ModuleAsTypeScript>().as_ref()).or(Err(error)),
    }
}

/// A module the shared parse rejects, read as TypeScript, or every error oxc reports in it.
#[derive(Debug)]
pub(crate) struct ModuleAsTypeScript;

impl Artifact for ModuleAsTypeScript {
    type Output = Result<Script, Vec<SyntaxError>>;

    const NAME: &'static str = "svelte.lint.module_as_typescript";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let path = Path::new(&context.document.path);
        let source_type = SourceType::from_path(path).unwrap_or_default();
        // typescript-eslint reads a JavaScript file's JSX.
        let source_type = (source_type.with_jsx(source_type.is_javascript())).with_typescript(true);
        let range = Span::new(0, context.source_text().len() as u32);
        let (tree, read) = Tree::build(context.source_text(), |builder| {
            builder.leave_unchecked(&TYPESCRIPT_ESLINT_UNCHECKED);
            Ok(builder
                .program_or_errors(range, source_type)
                .map_err(|rejected| rejected.errors))
        })
        .expect("the parse hands back its errors");
        read.map(|root| Script { tree, root })
    }
}

/// The document's `svelte.config.js`, as `svelte-eslint-parser` finds it, or why it cannot be
/// read. The host loads it ([`crate::project::register_file_system`] from the files).
#[derive(Debug)]
pub struct SvelteConfiguration;

impl Facet for SvelteConfiguration {
    type Output = Result<SvelteConfig, String>;

    const NAME: &'static str = "svelte.lint.svelte_config";
}

/// Where the document is in its `SvelteKit` project, as `eslint-plugin-svelte` finds it from the
/// `package.json` files above it. The host answers it
/// ([`crate::project::register_file_system`] from the files).
#[derive(Debug)]
pub struct SvelteKit;

impl Facet for SvelteKit {
    type Output = SvelteKitProject;

    const NAME: &'static str = "svelte.lint.svelte_kit";
}

/// The on-disk name of the file a component or a runes module shares its name with.
///
/// `Foo.svelte` and `Foo.svelte.ts` share one. A host that has its own view of the files can
/// provide it; without a provider, `SameNamedFileOnDisk` reads the process's file system. Only
/// `svelte/no-conflicting-module-names` asks.
#[derive(Debug)]
pub struct SameNamedFile;

impl Facet for SameNamedFile {
    type Output = Option<String>;

    const NAME: &'static str = "svelte.lint.same_named_file";
}

/// Whether upstream finds a `PostCSS` configuration to transform a style in `postcss` with.
///
/// Without one it compiles the component without that style. A host that knows its working
/// directory can provide it; without a provider, `PostcssConfigurationOnDisk` searches as
/// `postcss-load-config` does. Only the rules that compile the component ask.
#[derive(Debug)]
pub struct PostcssConfiguration;

impl Facet for PostcssConfiguration {
    type Output = bool;

    const NAME: &'static str = "svelte.lint.postcss_configuration";
}
