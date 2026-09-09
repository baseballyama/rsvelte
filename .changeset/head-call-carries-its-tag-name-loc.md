---
'@rsvelte/compiler': patch
---

anchor `$.head`'s callee on the tag name, as upstream does

Upstream stamps the call's callee with the tag name's own source position
(`b.id('$.head', node.name_loc)`), which is where esrap flushes a comment left
pending at the end of the instance script. rsvelte built the call unanchored, so
the comment was dropped where official keeps it. `<svelte:head>` now passes
`node.name_loc` through a `b::stmt_anchored`. The `{#snippet}` half of the same
symptom is a different mechanism and is tracked separately (#4489).
