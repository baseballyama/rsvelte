---
"@rsvelte/compiler": patch
---

Pass the memoized `$0`/`$1` parameters and their deps array to the `$.template_effect` emitted inside an element block, so an element that contains a `{#snippet}` or a `{const}` no longer generates a zero-argument callback whose body references unbound identifiers.
