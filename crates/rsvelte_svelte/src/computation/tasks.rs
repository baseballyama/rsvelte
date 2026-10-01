//! The tasks this plugin offers. A task identifier is also the fixture path of its expected output
//! (`svelte.compile/client` → `expected/svelte.compile/client.*`).

use std::sync::Arc;

use rsvelte_javascript::check::{Check, Tsc, TypeScriptDocument, TypeScriptEnv, TypeScriptView};
use rsvelte_javascript::syntax_tree::{TypeScriptFeature, TypeScriptRuntime};
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::positions::Span;

use crate::compilation::lower::{self, Target};
use crate::tooling::project::Projection;
use crate::{Analyzed, Configuration, Normalized, Parsed, Resolved, ScopedStylesheet};

pub fn register(reg: &mut Registry, config: &Configuration) {
    reg.task(Compile {
        target: Target::Client,
    })
    .task(Compile {
        target: Target::Server,
    })
    .task(Format)
    .task(Lint)
    .finish_task(Check {
        identifier: "svelte.check/default",
        matches: crate::matches,
        tsc: config.check.as_ref().map(|c| Tsc {
            binary: c.tsc.clone(),
            tsconfig: c.tsconfig.clone(),
        }),
    });
    let env = config
        .check
        .as_ref()
        .map(|c| Arc::new(typescript_env(&c.svelte)));
    reg.provide::<TypeScriptView>("svelte", crate::matches, move |context| {
        typescript_view(context, env.as_ref())
    });
}

/// One task per target, both from the same artifacts: parsing and analysis happen once when both
/// run.
#[derive(Debug)]
pub struct Compile {
    pub target: Target,
}

impl Task for Compile {
    fn identifier(&self) -> &'static str {
        match self.target {
            Target::Client => "svelte.compile/client",
            Target::Server => "svelte.compile/server",
        }
    }

    fn applies(&self, document: &Document) -> bool {
        crate::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        if let Err(e) = context.get::<Parsed>() {
            out.diagnostics.push(e.clone());
            return;
        }
        let input = crate::compile_input(context).expect("a parsed component is lowered to HIR");
        let res = context
            .get::<Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        let an = context
            .get::<Analyzed>()
            .as_ref()
            .expect("a parsed component is analysed");
        match compile(&input, res, an, self.target) {
            Ok(javascript) => out.file("js", javascript),
            Err(d) => {
                out.diagnostics.push(d);
                return;
            }
        }
        if let Some(stylesheet) = context.get::<ScopedStylesheet>() {
            out.file("css", stylesheet.clone());
        }
    }
}

/// The JavaScript module of one target, from any frontend's [`lower::CompileInput`].
///
/// # Errors
///
/// A [`Diagnostic`] for what the compiler rejects or the port does not handle yet.
pub fn compile(
    input: &lower::CompileInput<'_>,
    res: &crate::semantic::resolve::Resolution,
    an: &crate::semantic::analyze::Analysis,
    target: Target,
) -> Result<String, Diagnostic> {
    if let Some(t) = input.javascript.typescript_runtime.first() {
        return Err(typescript_invalid_feature(t));
    }
    let (syntax_tree, root) = {
        let _p = measurement::phase(match target {
            Target::Client => "svelte.lower.client",
            Target::Server => "svelte.lower.server",
        });
        match target {
            Target::Client => lower::client::lower(input, res, an)?,
            Target::Server => lower::server::lower(input, res, an)?,
        }
    };
    let _p = measurement::phase("js.print");
    Ok(rsvelte_javascript::codegen::print_program(&syntax_tree, input.source_text, root).out)
}

/// The style sheet scoped and pruned, from any frontend's [`lower::CompileInput`].
#[must_use]
pub fn scoped_stylesheet(
    input: &lower::CompileInput<'_>,
    an: &crate::semantic::analyze::Analysis,
) -> Option<String> {
    let (sheet, hash) = match (input.style, an.stylesheet_hash.as_deref()) {
        (None, _) => return None,
        (Some(sheet), Some(hash)) => (sheet, hash),
        (Some(_), None) => unreachable!("a component with a style has a hash"),
    };
    Some(rsvelte_stylesheet::scope::render(
        input.source_text,
        sheet,
        &an.stylesheet_used,
        hash,
    ))
}

