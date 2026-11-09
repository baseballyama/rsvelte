---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

Client: lower a nested destructured `$state` / `$state.raw` pattern (`let [x, [y]] = $state(…)`) as upstream does, where the whole declaration used to be left with its `$state` call in it. A default or computed key in such a pattern that reads state now gets `$.get`, and a reassigned `$state.raw` object rest keeps its `$.state` wrap.
