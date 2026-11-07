---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

fix(compiler): a class with a `$state` field no longer rewrites a longer private field that starts with the same name (`++this.#historyGeneration` next to `history = $state(…)` came out as `$.update_pre(this.#history)Generation`, which does not parse), including names continued by `$` or a non-ASCII letter. The client class transform also leaves `++this.#x` / `this.#x--` and `this.#x` reads inside strings, comments and template text alone, keeps `++this.#x.v` an update of the member, and reads `a+++this.#x` as `a++ + this.#x`.
