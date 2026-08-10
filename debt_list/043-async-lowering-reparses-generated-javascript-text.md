# P2 — async lowering reparses generated JavaScript text as a second compiler

Category: correctness / performance / architecture

Evidence: `3_transform/shared/async_body.rs` is 3,152 lines. It accepts `&str`, splits top-level statements, skips strings and regexes, detects await depth, recognizes declarations/effects, extracts patterns and identifiers, builds dependency maps, and returns more generated strings (`:32-2885`). This duplicates grammar and dependency work already available from parse and analysis phases.

Impact: every async component pays another lexical/semantic pass and inherits a partial JavaScript parser whose behavior can drift on new syntax. Because the output is string IR, later stages must parse or scan it again and source provenance is lost.

Remediation: compute blocker/dependency metadata once in Phase 2 over typed nodes and lower async bodies directly to typed Phase-3 AST using that metadata. Delete statement splitting, identifier extraction and source-string classification.

Acceptance: async lowering consumes retained AST plus typed analysis facts, contains no JavaScript lexer/parser, emits no raw statement strings, and official async corpus parity plus source-map anchors remain green.
