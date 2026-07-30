---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

svelte2tsx: stop emitting a store auto-subscription for `$props.id()` when the
component also declares a binding named `props` from `$props()`.

`const props: Props = $props()` next to `const id = $props.id()` made the
text-level `$name` scan see a `$props` token beside a declared `props`, so it
injected `;let $props = __sveltets_2_store_get(props);` right after the
declaration — after the `$props()` call that opens the same line, which
TypeScript then reports as `TS2448: Block-scoped variable '$props' used before
its declaration`.

Upstream's `processInstanceScriptContent` tags each `$props.id()` occurrence
`isPropsId` and drops all of them once it has seen a `props` binding
initialized by literally `$props()`; that pair of conditions is now mirrored, so
`$props.id` without a call, `$props.id(arg)`, a non-rune `let props = {}`, and
`$state.snapshot(state)` all keep upstream's behaviour. Fixes upstream's own
`props-variable-and-$props.id{,-destructured,-spread}.v5` samples and removes 30
false-positive `TS2448` diagnostics from the svelte-check e2e parity corpus.

Fixes #1917.
