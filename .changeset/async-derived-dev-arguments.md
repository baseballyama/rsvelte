---
"@rsvelte/compiler": patch
---

Pass the dev `label` and `location` arguments to `$.async_derived`, so `await_waterfall` can fire

`3-transform/client/visitors/VariableDeclaration.js` emits
`$.async_derived(thunk, dev && name, location)` for an async `$derived`. rsvelte emitted
`$.async_derived(thunk)` and nothing else, for every shape.

That is not a lost label. `internal/client/reactivity/deriveds.js` gates the
`await_waterfall` warning on `location !== undefined`, so on rsvelte-compiled output the
warning **could never fire** — and `<!-- svelte-ignore await_waterfall -->` therefore
suppressed something that never ran, which reads as working. The client instance script now
carries both arguments:

```js
// const a = $derived(await p);  — dev: true, experimental.async
before: $.async_derived(async () => (await $.track_reactivity_loss(p))())
after : $.async_derived(async () => (await $.track_reactivity_loss(p))(), 'a', 'src/Foo.svelte:3:11')
```

Matching upstream, the *omission* is load-bearing too: `svelte-ignore await_waterfall` on the
declaration keeps the label and drops only the location, a `svelte-ignore` for any other code
changes nothing, and a production build carries neither argument. Destructured declarations get
upstream's `[$derived object]` / `[$derived iterable]` label with the location of the
`$derived(` call, and each declarator of a multi-declarator statement gets its own.

The location is measured against the original component source rather than the
post-rune-transform script the client pipeline walks, so it points at the user's `$derived`,
not at a rewritten offset. Column numbers count UTF-16 code units, as
`locate-character` does upstream.

Also fixed in the same path: a destructured async `$derived` wrapped its value in `$.save(…)`
in dev, which upstream only does for `{@const}`. `<script module>` and `.svelte.js` modules
still lower dev async deriveds incorrectly at a level above these arguments; that is tracked by
the new `async-derived` shape-matrix family rather than fixed here.
