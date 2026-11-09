//! Whether a document is in runes mode, as `svelte-eslint-parser` decides it for a rule's
//! `runes` condition.

use rsvelte_svelte::syntax::syntax_tree::{AttributeKind, AttributeValue, Part, TemplateNode};
use rsvelte_typescript::Kind;

use crate::rule::File;

/// Identifiers whose presence turns runes mode on when `<svelte:options>` does not decide.
const RUNE_SYMBOLS: &[&str] = &[
    "$state",
    "$derived",
    "$effect",
    "$props",
    "$bindable",
    "$inspect",
    "$host",
];

/// `None` for a module that is not a `.svelte.js` or `.svelte.ts` file, which has no runes mode.
pub(super) fn runes(file: &File<'_>) -> Option<bool> {
    let Some(component) = file.component() else {
        return is_svelte_file(file).then_some(true);
    };
    let source = file.source();
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
    let tree = &component.javascript;
    let mut found = false;
    super::nodes::walk(file, |node| {
        found = found
            || matches!(tree.kind(node), Kind::Identifier(atom) if RUNE_SYMBOLS.contains(&tree.atoms.get(atom)));
    });
    Some(found)
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
