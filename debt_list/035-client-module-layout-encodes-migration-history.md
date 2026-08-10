# P2 — client transform module layout encodes migration history instead of semantic ownership

Category: architecture / folder structure / maintainability

Evidence: `3_transform/client/mod.rs` declares 56 direct child modules, 40 named `*_ast`; the directory contains 58 top-level Rust files. Names such as `state_pipeline_ast`, `state_assigns_combined_ast`, `private_member_mutate_root_ast` and their non-`_ast` neighbors describe the order of incremental ports rather than the official compiler's visitor domains. The root then orchestrates the pieces from a 7,000-line file.

Impact: related behavior is scattered, dependency direction is invisible, and completion of the AST migration cannot simplify the tree because the temporary suffix has become the permanent taxonomy. Reviewers must know historical PR boundaries to find one semantic feature.

Remediation: preserve the valuable top-level `1_parse/2_analyze/3_transform` upstream mirror, but reorganize client internals around upstream visitor/semantic domains and a small set of documented rsvelte-only infrastructure layers. Delete migration suffixes once both paths converge.

Acceptance: every client module maps to an upstream semantic unit or a documented internal layer; the root is orchestration only; no `*_ast` migration taxonomy or parallel old/new module pair remains; architecture tests reject forbidden dependency directions.
