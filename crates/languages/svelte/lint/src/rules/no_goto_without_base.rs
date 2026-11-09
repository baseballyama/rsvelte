use rsvelte_lint_runner::rule::Reporter;
use rsvelte_typescript::Kind;

use super::kit_navigation::{Navigation, Script, has_scheme};
use super::kit_route::{BASE_VERSIONS, runs_for};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-goto-without-base",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoGotoWithoutBase))
}

#[derive(Debug)]
struct NoGotoWithoutBase;

impl SvelteRule for NoGotoWithoutBase {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if !runs_for(file, reporter, BASE_VERSIONS) {
            return;
        }
        let script = Script::new(file);
        let calls = script.navigation_calls();
        if calls.is_empty() {
            return;
        }
        let base = script.path_reads(&["base"]);
        let is_base = |node| base.binary_search(&node).is_ok();
        for (navigation, call) in calls {
            if navigation != Navigation::Goto {
                continue;
            }
            let Some(url) = script.first_argument(call) else {
                continue;
            };
            let prefixed = match script.tree.kind(url) {
                Kind::Binary(_, left, _) => is_base(left),
                Kind::String => has_scheme(script.tree.str_value(url, script.source)),
                Kind::Template { .. } => script.leading_expression(url).is_some_and(is_base),
                _ => false,
            };
            if !prefixed {
                reporter.range(
                    "Found a goto() call with a url that isn't prefixed with the base path.",
                    script.span(url),
                );
            }
        }
    }
}
