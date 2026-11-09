//! Whether a document is in runes mode, as `svelte-eslint-parser` decides before compiling.

use rsvelte_svelte::syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, TemplateNode,
};
use rsvelte_typescript::Kind;

use super::reactive_statements::programs;
use crate::rule::File;

/// svelte-eslint-parser's `runeSymbols`.
pub(super) const RUNE_SYMBOLS: &[&str] = &[
    "$state",
    "$derived",
    "$effect",
    "$props",
    "$bindable",
    "$inspect",
    "$host",
];

/// svelte-eslint-parser's runes mode: `<svelte:options runes>` decides, or else whether a
/// script names a rune anywhere outside type syntax (`hasRunesSymbol`).
pub(super) fn runes_mode(component: &Component, source: &str) -> bool {
    for node in &component.nodes {
        let TemplateNode::Element {
            name, attributes, ..
        } = node
        else {
            continue;
        };
        if name.text(source) != "svelte:options" {
            continue;
        }
        for attribute in component.attributes(*attributes) {
            if attribute.kind != AttributeKind::Attribute || attribute.name.text(source) != "runes"
            {
                continue;
            }
            return match attribute.value {
                AttributeValue::True => true,
                AttributeValue::Parts(parts) => match component.parts(parts) {
                    [Part::Expression { expression, .. }] => {
                        !matches!(component.javascript.kind(*expression), Kind::Boolean(false))
                    }
                    _ => true,
                },
            };
        }
    }
    let javascript = &component.javascript;
    let mut pending: Vec<_> = programs(component).collect();
    while let Some(node) = pending.pop() {
        if javascript
            .atom(node)
            .is_some_and(|atom| RUNE_SYMBOLS.contains(&javascript.atoms.get(atom)))
        {
            return true;
        }
        javascript.for_each_child(node, |child| pending.push(child));
    }
    false
}

/// [`runes_mode`] of a component; a `.svelte.js` or `.svelte.ts` module is always in runes mode,
/// and any other module has no mode (`None`).
pub(super) fn runes(file: &File<'_>) -> Option<bool> {
    let Some(component) = file.component() else {
        let path = file.path();
        return (path.ends_with(".svelte.js") || path.ends_with(".svelte.ts")).then_some(true);
    };
    Some(runes_mode(component, file.source()))
}

#[cfg(test)]
mod tests;
