use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_semantic::warnings::CompileWarnings;

use super::shared::compile_warnings::{IgnoreItem, Postcss, compile, decidable, ignores};
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
            if !used
                && !is_prose(item, source, applied.runes)
                && decidable(item, source, applied.runes)
            {
                reporter.report(Report::range(
                    "svelte-ignore comment is used, but not warned",
                    item.code,
                ));
            }
        }
    }
}

/// In runes mode Svelte reads the text after the first code that no comma follows as prose. A
/// Svelte code there still ignores nothing and is worth a report; any other word is not a code.
fn is_prose(item: &IgnoreItem, source: &str, runes: bool) -> bool {
    let codes = CompileWarnings::SVELTE_CODES;
    runes
        && !item.read_in_runes_mode
        && !codes.contains(&item.code.text(source))
        && !codes.contains(&item.code_for_v5.as_str())
}
