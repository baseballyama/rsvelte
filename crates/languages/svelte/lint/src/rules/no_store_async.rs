use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::svelte_store::{Function, store_calls};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-store-async",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoStoreAsync))
}

#[derive(Debug)]
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
            reporter.report(
                Report::range(
                    "Do not pass async functions to svelte stores.",
                    Span::new(start, start + 5),
                )
                .message_id("unexpected"),
            );
        }
    }
}
