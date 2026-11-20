use oxc_ast::AstKind;
use oxc_ast::ast::{
    ArrayExpressionElement, BindingPattern, Expression, IdentifierReference, ObjectExpression,
    ObjectPropertyKind, PropertyKey, VariableDeclarationKind,
};
use oxc_semantic::{NodeId, SymbolId};
use oxc_syntax::operator::BinaryOperator;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_semantic::typescript::without_typescript;
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, Component, Part, TemplateNode, decode_attribute,
};
use rsvelte_typescript_tree::Tree;
use rustc_hash::FxHashMap;

use super::shared::kit_navigation::{
    Navigation, Options, Script, first_argument, first_part, has_scheme, links, string, template,
};
use super::shared::kit_route::runs_for;
use super::shared::nodes::span;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

#[cfg(test)]
mod tests;

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
        let check = Check {
            script: &script,
            resolve: &resolve,
            resolution: file.resolution(),
            items: file
                .component()
                .map(|component| each_items(component, script.tree))
                .unwrap_or_default(),
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
    /// What counts writes; a module has none, so its values are never known.
    resolution: Option<&'a Resolution>,
    /// The names `{#each}` contexts declare.
    items: FxHashMap<SymbolId, Item<'a>>,
}

/// A name an `{#each}` context declares: the collection, and the properties that lead from an
/// item to the name (`[]` for `as link`, `["href"]` for `as { href }`).
struct Item<'a> {
    collection: &'a Expression<'a>,
    path: Vec<&'a str>,
}

/// Every name the `{#each}` contexts of `component` declare through plain names and object
/// patterns; a default value or a rest element makes the name's value unknown.
fn each_items<'a>(component: &'a Component, tree: &'a Tree) -> FxHashMap<SymbolId, Item<'a>> {
    fn names<'a>(
        pattern: &'a BindingPattern<'a>,
        collection: &'a Expression<'a>,
        path: &mut Vec<&'a str>,
        items: &mut FxHashMap<SymbolId, Item<'a>>,
    ) {
        match pattern {
            BindingPattern::BindingIdentifier(identifier) => {
                if let Some(symbol) = identifier.symbol_id.get() {
                    let path = path.clone();
                    items.insert(symbol, Item { collection, path });
                }
            }
            BindingPattern::ObjectPattern(object) => {
                for property in &object.properties {
                    if let Some(key) = static_key(&property.key, property.computed) {
                        path.push(key);
                        names(&property.value, collection, path, items);
                        path.pop();
                    }
                }
            }
            BindingPattern::ArrayPattern(_) | BindingPattern::AssignmentPattern(_) => {}
        }
    }
    let mut items = FxHashMap::default();
    for node in &component.nodes {
        if let &TemplateNode::Each {
            expression,
            context: Some(context),
            ..
        } = node
        {
            let collection = tree.get_expression(expression);
            names(
                &tree.get_pattern(context).pattern,
                collection,
                &mut Vec::new(),
                &mut items,
            );
        }
    }
    items
}

/// A property name written without code: `href` or `'href'`.
fn static_key<'a>(key: &'a PropertyKey<'a>, computed: bool) -> Option<&'a str> {
    match key {
        PropertyKey::StaticIdentifier(key) if !computed => Some(key.name.as_str()),
        PropertyKey::StringLiteral(key) => key.value.as_str(),
        _ => None,
    }
}

