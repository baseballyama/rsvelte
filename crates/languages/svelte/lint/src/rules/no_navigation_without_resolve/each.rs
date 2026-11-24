use std::borrow::Cow;

use oxc_ast::ast::{BindingPattern, Expression, PropertyKey};
use oxc_semantic::SymbolId;
use rsvelte_svelte_syntax::syntax_tree::{Component, TemplateNode};
use rsvelte_typescript_semantic::static_value::StaticValues;
use rsvelte_typescript_tree::Tree;
use rustc_hash::FxHashMap;

/// A name an `{#each}` context declares: the collection, and the keys that lead from an item to
/// the name (`[]` for `as link`, `["href"]` for `as { href }`, `["1"]` for `as [, href]`).
pub(super) struct Item<'a> {
    pub(super) collection: &'a Expression<'a>,
    pub(super) path: Vec<Cow<'a, str>>,
}

/// Every name the `{#each}` contexts of `component` declare through plain names, object patterns
/// and array patterns; a default value or a rest element makes the name's value unknown.
pub(super) fn each_items<'a>(
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
pub(super) fn property_name<'a>(
    statics: &StaticValues<'a>,
    key: &'a PropertyKey<'a>,
) -> Option<Cow<'a, str>> {
    match key {
        PropertyKey::StaticIdentifier(key) => Some(Cow::Borrowed(key.name.as_str())),
        PropertyKey::PrivateIdentifier(_) => None,
        key => statics.string(key.as_expression()?).map(Cow::Owned),
    }
}

/// The array index a key names: a non-negative integer written as `String(index)` writes it.
pub(super) fn array_index(key: &str) -> Option<usize> {
    let canonical = key == "0" || !key.starts_with('0');
    let digits = !key.is_empty() && key.bytes().all(|b| b.is_ascii_digit());
    (canonical && digits).then(|| key.parse().ok()).flatten()
}
