---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): resolve a rune module imported through a `paths` alias (`$lib/state.svelte` for a real `state.svelte.ts`). Its `.d.svelte.ts` ESM bridge was reachable only through `rootDirs`, which TypeScript applies to relative specifiers alone, so under `moduleResolution: nodenext` the specifier fell through to the ambient `declare module '*.svelte'` and every named import errored with TS2614. The bridge now also gets an exact `compilerOptions.paths` override, with a sibling `.svelte` component still winning the specifier.
