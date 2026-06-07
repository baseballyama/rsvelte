---
"@rsvelte/fmt": patch
---

Keep `{:else if}` branches at the same indent as the opening `{#if}`, matching `oxfmt` / prettier-plugin-svelte.

svelte desugars `{:else if}` into an `elseif` `IfBlock` nested inside the alternate fragment. Both the whitespace re-indent pass (`indent.rs`) and the open-tag pass (`markup.rs`) recursed into that nested block, adding one extra indent level per chained branch — so `{:else if}` / `{:else}` bodies (and their wrapped attributes) drifted one level deeper than `oxfmt` on every chain. They now follow the chain at the opening `{#if}`'s depth. A plain `{:else}` whose body merely starts with an `{#if}` is unaffected (it still nests one level deeper).

On a 1,115-file Svelte corpus this brings oxfmt-divergent files from 264 to 208.
