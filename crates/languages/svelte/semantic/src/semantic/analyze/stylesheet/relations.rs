use rsvelte_kernel::newtype_index;
use rsvelte_kernel::source::index::{IndexVector, TypedIndex};
use rsvelte_svelte_hir::compiler_syntax_tree::CompilerNodeIdentifier;

use super::worklist::Worklist;
use crate::semantic::visited::Visited;

newtype_index!(
    struct EdgeIdentifier;
);

struct Edge {
    target: CompilerNodeIdentifier,
    next: Option<EdgeIdentifier>,
}

pub(super) struct Relations {
    heads: IndexVector<CompilerNodeIdentifier, Option<EdgeIdentifier>>,
    edges: IndexVector<EdgeIdentifier, Edge>,
    linear: bool,
}

impl Relations {
    pub(super) fn new(nodes: usize) -> Self {
        Self {
            heads: IndexVector::from_element_n(None, nodes),
            edges: IndexVector::new(),
            linear: true,
        }
    }

    pub(super) fn add(&mut self, from: CompilerNodeIdentifier, target: CompilerNodeIdentifier) {
        let next = self.heads[from];
        self.linear &= next.is_none() && from != target;
        self.heads[from] = Some(self.edges.push(Edge { target, next }));
    }

    pub(super) const fn general(&mut self) {
        self.linear = false;
    }

    pub(super) fn direct(
        &self,
        from: CompilerNodeIdentifier,
    ) -> impl Iterator<Item = CompilerNodeIdentifier> + '_ {
        let mut at = self.heads[from];
        std::iter::from_fn(move || {
            let edge = &self.edges[at?];
            at = edge.next;
            Some(edge.target)
        })
    }

    pub(super) fn transitive(
        &self,
        from: CompilerNodeIdentifier,
    ) -> impl Iterator<Item = CompilerNodeIdentifier> + '_ {
        let mut current = Some(from);
        let mut pending = (!self.linear).then(|| {
            let mut pending = Worklist::new();
            pending.extend(self.direct(from));
            pending
        });
        let mut seen = Visited::default();
        std::iter::from_fn(move || {
            if let Some(pending) = &mut pending {
                while let Some(at) = pending.pop() {
                    if seen.insert(at.index()) {
                        pending.extend(self.direct(at));
                        return Some(at);
                    }
                }
                None
            } else {
                current = self.heads[current?].map(|edge| self.edges[edge].target);
                current
            }
        })
    }
}

const _: () = assert!(size_of::<Edge>() == 8, "Edge must stay 8 bytes");
