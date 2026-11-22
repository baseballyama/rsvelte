//! The nodes a [`Locator`] reads, found without walking every node: those around or in each of
//! its regions, in the order of the walk.

use oxc_semantic::{AstNodes, NodeId};
use oxc_span::{GetSpan, Span};
use rsvelte_typescript_tree::Locator;

/// The nodes of an analysis by where they start, outer nodes before inner ones that start with
/// them.
pub(super) struct ByStart<'n, 'a> {
    nodes: &'n AstNodes<'a>,
    ids: Vec<NodeId>,
}

impl<'n, 'a> ByStart<'n, 'a> {
    pub(super) fn new(nodes: &'n AstNodes<'a>) -> Self {
        let mut ids: Vec<NodeId> = nodes.iter().map(oxc_semantic::AstNode::id).collect();
        ids.sort_by_key(|&id| {
            let span = nodes.kind(id).span();
            (span.start, std::cmp::Reverse(span.end))
        });
        Self { nodes, ids }
    }

    fn span(&self, id: NodeId) -> Span {
        self.nodes.kind(id).span()
    }

    /// Hands `locator` the nodes around or in its regions, in the order of the walk, after the
    /// first node, which tells it the part has a tree.
    pub(super) fn visit(&self, locator: &mut Locator) {
        let mut ids: Vec<NodeId> = self.ids.first().copied().into_iter().collect();
        for region in locator.regions() {
            // Every node around the region is an ancestor of the last node starting before it.
            let before = self
                .ids
                .partition_point(|&id| self.span(id).start <= region.start);
            if let Some(&last) = before.checked_sub(1).and_then(|at| self.ids.get(at)) {
                let around = std::iter::once(last).chain(self.nodes.ancestor_ids(last));
                ids.extend(around.filter(|&id| self.span(id).contains_inclusive(region)));
            }
            let from = self
                .ids
                .partition_point(|&id| self.span(id).start < region.start);
            let starting_in = self.ids[from..].iter().copied();
            let starting_in = starting_in.take_while(|&id| self.span(id).start <= region.end);
            ids.extend(starting_in.filter(|&id| region.contains_inclusive(self.span(id))));
        }
        ids.sort_unstable();
        ids.dedup();
        for id in ids {
            locator.enter(self.nodes.kind(id));
        }
    }
}
