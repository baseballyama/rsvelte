//! The tasks this plugin offers. A task id is also the fixture path of its expected output
//! (`vue.lint/default` → `expected/vue.lint/default.*`).

use rsv_kernel::db::Ctx;
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::metrics;
use rsv_kernel::pipeline::{Document, Registry, Task, TaskOutput};

use crate::{Config, Parsed, Resolved};

pub fn register(reg: &mut Registry, _config: &Config) {
    reg.task(Compile).task(Format).task(Lint);
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
