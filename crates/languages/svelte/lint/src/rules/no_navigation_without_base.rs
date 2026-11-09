use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte::syntax::syntax_tree::{Part, decode_attribute};
use rsvelte_typescript::scope::BindingIdentifier;
use rsvelte_typescript::{Kind, NodeIdentifier};

use super::kit_navigation::{Navigation, Options, Script, first_part, has_scheme, links};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-navigation-without-base",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    Ok(Box::new(NoNavigationWithoutBase(options.single()?)))
}

#[derive(Debug)]
struct NoNavigationWithoutBase(Options);

impl SvelteRule for NoNavigationWithoutBase {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let script = Script::new(file);
        let base = script.path_reads(&["base"]);
        let check = Check {
            script: &script,
            base: &base,
        };
        for (navigation, call) in script.navigation_calls() {
            let (ignored, message, allow_empty) = match navigation {
                Navigation::Goto => (
                    self.0.ignore_goto,
                    "Found a goto() call with a url that isn't prefixed with the base path.",
                    false,
                ),
                Navigation::PushState => (
                    self.0.ignore_push_state,
                    "Found a pushState() call with a url that isn't prefixed with the base path.",
                    true,
                ),
                Navigation::ReplaceState => (
                    self.0.ignore_replace_state,
                    "Found a replaceState() call with a url that isn't prefixed with the base \
                     path.",
                    true,
                ),
            };
            let Some(url) = script.first_argument(call).filter(|_| !ignored) else {
                continue;
            };
            if (!allow_empty || !check.is_empty(url)) && !check.starts_with_base(url) {
                reporter.range(message, script.span(url));
            }
        }
        let Some(component) = file.component().filter(|_| !self.0.ignore_links) else {
            return;
        };
        for link in links(component, script.source) {
            // A shorthand `{href}` is not an attribute with a value to `eslint-plugin-svelte`.
            if link.href.shorthand {
                continue;
            }
            let (allowed, span) = match first_part(component, link.href) {
                Some(Part::Text(span)) => {
                    let url = decode_attribute(span.text(script.source));
                    (has_scheme(&url) || url.starts_with('#'), *span)
                }
                Some(&Part::Expression { expression, span }) => (
                    check.starts_with_base(expression)
                        || check.is_absolute(expression)
                        || check.is_fragment(expression),
                    span,
                ),
                None => continue,
            };
            if !allowed {
                reporter.range(
                    "Found a link with a url that isn't prefixed with the base path.",
                    span,
                );
            }
        }
    }
}

struct Check<'s, 'a> {
    script: &'s Script<'a>,
    /// What reads `base`, sorted.
    base: &'s [NodeIdentifier],
}

impl Check<'_, '_> {
    fn starts_with_base(&self, url: NodeIdentifier) -> bool {
        self.prefix(url, &mut Vec::new())
            .is_some_and(|prefix| self.base.binary_search(&prefix).is_ok())
    }

    /// The variable or member a URL starts with, following constants.
    fn prefix(
        &self,
        node: NodeIdentifier,
        visited: &mut Vec<BindingIdentifier>,
    ) -> Option<NodeIdentifier> {
        let script = self.script;
        match script.tree.kind(node) {
            Kind::Binary(_, left, _) => self.prefix(left, visited),
            Kind::Identifier(_) => match script.initializer(node) {
                Some((binding, initializer)) if !visited.contains(&binding) => {
                    visited.push(binding);
                    Some(self.prefix(initializer, visited).unwrap_or(node))
                }
                _ => Some(node),
            },
            Kind::Member { .. } => Some(node),
            Kind::Template { .. } => self.prefix(script.leading_expression(node)?, visited),
            _ => None,
        }
    }

    fn is_empty(&self, url: NodeIdentifier) -> bool {
        let script = self.script;
        script.string(url) == Some("")
            || script
                .template(url)
                .is_some_and(|(quasis, expressions)| expressions.is_empty() && quasis == [""])
    }

    fn is_absolute(&self, url: NodeIdentifier) -> bool {
        let script = self.script;
        match script.tree.kind(url) {
            Kind::Binary(_, left, right) => self.is_absolute(left) || self.is_absolute(right),
            Kind::String => has_scheme(script.tree.str_value(url, script.source)),
            Kind::Template { .. } => script.template(url).is_some_and(|(quasis, expressions)| {
                expressions.iter().any(|&e| self.is_absolute(e))
                    || quasis.iter().any(|quasi| has_scheme(quasi))
            }),
            _ => false,
        }
    }

    fn is_fragment(&self, url: NodeIdentifier) -> bool {
        let script = self.script;
        match script.tree.kind(url) {
            Kind::Binary(_, left, _) => self.is_fragment(left),
            Kind::String => script.tree.str_value(url, script.source).starts_with('#'),
            Kind::Template { .. } => script.template(url).is_some_and(|(quasis, expressions)| {
                expressions.first().is_some_and(|&e| self.is_fragment(e))
                    || quasis.first().is_some_and(|quasi| quasi.starts_with('#'))
            }),
            _ => false,
        }
    }
}
