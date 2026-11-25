//! svelte2tsx's `upsertKitFile`: the types `SvelteKit` gives the exports of its route, hooks and
//! params files where the file declares none, as annotations in TypeScript and as `JSDoc` in
//! JavaScript.

use std::path::Path;

use jsdoc::{Host, Tag};
use oxc_ast::ast::{
    ArrowFunctionExpression, BindingPattern, Declaration, Expression, FormalParameters, Function,
    Program, Statement, VariableDeclarator,
};
use oxc_span::GetSpan;
use rsvelte_kernel::source::paths;

mod jsdoc;
#[cfg(test)]
mod tests;

/// Text svelte2tsx inserts before source offset `at`.
#[derive(Debug, PartialEq, Eq)]
pub(crate) struct Insertion {
    pub at: u32,
    pub text: String,
}

/// svelte2tsx's `KitFilesSettings` defaults, which svelte-check uses unless `svelte.config.js`
/// sets `kit.files`.
const SERVER_HOOKS: &str = "src/hooks.server";
const CLIENT_HOOKS: &str = "src/hooks.client";
const UNIVERSAL_HOOKS: &str = "src/hooks";
const PARAMETERS: &str = "src/params";

const ROUTE_FILES: [&str; 5] = [
    "+page",
    "+layout",
    "+page.server",
    "+layout.server",
    "+server",
];

/// The file svelte2tsx reads.
#[derive(Clone, Copy)]
struct Source<'s> {
    text: &'s str,
    javascript: bool,
}

/// What svelte2tsx inserts into the file at `path`, in source order; empty when it is no
/// `SvelteKit` file. `hooks_module` is the module that declares the hook types.
pub(crate) fn insertions(
    path: &Path,
    text: &str,
    program: &Program<'_>,
    javascript: bool,
    hooks_module: impl FnOnce() -> &'static str,
) -> Vec<Insertion> {
    let file = paths::typescript(&path.to_string_lossy()).into_owned();
    let basename = file.rsplit('/').next().unwrap_or(&file);
    let mut out = Inserted::default();
    let source = Source { text, javascript };
    let exports = || find_exports(program, source);
    if is_route_file(basename) {
        route_file(basename, source, &exports(), &mut out);
    } else if is_hooks_file(&file, basename, SERVER_HOOKS) {
        let module = hooks_module();
        let exports = exports();
        for (name, kind) in [
            ("handleError", "HandleServerError"),
            ("handle", "Handle"),
            ("handleFetch", "HandleFetch"),
        ] {
            let kind = format!("import('{module}').{kind}");
            add_type_to_function(&exports, source, &mut out, name, &kind, None);
        }
    } else if is_hooks_file(&file, basename, CLIENT_HOOKS) {
        let kind = format!("import('{}').HandleClientError", hooks_module());
        add_type_to_function(&exports(), source, &mut out, "handleError", &kind, None);
    } else if is_hooks_file(&file, basename, UNIVERSAL_HOOKS) {
        let kind = format!("import('{}').Reroute", hooks_module());
        add_type_to_function(&exports(), source, &mut out, "reroute", &kind, None);
    } else if is_parameters_file(&file, basename, PARAMETERS) {
        let returns = Some(("boolean", "boolean"));
        add_type_to_function(&exports(), source, &mut out, "match", "string", returns);
    }
    out.0
}

/// svelte2tsx's `isKitRouteFile`.
fn is_route_file(basename: &str) -> bool {
    let name = match basename.split_once('@') {
        Some((name, _)) => name,
        None => basename.rsplit_once('.').map_or("", |(name, _)| name),
    };
    ROUTE_FILES.contains(&name)
}

/// svelte2tsx's `isHooksFile`.
fn is_hooks_file(file: &str, basename: &str, hooks: &str) -> bool {
    let directory = &file[..file.len() - basename.len()].trim_end_matches('/');
    ((basename == "index.ts" || basename == "index.js") && directory.ends_with(hooks))
        || without_extension(file, basename).ends_with(hooks)
}

/// svelte2tsx's `isParamsFile`.
fn is_parameters_file(file: &str, basename: &str, parameters: &str) -> bool {
    let directory = &file[..file.len() - basename.len()].trim_end_matches('/');
    directory.ends_with(parameters) && !basename.contains(".test") && !basename.contains(".spec")
}

