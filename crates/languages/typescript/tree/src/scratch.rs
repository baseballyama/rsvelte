//! Arenas that each thread reuses, so a thread allocates chunks once, not once per document.

use std::cell::RefCell;
use std::thread::{AccessError, LocalKey};

use oxc_allocator::Allocator;

/// The arenas one kind of data reuses on each thread: a stack, so a call inside another call
/// gets its own arena.
pub type Arenas = RefCell<Vec<Allocator>>;

/// A per-thread pool of arenas. Data of different sizes keeps separate pools, so a small
/// arena is not handed to a use that must then grow it.
#[derive(Debug)]
pub struct Pool(&'static LocalKey<Arenas>);

impl Pool {
    #[must_use]
    pub const fn new(arenas: &'static LocalKey<Arenas>) -> Self {
        Self(arenas)
    }

    /// An empty arena: one this thread gave back, or a new one.
    #[must_use]
    pub fn take(&self) -> Allocator {
        self.0.with_borrow_mut(Vec::pop).unwrap_or_default()
    }

    /// Empties `allocator` and keeps it, with its largest chunk, for this thread's next
    /// [`Pool::take`].
    pub fn give_back(&self, mut allocator: Allocator) {
        allocator.reset();
        // A thread that is exiting has dropped its pool; the arena is then freed instead.
        let _kept: Result<(), AccessError> =
            self.0.try_with(|free| free.borrow_mut().push(allocator));
    }
}

thread_local! {
    static TREE_ARENAS: Arenas = const { RefCell::new(Vec::new()) };
}

/// The arenas of trees and of [`with_scratch_arena`].
pub(crate) static TREES: Pool = Pool::new(&TREE_ARENAS);

/// Runs `build` with an empty arena that this thread reuses.
///
/// The result cannot borrow the arena, so nothing built in it outlives the call.
pub fn with_scratch_arena<R>(build: impl FnOnce(&Allocator) -> R) -> R {
    let allocator = TREES.take();
    let result = build(&allocator);
    TREES.give_back(allocator);
    result
}

#[cfg(test)]
mod tests;
