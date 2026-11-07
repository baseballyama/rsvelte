---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
"@rsvelte/language-server": patch
---

fix(svelte2tsx): follow svelte2tsx 0.7.62 (sveltejs/language-tools#3126) — a `$props<T>()` type argument no longer types the props. Only the declarator annotation (`let { … }: T = $props()`) does; the type argument stays in place so TypeScript reports it, and the props fall back to the inferred `$$ComponentProps`, as upstream now does.
