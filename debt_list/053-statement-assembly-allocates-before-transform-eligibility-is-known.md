# P2 — statement assembly allocates before transform eligibility is known

Category: performance / allocation efficiency

Evidence: `process_accumulated` begins by joining every borrowed line into a new `String` before any semantic gate runs (`client/mod.rs:5558-5564`). The runes fast path also joins the lines merely to search for `$`, exports, destructuring and console calls (`client/mod.rs:6472-6491`). The dedicated `PA_JOIN` counter exists because the byte length is unknown until after allocation; this is one of the allocation sites contributing to the approximately one-allocation-per-source-byte representation debt recorded in #032.

Impact: unchanged statements pay an allocation and copy just to prove that no transformation applies. Large multiline functions and comments amplify copied bytes even when the output is forwarded unchanged, and line-oriented storage prevents a cheap borrowed source range.

One-PR remediation: represent an accumulated statement as a contiguous byte range into `script_rest`; perform eligibility checks over borrowed slices/AST metadata; allocate only when a transform actually emits different text. Keep statement-boundary correctness (#031) and semantic transform migration (#033, #046–#052) out of this PR.

Acceptance: unchanged statements are appended directly from borrowed source ranges; `PA_JOIN` reports zero owned joins for the runes fast path and a deterministic copied-byte counter demonstrates the reduction; multiline newline preservation is byte-identical; strict CSR/dev corpus output and allocation-density checks do not regress.
