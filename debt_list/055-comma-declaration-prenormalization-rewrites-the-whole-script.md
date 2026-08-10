# P2 — comma-declaration prenormalization rewrites the whole client script

Category: performance / architecture

Evidence: `transform_instance_script_for_visitors` calls the server text helper `split_comma_separated_declarations` over the complete client script both in the early fast path (`client/mod.rs:4617-4625`) and before statement processing (`client/mod.rs:4689-4706`). A single top-level declaration with multiple declarators therefore produces a new script and invalidates all retained statement spans.

Impact: declaration shape is already explicit in OXC, yet a server-side string rewriter is shared into the client pipeline. The whole-file rewrite prevents #031 from iterating authoritative statement spans and makes later visitors consume generated rather than source text.

One-PR remediation: split only affected top-level `VariableDeclaration` nodes in the typed client statement builder, preserving declarator order, declaration kind and comment attachment. Delete both client calls to the server text helper; keep the server caller and unrelated declaration lowering unchanged.

Acceptance: the client path never calls `split_comma_separated_declarations`; `PN_INV_SPLIT` and `PN_CHG_SPLIT` are zero; fixtures cover `let`/`const`/`var`, destructuring, comments, TypeScript annotations and class-lowering-produced declarations; unaffected statement spans remain valid; strict CSR/dev corpus and source-map output stay unchanged.
