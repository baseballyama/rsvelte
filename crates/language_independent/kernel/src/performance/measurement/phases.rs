//! The phase table, with the `metrics` feature on.

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
mod tests;
