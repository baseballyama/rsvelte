use std::borrow::Cow;

use oxc_ast::AstKind;
use oxc_ast::ast::{
    ArrayExpression, ArrayExpressionElement, BindingPattern, CallExpression, Expression,
    IdentifierReference, MemberExpression, ObjectExpression, ObjectPropertyKind, PropertyKey,
};
use oxc_semantic::{NodeId, SymbolId};
use oxc_syntax::operator::BinaryOperator;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_semantic::typescript::without_typescript;
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, TemplateNode, decode_attribute,
};
use rsvelte_typescript_semantic::static_value::{StaticValues, Value};
use rsvelte_typescript_tree::{Tree, node_span};
use rustc_hash::FxHashMap;

use super::shared::kit_navigation::{
    Navigation, Options, Script, first_argument, first_part, has_scheme, is_empty_url, links,
    string, template,
};
use super::shared::kit_route::runs_for;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

#[cfg(test)]
mod tests;

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

struct Check<'s, 'a> {
    script: &'s Script<'a>,
    /// What reads `resolve` or `asset`, sorted.
    resolve: &'s [NodeId],
    /// The calls of `goto`, `pushState` and `replaceState`, sorted.
    navigations: &'s [NodeId],
    /// What counts writes; a module has none, so its values are never known.
    resolution: Option<&'a Resolution>,
    statics: StaticValues<'a>,
    /// The names `{#each}` contexts declare.
    items: FxHashMap<SymbolId, Item<'a>>,
}

/// What a check is following, so that values that refer to themselves end: the constants and
/// items whose value is being read, and the expressions whose values are.
#[derive(Default)]
struct Visited {
    symbols: Vec<SymbolId>,
    expressions: Vec<NodeId>,
}

/// A name an `{#each}` context declares: the collection, and the keys that lead from an item to
/// the name (`[]` for `as link`, `["href"]` for `as { href }`, `["1"]` for `as [, href]`).
struct Item<'a> {
    collection: &'a Expression<'a>,
    path: Vec<Cow<'a, str>>,
}

/// An array or object literal a value is known to be.
#[derive(Clone, Copy)]
enum Literal<'a> {
    Array(&'a ArrayExpression<'a>),
    Object(&'a ObjectExpression<'a>),
}

/// What an object literal holds under a key; `None` beside it means unknown.
enum Lookup<'a> {
    Absent,
    Found(Vec<&'a Expression<'a>>),
}

/// Every name the `{#each}` contexts of `component` declare through plain names, object patterns
/// and array patterns; a default value or a rest element makes the name's value unknown.
fn each_items<'a>(
    component: &'a Component,
    tree: &'a Tree,
    statics: &StaticValues<'a>,
) -> FxHashMap<SymbolId, Item<'a>> {
    fn names<'a>(
        pattern: &'a BindingPattern<'a>,
        collection: &'a Expression<'a>,
        statics: &StaticValues<'a>,
        path: &mut Vec<Cow<'a, str>>,
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
                    if let Some(key) = property_name(statics, &property.key) {
                        path.push(key);
                        names(&property.value, collection, statics, path, items);
                        path.pop();
                    }
                }
            }
            BindingPattern::ArrayPattern(array) => {
                for (index, element) in array.elements.iter().enumerate() {
                    if let Some(element) = element {
                        path.push(Cow::Owned(index.to_string()));
                        names(element, collection, statics, path, items);
                        path.pop();
                    }
                }
            }
            BindingPattern::AssignmentPattern(_) => {}
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
                statics,
                &mut Vec::new(),
                &mut items,
            );
        }
    }
    items
}

/// A property's name, as `getPropertyName` gives it: written, or a computed key's known value.
fn property_name<'a>(statics: &StaticValues<'a>, key: &'a PropertyKey<'a>) -> Option<Cow<'a, str>> {
    match key {
        PropertyKey::StaticIdentifier(key) => Some(Cow::Borrowed(key.name.as_str())),
        PropertyKey::PrivateIdentifier(_) => None,
        key => statics.string(key.as_expression()?).map(Cow::Owned),
    }
}

