---
"@rsvelte/compiler": patch
---

`parse()` attaches comments to the statements they belong to. Every JS comment previously landed in `Program.trailingComments` and no statement carried any, so the association a formatter or codemod needs — which statement a comment precedes or follows — was lost. rsvelte already held a port of upstream's `add_comments` walk for `svelte-ignore` harvesting; this records the ESTree comment objects from that same walk and gives the `Program` only what it did not claim, matching upstream's own `ast.type === 'Program'` special case. The arena's comment side table is now keyed by the node's ESTree `type` as well as its span, because a span does not identify a node: an `ExpressionStatement` in semicolon-free source has exactly its expression's, so a leading comment was reaching both. Comment capture stays gated to the `parse()` path, so `compile()` output is unchanged.
