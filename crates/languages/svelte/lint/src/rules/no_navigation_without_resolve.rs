use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte::syntax::syntax_tree::{Attribute, Component, Part, decode_attribute};
use rsvelte_typescript::operators::BinaryOperator;
use rsvelte_typescript::scope::BindingIdentifier;
use rsvelte_typescript::{Kind, NodeIdentifier};

use super::kit_navigation::{Navigation, Options, Script, first_part, has_scheme, links};
use super::kit_route::runs_for;
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
    Expression(NodeIdentifier),
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
            let Some(url) = script.first_argument(call).filter(|_| !ignored) else {
                continue;
            };
            let allow = Allow {
                empty,
                ..Allow::default()
            };
            if !check.allowed(Url::Expression(url), allow, &mut Vec::new()) {
                reporter.range(message, script.span(url));
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
                Some(&Part::Expression { expression, .. }) => Url::Expression(expression),
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
    resolve: &'s [NodeIdentifier],
}

impl Check<'_, '_> {
    /// `f` of the initializer of the constant `node` reads; `None` for another name, or for one
    /// already being followed, so constants that refer to each other end.
    fn follow(
        &self,
        node: NodeIdentifier,
        visited: &mut Vec<BindingIdentifier>,
        f: impl FnOnce(&Self, NodeIdentifier, &mut Vec<BindingIdentifier>) -> bool,
    ) -> Option<bool> {
        let (binding, initializer) = self.script.initializer(node)?;
        if visited.contains(&binding) {
            return None;
        }
        visited.push(binding);
        let out = f(self, initializer, visited);
        visited.pop();
        Some(out)
    }

    fn allowed(&self, url: Url<'_>, allow: Allow, visited: &mut Vec<BindingIdentifier>) -> bool {
        let Url::Expression(node) = url else {
            let Url::Text(text) = url else { unreachable!() };
            return (allow.absolute && has_scheme(text))
                || (allow.fragment && text.starts_with('#'));
        };
        let script = self.script;
        match script.tree.kind(node) {
            Kind::Identifier(_) => {
                if let Some(allowed) = self.follow(node, visited, |check, initializer, visited| {
                    check.allowed(Url::Expression(initializer), allow, visited)
                }) {
                    return allowed;
                }
            }
            Kind::Conditional {
                consequent,
                alternate,
                ..
            } => {
                return self.allowed(Url::Expression(consequent), allow, visited)
                    && self.allowed(Url::Expression(alternate), allow, visited);
            }
            _ => {}
        }
        (allow.absolute && self.is_absolute(node))
            || (allow.empty && self.is_empty(node))
            || (allow.fragment && self.starts_with(node, "#", visited))
            || (allow.nullish && self.is_nullish(node))
            || self.is_resolve_call(node, visited)
    }

    fn is_absolute(&self, node: NodeIdentifier) -> bool {
        let script = self.script;
        match script.tree.kind(node) {
            Kind::Binary(BinaryOperator::Add, left, right) => {
                self.is_absolute(left) || self.is_absolute(right)
            }
            Kind::String => has_scheme(script.tree.str_value(node, script.source)),
            Kind::Template { .. } => script.template(node).is_some_and(|(quasis, expressions)| {
                expressions.iter().any(|&e| self.is_absolute(e))
                    || quasis.iter().any(|quasi| has_scheme(quasi))
            }),
            _ => false,
        }
    }

    fn is_empty(&self, node: NodeIdentifier) -> bool {
        let script = self.script;
        script.string(node) == Some("")
            || script
                .template(node)
                .is_some_and(|(quasis, expressions)| expressions.is_empty() && quasis == [""])
    }

    fn starts_with(
        &self,
        node: NodeIdentifier,
        prefix: &str,
        visited: &mut Vec<BindingIdentifier>,
    ) -> bool {
        let script = self.script;
        match script.tree.kind(node) {
            Kind::Binary(BinaryOperator::Add, left, _) => self.starts_with(left, prefix, visited),
            Kind::Identifier(_) => self
                .follow(node, visited, |check, initializer, visited| {
                    check.starts_with(initializer, prefix, visited)
                })
                .unwrap_or(false),
            Kind::String => script
                .tree
                .str_value(node, script.source)
                .starts_with(prefix),
            Kind::Template { .. } => script.template(node).is_some_and(|(quasis, expressions)| {
                expressions
                    .first()
                    .is_some_and(|&e| self.starts_with(e, prefix, visited))
                    || quasis
                        .first()
                        .is_some_and(|quasi| quasi.starts_with(prefix))
            }),
            _ => false,
        }
    }

    /// `undefined` or `null`, as written.
    fn is_nullish(&self, node: NodeIdentifier) -> bool {
        let tree = self.script.tree;
        match tree.kind(node) {
            Kind::Identifier(name) => tree.atoms.get(name) == "undefined",
            Kind::Null => true,
            _ => false,
        }
    }

    fn is_resolve_call(&self, node: NodeIdentifier, visited: &mut Vec<BindingIdentifier>) -> bool {
        match self.script.tree.kind(node) {
            Kind::Call { callee, .. } => self.resolve.binary_search(&callee).is_ok(),
            Kind::Identifier(_) => self
                .follow(node, visited, |check, initializer, visited| {
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
        let is_external_constant = |node| {
            script
                .initializer(node)
                .is_some_and(|(_, initializer)| script.string(initializer) == Some("external"))
        };
        let names_external = |text: &str| text.split_whitespace().any(|word| word == "external");
        attributes.iter().any(|attribute| {
            if attribute.name.text(source) != "rel" {
                return false;
            }
            match first_part(component, attribute) {
                Some(Part::Text(span)) => names_external(&decode_attribute(span.text(source))),
                Some(&Part::Expression { expression, .. }) => match script.tree.kind(expression) {
                    Kind::String => names_external(script.tree.str_value(expression, source)),
                    Kind::Identifier(_) => is_external_constant(expression),
                    _ => false,
                },
                None => false,
            }
        })
    }
}
