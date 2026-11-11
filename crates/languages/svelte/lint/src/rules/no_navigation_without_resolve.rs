use oxc_ast::ast::{Expression, IdentifierReference};
use oxc_semantic::{NodeId, SymbolId};
use oxc_syntax::operator::BinaryOperator;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_syntax::syntax_tree::{Attribute, Component, Part, decode_attribute};

use super::kit_navigation::{
    Navigation, Options, Script, first_argument, first_part, has_scheme, links, string, template,
};
use super::kit_route::runs_for;
use super::nodes::span;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-navigation-without-resolve",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    Ok(Box::new(NoNavigationWithoutResolve(options.single()?)))
}

#[derive(Debug)]
struct NoNavigationWithoutResolve(Options);

/// What a place accepts besides `resolve()`; a type fact (`ResolvedPathname`) needs a type
/// provider this crate does not have yet, so it never allows.
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
        let check = Check {
            script: &script,
            resolve: &resolve,
        };
        for (navigation, call) in script.navigation_calls() {
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
            let allowed = argument
                .as_expression()
                .is_some_and(|url| check.allowed(Url::Expression(url), allow, &mut Vec::new()));
            if !allowed {
                reporter.range(message, span(argument));
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
                && !check.allowed(url, allow, &mut Vec::new())
            {
                reporter.range("Unexpected href link without resolve().", link.href.span);
            }
        }
    }
}

struct Check<'s, 'a> {
    script: &'s Script<'a>,
    /// What reads `resolve` or `asset`, sorted.
    resolve: &'s [NodeId],
}

impl<'a> Check<'_, 'a> {
    /// `f` of the initializer of the constant `node` reads; `None` for another name, or for one
    /// already being followed, so constants that refer to each other end.
    fn follow(
        &self,
        node: &IdentifierReference<'_>,
        visited: &mut Vec<SymbolId>,
        f: impl FnOnce(&Self, &'a Expression<'a>, &mut Vec<SymbolId>) -> bool,
    ) -> Option<bool> {
        let (symbol, initializer) = self.script.initializer(node)?;
        if visited.contains(&symbol) {
            return None;
        }
        visited.push(symbol);
        let out = f(self, initializer, visited);
        visited.pop();
        Some(out)
    }

    fn allowed(&self, url: Url<'a>, allow: Allow, visited: &mut Vec<SymbolId>) -> bool {
        let node = match url {
            Url::Expression(node) => node,
            Url::Text(text) => {
                return (allow.absolute && has_scheme(text))
                    || (allow.fragment && text.starts_with('#'));
            }
        };
        match node {
            Expression::Identifier(identifier) => {
                if let Some(allowed) =
                    self.follow(identifier, visited, |check, initializer, visited| {
                        check.allowed(Url::Expression(initializer), allow, visited)
                    })
                {
                    return allowed;
                }
            }
            Expression::ConditionalExpression(conditional) => {
                return self.allowed(Url::Expression(&conditional.consequent), allow, visited)
                    && self.allowed(Url::Expression(&conditional.alternate), allow, visited);
            }
            _ => {}
        }
        (allow.absolute && is_absolute(node))
            || (allow.empty && is_empty(node))
            || (allow.fragment && self.starts_with(node, "#", visited))
            || (allow.nullish && is_nullish(node))
            || self.is_resolve_call(node, visited)
    }

    fn starts_with(
        &self,
        node: &'a Expression<'a>,
        prefix: &str,
        visited: &mut Vec<SymbolId>,
    ) -> bool {
        match node {
            Expression::BinaryExpression(binary) if binary.operator == BinaryOperator::Addition => {
                self.starts_with(&binary.left, prefix, visited)
            }
            Expression::Identifier(identifier) => self
                .follow(identifier, visited, |check, initializer, visited| {
                    check.starts_with(initializer, prefix, visited)
                })
                .unwrap_or(false),
            Expression::StringLiteral(_) => string(node).is_some_and(|s| s.starts_with(prefix)),
            Expression::TemplateLiteral(_) => {
                template(node).is_some_and(|(quasis, expressions)| {
                    expressions
                        .first()
                        .is_some_and(|e| self.starts_with(e, prefix, visited))
                        || quasis
                            .first()
                            .is_some_and(|quasi| quasi.starts_with(prefix))
                })
            }
            _ => false,
        }
    }

    fn is_resolve_call(&self, node: &'a Expression<'a>, visited: &mut Vec<SymbolId>) -> bool {
        match node {
            Expression::CallExpression(call) => {
                self.resolve.binary_search(&call.callee.node_id()).is_ok()
            }
            Expression::Identifier(identifier) => self
                .follow(identifier, visited, |check, initializer, visited| {
                    check.is_resolve_call(initializer, visited)
                })
                .unwrap_or(false),
            _ => false,
        }
    }

    /// `rel="external"`, or a `rel` that names a constant `'external'`.
    fn rel_external(&self, component: &Component, attributes: &[Attribute]) -> bool {
        let script = self.script;
        let source = script.source;
        let names_external = |text: &str| text.split_whitespace().any(|word| word == "external");
        attributes.iter().any(|attribute| {
            if attribute.name.text(source) != "rel" {
                return false;
            }
            match first_part(component, attribute) {
                Some(Part::Text(span)) => names_external(&decode_attribute(span.text(source))),
                Some(&Part::Expression { expression, .. }) => {
                    match script.tree.get_expression(expression) {
                        expression @ Expression::StringLiteral(_) => {
                            string(expression).is_some_and(names_external)
                        }
                        Expression::Identifier(identifier) => script
                            .initializer(identifier)
                            .is_some_and(|(_, initializer)| {
                                string(initializer) == Some("external")
                            }),
                        _ => false,
                    }
                }
                None => false,
            }
        })
    }
}

fn is_absolute(node: &Expression<'_>) -> bool {
    match node {
        Expression::BinaryExpression(binary) if binary.operator == BinaryOperator::Addition => {
            is_absolute(&binary.left) || is_absolute(&binary.right)
        }
        Expression::StringLiteral(_) => string(node).is_some_and(has_scheme),
        Expression::TemplateLiteral(_) => template(node).is_some_and(|(quasis, expressions)| {
            expressions.iter().any(|e| is_absolute(e))
                || quasis.iter().any(|quasi| has_scheme(quasi))
        }),
        _ => false,
    }
}

fn is_empty(node: &Expression<'_>) -> bool {
    string(node) == Some("")
        || template(node)
            .is_some_and(|(quasis, expressions)| expressions.is_empty() && quasis == [""])
}

/// `undefined` or `null`, as written.
fn is_nullish(node: &Expression<'_>) -> bool {
    match node {
        Expression::Identifier(identifier) => identifier.name == "undefined",
        Expression::NullLiteral(_) => true,
        _ => false,
    }
}
