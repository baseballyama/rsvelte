# `3131-svelte-element-directive-order.svelte`

**Issue:** [#3131](https://github.com/baseballyama/rsvelte/issues/3131)

`<svelte:element>` emitted `bind:`, `use:`, `transition:`, `animate:` and `{@attach}` grouped by kind where upstream visits them in one source-order pass. The file carries both orders of the same pair, because the reversed one already matched and a single order cannot tell a source-order emitter from a bucketed one
