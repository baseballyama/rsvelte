//! `.svue`: Vue's template syntax with Svelte's semantics, compiled by the Svelte compiler.
//!
//! A frontend swap assembled from two plugins and no new compiler: the document is parsed by the
//! Vue plugin's parser (the artifact is the Vue plugin's own [`rsvelte_vue::Parsed`]), and the
//! Svelte plugin's resolution, analysis and lowering compile the Svelte HIR this crate builds from
//! it. What it owns is only that translation ([`frontend`]).
//!
//! The script is a Svelte instance script written as `<script setup>`; `{{ e }}` is `{e}`,
//! `:x="e"` is `x={e}`, `@x="e"` is `onx={e}`, and a `v-if` / `v-else-if` / `v-else` chain is one
//! `{#if}` block (the whitespace between its elements is dropped, as Vue drops it). The oracle is
//! the Svelte compiler on the same component rewritten in Svelte's syntax
//! (`tools/fixtures/source_text/svue.ts`).

pub mod frontend;

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_svelte::compilation::lower::{CompileInput, Target};

#[must_use]
pub fn matches(document: &Document) -> bool {
    std::path::Path::new(&document.path)
        .extension()
        .is_some_and(|e| e == "svue")
}

/// The Svelte HIR of the template, or why it cannot be built; `None` when the document did not
/// parse (the error is on [`rsvelte_vue::Parsed`]).
#[derive(Debug)]
pub struct Frontend;

impl Artifact for Frontend {
    type Output = Option<Result<frontend::SvelteView, Diagnostic>>;

    const NAME: &'static str = "svue.frontend";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let sfc = context.get::<rsvelte_vue::Parsed>().as_ref().ok()?;
        Some(frontend::build(sfc, context.source_text()))
    }
}

/// Svelte's name resolution over the Vue parser's tree.
#[derive(Debug)]
pub struct Resolved;

impl Artifact for Resolved {
    type Output = Option<rsvelte_svelte::semantic::resolve::Resolution>;

    const NAME: &'static str = "svue.resolve";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let sfc = context.get::<rsvelte_vue::Parsed>().as_ref().ok()?;
        let view = context.get::<Frontend>().as_ref()?.as_ref().ok()?;
        Some(rsvelte_svelte::semantic::resolve::resolve(
            &sfc.javascript,
            sfc.program,
            &view.template_expressions,
        ))
    }
}

#[derive(Debug)]
pub struct Analyzed;

impl Artifact for Analyzed {
    type Output = Option<rsvelte_svelte::semantic::analyze::Analysis>;

    const NAME: &'static str = "svue.analyze";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let input = compile_input(context)?;
        let res = context.get::<Resolved>().as_ref()?;
        Some(rsvelte_svelte::semantic::analyze::analyze(
            &input,
            res,
            &context.document.path,
        ))
    }
}

fn compile_input<'a>(context: &'a DocumentContext<'_>) -> Option<CompileInput<'a>> {
    let sfc = context.get::<rsvelte_vue::Parsed>().as_ref().ok()?;
    let view = context.get::<Frontend>().as_ref()?.as_ref().ok()?;
    Some(CompileInput {
        javascript: &sfc.javascript,
        program: sfc.program,
        compiler_syntax_tree: &view.compiler_syntax_tree,
        style: sfc.styles.first().map(|s| &s.sheet),
        template_expressions: &view.template_expressions,
        source_text: context.source_text(),
    })
}

pub fn register(reg: &mut Registry) {
    reg.artifact::<rsvelte_vue::Parsed>()
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

/// The Svelte compiler's output for one target ([`rsvelte_svelte::computation::tasks::compile`]).
#[derive(Debug)]
pub struct Compile {
    pub target: Target,
}

impl Task for Compile {
    fn identifier(&self) -> &'static str {
        match self.target {
            Target::Client => "svue.compile/client",
            Target::Server => "svue.compile/server",
        }
    }

    fn applies(&self, document: &Document) -> bool {
        matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        if let Err(e) = context.get::<rsvelte_vue::Parsed>() {
            out.diagnostics.push(e.clone());
            return;
        }
        if let Some(Err(e)) = context.get::<Frontend>() {
            out.diagnostics.push(e.clone());
            return;
        }
        let input = compile_input(context).expect("a parsed document has a Svelte view");
        let res = context
            .get::<Resolved>()
            .as_ref()
            .expect("a Svelte view is resolved");
        let an = context
            .get::<Analyzed>()
            .as_ref()
            .expect("a Svelte view is analysed");
        match rsvelte_svelte::computation::tasks::compile(&input, res, an, self.target) {
            Ok(javascript) => out.file("js", javascript),
            Err(d) => {
                out.diagnostics.push(d);
                return;
            }
        }
        if let Some(stylesheet) = rsvelte_svelte::computation::tasks::scoped_stylesheet(&input, an)
        {
            out.file("css", stylesheet);
        }
    }
}
