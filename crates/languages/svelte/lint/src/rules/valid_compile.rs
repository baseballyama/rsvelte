use std::sync::Arc;

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_lint_runner::rule::{Report, Reporter};
use serde::Deserialize;

use super::compile_warnings::{apply, ignores};
use crate::LintSettings;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};
use crate::settings::Warning;

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/valid-compile",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Options {
    #[serde(default)]
    ignore_warnings: bool,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let ignore_warnings = options.single::<Options>()?.ignore_warnings;
    Ok(Box::new(ValidCompile {
        ignore_warnings,
        settings: Arc::clone(options.settings),
    }))
}

#[derive(Debug)]
struct ValidCompile {
    ignore_warnings: bool,
    settings: Arc<LintSettings>,
}

impl SvelteRule for ValidCompile {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let Some(compile) = file.compile_warnings() else {
            return;
        };
        let component = file.component().expect("a component rule");
        let source = file.source();
        let config = self.settings.svelte_config.as_ref();
        let experimental_async = config.is_some_and(|c| c.experimental_async);
        let applied = apply(
            file,
            compile,
            &ignores(component, source),
            experimental_async,
        );
        if let Some(error) = &applied.error {
            report(reporter, error, &error.message, &error.code);
            return;
        }
        if self.ignore_warnings {
            return;
        }
        // Upstream does not report unused selectors in `<style global>`.
        let global = component
            .style
            .as_ref()
            .filter(|style| {
                style
                    .attributes
                    .iter()
                    .any(|(n, _)| n.text(source) == "global")
            })
            .map(|style| style.span);
        for warning in applied.warnings {
            let in_global = global.is_some_and(|g| {
                g.start_offset <= warning.span.start_offset
                    && warning.span.end_offset <= g.end_offset
            });
            if in_global && warning.code == "css_unused_selector" {
                continue;
            }
            let original = Warning {
                code: warning.code.to_string(),
                message: warning.message.clone(),
            };
            let handled = match config.and_then(|c| c.on_warning.as_ref()) {
                Some(handler) => (handler.0)(original),
                None => Some(original),
            };
            if let Some(handled) = handled {
                report(reporter, warning, &handled.message, &handled.code);
            }
        }
    }
}

fn report(reporter: &mut Reporter<'_>, at: &Diagnostic, message: &str, code: &str) {
    reporter.report(Report::range(format!("{message}({code})"), at.span));
}
