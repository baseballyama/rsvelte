---
"@rsvelte/compiler": patch
---

Raise `svelte_meta_invalid_placement` and `svelte_meta_duplicate` in the parser, where the official compiler raises them. Both were analysis-time checks in rsvelte, so any error the node's own content could raise got there first: a `<svelte:window>` written inside `<title>` reported `title_invalid_content`, and a second `<svelte:head>` in the same position reported that too. The parser already carries the stack the rule needs — the check is `parent.type !== 'Root'` — and the `meta_tags` field the duplicate test wants had been ported without its logic.
