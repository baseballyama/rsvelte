# P2 — client script metadata is recomputed by six whole-script scans

Category: performance / architecture

Evidence: before statement lowering, `transform_instance_script_for_visitors` supplements analysis with six source scans: filtering identifiers by textual presence, finding local reactive declarations, indexing const-state declarations and reassigned variables, identifying proxy initializers, and probing for legacy `export let`. Calls to `record_st_collect_scan` at `client/mod.rs:3748,3861,4765,4854-4855,5063` account for these passes; the responsibility map is documented in `docs/ast-refactor-handoff.md:321-349`.

Impact: scope and declaration facts are recomputed from source after Phase 2 built a typed scope tree. Work grows with `script bytes × number of probes`, cloned name lists are maintained beside authoritative bindings, and hand-written scope approximations can disagree with OXC on nested or shadowed declarations.

One-PR remediation: expose the five semantic facts from Phase 2/retained OXC traversal and delete the corresponding Phase-3 scanners; remove the textual-presence filter rather than porting it because it only avoids later work and does not affect output. Keep the resulting metadata as borrowed IDs or compact indices instead of cloning names.

Acceptance: the six `record_st_collect_scan` call sites and their production scanner helpers are removed; the deterministic `collect_scan` byte counter stays zero on all corpus targets; nested declarations, shadowing, reassignment, proxy initializer and legacy-export fixtures remain correct; allocation and strict output-equality gates do not regress.