/// The value of property `key` of an object literal: the last one wins, and a spread or a
/// computed key before it makes it unknown.
fn property<'a>(object: &'a ObjectExpression<'a>, key: &str) -> Option<&'a Expression<'a>> {
    for property in object.properties.iter().rev() {
        let ObjectPropertyKind::ObjectProperty(property) = property else {
            return None;
        };
        match static_key(&property.key, property.computed) {
            Some(name) if name == key => return Some(&property.value),
            Some(_) => {}
            None => return None,
        }
    }
    None
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

    /// A constant `const` variable's `f` of its initializer: one nothing writes to, through itself
    /// or through a member, and no call is given, so the literal it holds is what it is.
    fn constant<T>(
        &self,
        identifier: &IdentifierReference<'_>,
        visited: &mut Vec<SymbolId>,
        f: impl FnOnce(&Self, &'a Expression<'a>, &mut Vec<SymbolId>) -> Option<T>,
    ) -> Option<T> {
        let (symbol, initializer) = self.script.initializer(identifier)?;
        let resolution = self.resolution?;
        if resolution.variable_kind(symbol) != Some(VariableDeclarationKind::Const)
            || !self.sealed(symbol)
            || visited.contains(&symbol)
        {
            return None;
        }
        visited.push(symbol);
        let out = f(self, initializer, visited);
        visited.pop();
        out
    }

    /// Nothing changes what `symbol` holds: it is never written, written through a member, or
    /// reached by a call, as a callee's object (`links.push()`) or as an argument.
    fn sealed(&self, symbol: SymbolId) -> bool {
        let Some(resolution) = self.resolution else {
            return false;
        };
        if resolution.reassigned(symbol) || resolution.mutations(symbol) > 0 {
            return false;
        }
        let nodes = resolution.semantic().nodes();
        resolution
            .scoping()
            .get_resolved_references(symbol)
            .all(|reference| {
                let outermost = nodes.ancestor_ids(reference.node_id()).find(|&id| {
                    !matches!(
                        nodes.kind(id),
                        AstKind::StaticMemberExpression(_) | AstKind::ComputedMemberExpression(_)
                    )
                });
                !outermost.is_some_and(|id| {
                    matches!(
                        nodes.kind(id),
                        AstKind::CallExpression(_) | AstKind::NewExpression(_)
                    )
                })
            })
    }

    /// Every value `node` can be, when the file writes them all: an `{#each}` item read from a
    /// constant array, or a property of constant object literals.
    fn values(
        &self,
        node: &'a Expression<'a>,
        visited: &mut Vec<SymbolId>,
    ) -> Option<Vec<&'a Expression<'a>>> {
        match without_typescript(node) {
            Expression::Identifier(identifier) => {
                let symbol = self.script.symbol(identifier)?;
                let item = self.items.get(&symbol)?;
                if visited.contains(&symbol) || !self.sealed(symbol) {
                    return None;
                }
                visited.push(symbol);
                let out = self
                    .elements(item.collection, visited)
                    .and_then(|elements| {
                        let mut out = Vec::new();
                        for element in elements {
                            out.extend(self.project(element, &item.path, visited)?);
                        }
                        Some(out)
                    });
                visited.pop();
                out
            }
            Expression::StaticMemberExpression(member) => {
                let mut out = Vec::new();
                for object in self.objects(&member.object, visited)? {
                    out.push(property(object, member.property.name.as_str())?);
                }
                Some(out)
            }
            _ => None,
        }
    }

    /// The values at the end of `path` from `value`.
    fn project(
        &self,
        value: &'a Expression<'a>,
        path: &[&str],
        visited: &mut Vec<SymbolId>,
    ) -> Option<Vec<&'a Expression<'a>>> {
        let Some((key, rest)) = path.split_first() else {
            return Some(vec![value]);
        };
        let mut out = Vec::new();
        for object in self.objects(value, visited)? {
            out.extend(self.project(property(object, key)?, rest, visited)?);
        }
        Some(out)
    }

    /// The object literals `node` can be.
    fn objects(
        &self,
        node: &'a Expression<'a>,
        visited: &mut Vec<SymbolId>,
    ) -> Option<Vec<&'a ObjectExpression<'a>>> {
        match without_typescript(node) {
            Expression::ObjectExpression(object) => Some(vec![object]),
            Expression::Identifier(identifier) if !self.is_item(identifier) => {
                self.constant(identifier, visited, |check, initializer, visited| {
                    check.objects(initializer, visited)
                })
            }
            node => {
                let mut out = Vec::new();
                for value in self.values(node, visited)? {
                    out.extend(self.objects(value, visited)?);
                }
                Some(out)
            }
        }
    }

    /// The elements of the arrays `node` can be; a spread or a hole makes them unknown.
    fn elements(
        &self,
        node: &'a Expression<'a>,
        visited: &mut Vec<SymbolId>,
    ) -> Option<Vec<&'a Expression<'a>>> {
        match without_typescript(node) {
            Expression::ArrayExpression(array) => array
                .elements
                .iter()
                .map(ArrayExpressionElement::as_expression)
                .collect(),
            Expression::Identifier(identifier) if !self.is_item(identifier) => {
                self.constant(identifier, visited, |check, initializer, visited| {
                    check.elements(initializer, visited)
                })
            }
            node => {
                let mut out = Vec::new();
                for value in self.values(node, visited)? {
                    out.extend(self.elements(value, visited)?);
                }
                Some(out)
            }
        }
    }

    fn is_item(&self, identifier: &IdentifierReference<'_>) -> bool {
        self.script
            .symbol(identifier)
            .is_some_and(|symbol| self.items.contains_key(&symbol))
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
                if let Some(allowed) = self.all_values_allowed(node, allow, visited) {
                    return allowed;
                }
            }
            Expression::StaticMemberExpression(_) => {
                if let Some(allowed) = self.all_values_allowed(node, allow, visited) {
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

    /// Whether every value [`Check::values`] finds for `node` comes from `resolve()`. Upstream
    /// accepts a literal URL only as the expression itself or a constant's initializer; an item
    /// or a member it accepts through its type alone, which a literal never has, so only nullish
    /// values keep their allowance.
    fn all_values_allowed(
        &self,
        node: &'a Expression<'a>,
        allow: Allow,
        visited: &mut Vec<SymbolId>,
    ) -> Option<bool> {
        let values = self.values(node, visited)?;
        let allow = Allow {
            nullish: allow.nullish,
            ..Allow::default()
        };
        Some(
            values
                .into_iter()
                .all(|value| self.allowed(Url::Expression(value), allow, visited)),
        )
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
