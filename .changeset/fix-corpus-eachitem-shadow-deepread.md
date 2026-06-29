---
"@rsvelte/compiler": patch
---

fix(compiler): don't `$.deep_read_state` an each-item that shadows a prop of the same name

A destructured each-item binding whose name matches an outer prop —

```svelte
<script>export let data;</script>
{#each dataByFruit as [fruit, data]}
  <Point d={data[data.length - 1]} />
{/each}
```

— was wrapped in `$.deep_read_state(data())` in legacy dependency lists, whereas
upstream emits a plain `data()`. The reference resolves (correctly, via the
each-item read transform) to the each-item local, but the deep-read decision used
`get_binding`, which walks the static scope tree and returns the shadowed
`export let data` prop (`bindable_prop`) → forced a deep read.

Two parts:
1. The destructured-each-item branch now clears each path name from
   `transform_deep_read` (the simple-identifier each-item branch already did this).
2. The legacy dependency builders deep-read a `bindable_prop` only when it is NOT
   shadowed by a local read transform (`!has_read_transform`) — mirroring the
   existing `import` arm. A genuine, unshadowed prop is still deep-read via its
   `transform_deep_read` marker, so only the wrongly-resolved shadowed case is
   suppressed.

Clears `layerchart/.../routes/docs/examples/Area/+page.svelte` and
`layerchart/.../components/Grid.svelte` (37 → 35), with zero regressions across
the full corpus.
