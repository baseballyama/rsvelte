//! Decomposes the work `transform_prop_reads_in_expr` does, after the time-share
//! profile put it at 10.2% self time.
//!
//! The function re-scans the whole expression once per prop var, so the scanned
//! character count grows as `props x len`. `scanned_chars` is what the current
//! loop actually walks and `expr_chars` is what a single pass would walk; their
//! ratio is the ceiling on what removing the re-scan can win. `vec_char_elems`
//! is the separate `Vec<char>` materialization the loop performs per prop.

use std::cell::Cell;

thread_local! {
    static CALLS: Cell<u64> = const { Cell::new(0) };
    static EMPTY_PROPS: Cell<u64> = const { Cell::new(0) };
    static NO_MATCH: Cell<u64> = const { Cell::new(0) };
    static SLOW_CALLS: Cell<u64> = const { Cell::new(0) };
    static EXPR_CHARS: Cell<u64> = const { Cell::new(0) };
    static SCANNED_CHARS: Cell<u64> = const { Cell::new(0) };
    static VEC_CHAR_ELEMS: Cell<u64> = const { Cell::new(0) };
    static PROPS: Cell<u64> = const { Cell::new(0) };
    static MAX_PROPS: Cell<u64> = const { Cell::new(0) };
}

pub fn record_call() {
    CALLS.with(|c| c.set(c.get() + 1));
}

pub fn record_empty_props() {
    EMPTY_PROPS.with(|c| c.set(c.get() + 1));
}

pub fn record_no_match() {
    NO_MATCH.with(|c| c.set(c.get() + 1));
}

/// One pass of the per-prop loop: `chars` was materialized and walked.
pub fn record_pass(chars: usize) {
    SCANNED_CHARS.with(|c| c.set(c.get() + chars as u64));
    VEC_CHAR_ELEMS.with(|c| c.set(c.get() + chars as u64));
}

pub fn record_slow(expr_chars: usize, props: usize) {
    SLOW_CALLS.with(|c| c.set(c.get() + 1));
    EXPR_CHARS.with(|c| c.set(c.get() + expr_chars as u64));
    PROPS.with(|c| c.set(c.get() + props as u64));
    MAX_PROPS.with(|c| c.set(c.get().max(props as u64)));
}

/// `(calls, empty_props, no_match, slow_calls, expr_chars, scanned_chars, vec_char_elems, props, max_props)`
pub fn snapshot() -> (u64, u64, u64, u64, u64, u64, u64, u64, u64) {
    (
        CALLS.with(Cell::get),
        EMPTY_PROPS.with(Cell::get),
        NO_MATCH.with(Cell::get),
        SLOW_CALLS.with(Cell::get),
        EXPR_CHARS.with(Cell::get),
        SCANNED_CHARS.with(Cell::get),
        VEC_CHAR_ELEMS.with(Cell::get),
        PROPS.with(Cell::get),
        MAX_PROPS.with(Cell::get),
    )
}

pub fn reset() {
    CALLS.with(|c| c.set(0));
    EMPTY_PROPS.with(|c| c.set(0));
    NO_MATCH.with(|c| c.set(0));
    SLOW_CALLS.with(|c| c.set(0));
    EXPR_CHARS.with(|c| c.set(0));
    SCANNED_CHARS.with(|c| c.set(0));
    VEC_CHAR_ELEMS.with(|c| c.set(0));
    PROPS.with(|c| c.set(0));
    MAX_PROPS.with(|c| c.set(0));
}
