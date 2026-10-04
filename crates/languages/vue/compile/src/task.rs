use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::performance::measurement;
use rsvelte_vue::{Lowered, Parsed, Resolved};

pub static PLUGIN: Plugin = Plugin {
    identifier: "vue.compile",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "vue",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_vue::register(registry);
    registry.task(Compile);
}

#[derive(Debug)]
pub struct Compile;

impl Task for Compile {
    fn identifier(&self) -> &'static str {
        "vue.compile/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_vue::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let c = match context.get::<Parsed>() {
            Ok(c) => c,
            Err(e) => {
                out.diagnostics.push(e.clone());
                return;
            }
        };
        let res = context
            .get::<Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        let compiled = {
            let _p = measurement::phase("vue.compile");
            let compiler_syntax_tree = context.get::<Lowered>().as_ref();
            let input = crate::compile::CompileInput::from_single_file_component(
                c,
                compiler_syntax_tree,
                context.source_text(),
            );
            crate::compile::compile(&input, res, &context.document.path)
        };
        match compiled {
            Ok(o) => {
                out.file("js", o.javascript);
                if let Some(stylesheet) = o.stylesheet {
                    out.file("css", stylesheet);
                }
            }
            Err(u) => out.diagnostics.push(Diagnostic::error(
                "compile_unsupported",
                format!("not supported yet: {}", u.what),
                u.span(),
            )),
        }
    }
}
