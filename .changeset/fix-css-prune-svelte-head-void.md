---
"@rsvelte/compiler": patch
---

fix(css): keep sibling-combinator rules past `<svelte:head>` void elements

The unused-CSS analysis assigned sibling-data slots (`dom_idx`) with a walker
that did not descend into `svelte:*` wrapper nodes, while the analysis visitor
that builds the element table does. A void element inside `<svelte:head>`
(`<meta />` / `<link />`) therefore shifted every subsequent element's
sibling-data slot by one, so sibling-combinator selectors (`.a + .a`, `.a ~ .a`)
matched by `{#each}`-generated siblings were wrongly pruned as unused — and in
other structures (`{#if}`/`{:else}`), wrongly kept. Both walkers now descend
into the same wrapper set, matching the official compiler's prune decisions
(verified by a new 1222-component differential sweep against `svelte/compiler`).
