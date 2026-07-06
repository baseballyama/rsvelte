---
"@rsvelte/compiler": patch
---

fix(transform): each item shadows an outer same-named prop getter

A non-reactive `{#each}` item that is a simple identifier is bound as the render
arrow's parameter, so it fully shadows any outer binding of the same name. But
the client only *inserted* a transform for the item when it was reactive — a
non-reactive item left a stale outer transform in place. When the shadowed name
was a runes prop (transform `position → position()`), a body reference or
`{@const}` wrongly called the prop getter:

```svelte
{#each positions as position}
  {@const [y, x] = position.split('-')}   <!-- was position().split('-') -->
{/each}
```

Remove any outer transform for the item name in the non-reactive branch too,
mirroring upstream where the each-item binding shadows the outer scope.
