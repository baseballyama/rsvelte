//! The tasks this plugin offers. A task id is also the fixture path of its expected output
//! (`svelte.compile/client` → `expected/svelte.compile/client.*`).

use crate::lower::{self, Target};
use crate::project::Projection;
use crate::{Analyzed, CheckConfig, Config, Normalized, Parsed, Resolved, ScopedCss, TsProjection};
use rsv_js::check::{CheckRequest, Tsc};
use rsv_kernel::db::Ctx;
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::emit::Emitter;
use rsv_kernel::json::JsonWriter;
use rsv_kernel::metrics;
use rsv_kernel::pipeline::{Document, Part, ProjectTask, Registry, Task, TaskOutput};
use rsv_kernel::source::{LineIndex, Span};

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
        config: config.check.clone(),
    });
}

/// One task per target, both from the same artifacts: parsing and analysis happen once when both run.
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

    fn run(&self, ctx: &Ctx, out: &mut TaskOutput) {
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
        let an = ctx
            .get::<Analyzed>()
            .as_ref()
            .expect("a parsed component is analysed");
        let lowered = {
            let _p = metrics::phase(match self.target {
                Target::Client => "svelte.lower.client",
                Target::Server => "svelte.lower.server",
            });
            match self.target {
                Target::Client => lower::client::lower(c, ctx.src(), res, an),
                Target::Server => lower::server::lower(c, ctx.src(), res, an),
            }
        };
        match lowered {
            Ok((ast, root)) => {
                let _p = metrics::phase("js.print");
                out.file(
                    "js",
                    rsv_js::codegen::print_program(&ast, ctx.src(), root).out,
                );
            }
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

/// prettier + prettier-plugin-svelte. A construct the port does not cover is reported, not
/// approximated: the task then writes no file.
pub struct Format;

impl Task for Format {
    fn id(&self) -> &'static str {
        "svelte.format/default"
    }

    fn applies(&self, doc: &Document) -> bool {
        doc.lang == "svelte"
    }

    fn run(&self, ctx: &Ctx, out: &mut TaskOutput) {
        let c = match ctx.get::<Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        match crate::format::format(c, ctx.src()) {
            Ok(text) => out.file("svelte", text),
            Err(u) => out.diagnostics.push(Diagnostic::error(
                "format_unsupported",
                format!("not supported by the formatter yet: {}", u.what),
                u.span(),
            )),
        }
    }
}

/// ESLint with eslint-plugin-svelte, the rules of [`crate::lint::lint`]. Writes the findings as
/// ESLint reports them (`json`); a document that does not parse gets the parse error instead.
pub struct Lint;

impl Task for Lint {
    fn id(&self) -> &'static str {
        "svelte.lint/default"
    }

    fn applies(&self, doc: &Document) -> bool {
        doc.lang == "svelte"
    }

    fn run(&self, ctx: &Ctx, out: &mut TaskOutput) {
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
        out.file(
            "json",
            rsv_kernel::lint::render_json(ctx.src(), ctx.line_index(), &findings),
        );
    }
}

/// svelte-check's TypeScript diagnostics (`--diagnostic-sources js`): every TypeScript component
/// of the run is projected on its worker, then one `tsc` checks them all. Writes the findings as
/// svelte-check reports them (`json`, 0-based lines, UTF-16 characters).
pub struct Check {
    pub config: Option<CheckConfig>,
}

struct Prepared {
    mappings: Emitter,
    src: String,
}

const SHIM: (&str, &str) = (
    "svelte-jsx-v4.d.ts",
    include_str!("../vendor/svelte-jsx-v4.d.ts"),
);

impl ProjectTask for Check {
    fn id(&self) -> &'static str {
        "svelte.check/default"
    }

    fn applies(&self, doc: &Document) -> bool {
        doc.lang == "svelte"
    }

    fn prepare(&self, ctx: &Ctx, out: &mut TaskOutput) -> Option<Part> {
        if let Err(e) = ctx.get::<Parsed>() {
            out.diagnostics.push(e.clone());
            return None;
        }
        if self.config.is_none() {
            out.diagnostics.push(Diagnostic::error(
                "check_unconfigured",
                "svelte.check needs a tsc executable and the svelte package",
                Span::new(0, 0),
            ));
            return None;
        }
        match ctx
            .get::<TsProjection>()
            .as_ref()
            .expect("a parsed component is projected")
        {
            Err(u) => {
                out.diagnostics.push(Diagnostic::error(
                    "check_unsupported",
                    format!("not supported by the type-check projection yet: {}", u.what),
                    u.span(),
                ));
                None
            }
            Ok(Projection::Js) => {
                out.file("json", render_check(ctx.src(), ctx.line_index(), &mut []));
                None
            }
            Ok(Projection::Ts(e)) => Some(Box::new(Prepared {
                mappings: Emitter {
                    out: e.out.clone(),
                    mappings: e.mappings.clone(),
                },
                src: ctx.src().to_owned(),
            })),
        }
    }

    fn finish(&self, parts: Vec<Part>, mut outs: Vec<&mut TaskOutput>) {
        let config = self
            .config
            .as_ref()
            .expect("prepare returns parts only when configured");
        let mut prepared: Vec<Prepared> = parts
            .into_iter()
            .map(|p| *p.downcast::<Prepared>().expect("parts are this task's"))
            .collect();
        let req = CheckRequest {
            files: prepared
                .iter_mut()
                .map(|p| std::mem::take(&mut p.mappings.out))
                .collect(),
            declarations: vec![SHIM],
            include: vec![config.svelte.join("types/index.d.ts")],
            paths: vec![
                ("svelte", config.svelte.join("types/index.d.ts")),
                ("svelte/elements", config.svelte.join("elements.d.ts")),
            ],
        };
        let tsc = Tsc {
            binary: config.tsc.clone(),
            tsconfig: config.tsconfig.clone(),
        };
        let checked = tsc.check(&req);
        // Mapping a position back reads the generated text around it.
        for (p, file) in prepared.iter_mut().zip(req.files) {
            p.mappings.out = file;
        }
        let found = match checked {
            Ok(found) => found,
            Err(msg) => {
                for out in outs {
                    out.diagnostics.push(Diagnostic::error(
                        "check_failed",
                        msg.clone(),
                        Span::new(0, 0),
                    ));
                }
                return;
            }
        };
        let mut per_doc: Vec<Vec<(Span, u32, String)>> = vec![Vec::new(); prepared.len()];
        for d in found {
            // Upstream drops what lands in generated code; so does this.
            if let Some(span) = prepared[d.file].mappings.lookup_span(d.span) {
                per_doc[d.file].push((span, d.code, d.message));
            }
        }
        for ((p, out), mut found) in prepared.iter().zip(outs.iter_mut()).zip(per_doc) {
            out.file(
                "json",
                render_check(&p.src, &LineIndex::new(&p.src), &mut found),
            );
        }
    }
}

fn render_check(src: &str, lines: &LineIndex, found: &mut [(Span, u32, String)]) -> String {
    found.sort_by_key(|(span, _, _)| span.lo);
    let mut w = JsonWriter::new(true);
    w.begin_array();
    for (span, code, message) in found.iter() {
        w.begin_object()
            .key("code")
            .num(code)
            .key("message")
            .str(message);
        for (key, at) in [("start", span.lo), ("end", span.hi)] {
            let lc = lines.line_col(src, at);
            w.key(key)
                .begin_object()
                .key("line")
                .num(lc.line - 1)
                .key("character")
                .num(lc.column)
                .end_object();
        }
        w.end_object();
    }
    w.end_array();
    w.finish()
}
