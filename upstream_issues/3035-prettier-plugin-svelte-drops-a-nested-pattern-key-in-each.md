# prettier-plugin-svelte drops a nested object pattern's key in an `{#each}` head

Formatting an `{#each}` whose item pattern nests an object pattern under a property key
deletes the key, producing text that is not JavaScript. The Svelte compiler rejects the
formatter's own output.

Oracle: `oxfmt@0.64.0` with `{"svelte": true, "printWidth": 80, "tabWidth": 2,
"useTabs": false}` — the `svelte: true` path is `prettier-plugin-svelte` for the Svelte
structure. Reproduced on `compatibility/pattern-corpus/issues/3035-destructure-defaults.svelte`
and `compatibility/pattern-corpus/adversarial/control-flow/each-destructure-exotic.svelte`.

Input:

```svelte
{#each objs as { id, meta: { tags: [firstTag = 'none'] } = {} } (id)}
	<p>{id}:{firstTag}</p>
{/each}
```

Output:

```svelte
{#each objs as { id, { tags: [firstTag = 'none'] } = { } } (id)}
  <p>{id}:{firstTag}</p>
{/each}
```

`meta:` is gone, so the second element of the object pattern is a bare `{ … }` — not a valid
property. (`{}` also becomes `{ }`, which is cosmetic and not the defect.)

Feeding that back to the official compiler:

```
svelte 5.56.10, parse(modern: true)
  3035-destructure-defaults.svelte    REJECTED js_parse_error at 15:21 — Unexpected token
  each-destructure-exotic.svelte      REJECTED js_parse_error at 13:21 — Unexpected token
```

The same nesting inside `<script>` is formatted correctly — `let { sizes: [small = 1,
...bigger] = [] } = $derived(config);` survives byte-for-byte in the first file — so the
defect is in the `{#each}` head's pattern printer, not in the shared JS pattern printer.

Both files are permanently excluded from the formatter-parity corpus in
`compatibility/fmt-oracle-excluded.json` (`class: "oracle-bug"`): the gate requires
byte-identical output against this oracle, and matching it here would mean reproducing the
bug. rsvelte-fmt keeps the key.

Desired upstream behaviour: print the property key for a nested pattern in an `{#each}`
item, as the script-level printer already does.
