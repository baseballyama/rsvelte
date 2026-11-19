//! svelte-check's types of the `SvelteKit` files that are TypeScript modules: the annotations
//! svelte2tsx's `upsertKitFile` inserts into route files, hooks and parameter matchers, so that
//! an export such as `load` or `handle` is checked against its `SvelteKit` type.

use std::borrow::Cow;
use std::path::{Path, PathBuf};

use oxc_ast::ast::{
    ArrowFunctionExpression, BindingPattern, Declaration, ExportDefaultDeclarationKind, Expression,
    FormalParameters, Function, Program, Statement, VariableDeclaration,
};
use oxc_span::GetSpan;
use rsvelte_kernel::computation::file_facts::{FileFact, FileFacts};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;
use rsvelte_typescript_check::{Annotations, TypeScriptAnnotations};

pub(crate) fn register(registry: &mut Registry) {
    rsvelte_typescript_tree::register(registry);
    registry.provide::<TypeScriptAnnotations>(
        "svelte.check.kit_files",
        |document| kit_file(&name(document)).is_some(),
        |context| {
            let name = name(context.document);
            let kind = kit_file(&name).expect("the provider applies to kit files only");
            // A module that does not parse gets no annotations: TypeScript reports its error.
            let inserted = context
                .get::<rsvelte_typescript_tree::Parsed>()
                .as_ref()
                .map_or_else(
                    |_| Vec::new(),
                    |script| {
                        let hooks = match kind {
                            KitFile::Route | KitFile::Params => HOOKS_BEFORE_3,
                            _ => context
                                .document
                                .file
                                .as_deref()
                                .map_or(HOOKS_BEFORE_3, |file| {
                                    hooks_module(context.files(), &absolute(file))
                                }),
                        };
                        let program = script.tree.get_program(script.root);
                        inserted(program, kind, basename(&name), hooks)
                    },
                );
            Annotations {
                inserted,
                inserted_finding,
            }
        },
    );
}

/// The module that declares the hook types before `SvelteKit` 3.
const HOOKS_BEFORE_3: &str = "@sveltejs/kit";

/// svelte-check's `isKitFile` (svelte2tsx's defaults, which a `svelte.config.js` does not change
/// in svelte-check), for a TypeScript module; upstream annotates JavaScript in `JSDoc`, which
/// TypeScript does not check.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum KitFile {
    Route,
    ServerHooks,
    ClientHooks,
    UniversalHooks,
    Params,
}

/// The document's file as upstream names it, absolute with `/`, else its path.
fn name(document: &Document) -> Cow<'_, str> {
    document.file.as_deref().map_or_else(
        || Cow::Borrowed(document.path.as_str()),
        |file| Cow::Owned(absolute(file).to_string_lossy().replace('\\', "/")),
    )
}

fn absolute(file: &Path) -> PathBuf {
    std::path::absolute(file).unwrap_or_else(|_| file.to_owned())
}

fn basename(name: &str) -> &str {
    name.rsplit('/').next().unwrap_or(name)
}

fn kit_file(name: &str) -> Option<KitFile> {
    let without_extension = name.strip_suffix(".ts")?;
    let (directory, stem) = without_extension
        .rsplit_once('/')
        .unwrap_or(("", without_extension));
    let basename = basename(name);
    let route = basename.split_once('@').map_or(stem, |(page, _)| page);
    let hooks = |path: &str| {
        (stem == "index" && directory.ends_with(path)) || without_extension.ends_with(path)
    };
    if [
        "+page",
        "+layout",
        "+page.server",
        "+layout.server",
        "+server",
    ]
    .contains(&route)
    {
        Some(KitFile::Route)
    } else if hooks("src/hooks.server") {
        Some(KitFile::ServerHooks)
    } else if hooks("src/hooks.client") {
        Some(KitFile::ClientHooks)
    } else if hooks("src/hooks") {
        Some(KitFile::UniversalHooks)
    } else if directory.ends_with("src/params")
        && !basename.contains(".test")
        && !basename.contains(".spec")
    {
        Some(KitFile::Params)
    } else {
        None
    }
}

/// The module whose hook types upstream names: `@sveltejs/kit/hooks` when the `@sveltejs/kit`
/// that the file resolves is version 3 or later.
fn hooks_module(files: &FileFacts, file: &Path) -> &'static str {
    file.ancestors()
        .skip(1)
        .find_map(|directory| {
            *files.get::<KitHooksModule>(&directory.join("node_modules/@sveltejs/kit/package.json"))
        })
        .unwrap_or(HOOKS_BEFORE_3)
}

