---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(compiler): `compileModule` returns a source map. `compile_module` hard-coded `map: None`, so every `.svelte.js` / `.svelte.ts` came back with `js.map === null` while upstream returns esrap's own `SourceMap` (#4702) — and a consumer that branches on it, such as `@rsvelte/vite-plugin-svelte`'s dependency optimizer (`result.map ? … : result.code`), silently skipped the module path. The map's header is upstream's (no `file`, `sources` from the filename's basename, `sourcesContent` filled, empty `names`); its mappings come from the same token scan the server component path is mapped by, so they resolve a generated statement to its own source line but anchor columns more coarsely than esrap's.
