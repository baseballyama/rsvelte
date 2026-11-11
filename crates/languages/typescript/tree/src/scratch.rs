//! Arenas that each thread reuses, so a thread allocates chunks once, not once per document.

use std::cell::RefCell;
use std::thread::AccessError;

use oxc_allocator::Allocator;

thread_local! {
    // A stack, so a call inside another call gets its own arena.
    static FREE: RefCell<Vec<Allocator>> = const { RefCell::new(Vec::new()) };
}

/// An empty arena: one this thread gave back, or a new one.
pub(crate) fn take() -> Allocator {
    FREE.with_borrow_mut(Vec::pop).unwrap_or_default()
}

/// Empties `allocator` and keeps it, with its largest chunk, for this thread's next [`take`].
pub(crate) fn give_back(mut allocator: Allocator) {
    allocator.reset();
    // A thread that is exiting has dropped its pool; the arena is then freed instead.
    let _kept: Result<(), AccessError> = FREE.try_with(|free| free.borrow_mut().push(allocator));
}

/// Runs `build` with an empty arena that this thread reuses.
///
/// The result cannot borrow the arena, so nothing built in it outlives the call.
pub fn with_scratch_arena<R>(build: impl FnOnce(&Allocator) -> R) -> R {
    let allocator = take();
    let result = build(&allocator);
    give_back(allocator);
    result
}

#[cfg(test)]
mod tests;
