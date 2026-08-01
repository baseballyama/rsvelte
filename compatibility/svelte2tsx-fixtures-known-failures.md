# svelte2tsx-fixtures-known-failures.json — why entries are accepted

The svelte2tsx **fixture** gate (`crates/rsvelte_projection/tests/svelte2tsx_fixtures.rs`,
logic in `crates/rsvelte_projection/tests/common/svelte2tsx.rs`) runs every sample under
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

### #2145 note

Until this PR, `relaxed_compare`'s `strip_return_statement` stage deleted the whole
`return {…}` statement outright (not just the differing trailing
`class __sveltets_Render<T> { … }` wrapper it exists to bridge), so nothing downstream
ever compared the returned `props`/`slots`/`events` reflection again. That's how a real
rsvelte/official divergence — `$$slot_def["b"]` vs official's `$$slot_def['b']` — passed
`component-slot-let-forward-named-slot` despite differing. `return_statement_matches`
(same file) now independently re-verifies just the return statement through the same
relaxations, on top of the existing chain. The entries below are pre-existing
divergences this newly surfaced — none are new regressions, and none are related to the
quoting bug itself (which is fixed in `collect/mod.rs`'s `push_let_reflection_scope`).

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

### `let:`-forwarding slot-let resolution gaps — 3

- **`component-slot-inside-await`**, **`component-slot-let-forward`**,
  **`component-slot-object-key`.** Three different `let:`/slot-forwarding
  destructuring shapes rsvelte resolves incompletely: a `let:whatever={{ bla }}`
  nested-destructure binding on a forwarded component slot; an `{#await …then
  value}` binding threaded into a nested named slot; and an `{#each}` binding used
  as both an object *key* and *value* inside a forwarded slot prop (rsvelte
  incorrectly substitutes the resolved expression into the key position too,
  e.g. `{item:...}` becomes `{__sveltets_2_unwrapArr(items):...}`). All three sit
  squarely in the `let:`-forwarding resolution logic (`push_let_reflection_scope`
  neighbourhood / `TemplateScope.resolveLet` equivalent) that issue #2105 owns —
  left untouched here per that PR's explicit scope boundary.
