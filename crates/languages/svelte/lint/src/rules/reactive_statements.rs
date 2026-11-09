//! What the rules on Svelte 4's `$:` statements share.

use rsvelte_kernel::index::TypedIndex;
use rsvelte_kernel::source::tokens::{Token, TokenIdentifier, Tokens};
use rsvelte_svelte::semantic::legacy::reactive_body;
use rsvelte_svelte::semantic::resolve::RUNES;
use rsvelte_svelte::syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, TemplateNode, TokenType,
};
use rsvelte_typescript::{Kind, NodeIdentifier};

/// The scripts' programs, the module script's first.
pub(super) fn programs(component: &Component) -> impl Iterator<Item = NodeIdentifier> + '_ {
    component
        .module
        .iter()
        .map(|script| script.program)
        .chain(std::iter::once(component.program))
}

/// The top-level `$:` statements with their bodies, in source order; none in runes mode, where
/// upstream's rules on them do not run.
pub(super) fn reactive_statements<'a>(
    component: &'a Component,
    source: &str,
) -> impl Iterator<Item = (NodeIdentifier, NodeIdentifier)> + 'a {
    let runes = runes(component, source);
    let javascript = &component.javascript;
    programs(component)
        .filter(move |_| !runes)
        .flat_map(move |program| match javascript.kind(program) {
            Kind::Program(body) => body,
            _ => &[],
        })
        .filter_map(move |&statement| {
            reactive_body(javascript, statement).map(|body| (statement, body))
        })
}

/// The tokens, trivia included, from the one at `start` to those that end by `end`.
pub(super) fn between(
    tokens: &Tokens<TokenType>,
    start: u32,
    end: u32,
) -> impl Iterator<Item = &Token<TokenType>> {
    let first = tokens.at(start).map_or(tokens.len(), TypedIndex::index);
    (first..tokens.len())
        .map(|i| tokens.get(TokenIdentifier::new(i)))
        .take_while(move |token| token.span.end_offset <= end)
}

/// Runes mode, as the compiler decides it: `<svelte:options runes>`, or else a script that calls
/// a rune.
pub(super) fn runes(component: &Component, source: &str) -> bool {
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
    let mut pending: Vec<NodeIdentifier> = programs(component).collect();
    while let Some(node) = pending.pop() {
        if let Kind::Call { callee, .. } = javascript.kind(node) {
            let root = match javascript.kind(callee) {
                Kind::Member { object, .. } => object,
                _ => callee,
            };
            if javascript.atom(root).is_some_and(|atom| {
                let name = javascript.atoms.get(atom);
                RUNES
                    .iter()
                    .any(|rune| rune.split('.').next() == Some(name))
            }) {
                return true;
            }
        }
        javascript.for_each_child(node, |child| pending.push(child));
    }
    false
}
