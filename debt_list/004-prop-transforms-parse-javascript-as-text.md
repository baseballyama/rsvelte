# P1 — prop transforms parse generated JavaScript with ad-hoc character scanners

Category: correctness / maintainability / performance

Evidence: `props_transforms.rs` locates `$.prop(...)` arguments and nested setters using manual quote/depth scanning (`:745-825`, `:3329-3373`). The latter explicitly says template interpolation is not handled deeply (`:3350-3356`). These scanners do not implement JavaScript grammar for regex literals, comments, template substitutions, or all escape/newline cases.

Impact: valid default values or setters can be split at the wrong delimiter, producing invalid or semantically changed output. Every scanner becomes a second parser that must track future ECMAScript syntax independently of OXC.

Remediation: transform retained OXC call/assignment nodes and use spans for edits. Keep source scanning only as an explicit, measured fallback.

Acceptance: grammar-combination tests covering regexes, nested template substitutions, comments, escaped backslashes, ASI, and Unicode identifiers match official output and execute correctly.
