---
"@rsvelte/compiler": patch
---

Report `svelte_meta_invalid_placement` / `svelte_meta_duplicate` at a zero-width span on the tag start, the way upstream's parser does, and reject a `<svelte:options>` nested inside an element or a block. `<svelte:options>` never reaches the analyzer — the parser consumes it into parser state — so the placement rule had to move there, as the duplicate rule already had.
