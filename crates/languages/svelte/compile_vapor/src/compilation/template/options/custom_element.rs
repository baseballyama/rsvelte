use rsvelte_svelte::semantic::resolve::{BindingKind, Resolution};
use rsvelte_typescript::copy::{Verbatim, copy};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::{FxHashMap, FxHashSet};

use super::CustomElement;

pub(crate) fn copy_options(
    options: &CustomElement,
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    resolution: &Resolution,
    source_text: &str,
) -> CustomElement {
    let mut result = options.clone();
    result.shadow = options
        .shadow
        .map(|value| copy(from, to, &mut Verbatim, value));
    result.extend = options
        .extend
        .map(|value| copy(from, to, &mut Verbatim, value));
    result.props = options
        .props
        .map(|value| properties(from, to, resolution, source_text, value));
    result
}

fn properties(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    resolution: &Resolution,
    source_text: &str,
    options: NodeIdentifier,
) -> NodeIdentifier {
    let bindings: FxHashMap<_, _> = resolution
        .bindings
        .iter_enumerated()
        .filter(|(_, info)| {
            matches!(
                info.kind,
                BindingKind::Property | BindingKind::BindableProperty
            )
        })
        .map(|(binding, info)| (from.name(resolution.sem.bindings[binding].node), info))
        .collect();
    let Kind::Object(properties) = from.kind(options) else {
        unreachable!("custom element props are an object");
    };
    let mut names = FxHashSet::default();
    let mut properties: Vec<_> = properties
        .iter()
        .map(|&property| {
            let Kind::Property { key, value, .. } = from.kind(property) else {
                unreachable!("checked custom element prop");
            };
            let name = if matches!(from.kind(key), Kind::String) {
                from.str_value(key, source_text)
            } else {
                from.name(key)
            };
            let binding = bindings.get(name);
            names.insert(name);
            let key = to.write_string(
                binding
                    .and_then(|binding| binding.prop_key)
                    .map_or(name, |key| from.name(key)),
            );
            let Kind::Object(definitions) = from.kind(value) else {
                unreachable!("checked custom element prop options");
            };
            let mut inferred = binding
                .and_then(|binding| binding.initial)
                .is_some_and(|initial| matches!(from.kind(initial), Kind::Boolean(_)));
            let mut fields = Vec::with_capacity(definitions.len() + usize::from(inferred));
            for &definition in definitions {
                let Kind::Property { key, .. } = from.kind(definition) else {
                    unreachable!("checked custom element prop option");
                };
                let name = if matches!(from.kind(key), Kind::String) {
                    from.str_value(key, source_text)
                } else {
                    from.name(key)
                };
                inferred &= name != "type";
                fields.push(copy(from, to, &mut Verbatim, definition));
            }
            if inferred {
                let name = to.identifier("type");
                let value = to.write_string("Boolean");
                fields.push(to.property(
                    name,
                    value,
                    0,
                    rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
                ));
            }
            let value = to.object(&fields, from.source_location(value));
            to.property(key, value, 0, from.source_location(property))
        })
        .collect();
    for binding in &resolution.bindings {
        if !matches!(
            binding.kind,
            BindingKind::Property | BindingKind::BindableProperty
        ) {
            continue;
        }
        let key = from.name(binding.prop_key.expect("a prop has a key"));
        if names.contains(key) {
            continue;
        }
        let key = to.write_string(key);
        let value = to.object(
            &[],
            rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
        );
        properties.push(to.property(
            key,
            value,
            0,
            rsvelte_kernel::source::positions::SourceLocation::SYNTHETIC,
        ));
    }
    to.object(&properties, from.source_location(options))
}
