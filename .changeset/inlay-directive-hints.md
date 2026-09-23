---
'@rsvelte/language-server': patch
---

`textDocument/inlayHint`: hints svelte2tsx generates for a `transition:` / `in:` / `out:` / `animate:` / `use:` directive's own call, and for a bare `on:` handler, are dropped — the post-mapping filter `checkGeneratedFunctionHintWithSource` is now ported
