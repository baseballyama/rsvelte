//! Stack growth for recursion whose depth follows the input's AST depth.

/// Must exceed the stack used between two consecutive guarded calls, which in
/// a debug build is dominated by the frame of `JsNode::serialize`'s match.
#[cfg(not(target_family = "wasm"))]
const RED_ZONE: usize = 256 * 1024;

#[cfg(not(target_family = "wasm"))]
const NEW_SEGMENT: usize = 4 * 1024 * 1024;

/// Runs `f`, first moving to a fresh heap-allocated stack segment when fewer
/// than `RED_ZONE` bytes of the current one remain.
#[cfg(not(target_family = "wasm"))]
#[inline(always)]
pub(crate) fn ensure_sufficient_stack<R>(f: impl FnOnce() -> R) -> R {
    stacker::maybe_grow(RED_ZONE, NEW_SEGMENT, f)
}

/// stacker cannot read the stack limit on wasm, so `maybe_grow` would switch to
/// a newly allocated segment on every outermost call; keep the plain call.
#[cfg(target_family = "wasm")]
#[inline(always)]
pub(crate) fn ensure_sufficient_stack<R>(f: impl FnOnce() -> R) -> R {
    f()
}
