# `member-property-comment-flush.svelte`

**Issue:** mutation ratchet

A comment between a member expression's object and its property was carried into the call's argument list instead of being flushed before the property. Upstream reaches the property through `context.visit`, which performs the leading comment flush; rsvelte's `static_member` wrote it with `write_node`, which emits source locations and never flushes, so the comment stayed pending until the next location check — the call's first argument. Official prints `conn.// } c` then `catch(...)`; rsvelte printed `conn.catch(` then the comment. Output parses on both sides, so only output equality reports it. Reduced by measurement from the ha-fusion `History.svelte` mutation entry, whose chain is written one `.method` per line.
