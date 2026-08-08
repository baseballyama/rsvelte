# svelte2tsx-fixtures-known-failures.json — why entries are accepted

The svelte2tsx **fixture** gate (`crates/rsvelte_projection/tests/svelte2tsx_fixtures.rs`,
logic in `crates/rsvelte_projection/tests/common/svelte2tsx.rs`) runs every sample under
`submodules/language-tools/packages/svelte2tsx/test/svelte2tsx/samples` and compares
rsvelte's TSX against the checked-in `expectedv2.ts`. The ratchet may only shrink.

This is a different gate from `svelte2tsx-known-failures.json`, which compares
rsvelte against **official `svelte2tsx` run live** over the real-world corpus
(`scripts/compat-corpus/svelte2tsx-verify.mjs`). This one is the upstream
exact-fixture suite; that one is the real-world volume check.

Note on the comparison chain: `relaxed_compare`'s `strip_return_statement` stage
deletes the whole `return {…}` statement, not just the differing trailing
`class __sveltets_Render<T> { … }` wrapper it exists to bridge, so nothing
downstream would compare the returned `props`/`slots`/`events` reflection again —
that is how a real `$$slot_def["b"]` vs `$$slot_def['b']` divergence once passed.
`return_statement_matches` (same file) independently re-verifies just the return
statement through the same relaxations, on top of the existing chain.

The ratchet is **two-sided**: a fixture that fails without being listed fails the
suite, and so does a listed fixture that already passes. So a PR that fixes one of
the entries below does not get to leave the removal for later — it must delete the
entry from the `.json` and its justification here in the same change, or CI is red.
If you meet that failure on an unrelated PR it is not breakage: it means your change
fixed a listed fixture, and the fix is to re-baseline.

Adding an entry requires a written justification here. Re-baselining either
direction:

```bash
UPDATE_S2TSX_FIXTURES_BASELINE=1 cargo test --test svelte2tsx_fixtures
```

`STRICT_S2TSX_FIXTURES=1` ignores the baseline entirely (every failure fails),
which is how you check whether an entry is still needed.

## Current baseline: `svelte2tsx-fixtures-known-failures.json`, 0 entries — 0 of 254 (pass rate 100.0%)

The ratchet is empty — every upstream fixture matches byte-for-byte. Any new
entry needs a justification section here.

### Previously listed, now fixed

- **`attributes-foreign-ns`** — a harness gap: upstream derives
  `namespace: 'foreign'` from the sample-name suffix, our `build_options`
  hardcoded `Html`. The runner now mirrors it, and `Svelte2TsxNamespace::Foreign`
  threads `preserveAttributeCase` into `transform_attribute_case`.
- **`module-snippet-component-instance-reference.v5`** — a snippet's component
  tag names are references to their bindings, but a tag name is not an
  expression, so the lexical free-variable scan never saw `<Icon />`. Ported
  upstream's `collectSnippetComponentGlobals`.
- **`ts-runes-hoistable-props-false-6.v5`** — `typeof $store` resolves through
  the auto-subscription to `store`, which `isAllowedReference` disallows;
  `type_text_typeof_references_local_value` only compared the literal `$store`.
- **`ts-await-generics.v5`** — upstream relocates the props annotation itself, so
  the `$$ComponentProps` alias is a moved chunk that precedes the snippets moved
  to the same index; rsvelte inserts it as text, which always rendered last. Plus
  `legacy.js::remove_surrounding_whitespace_nodes` was applied only to
  `{#snippet}` / `<svelte:boundary>` bodies, not to the `{#each}` / `{#if}` /
  `{#key}` fragments it also trims.
- **`ts-type-assertion`** — upstream rewrites `<T>expr` → `expr as T` in the
  module script unconditionally but in the instance script only in `dts` mode
  (`mode !== 'ts'`), because the instance body ends up inside
  `function $$render()` where the angle-bracket form still parses.
