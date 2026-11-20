//! Measurement built in from the start.
//!
//! - [`CountingAllocator`]: a global allocator wrapper a binary opts into; it counts allocations
//!   and bytes per thread. Allocation counts are deterministic, so they can gate CI where time
//!   cannot. With [`track_global`] on it also keeps process-wide totals and the peak of live heap
//!   growth; that costs shared atomics per allocation, so timed runs leave it off.
//! - [`phase`]: a scope guard attributing wall time and allocations to a named phase, **exclusive**
//!   of nested phases. Artifacts and tasks are phases, so an artifact computed on behalf of a task
//!   is charged to the artifact, not to whichever task asked first.
//!
//! Without the `metrics` feature, [`phase`] returns a zero-sized guard and compiles to nothing.

use std::alloc::{GlobalAlloc, Layout, System};
use std::cell::Cell;
use std::sync::atomic::Ordering::Relaxed;
use std::sync::atomic::{AtomicBool as AtomicBoolean, AtomicI64, AtomicU64};

thread_local! {
    /// Allocations and bytes requested on this thread; one cell, so counting is one TLS access.
    static COUNTS: Cell<(u64, u64)> = const { Cell::new((0, 0)) };
}

static TRACK: AtomicBoolean = AtomicBoolean::new(false);
static G_ALLOCATIONS: AtomicU64 = AtomicU64::new(0);
static G_BYTES: AtomicU64 = AtomicU64::new(0);
static LIVE: AtomicI64 = AtomicI64::new(0);
static PEAK: AtomicI64 = AtomicI64::new(0);

/// `#[global_allocator] static A: CountingAllocator = CountingAllocator;` in a binary enables
/// counting.
#[derive(Debug)]
pub struct CountingAllocator;

#[inline]
#[expect(
    clippy::cast_possible_wrap,
    reason = "a `Layout` size never exceeds `isize::MAX`"
)]
fn counted(size: usize, freed: usize) {
    // A const-initialised `Cell` has no destructor, so `try_with` fails only if the platform has
    // already torn the thread's storage down; that allocation goes uncounted.
    _ = COUNTS.try_with(|c| {
        let (n, b) = c.get();
        c.set((n + 1, b + size as u64));
    });
    if TRACK.load(Relaxed) {
        G_ALLOCATIONS.fetch_add(1, Relaxed);
        G_BYTES.fetch_add(size as u64, Relaxed);
        let delta = size as i64 - freed as i64;
        let live = LIVE.fetch_add(delta, Relaxed) + delta;
        PEAK.fetch_max(live, Relaxed);
    }
}

// SAFETY: every method forwards to `System` with its arguments unchanged.
#[expect(unsafe_code, reason = "a `GlobalAlloc` impl is unsafe by definition")]
unsafe impl GlobalAlloc for CountingAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        // SAFETY: forwarded unchanged.
        let p = unsafe { System.alloc(layout) };
        if !p.is_null() {
            counted(layout.size(), 0);
        }
        p
    }

    /// Forwarded, so a zeroed request keeps the system's `calloc` (and its fresh zero pages)
    /// instead of the default `alloc` followed by a write of every byte.
    unsafe fn alloc_zeroed(&self, layout: Layout) -> *mut u8 {
        // SAFETY: forwarded unchanged.
        let p = unsafe { System.alloc_zeroed(layout) };
        if !p.is_null() {
            counted(layout.size(), 0);
        }
        p
    }

    #[expect(
        clippy::cast_possible_wrap,
        reason = "a `Layout` size never exceeds `isize::MAX`"
    )]
    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        if TRACK.load(Relaxed) {
            LIVE.fetch_sub(layout.size() as i64, Relaxed);
        }
        // SAFETY: forwarded unchanged.
        unsafe { System.dealloc(ptr, layout) }
    }

    unsafe fn realloc(&self, ptr: *mut u8, layout: Layout, new_size: usize) -> *mut u8 {
        // SAFETY: forwarded unchanged.
        let p = unsafe { System.realloc(ptr, layout, new_size) };
        // On failure the old block is untouched, and so are the counts.
        if !p.is_null() {
            counted(new_size, layout.size());
        }
        p
    }
}

#[derive(Clone, Copy, Debug, Default)]
pub struct GlobalMeasurements {
    pub allocations: u64,
    pub bytes: u64,
    /// The highest live heap reached above the level at [`track_global`] with `true`. Growth, not
    /// usage: memory held before tracking starts is not in it, and freeing some of it drives the
    /// live count below zero, which reads as no growth.
    pub peak_live_growth: u64,
}

/// Starts (from zero) or stops process-wide tracking. Only meaningful with [`CountingAllocator`].
pub fn track_global(on: bool) {
    if on {
        G_ALLOCATIONS.store(0, Relaxed);
        G_BYTES.store(0, Relaxed);
        LIVE.store(0, Relaxed);
        PEAK.store(0, Relaxed);
    }
    TRACK.store(on, Relaxed);
}

pub fn global() -> GlobalMeasurements {
    GlobalMeasurements {
        allocations: G_ALLOCATIONS.load(Relaxed),
        bytes: G_BYTES.load(Relaxed),
        peak_live_growth: u64::try_from(PEAK.load(Relaxed)).unwrap_or(0),
    }
}

/// Allocations and bytes requested so far on this thread (zero unless [`CountingAllocator`] is
/// installed).
pub fn thread_allocations() -> (u64, u64) {
    COUNTS.with(Cell::get)
}

/// Per-phase totals; times are wall-clock time on the thread that ran the phase, summed over
/// threads.
///
/// Not CPU time (a thread waiting inside a phase is charged), and not elapsed time (ten threads
/// count ten times). Read them as shares of the whole.
#[derive(Clone, Debug, Default)]
pub struct PhaseMeasurements {
    pub name: &'static str,
    pub calls: u64,
    pub self_ns: u64,
    pub total_ns: u64,
    pub self_allocations: u64,
    pub self_bytes: u64,
}

#[cfg(feature = "metrics")]
mod phases;
#[cfg(not(feature = "metrics"))]
mod phases_disabled;

#[cfg(feature = "metrics")]
pub use phases::{ENABLED, PhaseGuard, phase, reset, snapshot};
#[cfg(not(feature = "metrics"))]
pub use phases_disabled::{ENABLED, PhaseGuard, phase, reset, snapshot};

// `PhaseGuard: !Send`, checked at compile time: were it `Send`, both impls below would apply and
// the call would be ambiguous.
const _: fn() = || {
    trait AmbiguousIfSend<A> {
        fn some_item() {}
    }
    impl<T: ?Sized> AmbiguousIfSend<()> for T {}
    struct Invalid;
    impl<T: ?Sized + Send> AmbiguousIfSend<Invalid> for T {}
    <PhaseGuard as AmbiguousIfSend<_>>::some_item();
};
