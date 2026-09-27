# prettier-plugin-svelte drops the interpolation of a quoted `<svelte:element this>`

Formatting a `<svelte:element>` whose `this` is a quoted value with more than one chunk keeps the
first chunk and deletes the rest of the source text.

Oracle: `oxfmt@0.67.0` with `{"svelte": true, "printWidth": 80, "tabWidth": 2, "useTabs": false}`
— the `svelte: true` path is `prettier-plugin-svelte` for the Svelte structure. Reproduced on
`svelte/packages/svelte/tests/migrate/samples/svelte-element/input.svelte`.

Input:

```svelte
<svelte:element this="h{n}" />
```

Output:

```svelte
<svelte:element this="h" />
```

Svelte 5 parses `this="h{n}"` as the literal `'h'` (with the `svelte_element_invalid_this`
warning; its parser notes the behaviour is kept for Svelte 4 compatibility and becomes an error in
Svelte 6), and the printer rebuilds the attribute from that parsed node, so `{n}` never reaches the
output. The compiled component does not change, but the source does: the likely authoring mistake
is erased rather than left for the warning to point at.

rsvelte-fmt leaves such an opener exactly as written (`crates/rsvelte_formatter/tests/svelte_element_this_chunks.rs`).
