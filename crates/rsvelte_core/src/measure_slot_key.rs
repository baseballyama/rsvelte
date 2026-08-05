//! Repository-local instrumentation for the component slot-grouping key.
//!
//! Before the `&str`-key refactor, every non-snippet child of a component
//! fragment produced exactly one owned `String` for its slot name: either
//! `text.data.to_string()` from `determine_slot`, or `"default".to_string()`
//! from the fallback. The map took ownership of that `String`, so the count of
//! calls through this recorder is exactly the count of `String` allocations the
//! pre-refactor code performed, and `bytes` is exactly how many bytes those
//! allocations copied.
//!
//! This is a counterfactual counter: it measures work the old code would have
//! done, not allocations the process performs now (the new code performs none
//! at this site). It is compiled out unless `measure-slot-key` is enabled.

use std::cell::Cell;

thread_local! {
    static CALLS: Cell<u64> = const { Cell::new(0) };
    static BYTES: Cell<u64> = const { Cell::new(0) };
    static DEFAULT_KEYS: Cell<u64> = const { Cell::new(0) };
}

/// Record one slot-key computation. `key` is the borrowed key the new code
/// uses; the old code would have owned a copy of it.
pub fn record(key: &str) {
    CALLS.with(|c| c.set(c.get() + 1));
    BYTES.with(|c| c.set(c.get() + key.len() as u64));
    if key == "default" {
        DEFAULT_KEYS.with(|c| c.set(c.get() + 1));
    }
}

/// `(calls, bytes, default_keys)` accumulated on this thread.
pub fn snapshot() -> (u64, u64, u64) {
    (
        CALLS.with(|c| c.get()),
        BYTES.with(|c| c.get()),
        DEFAULT_KEYS.with(|c| c.get()),
    )
}

pub fn reset() {
    CALLS.with(|c| c.set(0));
    BYTES.with(|c| c.set(0));
    DEFAULT_KEYS.with(|c| c.set(0));
}
