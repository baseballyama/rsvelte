//! Measurement built in from the start.
//!
//! - [`CountingAllocator`]: a global allocator wrapper a binary options into; it counts allocations
//!   and bytes per thread. Allocation counts are deterministic, so they can gate CI where time
//!   cannot. With [`track_global`] on it also keeps process-wide totals and the peak of live heap
//!   growth; that costs shared atomics per allocation, so timed runs leave it offset.
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
mod imp {
    use std::cell::RefCell;
    use std::marker::PhantomData;
    use std::sync::atomic::{AtomicBool as AtomicBoolean, Ordering};
    use std::sync::{Arc, Mutex};
    use std::time::Instant;

    use super::{PhaseMeasurements, thread_allocations};

    struct Frame {
        name: &'static str,
        start: Instant,
        allocs0: u64,
        bytes0: u64,
        child_ns: u64,
        child_allocations: u64,
        child_bytes: u64,
    }

    struct Table {
        rows: Mutex<Vec<PhaseMeasurements>>,
        alive: AtomicBoolean,
    }

    struct LocalTable(Arc<Table>);

    impl Drop for LocalTable {
        fn drop(&mut self) {
            self.0.alive.store(false, Ordering::Release);
        }
    }

    struct Tables {
        active: Vec<Arc<Table>>,
        retired: Vec<PhaseMeasurements>,
    }

    static ALL: Mutex<Tables> = Mutex::new(Tables {
        active: Vec::new(),
        retired: Vec::new(),
    });

    thread_local! {
        static STACK: RefCell<Vec<Frame>> = const { RefCell::new(Vec::new()) };
        static TABLE: LocalTable = {
            let table = Arc::new(Table {
                rows: Mutex::new(Vec::new()),
                alive: AtomicBoolean::new(true),
            });
            ALL.lock()
                .expect("phase table registry poisoned")
                .active
                .push(Arc::clone(&table));
            LocalTable(table)
        };
    }

    fn add(dst: &mut Vec<PhaseMeasurements>, row: &PhaseMeasurements) {
        let merged = if let Some(i) = dst.iter().position(|r| r.name == row.name) {
            &mut dst[i]
        } else {
            dst.push(PhaseMeasurements {
                name: row.name,
                ..Default::default()
            });
            dst.last_mut().expect("a row was just pushed")
        };
        merged.calls += row.calls;
        merged.self_ns += row.self_ns;
        merged.total_ns += row.total_ns;
        merged.self_allocations += row.self_allocations;
        merged.self_bytes += row.self_bytes;
    }

    fn compact(all: &mut Tables) {
        let mut i = 0;
        while i < all.active.len() {
            if all.active[i].alive.load(Ordering::Acquire) {
                i += 1;
                continue;
            }
            let table = all.active.swap_remove(i);
            let rows = table.rows.lock().expect("phase table poisoned");
            for row in rows.iter() {
                add(&mut all.retired, row);
            }
        }
    }

    /// Pops its phase from this thread's stack when dropped, so it must be dropped on the thread
    /// that made it (it is not `Send`) and in reverse order of creation (checked in debug builds).
    #[derive(Debug)]
    pub struct PhaseGuard {
        depth: usize,
        _thread_bound: PhantomData<*const ()>,
    }

    #[must_use]
    pub fn phase(name: &'static str) -> PhaseGuard {
        let (allocs0, bytes0) = thread_allocations();
        let depth = STACK.with(|s| {
            let mut s = s.borrow_mut();
            s.push(Frame {
                name,
                start: Instant::now(),
                allocs0,
                bytes0,
                child_ns: 0,
                child_allocations: 0,
                child_bytes: 0,
            });
            s.len()
        });
        PhaseGuard {
            depth,
            _thread_bound: PhantomData,
        }
    }

