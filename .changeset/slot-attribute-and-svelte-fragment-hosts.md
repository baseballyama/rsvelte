---
"@rsvelte/compiler": patch
---

fix: separate the `slot` attribute's host set from `<svelte:fragment>`'s

Upstream uses two different lists — the `slot` rule admits `<svelte:self>` (and
owns a `slot` at any depth under `<svelte:element>` or a custom element), while
`<svelte:fragment>` requires a `Component` / `<svelte:component>` parent.
rsvelte answered both from one flag, so a `slot` under `<svelte:self>` was
rejected and a `<svelte:fragment>` under `<svelte:element>` was accepted.

The same flag also leaked through every host that never cleared it —
`<svelte:boundary>`, `<slot>`, `{#snippet}`, `{#await}` and `<svelte:fragment>`
itself — so a `slot="…"` one level under a component was accepted there too.
