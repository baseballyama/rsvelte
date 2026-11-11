//! Room on the call stack for recursion as deep as its input.
//!
//! A recursive-descent parser nests as deeply as the text it reads. Each recursive cycle calls
//! [`grow`] once, which costs a stack-pointer comparison while the thread's stack has room and
//! moves the rest of the cycle to a heap-allocated segment when it does not. Callers bound the
//! depth themselves, so a hostile input ends in a diagnostic instead of exhausting memory.

/// Stack left below which [`grow`] moves to a new segment. More than one recursive cycle uses
/// between two calls of [`grow`].
const RED_ZONE: usize = 256 << 10;
/// The size of each new segment.
const SEGMENT: usize = 4 << 20;

/// Runs `f` on this stack, or on a new segment when less than [`RED_ZONE`] is left.
#[inline]
pub fn grow<R>(f: impl FnOnce() -> R) -> R {
    stacker::maybe_grow(RED_ZONE, SEGMENT, f)
}

/// Stack every source byte may need below a task: oxc's passes recurse once per nesting level and
/// grow no stack themselves. The worst measured is an array nested in an array, about 0.4 KiB per
/// byte optimized and 1.3 KiB unoptimized.
#[cfg(not(debug_assertions))]
const PER_BYTE: usize = 1 << 10;
#[cfg(debug_assertions)]
const PER_BYTE: usize = 4 << 10;
/// What a task needs besides the nesting of its text.
const BASE: usize = 1 << 20;

/// Runs `f`, a task over a text of `len` bytes, on a stack as deep as that text may nest: on this
/// one when it has room, else on a segment whose pages are reserved, not committed.
pub fn for_text<R>(len: usize, f: impl FnOnce() -> R) -> R {
    let need = len.saturating_mul(PER_BYTE).saturating_add(BASE);
    stacker::maybe_grow(need, need, f)
}
