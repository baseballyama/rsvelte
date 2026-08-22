---
"@rsvelte/compiler": patch
---

A comment at the end of an instance script now lands in the server's first printed template expression whichever kind it is — an attribute value, an attribute spread, a `class:` / `style:` directive, an `{#if}` test, an `{#each}` collection, an `{#await}` expression, a `{@html}` argument, a `{@render}` callee, a `{@const}` initializer, a component prop or spread, a `<svelte:element>` `this`, a `<slot>` prop — instead of only a text `{expr}`. A comment trailing a block-bodied `$:` that has a surviving successor lands there too: the reordered body sends esrap's cursor backwards over the copy the successor printed, so it is pending again and the template expression flushes it, rather than the component body's end.
