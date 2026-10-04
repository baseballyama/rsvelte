use rsvelte_kernel::source::index::TypedIndex;
use rsvelte_svelte_hir::compiler_syntax_tree::CompilerNodeIdentifier;

use super::super::worklist::Worklist;
use super::Topology;
use crate::semantic::visited::Visited;

impl Topology<'_> {
    pub(in super::super) fn previous(
        &self,
        element: CompilerNodeIdentifier,
        adjacent: bool,
    ) -> impl Iterator<Item = CompilerNodeIdentifier> + '_ {
        self.siblings(element, adjacent, false)
    }

    pub(in super::super) fn following(
        &self,
        element: CompilerNodeIdentifier,
        adjacent: bool,
    ) -> impl Iterator<Item = CompilerNodeIdentifier> + '_ {
        self.siblings(element, adjacent, true)
    }

    fn siblings(
        &self,
        element: CompilerNodeIdentifier,
        adjacent: bool,
        forward: bool,
    ) -> impl Iterator<Item = CompilerNodeIdentifier> + '_ {
        let start = self.links[element]
            .flow
            .expect("a DOM element has a flow node");
        let mut pending = Worklist::new();
        let mut next = Some(start);
        if !self.linear {
            pending.push(start);
        }
        let mut initial = true;
        let mut seen = Visited::default();
        std::iter::from_fn(move || {
            while let Some(flow) = if self.linear {
                next.take()
            } else {
                pending.pop()
            } {
                if !self.linear && !seen.insert(flow.index()) {
                    continue;
                }
                let node = &self.flows[flow];
                if initial || !adjacent || node.element.is_none() {
                    let mut edge = if forward {
                        node.following
                    } else {
                        node.previous
                    };
                    if self.linear {
                        next = edge.map(|id| self.edges[id].target);
                    } else {
                        while let Some(id) = edge {
                            pending.push(self.edges[id].target);
                            edge = self.edges[id].next;
                        }
                    }
                }
                if initial {
                    initial = false;
                    seen.remove(flow.index());
                } else if let Some(element) = node.element {
                    return Some(element);
                }
            }
            None
        })
    }

    pub(in super::super) fn unknown_sibling(
        &self,
        element: CompilerNodeIdentifier,
        adjacent: bool,
    ) -> bool {
        let start = self.links[element].flow.expect("a DOM element has a flow");
        let mut pending = Worklist::new();
        let mut next = Some(start);
        if !self.linear {
            pending.push(start);
        }
        let mut seen = Visited::default();
        while let Some(flow) = if self.linear {
            next.take()
        } else {
            pending.pop()
        } {
            if !self.linear && !seen.insert(flow.index()) {
                continue;
            }
            let node = &self.flows[flow];
            if node.opaque {
                return true;
            }
            if node.element.is_some() && node.element != Some(element) && adjacent {
                continue;
            }
            let mut edge = node.previous;
            if self.linear {
                next = edge.map(|id| self.edges[id].target);
            } else {
                while let Some(id) = edge {
                    pending.push(self.edges[id].target);
                    edge = self.edges[id].next;
                }
            }
        }
        false
    }
}
