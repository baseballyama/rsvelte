---
"@rsvelte/fmt": patch
---

Reflow an overflowing single-line prose run beside a block sibling (e.g. long text inside a Component body with a block `<div slot>` child) instead of leaving it on one 100+ column line — prettier's fill always wraps a lone overflowing text node.