/// `file` without `path.extname(basename)`.
fn without_extension<'f>(file: &'f str, basename: &str) -> &'f str {
    match basename.rfind('.') {
        Some(dot) if dot > 0 => &file[..file.len() - (basename.len() - dot)],
        _ => file,
    }
}

/// svelte2tsx's `upsertKitRouteFile`.
fn route_file(basename: &str, source: Source<'_>, exports: &[Export<'_, '_>], out: &mut Inserted) {
    let load_type = format!(
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
        },
    );
    load(source, find(exports, "load"), &load_type, out);
    if let Some(Export {
        kind: Kind::Function(function),
        typed: false,
        start,
        ..
    }) = find(exports, "entries")
        && function.parameters().count() == 0
        && !basename.contains("layout")
    {
        let kind = "import('./$types.js').EntryGenerator";
        if source.javascript {
            out.insert(*start, format!("/** @type {{{kind}}} */ "));
        } else if !function.has_return_type()
            && let Some(at) = function.return_position(source.text)
        {
            out.insert(at, format!(": ReturnType<{kind}> "));
        }
    }
    if let Some(Export {
        kind: Kind::Variable(declarator),
        typed: false,
        ..
    }) = find(exports, "actions")
        && let Some(init) = &declarator.init
    {
        let kind = "import('./$types.js').Actions";
        if source.javascript {
            satisfies(source, init, kind, out);
        } else {
            out.insert(init.span().end, format!(" satisfies {kind}"));
        }
    }
    for (name, kind) in [
        ("prerender", "boolean | 'auto'"),
        ("trailingSlash", "'never' | 'always' | 'ignore'"),
        ("ssr", "boolean"),
        ("csr", "boolean"),
    ] {
        if let Some(Export {
            kind: Kind::Variable(declarator),
            typed: false,
            name_end,
            ..
        }) = find(exports, name)
            && let Some(init) = &declarator.init
        {
            if source.javascript {
                out.insert(init.span().start, format!("/** @type {{{kind}}} */ ("));
                out.insert(init.span().end, ")".to_owned());
            } else {
                out.insert(*name_end, format!(" : {kind}"));
            }
        }
    }
    let returns = Some(("Response | Promise<Response>", "Promise<Response>"));
    for name in [
        "GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS", "HEAD", "fallback",
    ] {
        let kind = "import('./$types.js').RequestEvent";
        add_type_to_function(exports, source, out, name, kind, returns);
    }
}

/// The type of a route's `load`.
fn load(source: Source<'_>, load: Option<&Export<'_, '_>>, load_type: &str, out: &mut Inserted) {
    match load {
        Some(Export {
            kind: Kind::Function(function),
            typed: false,
            start,
            ..
        }) if function.parameters().count() == 1 => {
            if source.javascript {
                let name = function.first_parameter_name().unwrap_or("arg0");
                let text = format!("/** @param {{{load_type}Event}} {name} */ ");
                out.insert(*start, text);
            } else {
                let at = function.first_parameter_end();
                out.insert(at, format!(": {load_type}Event"));
            }
        }
        Some(Export {
            kind: Kind::Variable(declarator),
            typed: false,
            ..
        }) => {
            // `const load = ...` becomes `const load = (...) satisfies PageLoad`.
            if let Some(init) = &declarator.init {
                satisfies(source, init, load_type, out);
            }
        }
        _ => {}
    }
}

/// `init satisfies kind`, which JavaScript writes as `JSDoc`.
fn satisfies(source: Source<'_>, init: &Expression<'_>, kind: &str, out: &mut Inserted) {
    let span = init.span();
    if source.javascript {
        out.insert(span.start, format!("/** @satisfies {{{kind}}} */ ("));
        out.insert(span.end, ")".to_owned());
    } else {
        out.insert(span.start, "(".to_owned());
        out.insert(span.end, format!(") satisfies {kind}"));
    }
}

