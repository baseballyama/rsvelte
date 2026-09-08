# `reactive-rehome-dead-cursor.svelte`

**Issue:** corpus residue

A `$:`'s comments have no node left to attach to, so a surviving statement after it flushes them as its own leading trivia while a source-located block inside the effect prints them again, in place — `rehome_reactive_statement_comments` reproduces both by copying the run past the statement. The copy only lands while the cursor is ALIVE there, and the `$.invalidate_inner_signals` thunk in `bump` kills it, so upstream prints the comment once and rsvelte printed it twice. Both sides agree on PRESENCE either way, which is why the divergence needs an occurrence count rather than a set.
