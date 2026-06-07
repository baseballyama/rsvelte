---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): a syntactically-invalid generated `.tsx` overlay no longer silently suppresses all real type errors — `--tsgo` now reports it loudly and exits non-zero instead of producing a false pass (#728)
