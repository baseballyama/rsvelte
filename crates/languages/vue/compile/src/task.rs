use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::performance::measurement;
use rsvelte_kernel::source::document::Document;
use rsvelte_vue_semantic::{Lowered, Resolved};
use rsvelte_vue_syntax::Parsed;

pub(crate) static PLUGIN: Plugin = Plugin {
    identifier: "vue.compile",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "vue.semantic",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_vue_semantic::register(registry);
    registry.task(Compile);
}

#[derive(Debug)]
pub(crate) struct Compile;

impl Task for Compile {
    fn identifier(&self) -> &'static str {
        "vue.compile/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_vue_syntax::matches(document)
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
