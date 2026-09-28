//! The tasks this plugin offers. A task id is also the fixture path of its expected output
//! (`svelte.compile/client` → `expected/svelte.compile/client.*`).

use crate::lower::{self, Target};
use crate::{Analyzed, Parsed, ScopedCss};
use rsv_kernel::db::Ctx;
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::metrics;
use rsv_kernel::pipeline::{Document, Registry, Task, TaskOutput};
use rsv_kernel::source::Span;

pub fn register(reg: &mut Registry) {
    reg.task(Compile {
        target: Target::Client,
    })
    .task(Compile {
        target: Target::Server,
    })
    .task(Format);
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
                Target::Client => lower::client::lower(c, ctx.src(), an),
                Target::Server => lower::server::lower(c, ctx.src(), an),
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
                format!("not supported by the formatter yet: {}", u.0),
                Span::new(0, 0),
            )),
        }
    }
}
