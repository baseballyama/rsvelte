---
"@rsvelte/fmt": patch
---

perf(fmt): batch all `<style>` blocks into a single `oxfmt` call (~23× faster on style-heavy trees)

Formatting a tree of `.svelte` files spawned `oxfmt` once per `<style>` block. Because the consumer's `oxfmt` is a Node launcher, every spawn paid a fresh Node cold start (~26ms measured), which dominated wall-clock — on a 200-file corpus, style delegation was 99.8% of the runtime (8.1s, vs 9ms for the pure-Svelte formatting).

`rsvelte-fmt` now formats every file in parallel with a *collecting* style callback that records each `<style>` body and returns a placeholder, runs **one** batched `oxfmt` invocation over all of them (the same "many paths, one process" path already used for non-`.svelte` files), and substitutes the results back. The `rsvelte_formatter` library is unchanged — this is entirely in the CLI.

Measured 23× faster (8.1s → 0.35s) on a 200-file `<style>`-heavy corpus, with byte-identical output. The single-file stdin path is unchanged.
