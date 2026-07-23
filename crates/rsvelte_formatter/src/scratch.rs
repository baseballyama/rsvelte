//! Per-thread scratch arena for the throwaway oxc parses the formatter runs on
//! every `{expr}` and `<script>` body. The allocator is reset once per file so
//! a file's parses share one arena instead of each allocating (and freeing) a
//! fresh chunk — the dominant per-parse cost once the AST work is small.
//!
//! ## Soundness invariant
//!
//! [`acquire`] hands out an `&Allocator` with a caller-chosen lifetime and
//! [`reset`] takes `&mut`, so the two must never overlap. They don't:
//!
//! - Every consumer of [`acquire`] (the leaf `format_*` functions in
//!   `expression` / `script`) parses, formats, and returns an **owned**
//!   `String` / `Vec` within a single call. No arena-allocated value — the
//!   parse AST or the printed program — is stored past that call, so neither
//!   the `&Allocator` nor any reference into the arena is live once the leaf
//!   returns.
//! - [`reset`] runs only at [`crate::format_with_arenas`] entry (once per
//!   file), when no leaf is on the stack, so no [`acquire`] borrow is live.
//!   This holds for the collapse post-pass too, which re-enters
//!   `format_with_arenas` on `<pre>` bodies: by then the outer walk's parses
//!   are already consumed into owned edit strings and the collapse reflow
//!   helpers likewise return owned strings, so the re-entrant `reset` frees
//!   only already-consumed data.
//! - `SCRATCH` is a `thread_local`, so all of the above is per-thread; rayon
//!   workers never share an allocator and never race.

use std::cell::UnsafeCell;

use oxc_allocator::Allocator;

thread_local! {
    static SCRATCH: UnsafeCell<Allocator> = UnsafeCell::new(Allocator::default());
}

/// Borrow this thread's scratch allocator for one throwaway parse. The returned
/// reference is valid until the next [`reset`]; callers must consume the parse
/// it feeds within their own call and stash no arena reference past it (see the
/// module soundness invariant).
pub(crate) fn acquire<'a>() -> &'a Allocator {
    SCRATCH.with(|cell| {
        // SAFETY: `SCRATCH` is a thread-local dropped only at thread exit, so it
        // outlives every reference handed out here and the laundered `'a` cannot
        // dangle. Handing out a shared `&Allocator` is sound because the only
        // `&mut` access, `reset`, never runs while an `acquire` borrow is live
        // on this thread (module invariant); concurrent `acquire` calls within
        // one file only ever coexist as shared borrows, which may alias freely.
        unsafe { &*cell.get() }
    })
}

/// Reset the scratch arena, freeing the previous file's parses while keeping the
/// backing chunk. Called once per file at [`crate::format_with_arenas`] entry.
pub(crate) fn reset() {
    SCRATCH.with(|cell| {
        // SAFETY: exclusive access to this thread's allocator. Sound because
        // `reset` runs only at `format_with_arenas` entry, where the module
        // invariant guarantees no `acquire` reference is live on this thread
        // (leaves consume their parse within the call; the collapse `<pre>`
        // re-entry resets only already-consumed data), so this `&mut` never
        // aliases a live `&`.
        unsafe { (*cell.get()).reset() };
    });
}
