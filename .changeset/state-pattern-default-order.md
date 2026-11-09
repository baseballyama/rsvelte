---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

Client: a destructured `$state` / `$state.raw` names every `$$array` before it visits a default or computed key, so a pattern nested inside a default takes the next name as upstream numbers it. An empty object pattern (`let {} = $state({})`) is lowered to its `tmp` instead of being left with the `$state` call.
