---
"@rsvelte/svelte2tsx": patch
---

Fix two `--tsgo` / svelte-check overlay scoping bugs where an instance-`<script>`
type declaration was relocated out of the scope where the rest of the script
referenced it, producing spurious "Cannot find name" errors (official
svelte-check reports 0 errors):

- #963: an instance `export type` / `export interface` referenced by a hoisted
  `Props` interface is now registered as a hoist candidate (with its `export`
  keyword preserved) so it travels with the interface and stays in scope.
- #964: a local generic `type` alias no longer knocks the component's
  `generics=` parameters out of scope. Hoisting is now gated on the props
  interface itself being hoistable (mirroring upstream
  `HoistableInterfaces.moveHoistableInterfaces`); when it references a component
  generic, nothing is hoisted out of `function $$render<…>()`, keeping the
  generics in scope for local aliases.
