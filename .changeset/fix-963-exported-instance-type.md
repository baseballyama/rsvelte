---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): keep `export type`/`export interface` declarations from the instance `<script>` visible to same-component references under `--tsgo`. In TypeScript these are `TypeAlias`/`Interface` nodes with an `export` modifier, so upstream svelte2tsx's `HoistableInterfaces` collects them like any other type; OXC instead wraps them in an `ExportNamedDeclaration`, so the candidate scan missed them. A dependent `interface Props { phase: Phase }` was then deemed dependency-free and hoisted above `function $$render()` while the exported `Phase` stayed inside it, breaking the reference (`Cannot find name 'Phase'`). Exported instance-script type/interface declarations are now registered as hoist candidates so they hoist with — and before — their dependents. Closes #963.
