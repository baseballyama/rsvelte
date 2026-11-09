use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript::Kind;

use super::javascript::span;
use super::svelte_store::store_calls;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/require-stores-init",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(RequireStoresInit))
}

#[derive(Debug)]
struct RequireStoresInit;

impl SvelteRule for RequireStoresInit {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let javascript = file.javascript();
        for (call, name) in store_calls(file, &["writable", "readable", "derived"]) {
            let Kind::Call { arguments, .. } = javascript.kind(call) else {
                continue;
            };
            let required = if name == "derived" { 3 } else { 1 };
            if arguments.len() >= required
                || arguments
                    .iter()
                    .any(|&argument| matches!(javascript.kind(argument), Kind::Spread(_)))
            {
                continue;
            }
            reporter.report(
                Report::range(
                    "Always set a default value for svelte stores.",
                    span(javascript, call),
                )
                .message_id("storeDefaultValue"),
            );
        }
    }
}
