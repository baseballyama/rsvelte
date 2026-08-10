# P2 — store-subscription analysis reimplements JavaScript scope rules with character heuristics

Category: correctness / performance / architecture

Evidence: `2_analyze/store_subscriptions.rs` is about 1,450 lines. Starting at `collect_dollar_refs_from_script_with_context` (`:484`), it walks `Vec<char>`, derives arrow-body ranges, detects parameter/default/destructuring/import/type-declaration contexts and performs its own identifier pass (`:562-1153`) before separately walking template AST nodes.

Impact: the compiler already has typed JavaScript nodes and scope information, yet store detection pays an additional Unicode-scalar copy and approximates shadowing and TypeScript grammar. New syntax requires patching a parallel parser and can silently classify `$name` differently from the real analyzer.

Remediation: detect store references during the canonical typed scope/reference traversal, attach the result to binding metadata, and let template traversal use the same binding identity rather than raw names.

Acceptance: the character scanner and context predicates are deleted; store-reference results come from one typed scope graph; adversarial defaults, nested arrows, computed keys, imports, TS types, comments, regexes and templates match official behavior.
