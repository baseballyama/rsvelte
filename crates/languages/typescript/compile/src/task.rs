use std::path::Path;

use oxc_allocator::{Allocator, CloneIn};
use oxc_ast_visit::VisitMut;
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::Parsed;

use crate::features::{Feature, first_runtime_feature};
use crate::strip::Strip;

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
        Path::new(&document.path)
            .extension()
            .is_some_and(|extension| {
                matches!(
                    extension.to_str(),
                    Some("ts" | "mts" | "cts" | "js" | "mjs" | "cjs")
                )
            })
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
        if let Some((feature, span)) = first_runtime_feature(program) {
            let feature = match feature {
                Feature::Enum => "enums",
                Feature::NamespaceWithValues => "namespaces with values",
                Feature::Decorator => "decorators",
                Feature::Accessor => "accessor fields",
                Feature::ParameterProperty => "parameter properties",
                Feature::ImportEquals => "import assignments",
                Feature::ExportAssignment => "export assignments",
            };
            out.diagnostics.push(Diagnostic::error(
                "compile_unsupported",
                format!("not supported by type erasure yet: {feature}"),
                Span::new(span.start, span.end),
            ));
            return;
        }
        let allocator = Allocator::default();
        let mut program = program.clone_in(&allocator);
        Strip::new(&allocator).visit_program(&mut program);
        out.file("js", crate::print::print(&program));
    }
}
