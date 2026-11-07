---
"@rsvelte/svelte-check": patch
---

perf(svelte-check): emit an external package's shadows in parallel and canonicalize each `paths` alias target once instead of once per candidate file. Output is unchanged; on a 1,189-file app with a 258-component sibling library the overlay step drops from ~530 ms to ~330 ms.
