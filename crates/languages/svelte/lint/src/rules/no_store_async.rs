use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::shared::svelte_store::{Function, store_calls};
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-store-async",
    files: Files::All,
    configure: without_options::<NoStoreAsync>,
};

#[derive(Debug, Default)]
struct NoStoreAsync;

impl SvelteRule for NoStoreAsync {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        for (call, _) in store_calls(file, &["writable", "readable", "derived"]) {
            let Some(function) = call
                .arguments
                .get(1)
                .and_then(|argument| argument.as_expression())
                .and_then(Function::of)
            else {
                continue;
            };
            if !function.is_async {
                continue;
            }
            // Upstream reports the five characters of `async`.
            let start = function.span.start;
            reporter.report(Report::range(
                "Do not pass async functions to svelte stores.",
                Span::new(start, start + 5),
            ));
        }
    }
}
