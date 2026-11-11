use rsvelte_lint_runner::rule::Reporter;
use oxc_ast::ast::Expression;

use super::kit_navigation::{Navigation, Script, first_argument, has_scheme, leading_expression};
use super::nodes::span;
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
        let is_base = |node: &Expression<'_>| base.binary_search(&node.node_id()).is_ok();
        for (navigation, call) in calls {
            if navigation != Navigation::Goto {
                continue;
            }
            let Some(url) = first_argument(call) else {
                continue;
            };
            let prefixed = match url.as_expression() {
                Some(Expression::BinaryExpression(binary)) => is_base(&binary.left),
                Some(Expression::StringLiteral(string)) => {
                    string.value.as_str().is_some_and(has_scheme)
                }
                Some(url @ Expression::TemplateLiteral(_)) => {
                    leading_expression(url).is_some_and(is_base)
                }
                _ => false,
            };
            if !prefixed {
                reporter.range(
                    "Found a goto() call with a url that isn't prefixed with the base path.",
                    span(url),
                );
            }
        }
    }
}
