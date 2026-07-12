---
"@rsvelte/fmt": patch
---

fix(fmt): converge on parenthesized / sequence `{#each}` keys

An each-block key written as a sequence expression (`{#each xs as x, i ((x.id, i))}`)
or with redundant parens (`{#each xs as x ((x.id))}`) never reached a fixed
point: the formatter re-parenthesized the inner expression but left the source's
own parens in place, so every pass added another paren layer (and a stray space
after the delimiter). `rsvelte-fmt --check` therefore failed forever on these
files even right after `rsvelte-fmt` wrote them.

The Svelte AST records only the inner key expression span; the delimiter parens
— and any extra parens the source wrote around the key — live outside it, so the
previous edit (which replaced just the AST span) could not consume them. The key
handling now scans outward to the outermost delimiter paren pair, formats the key
as written between those parens, and re-emits it wrapped in a single delimiter
pair. This matches prettier-plugin-svelte (`((a, b))` for a sequence key,
`(x.id)` for `((x.id))`) and is idempotent.
