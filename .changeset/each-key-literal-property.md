---
"@rsvelte/compiler": patch
---

Keep a string-literal destructuring key in the key function a keyed `{#each}` emits. `{#each list as { 'a-b': z } (z)}` produced `({}) => z`, dropping the property because the pattern converter reads a key's `name` and a literal key has none — so the key function threw a `ReferenceError` on first render from output that parses. A literal key is now emitted with its source spelling, and a computed key still takes the branch that was already correct.
