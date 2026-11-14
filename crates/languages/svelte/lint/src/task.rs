use std::borrow::Cow;
use std::sync::Arc;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineBreaks;

use crate::Configuration;
use crate::computation::{
    ConditionTypes, LegacyReactivity, LintConfiguration, LoweredAsTypeScript, ModuleSemantic,
    NativeConditionTypes, PostcssConfigurationOnDisk, ResolvedAsTypeScript, SameNamedFileOnDisk,
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
        .artifact::<LoweredAsTypeScript>()
        .artifact::<ResolvedAsTypeScript>()
        .artifact::<NativeConditionTypes>()
        .artifact::<LegacyReactivity>()
        .artifact::<SameNamedFileOnDisk>()
        .artifact::<PostcssConfigurationOnDisk>();
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
            let Ok(linted) = crate::computation::Linted::of(context) else {
                return Err("the type provider ran on a component that does not parse".to_owned());
            };
            let nodes = linted.resolution().semantic().nodes().len();
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
        // parser reads too. It parses a script itself, with typescript-eslint whatever the
        // script's language, and throws what that rejects; the rules read a script it parses.
        let javascript_error;
        let parse_error = if !rsvelte_svelte_syntax::matches(context.document) {
            None
        } else if let Err(error) = context.get::<rsvelte_svelte_syntax::Parsed>() {
            Some(error)
        } else {
            javascript_error = rsvelte_svelte_semantic::javascript_error(context);
            javascript_error.as_ref()
        };
        if let Some(error) = parse_error {
            let verdict = if rsvelte_svelte_syntax::parse::in_script_content(
                context.source_text(),
                error.span.start_offset,
            ) {
                typescript_eslint_verdict(context)
            } else {
                TypescriptEslint::Throws(
                    Cow::Borrowed(error.message.as_str()),
                    error.span.start_offset,
                )
            };
            match verdict {
                TypescriptEslint::Throws(message, at) => {
                    rsvelte_lint_runner::output::report_parse_error(
                        out,
                        positions(context),
                        &message,
                        at,
                    );
                    return;
                }
                TypescriptEslint::Unknown => {
                    out.diagnostics.push(error.clone());
                    return;
                }
                TypescriptEslint::Parses => {}
            }
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

/// What typescript-eslint does with the scripts when the compiler rejects one.
enum TypescriptEslint<'a> {
    /// It throws this message at this offset.
    Throws(Cow<'a, str>, u32),
    /// It parses them, and the rules read them.
    Parses,
    /// This port cannot tell what it throws.
    Unknown,
}

/// What typescript-eslint does with the first script the compiler rejects.
fn typescript_eslint_verdict<'a>(context: &'a DocumentContext<'_>) -> TypescriptEslint<'a> {
    // svelte-eslint-parser parses the template with the scripts blanked out first, so an error of
    // the template wins over the scripts'.
    let component = match context.get::<rsvelte_svelte_syntax::ParsedAsTypeScript>() {
        Ok(component) => component,
        Err(error) => {
            return TypescriptEslint::Throws(
                Cow::Borrowed(error.message.as_str()),
                error.span.start_offset,
            );
        }
    };
    let Some(error) =
        rsvelte_typescript_tree::typescript_eslint_error(&component.script_typescript_errors)
    else {
        return TypescriptEslint::Parses;
    };
    let at = error.diagnostic.span.start_offset;
    // svelte-eslint-parser hands typescript-eslint the template's code after the script's, so
    // what it throws at the script's end depends on that code.
    let inside = (component.module.iter().chain(&component.instance))
        .any(|script| script.content.start_offset <= at && at < script.content.end_offset);
    // An error without TypeScript's code is one this port does not know TypeScript's verdict on.
    if !inside || error.typescript_code.is_none() {
        return TypescriptEslint::Unknown;
    }
    // An error it does not throw leaves the script to the rules.
    error
        .typescript_eslint_message()
        .map_or(TypescriptEslint::Parses, |message| {
            TypescriptEslint::Throws(message, at)
        })
}

fn positions<'a>(context: &'a DocumentContext<'_>) -> rsvelte_lint_runner::output::Positions<'a> {
    rsvelte_lint_runner::output::Positions::new(
        context.lines(LineBreaks::Ecmascript),
        context.source_text(),
    )
}

#[cfg(test)]
mod tests;
