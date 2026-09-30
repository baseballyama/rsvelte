//! The tasks this plugin offers. A task id is also the fixture path of its expected output
//! (`svelte.compile/client` → `expected/svelte.compile/client.*`).

use std::sync::Arc;

use rsv_js::ast::{TsFeature, TsRuntime};
use rsv_js::check::{Check, TsDoc, TsEnv, TsView, Tsc};
use rsv_kernel::db::Ctx;
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::emit::Emitter;
use rsv_kernel::metrics;
use rsv_kernel::pipeline::{Document, Registry, Task, TaskOutput};
use rsv_kernel::source::Span;

use crate::lower::{self, Target};
use crate::project::Projection;
use crate::{Analyzed, Config, Normalized, Parsed, Resolved, ScopedCss};

pub fn register(reg: &mut Registry, config: &Config) {
    reg.task(Compile {
        target: Target::Client,
    })
    .task(Compile {
        target: Target::Server,
    })
    .task(Format)
    .task(Lint)
    .project_task(Check {
        id: "svelte.check/default",
        langs: &["svelte"],
        tsc: config.check.as_ref().map(|c| Tsc {
            binary: c.tsc.clone(),
            tsconfig: c.tsconfig.clone(),
        }),
    });
    let env = config.check.as_ref().map(|c| Arc::new(ts_env(&c.svelte)));
    reg.provide::<TsView>("svelte", move |ctx| ts_view(ctx, env.as_ref()));
}

/// One task per target, both from the same artifacts: parsing and analysis happen once when both
/// run.
#[derive(Debug)]
pub struct Compile {
    pub target: Target,
}

impl Task for Compile {
    fn id(&self) -> &'static str {
        match self.target {
            Target::Client => "svelte.compile/client",
            Target::Server => "svelte.compile/server",
        }
    }

    fn applies(&self, doc: &Document) -> bool {
        doc.lang == "svelte"
    }

    fn run(&self, ctx: &Ctx<'_>, out: &mut TaskOutput) {
        if let Err(e) = ctx.get::<Parsed>() {
            out.diagnostics.push(e.clone());
            return;
        }
        let input = crate::compile_input(ctx).expect("a parsed component is lowered to HIR");
        let res = ctx
            .get::<Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        let an = ctx
            .get::<Analyzed>()
            .as_ref()
            .expect("a parsed component is analysed");
        match compile(&input, res, an, self.target) {
            Ok(js) => out.file("js", js),
            Err(d) => {
                out.diagnostics.push(d);
                return;
            }
        }
        if let Some(css) = ctx.get::<ScopedCss>() {
            out.file("css", css.clone());
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
    res: &crate::resolve::Resolution,
    an: &crate::analyze::Analysis,
    target: Target,
) -> Result<String, Diagnostic> {
    if let Some(t) = input.js.ts_runtime.first() {
        return Err(typescript_invalid_feature(t));
    }
    let (ast, root) = {
        let _p = metrics::phase(match target {
            Target::Client => "svelte.lower.client",
            Target::Server => "svelte.lower.server",
        });
        match target {
            Target::Client => lower::client::lower(input, res, an)?,
            Target::Server => lower::server::lower(input, res, an)?,
        }
    };
    let _p = metrics::phase("js.print");
    Ok(rsv_js::codegen::print_program(&ast, input.src, root).out)
}

/// The style sheet scoped and pruned, from any frontend's [`lower::CompileInput`].
#[must_use]
pub fn scoped_css(
    input: &lower::CompileInput<'_>,
    an: &crate::analyze::Analysis,
) -> Option<String> {
    let (sheet, hash) = match (input.style, an.css_hash.as_deref()) {
        (None, _) => return None,
        (Some(sheet), Some(hash)) => (sheet, hash),
        (Some(_), None) => unreachable!("a component with a style has a hash"),
    };
    Some(rsv_css::scope::render(input.src, sheet, &an.css_used, hash))
}

/// Upstream `remove_typescript_nodes` erases types and refuses what has a runtime value.
fn typescript_invalid_feature(t: &TsRuntime) -> Diagnostic {
    let feature = match t.feature {
        TsFeature::Enum => "enums",
        TsFeature::NamespaceWithValues => "namespaces with non-type nodes",
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
    fn id(&self) -> &'static str {
        "svelte.format/default"
    }

    fn applies(&self, doc: &Document) -> bool {
        doc.lang == "svelte"
    }

    fn run(&self, ctx: &Ctx<'_>, out: &mut TaskOutput) {
        let c = match ctx.get::<Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        match crate::format::format(c, ctx.src(), ctx.line_index()) {
            Ok(text) => out.file("svelte", text),
            Err(u) => out.diagnostics.push(Diagnostic::error(
                "format_unsupported",
                format!("not supported by the formatter yet: {}", u.what),
                u.span(),
            )),
        }
    }
}

/// `ESLint` with eslint-plugin-svelte, the rules of [`crate::lint::lint`].
///
/// Writes the rules it ran and their findings as `ESLint` reports them (`lint.json`); a document
/// that does not parse gets the parse error instead.
#[derive(Debug)]
pub struct Lint;

impl Task for Lint {
    fn id(&self) -> &'static str {
        "svelte.lint/default"
    }

    fn applies(&self, doc: &Document) -> bool {
        doc.lang == "svelte"
    }

    fn run(&self, ctx: &Ctx<'_>, out: &mut TaskOutput) {
        let c = match ctx.get::<Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        let res = ctx
            .get::<Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        let parents = {
            let _p = metrics::phase("js.parents");
            c.js.parents()
        };
        let hir = ctx
            .get::<Normalized>()
            .as_ref()
            .expect("a parsed component is lowered");
        let early = crate::lint::AstCx {
            c,
            src: ctx.src(),
            js: rsv_js::lint::JsFacts {
                ast: &c.js,
                sem: &res.sem,
                parents: &parents,
            },
        };
        let late = crate::lint::HirCx {
            hir,
            res,
            src: ctx.src(),
        };
        let findings = crate::lint::lint(&early, &late);
        let rules: Vec<&str> = crate::lint::rule_ids().collect();
        out.file(
            "lint.json",
            rsv_kernel::lint::render_json(ctx.line_index(), &rules, &findings),
        );
    }
}

