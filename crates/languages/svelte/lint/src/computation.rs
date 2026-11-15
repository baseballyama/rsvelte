use std::path::Path;

use oxc_span::SourceType;
use rsvelte_kernel::computation::database::{Artifact, DocumentContext, Facet};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::compiler_syntax_tree::{CompilerSyntaxTree, lower};
use rsvelte_svelte_semantic::legacy::Legacy;
use rsvelte_svelte_semantic::resolve::{Resolution, resolve};
use rsvelte_svelte_semantic::{Lowered, Resolved};
use rsvelte_svelte_syntax::Parsed;
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::{
    ProgramIdentifier, Script, SyntaxError, TYPESCRIPT_ESLINT_UNCHECKED, Tree,
};

use crate::project::SvelteKitProject;
use crate::types::TypeFacts;
use crate::{Configuration, SvelteConfig};

#[derive(Debug)]
pub(crate) struct LintConfiguration;

impl Facet for LintConfiguration {
    type Output = std::sync::Arc<Configuration>;

    const NAME: &'static str = "svelte.lint.configuration";
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
        let component = component(context).expect("lint requests types of a component it reads");
        let resolution = resolution(context).expect("a component lint reads resolves");
        TypeFacts::infer(component, resolution, context.source_text())
    }
}

/// The component's legacy reactivity: `$:` statements, the variables they declare, and store
/// subscriptions.
#[derive(Debug)]
pub(crate) struct LegacyReactivity;

impl Artifact for LegacyReactivity {
    type Output = Legacy;

    const NAME: &'static str = "svelte.lint.legacy_reactivity";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component =
            component(context).expect("lint requests legacy reactivity of a component it reads");
        let resolution = resolution(context).expect("a component lint reads resolves");
        let programs: Vec<ProgramIdentifier> = component
            .module
            .iter()
            .chain(&component.instance)
            .map(|script| script.program)
            .collect();
        Legacy::new(resolution, &programs)
    }
}

/// The component lint reads: the compiler's, or, when the compiler rejects a script only and
/// typescript-eslint reads it, the component with its scripts read as TypeScript, as
/// svelte-eslint-parser reads them.
///
/// # Errors
///
/// The compiler's parse error.
pub(crate) fn component<'a>(
    context: &'a DocumentContext<'_>,
) -> Result<&'a Component, &'a Diagnostic> {
    let error = match context.get::<Parsed>() {
        Ok(component) => return Ok(component),
        Err(error) => error,
    };
    let in_script = || {
        rsvelte_svelte_syntax::parse::in_script_content(
            context.source_text(),
            error.span.start_offset,
        )
    };
    match context.get::<ParsedAsTypeScriptEslint>() {
        Ok(component) if component.script_typescript_errors.is_empty() && in_script() => {
            Ok(component)
        }
        _ => Err(error),
    }
}

/// The component with each script the compiler rejects read as typescript-eslint reads it.
#[derive(Debug)]
pub(crate) struct ParsedAsTypeScriptEslint;

impl Artifact for ParsedAsTypeScriptEslint {
    type Output = Result<Component, Diagnostic>;

    const NAME: &'static str = "svelte.lint.parse_as_typescript_eslint";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        rsvelte_svelte_syntax::parse::parse_reading_scripts_as_typescript_eslint(
            context.source_text(),
        )
    }
}

/// The compiler tree of [`component`]; `None` when lint does not read it.
pub(crate) fn lowered<'a>(context: &'a DocumentContext<'_>) -> Option<&'a CompilerSyntaxTree> {
    if context.get::<Parsed>().is_ok() {
        return context.get::<Lowered>().as_ref();
    }
    (context.get::<TypeScriptAnalysis>().as_ref()).map(|(lowered, _)| lowered)
}

/// The resolution of [`component`]; `None` when lint does not read it.
pub(crate) fn resolution<'a>(context: &'a DocumentContext<'_>) -> Option<&'a Resolution> {
    if context.get::<Parsed>().is_ok() {
        return context.get::<Resolved>().as_ref();
    }
    (context.get::<TypeScriptAnalysis>().as_ref()).map(|(_, resolution)| resolution)
}

/// The compiler tree and the resolution of a component [`component`] reads as TypeScript.
#[derive(Debug)]
pub(crate) struct TypeScriptAnalysis;

impl Artifact for TypeScriptAnalysis {
    type Output = Option<(CompilerSyntaxTree, Resolution)>;

