use oxc_allocator::Allocator;
use oxc_ast::ast::Program;
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineBreaks;
use rsvelte_svelte_semantic::{Analyzed, Resolved};
use rsvelte_typescript_compile::print;

use crate::computation::Validated;
use crate::{Identified, Planned, ScopedStylesheet, Target, lower};

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.compile",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "svelte.semantic",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_svelte_semantic::register(registry);
    registry
        .artifact::<Identified>()
        .artifact::<Planned>()
        .artifact::<ScopedStylesheet>()
        .artifact::<Validated>()
        .artifact::<crate::warnings::Warned>()
        .task(Compile {
            target: Target::Client,
            mapped: false,
        })
        .task(Compile {
            target: Target::Server,
            mapped: false,
        })
        .task(Compile {
            target: Target::Client,
            mapped: true,
        })
        .task(Compile {
            target: Target::Server,
            mapped: true,
        })
        .task(crate::CompileModule {
            target: Target::Client,
        })
        .task(crate::CompileModule {
            target: Target::Server,
        })
        .task(crate::Warn);
}

pub fn register_with_configuration(registry: &mut Registry, configuration: crate::Configuration) {
    register(registry);
    let configuration = std::sync::Arc::new(configuration);
    registry.provide::<crate::computation::CompileConfiguration>(
        "svelte",
        rsvelte_svelte_syntax::matches,
        move |_| std::sync::Arc::clone(&configuration),
    );
}

#[derive(Debug)]
pub struct Compile {
    pub target: Target,
    /// Also writes the module's source map, `js.map`.
    pub mapped: bool,
}

impl Task for Compile {
    fn identifier(&self) -> &'static str {
        match (self.target, self.mapped) {
            (Target::Client, false) => "svelte.compile/client",
            (Target::Server, false) => "svelte.compile/server",
            (Target::Client, true) => "svelte.compile.sourcemap/client",
            (Target::Server, true) => "svelte.compile.sourcemap/server",
        }
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        match compiled(context, self.target, self.mapped) {
            Ok(compiled) => {
                if self.mapped {
                    let map = compiled.javascript.source_map(
                        context.source_text(),
                        context.lines(LineBreaks::Newline),
                        crate::compiler::source_name(&context.document.path),
                    );
                    out.file("js.map", map);
                }
                out.file("js", compiled.javascript.out);
                // An empty stylesheet is no file, as the official output writes none.
                if let Some(stylesheet) = compiled.stylesheet.filter(|s| !s.is_empty()) {
                    out.file("css", stylesheet.to_owned());
                }
                out.diagnostics.extend(compiled.warnings.iter().cloned());
            }
            Err(diagnostic) => out.diagnostics.push(diagnostic),
        }
    }
}

/// One target's output: the module, the stylesheet when the component does not inject it, and the
/// warnings `compile` shows.
pub(crate) struct Compiled<'a> {
    pub(crate) javascript: Emitter,
    pub(crate) stylesheet: Option<&'a str>,
    pub(crate) warnings: &'a [Diagnostic],
}

/// # Errors
///
/// What [`lower_document`] rejects, then the error that stops the warnings.
pub(crate) fn compiled<'a>(
    context: &'a DocumentContext<'_>,
    target: Target,
    mapped: bool,
) -> Result<Compiled<'a>, Diagnostic> {
    let javascript = rsvelte_typescript_tree::with_scratch_arena(|allocator| {
        let module = lower_document(context, target, allocator)?;
        let _p = measurement::phase("js.print");
        Ok::<_, Diagnostic>(print::emit_with(
            &module,
            mapped.then(|| context.lines(LineBreaks::Newline)),
            print::Comments::Placed,
        ))
    })?;
    let validated = context.get::<Validated>().as_ref().map_err(Clone::clone)?;
    let stylesheet = if validated.injects_stylesheet() {
        None
    } else {
        context.get::<ScopedStylesheet>().as_deref()
    };
    let warnings = context
        .get::<crate::warnings::Warned>()
        .as_ref()
        .map_err(Clone::clone)?;
    Ok(Compiled {
        javascript,
        stylesheet,
        warnings,
    })
}

/// One target's module, lowered from the document's artifacts exactly as the compile task lowers
/// it, so a caller that needs more than the printed text (such as its mappings) sees the same
/// module.
///
/// # Errors
///
/// The first [`Diagnostic`]: the parse error, the CSS hash function's failure, a rejected option,
/// or what the port does not handle yet.
///
/// # Panics
///
/// If a parsed component lacks its compiler tree, resolution, analysis or render plan, which every
/// registered Svelte document has.
pub fn lower_document<'o>(
    context: &'o DocumentContext<'_>,
    target: Target,
    allocator: &'o Allocator,
) -> Result<Program<'o>, Diagnostic> {
    rsvelte_svelte_semantic::javascript_error::fully_parsed(context)?;
    let input =
        crate::computation::compile_input(context).expect("a parsed component is lowered to HIR");
    let res = context
        .get::<Resolved>()
        .as_ref()
        .expect("a parsed component is resolved");
    let an = context
        .get::<Analyzed>()
        .as_ref()
        .expect("a parsed component is analysed");
    let plan = context
        .get::<Planned>()
        .as_ref()
        .expect("a parsed component has a render plan");
    let identity = context.get::<Identified>().as_ref().map_err(Clone::clone)?;
    let validated = context.get::<Validated>().as_ref().map_err(Clone::clone)?;
    let stylesheet = context.get::<ScopedStylesheet>();
    let _p = measurement::phase(target.lower_phase());
    lower::lower_with_facts(
        lower::LoweringFacts {
            input: &input,
            res,
            an,
            plan,
            identity,
            validated,
            stylesheet: stylesheet.as_deref(),
        },
        target,
        allocator,
    )
}

/// The JavaScript module of one target, from any frontend's [`crate::CompileInput`], with the
/// default options.
///
/// # Errors
///
/// A [`Diagnostic`] for what the compiler rejects or the port does not handle yet.
pub fn compile_to_javascript(
    input: &crate::CompileInput<'_>,
    res: &rsvelte_svelte_semantic::resolve::Resolution,
    an: &rsvelte_svelte_semantic::analyze::Analysis,
    target: Target,
) -> Result<String, Diagnostic> {
    let plan = crate::render_plan::RenderPlan::build(input);
    rsvelte_typescript_tree::with_scratch_arena(|allocator| {
        let module = {
            let _p = measurement::phase(target.lower_phase());
            lower::lower_with_plan(input, res, an, target, &plan, allocator)?
        };
        let _p = measurement::phase("js.print");
        Ok(print::print_with(&module, print::Comments::Placed))
    })
}
