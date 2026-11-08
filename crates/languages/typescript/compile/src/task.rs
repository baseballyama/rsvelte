use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;
use rsvelte_typescript_syntax::Parsed;
use rsvelte_typescript_syntax::syntax_tree::TypeScriptFeature;

use crate::codegen;

pub(crate) static PLUGIN: Plugin = Plugin {
    identifier: "typescript.compile",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript.syntax",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_typescript_syntax::register(registry);
    registry.task(Compile);
}

#[derive(Debug)]
pub(crate) struct Compile;

impl Task for Compile {
    fn identifier(&self) -> &'static str {
        "ts.compile/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_typescript_syntax::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let program = match context.get::<Parsed>() {
            Ok(program) => program,
            Err(error) => {
                out.diagnostics.push(error.clone());
                return;
            }
        };
        if let Some(runtime) = program.syntax_tree.typescript_runtime.first() {
            let feature = match runtime.feature {
                TypeScriptFeature::Enum => "enums",
                TypeScriptFeature::NamespaceWithValues => "namespaces with values",
            };
            out.diagnostics.push(Diagnostic::error(
                "compile_unsupported",
                format!("not supported by type erasure yet: {feature}"),
                runtime.span,
            ));
            return;
        }
        out.file(
            "js",
            codegen::print_program(&program.syntax_tree, context.source_text(), program.root).out,
        );
    }
}
