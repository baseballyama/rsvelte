---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
"@rsvelte/language-server": patch
---

fix(svelte2tsx): decide whether `$$render` is async the way upstream does. Any `await` outside a block or function now counts, including one under a TypeScript wrapper (`(await f()) as T`, `satisfies`, `!`, `<T>x`), in an optional chain, in a statement other than a declaration or expression (`if (c) await f();`, `for (x of await y)`, `switch`, `export const`), in a destructuring default, a computed key, a decorator or a class field. As in TypeScript, `await (x)` in a script without imports or exports stays a call to an identifier named `await`, and Svelte 4 output is never async. The `const $$$render = await $$render();` line now matches upstream byte for byte.
