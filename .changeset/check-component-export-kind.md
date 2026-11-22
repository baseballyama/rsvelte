---
'@rsvelte/cli': patch
---

`rsvelte check` types a component outside runes mode, or one with `$$Events` or slots, as svelte2tsx's isomorphic component, so messages that print its type match svelte-check. A template `await` puts a component in runes mode, and an import can name a JavaScript component as a type.
