# oxfmt cannot print several default-value node kinds inside an `{#each}` pattern

`oxfmt` 0.63.0 with `svelte: true` — the corpus fmt oracle — aborts on a
destructuring default inside an `{#each}` head:

```svelte
<script>
	let rows = $state([{ id: 1 }]);
</script>

{#each rows as { id, label = `d${id}` } (id)}<b>{id}{label}</b>{/each}
```

```
Error: unknown node type: TemplateLiteral
```

It dumps the offending ESTree node and exits non-zero, so the file has no
formatted fixed point and cannot be committed to
`compatibility/pattern-corpus/`.

## Which defaults it can print

| default | oxfmt |
|---|---|
| `` `d${id}` `` | **unknown node type: TemplateLiteral** |
| `id + 1` | **unknown node type: BinaryExpression** |
| `f()` | **unknown node type: CallExpression** |
| `"d"`, `1`, `true`, `null` | ok |
| `[1]` | ok |
| `{ a: 1 }` | ok |

So the printer has arms for literals, arrays and objects and falls through for
everything else — it is a missing-case list, not a parse failure.

## It is the `{#each}` pattern specifically

The identical default in a `{#snippet}` parameter prints fine:

```svelte
{#snippet s({ label = `x${1}` })}<b>{label}</b>{/snippet}
```

Both the official Svelte compiler and rsvelte compile every row above, and their
outputs are byte-identical on `client` and `server`, so this is a formatter gap
alone.

## The same printer silently drops a property key

Worse than the abort above, and in the same `{#each}` pattern printer: when a
property has **both** a non-shorthand target and a default, the key disappears
from the formatted output.

| input | oxfmt output |
|---|---|
| `{#each rows as { id, nested: { deep } = {} } (id)}` | `{#each rows as { id, { deep } = { } } (id)}` |
| `{#each rows as { id, nested: [head] = [] } (id)}` | `{#each rows as { id, [head] = [] } (id)}` |
| `{#each rows as { id, nested: renamed = 0 } (id)}` | `{#each rows as { id, renamed = 0 } (id)}` |

The first two produce text the Svelte parser rejects; the **third compiles and
reads the wrong property** — `renamed` now destructures `row.renamed` instead of
`row.nested`. A formatter that changes what a program does is the more dangerous
half of this report.

Without the default the key survives (`nested: { deep }`, `nested: [head]`,
`nested: renamed` all round-trip), and the identical patterns in a `{#snippet}`
parameter round-trip too.
