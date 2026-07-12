---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): preserve non-ASCII tsconfig content, contain overlay emit paths, accept non-UTF-8 tsconfig paths

`strip_jsonc_comments` rebuilt retained bytes with `out.push(c as char)`, mangling
multi-byte UTF-8 in tsconfig values. It now accumulates raw bytes and converts once
at the end. Overlay emit-path joins are routed through a `safe_relative()` helper so
a source outside the workspace can no longer produce an absolute join target outside
the cache dir, and `run_tsgo` passes the tsconfig path as `OsStr` instead of
panicking on non-UTF-8 paths.
