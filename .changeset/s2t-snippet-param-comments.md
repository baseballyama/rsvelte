---
"@rsvelte/compiler": patch
---

svelte2tsx: emit a snippet's parameter list as one verbatim source range instead of re-printing each parameter and joining them, so comments inside the parentheses survive — `{#snippet row(/* p */ a /* q */, b)}` keeps both block comments, matching upstream's `[firstParameter.leadingComments[0].start, lastParameter.end]` range.