const SHIM: (&str, &str) = (
    "svelte-jsx-v4.d.ts",
    include_str!("../vendor/svelte-jsx-v4.d.ts"),
);

/// What svelte-check adds to the project: its JSX shim and the svelte package's types.
fn ts_env(svelte: &std::path::Path) -> TsEnv {
    TsEnv {
        declarations: vec![SHIM],
        include: vec![svelte.join("types/index.d.ts")],
        paths: vec![
            ("svelte", svelte.join("types/index.d.ts")),
            ("svelte/elements", svelte.join("elements.d.ts")),
        ],
    }
}

/// The component as svelte-check's type checker sees it ([`TsView`]): svelte2tsx's projection,
/// mapped back through its source map.
fn ts_view(ctx: &Ctx<'_>, env: Option<&Arc<TsEnv>>) -> Result<TsDoc, Diagnostic> {
    let c = ctx.get::<Parsed>().as_ref().map_err(Clone::clone)?;
    match crate::project::project(c, ctx.src()) {
        Err(u) => Err(Diagnostic::error(
            "check_unsupported",
            format!("not supported by the type-check projection yet: {}", u.what),
            u.span(),
        )),
        Ok(Projection::Js) => Ok(TsDoc::Unchecked),
        Ok(Projection::Ts(projection)) => {
            let env = env.ok_or_else(|| {
                Diagnostic::error(
                    "check_unconfigured",
                    "svelte.check needs the svelte package",
                    Span::new(0, 0),
                )
            })?;
            Ok(TsDoc::Checked {
                projection,
                map_back: Emitter::lookup_span,
                env: Arc::clone(env),
            })
        }
    }
}
