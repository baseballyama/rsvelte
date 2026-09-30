//! The tasks this plugin offers. A task id is also the fixture path of its expected output
//! (`vue.lint/default` → `expected/vue.lint/default.*`).

use rsv_kernel::db::Ctx;
use rsv_kernel::metrics;
use rsv_kernel::pipeline::{Document, Registry, Task, TaskOutput};

use crate::{Config, Parsed, Resolved};

pub fn register(reg: &mut Registry, _config: &Config) {
    reg.task(Lint);
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
