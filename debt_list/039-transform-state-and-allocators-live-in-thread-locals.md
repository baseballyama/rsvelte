# P2 — transform state and allocators are hidden in thread-local globals

Category: architecture / performance / reentrancy

Evidence: `client/mod.rs:146-197` stores correctness-affecting counters and `VAR_STATE_VARS` in `thread_local!`, with snapshot/reset code that must keep paired counters synchronized. More than 25 production `*_ast.rs` modules define their own thread-local OXC `Allocator`, including state, prop, store, class and dev transforms.

Impact: a compilation's behavior and memory retention depend on thread history rather than explicit inputs. Nested/reentrant compilation and panic unwinding can observe stale state, tests can pass or fail by worker placement, and dozens of long-lived allocator heaps make memory budgets opaque.

Remediation: own names, counters and allocator lifetime in an explicit per-compilation/session context. Reuse memory only through a measured pool with reset semantics and a bounded retention policy; reserve TLS for diagnostics/profiling that cannot affect output.

Acceptance: changing worker threads cannot change output; reentrant and panic-recovery tests pass; no correctness-affecting transform TLS remains; allocator count, retained bytes and reset cost are observable and budgeted.
