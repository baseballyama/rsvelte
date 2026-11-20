use oxc_ast::ast::Argument;
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::shared::nodes::span;
use super::shared::svelte_store::store_calls;
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/require-stores-init",
    files: Files::All,
    configure: without_options::<RequireStoresInit>,
};

#[derive(Debug, Default)]
struct RequireStoresInit;

impl SvelteRule for RequireStoresInit {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        for (call, name) in store_calls(file, &["writable", "readable", "derived"]) {
            let required = if name == "derived" { 3 } else { 1 };
            if call.arguments.len() >= required
                || call
                    .arguments
                    .iter()
                    .any(|argument| matches!(argument, Argument::SpreadElement(_)))
            {
                continue;
            }
            reporter.report(Report::range(
                "Always set a default value for svelte stores.",
                span(call),
            ));
        }
    }
}
