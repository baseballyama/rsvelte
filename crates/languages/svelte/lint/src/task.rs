use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};

use crate::Configuration;
use crate::computation::{LintConfiguration, Parents};

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.lint",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "svelte",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    register_artifacts(registry);
    registry.task(Lint);
}

pub fn register_artifacts(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_svelte::register(registry);
    registry.artifact::<Parents>();
}

#[derive(Debug)]
pub struct Lint;

impl Task for Lint {
    fn identifier(&self) -> &'static str {
        "svelte.lint/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte::matches(document)
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let default = Configuration::default();
        let configuration = context
            .facet::<LintConfiguration>()
            .map_or(&default, |configuration| configuration.as_ref());
        let findings = match crate::lint::lint(context, configuration) {
            Ok(findings) => findings,
            Err(error) => {
                out.diagnostics.push(error);
                return;
            }
        };
        let rules = configuration.rules();
        out.file(
            "lint.json",
            rsvelte_lint::output::render_json_with_rules(
                context.line_index(),
                rules.iter().map(|rule| rule.name()),
                &findings,
            ),
        );
    }
}

pub fn register_with_configuration(registry: &mut Registry, configuration: Configuration) {
    register(registry);
    let configuration = std::sync::Arc::new(configuration);
    registry.provide::<LintConfiguration>("svelte", rsvelte_svelte::matches, move |_| {
        std::sync::Arc::clone(&configuration)
    });
}