/// The array index a key names: a non-negative integer written as `String(index)` writes it.
fn array_index(key: &str) -> Option<usize> {
    let canonical = key == "0" || !key.starts_with('0');
    let digits = !key.is_empty() && key.bytes().all(|b| b.is_ascii_digit());
    (canonical && digits).then(|| key.parse().ok()).flatten()
}

impl<'a> Check<'_, 'a> {
    /// `f` of the initializer of the constant `node` reads; `None` for another name, or for one
    /// already being followed, so constants that refer to each other end.
    fn follow(
        &self,
        node: &IdentifierReference<'_>,
        visited: &mut Visited,
        f: impl FnOnce(&Self, &'a Expression<'a>, &mut Visited) -> bool,
    ) -> Option<bool> {
        let (symbol, initializer) = self.script.initializer(node)?;
        if visited.symbols.contains(&symbol) {
            return None;
        }
        visited.symbols.push(symbol);
        let out = f(self, initializer, visited);
        visited.symbols.pop();
        Some(out)
    }

    /// A variable's `f` of its initializer when nothing changes what it holds (see
    /// [`Check::sealed`]), so the literal it holds is what it is.
    fn constant<T>(
        &self,
        identifier: &IdentifierReference<'_>,
        visited: &mut Visited,
        f: impl FnOnce(&Self, &'a Expression<'a>, &mut Visited) -> Option<T>,
    ) -> Option<T> {
        let (symbol, initializer) = self.script.initializer(identifier)?;
        if !self.sealed(symbol) || visited.symbols.contains(&symbol) {
            return None;
        }
        visited.symbols.push(symbol);
        let out = f(self, initializer, visited);
        visited.symbols.pop();
        out
    }

    /// Nothing changes what `symbol` holds: it is never written, written through a member, or
    /// reached by a call, as a callee's object (`links.push()`) or as an argument, other than a
    /// navigation or a `resolve()`, which keep what they are given.
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
                !outermost.is_some_and(|id| match nodes.kind(id) {
                    AstKind::CallExpression(call) => !self.keeps_arguments(call),
                    AstKind::NewExpression(_) => true,
                    _ => false,
                })
            })
    }

    fn keeps_arguments(&self, call: &CallExpression<'_>) -> bool {
        self.navigations.binary_search(&call.node_id()).is_ok()
            || self.resolve.binary_search(&call.callee.node_id()).is_ok()
    }

    /// Every value `node` can be, when the file writes them all: an `{#each}` item read from
    /// array literals, or a member of array and object literals.
    fn values(
        &self,
        node: &'a Expression<'a>,
        visited: &mut Visited,
    ) -> Option<Vec<&'a Expression<'a>>> {
        let node = without_typescript(node);
        if let Expression::Identifier(identifier) = node {
            let symbol = self.script.symbol(identifier)?;
            let item = self.items.get(&symbol)?;
            if visited.symbols.contains(&symbol) || !self.sealed(symbol) {
                return None;
            }
            visited.symbols.push(symbol);
            let out = self.items_of(item.collection, visited).and_then(|items| {
                let mut out = Vec::new();
                for value in items {
                    out.extend(self.project(value, &item.path, visited)?);
                }
                Some(out)
            });
            visited.symbols.pop();
            return out;
        }
        let member = node.as_member_expression()?;
        let key = match member {
            MemberExpression::StaticMemberExpression(member) => {
                Cow::Borrowed(member.property.name.as_str())
            }
            MemberExpression::ComputedMemberExpression(member) => {
                Cow::Owned(self.statics.string(&member.expression)?)
            }
            MemberExpression::PrivateFieldExpression(_) => return None,
        };
        self.access(member.object(), &key, visited)
    }

    /// The values at the end of `path` from `value`.
    fn project(
        &self,
        value: &'a Expression<'a>,
        path: &[Cow<'a, str>],
        visited: &mut Visited,
    ) -> Option<Vec<&'a Expression<'a>>> {
        let mut values = vec![value];
        for key in path {
            let mut next = Vec::new();
            for value in values {
                next.extend(self.access(value, key, visited)?);
            }
            values = next;
        }
        Some(values)
    }

    /// The values of `node[key]`: an element of an array literal, a property of an object one.
    fn access(
        &self,
        node: &'a Expression<'a>,
        key: &str,
        visited: &mut Visited,
    ) -> Option<Vec<&'a Expression<'a>>> {
        let mut out = Vec::new();
        for literal in self.literals(node, visited)? {
            match literal {
                Literal::Array(array) => {
                    out.extend(self.element(array, array_index(key)?, visited)?.ok()?);
                }
                Literal::Object(object) => match self.lookup(object, key, visited)? {
                    Lookup::Found(values) => out.extend(values),
                    Lookup::Absent => return None,
                },
            }
        }
        Some(out)
    }

    /// The values at `index` of `array`, its spreads expanded up to there: `Ok`, or `Err` with
    /// the length of an array that ends before it.
    fn element(
        &self,
        array: &'a ArrayExpression<'a>,
        index: usize,
        visited: &mut Visited,
    ) -> Option<Result<Vec<&'a Expression<'a>>, usize>> {
        let mut position = 0;
        for element in &array.elements {
            match element {
                ArrayExpressionElement::SpreadElement(spread) => {
                    let [Literal::Array(inner)] = *self.literals(&spread.argument, visited)? else {
                        return None;
                    };
                    match self.element(inner, index - position, visited)? {
                        Ok(values) => return Some(Ok(values)),
                        Err(length) => position += length,
                    }
                }
                ArrayExpressionElement::Elision(_) if position == index => return None,
                element if position == index => return Some(Ok(vec![element.to_expression()])),
                _ => position += 1,
            }
        }
        Some(Err(position))
    }

    /// The last property of `object` named `key`; a spread of unknown properties or a key of
    /// unknown name after it makes it unknown.
    fn lookup(
        &self,
        object: &'a ObjectExpression<'a>,
        key: &str,
        visited: &mut Visited,
    ) -> Option<Lookup<'a>> {
        for property in object.properties.iter().rev() {
            match property {
                ObjectPropertyKind::ObjectProperty(property) => {
                    if property_name(&self.statics, &property.key)? == key {
                        return Some(Lookup::Found(vec![&property.value]));
                    }
                }
                ObjectPropertyKind::SpreadProperty(spread) => {
                    let mut found = Vec::new();
                    let mut absent = false;
                    for literal in self.literals(&spread.argument, visited)? {
                        let Literal::Object(inner) = literal else {
                            return None;
                        };
                        match self.lookup(inner, key, visited)? {
                            Lookup::Found(values) => found.extend(values),
                            Lookup::Absent => absent = true,
                        }
                    }
                    match (absent, found.is_empty()) {
                        (true, true) => {}
                        (false, false) => return Some(Lookup::Found(found)),
                        _ => return None,
                    }
                }
            }
        }
        Some(Lookup::Absent)
    }

    /// The elements of the arrays `node` can be, spreads expanded; a hole makes them unknown.
    fn items_of(
        &self,
        node: &'a Expression<'a>,
        visited: &mut Visited,
    ) -> Option<Vec<&'a Expression<'a>>> {
        let mut out = Vec::new();
        for literal in self.literals(node, visited)? {
            let Literal::Array(array) = literal else {
                return None;
            };
            for element in &array.elements {
                match element {
                    ArrayExpressionElement::SpreadElement(spread) => {
                        out.extend(self.items_of(&spread.argument, visited)?);
                    }
                    ArrayExpressionElement::Elision(_) => return None,
                    element => out.push(element.to_expression()),
                }
            }
        }
        Some(out)
    }

    /// The array and object literals `node` can be.
    fn literals(
        &self,
        node: &'a Expression<'a>,
        visited: &mut Visited,
    ) -> Option<Vec<Literal<'a>>> {
        let id = node.node_id();
        if visited.expressions.contains(&id) {
            return None;
        }
        visited.expressions.push(id);
        let out = match without_typescript(node) {
            Expression::ArrayExpression(array) => Some(vec![Literal::Array(array)]),
            Expression::ObjectExpression(object) => Some(vec![Literal::Object(object)]),
            Expression::Identifier(identifier) if !self.is_item(identifier) => {
                self.constant(identifier, visited, |check, initializer, visited| {
                    check.literals(initializer, visited)
                })
            }
            node => self.values(node, visited).and_then(|values| {
                let mut out = Vec::new();
                for value in values {
                    out.extend(self.literals(value, visited)?);
                }
                Some(out)
            }),
        };
        visited.expressions.pop();
        out
    }

    fn is_item(&self, identifier: &IdentifierReference<'_>) -> bool {
        self.script
            .symbol(identifier)
            .is_some_and(|symbol| self.items.contains_key(&symbol))
    }

    fn allowed(&self, url: Url<'a>, allow: Allow, visited: &mut Visited) -> bool {
        let node = match url {
            Url::Expression(node) => node,
            Url::Text(text) => {
                return (allow.absolute && has_scheme(text))
                    || (allow.fragment && text.starts_with('#'));
            }
        };
        let id = node.node_id();
        if visited.expressions.contains(&id) {
            return false;
        }
        visited.expressions.push(id);
        let out = self.expression_allowed(node, allow, visited);
        visited.expressions.pop();
        out
    }

    fn expression_allowed(
        &self,
        node: &'a Expression<'a>,
        allow: Allow,
        visited: &mut Visited,
    ) -> bool {
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
            Expression::StaticMemberExpression(_) | Expression::ComputedMemberExpression(_) => {
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
            || (allow.empty && is_empty_url(node))
            || (allow.fragment && self.starts_with(node, "#", visited))
            || (allow.nullish && is_nullish(node))
            || self.is_resolve_call(node, visited)
    }

    /// Whether every value [`Check::values`] finds for `node` is allowed where `node` is.
    fn all_values_allowed(
        &self,
        node: &'a Expression<'a>,
        allow: Allow,
        visited: &mut Visited,
    ) -> Option<bool> {
        let values = self.values(node, visited)?;
        Some(
            values
                .into_iter()
                .all(|value| self.allowed(Url::Expression(value), allow, visited)),
        )
    }

    fn starts_with(&self, node: &'a Expression<'a>, prefix: &str, visited: &mut Visited) -> bool {
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

    fn is_resolve_call(&self, node: &'a Expression<'a>, visited: &mut Visited) -> bool {
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

    /// The first `rel` attribute has the token `external`, reading each expression's known
    /// value.
    fn rel_external(&self, component: &Component, attributes: &[Attribute]) -> bool {
        let source = self.script.source;
        let Some(rel) = attributes.iter().find(|attribute| {
            attribute.kind == AttributeKind::Attribute && attribute.name.text(source) == "rel"
        }) else {
            return false;
        };
        let mut value = String::new();
        if let AttributeValue::Parts(parts) = rel.value {
            for part in component.parts(parts) {
                match *part {
                    Part::Text(span) => value.push_str(&decode_attribute(span.text(source))),
                    Part::Expression { expression, .. } => {
                        self.rel_text(self.script.tree.get_expression(expression), &mut value);
                    }
                }
            }
        }
        value
            .split(is_ecmascript_whitespace)
            .any(|token| token == "external")
    }

    fn rel_text(&self, expression: &'a Expression<'a>, out: &mut String) {
        if let Some(Value::String(text)) = self.statics.value(expression) {
            out.push_str(&text);
            return;
        }
        let Expression::TemplateLiteral(template) = expression else {
            // An unknown value can extend the tokens beside it, so it cannot end one.
            out.push('\0');
            return;
        };
        for (index, quasi) in template.quasis.iter().enumerate() {
            let cooked = quasi
                .value
                .cooked
                .as_ref()
                .and_then(|cooked| cooked.as_str());
            out.push_str(cooked.unwrap_or(quasi.value.raw.as_str()));
            if let Some(embedded) = template.expressions.get(index) {
                self.rel_text(embedded, out);
            }
        }
    }
}

// Unlike `no-navigation-without-base`, upstream's rule reads only a `+` as a concatenation.
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

/// `undefined` or `null`, as written.
fn is_nullish(node: &Expression<'_>) -> bool {
    match node {
        Expression::Identifier(identifier) => identifier.name == "undefined",
        Expression::NullLiteral(_) => true,
        _ => false,
    }
}
