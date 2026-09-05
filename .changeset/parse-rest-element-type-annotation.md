---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

`parse()` now emits `RestElement.typeAnnotation` for an annotated rest parameter.

Only a function/arrow **parameter** rest carries the field — an object-pattern,
array-pattern or assignment-target rest never does, even when the enclosing pattern is
annotated, which is where the annotation actually lands. Three of the five builders that
construct a `RestElement` were missing it, including the `export function` path that the
corpus carrier actually exercises.

Adding a field to the binary parse envelope moves its `VERSION` to 11, so an older
`@rsvelte/vite-plugin-svelte-native` decoder rejects a newer `rsvelte.node` writer by
design rather than mis-reading it.
