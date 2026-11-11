use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_syntax::syntax_tree::{Part, decode_attribute};
use oxc_ast::ast::{ChainElement, Expression};
use oxc_semantic::{NodeId, SymbolId};

use super::kit_navigation::{
    Navigation, Options, Script, first_argument, first_part, has_scheme, leading_expression,
    links, string, template,
};
use super::nodes::span;
use super::kit_route::{BASE_VERSIONS, runs_for};
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
        if !runs_for(file, reporter, BASE_VERSIONS) {
            return;
        }
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
            let Some(argument) = first_argument(call).filter(|_| !ignored) else {
                continue;
            };
            let allowed = argument.as_expression().is_some_and(|url| {
                (allow_empty && check.is_empty(url)) || check.starts_with_base(url)
            });
            if !allowed {
                reporter.range(message, span(argument));
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
                Some(&Part::Expression { expression, span }) => {
                    let expression = script.tree.get_expression(expression);
                    (
                        check.starts_with_base(expression)
                            || check.is_absolute(expression)
                            || check.is_fragment(expression),
                        span,
                    )
                }
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
    base: &'s [NodeId],
}

impl<'a> Check<'_, 'a> {
    fn starts_with_base(&self, url: &'a Expression<'a>) -> bool {
        self.prefix(url, &mut Vec::new())
            .is_some_and(|prefix| self.base.binary_search(&prefix).is_ok())
    }

    /// The variable or member a URL starts with, following constants.
    fn prefix(&self, node: &'a Expression<'a>, visited: &mut Vec<SymbolId>) -> Option<NodeId> {
        match node {
            Expression::BinaryExpression(binary) => self.prefix(&binary.left, visited),
            Expression::Identifier(identifier) => match self.script.initializer(identifier) {
                Some((symbol, initializer)) if !visited.contains(&symbol) => {
                    visited.push(symbol);
                    Some(self.prefix(initializer, visited).unwrap_or(node.node_id()))
                }
                _ => Some(node.node_id()),
            },
            Expression::StaticMemberExpression(_)
            | Expression::ComputedMemberExpression(_)
            | Expression::PrivateFieldExpression(_) => Some(node.node_id()),
            // `a?.b` is a member too, as `ESTree` keeps it inside its chain.
            Expression::ChainExpression(chain) => match &chain.expression {
                ChainElement::StaticMemberExpression(member) => Some(member.node_id()),
                ChainElement::ComputedMemberExpression(member) => Some(member.node_id()),
                ChainElement::PrivateFieldExpression(member) => Some(member.node_id()),
                _ => None,
            },
            Expression::TemplateLiteral(_) => self.prefix(leading_expression(node)?, visited),
            _ => None,
        }
    }

    fn is_empty(&self, url: &'a Expression<'a>) -> bool {
        string(url) == Some("")
            || template(url)
                .is_some_and(|(quasis, expressions)| expressions.is_empty() && quasis == [""])
    }

    fn is_absolute(&self, url: &'a Expression<'a>) -> bool {
        match url {
            Expression::BinaryExpression(binary) => {
                self.is_absolute(&binary.left) || self.is_absolute(&binary.right)
            }
            Expression::StringLiteral(_) => string(url).is_some_and(has_scheme),
            Expression::TemplateLiteral(_) => template(url).is_some_and(|(quasis, expressions)| {
                expressions.iter().any(|e| self.is_absolute(e))
                    || quasis.iter().any(|quasi| has_scheme(quasi))
            }),
            _ => false,
        }
    }

    fn is_fragment(&self, url: &'a Expression<'a>) -> bool {
        match url {
            Expression::BinaryExpression(binary) => self.is_fragment(&binary.left),
            Expression::StringLiteral(_) => string(url).is_some_and(|url| url.starts_with('#')),
            Expression::TemplateLiteral(_) => template(url).is_some_and(|(quasis, expressions)| {
                expressions.first().is_some_and(|e| self.is_fragment(e))
                    || quasis.first().is_some_and(|quasi| quasi.starts_with('#'))
            }),
            _ => false,
        }
    }
}
