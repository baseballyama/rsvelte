---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

Compile a destructured `$state` / `$state.raw` / `$derived` / `$derived.by` in a `{let}` / `{const}` template tag as upstream does.
- **Server:** the declaration was emitted unchanged, with the `$state` call still in it.
- **Client:** every tag reused `tmp` / `$$array`, so the output declared a name twice and did not parse. The names now continue the component's numbering.
- **Both targets:** a template read of a destructured name was replaced by an empty string.
- **Server:** a name a tag declares no longer folds to the value of an outer constant it shadows.
- **Client:** a component without a `<script>` lays the expanded declaration out as upstream does, and a destructuring default that reads state is no longer wrapped in a thunk.
