//! Analyze-phase accumulators. Only the native profiling binaries read these
//! back, so they cannot affect compiler output.
//!
//! Gated on `measure-pa-split` so the call sites compile away in shipping
//! builds, and reusing that feature rather than adding one keeps a profiling
//! run from having to name two flags to get a whole picture.

#[cfg(feature = "measure-pa-split")]
use std::cell::Cell;
use std::time::Duration;

// `Instant::now()` traps on `wasm32-unknown-unknown` (no system clock), and the
// call site lives in a shared compile path that the WASM playground reaches.
// Same shim as `3_transform/profile.rs`, for the same reason.
#[cfg(not(target_arch = "wasm32"))]
pub type TimerStart = std::time::Instant;

#[cfg(target_arch = "wasm32")]
pub type TimerStart = ();

#[cfg(not(target_arch = "wasm32"))]
#[inline]
pub(crate) fn timer_start() -> TimerStart {
    std::time::Instant::now()
}

#[cfg(target_arch = "wasm32")]
#[inline]
pub(crate) fn timer_start() -> TimerStart {}

#[cfg(not(target_arch = "wasm32"))]
#[inline]
pub(crate) fn timer_elapsed(start: TimerStart) -> Duration {
    start.elapsed()
}

#[cfg(target_arch = "wasm32")]
#[inline]
pub(crate) fn timer_elapsed(_start: TimerStart) -> Duration {
    Duration::ZERO
}

/// `detect_store_subscriptions` cost, split by whether the TS blanking step
/// reused the compiler's own parse or had to make its own.
///
/// `calls` counts every entry, so a zero elsewhere in this struct can be told
/// apart from "the stage never ran" — which is the failure mode a share alone
/// cannot report.
#[derive(Default, Debug, Clone, Copy)]
pub struct StoreSubsCounters {
    pub total: Duration,
    pub calls: u64,
    /// Scripts that went down the TS path at all.
    pub ts_scripts: u64,
    /// Of those, the ones that had to re-parse because the retained program was
    /// unusable. `(A)` exists to keep this at zero; a non-zero value here is the
    /// measurement that says how far it falls short.
    pub ts_reparses: u64,
    /// Bytes handed to the lexical scan, which is the work `(B)` would remove.
    pub scan_bytes: u64,
    /// Why the retained program was rejected, one bucket per guard clause. They
    /// are evaluated in order and only the first failing one is charged, so the
    /// four sum to `ts_reparses` — a residual means a fifth cause exists.
    pub rej_absent: u64,
    pub rej_panicked: u64,
    pub rej_diagnostics: u64,
    pub rej_source_differs: u64,
}

#[cfg(feature = "measure-pa-split")]
thread_local! {
    static STORE_SUBS: Cell<StoreSubsCounters> = const { Cell::new(StoreSubsCounters {
        total: Duration::ZERO,
        calls: 0,
        ts_scripts: 0,
        ts_reparses: 0,
        scan_bytes: 0,
        rej_absent: 0,
        rej_panicked: 0,
        rej_diagnostics: 0,
        rej_source_differs: 0,
    }) };
}

/// Which guard clause rejected the retained program, in evaluation order.
#[derive(Clone, Copy)]
pub(crate) enum Reject {
    Absent,
    Panicked,
    Diagnostics,
    SourceDiffers,
}

#[cfg(feature = "measure-pa-split")]
#[inline]
pub(crate) fn record_reject(reason: Reject) {
    STORE_SUBS.with(|c| {
        let mut v = c.get();
        match reason {
            Reject::Absent => v.rej_absent += 1,
            Reject::Panicked => v.rej_panicked += 1,
            Reject::Diagnostics => v.rej_diagnostics += 1,
            Reject::SourceDiffers => v.rej_source_differs += 1,
        }
        c.set(v);
    });
}

#[cfg(not(feature = "measure-pa-split"))]
#[inline(always)]
pub(crate) fn record_reject(_reason: Reject) {}

#[cfg(feature = "measure-pa-split")]
#[inline]
pub(crate) fn record_store_subs(elapsed: Duration) {
    STORE_SUBS.with(|c| {
        let mut v = c.get();
        v.total += elapsed;
        v.calls += 1;
        c.set(v);
    });
}

#[cfg(not(feature = "measure-pa-split"))]
#[inline(always)]
pub(crate) fn record_store_subs(_elapsed: Duration) {}

#[cfg(feature = "measure-pa-split")]
#[inline]
pub(crate) fn record_ts_script(reparsed: bool, scan_bytes: usize) {
    STORE_SUBS.with(|c| {
        let mut v = c.get();
        v.ts_scripts += 1;
        v.ts_reparses += u64::from(reparsed);
        v.scan_bytes += scan_bytes as u64;
        c.set(v);
    });
}

#[cfg(not(feature = "measure-pa-split"))]
#[inline(always)]
pub(crate) fn record_ts_script(_reparsed: bool, _scan_bytes: usize) {}

#[cfg(feature = "measure-pa-split")]
pub fn take_store_subs() -> StoreSubsCounters {
    STORE_SUBS.with(|c| c.replace(StoreSubsCounters::default()))
}

#[cfg(not(feature = "measure-pa-split"))]
pub fn take_store_subs() -> StoreSubsCounters {
    StoreSubsCounters::default()
}