    const NAME: &'static str = "svelte.lint.typescript_analysis";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        if context.get::<Parsed>().is_ok() {
            return None;
        }
        let c = component(context).ok()?;
        let lowered = lower(c, context.source_text());
        let resolution = resolve(
            &c.javascript,
            c.instance.as_ref().map(|s| s.program),
            c.module.as_ref().map(|s| s.program),
            &lowered,
        );
        Some((lowered, resolution))
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
            builder.leave_unchecked(TYPESCRIPT_ESLINT_UNCHECKED);
            Ok(builder.program_or_errors(range, source_type))
        })
        .expect("the parse hands back its errors");
        read.map(|root| Script { tree, root })
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

/// [`SameNamedFile`] from the process's file system.
#[derive(Debug)]
pub(crate) struct SameNamedFileOnDisk;

impl Artifact for SameNamedFileOnDisk {
    type Output = Option<String>;

    const NAME: &'static str = "svelte.lint.same_named_file_on_disk";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        same_named_file(context)
    }
}

/// The extensions TypeScript's resolution appends to a `.svelte` specifier; `.d.ts` declares a
/// component instead of shadowing it.
const MODULE_EXTENSIONS: [&str; 8] = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs"];

/// A document with a name only has none.
fn same_named_file(context: &DocumentContext<'_>) -> Option<String> {
    let path = context.document.file.as_deref()?.to_str()?;
    if rsvelte_svelte_syntax::matches(context.document) {
        return MODULE_EXTENSIONS
            .iter()
            .map(|extension| format!("{path}{extension}"))
            .find(|module| is_file(module))
            .map(|module| real_name(&module));
    }
    let extension = MODULE_EXTENSIONS.iter().find(|e| path.ends_with(*e))?;
    let component = &path[..path.len() - extension.len()];
    (component.ends_with(".svelte") && is_file(component)).then(|| real_name(component))
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

/// [`PostcssConfiguration`] from the process's file system, searched once.
#[derive(Debug)]
pub(crate) struct PostcssConfigurationOnDisk;

impl Artifact for PostcssConfigurationOnDisk {
    type Output = bool;

    const NAME: &'static str = "svelte.lint.postcss_configuration_on_disk";

    fn compute(_: &DocumentContext<'_>) -> Self::Output {
        static FOUND: std::sync::OnceLock<bool> = std::sync::OnceLock::new();
        *FOUND.get_or_init(postcss_configuration_found)
    }
}

/// `postcss-load-config` 3's search: from the working directory up to the home directory, a
/// file in one of its places that is not empty, or a `package.json` with a `postcss` key.
fn postcss_configuration_found() -> bool {
    const PLACES: [&str; 10] = [
        ".postcssrc",
        ".postcssrc.json",
        ".postcssrc.yaml",
        ".postcssrc.yml",
        ".postcssrc.ts",
        ".postcssrc.js",
        ".postcssrc.cjs",
        "postcss.config.ts",
        "postcss.config.js",
        "postcss.config.cjs",
    ];
    #[derive(serde::Deserialize)]
    struct Package {
        postcss: Option<serde::de::IgnoredAny>,
    }
    let Ok(start) = std::env::current_dir() else {
        return false;
    };
    let home = std::env::var_os("HOME").map(std::path::PathBuf::from);
    for directory in start.ancestors() {
        let package = std::fs::read_to_string(directory.join("package.json"))
            .ok()
            .and_then(|text| serde_json::from_str::<Package>(&text).ok())
            .is_some_and(|package| package.postcss.is_some());
        let place = PLACES.iter().any(|place| {
            std::fs::read_to_string(directory.join(place)).is_ok_and(|text| !text.trim().is_empty())
        });
        if package || place {
            return true;
        }
        if home.as_deref() == Some(directory) {
            break;
        }
    }
    false
}

fn is_file(path: &str) -> bool {
    std::fs::metadata(path).is_ok_and(|metadata| metadata.is_file())
}

/// The file name as its directory spells it: a case-insensitive file system finds `foo.svelte.ts`
/// when asked for `Foo.svelte.ts`.
fn real_name(path: &str) -> String {
    let path = Path::new(path);
    let wanted = path
        .file_name()
        .and_then(|name| name.to_str())
        .expect("a path built from a file name");
    let directory = match path.parent() {
        Some(directory) if !directory.as_os_str().is_empty() => directory,
        _ => Path::new("."),
    };
    let names: Vec<String> = std::fs::read_dir(directory)
        .into_iter()
        .flatten()
        .filter_map(|entry| entry.ok()?.file_name().into_string().ok())
        .collect();
    let lower = wanted.to_lowercase();
    names
        .iter()
        .find(|name| *name == wanted)
        .or_else(|| names.iter().find(|name| name.to_lowercase() == lower))
        .map_or_else(|| wanted.to_owned(), Clone::clone)
}
