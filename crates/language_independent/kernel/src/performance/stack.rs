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
