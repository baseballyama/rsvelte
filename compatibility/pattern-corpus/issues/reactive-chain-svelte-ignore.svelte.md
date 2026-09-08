# `reactive-chain-svelte-ignore.svelte`

**Issue:** mutation ratchet

`rehome_reactive_statement_comments` copies a legacy `$:`'s comments onto the statement that survives after it, because upstream replaces the label with a synthesized effect and the comment has no node left to attach to. It skipped every comment spelling `svelte-ignore`, so a later text pass could find one by scanning backwards from the node it annotates — but that reason covers only a comment LEADING the statement. One written INSIDE it annotates nothing there and was lost with the rebuilt label. The literal is the axis rather than the position: `svelte-ignor`, one character short, was already kept. The `$:` is load-bearing too — the same comment in a plain declaration's member chain always survived.
