//! Warnings in the order the compiler emits them.

use rsvelte_kernel::diagnostics::Diagnostic;

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

    /// The warnings in emission order; equal positions keep the order they were found in.
    pub(super) fn finish(mut self) -> Vec<(Stage, Diagnostic)> {
        self.items.sort_by_key(|(stage, at, _)| (*stage, *at));
        self.items
            .into_iter()
            .map(|(stage, _, warning)| (stage, warning))
            .collect()
    }
}
