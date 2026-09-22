---
'@rsvelte/compiler': patch
---

Reproduce upstream's `read_pattern` column arithmetic for destructuring binding patterns

`{#each}`, `{#await … then/catch}` and `{@const}` parse their pattern by wrapping it
as `(pattern = 1)` and deleting one space from the prefix, which shifts `loc.*.column`
by one on the pattern's own line and on the template's first content line. rsvelte
reported the real column, so every destructured binding in those tags diverged from
`svelte.parse()`.
