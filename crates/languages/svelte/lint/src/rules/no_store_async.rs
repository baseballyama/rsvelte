use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript::Kind;

use super::javascript::span;
use super::svelte_store::store_calls;
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
        let javascript = file.javascript();
        for (call, _) in store_calls(file, &["writable", "readable", "derived"]) {
            let Kind::Call { arguments, .. } = javascript.kind(call) else {
                continue;
            };
            let Some(&function) = arguments.get(1) else {
                continue;
            };
            let (Kind::Function { is_async: true, .. } | Kind::Arrow { is_async: true, .. }) =
                javascript.kind(function)
            else {
                continue;
            };
            // Upstream reports the five characters of `async`.
            let start = span(javascript, function).start_offset;
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