/// The hooks module of the `@sveltejs/kit` whose `package.json` this is; `None` when it is no
/// file.
struct KitHooksModule;

impl FileFact for KitHooksModule {
    type Output = Option<&'static str>;

    const NAME: &'static str = "svelte.check.kit_hooks_module";

    fn read(path: &Path) -> Self::Output {
        #[derive(serde::Deserialize)]
        struct Manifest {
            version: Option<String>,
        }
        let manifest = std::fs::read(path).ok()?;
        // Upstream falls back to the old module when the version does not read.
        let major = serde_json::from_slice::<Manifest>(&manifest)
            .ok()
            .and_then(|manifest| manifest.version)
            .and_then(|version| {
                let digits = version.bytes().take_while(u8::is_ascii_digit).count();
                version[..digits].parse::<u64>().ok()
            });
        Some(if major.is_some_and(|major| major >= 3) {
            "@sveltejs/kit/hooks"
        } else {
            HOOKS_BEFORE_3
        })
    }
}

/// What svelte-check reports of a finding in an annotation: the missing module of `./$types`,
/// with how to generate it, and a function that returns nothing; it drops the others.
fn inserted_finding(code: u32, message: String) -> Option<String> {
    const MODULE_NOT_FOUND: u32 = 2307;
    const NO_EXPORTED_MEMBER: u32 = 2694;
    const MUST_RETURN: u32 = 2355;
    // Upstream adds the note to a message that is one line, not a chain.
    let one_line = !message.contains('\n');
    match code {
        MODULE_NOT_FOUND if one_line && message.contains("./$types") => Some(format!(
            "{message} (this likely means that SvelteKit's type generation didn't run yet - try \
             running it by executing 'npm run dev' or 'npm run build')"
        )),
        NO_EXPORTED_MEMBER if one_line && message.contains("/$types") => Some(format!(
            "{message} (this likely means that SvelteKit's generated types are out of date - try \
             rerunning it by executing 'npm run dev' or 'npm run build')"
        )),
        MODULE_NOT_FOUND | NO_EXPORTED_MEMBER | MUST_RETURN => Some(message),
        _ => None,
    }
}

/// An export upstream's `findExports` finds, by its last declaration.
enum Export<'p, 'a> {
    Function {
        function: Callable<'p, 'a>,
        typed: bool,
    },
    Variable {
        declaration: &'p oxc_ast::ast::VariableDeclarator<'a>,
        typed: bool,
    },
}

#[derive(Clone, Copy)]
enum Callable<'p, 'a> {
    Function(&'p Function<'a>),
    Arrow(&'p ArrowFunctionExpression<'a>),
}

impl<'p, 'a> Callable<'p, 'a> {
    fn parameters(self) -> &'p FormalParameters<'a> {
        match self {
            Self::Function(function) => &function.params,
            Self::Arrow(arrow) => &arrow.params,
        }
    }

    fn this_parameter(self) -> Option<&'p oxc_ast::ast::TSThisParameter<'a>> {
        match self {
            Self::Function(function) => function.this_param.as_deref(),
            Self::Arrow(_) => None,
        }
    }

    /// How many parameters TypeScript counts, `this` included.
    fn parameter_count(self) -> usize {
        let parameters = self.parameters();
        usize::from(self.this_parameter().is_some())
            + parameters.items.len()
            + usize::from(parameters.rest.is_some())
    }

    /// Whether the first parameter has a type, and where it ends.
    fn first_parameter(self) -> Option<(bool, u32)> {
        let parameters = self.parameters();
        if let Some(this) = self.this_parameter() {
            return Some((this.type_annotation.is_some(), this.span.end));
        }
        if let Some(first) = parameters.items.first() {
            return Some((first.type_annotation.is_some(), first.span.end));
        }
        (parameters.rest.as_deref()).map(|rest| (rest.type_annotation.is_some(), rest.span.end))
    }

