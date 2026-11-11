# `spread-element-comment-flush.svelte`

**Issue:** mutation ratchet

A comment leading a spread element was written after the `...` instead of before it, so it landed between the `...` and its operand. Upstream reaches the element through `visit`, whose leading flush happens at the element's own start; both rsvelte sites wrote `...` first and only flushed when printing the operand. The same missing-leading-flush shape as `member-property-comment-flush.svelte`, one node over — but this one diverges on the server as well, because array elements and call arguments share the one printer. Output parses on both sides, so only output equality reports it.
