//! Per-thread recycling of `Vec` buffers.
//!
//! A tree built for one document hands its column vectors
//! back when dropped, and the next document on the same worker reuses the capacity, so steady-state
//! parsing allocates almost nothing. [`set_enabled`] exists so the saving can be measured.

use std::alloc::Layout;
use std::any::TypeId;
use std::cell::RefCell;
use std::sync::atomic::{AtomicBool, Ordering};

use rustc_hash::FxHashMap;

static ENABLED: AtomicBool = AtomicBool::new(true);
const MAX_PER_TYPE: usize = 16;

pub fn set_enabled(on: bool) {
    ENABLED.store(on, Ordering::Relaxed);
}

pub fn enabled() -> bool {
    ENABLED.load(Ordering::Relaxed)
}

struct Raw {
    ptr: *mut u8,
    cap: usize,
    layout: Layout,
}

#[derive(Default)]
struct Pool(FxHashMap<TypeId, Vec<Raw>>);

#[expect(unsafe_code, reason = "frees the buffers the pool took ownership of")]
impl Drop for Pool {
    fn drop(&mut self) {
        for raw in self.0.drain().flat_map(|(_, v)| v) {
            if raw.layout.size() != 0 {
                // SAFETY: `raw` came from a Vec with this exact layout and was never handed out
                // again.
                unsafe { std::alloc::dealloc(raw.ptr, raw.layout) };
            }
        }
    }
}

thread_local! {
    static POOL: RefCell<Pool> = RefCell::default();
}

/// An empty vector, with recycled capacity when one is available.
#[must_use]
#[expect(unsafe_code, reason = "reassembles a buffer stored by `give`")]
pub fn take<T: 'static>() -> Vec<T> {
    if !enabled() || size_of::<T>() == 0 {
        return Vec::new();
    }
    POOL.try_with(|p| {
        let raw = p
            .borrow_mut()
            .0
            .get_mut(&TypeId::of::<T>())
            .and_then(Vec::pop)?;
        // SAFETY: stored by `give::<T>` from a `Vec<T>` with this capacity; length 0 is always
        // valid.
        Some(unsafe { Vec::from_raw_parts(raw.ptr.cast::<T>(), 0, raw.cap) })
    })
    .ok()
    .flatten()
    .unwrap_or_default()
}

/// Returns a vector's buffer to this thread's pool (its elements are dropped first).
///
/// # Panics
///
/// Never: `Layout::array` cannot fail for a capacity a live `Vec<T>` already holds.
#[expect(
    unsafe_code,
    reason = "disassembles the vector so its buffer outlives it"
)]
pub fn give<T: 'static>(mut v: Vec<T>) {
    if !enabled() || v.capacity() == 0 || size_of::<T>() == 0 {
        return;
    }
    v.clear();
    let mut v = std::mem::ManuallyDrop::new(v);
    let raw = Raw {
        ptr: v.as_mut_ptr().cast(),
        cap: v.capacity(),
        layout: Layout::array::<T>(v.capacity()).expect("a live Vec's buffer has a valid layout"),
    };
    let kept = POOL.try_with(|p| {
        let mut p = p.borrow_mut();
        let slot = p.0.entry(TypeId::of::<T>()).or_default();
        if slot.len() < MAX_PER_TYPE {
            #[expect(
                clippy::unnecessary_struct_initialization,
                reason = "`raw` is used after the closure, so it cannot be moved in"
            )]
            slot.push(Raw {
                ptr: raw.ptr,
                cap: raw.cap,
                layout: raw.layout,
            });
            true
        } else {
            false
        }
    });
    if kept != Ok(true) {
        // SAFETY: reconstructs the vector we just disassembled, so it frees normally.
        drop(unsafe { Vec::from_raw_parts(raw.ptr.cast::<T>(), 0, raw.cap) });
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn capacity_is_reused_on_the_same_thread() {
        super::set_enabled(true);
        let mut v: Vec<u64> = super::take();
        v.extend(0..1000);
        let cap = v.capacity();
        super::give(v);
        let w: Vec<u64> = super::take();
        assert!(w.is_empty());
        assert_eq!(w.capacity(), cap);
    }
}
