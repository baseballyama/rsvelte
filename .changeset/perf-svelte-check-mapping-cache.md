---
"@rsvelte/svelte-check": patch
---

perf(svelte-check): cache kit source bodies during diagnostic mapping

Kit diagnostics re-read and re-scanned the kit source file once per diagnostic.
The mapper now caches source bodies per run (mirroring the existing tsx cache),
and the two per-call regex compilations are hoisted into `LazyLock` statics.
