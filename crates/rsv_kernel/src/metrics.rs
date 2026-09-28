//! Measurement built in from the start.
//!
//! - [`CountingAlloc`]: a global allocator wrapper a binary opts into; it counts allocations and
//!   bytes per thread. Allocation counts are deterministic, so they can gate CI where time cannot.
//! - [`phase`]: a scope guard attributing wall time and allocations to a named phase, **exclusive**
//!   of nested phases. Artifacts and tasks are phases, so an artifact computed on behalf of a task
//!   is charged to the artifact, not to whichever task asked first.
//!
//! Without the `metrics` feature, [`phase`] returns a zero-sized guard and compiles to nothing.

use std::alloc::{GlobalAlloc, Layout, System};
use std::cell::Cell;

thread_local! {
    static ALLOCS: Cell<u64> = const { Cell::new(0) };
    static BYTES: Cell<u64> = const { Cell::new(0) };
}

/// `#[global_allocator] static A: CountingAlloc = CountingAlloc;` in a binary enables counting.
pub struct CountingAlloc;

unsafe impl GlobalAlloc for CountingAlloc {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        let _ = ALLOCS.try_with(|c| c.set(c.get() + 1));
        let _ = BYTES.try_with(|c| c.set(c.get() + layout.size() as u64));
        // SAFETY: forwarded unchanged.
        unsafe { System.alloc(layout) }
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        // SAFETY: forwarded unchanged.
        unsafe { System.dealloc(ptr, layout) }
    }

    unsafe fn realloc(&self, ptr: *mut u8, layout: Layout, new_size: usize) -> *mut u8 {
        let _ = ALLOCS.try_with(|c| c.set(c.get() + 1));
        let _ = BYTES.try_with(|c| c.set(c.get() + new_size as u64));
        // SAFETY: forwarded unchanged.
        unsafe { System.realloc(ptr, layout, new_size) }
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
