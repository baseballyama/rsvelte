use rustc_hash::{FxHashMap, FxHashSet};

use super::{BindingKind, CompileInput, Kind, NodeIdentifier, Resolution};

pub(super) fn build(
    input: &CompileInput<'_>,
    res: &Resolution,
    custom_element: bool,
) -> FxHashSet<NodeIdentifier> {
    let mut reads = FxHashSet::default();
    if !res
        .bindings
        .iter()
        .any(|info| info.kind == BindingKind::RestProperty)
    {
        return reads;
    }
    let tree = input.component.javascript;
    let parents = tree.parents();
    let mut excluded = FxHashMap::default();
    for (binding, info) in res.bindings.iter_enumerated() {
        if info.kind != BindingKind::RestProperty {
            continue;
        }
        let mut keys = FxHashSet::from_iter(["$$slots", "$$events", "$$legacy"]);
        if custom_element {
            keys.insert("$$host");
        }
        let parent = parents[res.sem.bindings[binding].node.index()];
        if parent != NodeIdentifier::NONE && matches!(tree.kind(parent), Kind::Rest(_)) {
            let pattern = parents[parent.index()];
            if let Kind::ObjectPattern(properties) = tree.kind(pattern) {
                for &property in properties {
                    if let Kind::Property { key, .. } = tree.kind(property) {
                        keys.insert(match tree.kind(key) {
                            Kind::Identifier(_) => tree.name(key),
                            _ => tree.str_value(key, input.component.source_text),
                        });
                    }
                }
            }
        }
        excluded.insert(binding, keys);
    }
    for reference in &res.sem.references {
        let Some(keys) = reference.binding.and_then(|binding| excluded.get(&binding)) else {
            continue;
        };
        let member = parents[reference.node.index()];
        if member == NodeIdentifier::NONE {
            continue;
        }
        let Kind::Member {
            object,
            property,
            computed: false,
            ..
        } = tree.kind(member)
        else {
            continue;
        };
        if object != reference.node || keys.contains(tree.name(property)) {
            continue;
        }
        let parent = parents[member.index()];
        if parent != NodeIdentifier::NONE
            && matches!(tree.kind(parent), Kind::Assign(..) | Kind::Update { .. })
        {
            continue;
        }
        reads.insert(reference.node);
    }
    reads
}
