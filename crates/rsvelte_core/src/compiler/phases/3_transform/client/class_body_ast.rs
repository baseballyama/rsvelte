//! AST-based `ClassBody` transform — the unified replacement for the
//! text/span-based class-state machinery (`class_transforms.rs` + the
//! `private_*_ast.rs` / `state_*_ast.rs` satellites, which parse → walk → splice
//! TEXT edits rather than emitting AST).
//!
//! **Status: FOUNDATION / WORK-IN-PROGRESS.** This is the launching point for
//! the incremental AST `ClassBody` rewrite described in
//! `docs/phase3-server-ast-remaining-work.md` §6. The entry point is a no-op
//! passthrough today (returns `None` so the existing text machinery still runs);
//! it is filled in step-by-step, each step kept byte-identical via the gate
//! suites + corpus.
//!
//! ## Target algorithm (写经 client `ClassBody.js`)
//! For each `$state` / `$derived` class field in `analysis.classes`:
//! - **PUBLIC** `x = $state(v)` → backing private `#x = $.state(v)` **plus**
//!   `get x() { return $.get(this.#x); }` and
//!   `set x(value) { $.set(this.#x, value, should_proxy && true); }`. Reads/writes
//!   of `this.x` then flow through the accessors (no read/write rewrite needed).
//! - **PRIVATE** `#x = $state(v)` → backing only (`#x = $.state(v)`); `this.#x`
//!   reads become `$.get(this.#x)` and writes `$.set(this.#x, v, proxy)` via the
//!   member / assignment handling (no accessor is possible for a `#` name). A
//!   read in the constructor's direct body uses the `.v` source access; a read
//!   inside a nested function uses `$.get` (`state.in_constructor`).
//! - `should_proxy` is scope-aware: `$state && is_non_coercive_operator(op) &&
//!   should_proxy(value, scope)` (trace an identifier RHS to its binding initial).
//!
//! Server lowering (no `ClassBody.js` upstream): `$state(v)` → `v` (plain value),
//! `$derived(fn)` → `$.derived(fn)` read as the callable `this.#x()`.
//!
//! See §6 of the handoff doc for the incremental step order (public accessors →
//! private read/write → server component → server module → delete the text
//! satellites) and the per-step verification loop.

/// Entry point for the AST `ClassBody` transform of an instance-script / module
/// source. Returns `Some(transformed)` once implemented; `None` today so callers
/// fall back to the existing text machinery (no behaviour change).
///
/// WIP: see the module docs + handoff §6. Wiring this in (replacing the public
/// `$state` field accessor generation in `class_transforms.rs`) is step 1.
#[allow(dead_code)]
pub(super) fn transform_class_body_ast(_source: &str) -> Option<String> {
    // Step 1 (next): parse `_source`, walk each `ClassBody`, rebuild PUBLIC
    // `$state` fields as backing-private + get/set accessors using `b::*`
    // builders, print the rebuilt class with esrap, and splice it over the
    // original class span. Until then, signal "not handled" so the existing
    // text passes run unchanged.
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn passthrough_is_noop_until_implemented() {
        // The foundation is a no-op passthrough: callers must fall back to the
        // existing text machinery while the rewrite is built up incrementally.
        assert_eq!(transform_class_body_ast("class C { x = $state(0); }"), None);
    }
}
