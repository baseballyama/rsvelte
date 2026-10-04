use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::performance::measurement;
use rsvelte_svelte::{Analyzed, Parsed, Resolved};

use crate::computation::Validated;
use crate::lower::{self, Target};
use crate::{Identified, Planned, ScopedStylesheet};

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.compile",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "svelte",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_svelte::register(registry);
    registry
        .artifact::<Identified>()
        .artifact::<Planned>()
        .artifact::<ScopedStylesheet>()
        .artifact::<Validated>()
        .task(Compile {
            target: Target::Client,
        })
        .task(Compile {
            target: Target::Server,
        });
}

pub fn register_with_configuration(registry: &mut Registry, configuration: crate::Configuration) {
    register(registry);
    let configuration = std::sync::Arc::new(configuration);
    registry.provide::<crate::computation::CompileConfiguration>(
        "svelte",
        rsvelte_svelte::matches,
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
        rsvelte_svelte::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        if let Err(e) = context.get::<Parsed>() {
            out.diagnostics.push(e.clone());
            return;
        }
        let input = crate::CompileInput::from(
            rsvelte_svelte::component_input(context).expect("a parsed component is lowered to HIR"),
        );
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
        let identity = match context.get::<Identified>() {
            Ok(identity) => identity,
            Err(error) => {
                out.diagnostics.push(error.clone());
                return;
            }
        };
        let validated = match context.get::<Validated>() {
            Ok(validated) => validated,
            Err(diagnostic) => {
                out.diagnostics.push(diagnostic.clone());
                return;
            }
        };
        let stylesheet = context.get::<ScopedStylesheet>();
        let facts = lower::Lowering {
            input: &input,
            res,
            an,
            plan,
            identity,
            validated,
            stylesheet: stylesheet.as_deref(),
        };
        match compile_with_facts(facts, self.target) {
            Ok(javascript) => out.file("js", javascript),
            Err(d) => {
                out.diagnostics.push(d);
                return;
            }
        }
        if !validated.is_custom_element()
            && let Some(stylesheet) = stylesheet
        {
            out.file("css", stylesheet.clone());
        }
    }
}

/// The JavaScript module of one target, from any frontend's [`lower::CompileInput`].
///
/// # Errors
///
/// A [`Diagnostic`] for what the compiler rejects or the port does not handle yet.
pub fn compile(
    input: &lower::CompileInput<'_>,
    res: &rsvelte_svelte::semantic::resolve::Resolution,
    an: &rsvelte_svelte::semantic::analyze::Analysis,
    target: Target,
) -> Result<String, Diagnostic> {
    compile_with_configuration(input, res, an, target, &crate::Configuration::default())
}

/// # Errors
/// Compilation or the configured CSS hash function failed.
pub fn compile_with_configuration(
    input: &lower::CompileInput<'_>,
    res: &rsvelte_svelte::semantic::resolve::Resolution,
    an: &rsvelte_svelte::semantic::analyze::Analysis,
    target: Target,
    configuration: &crate::Configuration,
) -> Result<String, Diagnostic> {
    let validated = lower::validate(input, res)?;
    let plan = crate::render_plan::RenderPlan::build(input);
    let identity = crate::OutputIdentity::build_with_configuration(&input.component, configuration)
        .map_err(|error| {
            Diagnostic::error(
                "svelte.compile.css-hash",
                error.to_string(),
                rsvelte_kernel::source::positions::Span::new(0, 0),
            )
        })?;
    let stylesheet = if validated.is_custom_element() && target == Target::Client {
        crate::stylesheet::scoped_stylesheet_with_mode(
            &input.component,
            an,
            &identity,
            rsvelte_stylesheet::scope::RenderMode::Minify,
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
    let module = {
        let _p = measurement::phase(match target {
            Target::Client => "svelte.lower.client",
            Target::Server => "svelte.lower.server",
        });
        lower::lower_with_facts(facts, target)?
    };
    let _p = measurement::phase("js.print");
    Ok(module.emit().out)
}
