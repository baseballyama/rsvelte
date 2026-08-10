# P2 — the bespoke JavaScript arena relies on an unsafe aliasing contract

Category: safety / architecture / maintainability

Evidence: `js_ast/arena.rs` implements chunked stores with `UnsafeCell`, raw pointer indexing, manual `Drop`, an `unsafe impl Send`, and `unsafe take_expr(&self)` whose caller must prove no alias exists. The stated reason for interior mutability is allowing aesthetically nested builder calls without temporary variables. Client callers also reborrow the arena through raw pointers (`client/types.rs:1084-1088`).

Impact: memory safety depends on a cross-module discipline the borrow checker cannot verify, solely to support a transitional bespoke IR alongside OXC's own allocator. New transforms can retain a shared reference and then destructively replace its slot, making review—not types—the safety boundary.

Remediation: converge on OXC's arena/builders or redesign handles so mutation requires exclusive access and generations detect stale handles. During migration, encapsulate destructive operations and run Miri/property tests over allocation, move, take and drop sequences.

Acceptance: no transform performs raw-pointer arena reborrowing; safe code cannot mutate an aliased node; the custom unsafe arena is deleted or its entire unsafe surface is isolated, formally documented and exercised under Miri with zero caller-side unsafe.
