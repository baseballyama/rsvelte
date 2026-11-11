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
use rsvelte_svelte_semantic::{Analyzed, Resolved};
use rsvelte_typescript_compile::print;

use crate::computation::Validated;
use crate::lower::{self, Target};
use crate::{Identified, Planned, ScopedStylesheet};

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
        })
        .task(Compile {
            target: Target::Server,
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
}

impl Task for Compile {
    fn identifier(&self) -> &'static str {
        match self.target {
            Target::Client => "svelte.compile/client",
            Target::Server => "svelte.compile/server",
        }
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        match compiled(context, self.target, false) {
            Ok(compiled) => match context.get::<crate::warnings::Warned>() {
                Ok(shown) => {
                    out.file("js", compiled.javascript.out);
                    // An empty stylesheet is no file, as the official output writes none.
                    if let Some(stylesheet) = compiled.stylesheet.filter(|s| !s.is_empty()) {
                        out.file("css", stylesheet.to_owned());
                    }
                    out.diagnostics.extend(shown.iter().cloned());
                }
                Err(error) => out.diagnostics.push(error.clone()),
            },
            Err(diagnostic) => out.diagnostics.push(diagnostic),
        }
    }
}

/// One target's output: the module, and the stylesheet when the component does not inject it.
pub(crate) struct Compiled<'a> {
    pub(crate) javascript: Emitter,
    pub(crate) stylesheet: Option<&'a str>,
}

/// # Errors
///
/// What [`lower_document`] rejects.
pub(crate) fn compiled<'a>(
    context: &'a DocumentContext<'_>,
    target: Target,
    mapped: bool,
) -> Result<Compiled<'a>, Diagnostic> {
    let allocator = Allocator::default();
    let module = lower_document(context, target, &allocator)?;
    let javascript = {
        let _p = measurement::phase("js.print");
        if mapped {
            print::print_mapped(&module, context.line_index())
        } else {
            Emitter {
                out: print::print(&module),
                mappings: Vec::new(),
            }
        }
    };
    let validated = context.get::<Validated>().as_ref().map_err(Clone::clone)?;
    let stylesheet = if validated.injects_css() {
        None
    } else {
        context.get::<ScopedStylesheet>().as_deref()
    };
    Ok(Compiled {
        javascript,
        stylesheet,
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
    if let Err(e) = rsvelte_svelte_syntax::fully_parsed(context) {
        return Err(e.clone());
    }
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
    lower_measured(
        lower::Lowering {
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

/// The JavaScript module of one target, from any frontend's [`lower::CompileInput`], with the
/// default options.
///
/// # Errors
///
/// A [`Diagnostic`] for what the compiler rejects or the port does not handle yet.
pub fn compile_input(
    input: &lower::CompileInput<'_>,
    res: &rsvelte_svelte_semantic::resolve::Resolution,
    an: &rsvelte_svelte_semantic::analyze::Analysis,
    target: Target,
) -> Result<String, Diagnostic> {
    let configuration = crate::Configuration::default();
    let validated = lower::validate(input, res)?;
    let plan = crate::render_plan::RenderPlan::build(input);
    let identity =
        crate::OutputIdentity::build_with_configuration(&input.component, &configuration).map_err(
            |error| {
                Diagnostic::error(
                    "svelte.compile.css-hash",
                    error.to_string(),
                    rsvelte_kernel::source::positions::Span::new(0, 0),
                )
            },
        )?;
    let stylesheet = if validated.embeds_css(target) {
        crate::stylesheet::scoped_stylesheet_with_mode(
            &input.component,
            an,
            &identity,
            rsvelte_stylesheet_compile::scope::RenderMode::Minify,
        )
    } else {
        None
    };
    compile_with_facts(
        lower::Lowering {
            input,
            res,
            an,
            plan: &plan,
            identity: &identity,
            validated: &validated,
            stylesheet: stylesheet.as_deref(),
        },
        target,
    )
}

fn compile_with_facts(
    facts: lower::Lowering<'_, '_>,
    target: Target,
) -> Result<String, Diagnostic> {
    let allocator = Allocator::default();
    let module = lower_measured(facts, target, &allocator)?;
    let _p = measurement::phase("js.print");
    Ok(print::print(&module))
}

fn lower_measured<'o>(
    facts: lower::Lowering<'_, 'o>,
    target: Target,
    allocator: &'o Allocator,
) -> Result<Program<'o>, Diagnostic> {
    let _p = measurement::phase(match target {
        Target::Client => "svelte.lower.client",
        Target::Server => "svelte.lower.server",
    });
    lower::lower_with_facts(facts, target, allocator)
}
