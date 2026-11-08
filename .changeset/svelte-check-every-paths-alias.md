---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): a plain `.ts` file importing a component through any of several tsconfig `paths` aliases that reach it (`$lib/*` and `~/*` on one directory, or `$ui/*` nested inside `$lib/*`) now gets the component's types for each of them; only one alias per component received an exact `paths` entry, and the others reported `TS2307`. An alias is skipped where TypeScript would route its specifier through a longer pattern (`$lib/over/*` beside `$lib/*`), and a multi-target alias uses the first target that has the file.
