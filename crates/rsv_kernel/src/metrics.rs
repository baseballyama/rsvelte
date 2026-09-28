//! Measurement built in from the start.
//!
//! - [`CountingAlloc`]: a global allocator wrapper a binary opts into; it counts allocations and
//!   bytes per thread. Allocation counts are deterministic, so they can gate CI where time cannot.
//!   With [`track_global`] on it also keeps process-wide totals and the peak of live heap growth;
//!   that costs shared atomics per allocation, so timed runs leave it off.
//! - [`phase`]: a scope guard attributing wall time and allocations to a named phase, **exclusive**
//!   of nested phases. Artifacts and tasks are phases, so an artifact computed on behalf of a task
//!   is charged to the artifact, not to whichever task asked first.
//!
//! Without the `metrics` feature, [`phase`] returns a zero-sized guard and compiles to nothing.

use std::alloc::{GlobalAlloc, Layout, System};
use std::cell::Cell;
use std::sync::atomic::{AtomicBool, AtomicI64, AtomicU64, Ordering::Relaxed};

thread_local! {
    static ALLOCS: Cell<u64> = const { Cell::new(0) };
    static BYTES: Cell<u64> = const { Cell::new(0) };
}

static TRACK: AtomicBool = AtomicBool::new(false);
static G_ALLOCS: AtomicU64 = AtomicU64::new(0);
static G_BYTES: AtomicU64 = AtomicU64::new(0);
static LIVE: AtomicI64 = AtomicI64::new(0);
static PEAK: AtomicI64 = AtomicI64::new(0);

/// `#[global_allocator] static A: CountingAlloc = CountingAlloc;` in a binary enables counting.
pub struct CountingAlloc;

#[inline]
fn counted(size: usize, freed: usize) {
    let _ = ALLOCS.try_with(|c| c.set(c.get() + 1));
    let _ = BYTES.try_with(|c| c.set(c.get() + size as u64));
    if TRACK.load(Relaxed) {
        G_ALLOCS.fetch_add(1, Relaxed);
        G_BYTES.fetch_add(size as u64, Relaxed);
        let delta = size as i64 - freed as i64;
        let live = LIVE.fetch_add(delta, Relaxed) + delta;
        PEAK.fetch_max(live, Relaxed);
    }
}

unsafe impl GlobalAlloc for CountingAlloc {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        counted(layout.size(), 0);
        // SAFETY: forwarded unchanged.
        unsafe { System.alloc(layout) }
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        if TRACK.load(Relaxed) {
            LIVE.fetch_sub(layout.size() as i64, Relaxed);
        }
        // SAFETY: forwarded unchanged.
        unsafe { System.dealloc(ptr, layout) }
    }

    unsafe fn realloc(&self, ptr: *mut u8, layout: Layout, new_size: usize) -> *mut u8 {
        counted(new_size, layout.size());
        // SAFETY: forwarded unchanged.
        unsafe { System.realloc(ptr, layout, new_size) }
    }
}

#[derive(Clone, Copy, Debug, Default)]
pub struct GlobalStats {
    pub allocs: u64,
    pub bytes: u64,
    /// The highest live heap reached above the level at [`track_global`]`(true)`.
    pub peak_live_growth: u64,
}

/// Starts (from zero) or stops process-wide tracking. Only meaningful with [`CountingAlloc`].
pub fn track_global(on: bool) {
    if on {
        G_ALLOCS.store(0, Relaxed);
        G_BYTES.store(0, Relaxed);
        LIVE.store(0, Relaxed);
        PEAK.store(0, Relaxed);
    }
    TRACK.store(on, Relaxed);
}

pub fn global() -> GlobalStats {
    GlobalStats {
        allocs: G_ALLOCS.load(Relaxed),
        bytes: G_BYTES.load(Relaxed),
        peak_live_growth: PEAK.load(Relaxed).max(0) as u64,
    }
}

/// Allocations and bytes requested so far on this thread (zero unless [`CountingAlloc`] is installed).
pub fn thread_allocs() -> (u64, u64) {
    (ALLOCS.with(Cell::get), BYTES.with(Cell::get))
}

