//! The tasks this plugin offers. A task id is also the fixture path of its expected output
//! (`vue.lint/default` → `expected/vue.lint/default.*`).

use std::sync::Arc;

use rsv_js::check::{Check, TsDoc, TsEnv, TsView, Tsc};
use rsv_kernel::db::Ctx;
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::emit::Emitter;
use rsv_kernel::metrics;
use rsv_kernel::pipeline::{Document, Registry, Task, TaskOutput};
use rsv_kernel::source::Span;

use crate::project::Projection;
use crate::{Config, Parsed, Resolved};

pub fn register(reg: &mut Registry, config: &Config) {
    reg.task(Compile)
        .task(Format)
        .task(Lint)
        .project_task(Check {
            id: "vue.check/default",
            langs: &["vue"],
            tsc: config.check.as_ref().map(|c| Tsc {
                binary: c.tsc.clone(),
                tsconfig: c.tsconfig.clone(),
            }),
        });
    let env = config.check.as_ref().map(|c| Arc::new(ts_env(&c.vue)));
    reg.provide::<TsView>("vue", move |ctx| ts_view(ctx, env.as_ref()));
}

/// `@vitejs/plugin-vue`'s production output ([`crate::compile`]).
#[derive(Debug)]
pub struct Compile;

impl Task for Compile {
    fn id(&self) -> &'static str {
        "vue.compile/default"
    }

    fn applies(&self, doc: &Document) -> bool {
        doc.lang == "vue"
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
        let compiled = {
            let _p = metrics::phase("vue.compile");
            crate::compile::compile(c, ctx.src(), res, &ctx.doc.path)
        };
        match compiled {
            Ok(o) => {
                out.file("js", o.js);
                if let Some(css) = o.css {
                    out.file("css", css);
                }
            }
            Err(u) => out.diagnostics.push(Diagnostic::error(
                "compile_unsupported",
                format!("not supported yet: {}", u.what),
                u.span(),
            )),
        }
    }
}

/// prettier with its HTML printer ([`crate::format`]). A construct the port does not cover is
/// reported, not approximated: the task then writes no file.
#[derive(Debug)]
pub struct Format;

impl Task for Format {
    fn id(&self) -> &'static str {
        "vue.format/default"
    }

    fn applies(&self, doc: &Document) -> bool {
        doc.lang == "vue"
    }

    fn run(&self, ctx: &Ctx<'_>, out: &mut TaskOutput) {
        let c = match ctx.get::<Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        let formatted = {
            let _p = metrics::phase("vue.format");
            crate::format::format(c, ctx.src())
        };
        match formatted {
            Ok(text) => out.file("vue", text),
            Err(u) => out.diagnostics.push(Diagnostic::error(
                "format_unsupported",
                format!("not supported by the formatter yet: {}", u.what),
                u.span(),
            )),
        }
    }
}

/// `ESLint` with eslint-plugin-vue, the rules of [`crate::lint::lint`].
#[derive(Debug)]
pub struct Lint;

impl Task for Lint {
    fn id(&self) -> &'static str {
        "vue.lint/default"
    }

    fn applies(&self, doc: &Document) -> bool {
        doc.lang == "vue"
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
        let cx = crate::lint::Cx {
            c,
            src: ctx.src(),
            path: &ctx.doc.path,
            res,
            js: rsv_js::lint::JsFacts {
                ast: &c.js,
                sem: &res.sem,
                parents: &parents,
            },
        };
        let findings = crate::lint::lint(&cx);
        let rules: Vec<&str> = crate::lint::rule_ids().collect();
        out.file(
            "lint.json",
            rsv_kernel::lint::render_json(ctx.src(), ctx.line_index(), &rules, &findings),
        );
    }
}

const HELPERS: (&str, &str) = (
    "template-helpers.d.ts",
    include_str!("../vendor/template-helpers.d.ts"),
);

/// What vue-tsc adds to the project: @vue/language-core's template helpers and the vue package.
fn ts_env(vue: &std::path::Path) -> TsEnv {
    TsEnv {
        declarations: vec![HELPERS],
        include: Vec::new(),
        paths: vec![
            ("vue", vue.join("dist/vue.d.mts")),
            ("vue/jsx-runtime", vue.join("jsx-runtime/index.d.ts")),
        ],
    }
}

/// The component as vue-tsc's checker sees it ([`TsView`]): @vue/language-core's virtual code
/// ([`crate::project`]), mapped back with Volar's rule.
fn ts_view(ctx: &Ctx<'_>, env: Option<&Arc<TsEnv>>) -> Result<TsDoc, Diagnostic> {
    let c = ctx.get::<Parsed>().as_ref().map_err(Clone::clone)?;
    let res = ctx
        .get::<Resolved>()
        .as_ref()
        .expect("a parsed component is resolved");
    match crate::project::project(c, ctx.src(), res) {
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
                    "vue.check needs the vue package",
                    Span::new(0, 0),
                )
            })?;
            Ok(TsDoc::Checked {
                projection,
                map_back: Emitter::lookup_overlap,
                env: Arc::clone(env),
            })
        }
    }
}
