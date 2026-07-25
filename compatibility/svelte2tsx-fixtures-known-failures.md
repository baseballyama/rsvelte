# svelte2tsx-fixtures-known-failures.json — why entries are accepted

The svelte2tsx **fixture** gate (`crates/rsvelte_core/tests/svelte2tsx_fixtures.rs`,
logic in `crates/rsvelte_core/tests/common/svelte2tsx.rs`) runs every sample under
`submodules/language-tools/packages/svelte2tsx/test/svelte2tsx/samples` and compares
rsvelte's TSX against the checked-in `expectedv2.ts`. The ratchet may only shrink.

This is a different gate from `svelte2tsx-known-failures.json`, which compares
rsvelte against **official `svelte2tsx` run live** over the real-world corpus
(`scripts/compat-corpus/svelte2tsx-verify.mjs`). This one is the upstream
exact-fixture suite; that one is the real-world volume check.

Until this ratchet existed the runner only *printed* its pass rate and always
reported `ok`, so none of the entries below were gating anything. Recording them
is what makes the suite a gate; every entry is a **pre-existing** divergence, not
a newly accepted one.

Adding an entry requires a written justification here. Removing one requires
nothing but a green run:

```bash
UPDATE_S2TSX_FIXTURES_BASELINE=1 cargo test --test svelte2tsx_fixtures
```

`STRICT_S2TSX_FIXTURES=1` ignores the baseline entirely (every failure fails),
which is how you check whether an entry is still needed.

## Current baseline: 8 of 254 (pass rate 96.9%)

### Harness gap — 1

- **`attributes-foreign-ns`.** Upstream derives `namespace: 'foreign'` from the
  sample-name suffix (`test/helpers.ts`: ``sampleName.endsWith('-foreign-ns') ?
  'foreign' : null``); our `build_options` hardcodes `Svelte2TsxNamespace::Html`.
  Under the HTML namespace rsvelte lowercases attribute names, so it emits
  `svelteHTML.createElement("element", { "someattr": …, "someotherattribute": … })`
  where the fixture expects `"someAttr"` / `"someOtherAttribute"` preserved.
  Component props (`<Component someAttr="5" />`) already keep their case in both.
  This is the cheapest entry to remove — it needs a runner change, not a compiler
  change — but it is out of scope for the PR that introduced this ratchet.

### `$props.id()` mis-resolved as a store — 3

- **`props-variable-and-$props.id.v5`**
- **`props-variable-and-$props.id-destructured.v5`**
- **`props-variable-and-$props.id-spread.v5`**

  All three declare a binding literally named `props` and then call `$props.id()`
  (the Svelte 5 component-id rune). rsvelte's text-level `$name` scan
  (`collect_store_references` / `collect_loose_dollar_names_from_script` in
  `crates/rsvelte_core/src/svelte2tsx/script/mod.rs`) sees the `$props`
  token, finds a declared binding `props`, and injects a store subscription:

  ```
  let props = $props()/*Ωignore_startΩ*/;let $props = __sveltets_2_store_get(props);/*Ωignore_endΩ*/;
  ```

  Upstream emits no subscription. `$props.id` is a rune namespace, never a store
  auto-subscription, so the member-access form must be excluded from the scan even
  when a same-named binding exists. Fixing this is a single rule in the loose-dollar
  scanner; the three fixtures are the same bug at three destructuring shapes.

### Statement ordering around `function $$render()` — 2

- **`module-snippet-component-instance-reference.v5`.** A snippet declared in
  `<script module>` that references a component instance. rsvelte emits the
  `const iconSnippet = …` declaration **before** `function $$render() {`; upstream
  emits it inside, as the first statement of the render body.

- **`ts-runes-hoistable-props-false-6.v5`.** `type $$ComponentProps = { someProp:
  typeof $store }` is hoisted above `function $$render()` by rsvelte even though
  `$store` is a store subscription that only exists **inside** the render body
  (`let $store = __sveltets_2_store_get(store)`). Upstream keeps the type inside.
  A `typeof $<name>` reference to a store subscription must block hoisting —
  `collect_type_body_deps` (same file) records `typeof IDENT` as a value
  dependency, but the injected `$store` binding is not in `instance_value_names`,
  so nothing blocks the hoist.

### Type assertion rewritten in the instance script — 1

- **`ts-type-assertion`.** For `<script context="module">` both sides rewrite
  `<string>''` to `'' as string`. For the instance script the fixture keeps the
  angle-bracket form (`let a = <HTMLInputElement>document.querySelector('#id');`)
  while rsvelte rewrites it to `as`. rsvelte's output is the form that actually
  parses as TSX, so matching the fixture means *not* rewriting where the rewrite is
  needed; this one should be confirmed against current upstream behaviour before
  being "fixed" in rsvelte's favour.

### Whitespace — 1

- **`ts-await-generics.v5`.** One space after `type $$ComponentProps = { prop?: T };`
  — the fixture has two, rsvelte emits one. Cosmetic in effect, but the gate is
  byte-exact so it is tracked like any other divergence.