#[derive(Clone, Debug, Default)]
pub struct PhaseStats {
    pub name: &'static str,
    pub calls: u64,
    pub self_ns: u64,
    pub total_ns: u64,
    pub self_allocs: u64,
    pub self_bytes: u64,
}

#[cfg(feature = "metrics")]
mod imp {
    use super::{PhaseStats, thread_allocs};
    use std::cell::RefCell;
    use std::sync::{Arc, Mutex};
    use std::time::Instant;

    struct Frame {
        name: &'static str,
        start: Instant,
        allocs0: u64,
        bytes0: u64,
        child_ns: u64,
        child_allocs: u64,
        child_bytes: u64,
    }

    type Table = Arc<Mutex<Vec<PhaseStats>>>;

    static ALL: Mutex<Vec<Table>> = Mutex::new(Vec::new());

    thread_local! {
        static STACK: RefCell<Vec<Frame>> = const { RefCell::new(Vec::new()) };
        static TABLE: Table = {
            let t: Table = Arc::default();
            ALL.lock().unwrap().push(t.clone());
            t
        };
    }

    pub struct PhaseGuard(());

    pub fn phase(name: &'static str) -> PhaseGuard {
        let (allocs0, bytes0) = thread_allocs();
        STACK.with(|s| {
            s.borrow_mut().push(Frame {
                name,
                start: Instant::now(),
                allocs0,
                bytes0,
                child_ns: 0,
                child_allocs: 0,
                child_bytes: 0,
            })
        });
        PhaseGuard(())
    }

    impl Drop for PhaseGuard {
        fn drop(&mut self) {
            let now = Instant::now();
            let (allocs, bytes) = thread_allocs();
            STACK.with(|s| {
                let mut s = s.borrow_mut();
                let f = s.pop().expect("phase stack underflow");
                let total_ns = now.duration_since(f.start).as_nanos() as u64;
                let (ta, tb) = (allocs - f.allocs0, bytes - f.bytes0);
                if let Some(parent) = s.last_mut() {
                    parent.child_ns += total_ns;
                    parent.child_allocs += ta;
                    parent.child_bytes += tb;
                }
                TABLE.with(|t| {
                    let mut t = t.lock().unwrap();
                    let row = match t
                        .iter_mut()
                        .position(|r| std::ptr::eq(r.name, f.name) || r.name == f.name)
                    {
                        Some(i) => &mut t[i],
                        None => {
                            t.push(PhaseStats {
                                name: f.name,
                                ..Default::default()
                            });
                            t.last_mut().unwrap()
                        }
                    };
                    row.calls += 1;
                    row.total_ns += total_ns;
                    row.self_ns += total_ns.saturating_sub(f.child_ns);
                    row.self_allocs += ta.saturating_sub(f.child_allocs);
                    row.self_bytes += tb.saturating_sub(f.child_bytes);
                });
            });
        }
    }

    pub fn snapshot() -> Vec<PhaseStats> {
        let mut by_name: rustc_hash::FxHashMap<&'static str, PhaseStats> = Default::default();
        for t in ALL.lock().unwrap().iter() {
            for r in t.lock().unwrap().iter() {
                let m = by_name.entry(r.name).or_insert_with(|| PhaseStats {
                    name: r.name,
                    ..Default::default()
                });
                m.calls += r.calls;
                m.self_ns += r.self_ns;
                m.total_ns += r.total_ns;
                m.self_allocs += r.self_allocs;
                m.self_bytes += r.self_bytes;
            }
        }
        let mut merged: Vec<PhaseStats> = by_name.into_values().collect();
        merged.sort_by_key(|m| std::cmp::Reverse(m.self_ns));
        merged
    }

    pub fn reset() {
        for t in ALL.lock().unwrap().iter() {
            t.lock().unwrap().clear();
        }
    }

    pub const ENABLED: bool = true;
}

#[cfg(not(feature = "metrics"))]
mod imp {
    use super::PhaseStats;

    pub struct PhaseGuard(());

    #[inline(always)]
    pub fn phase(_: &'static str) -> PhaseGuard {
        PhaseGuard(())
    }

    pub fn snapshot() -> Vec<PhaseStats> {
        Vec::new()
    }

    pub fn reset() {}

    pub const ENABLED: bool = false;
}

pub use imp::{ENABLED, PhaseGuard, phase, reset, snapshot};
