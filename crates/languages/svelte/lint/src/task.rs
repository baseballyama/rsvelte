use std::sync::Arc;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineBreaks;

use crate::Configuration;
use crate::computation::{
    ConditionTypes, LegacyReactivity, LintConfiguration, ModuleSemantic, NativeConditionTypes,
    SameNamedFileOnDisk,
};
use crate::rules::style_attribute::InlineStyles;
use crate::rules::style_sheet::StyleSheetVerdict;
use crate::types::TypeFacts;

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.lint",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[
        Dependency {
            identifier: "svelte.semantic",
            requirement: concat!("=", env!("CARGO_PKG_VERSION")),
        },
        Dependency {
            identifier: "typescript.semantic",
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
    rsvelte_svelte_semantic::register(registry);
    rsvelte_svelte_compile::register_validation(registry);
    rsvelte_typescript_semantic::register(registry);
    registry
        .artifact::<ModuleSemantic>()
        .artifact::<InlineStyles>()
        .artifact::<StyleSheetVerdict>()
        .artifact::<NativeConditionTypes>()
        .artifact::<LegacyReactivity>()
        .artifact::<SameNamedFileOnDisk>();
}

/// Replaces the built-in prototype's condition types with `provider`'s.
///
/// A rule that is off never calls it, and it runs at most once per document. Facts that do not
/// have one type per node of the component's JavaScript fail the rules that read them.
pub fn register_type_provider(
    registry: &mut Registry,
    provider: impl Fn(&DocumentContext<'_>) -> TypeFacts + Send + Sync + 'static,
) {
    registry.provide::<ConditionTypes>(
        "svelte.lint",
        rsvelte_svelte_syntax::matches,
        move |context| {
            let facts = provider(context);
            let Some(resolution) = context.get::<rsvelte_svelte_semantic::Resolved>() else {
                return Err("the type provider ran on a component that does not parse".to_owned());
            };
            let nodes = resolution.semantic().nodes().len();
            if facts.len() == nodes {
                Ok(facts)
            } else {
                Err(format!(
                    "the type provider gave {} condition types for {nodes} JavaScript nodes",
                    facts.len()
                ))
            }
        },
    );
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
        rsvelte_svelte_syntax::matches(document)
            || (self.modules
                && (rsvelte_typescript_tree::matches(document)
                    || rsvelte_typescript_tree::is_jsx(document)))
    }

    fn run(&self, context: &DocumentContext<'_>, out: &mut TaskOutput) {
        let configuration = context
            .facet::<LintConfiguration>()
            .map_or(&*crate::configuration::DEFAULT, |configuration| {
                configuration.as_ref()
            });
        // svelte-eslint-parser throws Svelte's parse error, which ESLint reports as the one
        // finding: the markup's, or a JavaScript one in the template's expressions, which Svelte's
        // parser reads too. It parses scripts itself, so an error in one stays refused.
        let parse_error = || match context.get::<rsvelte_svelte_syntax::Parsed>() {
            Err(error) => Some(error.clone()),
            Ok(_) => rsvelte_svelte_compile::javascript_error(context),
        };
        if rsvelte_svelte_syntax::matches(context.document)
            && let Some(error) = parse_error()
            && !rsvelte_svelte_syntax::parse::in_script_content(
                context.source_text(),
                error.span.start_offset,
            )
        {
            rsvelte_lint_runner::output::report_parse_error(
                out,
                positions(context),
                &error.message,
                error.span.start_offset,
            );
            return;
        }
        let (file, findings, rules) = match crate::rule::File::new(context, configuration.globals())
            .and_then(|file| {
                let (findings, rules) = crate::lint::check(&file, configuration)?;
                Ok((file, findings, rules))
            }) {
            Ok(linted) => linted,
            Err(error) => {
                out.diagnostics.push(error);
                return;
            }
        };
        rsvelte_lint_runner::output::report(
            out,
            positions(context),
            // The rules that ran, so a report tells a rule that found nothing from one that
            // does not run on this file.
            rules.running(configuration, &file).map(|rule| rule.name),
            findings,
        );
    }
}

fn positions<'a>(context: &'a DocumentContext<'_>) -> rsvelte_lint_runner::output::Positions<'a> {
    rsvelte_lint_runner::output::Positions::new(
        context.lines(LineBreaks::Ecmascript),
        context.source_text(),
    )
}

#[cfg(test)]
mod tests;
