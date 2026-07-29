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

/// Counter for generating unique variable names.
/// Uses per-name counters so each unique component/element name gets its own counter.
pub(super) struct Counter {
    pub(super) counters: std::collections::HashMap<String, u32>,
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
    pub(super) fn new() -> Self {
        Self {
            counters: std::collections::HashMap::new(),
            slot_inst: None,
            named_slot_component_close: false,
            suppress_component_lets: false,
        }
    }
    #[allow(dead_code)]
    pub(super) fn next(&mut self) -> u32 {
        self.next_for("")
    }
    pub(super) fn next_for(&mut self, name: &str) -> u32 {
        let entry = self.counters.entry(name.to_string()).or_insert(0);
        let v = *entry;
        *entry += 1;
        v
    }
}

#[derive(Default)]
pub(super) struct ElementOpenerCommentIndex {
    ranges: Vec<(u32, u32)>,
}

impl ElementOpenerCommentIndex {
    fn new(mut ranges: Vec<(u32, u32)>) -> Self {
        if !ranges.windows(2).all(|pair| pair[0].0 <= pair[1].0) {
            ranges.sort_unstable_by_key(|&(start, _)| start);
        }
        debug_assert!(
            ranges.windows(2).all(|pair| pair[0].1 <= pair[1].0),
            "element-opener comment ranges must not overlap"
        );
        Self { ranges }
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
}

thread_local! {
    /// Source ranges of comments found inside element opening tags (between
    /// attributes), set per-compile so attribute emission can re-attach them as
    /// leading comments. Mirrors official `attr.leadingComments`.
    static ELEMENT_OPENER_COMMENTS: std::cell::RefCell<ElementOpenerCommentIndex> =
        std::cell::RefCell::new(ElementOpenerCommentIndex::default());
    #[cfg(test)]
    static ELEMENT_OPENER_COMMENT_RANGE_VISITS: std::cell::Cell<usize> =
        const { std::cell::Cell::new(0) };
}

/// Set the element-opener comment ranges for the current compile (read-only).
pub(crate) fn set_element_opener_comments(ranges: Vec<(u32, u32)>) {
    ELEMENT_OPENER_COMMENTS.with(|comments| {
        *comments.borrow_mut() = ElementOpenerCommentIndex::new(ranges);
    });
}

/// Clear the element-opener comment ranges after a compile.
pub(crate) fn clear_element_opener_comments() {
    ELEMENT_OPENER_COMMENTS.with(|comments| comments.borrow_mut().ranges.clear());
}

pub(super) fn with_element_opener_comments<T>(
    f: impl FnOnce(&ElementOpenerCommentIndex) -> T,
) -> T {
    ELEMENT_OPENER_COMMENTS.with(|comments| f(&comments.borrow()))
}

#[cfg(test)]
pub(super) fn record_element_opener_comment_range_visits(count: usize) {
    ELEMENT_OPENER_COMMENT_RANGE_VISITS.with(|visits| visits.set(visits.get() + count));
}

#[cfg(test)]
pub(super) fn reset_element_opener_comment_range_visits() {
    ELEMENT_OPENER_COMMENT_RANGE_VISITS.with(|visits| visits.set(0));
}

#[cfg(test)]
pub(super) fn element_opener_comment_range_visits() -> usize {
    ELEMENT_OPENER_COMMENT_RANGE_VISITS.with(std::cell::Cell::get)
}
