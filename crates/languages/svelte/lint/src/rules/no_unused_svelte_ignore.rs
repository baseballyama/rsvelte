use rsvelte_lint_runner::rule::{Report, Reporter};

use super::compile_warnings::{Postcss, apply, decidable, ignores};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};
use crate::settings::ExperimentalAsync;

#[cfg(test)]
mod tests;

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-unused-svelte-ignore",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoUnusedSvelteIgnore {
        postcss: Postcss::new(options.settings),
    }))
}

#[derive(Debug)]
struct NoUnusedSvelteIgnore {
    postcss: Postcss,
}

impl SvelteRule for NoUnusedSvelteIgnore {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let ignores = ignores(component, source);
        for &comment in &ignores.missing_code {
            reporter.report(Report::range(
                "svelte-ignore comment must include the code",
                comment,
            ));
        }
        if ignores.items.is_empty() {
            return;
        }
        // A compile that stops while parsing uses no comment.
        let Some(Ok(compile)) = file.compile_warnings() else {
            return;
        };
        let experimental_async = match file.svelte_config() {
            Some(Err(why)) => return reporter.fail(why),
            Some(Ok(config)) => config.experimental_async,
            None => ExperimentalAsync::Off,
        };
        // An invalid option fails the compile before it reads any comment.
        if experimental_async == ExperimentalAsync::Invalid {
            return;
        }
        let applied = apply(
            file,
            compile,
            &ignores,
            experimental_async.is_on(),
            self.postcss,
        );
        if applied.error.is_some() {
            return;
        }
        for (item, used) in ignores.items.iter().zip(&applied.used) {
            if !used && decidable(item, source) {
                reporter.report(Report::range(
                    "svelte-ignore comment is used, but not warned",
                    item.code,
                ));
            }
        }
    }
}
