# P2 — generated JavaScript is repaired by text post-passes

Category: correctness / performance / design

Evidence: `client/formatting.rs` is over 1,600 lines and reparses/normalizes generated snippets with a thread-local OXC allocator, then applies textual repairs such as reactive-comment relocation, async-placeholder stripping, empty-statement stripping and inspect-statement rejoining. Live client code invokes these passes during async output and instance-script handling (`client/mod.rs:1296-1326,4663`).

Impact: output correctness depends on the order of printer cleanup functions, each pass reallocates or rescans generated text, and comments/source locations must be reconstructed after structure has been discarded. Fixing one printer artifact can break another repair's assumptions.

Remediation: represent placeholders, comments and statement boundaries explicitly in the typed IR; configure one printer to emit final bytes; treat any required post-print mutation as a codegen defect with a regression test.

Acceptance: the production compiler performs no semantic or structural text mutation after JS printing; output is printed once from typed AST; comments and empty statements are covered by AST/source-map tests rather than repair-pass tests.
