use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

pub(super) fn has_await(tree: &SyntaxTree, root: NodeIdentifier) -> bool {
    let mut pending = vec![root];
    while let Some(node) = pending.pop() {
        match tree.kind(node) {
            Kind::Await(_) => return true,
            Kind::Arrow { .. } | Kind::Function { .. } => {}
            _ => tree.for_each_child(node, |child| pending.push(child)),
        }
    }
    false
}

pub(super) fn await_nodes(
    tree: &SyntaxTree,
    root: NodeIdentifier,
) -> rustc_hash::FxHashSet<NodeIdentifier> {
    let mut result = rustc_hash::FxHashSet::default();
    let mut pending = vec![(root, false)];
    while let Some((node, visited)) = pending.pop() {
        match tree.kind(node) {
            Kind::Await(_) => {
                result.insert(node);
            }
            Kind::Arrow { .. } | Kind::Function { .. } => continue,
            _ => {}
        }
        if visited {
            tree.for_each_child(node, |child| {
                if result.contains(&child) {
                    result.insert(node);
                }
            });
        } else {
            pending.push((node, true));
            tree.for_each_child(node, |child| pending.push((child, false)));
        }
    }
    result
}
