//! Decomposes the work `extract_reactive_statement_deps` does, after the
//! time-share profile put its `rs_deps` row at ~half of the `reactive_stmt`
//! stage.
//!
//! The function re-scans each `$:` body once per known reactive variable — once
//! in `body_references_identifier` and again in `is_assigned_anywhere_in_body`
//! — so `scans / stmt` is the re-scan factor and the ceiling on what reading a
//! retained Phase-2 result instead can remove. `format_allocs` is the separate
//! per-pattern `format!` the assignment scan performs once its `memmem` prefilter
//! hits.

use std::cell::Cell;

thread_local! {
    static STMTS: Cell<u64> = const { Cell::new(0) };
    static REF_SCANS: Cell<u64> = const { Cell::new(0) };
    static ASSIGN_SCANS: Cell<u64> = const { Cell::new(0) };
    static ASSIGN_PREFILTER_MISS: Cell<u64> = const { Cell::new(0) };
    static FORMAT_ALLOCS: Cell<u64> = const { Cell::new(0) };
    static REACTIVE_VARS: Cell<u64> = const { Cell::new(0) };
    static MAX_REACTIVE_VARS: Cell<u64> = const { Cell::new(0) };
    static BODY_BYTES: Cell<u64> = const { Cell::new(0) };
    static SCANNED_BYTES: Cell<u64> = const { Cell::new(0) };
}

/// One `extract_reactive_statement_deps` call that got past the `$:` prefix and
/// non-empty body guards: `vars` is the population each scan loop walks.
pub fn record_stmt(vars: usize, body_bytes: usize) {
    STMTS.with(|c| c.set(c.get() + 1));
    REACTIVE_VARS.with(|c| c.set(c.get() + vars as u64));
    MAX_REACTIVE_VARS.with(|c| c.set(c.get().max(vars as u64)));
    BODY_BYTES.with(|c| c.set(c.get() + body_bytes as u64));
}

/// One `body_references_identifier` pass over `bytes`.
pub fn record_ref_scan(bytes: usize) {
    REF_SCANS.with(|c| c.set(c.get() + 1));
    SCANNED_BYTES.with(|c| c.set(c.get() + bytes as u64));
}

/// One `is_assigned_anywhere_in_body` pass over `bytes`.
pub fn record_assign_scan(bytes: usize) {
    ASSIGN_SCANS.with(|c| c.set(c.get() + 1));
    SCANNED_BYTES.with(|c| c.set(c.get() + bytes as u64));
}

/// The assignment scan's `memmem` prefilter ruled the variable out before any
/// pattern was formatted.
pub fn record_assign_prefilter_miss() {
    ASSIGN_PREFILTER_MISS.with(|c| c.set(c.get() + 1));
}

/// One `format!`-ed needle built inside the assignment scan's pattern loops.
pub fn record_format_alloc(n: usize) {
    FORMAT_ALLOCS.with(|c| c.set(c.get() + n as u64));
}

/// `(stmts, ref_scans, assign_scans, assign_prefilter_miss, format_allocs,
/// reactive_vars, max_reactive_vars, body_bytes, scanned_bytes)`
pub fn snapshot() -> (u64, u64, u64, u64, u64, u64, u64, u64, u64) {
    (
        STMTS.with(Cell::get),
        REF_SCANS.with(Cell::get),
        ASSIGN_SCANS.with(Cell::get),
        ASSIGN_PREFILTER_MISS.with(Cell::get),
        FORMAT_ALLOCS.with(Cell::get),
        REACTIVE_VARS.with(Cell::get),
        MAX_REACTIVE_VARS.with(Cell::get),
        BODY_BYTES.with(Cell::get),
        SCANNED_BYTES.with(Cell::get),
    )
}

pub fn reset() {
    STMTS.with(|c| c.set(0));
    REF_SCANS.with(|c| c.set(0));
    ASSIGN_SCANS.with(|c| c.set(0));
    ASSIGN_PREFILTER_MISS.with(|c| c.set(0));
    FORMAT_ALLOCS.with(|c| c.set(0));
    REACTIVE_VARS.with(|c| c.set(0));
    MAX_REACTIVE_VARS.with(|c| c.set(0));
    BODY_BYTES.with(|c| c.set(0));
    SCANNED_BYTES.with(|c| c.set(0));
}
