//! `.svue`: Vue's template syntax with Svelte's semantics, compiled by the Svelte compiler.
//!
//! A frontend swap assembled from two plugins and no new compiler: the document is parsed by the
//! Vue plugin's parser (the artifact is the Vue plugin's own [`rsv_vue::Parsed`]), and the Svelte
//! plugin's resolution, analysis and lowering compile the Svelte HIR this crate builds from it.
//! What it owns is only that translation ([`frontend`]).
//!
//! The script is a Svelte instance script written as `<script setup>`; `{{ e }}` is `{e}`,
//! `:x="e"` is `x={e}`, `@x="e"` is `onx={e}`, and a `v-if` / `v-else-if` / `v-else` chain is one
//! `{#if}` block (the whitespace between its elements is dropped, as Vue drops it). The oracle is
//! the Svelte compiler on the same component rewritten in Svelte's syntax
//! (`tools/fixtures/src/svue.ts`).

pub mod frontend;

use rsv_kernel::db::{Artifact, Ctx};
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::pipeline::{Document, Language, Registry, Task, TaskOutput};
use rsv_svelte::lower::{CompileInput, Target};

#[derive(Debug)]
pub struct Svue;

impl Language for Svue {
    fn id(&self) -> &'static str {
        "svue"
    }

    fn matches(&self, path: &str) -> bool {
        std::path::Path::new(path)
            .extension()
            .is_some_and(|e| e == "svue")
    }
}

/// The Svelte HIR of the template, or why it cannot be built; `None` when the document did not
/// parse (the error is on [`rsv_vue::Parsed`]).
#[derive(Debug)]
pub struct Frontend;

impl Artifact for Frontend {
    type Output = Option<Result<frontend::SvelteView, Diagnostic>>;

    const NAME: &'static str = "svue.frontend";

    fn compute(ctx: &Ctx<'_>) -> Self::Output {
        let sfc = ctx.get::<rsv_vue::Parsed>().as_ref().ok()?;
        Some(frontend::build(sfc, ctx.src()))
    }
}

/// Svelte's name resolution over the Vue parser's tree.
#[derive(Debug)]
pub struct Resolved;

impl Artifact for Resolved {
    type Output = Option<rsv_svelte::resolve::Resolution>;

    const NAME: &'static str = "svue.resolve";

    fn compute(ctx: &Ctx<'_>) -> Self::Output {
        let sfc = ctx.get::<rsv_vue::Parsed>().as_ref().ok()?;
        let view = ctx.get::<Frontend>().as_ref()?.as_ref().ok()?;
        Some(rsv_svelte::resolve::resolve(
            &sfc.js,
            sfc.program,
            &view.hir,
        ))
    }
}

#[derive(Debug)]
pub struct Analyzed;

impl Artifact for Analyzed {
    type Output = Option<rsv_svelte::analyze::Analysis>;

    const NAME: &'static str = "svue.analyze";

    fn compute(ctx: &Ctx<'_>) -> Self::Output {
        let input = compile_input(ctx)?;
        let res = ctx.get::<Resolved>().as_ref()?;
        Some(rsv_svelte::analyze::analyze(&input, res, &ctx.doc.path))
    }
}

fn compile_input<'a>(ctx: &'a Ctx<'_>) -> Option<CompileInput<'a>> {
    let sfc = ctx.get::<rsv_vue::Parsed>().as_ref().ok()?;
    let view = ctx.get::<Frontend>().as_ref()?.as_ref().ok()?;
    Some(CompileInput {
        js: &sfc.js,
        program: sfc.program,
        hir: &view.hir,
        style: sfc.styles.first().map(|s| &s.sheet),
        template_exprs: &view.template_exprs,
        src: ctx.src(),
    })
}

pub fn register(reg: &mut Registry) {
    reg.language(Svue)
        .artifact::<rsv_vue::Parsed>()
        .artifact::<Frontend>()
        .artifact::<Resolved>()
        .artifact::<Analyzed>()
        .task(Compile {
            target: Target::Client,
        })
        .task(Compile {
            target: Target::Server,
        });
}

/// The Svelte compiler's output for one target ([`rsv_svelte::tasks::compile`]).
#[derive(Debug)]
pub struct Compile {
    pub target: Target,
}

impl Task for Compile {
    fn id(&self) -> &'static str {
        match self.target {
            Target::Client => "svue.compile/client",
            Target::Server => "svue.compile/server",
        }
    }

    fn applies(&self, doc: &Document) -> bool {
        doc.lang == "svue"
    }

    fn run(&self, ctx: &Ctx<'_>, out: &mut TaskOutput) {
        if let Err(e) = ctx.get::<rsv_vue::Parsed>() {
            out.diagnostics.push(e.clone());
            return;
        }
        if let Some(Err(e)) = ctx.get::<Frontend>() {
            out.diagnostics.push(e.clone());
            return;
        }
        let input = compile_input(ctx).expect("a parsed document has a Svelte view");
        let res = ctx
            .get::<Resolved>()
            .as_ref()
            .expect("a Svelte view is resolved");
        let an = ctx
            .get::<Analyzed>()
            .as_ref()
            .expect("a Svelte view is analysed");
        match rsv_svelte::tasks::compile(&input, res, an, self.target) {
            Ok(js) => out.file("js", js),
            Err(d) => {
                out.diagnostics.push(d);
                return;
            }
        }
        if let Some(css) = rsv_svelte::tasks::scoped_css(&input, an) {
            out.file("css", css);
        }
    }
}
