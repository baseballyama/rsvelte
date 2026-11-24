use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::shared::compile_warnings::{Postcss, compile, decidable, ignores};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-unused-svelte-ignore",
    files: Files::Components,
    category: Category::Correctness,
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
        let source = file.source();
        let ignores = ignores(file);
        for &comment in &ignores.missing_code {
            reporter.report(Report::range(
                "svelte-ignore comment must include the code",
                comment,
            ));
        }
        if ignores.items.is_empty() {
            return;
        }
        let applied = match compile(file, &ignores, self.postcss) {
            None => return,
            Some(Err(why)) => return reporter.fail(why),
            Some(Ok(compiled)) => compiled.applied,
        };
        // A compile that fails uses no comment.
        if applied.error.is_some() {
            return;
        }
        for (item, used) in ignores.items.iter().zip(&applied.used) {
            if !used && decidable(item, source, applied.runes) {
                reporter.report(Report::range(
                    "svelte-ignore comment is used, but not warned",
                    item.code,
                ));
            }
        }
    }
}
