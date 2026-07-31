---
"@rsvelte/compiler": patch
---

fix(compiler): resolve a `{@render}` against a `{#snippet}` declared in the same `{#if}` branch or `{#key}` block, so it compiles to a direct call instead of the dynamic comment-anchor form (and the matching extra `<!---->` on the server)
