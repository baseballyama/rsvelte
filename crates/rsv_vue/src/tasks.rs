//! The tasks this plugin offers. A task id is also the fixture path of its expected output
//! (`vue.lint/default` → `expected/vue.lint/default.*`).

use rsv_js::check::{CheckRequest, Projected, Tsc, render_findings};
use rsv_kernel::db::Ctx;
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::emit::Emitter;
use rsv_kernel::metrics;
use rsv_kernel::pipeline::{Document, Part, ProjectTask, Registry, Task, TaskOutput};
use rsv_kernel::source::Span;

use crate::project::Projection;
use crate::{CheckConfig, Config, Parsed, Resolved, TsProjection};

pub fn register(reg: &mut Registry, config: &Config) {
    reg.task(Compile)
        .task(Format)
        .task(Lint)
        .project_task(Check {
            config: config.check.clone(),
        });
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

/// vue-tsc's diagnostics.
///
/// Every TypeScript component of the run is projected on its worker ([`crate::project`]), then
/// one `tsc` checks them all. Writes the findings as vue-tsc's program
/// reports them (`json`, 0-based lines, UTF-16 characters).
#[derive(Debug)]
pub struct Check {
    pub config: Option<CheckConfig>,
}

const HELPERS: (&str, &str) = (
    "template-helpers.d.ts",
    include_str!("../vendor/template-helpers.d.ts"),
);

impl ProjectTask for Check {
    fn id(&self) -> &'static str {
        "vue.check/default"
    }

    fn applies(&self, doc: &Document) -> bool {
        doc.lang == "vue"
    }

    fn prepare(&self, ctx: &Ctx<'_>, out: &mut TaskOutput) -> Option<Part> {
        if let Err(e) = ctx.get::<Parsed>() {
            out.diagnostics.push(e.clone());
            return None;
        }
        if self.config.is_none() {
            out.diagnostics.push(Diagnostic::error(
                "check_unconfigured",
                "vue.check needs a tsc executable and the vue package",
                Span::new(0, 0),
            ));
            return None;
        }
        match ctx.get::<TsProjection>().as_ref()? {
            Err(u) => {
                out.diagnostics.push(Diagnostic::error(
                    "check_unsupported",
                    format!("not supported by the type-check projection yet: {}", u.what),
                    u.span(),
                ));
                None
            }
            Ok(Projection::Js) => {
                out.file(
                    "json",
                    render_findings(ctx.src(), ctx.line_index(), &mut []),
                );
                None
            }
            Ok(Projection::Ts(e)) => Some(Box::new(Projected {
                emitter: Emitter {
                    out: e.out.clone(),
                    mappings: e.mappings.clone(),
                },
                src: ctx.src().to_owned(),
            })),
        }
    }

    fn finish(&self, parts: Vec<Part>, outs: Vec<&mut TaskOutput>) {
        let config = self
            .config
            .as_ref()
            .expect("prepare returns parts only when configured");
        let docs = parts
            .into_iter()
            .map(|p| *p.downcast::<Projected>().expect("parts are this task's"))
            .collect();
        let req = CheckRequest {
            declarations: vec![HELPERS],
            paths: vec![
                ("vue", config.vue.join("dist/vue.d.mts")),
                ("vue/jsx-runtime", config.vue.join("jsx-runtime/index.d.ts")),
            ],
            ..CheckRequest::default()
        };
        let tsc = Tsc {
            binary: config.tsc.clone(),
            tsconfig: config.tsconfig.clone(),
        };
        rsv_js::check::check_projected(&tsc, req, docs, Emitter::lookup_overlap, outs);
    }
}