/// svelte2tsx's `addTypeToFunction`: `returns` is the return type, then an async function's.
fn add_type_to_function(
    exports: &[Export<'_, '_>],
    source: Source<'_>,
    out: &mut Inserted,
    name: &str,
    kind: &str,
    returns: Option<(&str, &str)>,
) {
    let Some(Export {
        kind: Kind::Function(function),
        typed: false,
        start,
        ..
    }) = find(exports, name)
    else {
        return;
    };
    if function.parameters().count() != 1 {
        return;
    }
    if source.javascript {
        let kind = match returns {
            Some((returns, _)) => format!("(arg0: {kind}) => {returns}"),
            None => kind.to_owned(),
        };
        out.insert(*start, format!("/** @type {{{kind}}} */ "));
        return;
    }
    let parameter = match returns {
        Some(_) => format!(": {kind}"),
        None => format!(": Parameters<{kind}>[0]"),
    };
    out.insert(function.first_parameter_end(), parameter);
    if !function.has_return_type()
        && let Some(at) = function.return_position(source.text)
    {
        let text = match returns {
            Some((_, asynchronous)) if function.is_async() => format!(": {asynchronous} "),
            Some((returns, _)) => format!(": {returns} "),
            None => format!(": ReturnType<{kind}> "),
        };
        out.insert(at, text);
    }
}

/// svelte2tsx's `insertCode`: an insertion at an offset that has one goes after it.
#[derive(Default)]
struct Inserted(Vec<Insertion>);

impl Inserted {
    fn insert(&mut self, at: u32, text: String) {
        let index = self.0.partition_point(|i| i.at <= at);
        self.0.insert(index, Insertion { at, text });
    }
}

struct Export<'p, 'a> {
    name: &'p str,
    kind: Kind<'p, 'a>,
    /// svelte2tsx's `hasTypeDefinition`.
    typed: bool,
    name_end: u32,
    /// Where a function starts, `export` included: where JavaScript's `JSDoc` goes.
    start: u32,
}

enum Kind<'p, 'a> {
    Function(FunctionNode<'p, 'a>),
    Variable(&'p VariableDeclarator<'a>),
}

#[derive(Clone, Copy)]
enum FunctionNode<'p, 'a> {
    Function(&'p Function<'a>),
    Arrow(&'p ArrowFunctionExpression<'a>),
}

impl<'p, 'a> FunctionNode<'p, 'a> {
    fn parameters_node(self) -> &'p FormalParameters<'a> {
        match self {
            Self::Function(function) => &function.params,
            Self::Arrow(arrow) => &arrow.params,
        }
    }

    /// Each parameter's end and whether it declares a type, the rest parameter last.
    fn parameters(self) -> impl Iterator<Item = (u32, bool)> + 'p {
        let parameters = self.parameters_node();
        let items = parameters
            .items
            .iter()
            .map(|p| (p.span.end, p.type_annotation.is_some()));
        items.chain(
            (parameters.rest.as_deref())
                .map(|rest| (rest.span.end, rest.type_annotation.is_some())),
        )
    }

    fn first_parameter_end(self) -> u32 {
        self.parameters().next().map_or(0, |(end, _)| end)
    }

    /// The first parameter's pattern.
    fn first_parameter(self) -> Option<&'p BindingPattern<'a>> {
        let parameters = self.parameters_node();
        (parameters.items.first().map(|p| &p.pattern))
            .or_else(|| parameters.rest.as_deref().map(|rest| &rest.rest.argument))
    }

    /// The first parameter's name, where it is a name and not a pattern.
    fn first_parameter_name(self) -> Option<&'p str> {
        match self.first_parameter()? {
            BindingPattern::BindingIdentifier(id) => Some(id.name.as_str()),
            _ => None,
        }
    }

    /// svelte2tsx's `hasTypedParameter`: in JavaScript, also a `@type` among `tags`, or a
    /// `@param` TypeScript gives the first parameter (`getJSDocParameterTags`).
    fn has_typed_parameter(self, tags: &[Tag<'_>]) -> bool {
        if self.parameters().next().is_some_and(|(_, typed)| typed) || tags.contains(&Tag::Type) {
            return true;
        }
        if self.first_parameter().is_none() {
            return false;
        }
        let name = self.first_parameter_name();
        tags.iter().any(|tag| match (tag, name) {
            (Tag::Parameter(tag), Some(name)) => *tag == Some(name),
            // A pattern takes the tag at its index.
            (Tag::Parameter(_), None) => true,
            _ => false,
        })
    }

    const fn start(self) -> u32 {
        match self {
            Self::Function(function) => function.span.start,
            Self::Arrow(arrow) => arrow.span.start,
        }
    }

    const fn has_return_type(self) -> bool {
        match self {
            Self::Function(function) => function.return_type.is_some(),
            Self::Arrow(arrow) => arrow.return_type.is_some(),
        }
    }

    const fn is_async(self) -> bool {
        match self {
            Self::Function(function) => function.r#async,
            Self::Arrow(arrow) => arrow.r#async,
        }
    }

    /// Where svelte2tsx inserts a return type: before an arrow's `=>`, or a function's body.
    fn return_position(self, source: &str) -> Option<u32> {
        match self {
            Self::Function(function) => function.body.as_ref().map(|body| body.span.start),
            Self::Arrow(arrow) => {
                arrow_token(source, arrow.params.span.end, arrow.body.span().start)
            }
        }
    }
}

