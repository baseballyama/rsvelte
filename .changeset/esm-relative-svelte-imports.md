---
"@rsvelte/svelte-check": patch
---

Fix a **relative** `.svelte`-suffixed import never resolving under ESM-mode
module resolution. With `moduleResolution: node16`/`nodenext` inside a
`"type": "module"` package — the configuration every published Svelte component
library uses — TypeScript performs no implicit extension substitution, so the
only candidate it probes for `./x.svelte` is `./x.d.svelte.ts`. Neither the
overlay's `.svelte.tsx` shadow nor a real `x.svelte.ts` rune module was ever
reached, the specifier fell through to the ambient `declare module '*.svelte'`
wildcard, and every *named* import errored with
`Module '"*.svelte"' has no exported member 'X'` (a default import silently
degraded to `any`). Both shapes were affected: a plain `.ts` barrel
re-exporting a component's `<script module>` type
(`export type { ArrowProps } from './anatomy/arrow.svelte'`) and a `.svelte.ts`
rune module imported with the extension stripped
(`import { useProvider } from './modules/provider.svelte'`).

The overlay now emits the `.d.svelte.ts` file TypeScript actually looks for
next to every component shadow, and — for a `.svelte.ts` / `.svelte.js` rune
module with no sibling component — a bridge re-exporting the real module.
Resolution no longer depends on the specifier's shape (relative, `paths`-aliased
or bare) nor on whether the importing file is a `.svelte` shadow we can rewrite
or a plain `.ts` source we cannot, matching how official `svelte-check` forces
the pre-ESM algorithm for `.svelte` specifiers in its own `resolveModuleNames`
hook.

Fixes #1916.
