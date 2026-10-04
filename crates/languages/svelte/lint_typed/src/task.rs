use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};

use crate::Configuration;
use crate::computation::{ConditionTypes, LintConfiguration};

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.lint.typed",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[
        Dependency {
            identifier: "svelte.lint",
            requirement: concat!("=", env!("CARGO_PKG_VERSION")),
        },
        Dependency {
            identifier: "typescript.check",
            requirement: concat!("=", env!("CARGO_PKG_VERSION")),
        },
    ],
};

pub fn register(registry: &mut Registry) {
    register_with_type_provider(registry, crate::computation::native_types);
}

pub fn register_with_type_provider(
    registry: &mut Registry,
    provider: impl Fn(&DocumentContext<'_>) -> crate::types::TypeFacts + Send + Sync + 'static,
) {
    registry.plugin(&PLUGIN);
    rsvelte_svelte_lint::register_artifacts(registry);
    rsvelte_typescript_check::register_service(registry);
    registry.provide::<ConditionTypes>("svelte", rsvelte_svelte::matches, provider);
    registry.task(Lint);
}

pub fn register_with_configuration(registry: &mut Registry, configuration: Configuration) {
    register(registry);
    let configuration = std::sync::Arc::new(configuration);
    registry.provide::<LintConfiguration>("svelte", rsvelte_svelte::matches, move |_| {
        std::sync::Arc::clone(&configuration)
    });
}

#[derive(Debug)]
pub struct Lint;

impl Task for Lint {
    fn identifier(&self) -> &'static str {
        "svelte.lint.typed/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let default = Configuration::default();
        let configuration = context
            .facet::<LintConfiguration>()
            .map_or(&default, |configuration| configuration.as_ref());
        let findings = match crate::lint(context, configuration) {
            Ok(findings) => findings,
            Err(error) => {
                out.diagnostics.push(error);
                return;
            }
        };
        out.file(
            "lint.json",
            rsvelte_lint::output::render_json(
                context.line_index(),
                if configuration.no_unnecessary_condition.is_some() {
                    &[crate::rules::RULE]
                } else {
                    &[]
                },
                &findings,
            ),
        );
    }
}
