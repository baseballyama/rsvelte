//! Whether a document is in runes mode, as `svelte-eslint-parser` decides it for its rules.

use rsvelte_svelte_semantic::resolve::RUNE_ROOTS;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, TemplateNode,
};
use rsvelte_typescript_syntax::Kind;

use crate::rule::File;

/// svelte-eslint-parser's runes mode of a component: a boolean `<svelte:options runes>` decides,
/// or else whether an identifier in a script or the template names a rune (`hasRunesSymbol`,
/// whose `runeSymbols` are [`RUNE_ROOTS`]).
pub(super) fn runes_mode(component: &Component, source: &str) -> bool {
    if let Some(runes) = svelte_options_runes(component, source) {
        return runes;
    }
    let tree = &component.javascript;
    let mut pending: Vec<_> = component
        .module
        .iter()
        .chain(&component.instance)
        .map(|script| script.program)
        .chain(component.template_expressions.iter().copied())
        .collect();
    while let Some(node) = pending.pop() {
        if tree
            .atom(node)
            .is_some_and(|atom| RUNE_ROOTS.contains(&tree.atoms.get(atom)))
        {
            return true;
        }
        tree.for_each_child(node, |child| pending.push(child));
    }
    false
}

/// The official parser rejects any other value of `runes`, so only a boolean reaches here.
fn svelte_options_runes(component: &Component, source: &str) -> Option<bool> {
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
            let value = match attribute.value {
                AttributeValue::True => Some(true),
                AttributeValue::Parts(parts) => match component.parts(parts) {
                    [Part::Expression { expression, .. }] => {
                        match component.javascript.kind(*expression) {
                            Kind::Boolean(value) => Some(value),
                            _ => None,
                        }
                    }
                    _ => None,
                },
            };
            if value.is_some() {
                return value;
            }
        }
    }
    None
}

/// [`runes_mode`] of a component; a `.svelte.js` or `.svelte.ts` module is always in runes mode,
/// and any other module has no mode (`None`).
pub(super) fn runes(file: &File<'_>) -> Option<bool> {
    file.component().map_or_else(
        || is_svelte_file(file).then_some(true),
        |component| Some(runes_mode(component, file.source())),
    )
}

/// A rule's `svelteFileTypes: ['.svelte', '.svelte.[js|ts]']` condition.
pub(super) fn is_svelte_file(file: &File<'_>) -> bool {
    let path = file.path();
    file.is_component() || path.ends_with(".svelte.js") || path.ends_with(".svelte.ts")
}

/// A rule's `runes: [true, 'undetermined']` condition.
pub(super) fn runes_or_undetermined(file: &File<'_>) -> bool {
    runes(file) == Some(true)
}

#[cfg(test)]
mod tests;
