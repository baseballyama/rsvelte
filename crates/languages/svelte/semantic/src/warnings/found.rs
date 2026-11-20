//! Warnings in the order the compiler emits them.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::names::is_component_name;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, TemplateNode,
};
use rustc_hash::FxHashMap;

use super::Section;

#[cfg(test)]
mod tests;

/// Where in the compiler's run a warning is emitted.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub(super) enum Stage {
    /// While parsing, in source order.
    Parse,
    /// While creating scopes and reading `<svelte:options>`, before any walk.
    Setup,
    /// The walk of one section: module, instance, then template.
    Walk(Section),
    /// After the walks, about the bindings they visited.
    Bindings,
    /// The style sheet's unused selectors, last.
    Stylesheet,
}

impl Stage {
    /// Whether a `svelte-ignore` reaches it: only the walks build the ignore stack.
    pub(super) const fn ignorable(self) -> bool {
        matches!(self, Self::Walk(_) | Self::Bindings)
    }
}

/// The warnings found so far, each with where the compiler would emit it.
#[derive(Default)]
pub(super) struct Found {
    items: Vec<(Stage, u64, Diagnostic)>,
    /// The places where a check read a `svelte-ignore` itself, with the code it ignored there.
    silenced: Vec<(Span, &'static str)>,
}

impl Found {
    /// A warning the visitor of the node at `at` emits before visiting its children.
    pub(super) fn push(&mut self, stage: Stage, at: u32, warning: Diagnostic) {
        self.items.push((stage, u64::from(at) * 4 + 2, warning));
    }

    /// A warning about a `svelte-ignore` code, which the walk reads just before it visits the
    /// node at `at`.
    pub(super) fn before(&mut self, stage: Stage, at: u32, warning: Diagnostic) {
        self.items.push((stage, u64::from(at) * 4 + 1, warning));
    }

    /// A check that reads `svelte-ignore` itself ignored `code` in `span`; its warnings there
    /// are kept, marked ignored.
    pub(super) fn silence(&mut self, span: Span, code: &'static str) {
        self.silenced.push((span, code));
    }

    /// The warnings in emission order, the template's in `order`, equal positions in the order
    /// they were found in, and whether a check's own `svelte-ignore` ignored each; that list is
    /// empty when no check ignored anything.
    pub(super) fn finish(mut self, order: &VisitOrder) -> (Vec<(Stage, Diagnostic)>, Vec<bool>) {
        if !order.moves.is_empty() {
            for (stage, at, _) in &mut self.items {
                if *stage == Stage::Walk(Section::Template) {
                    *at = order.key(*at);
                }
            }
        }
        self.items.sort_by_key(|(stage, at, _)| (*stage, *at));
        // Most components silence nothing, so they need no second list.
        if self.silenced.is_empty() {
            let found = (self.items.into_iter())
                .map(|(stage, _, warning)| (stage, warning))
                .collect();
            return (found, Vec::new());
        }
        let silenced = &self.silenced;
        self.items
            .into_iter()
            .map(|(stage, _, warning)| {
                let ignored = silenced.iter().any(|&(span, code)| {
                    &*warning.code == code
                        && span.start_offset <= warning.span.start_offset
                        && warning.span.end_offset <= span.end_offset
                });
                ((stage, warning), ignored)
            })
            .unzip()
    }
}

/// Where upstream's template walk visits the children of a component that it does not visit in
/// source order: the default slot's first, then each named slot's, in the order the names first
/// appear.
#[derive(Default)]
pub(super) struct VisitOrder {
    /// Each child visited away from where it stands: its span and how far its visit moves.
    moves: Vec<(u32, u32, i64)>,
}

impl VisitOrder {
    pub(super) fn of(component: &Component, source: &str) -> Self {
        let mut moves = Vec::new();
        for node in &component.nodes {
            let TemplateNode::Element { name, children, .. } = node else {
                continue;
            };
            let name = name.text(source);
            if !(is_component_name(name) || matches!(name, "svelte:component" | "svelte:self")) {
                continue;
            }
            let children = component.children(*children);
            let Some(&first) = children.first() else {
                continue;
            };
            // Without a named slot the visit is source order, so build nothing.
            let named = |child: &_| {
                slot_of(component, source, component.node(*child)).is_some_and(|s| s != "default")
            };
            if !children.iter().any(named) {
                continue;
            }
            // Upstream files a comment with the child after it.
            let mut groups: Vec<Vec<u32>> = vec![Vec::new()];
            let mut index = FxHashMap::from_iter([("default", 0)]);
            let mut comments = Vec::new();
            for &child in children {
                if let TemplateNode::Comment { .. } = component.node(child) {
                    comments.push(child);
                    continue;
                }
                let slot = slot_of(component, source, component.node(child)).unwrap_or("default");
                let next = groups.len();
                let group = *index.entry(slot).or_insert(next);
                if group == next {
                    groups.push(Vec::new());
                }
                groups[group].append(&mut comments);
                groups[group].push(child);
            }
            groups[0].append(&mut comments);
            let mut cursor = i64::from(component.node(first).span().start_offset);
            for &child in groups.iter().flatten() {
                let span = component.node(child).span();
                let delta = cursor - i64::from(span.start_offset);
                if delta != 0 {
                    moves.push((span.start_offset, span.end_offset, delta));
                }
                cursor += i64::from(span.end_offset - span.start_offset);
            }
        }
        Self { moves }
    }

    /// The sort key of a warning at `key`, which [`Found`] made from its position.
    fn key(&self, key: u64) -> u64 {
        let (at, within) = (key / 4, key % 4);
        // A nested component's children move inside one child of the outer, so the moves add.
        let moved: i64 = (self.moves.iter())
            .filter(|&&(start, end, _)| u64::from(start) <= at && at < u64::from(end))
            .map(|&(_, _, delta)| delta)
            .sum();
        at.saturating_add_signed(moved) * 4 + within
    }
}

/// Upstream `determine_slot`: the static `slot` attribute of an element.
fn slot_of<'s>(component: &Component, source: &'s str, node: &TemplateNode) -> Option<&'s str> {
    let TemplateNode::Element { attributes, .. } = node else {
        return None;
    };
    component.attributes(*attributes).iter().find_map(|a| {
        if a.kind != AttributeKind::Attribute || a.name.text(source) != "slot" {
            return None;
        }
        match a.value {
            AttributeValue::Parts(parts) => match component.parts(parts) {
                [Part::Text(text)] => Some(text.text(source)),
                _ => None,
            },
            AttributeValue::True => None,
        }
    })
}
