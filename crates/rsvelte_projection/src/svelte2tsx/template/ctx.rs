//! Walk state shared by the template handlers: node position accessors, the
//! variable-name [`Counter`], and the per-compile element-opener comment ranges.

use crate::ast::template::TemplateNode;

/// Extension trait for getting start/end positions from TemplateNode.
pub(super) trait TemplateNodeExt {
    fn start(&self) -> u32;
    fn end(&self) -> u32;
}

impl TemplateNodeExt for TemplateNode<'_> {
    fn start(&self) -> u32 {
        match self {
            TemplateNode::Text(n) => n.start,
            TemplateNode::Comment(n) => n.start,
            TemplateNode::TitleElement(n) => n.start,
            TemplateNode::SlotElement(n) => n.start,
            TemplateNode::SvelteBody(n)
            | TemplateNode::SvelteDocument(n)
            | TemplateNode::SvelteFragment(n)
            | TemplateNode::SvelteBoundary(n)
            | TemplateNode::SvelteHead(n)
            | TemplateNode::SvelteOptions(n)
            | TemplateNode::SvelteSelf(n)
            | TemplateNode::SvelteWindow(n) => n.start,
            TemplateNode::ExpressionTag(n) => n.start,
            TemplateNode::HtmlTag(n) => n.start,
            TemplateNode::ConstTag(n) => n.start,
            TemplateNode::DeclarationTag(n) => n.start,
            TemplateNode::DebugTag(n) => n.start,
            TemplateNode::RenderTag(n) => n.start,
            TemplateNode::AttachTag(n) => n.start,
            TemplateNode::IfBlock(n) => n.start,
            TemplateNode::EachBlock(n) => n.start,
            TemplateNode::AwaitBlock(n) => n.start,
            TemplateNode::KeyBlock(n) => n.start,
            TemplateNode::SnippetBlock(n) => n.start,
            TemplateNode::RegularElement(n) => n.start,
            TemplateNode::Component(n) => n.start,
            TemplateNode::SvelteComponent(n) => n.start,
            TemplateNode::SvelteElement(n) => n.start,
        }
    }

    fn end(&self) -> u32 {
        match self {
            TemplateNode::Text(n) => n.end,
            TemplateNode::Comment(n) => n.end,
            TemplateNode::TitleElement(n) => n.end,
            TemplateNode::SlotElement(n) => n.end,
            TemplateNode::SvelteBody(n)
            | TemplateNode::SvelteDocument(n)
            | TemplateNode::SvelteFragment(n)
            | TemplateNode::SvelteBoundary(n)
            | TemplateNode::SvelteHead(n)
            | TemplateNode::SvelteOptions(n)
            | TemplateNode::SvelteSelf(n)
            | TemplateNode::SvelteWindow(n) => n.end,
            TemplateNode::ExpressionTag(n) => n.end,
            TemplateNode::HtmlTag(n) => n.end,
            TemplateNode::ConstTag(n) => n.end,
            TemplateNode::DeclarationTag(n) => n.end,
            TemplateNode::DebugTag(n) => n.end,
            TemplateNode::RenderTag(n) => n.end,
            TemplateNode::AttachTag(n) => n.end,
            TemplateNode::IfBlock(n) => n.end,
            TemplateNode::EachBlock(n) => n.end,
            TemplateNode::AwaitBlock(n) => n.end,
            TemplateNode::KeyBlock(n) => n.end,
            TemplateNode::SnippetBlock(n) => n.end,
            TemplateNode::RegularElement(n) => n.end,
            TemplateNode::Component(n) => n.end,
            TemplateNode::SvelteComponent(n) => n.end,
            TemplateNode::SvelteElement(n) => n.end,
        }
    }
}

