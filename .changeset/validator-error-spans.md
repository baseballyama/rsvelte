---
"@rsvelte/compiler": patch
---

Report source positions on every validation error

Compile errors raised during analysis carried no `start`/`end`, so consumers that
position diagnostics — editors, `svelte-check`, the language server — got a
whole-file error where upstream points at a specific node. 141 validator fixtures
diverged from the official compiler on error position alone.

Each raising site now attaches the range through `AnalysisError::at(start, end)`,
taking the same node upstream passes to its `e.*` constructor — often a sibling
attribute or a child rather than the node the enclosing visitor is looking at
(`attribute_invalid_type` points at the `type` attribute, not the `bind:`
directive; `constant_assignment` at the assignment, not its target).
`svelte_element_missing_this` moves to the parser, where upstream raises it,
because Phase 2 can no longer tell a missing `this` from a valueless one once the
attribute has been folded into `tag`.
