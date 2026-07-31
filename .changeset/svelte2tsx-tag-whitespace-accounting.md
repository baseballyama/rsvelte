---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): reproduce upstream's opening- and closing-tag whitespace
accounting. Upstream lowers a tag by moving every kept source range to the end
of the transformed range, collapsing each run of characters between two kept
ranges to a single space; those spaces are observable in the output. rsvelte
emitted a fixed single space instead, so `<div {...attributes}>` produced
`{ ...attributes,}` where upstream produces `{...attributes,}`. Also rewrite
`{:else}` character-by-character (`}else{`, no inserted spaces) and stop
treating `{:else}{#if …}` as an `{:else if}`.
