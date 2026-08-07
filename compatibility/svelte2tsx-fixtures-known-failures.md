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

## Current baseline: `svelte2tsx-fixtures-known-failures.json`, 4 entries — 4 of 254 (pass rate 98.4%)

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

### Removed by the `foreign` namespace fix

`attributes-foreign-ns` now passes. It needed both halves: the runner derives
the namespace from the `-foreign-ns` sample-name suffix like upstream
`test/helpers.ts`, and `Svelte2TsxNamespace::Foreign` now actually suppresses
the attribute-name case fold (previously `Svelte2TsxOptions::namespace` was
never read by the projection at all).

### Removed by #2161

`component-slot-inside-await`, `component-slot-let-forward` and
`component-slot-object-key` were the three slots-reflection resolver gaps; all
three now pass. `resolve_slot_expression` (`collect/pattern.rs`) folds the
shorthand expansion and the scope substitution into one object-aware scan so an
object *key* is never substituted, `push_context_binding` (`collect/mod.rs`)
resolves destructuring `let:`/`then`/`catch` contexts through
`((<pattern>) => name)(<resolved>)`, and the `{#await}` opener padding is derived
from official `transform`'s gap count instead of a constant.
