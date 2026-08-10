# P2 — svelte-check overlay planning is coupled to filesystem mutation

Category: architecture / reliability / testability

Evidence: the 5,928-line `svelte_check/overlay.rs` combines overlay materialization (`:391`), external package discovery (`:837`), Kit generation (`:1236`), tsconfig construction and inheritance (`:1491-2297`), bridges and import probes (`:2788-3096`), source rewrites (`:3204-3607`), OXC export parsing (`:3360`) and orphan pruning. Pure resolution decisions and writes/deletes occur in one module and one workflow.

Impact: resolution rules cannot be tested without filesystem setup, failures can leave partial overlay state, and changes to TypeScript semantics can accidentally alter mutation order or cleanup. The module has no enforceable transaction boundary.

Remediation: split pure discovery/resolution into an immutable `OverlayPlan`, validate the complete plan, then commit it through a transactional filesystem adapter using staging plus atomic rename; isolate cleanup as a reconciler over declared outputs.

Acceptance: planning tests use no filesystem mutation; injected failures at every commit step leave the previous overlay intact; all writes/deletes are derived from a validated plan and path-confined before commit.