/// The offset of the `=>` between `from` and `to`, past comments. No line terminator may come
/// before `=>`, so a one-line block comment is the only comment that can sit there.
fn arrow_token(source: &str, from: u32, to: u32) -> Option<u32> {
    let bytes = source.as_bytes();
    let mut i = from as usize;
    let to = (to as usize).min(bytes.len());
    while i + 1 < to {
        match (bytes[i], bytes[i + 1]) {
            (b'=', b'>') => return u32::try_from(i).ok(),
            (b'/', b'*') => {
                i = source[i + 2..to]
                    .find("*/")
                    .map_or(to, |end| i + 2 + end + 2);
            }
            _ => i += 1,
        }
    }
    None
}

fn find<'e, 'p, 'a>(exports: &'e [Export<'p, 'a>], name: &str) -> Option<&'e Export<'p, 'a>> {
    exports.iter().rev().find(|export| export.name == name)
}

/// svelte2tsx's `findExports`: `export function x` and `export const x`.
fn find_exports<'p, 'a>(program: &'p Program<'a>, source: Source<'_>) -> Vec<Export<'p, 'a>> {
    let tags = |token: u32, host: Host| {
        if source.javascript {
            jsdoc::tags(source.text, &program.comments, token, host)
        } else {
            Vec::new()
        }
    };
    let mut exports = Vec::new();
    for statement in &program.body {
        let Statement::ExportDeclaration(export) = statement else {
            continue;
        };
        let statement = tags(export.span.start, Host::Statement);
        match &export.declaration {
            Declaration::FunctionDeclaration(function) => {
                let Some(id) = &function.id else { continue };
                let node = FunctionNode::Function(function);
                exports.push(Export {
                    name: id.name.as_str(),
                    kind: Kind::Function(node),
                    typed: node.has_typed_parameter(&statement),
                    name_end: id.span.end,
                    start: export.span.start,
                });
            }
            Declaration::VariableDeclaration(declaration)
                if declaration.declarations.len() == 1 =>
            {
                let declarator = &declaration.declarations[0];
                let Some(id) = declarator.id.get_binding_identifier() else {
                    continue;
                };
                let init = declarator.init.as_ref();
                let satisfies = matches!(
                    init.map(Expression::without_parentheses),
                    Some(Expression::TSSatisfiesExpression(_))
                );
                let function = init.and_then(function_of);
                // The initializer's own comment, which an unparenthesized function has.
                let direct = function.filter(|f| init.is_some_and(|i| i.span().start == f.start()));
                let mut declared = tags(declarator.span.start, Host::Expression);
                declared.extend(statement.iter().cloned());
                if let Some(function) = direct {
                    declared.extend(tags(function.start(), Host::Expression));
                }
                let typed = declarator.type_annotation.is_some()
                    || satisfies
                    || (declared.iter()).any(|tag| matches!(tag, Tag::Type | Tag::Satisfies));
                let typed = typed
                    || function.is_some_and(|function| {
                        let mut own = tags(function.start(), Host::Expression);
                        if direct.is_some() {
                            own.extend(statement.iter().cloned());
                        }
                        function.has_typed_parameter(&own)
                    });
                exports.push(Export {
                    name: id.name.as_str(),
                    kind: function.map_or(Kind::Variable(declarator), Kind::Function),
                    typed,
                    name_end: id.span.end,
                    start: function.map_or(declarator.span.start, FunctionNode::start),
                });
            }
            _ => {}
        }
    }
    exports
}

/// The function an initializer holds, inside parentheses or `satisfies`.
fn function_of<'p, 'a>(init: &'p Expression<'a>) -> Option<FunctionNode<'p, 'a>> {
    let inner = match init.without_parentheses() {
        Expression::TSSatisfiesExpression(satisfies) => satisfies.expression.without_parentheses(),
        other => other,
    };
    match inner {
        Expression::FunctionExpression(function) => Some(FunctionNode::Function(function)),
        Expression::ArrowFunctionExpression(arrow) => Some(FunctionNode::Arrow(arrow)),
        _ => None,
    }
}