    /// Where upstream writes the return type, when the function has a body and none: before an
    /// arrow's `=>`, which is right after the parameters, or before the body.
    fn return_type_at(self) -> Option<u32> {
        match self {
            Self::Function(function) if function.return_type.is_none() => {
                function.body.as_ref().map(|body| body.span.start)
            }
            Self::Arrow(arrow) if arrow.return_type.is_none() => Some(arrow.params.span.end),
            _ => None,
        }
    }

    const fn is_async(self) -> bool {
        match self {
            Self::Function(function) => function.r#async,
            Self::Arrow(arrow) => arrow.r#async,
        }
    }
}

/// The exports a kit file annotates.
const NAMES: [&str; 20] = [
    "load",
    "entries",
    "actions",
    "prerender",
    "trailingSlash",
    "ssr",
    "csr",
    "GET",
    "PUT",
    "POST",
    "PATCH",
    "DELETE",
    "OPTIONS",
    "HEAD",
    "fallback",
    "match",
    "handleError",
    "handle",
    "handleFetch",
    "reroute",
];

/// upstream's `findExports` of the names a kit file annotates.
fn exports<'p, 'a>(program: &'p Program<'a>) -> Vec<(&'a str, Export<'p, 'a>)> {
    let mut found: Vec<(&'a str, Export<'p, 'a>)> = Vec::new();
    let mut keep = |name: &'a str, export: Export<'p, 'a>| {
        if !NAMES.contains(&name) {
            return;
        }
        match found.iter_mut().find(|(held, _)| *held == name) {
            Some(held) => held.1 = export,
            None => found.push((name, export)),
        }
    };
    for statement in &program.body {
        let declaration = match statement {
            Statement::ExportDeclaration(export) => &export.declaration,
            Statement::ExportDefaultDeclaration(export) => {
                if let ExportDefaultDeclarationKind::FunctionDeclaration(function) =
                    &export.declaration
                    && let Some(id) = &function.id
                {
                    keep(
                        id.name.as_str(),
                        function_export(Callable::Function(function), false),
                    );
                }
                continue;
            }
            _ => continue,
        };
        match declaration {
            Declaration::FunctionDeclaration(function) => {
                if let Some(id) = &function.id {
                    keep(
                        id.name.as_str(),
                        function_export(Callable::Function(function), false),
                    );
                }
            }
            Declaration::VariableDeclaration(variables) => {
                if let Some((name, export)) = variable_export(variables) {
                    keep(name, export);
                }
            }
            _ => {}
        }
    }
    found
}

fn function_export<'p, 'a>(function: Callable<'p, 'a>, typed: bool) -> Export<'p, 'a> {
    Export::Function {
        function,
        typed: typed || function.first_parameter().is_some_and(|(typed, _)| typed),
    }
}

fn variable_export<'p, 'a>(
    variables: &'p VariableDeclaration<'a>,
) -> Option<(&'a str, Export<'p, 'a>)> {
    let [declaration] = variables.declarations.as_slice() else {
        return None;
    };
    let BindingPattern::BindingIdentifier(id) = &declaration.id else {
        return None;
    };
    let typed = declaration.type_annotation.is_some()
        || matches!(declaration.init, Some(Expression::TSSatisfiesExpression(_)));
    let export = match &declaration.init {
        Some(Expression::FunctionExpression(function)) => {
            function_export(Callable::Function(function), typed)
        }
        Some(Expression::ArrowFunctionExpression(arrow)) => {
            function_export(Callable::Arrow(arrow), typed)
        }
        _ => Export::Variable { declaration, typed },
    };
    Some((id.name.as_str(), export))
}

/// The annotations upstream's `upsertKitFile` inserts, by source offset; `hooks` is the module
/// that declares the hook types.
fn inserted(
    program: &Program<'_>,
    kind: KitFile,
    basename: &str,
    hooks: &str,
) -> Vec<(u32, String)> {
    let exports = exports(program);
    let mut inserted = Vec::new();
    let mut function = |name: &str, kind: &str, returns: Option<(&str, &str)>| {
        annotate_function(&exports, &mut inserted, name, kind, returns);
    };
    match kind {
        KitFile::Route => {
            for method in [
                "GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS", "HEAD", "fallback",
            ] {
                function(
                    method,
                    "import('./$types.js').RequestEvent",
                    Some(("Response | Promise<Response>", "Promise<Response>")),
                );
            }
            route(&exports, basename, &mut inserted);
        }
        KitFile::ServerHooks => {
            function(
                "handleError",
                &format!("import('{hooks}').HandleServerError"),
                None,
            );
            function("handle", &format!("import('{hooks}').Handle"), None);
            function(
                "handleFetch",
                &format!("import('{hooks}').HandleFetch"),
                None,
            );
        }
        KitFile::ClientHooks => function(
            "handleError",
            &format!("import('{hooks}').HandleClientError"),
            None,
        ),
        KitFile::UniversalHooks => function("reroute", &format!("import('{hooks}').Reroute"), None),
        KitFile::Params => function("match", "string", Some(("boolean", "boolean"))),
    }
    // Upstream keeps the insertions at one offset in the order it made them; a route's methods
    // annotate other exports than the rest.
    inserted.sort_by_key(|(at, _)| *at);
    inserted
}

