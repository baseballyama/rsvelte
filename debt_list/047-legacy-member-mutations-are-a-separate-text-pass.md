# P2 — legacy member mutations are lowered by a separate text pass

Category: performance / design

Evidence: after direct state assignments are transformed, every eligible legacy statement is passed to `transform_member_mutations` as text and then passed onward to later read transforms (`client/mod.rs:5992-6018`). The stage accounts for 0.43–0.73% of total compile time in the corrected six-run minima, while single-run values varied by up to 8.31x and previously produced a false ranking (`docs/ast-refactor-handoff.md:1280-1294,1374-1390`).

Impact: member assignment semantics such as `obj.x = value` are detached from the visitor that owns the binding and assignment expression. This forces another parse/rebuild boundary and makes noisy timing results tempt maintainers into optimizing the wrong scanner.

One-PR remediation: port the official shared assignment visitor's member-mutation case to the same typed statement context used by client state lowering, without also changing direct state reads, declarations, stores or props. Preserve the existing ordering contract by invoking the new case immediately after direct assignment handling inside that visitor.

Acceptance: `transform_member_mutations` is not called from `process_accumulated` and the text helper is deleted if no other production caller remains; `PA_MEMBER_MUTATIONS` records zero calls; member assignment/update fixtures cover computed members, nested expressions and shadowing; strict CSR/dev output and source-map gates remain unchanged.
