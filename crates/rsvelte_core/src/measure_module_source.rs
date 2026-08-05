//! Counterfactual counter for the `module_source` quoting rewrite.
//!
//! The recorder sits on the exact line that used to run `format!("'{source}'")`,
//! so `calls` is the number of heap `String`s the old code allocated there and
//! `source_bytes + 2 * calls` is how many bytes they copied. The old code also
//! made a second arena allocation for the unquoted value; the new code slices it
//! out of the quoted one, so `calls` arena allocations totalling `source_bytes`
//! disappear as well.

use std::cell::Cell;

thread_local! {
    static CALLS: Cell<u64> = const { Cell::new(0) };
    static SOURCE_BYTES: Cell<u64> = const { Cell::new(0) };
}

pub fn record(source_len: usize) {
    CALLS.with(|c| c.set(c.get() + 1));
    SOURCE_BYTES.with(|c| c.set(c.get() + source_len as u64));
}

pub fn snapshot() -> (u64, u64) {
    (CALLS.with(Cell::get), SOURCE_BYTES.with(Cell::get))
}

pub fn reset() {
    CALLS.with(|c| c.set(0));
    SOURCE_BYTES.with(|c| c.set(0));
}