type Exports<'p, 'a> = [(&'a str, Export<'p, 'a>)];

fn export<'e, 'p, 'a>(exports: &'e Exports<'p, 'a>, name: &str) -> Option<&'e Export<'p, 'a>> {
    exports
        .iter()
        .find(|(held, _)| *held == name)
        .map(|(_, export)| export)
}

/// upstream's `addTypeToFunction`: the parameter's type is `Parameters<kind>[0]` and the return
/// type `ReturnType<kind>`, or, given `returns` (synchronous, asynchronous), `kind` and `returns`.
fn annotate_function(
    exports: &Exports<'_, '_>,
    inserted: &mut Vec<(u32, String)>,
    name: &str,
    kind: &str,
    returns: Option<(&str, &str)>,
) {
    let Some(Export::Function {
        function,
        typed: false,
    }) = export(exports, name)
    else {
        return;
    };
    let (1, Some((_, parameter_end))) = (function.parameter_count(), function.first_parameter())
    else {
        return;
    };
    inserted.push((
        parameter_end,
        match returns {
            None => format!(": Parameters<{kind}>[0]"),
            Some(_) => format!(": {kind}"),
        },
    ));
    if let Some(at) = function.return_type_at() {
        let returns = match returns {
            None => format!(": ReturnType<{kind}> "),
            Some((_, asynchronous)) if function.is_async() => format!(": {asynchronous} "),
            Some((synchronous, _)) => format!(": {synchronous} "),
        };
        inserted.push((at, returns));
    }
}

/// The annotations of a route file's `load`, `entries`, `actions` and page options.
fn route(exports: &Exports<'_, '_>, basename: &str, inserted: &mut Vec<(u32, String)>) {
    let load = format!(
        "import('./$types.js').{}{}Load",
        if basename.contains("layout") {
            "Layout"
        } else {
            "Page"
        },
        if basename.contains("server") {
            "Server"
        } else {
            ""
        }
    );
    match export(exports, "load") {
        Some(Export::Function {
            function,
            typed: false,
        }) => {
            if let (1, Some((_, end))) = (function.parameter_count(), function.first_parameter()) {
                inserted.push((end, format!(": {load}Event")));
            }
        }
        Some(Export::Variable {
            declaration,
            typed: false,
        }) => {
            if let Some(init) = &declaration.init {
                inserted.push((init.span().start, "(".to_owned()));
                inserted.push((init.span().end, format!(") satisfies {load}")));
            }
        }
        _ => {}
    }
    if let Some(Export::Function {
        function,
        typed: false,
    }) = export(exports, "entries")
        && function.parameter_count() == 0
        && !basename.contains("layout")
        && let Some(at) = function.return_type_at()
    {
        inserted.push((
            at,
            ": ReturnType<import('./$types.js').EntryGenerator> ".to_owned(),
        ));
    }
    if let Some(Export::Variable {
        declaration,
        typed: false,
    }) = export(exports, "actions")
        && let Some(init) = &declaration.init
    {
        inserted.push((
            init.span().end,
            " satisfies import('./$types.js').Actions".to_owned(),
        ));
    }
    for (name, kind) in [
        ("prerender", "boolean | 'auto'"),
        ("trailingSlash", "'never' | 'always' | 'ignore'"),
        ("ssr", "boolean"),
        ("csr", "boolean"),
    ] {
        if let Some(Export::Variable {
            declaration,
            typed: false,
        }) = export(exports, name)
            && declaration.init.is_some()
        {
            inserted.push((declaration.id.span().end, format!(" : {kind}")));
        }
    }
}

#[cfg(test)]
mod tests;
