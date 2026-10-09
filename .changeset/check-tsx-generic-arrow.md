---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): a generic arrow in a TypeScript component no longer type-checks as a JSX element. Upstream svelte-check writes each shadow as `++X.svelte.ts`; rsvelte writes `X.svelte.tsx`, where `const f = <T>(x: T) => x` is lexed as `<T>` JSX. Since the svelte2tsx output became byte-identical to upstream (`<T>` copied verbatim), such a component reported a cascade of `JSX element 'T' has no corresponding closing tag` errors. The overlay now asks svelte2tsx for `<T,>`, which is the same generic arrow in a `.tsx` file; svelte2tsx's own output is unchanged.
