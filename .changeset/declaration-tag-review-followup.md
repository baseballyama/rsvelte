---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

Declaration tags with a destructured `$state` / `$derived`:
- **Client:** in a component without an instance script, a tag's temps (`tmp`, `$$array`, `$$d`) took their numbers from the previous compile on the same thread, so the output depended on compile order.
- **Client:** a component without a `<script>` now lays the expanded declaration out as upstream does.
- **Client:** a tag that mixes a destructured rune with other declarators is emitted as one declaration.
- **Client:** a destructuring default that reads state is no longer wrapped in a thunk.
- **Server:** a name a tag declares no longer folds to the value of an outer constant it shadows.
