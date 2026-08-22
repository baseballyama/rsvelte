---
"@rsvelte/fmt": patch
---

An element whose expression tag begins with a regex after JS formatting (`{(/^x/y).test(a)}` → `{/^x/y.test(a)}`) now wraps at the print width like prettier. The collapse re-parse read the `{/…}` as a block close and silently skipped every width pass on the file; the re-parse now reads a `{/…}` that is not shaped like a block close as the expression tag it is (compile-path parsing is unchanged and still rejects it like official).
