---
'@rsvelte/compiler': patch
---

discard pending comments at a lowering's block brace, as upstream does

Upstream builds a template lowering's statement-position block with
`b.block([…])`, which carries no `loc`, so esrap's `body` discards every pending
comment there; a block the instance script wrote is acorn-parsed and keeps its
own position. rsvelte derived a comment-buffer span for both from the region the
block's children consumed, so a comment at the end of the instance script was
flushed at the brace of an `{#if}` wrapper and kept where official drops it.
`JsStatement::Block` now carries a `BlockOrigin`, set to `Lowered` only where
upstream would call `b.block`.
