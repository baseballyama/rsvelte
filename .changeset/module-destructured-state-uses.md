---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

Client `compileModule`: wrap reads and writes of a name bound by a destructured `$state` / `$state.raw` declaration in `$.get` / `$.set`, as upstream does. They used to be left bare while the declaration itself was lowered.