    impl Drop for PhaseGuard {
        fn drop(&mut self) {
            let now = Instant::now();
            let (allocations, bytes) = thread_allocations();
            STACK.with(|s| {
                let mut s = s.borrow_mut();
                debug_assert_eq!(s.len(), self.depth, "phase guards dropped out of order");
                let f = s.pop().expect("phase stack underflow");
                let total_ns = now.duration_since(f.start).as_nanos() as u64;
                let (ta, tb) = (allocations - f.allocs0, bytes - f.bytes0);
                if let Some(parent) = s.last_mut() {
                    parent.child_ns += total_ns;
                    parent.child_allocations += ta;
                    parent.child_bytes += tb;
                }
                TABLE.with(|t| {
                    let mut t = t.0.rows.lock().expect("phase table poisoned");
                    let row = if let Some(i) = t.iter_mut().position(|r| r.name == f.name) {
                        &mut t[i]
                    } else {
                        t.push(PhaseMeasurements {
                            name: f.name,
                            ..Default::default()
                        });
                        t.last_mut().expect("a row was just pushed")
                    };
                    row.calls += 1;
                    row.total_ns += total_ns;
                    row.self_ns += total_ns.saturating_sub(f.child_ns);
                    row.self_allocations += ta.saturating_sub(f.child_allocations);
                    row.self_bytes += tb.saturating_sub(f.child_bytes);
                });
            });
        }
    }

    /// # Panics
    ///
    /// If a thread panicked while holding a phase table.
    #[must_use]
    pub fn snapshot() -> Vec<PhaseMeasurements> {
        let mut all = ALL.lock().expect("phase table registry poisoned");
        compact(&mut all);
        let mut merged = all.retired.clone();
        for table in &all.active {
            for row in table.rows.lock().expect("phase table poisoned").iter() {
                add(&mut merged, row);
            }
        }
        drop(all);
        merged.sort_by_key(|m| std::cmp::Reverse(m.self_ns));
        merged
    }

    /// # Panics
    ///
    /// If a thread panicked while holding a phase table.
    pub fn reset() {
        let mut all = ALL.lock().expect("phase table registry poisoned");
        all.retired.clear();
        for table in &all.active {
            table.rows.lock().expect("phase table poisoned").clear();
        }
        compact(&mut all);
        drop(all);
    }

    pub const ENABLED: bool = true;

    #[cfg(test)]
    mod tests {
        use super::{phase, snapshot};

        #[test]
        fn a_finished_threads_measurements_survive_until_snapshot() {
            const NAME: &str = "metrics.test.finished-thread";
            let before = snapshot()
                .into_iter()
                .find(|row| row.name == NAME)
                .map_or(0, |row| row.calls);
            std::thread::spawn(|| {
                let _phase = phase(NAME);
            })
            .join()
            .expect("measurement thread");
            let after = snapshot()
                .into_iter()
                .find(|row| row.name == NAME)
                .map_or(0, |row| row.calls);
            assert_eq!(after, before + 1);
            let repeated = snapshot()
                .into_iter()
                .find(|row| row.name == NAME)
                .map_or(0, |row| row.calls);
            assert_eq!(repeated, after);
        }
    }
}

#[cfg(not(feature = "metrics"))]
mod imp {
    use std::marker::PhantomData;

    use super::PhaseMeasurements;

    /// Not `Send`, as with the `metrics` feature, so code that compiles without it compiles with
    /// it.
    #[derive(Debug)]
    pub struct PhaseGuard(PhantomData<*const ()>);

    #[expect(
        clippy::inline_always,
        reason = "with metrics off a probe must compile to nothing"
    )]
    #[inline(always)]
    #[must_use]
    pub const fn phase(_: &'static str) -> PhaseGuard {
        PhaseGuard(PhantomData)
    }

    #[must_use]
    pub const fn snapshot() -> Vec<PhaseMeasurements> {
        Vec::new()
    }

    pub const fn reset() {}

    pub const ENABLED: bool = false;
}

pub use imp::{ENABLED, PhaseGuard, phase, reset, snapshot};

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
