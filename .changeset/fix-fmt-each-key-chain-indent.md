---
"@rsvelte/fmt": patch
---

fix(fmt): reindent a wrapped `{#each}` key method chain to the block depth

The each-key path (`{#each items as x (KEY)}`) formats the key with
`format_inline_expression`, which keeps it on one line for everything except a
method chain OXC breaks with hard newlines (e.g.
`node.ancestors().map((n) => n.data[0]).join("_")`). That multi-line form kept
OXC's own 2-space base indent, so continuation lines landed at column 2 instead
of aligning under the deeply-nested `{#each` header. Mirror
`push_bare_expression`: when the formatted key spans multiple lines, reindent its
continuation lines by `depth * indent_width` (yielding `(depth + 1) * indent_width`
on top of OXC's 2), so a wrapped key aligns exactly like the oracle. Clears
layerchart Partition/filterable.svelte and Treemap/nested-filter.svelte.
