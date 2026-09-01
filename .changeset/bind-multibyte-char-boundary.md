---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

Stop aborting on a multi-byte character at a byte offset svelte2tsx slices a `str` with.

The opening-tag spacing model located a `bind:` directive's `=` with `source[..=expr_start]` — an *inclusive* slice of a byte offset, so the cut fell one byte past the expression's start, inside its first character, and panicked. Under `panic = "abort"` that took `svelte-check` down with SIGABRT while materializing the overlay. A sweep of the same shape found a second live site: `--mode dts` reads the seven bytes before an interface's first heritage entry as the `extends` keyword, which a comment between the two puts inside the comment's text.
