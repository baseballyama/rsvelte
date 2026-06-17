# svelte2tsx corpus — remaining divergences & upstream bugs

The svelte2tsx output-parity corpus (`compat/corpus/svelte2tsx-known-failures.json`)
compares rsvelte's `svelte2tsx` port against the **official** `svelte2tsx`
(`submodules/language-tools`) over every shipped component in the corpus
sources, requiring byte-identical TSX after oxfmt normalization.

This PR burned the baseline **124 → 16**. The fixes that landed:

| Fix | Burned |
|---|---|
| Hoist `$$ComponentProps` when `typeof` refs an import, not a local | 41 |
| Preserve trailing TS postfix (`as`/`satisfies`/`!`) in template values | 24 |
| Wrap empty-valued `data-*` attrs in `__sveltets_2_empty` (createElement path) | 17 |
| Gate interface / `$$ComponentProps` hoisting + emission on upstream rules | 12 |
| Support `$props<TypeArg>()` type-argument form | 3 |
| Place component-doc adjacent to the component declaration | 4 |
| Don't treat TS keywords as hoist-blocking value deps | 2 |
| Insert auto `$$ComponentProps` before leading comments, not into them | 2 |
| Keep instance-referencing top-level `{#snippet}` inside `$$render` | 3 |

The **19** entries that remain fall into the buckets below. Each is a tracked,
understood divergence — none is a silent gap.

## 1. Genuine upstream `svelte2tsx` bug (cannot be matched — would require rsvelte to regress)

### `svelte/tests/snapshot/samples/await-block-scope/index.svelte`
The official `svelte2tsx` **throws** on this input:

```
{ "message": "Cannot overwrite across a split point" }
```

Source:
```svelte
<script>
  let counter = $state({ count: 0 });
  const promise = $derived(Promise.resolve(counter))
  function increment() { counter.count += 1; }
</script>
<button onclick={increment}>clicks: {counter.count}</button>
{#await promise then counter}{/await}
{counter.count}
```

The `{#await promise then counter}` reuses the outer binding name `counter` in
the `then` clause. Upstream's MagicString-based rewrite tries to `overwrite()`
a range that straddles a previously-`move()`d split point and aborts with the
internal `Cannot overwrite across a split point` error — i.e. it crashes, it
does **not** intentionally reject the program.

**rsvelte compiles it cleanly to valid TSX.** This is an upstream bug, not a
compatibility gap: making rsvelte "match" would mean making rsvelte crash too,
which is strictly worse. The corpus records this as an `error-mismatch`
(official errors, rsvelte compiles); it stays in the baseline permanently.

→ Upstream issue to file against `sveltejs/language-tools`: MagicString
"Cannot overwrite across a split point" when an `{#await … then x}` clause
shadows an outer binding `x`.

## 2. rsvelte parser HTML edge cases (svelte parser rawtext / auto-closing)

These exercise pathological HTML where svelte's own parser applies
rawtext-element and auto-closing rules that rsvelte's parser does not yet
replicate. Matching them requires parser work, not svelte2tsx work, and the
inputs are degenerate by construction.

- `runtime-legacy/samples/escaped-attr/main.svelte` — `</noscript>` inside an
  attribute value closes the `<noscript>` rawtext element; the trailing
  `<script>…</script>` is reparsed as a real script. rsvelte keeps the literal
  attribute value.
- `runtime-legacy/samples/textarea-value-escape/main.svelte` — same shape with
  `</textarea>` inside a `value={`…`}` template literal.
- `runtime-xhtml/samples/autoclosed-tags/main.svelte` — `<li><li>`, `<p><p>`,
  `<dt><dd>`, table sectioning etc. auto-close per the HTML tree-construction
  rules; rsvelte emits them flat.
- `parser-legacy/samples/whitespace-after-script-tag/input.svelte`,
  `parser-legacy/samples/whitespace-after-style-tag/input.svelte` — malformed
  `</script   ` / `</style   ` (trailing whitespace, no `>`).

## 3. Snippet-rendered-as-`const` placement (residual)

The top-level `{#snippet}`-inside-`$$render` placement is now fixed for the
real-world cases. One migrate fixture still has a separate, unrelated
indentation diff in the rendered snippet `const`:

- `svelte/tests/migrate/samples/svelte-component/input.svelte` (indentation only)

## 4. Destructured array/nested `export const` props

`export const [x, , ...rest] = LIST` — official emits one prop entry per
destructured binding (incl. nested patterns); rsvelte under-enumerates.

- `runtime-legacy/samples/destructured-props-4/A.svelte`
- `runtime-legacy/samples/destructured-props-5/A.svelte`

## 5. Formatting / individual niche diffs

- `flowbite-svelte/.../utils/Toc.svelte`, `.../blocks/utils/Toc.svelte` — a
  block comment inside the instance script loses its inner-line indentation.
- `bits-ui/.../command/components/command.svelte` — a JSDoc comment whose body
  contains example **code** (`@example … if (i < items.length) {`) is reflowed
  differently.
- `melt-ui/docs/src/components/motion.svelte` — two adjacent statements
  (`el = $$_svelteelementN;` and an `ensureTransition` call) are emitted in the
  opposite order.
- `melt-ui/docs/src/previews/tabs.svelte` — block placement.
- `svelte/tests/runtime-runes/samples/async-slot/Child.svelte` — one extra
  space inside the `__sveltets_createSlot("default", { … })` props object.
- `svelte/tests/migrate/samples/remove-blocks-whitespace/input.svelte` —
  whitespace in a migrate-fixture input.

---

**CI status:** the corpus gate (`corpus-compat.yml`) ratchets this baseline —
it fails only on a *regression* (a file outside the baseline newly diverging),
so a non-empty baseline of tracked divergences still passes. The baseline may
only shrink.
