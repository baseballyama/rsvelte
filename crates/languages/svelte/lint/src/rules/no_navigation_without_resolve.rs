use oxc_ast::ast::Expression;
use oxc_semantic::NodeId;
use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_syntax::syntax_tree::{Part, decode_attribute};
use rsvelte_typescript_semantic::static_value::StaticValues;
use rsvelte_typescript_tree::node_span;

use super::shared::kit_navigation::{
    Navigation, Options, Script, first_argument, first_part, links,
};
use super::shared::kit_route::runs_for;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

mod each;
#[cfg(test)]
mod tests;
mod value;

use each::each_items;
use value::{Check, Visited};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-navigation-without-resolve",
    files: Files::All,
    category: Category::Suspicious,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    Ok(Box::new(NoNavigationWithoutResolve(options.single()?)))
}

#[derive(Debug)]
struct NoNavigationWithoutResolve(Options);

/// What a place accepts besides `resolve()`; a type fact (`ResolvedPathname`) needs a type
/// provider this crate does not have yet, so it never allows. Where upstream would read that type
/// off a value the file writes, [`Check::values`] reads the value instead.
#[derive(Clone, Copy, Default)]
#[expect(clippy::struct_excessive_bools, reason = "one flag per kind of URL")]
struct Allow {
    absolute: bool,
    empty: bool,
    fragment: bool,
    nullish: bool,
}

/// A URL: an expression, or the text that starts an attribute's value.
#[derive(Clone, Copy)]
enum Url<'a> {
    Expression(&'a Expression<'a>),
    Text(&'a str),
}

impl SvelteRule for NoNavigationWithoutResolve {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if !runs_for(file, reporter, &["1.0.0-next", "1", "2", "3"]) {
            return;
        }
        let script = Script::new(file);
        let resolve = script.path_reads(&["asset", "resolve"]);
        let calls = script.navigation_calls();
        let mut navigations: Vec<NodeId> = calls.iter().map(|(_, call)| call.node_id()).collect();
        navigations.sort_unstable();
        let statics = StaticValues::new(file.semantic());
        let items = file
            .component()
            .map_or_default(|component| each_items(component, script.tree, &statics));
        let check = Check {
            script: &script,
            resolve: &resolve,
            navigations: &navigations,
            resolution: file.resolution(),
            statics,
            items,
        };
        for (navigation, call) in calls {
            let (ignored, message, empty) = match navigation {
                Navigation::Goto => (
                    self.0.ignore_goto,
                    "Unexpected goto() call without resolve().",
                    false,
                ),
                Navigation::PushState => (
                    self.0.ignore_push_state,
                    "Unexpected pushState() call without resolve().",
                    true,
                ),
                Navigation::ReplaceState => (
                    self.0.ignore_replace_state,
                    "Unexpected replaceState() call without resolve().",
                    true,
                ),
            };
            let Some(argument) = first_argument(call).filter(|_| !ignored) else {
                continue;
            };
            let allow = Allow {
                empty,
                ..Allow::default()
            };
            let allowed = argument.as_expression().is_some_and(|url| {
                check.allowed(Url::Expression(url), allow, &mut Visited::default())
            });
            if !allowed {
                reporter.range(message, node_span(argument));
            }
        }
        let Some(component) = file.component().filter(|_| !self.0.ignore_links) else {
            return;
        };
        let allow = Allow {
            absolute: true,
            fragment: true,
            nullish: true,
            empty: false,
        };
        for link in links(component, script.source) {
            let text;
            let url = match first_part(component, link.href) {
                Some(Part::Text(span)) => {
                    text = decode_attribute(span.text(script.source));
                    Url::Text(&text)
                }
                Some(&Part::Expression { expression, .. }) => {
                    Url::Expression(script.tree.get_expression(expression))
                }
                None => continue,
            };
            if !check.rel_external(component, link.attributes)
                && !check.allowed(url, allow, &mut Visited::default())
            {
                reporter.range("Unexpected href link without resolve().", link.href.span);
            }
        }
    }
}
