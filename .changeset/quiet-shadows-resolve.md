---
"@rsvelte/svelte-check": patch
---

Fix a bare package specifier deep-importing a `.svelte` file from a
`node_modules`-symlinked sibling (`import X from 'libs/components/x.svelte'`)
resolving to the ambient `declare module '*.svelte'` fallback, so the
component's `<script module>` named exports were reported missing.

`rootDirs` only bridges relative specifiers, so a bare one has to be rewritten
to point at the sibling's shadow directly. The rewrite resolved the specifier
from the importing file's directory, which `--workspace .` — the documented CLI
usage, and what the overlay walks with — leaves relative; a relative resolution
base has no parent to climb, so the resolver's `node_modules` walk-up never
reached the sibling's symlink and nothing was rewritten. A `paths`-aliased
specifier was unaffected because it resolves through the tsconfig's own
absolute base.

Fixes #1900.
