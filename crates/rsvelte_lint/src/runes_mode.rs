//! Whether a `.svelte` component is in runes mode.
//!
//! Port of `svelte-eslint-parser`'s `svelteParseContext.runes`
//! (`lib/parser/svelte-parse-context.js`): an explicit `<svelte:options runes>`
//! wins in both directions, otherwise `hasRunesSymbol` — any `Identifier` named
//! after a rune, in any position, anywhere in the merged component AST
//! (`lib/parser/index.js:116`).
//!
//! Upstream's field is tri-state, but its `'undetermined'` arm is unreachable
//! for a `.svelte` file: `runes ?? hasRunesSymbol(ast)` always yields a definite
//! boolean, so this returns `bool` rather than an `Option`.

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::ast::template::Root;
use serde_json::Value;

/// The identifier names upstream treats as proof of runes mode.
const RUNE_SYMBOLS: [&str; 7] = [
    "$state",
    "$derived",
    "$effect",
    "$props",
    "$bindable",
    "$inspect",
    "$host",
];

/// Runes mode for a parsed component.
pub(crate) fn component_runes_mode(root: &Root, source: &str) -> bool {
    if let Some(runes) = root.options.as_ref().and_then(|options| options.runes) {
        return runes;
    }
    has_rune_symbol(root, source)
}

/// `hasRunesSymbol`: does any `Identifier` in the component name a rune?
fn has_rune_symbol(root: &Root, source: &str) -> bool {
    if !may_contain_rune_symbol(source) {
        return false;
    }
    with_serialize_arena(&root.arena, || {
        [root.instance.as_ref(), root.module.as_ref()]
            .into_iter()
            .flatten()
            .any(|script| value_has_rune_identifier(script.content.as_json()))
            || [
                serde_json::to_value(&root.fragment).ok(),
                root.options
                    .as_ref()
                    .and_then(|options| serde_json::to_value(options).ok()),
            ]
            .into_iter()
            .flatten()
            .any(|value| value_has_rune_identifier(&value))
    })
}

/// Cheap sound pre-filter: an `Identifier` named after a rune needs its spelling
/// in the source, unless it is written with a unicode escape.
fn may_contain_rune_symbol(source: &str) -> bool {
    source.contains("\\u") || RUNE_SYMBOLS.iter().any(|symbol| source.contains(symbol))
}

fn value_has_rune_identifier(value: &Value) -> bool {
    match value {
        Value::Object(map) => {
            if map.get("type").and_then(Value::as_str) == Some("Identifier")
                && map
                    .get("name")
                    .and_then(Value::as_str)
                    .is_some_and(|name| RUNE_SYMBOLS.contains(&name))
            {
                return true;
            }
            // `loc` holds position objects, never AST nodes.
            map.iter()
                .any(|(key, child)| key != "loc" && value_has_rune_identifier(child))
        }
        Value::Array(items) => items.iter().any(value_has_rune_identifier),
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::component_runes_mode;

    fn runes_of(source: &str) -> bool {
        let alloc = rsvelte_core::Allocator::default();
        let root = rsvelte_core::parse(source, &alloc, crate::engine::lint_parse_options())
            .expect("parse");
        component_runes_mode(&root, source)
    }

    #[test]
    fn legacy_component_without_any_rune_symbol() {
        assert!(!runes_of(
            "<script>\n\tlet a = 1;\n\t$: b = a;\n</script>\n{b}\n"
        ));
    }

    #[test]
    fn rune_call_in_instance_script() {
        assert!(runes_of("<script>\n\tlet a = $state(1);\n</script>\n{a}\n"));
    }

    #[test]
    fn object_literal_key_is_an_identifier_too() {
        assert!(runes_of(
            "<script>\n\tconst holder = { $state: 1 };\n\tvoid holder;\n</script>\n"
        ));
    }

    #[test]
    fn module_script_alone_decides_it() {
        assert!(runes_of(
            "<script module>\n\tconst holder = { $effect: 1 };\n\texport { holder };\n</script>\n"
        ));
    }

    #[test]
    fn template_expression_alone_decides_it() {
        // `$state` here is a store subscription, but upstream's scan is
        // name-only and classifies the component as runes mode.
        assert!(runes_of(
            "<script>\n\timport { state } from './s.js';\n</script>\n{$state}\n"
        ));
    }

    #[test]
    fn a_longer_name_starting_with_a_rune_does_not_count() {
        assert!(!runes_of(
            "<script>\n\tlet $stateStore = 1;\n\tvoid $stateStore;\n</script>\n"
        ));
    }

    #[test]
    fn a_rune_name_inside_a_string_does_not_count() {
        assert!(!runes_of(
            "<script>\n\tconst s = '$state';\n\tvoid s;\n</script>\n"
        ));
    }

    #[test]
    fn svelte_options_overrides_in_both_directions() {
        assert!(runes_of(
            "<svelte:options runes />\n<script>\n\tlet a = 1;\n\t$: b = a;\n</script>\n{b}\n"
        ));
        assert!(!runes_of(
            "<svelte:options runes={false} />\n<script>\n\tlet a = $state(1);\n</script>\n{a}\n"
        ));
    }
}
