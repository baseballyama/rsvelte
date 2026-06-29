---
"@rsvelte/compiler": patch
---

fix(compiler): a snippet is non-hoistable when a nested function closes over instance state

A root-level `{#snippet}` was hoisted to module scope even when one of its nested
functions referenced component state, e.g.:

```svelte
{#snippet MobileLink({ href, content })}
  <a {href} onclick={() => { open = false; }}>{content}</a>
{/snippet}
```

`open` is component state, so upstream keeps `MobileLink` defined *inside* the
component; rsvelte hoisted it to module top-level. The hoistability walk
(`can_hoist_snippet`) treated every `ArrowFunctionExpression` /
`FunctionExpression` as unconditionally hoistable (`=> true`), so references
inside nested handlers were never inspected.

Now nested functions are walked: their own params and locally-declared names are
treated as local, and any remaining reference to an instance-level binding blocks
hoisting — mirroring upstream's `scope.references` walk through nested functions.
Both the typed and JSON expression checkers route through one shared helper.

Clears `shadcn-svelte/.../mobile-nav.svelte` and
`flowbite-svelte/.../datepicker/Datepicker.svelte` on both CSR and SSR, with zero
corpus regressions.
