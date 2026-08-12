//! Counterfactual counter for the `clean_node_list` `hoisted` pre-allocation.
//!
//! Records the final `hoisted` length and whether the input was empty for every
//! `clean_node_list` call, so both the allocations `Vec::with_capacity(min(n,8))`
//! performs and the ones a lazily-growing `Vec::new()` would perform can be
//! derived from one run. `hoisted.len() <= nodes.count()` always holds, so the
//! old side needs no separate input-length histogram.
//!
//! The growth curves are measured on the real element type rather than assumed
//! from `RawVec`'s rule, because the rule depends on the element size.

use std::borrow::Cow;
use std::cell::{Cell, RefCell};

use compact_str::CompactString;

use crate::ast::template::{Comment, TemplateNode};

/// Lengths above this are counted exactly instead of bucketed.
const HIST_MAX: usize = 32;

thread_local! {
    static CALLS: Cell<u64> = const { Cell::new(0) };
    static EMPTY_INPUT: Cell<u64> = const { Cell::new(0) };
    static HIST: RefCell<[u64; HIST_MAX + 1]> = const { RefCell::new([0; HIST_MAX + 1]) };
    static OVER_HIST: RefCell<Vec<usize>> = const { RefCell::new(Vec::new()) };
}

pub fn record(input_len: usize, hoisted_len: usize) {
    CALLS.with(|c| c.set(c.get() + 1));
    if input_len == 0 {
        EMPTY_INPUT.with(|c| c.set(c.get() + 1));
    }
    if hoisted_len <= HIST_MAX {
        HIST.with(|h| h.borrow_mut()[hoisted_len] += 1);
    } else {
        OVER_HIST.with(|v| v.borrow_mut().push(hoisted_len));
    }
}

pub fn reset() {
    CALLS.with(|c| c.set(0));
    EMPTY_INPUT.with(|c| c.set(0));
    HIST.with(|h| *h.borrow_mut() = [0; HIST_MAX + 1]);
    OVER_HIST.with(|v| v.borrow_mut().clear());
}

/// `(calls, empty_input, histogram of hoisted lengths 0..=HIST_MAX, lengths above it)`
pub fn snapshot() -> (u64, u64, [u64; HIST_MAX + 1], Vec<usize>) {
    (
        CALLS.with(Cell::get),
        EMPTY_INPUT.with(Cell::get),
        HIST.with(|h| *h.borrow()),
        OVER_HIST.with(|v| v.borrow().clone()),
    )
}

fn dummy_node() -> Cow<'static, TemplateNode<'static>> {
    Cow::Owned(TemplateNode::Comment(Comment {
        start: 0,
        end: 0,
        data: CompactString::new(""),
    }))
}

/// The lengths at which pushing onto a `Vec` that started at `start_cap`
/// (re)allocates, measured on the real element type up to `n` pushes.
#[must_use]
pub fn growth_steps(start_cap: usize, n: usize) -> Vec<usize> {
    let mut v: Vec<Cow<'static, TemplateNode<'static>>> = Vec::with_capacity(start_cap);
    let mut cap = v.capacity();
    let mut steps = Vec::new();
    for i in 0..n {
        v.push(dummy_node());
        if v.capacity() != cap {
            cap = v.capacity();
            steps.push(i + 1);
        }
    }
    steps
}

/// Size of one `hoisted` element, which decides `RawVec`'s minimum capacity.
#[must_use]
pub fn element_size() -> usize {
    std::mem::size_of::<Cow<'static, TemplateNode<'static>>>()
}
