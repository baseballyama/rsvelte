---
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(vps-native): `js.map` / `css.map` carry magic-string's `toString()` and `toUrl()`. `svelte/compiler` returns every map as a `SourceMap` instance, so tooling inlines one with `map.toUrl()` — `prebundleSvelteLibraries` crashed with `result.map.toUrl is not a function` because the NAPI boundary hands back a plain Source Map v3 object (#4695). The methods are non-enumerable, so a serialized map is unchanged.