/// Upstream `remove_typescript_nodes` erases types and refuses what has a runtime value.
fn typescript_invalid_feature(t: &TypeScriptRuntime) -> Diagnostic {
    let feature = match t.feature {
        TypeScriptFeature::Enum => "enums",
        TypeScriptFeature::NamespaceWithValues => "namespaces with non-type nodes",
    };
    Diagnostic::error(
        "typescript_invalid_feature",
        format!(
            "TypeScript language features like {feature} are not natively supported, and their \
             use is generally discouraged. Outside of `<script>` tags, these features are not \
             supported. For use within `<script>` tags, you will need to use a preprocessor to \
             convert it to JavaScript before it gets passed to the Svelte compiler. If you are \
             using `vitePreprocess`, make sure to specifically enable preprocessing script tags \
             (`vitePreprocess({{ script: true }})`)\n\
             https://svelte.dev/e/typescript_invalid_feature"
        ),
        t.span,
    )
}

/// prettier + prettier-plugin-svelte. A construct the port does not cover is reported, not
/// approximated: the task then writes no file.
#[derive(Debug)]
pub struct Format;

impl Task for Format {
    fn identifier(&self) -> &'static str {
        "svelte.format/default"
    }

    fn applies(&self, document: &Document) -> bool {
        crate::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let c = match context.get::<Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        match crate::tooling::format::format(c, context.source_text(), context.line_index()) {
            Ok(text) => out.file("svelte", text),
            Err(u) => out.diagnostics.push(Diagnostic::error(
                "format_unsupported",
                format!("not supported by the formatter yet: {}", u.what),
                u.span(),
            )),
        }
    }
}

/// `ESLint` with eslint-plugin-svelte, the rules of [`crate::tooling::lint::lint`].
///
/// Writes the rules it ran and their findings as `ESLint` reports them (`lint.json`); a document
/// that does not parse gets the parse error instead.
#[derive(Debug)]
pub struct Lint;

impl Task for Lint {
    fn identifier(&self) -> &'static str {
        "svelte.lint/default"
    }

    fn applies(&self, document: &Document) -> bool {
        crate::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let c = match context.get::<Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        let res = context
            .get::<Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        let parents = {
            let _p = measurement::phase("js.parents");
            c.javascript.parents()
        };
        let compiler_syntax_tree = context
            .get::<Normalized>()
            .as_ref()
            .expect("a parsed component is lowered");
        let early = crate::tooling::lint::SyntaxTreeContext {
            c,
            source_text: context.source_text(),
            javascript: rsvelte_javascript::lint::JavaScriptFacts {
                syntax_tree: &c.javascript,
                sem: &res.sem,
                parents: &parents,
            },
        };
        let late = crate::tooling::lint::CompilerSyntaxTreeContext {
            compiler_syntax_tree,
            res,
            source_text: context.source_text(),
        };
        let findings = crate::tooling::lint::lint(&early, &late);
        let rules: Vec<&str> = crate::tooling::lint::rule_identifiers().collect();
        out.file(
            "lint.json",
            rsvelte_kernel::diagnostics::rules::render_json(
                context.line_index(),
                &rules,
                &findings,
            ),
        );
    }
}

const SHIM: (&str, &str) = (
    "svelte-jsx-v4.d.ts",
    include_str!("../../vendor/svelte-jsx-v4.d.ts"),
);

/// What svelte-check adds to the project: its JSX shim and the svelte package's types.
fn typescript_env(svelte: &std::path::Path) -> TypeScriptEnv {
    TypeScriptEnv {
        declarations: vec![SHIM],
        include: vec![svelte.join("types/index.d.ts")],
        paths: vec![
            ("svelte", svelte.join("types/index.d.ts")),
            ("svelte/elements", svelte.join("elements.d.ts")),
        ],
    }
}

/// The component as svelte-check's type checker sees it ([`TypeScriptView`]): svelte2tsx's
/// projection, mapped back through its source map.
fn typescript_view(
    context: &DocumentContext<'_>,
    env: Option<&Arc<TypeScriptEnv>>,
) -> Result<TypeScriptDocument, Diagnostic> {
    let c = context.get::<Parsed>().as_ref().map_err(Clone::clone)?;
    match crate::tooling::project::project(c, context.source_text()) {
        Err(u) => Err(Diagnostic::error(
            "check_unsupported",
            format!("not supported by the type-check projection yet: {}", u.what),
            u.span(),
        )),
        Ok(Projection::JavaScript) => Ok(TypeScriptDocument::Unchecked),
        Ok(Projection::TypeScript(projection)) => {
            let env = env.ok_or_else(|| {
                Diagnostic::error(
                    "check_unconfigured",
                    "svelte.check needs the svelte package",
                    Span::new(0, 0),
                )
            })?;
            Ok(TypeScriptDocument::Checked {
                projection,
                map_back: Emitter::lookup_span,
                env: Arc::clone(env),
            })
        }
    }
}