/// Counter for generated template variable names.
pub(super) struct Counter {
    slot: u32,
    pub(super) element_opener_comments: ElementOpenerCommentIndex,
    /// When set (to a component instance var), a `slot="name"` element/component
    /// encountered while processing that component's children — at any depth
    /// inside `{#each}`/`{#if}`/etc. control-flow blocks — is lowered to the
    /// named-slot `$$slot_def[...]` form referencing this instance var. Cleared
    /// when descending into a nested element/component (which owns its own slot
    /// scope). Threaded via `&mut Counter` so the 30+ existing
    /// `process_*_inplace` call sites need no signature change.
    pub(super) slot_inst: Option<String>,
    /// Set just before `handle_named_slot_component` calls `handle_component`:
    /// a component that is a named-slot child has its component-name reference
    /// (`Inner;`) emitted by the caller *outside* the component's own block
    /// (between the component-block close and the named-slot-block close). So
    /// `handle_component` closes its block with a bare `}` (no name) and the
    /// caller emits ` Name}`. Mirrors official `endTransformation` ordering
    /// `['}'(slotLet), name, '}']`. Consumed once at the top of `handle_component`.
    pub(super) named_slot_component_close: bool,
    /// Set just before `handle_named_slot_component` calls `handle_component`:
    /// a component that is a named-slot child (`<C slot="x" let:y>`) has its
    /// `let:` directives consumed by the parent's `$$slot_def["x"]` destructure,
    /// so `handle_component` must NOT re-emit them as the component's own
    /// default-slot let block. Consumed once at the top of `handle_component`.
    pub(super) suppress_component_lets: bool,
}

impl Counter {
    pub(super) fn new(element_opener_comments: impl IntoIterator<Item = (u32, u32)>) -> Self {
        Self {
            slot: 0,
            element_opener_comments: ElementOpenerCommentIndex::new(element_opener_comments),
            slot_inst: None,
            named_slot_component_close: false,
            suppress_component_lets: false,
        }
    }
    pub(super) fn next_slot(&mut self) -> u32 {
        let v = self.slot;
        self.slot += 1;
        v
    }
    pub(super) fn last_slot(&self) -> u32 {
        self.slot.saturating_sub(1)
    }
}

#[cfg(test)]
mod tests {
    use super::Counter;

    #[test]
    fn slot_counter_is_monotonic() {
        let mut counter = Counter::new([]);

        assert_eq!(counter.next_slot(), 0);
        assert_eq!(counter.next_slot(), 1);
        assert_eq!(counter.next_slot(), 2);
        assert_eq!(counter.last_slot(), 2);
    }
}

// `pub(crate)` (not `pub(super)`): `svelte2tsx::nodes::svelte_options` is a
// sibling of `template`, not a descendant, but still needs to construct an
// empty index (via `Default`) to call `opener_spacing` outside the main walk.
#[derive(Default)]
pub(crate) struct ElementOpenerCommentIndex {
    ranges: Vec<(u32, u32)>,
    #[cfg(test)]
    range_visits: std::cell::Cell<usize>,
}

impl ElementOpenerCommentIndex {
    pub(super) fn new(ranges: impl IntoIterator<Item = (u32, u32)>) -> Self {
        let mut ranges: Vec<_> = ranges.into_iter().collect();
        if !ranges.windows(2).all(|pair| pair[0].0 <= pair[1].0) {
            ranges.sort_unstable_by_key(|&(start, _)| start);
        }
        debug_assert!(
            ranges.windows(2).all(|pair| pair[0].1 <= pair[1].0),
            "element-opener comment ranges must not overlap"
        );
        Self {
            ranges,
            #[cfg(test)]
            range_visits: std::cell::Cell::new(0),
        }
    }

    pub(super) fn is_empty(&self) -> bool {
        self.ranges.is_empty()
    }

    pub(super) fn ending_at_or_before(&self, end: u32) -> &[(u32, u32)] {
        let bound = self
            .ranges
            .partition_point(|&(_, range_end)| range_end <= end);
        &self.ranges[..bound]
    }

    pub(super) fn starting_at_or_after(&self, start: u32) -> &[(u32, u32)] {
        let bound = self
            .ranges
            .partition_point(|&(range_start, _)| range_start < start);
        &self.ranges[bound..]
    }

    pub(super) fn contained_in(&self, start: u32, end: u32) -> &[(u32, u32)] {
        let from = self
            .ranges
            .partition_point(|&(range_start, _)| range_start < start);
        let mut to = self
            .ranges
            .partition_point(|&(range_start, _)| range_start < end);
        if to > from && self.ranges[to - 1].1 > end {
            to -= 1;
        }
        &self.ranges[from..to]
    }

    #[cfg(test)]
    pub(super) fn record_range_visits(&self, count: usize) {
        self.range_visits.set(self.range_visits.get() + count);
    }

    #[cfg(test)]
    pub(super) fn reset_range_visits(&self) {
        self.range_visits.set(0);
    }

    #[cfg(test)]
    pub(super) fn range_visits(&self) -> usize {
        self.range_visits.get()
    }
}
