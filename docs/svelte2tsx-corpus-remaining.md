# svelte2tsx corpus — remaining divergences & upstream bugs

The svelte2tsx output-parity corpus (`compat/corpus/svelte2tsx-known-failures.json`)
compares rsvelte's `svelte2tsx` port against the **official** `svelte2tsx`
(`submodules/language-tools`) over every shipped component in the corpus
sources, requiring byte-identical TSX after oxfmt normalization.

This PR burned the baseline **124 → 11**. The fixes that landed:

| Fix | Burned |
|---|---|
| Hoist `$$ComponentProps` when `typeof` refs an import, not a local | 41 |
| Preserve trailing TS postfix (`as`/`satisfies`/`!`) in template values | 24 |
| Wrap empty-valued `data-*` attrs in `__sveltets_2_empty` (createElement path) | 17 |
| Gate interface / `$$ComponentProps` hoisting + emission on upstream rules | 12 |
| Place component-doc adjacent to the component declaration | 4 |
| Support `$props<TypeArg>()` type-argument form | 3 |
| Keep instance-referencing top-level `{#snippet}` inside `$$render` | 3 |
| Don't treat TS keywords as hoist-blocking value deps | 2 |
| Insert auto `$$ComponentProps` before leading comments, not into them | 2 |
| Nested destructure `rest`, slot-props space, block-comment indentation | 5 |

The **11** entries that remain are tracked, understood divergences — none is a
silent gap. They fall into three buckets, each irreducible for a different
reason.

## 1. Genuine upstream `svelte2tsx` bug — *cannot* be matched without regressing rsvelte (1)

### `svelte/tests/snapshot/samples/await-block-scope/index.svelte`
The official `svelte2tsx` **throws** on this input:

```
{ "message": "Cannot overwrite across a split point" }
```

```svelte
{#await promise then counter}{/await}
```

The `{#await promise then counter}` reuses the outer binding name `counter` in
the `then` clause. Upstream's MagicString rewrite tries to `overwrite()` a range
that straddles a previously-`move()`d split point and aborts with the internal
`Cannot overwrite across a split point` error — i.e. it crashes; it does **not**
intentionally reject the program.

**rsvelte compiles it cleanly to valid TSX.** Making rsvelte "match" would mean
making rsvelte crash too — strictly worse. The corpus records this as an
`error-mismatch`; it stays in the baseline permanently.

→ Upstream issue to file against `sveltejs/language-tools`: MagicString
"Cannot overwrite across a split point" when an `{#await … then x}` clause
shadows an outer binding `x`.

## 2. Shared-parser HTML edge cases — deferred to protect the compiler test suite (5)

These exercise pathological HTML where svelte's own parser applies
rawtext-element and HTML auto-closing rules. Replicating them is **parser** work,
not svelte2tsx work — and rsvelte's parser is shared with the main compiler, so
changing it for these degenerate inputs risks the 3,000+ compiler-test suite for
no real-world benefit. Deferred deliberately.

- `runtime-legacy/samples/escaped-attr/main.svelte` — `</noscript>` inside an
  attribute value closes the `<noscript>` rawtext element; the trailing
  `<script>…</script>` is reparsed as a real script.
- `runtime-legacy/samples/textarea-value-escape/main.svelte` — same shape with
  `</textarea>` inside a `value={`…`}` template literal.
- `runtime-xhtml/samples/autoclosed-tags/main.svelte` — `<li><li>`, `<p><p>`,
  `<dt><dd>`, table sectioning etc. auto-close per the HTML tree-construction
  rules; rsvelte emits them flat.
- `parser-legacy/samples/whitespace-after-script-tag/input.svelte`,
  `parser-legacy/samples/whitespace-after-style-tag/input.svelte` — malformed
  `</script   ` / `</style   ` (trailing whitespace, no `>`).

## 3. Low-ROI individual diffs — tractable but deferred (5)

Each is a single component with a distinct, non-clustered root cause that would
need significant careful work (nested-snippet placement, statement ordering, or
fiddly whitespace) with real regression risk, for a one-file gain. Tracked for a
future targeted pass.

- `bits-ui/.../command/components/command.svelte` — a JSDoc comment whose body
  contains example **code** (`@example … if (i < items.length) {`) is reflowed
  differently.
- `melt-ui/docs/src/components/motion.svelte` — two adjacent statements
  (`el = $$_svelteelementN;` and an `ensureTransition` call) emitted in the
  opposite order.
- `melt-ui/docs/src/previews/tabs.svelte` — a snippet-`const` *nested* inside a
  block isn't placed inside `$$render` (the top-level case is fixed; the nested
  case remains).
- `svelte/tests/migrate/samples/svelte-component/input.svelte`,
  `svelte/tests/migrate/samples/remove-blocks-whitespace/input.svelte` —
  whitespace / indentation in migrate-fixture inputs.

---

**CI status:** the corpus gate (`corpus-compat.yml`) ratchets this baseline —
it fails only on a *regression* (a file outside the baseline newly diverging),
so a non-empty baseline of tracked divergences still passes. The baseline may
only shrink.
