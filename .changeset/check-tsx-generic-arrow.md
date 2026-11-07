---
"@rsvelte/svelte-check": patch
"@rsvelte/language-server": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/compiler": patch
---

fix(svelte-check, language-server): a TypeScript component's generic arrows and `<T>expr` assertions no longer type-check as JSX elements. Upstream svelte-check and the language server type-check each shadow as a `.ts` file; rsvelte writes `.svelte.tsx`, where `const f = <T>(x: T) => x` and `<number>raw` are lexed as JSX, so such a component reported a cascade of `JSX element 'T' has no corresponding closing tag` errors (and the syntax error then suppressed every type error program-wide). Both shadow writers, and the content mapper, now ask svelte2tsx to rewrite these forms — `<T,>(x: T) => x` and `(raw as number)` — wherever they reach the output: the instance and module scripts, markup expressions and a snippet's type parameters. svelte2tsx's own output is unchanged.
