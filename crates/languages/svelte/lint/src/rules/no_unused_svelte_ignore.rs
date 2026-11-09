use rsvelte_lint_runner::rule::{Report, Reporter};

use super::compile_warnings::{apply, decidable, ignores};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-unused-svelte-ignore",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoUnusedSvelteIgnore))
}

#[derive(Debug)]
struct NoUnusedSvelteIgnore;

impl SvelteRule for NoUnusedSvelteIgnore {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let ignores = ignores(component, source);
        for &comment in &ignores.missing_code {
            reporter.report(
                Report::range("svelte-ignore comment must include the code", comment)
                    .message_id("missingCode"),
            );
        }
        if ignores.items.is_empty() {
            return;
        }
        let Some(compile) = file.compile_warnings() else {
            return;
        };
        let experimental_async = file.svelte_config().is_some_and(|c| c.experimental_async);
        let applied = apply(file, compile, &ignores, experimental_async);
        if applied.error.is_some() {
            return;
        }
        for (item, used) in ignores.items.iter().zip(&applied.used) {
            if !used && decidable(item, source) {
                reporter.report(
                    Report::range("svelte-ignore comment is used, but not warned", item.code)
                        .message_id("unused"),
                );
            }
        }
    }
}
