use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::performance::measurement;
use rsvelte_svelte::{Analyzed, Parsed, Resolved};

use crate::lower::{self, Target};
use crate::{Identified, Planned, ScopedStylesheet};

pub fn register(registry: &mut Registry) {
    rsvelte_svelte::register(registry);
    registry
        .artifact::<Identified>()
        .artifact::<Planned>()
        .artifact::<ScopedStylesheet>()
        .task(Compile {
            target: Target::Client,
        })
        .task(Compile {
            target: Target::Server,
        });
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
        let identity = context
            .get::<Identified>()
            .as_ref()
            .expect("a parsed component has output names");
        match compile_with_plan(&input, res, an, self.target, plan, identity) {
            Ok(javascript) => out.file("js", javascript),
            Err(d) => {
                out.diagnostics.push(d);
                return;
            }
        }
        if let Some(stylesheet) = context.get::<ScopedStylesheet>() {
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
    compile_with_plan(
        input,
        res,
        an,
        target,
        &crate::render_plan::RenderPlan::build(input),
        &crate::OutputIdentity::build(&input.component),
    )
}

fn compile_with_plan(
    input: &lower::CompileInput<'_>,
    res: &rsvelte_svelte::semantic::resolve::Resolution,
    an: &rsvelte_svelte::semantic::analyze::Analysis,
    target: Target,
    plan: &crate::render_plan::RenderPlan,
    identity: &crate::OutputIdentity,
) -> Result<String, Diagnostic> {
    let module = {
        let _p = measurement::phase(match target {
            Target::Client => "svelte.lower.client",
            Target::Server => "svelte.lower.server",
        });
        lower::lower_with_facts(input, res, an, target, plan, identity)?
    };
    let _p = measurement::phase("js.print");
    Ok(module.emit().out)
}
