//! Per-thread recycling of `Vec` buffers.
//!
//! A tree built for one document hands its column vectors
//! back when dropped, and the next document on the same worker reuses the capacity, so steady-state
//! parsing allocates almost nothing. [`set_enabled`] exists so the saving can be measured.
//!
//! Buffers are pooled per key and handed out last-given first. The key is the element type
//! ([`take`], [`give`]), or the element type and an owner's own type ([`take_keyed`],
//! [`give_keyed`]) where structures of different sizes would otherwise trade buffers of one type
//! (a document's interned text against its formatter's output): each would keep growing the
//! other's. Within one owner, columns of one type are given back in the reverse of the order they
//! are taken, for the same reason.

use std::alloc::Layout;
use std::any::TypeId as TypeIdentifier;
use std::cell::RefCell;
use std::marker::PhantomData;
use std::sync::atomic::{AtomicBool as AtomicBoolean, Ordering};

use rustc_hash::FxHashMap;

static ENABLED: AtomicBoolean = AtomicBoolean::new(true);
const MAXIMUM_PER_KEY: usize = 16;
/// What one thread's pool may hold, in bytes: a buffer that would take it past this is freed, so
/// one unusually large document does not keep its buffers for the rest of the run.
const MAXIMUM_BYTES: usize = 64 << 20;

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
struct Pool {
    buffers: FxHashMap<TypeIdentifier, Vec<Raw>>,
    /// The bytes `buffers` hold.
    bytes: usize,
}

#[expect(unsafe_code, reason = "frees the buffers the pool took ownership of")]
impl Drop for Pool {
    fn drop(&mut self) {
        for raw in self.buffers.drain().flat_map(|(_, v)| v) {
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

struct Plain<T>(PhantomData<fn() -> T>);
struct Keyed<K, T>(PhantomData<fn() -> (K, T)>);

const fn plain_key<T: 'static>() -> TypeIdentifier {
    TypeIdentifier::of::<Plain<T>>()
}

const fn keyed_key<K: 'static, T: 'static>() -> TypeIdentifier {
    TypeIdentifier::of::<Keyed<K, T>>()
}

/// An empty vector, with recycled capacity when one is available.
#[must_use]
pub fn take<T: 'static>() -> Vec<T> {
    take_at::<T>(plain_key::<T>())
}

/// Returns a vector's buffer to this thread's pool (its elements are dropped first).
pub fn give<T: 'static>(v: Vec<T>) {
    give_at(plain_key::<T>(), v);
}

/// [`take`] from the buffers `K` gave back.
#[must_use]
pub fn take_keyed<K: 'static, T: 'static>() -> Vec<T> {
    take_at::<T>(keyed_key::<K, T>())
}

/// [`give`] to the buffers only `K` takes.
pub fn give_keyed<K: 'static, T: 'static>(v: Vec<T>) {
    give_at(keyed_key::<K, T>(), v);
}

/// [`take_keyed`] as a `String`.
#[must_use]
#[expect(
    unsafe_code,
    reason = "clearing the fallback buffer makes it valid UTF-8 without losing its capacity"
)]
pub fn take_string<K: 'static>() -> String {
    let bytes = take_keyed::<K, u8>();
    String::from_utf8(bytes).unwrap_or_else(|e| {
        let mut bytes = e.into_bytes();
        bytes.clear();
        // SAFETY: an empty byte slice is UTF-8.
        unsafe { String::from_utf8_unchecked(bytes) }
    })
}

/// [`give_keyed`] for a `String`.
pub fn give_string<K: 'static>(s: String) {
    give_keyed::<K, u8>(s.into_bytes());
}

/// `key` is `T`'s own or `(K, T)`'s: every buffer under it came from a `Vec<T>`.
#[expect(unsafe_code, reason = "reassembles a buffer stored by `give_at`")]
fn take_at<T: 'static>(key: TypeIdentifier) -> Vec<T> {
    if !enabled() || size_of::<T>() == 0 {
        return Vec::new();
    }
    POOL.try_with(|p| {
        let mut p = p.borrow_mut();
        let raw = p.buffers.get_mut(&key).and_then(Vec::pop)?;
        p.bytes -= raw.layout.size();
        // SAFETY: stored by `give_at::<T>` under a key only `Vec<T>`s use, with this capacity;
        // length 0 is always valid.
        Some(unsafe { Vec::from_raw_parts(raw.ptr.cast::<T>(), 0, raw.cap) })
    })
    .ok()
    .flatten()
    .unwrap_or_default()
}

#[expect(
    unsafe_code,
    reason = "disassembles the vector so its buffer outlives it"
)]
fn give_at<T: 'static>(key: TypeIdentifier, mut v: Vec<T>) {
    if !enabled() || v.capacity() == 0 || size_of::<T>() == 0 {
        return;
    }
    v.clear();
    let mut v = std::mem::ManuallyDrop::new(v);
    let (ptr, cap) = (v.as_mut_ptr(), v.capacity());
    // A live `Vec<T>`'s buffer always has a valid array layout.
    let Ok(layout) = Layout::array::<T>(cap) else {
        unreachable!("a live Vec's buffer has a valid layout")
    };
    let kept = POOL.try_with(|p| {
        let mut p = p.borrow_mut();
        if p.bytes + layout.size() > MAXIMUM_BYTES {
            return false;
        }
        let slot = p.buffers.entry(key).or_default();
        let room = slot.len() < MAXIMUM_PER_KEY;
        if room {
            slot.push(Raw {
                ptr: ptr.cast(),
                cap,
                layout,
            });
            p.bytes += layout.size();
        }
        room
    });
    if kept != Ok(true) {
        // SAFETY: reconstructs the vector we just disassembled, so it frees normally.
        drop(unsafe { Vec::from_raw_parts(ptr, 0, cap) });
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn plain_and_keyed_buffers_have_disjoint_keys() {
        struct Owner;
        assert_ne!(
            super::plain_key::<(Owner, u8)>(),
            super::keyed_key::<Owner, u8>()
        );
    }

    #[test]
    fn a_non_utf8_keyed_buffer_keeps_its_capacity_for_a_string() {
        struct Owner;
        let mut bytes = Vec::with_capacity(100);
        bytes.push(0xFF);
        let cap = bytes.capacity();
        super::give_keyed::<Owner, u8>(bytes);
        let text = super::take_string::<Owner>();
        assert!(text.is_empty());
        assert_eq!(text.capacity(), cap);
    }

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

    #[test]
    fn keyed_buffers_are_not_handed_to_other_owners() {
        struct Owner;
        super::set_enabled(true);
        let mut v: Vec<u16> = super::take_keyed::<Owner, u16>();
        v.extend(0..1000);
        let cap = v.capacity();
        super::give_keyed::<Owner, u16>(v);
        let plain: Vec<u16> = super::take();
        assert_ne!(plain.capacity(), cap);
        let keyed: Vec<u16> = super::take_keyed::<Owner, u16>();
        assert_eq!(keyed.capacity(), cap);
    }

    #[test]
    fn a_buffer_past_the_budget_is_freed() {
        struct Big;
        super::set_enabled(true);
        let v: Vec<u8> = Vec::with_capacity(super::MAXIMUM_BYTES + 1);
        super::give_keyed::<Big, u8>(v);
        assert_eq!(super::take_keyed::<Big, u8>().capacity(), 0);
    }
}
