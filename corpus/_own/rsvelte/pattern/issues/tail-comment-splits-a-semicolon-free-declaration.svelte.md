# `tail-comment-splits-a-semicolon-free-declaration.svelte`

**Issue:** mutation fuzz residue

The trailing-comment split consumes the newline that starts the run, so a semicolon-free declaration fuses with the `$:` effect appended after it; the caller restores the separator the split took.
