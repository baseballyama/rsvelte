---
'@rsvelte/compiler': patch
---

feat(compiler): track Svelte 5.57.0

Ports the 40 upstream compiler commits between `5.56.10` and `5.57.0`. The ones
that changed output rather than only internals:

- `f2648b3` — a restored reaction context ends at its synchronous segment, so an
  `await` that is not the last evaluated expression is pickled and every later
  `await` in that expression pickles too. rsvelte carries the rule in three
  places (the typed script walk, the template collector and the instance-script
  text scanner) and all three needed the sticky flag; a member expression is
  never last, in either half.
- The same commit's `async_thunk` never unthunks, so the client's `{#if}`,
  `{#each}`, `{#await}`, `{@html}` and `{#key}` thunks and all four
  `$.async_derived` emission sites keep their arrow.
- `9d0062d` — a template store subscription inherits its store's blocker, and the
  server defers the unsubscribe into `$renderer.on_destroy` when it has one.
- `63b4c36` — no scoping class on an element inside `<svelte:head>`.
- `b20b2ee` — an exported snippet keeps the component's CSS from being
  tree-shaken.
- `05b6916` — `bind:focused` is omitted from SSR output.
- `8299cbf` / `34489c1` — `$.comment()` for a lone-anchor template and
  `$.only_child` for a single-child element.

All ten fixture suites are at 100%: runtime-runes 1046/1046, runtime-legacy
1207/1207, hydration 81/81, SSR 104/104, validator 333/333, CSS 146/146,
compiler-errors 145/145, snapshot 30/30, print 50/50, sourcemaps 29/29.
