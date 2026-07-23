//! Per-thread scratch arena for the throwaway oxc parses the formatter runs on
//! every `{expr}` and `<script>` body. The allocator is reset once per file so
//! a file's parses share one arena instead of each allocating (and freeing) a
//! fresh chunk — the dominant per-parse cost once the AST work is small.

use std::cell::UnsafeCell;

use oxc_allocator::Allocator;

thread_local! {
    static SCRATCH: UnsafeCell<Allocator> = UnsafeCell::new(Allocator::default());
}

/// Borrow this thread's scratch allocator for one throwaway parse.
///
/// The returned reference is valid until the next [`reset`]. Callers must
/// consume the parse it feeds (the formatted `String`) before returning and
/// must not stash any arena reference past their own call — every current
/// caller does exactly this.
pub(crate) fn acquire<'a>() -> &'a Allocator {
    SCRATCH.with(|cell| {
        // SAFETY: `SCRATCH` lives for the thread's whole lifetime, so the
        // pointer stays valid; the laundered `'a` is sound because the only
        // `&mut` access (`reset`) happens at a `format` entry, when no
        // `acquire` reference is live on this thread — leaves consume their
        // parse within the call and never span a `format` re-entry. Concurrent
        // `acquire` calls (a leaf formatting a sub-expression) only ever hand
        // out shared references, which may alias freely.
        unsafe { &*cell.get() }
    })
}

/// Reset the scratch arena, freeing the previous file's parses while keeping
/// the backing chunk. Called once per `format`, when no [`acquire`] reference
/// is live on this thread.
pub(crate) fn reset() {
    SCRATCH.with(|cell| {
        // SAFETY: exclusive access. Sound because `reset` runs only at a
        // `format` entry, where no `acquire` reference is outstanding on this
        // thread (see `acquire`), so this `&mut` never aliases a live `&`.
        unsafe { (*cell.get()).reset() };
    });
}
