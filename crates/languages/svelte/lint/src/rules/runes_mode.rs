//! Whether a document is in runes mode, as `svelte-eslint-parser` decides before compiling.

use rsvelte_svelte::syntax::syntax_tree::{AttributeValue, Component, Part, TemplateNode};
use rsvelte_typescript::Kind;
use rsvelte_typescript::lexer::T;

use crate::rule::File;

/// The identifiers whose presence turns runes mode on.
const RUNES: &[&str] = &[
    "$state",
    "$derived",
    "$effect",
    "$props",
    "$bindable",
    "$inspect",
    "$host",
];

/// `<svelte:options runes>` when it says, else whether an identifier names a rune. A `.svelte.js`
/// or `.svelte.ts` module is always in runes mode; any other module has no mode (`None`).
pub(super) fn runes(file: &File<'_>) -> Option<bool> {
    let Some(component) = file.component() else {
        let path = file.path();
        return (path.ends_with(".svelte.js") || path.ends_with(".svelte.ts")).then_some(true);
    };
    let source = file.source();
    Some(option(component, source).unwrap_or_else(|| {
        component
            .javascript
            .tokens
            .iter()
            .any(|token| token.kind == T::Identifier && RUNES.contains(&token.span.text(source)))
    }))
}

/// The `runes` option of `<svelte:options>`, a root element.
fn option(component: &Component, source: &str) -> Option<bool> {
    component
        .children(component.root)
        .iter()
        .find_map(|&child| {
            let TemplateNode::Element {
                name, attributes, ..
            } = component.node(child)
            else {
                return None;
            };
            if name.text(source) != "svelte:options" {
                return None;
            }
            let attribute = component
                .attributes(*attributes)
                .iter()
                .find(|attribute| attribute.name.text(source) == "runes")?;
            match attribute.value {
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
            }
        })
}
