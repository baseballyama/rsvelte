use std::sync::Arc;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::source::document::Document;

use crate::Configuration;
use crate::computation::{
    ConditionTypes, LintConfiguration, ModuleParents, NativeConditionTypes, Parents,
};
use crate::types::TypeFacts;

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.lint",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[
        Dependency {
            identifier: "svelte",
            requirement: concat!("=", env!("CARGO_PKG_VERSION")),
        },
        Dependency {
            identifier: "typescript",
            requirement: concat!("=", env!("CARGO_PKG_VERSION")),
        },
    ],
};

/// Turns on `svelte.lint/default` with the default rules.
pub fn register(registry: &mut Registry) {
    register_artifacts(registry);
    registry.task(Lint { modules: false });
}

pub fn register_artifacts(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_svelte::register(registry);
    rsvelte_typescript::register(registry);
    registry
        .artifact::<Parents>()
        .artifact::<ModuleParents>()
        .artifact::<NativeConditionTypes>();
}

/// Replaces the built-in prototype's condition types with `provider`'s. A rule that is off never
/// calls it, and it runs at most once per document.
pub fn register_type_provider(
    registry: &mut Registry,
    provider: impl Fn(&DocumentContext<'_>) -> TypeFacts + Send + Sync + 'static,
) {
    registry.provide::<ConditionTypes>("svelte.lint", rsvelte_svelte::matches, provider);
}

/// Turns on `svelte.lint/default` with `configuration`. It lints modules only when a configured
/// rule runs on them.
pub fn register_with_configuration(registry: &mut Registry, configuration: Configuration) {
    register_artifacts(registry);
    registry.task(Lint {
        modules: configuration.lints_modules(),
    });
    let configuration = Arc::new(configuration);
    registry.provide::<LintConfiguration>("svelte", |_| true, move |_| Arc::clone(&configuration));
}

#[derive(Debug)]
pub struct Lint {
    /// Whether JavaScript and TypeScript modules are linted, besides components.
    pub modules: bool,
}

impl Task for Lint {
    fn identifier(&self) -> &'static str {
        "svelte.lint/default"
    }

    fn applies(&self, document: &Document) -> bool {
        rsvelte_svelte::matches(document) || (self.modules && rsvelte_typescript::matches(document))
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let configuration = context
            .facet::<LintConfiguration>()
            .map_or(&*crate::configuration::DEFAULT, |configuration| {
                configuration.as_ref()
            });
        let (file, findings) = match crate::rule::File::new(context).and_then(|file| {
            let findings = crate::lint::check(&file, configuration)?;
            Ok((file, findings))
        }) {
            Ok(linted) => linted,
            Err(error) => {
                out.diagnostics.push(error);
                return;
            }
        };
        out.file(
            "lint.json",
            rsvelte_lint_runner::output::render_json(
                context.line_index(),
                // The rules that ran, so a report tells a rule that found nothing from one that
                // does not run on this file.
                configuration
                    .rules()
                    .iter()
                    .filter(|rule| rule.applies(&file))
                    .map(crate::ConfiguredRule::name),
                &findings,
            ),
        );
    }
}
