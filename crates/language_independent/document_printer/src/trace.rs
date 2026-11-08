//! What [`LayoutInstructions::print_with_trace`](crate::LayoutInstructions::print_with_trace)
//! records about each layout choice.

use crate::LayoutInstructionIdentifier;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum TraceMode {
    Flat,
    Break,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum GroupDecision {
    Fits,
    DoesNotFit,
    Broken,
    ParentFlat,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum TraceEvent {
    Group {
        document: LayoutInstructionIdentifier,
        position: usize,
        remaining: isize,
        mode: TraceMode,
        decision: GroupDecision,
    },
    Fill {
        document: LayoutInstructionIdentifier,
        position: usize,
        content_fits: bool,
        separator_fits: Option<bool>,
    },
    Refused {
        document: LayoutInstructionIdentifier,
        position: usize,
    },
    Remeasure {
        position: usize,
    },
}
