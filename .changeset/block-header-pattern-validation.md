---
'@rsvelte/compiler': patch
---

Validate `{#each}` and `{#await}` block headers the way the official parser does: the each item and the await value are one binding pattern and the each index is one identifier, so a literal, a rest element, a default or a member expression is now `expected_pattern` / `expected_identifier` / `expected_token` instead of being spliced into the generated arrow's parameter list (`($$anchor, 1) =>`, which no JS parser accepts) or silently dropped. A second `{:then}` / `{:catch}` is `block_duplicate_clause`, an empty `{#await }` head and `{#key }` report acorn's `Unexpected token` at acorn's position, `{#each xs as}` is `expected_whitespace`, and `expected_token` and a misplaced block continuation now carry upstream's point span
