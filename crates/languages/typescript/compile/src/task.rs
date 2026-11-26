use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Unsupported;
use rsvelte_kernel::source::document::Document;
use rsvelte_typescript_tree::{Parsed, document_span};

use crate::features::{Feature, first_erasure_feature};

pub(crate) static PLUGIN: Plugin = Plugin {
    identifier: "typescript.compile",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "typescript.tree",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_typescript_tree::register(registry);
    registry.task(Compile);
}

#[derive(Debug)]
pub(crate) struct Compile;

impl Task for Compile {
    fn identifier(&self) -> &'static str {
        "ts.compile/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_typescript_tree::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let script = match context.get::<Parsed>() {
            Ok(script) => script,
            Err(error) => {
                out.diagnostics.push(error.clone());
                return;
            }
        };
        let program = script.tree.get_program(script.root);
        if let Some((feature, span)) = first_erasure_feature(program) {
            let feature = match feature {
                Feature::Enum => "enums",
                Feature::NamespaceWithValues => "namespaces with values",
                Feature::Decorator => "decorators",
                Feature::Accessor => "accessor fields",
                Feature::ParameterProperty => "parameter properties",
                Feature::ImportEquals => "import assignments",
                Feature::ExportAssignment => "export assignments",
            };
            let refusal = Unsupported::at(feature, document_span(span));
            out.diagnostics
                .push(refusal.diagnostic("compile_unsupported", Some("type erasure")));
            return;
        }
        out.file("js", crate::emit(program));
    }
}
