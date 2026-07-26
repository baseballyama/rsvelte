---
"@rsvelte/compiler": patch
---

fix: stop writing "ARENA MISMATCH" debug output to stderr from library code

Debug builds of `rsvelte_core` printed `ARENA CHILDREN MISMATCH` /
`ARENA MISMATCH` diagnostics to stderr from `get_js_node` and its callers
whenever the fallback `NULL_NODE` sentinel was returned. Library code should
never write to stderr unasked; the fallback behavior itself is unchanged.
