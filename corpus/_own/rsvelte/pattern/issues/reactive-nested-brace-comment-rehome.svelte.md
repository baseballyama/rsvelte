# `reactive-nested-brace-comment-rehome.svelte`

**Issue:** corpus residue

A `$:` statement ends at its own block brace. Treating any `{` as the block made an object-literal argument or an arrow body run the statement's end past the following statements, and the comment-rehoming pass then re-inserted a leading comment in the middle of one of them.
