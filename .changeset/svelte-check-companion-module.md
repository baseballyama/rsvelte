---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): resolve `Foo.svelte.ts` / `Foo.svelte.js` companion-module named imports. A component and its sibling companion module collide on the same TypeScript basename — `import X from './Foo.svelte'` and `import { y } from './Foo.svelte.js'` both resolve to the single `Foo.svelte.{ts,tsx,d.ts}` family — so the companion's named exports were invisible and TypeScript reported a spurious `TS2614: has no exported member 'y'`. The overlay now folds the companion's named exports into the component shadow (`export * from "<companion>.js"`), so the one resolvable module exposes both the component default export and the companion's named exports.
