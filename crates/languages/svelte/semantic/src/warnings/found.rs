//! Warnings in the order the compiler emits them.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

use super::Section;

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

    /// The warnings in emission order, equal positions in the order they were found in, and
    /// whether a check's own `svelte-ignore` ignored each.
    pub(super) fn finish(mut self) -> (Vec<(Stage, Diagnostic)>, Vec<bool>) {
        self.items.sort_by_key(|(stage, at, _)| (*stage, *at));
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
