use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::performance::measurement;
use rsvelte_svelte::{Analyzed, Parsed, Resolved, ScopedStylesheet};
use rsvelte_typescript::syntax_tree::{TypeScriptFeature, TypeScriptRuntime};

use crate::lower::{self, Target};

pub fn register(registry: &mut Registry) {
    rsvelte_svelte::register(registry);
    registry
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
        let input =
            rsvelte_svelte::compile_input(context).expect("a parsed component is lowered to HIR");
        let res = context
            .get::<Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        let an = context
            .get::<Analyzed>()
            .as_ref()
            .expect("a parsed component is analysed");
        let plan = context
            .get::<rsvelte_svelte::Planned>()
            .as_ref()
            .expect("a parsed component has a render plan");
        match compile_with_plan(&input, res, an, self.target, plan) {
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
        &rsvelte_svelte::compilation::render_plan::RenderPlan::build(input),
    )
}

fn compile_with_plan(
    input: &lower::CompileInput<'_>,
    res: &rsvelte_svelte::semantic::resolve::Resolution,
    an: &rsvelte_svelte::semantic::analyze::Analysis,
    target: Target,
    plan: &rsvelte_svelte::compilation::render_plan::RenderPlan,
) -> Result<String, Diagnostic> {
    if let Some(t) = input.javascript.typescript_runtime.first() {
        return Err(typescript_invalid_feature(t));
    }
    let (syntax_tree, root) = {
        let _p = measurement::phase(match target {
            Target::Client => "svelte.lower.client",
            Target::Server => "svelte.lower.server",
        });
        lower::lower_with_plan(input, res, an, target, plan)?
    };
    let _p = measurement::phase("js.print");
    Ok(
        rsvelte_typescript_compile::codegen::print_program(&syntax_tree, input.source_text, root)
            .out,
    )
}

/// Upstream `remove_typescript_nodes` erases types and refuses what has a runtime value.
fn typescript_invalid_feature(t: &TypeScriptRuntime) -> Diagnostic {
    let feature = match t.feature {
        TypeScriptFeature::Enum => "enums",
        TypeScriptFeature::NamespaceWithValues => "namespaces with non-type nodes",
    };
    Diagnostic::error(
        "typescript_invalid_feature",
        format!(
            "TypeScript language features like {feature} are not natively supported, and their \
             use is generally discouraged. Outside of `<script>` tags, these features are not \
             supported. For use within `<script>` tags, you will need to use a preprocessor to \
             convert it to JavaScript before it gets passed to the Svelte compiler. If you are \
             using `vitePreprocess`, make sure to specifically enable preprocessing script tags \
             (`vitePreprocess({{ script: true }})`)\n\
             https://svelte.dev/e/typescript_invalid_feature"
        ),
        t.span,
    )
}
