---
"@rsvelte/compiler": patch
---

A `{#snippet}` declared inside a block now shadows a same-named outer binding for the whole fragment, matching upstream's scope rules. `{#each items as item}{#snippet row()}…{/snippet}{@render row()}{/each}` next to a `let { row } = $props()` emitted the prop read `$$props.row($$anchor)` on the client (a `TypeError` when the prop is not passed) and the derived read `row()($$renderer)` on the server; both now call the local snippet directly.
