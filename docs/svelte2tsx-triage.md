# svelte2tsx — Wave 1 triage

Run with:

```bash
cargo test --release --no-default-features --test svelte2tsx_fixtures -- --nocapture
```

Latest: **207/245 (84.5%)** as of 2026-05-04.

## Progress log

| Date | Pass rate | PR | Cluster | Notes |
|---|---|---|---|---|
| 2026-05-03 | 200/245 (81.6%) | — | baseline | initial triage |
| 2026-05-04 | 204/245 | #31, #32, #33 | J + A (partial) | type assertion in module script; comment scanner; bulk snippet hoist |
| 2026-05-04 | 205/245 | #34 | G (snippet) | typeparams threading on `{#snippet}` |
| 2026-05-04 | 207/245 | #35 | B (partial) | force-inside-render `$$ComponentProps` lands at `node.parent.pos` instead of $$render top |

## Failure clusters

The 45 failures cluster as follows. Each row links to the lead reference file in
`submodules/language-tools/packages/svelte2tsx/src/...` so the Rust port can be
ported alongside.

### Cluster A: Snippet hoisting (8 fixtures)

Top-level `{#snippet name(params)}` blocks should be **hoisted** above the
`function $$render() {` body so TypeScript sees them as module-scoped values
that satisfy `import('svelte').Snippet`. Currently they're emitted inside
`$$render()` like a regular template node.

- `snippet-module-hoist-1.v5` ... `snippet-module-hoist-7.v5`
- `snippet-instance-script.v5`

Reference: `submodules/language-tools/packages/svelte2tsx/src/svelte2tsx/index.ts`
(search for `hoistable` and the const-snippet emission path).

Expected emission shape:

```tsx
const hoistable1/*Ωignore_positionΩ*/ = ()/*Ωignore_startΩ*/: ReturnType<import('svelte').Snippet>/*Ωignore_endΩ*/ => {
  async ()/*Ωignore_positionΩ*/ => { /* body */ };
  return __sveltets_2_any(0)
};
```

The "hoistable" detection needs:

1. Find every `{#snippet ...}` whose parent is the top-level fragment.
2. Verify its body only references identifiers that resolve to module-script
   bindings, parameters, or globals (no instance-script `let`).
3. If hoistable, emit BEFORE `function $$render()`.

### Cluster B: Runes hoistable props (10 fixtures)

`ts-runes-hoistable-props-1..6.v5` and `ts-runes-hoistable-props-false-4..15.v5`.

Probe runs the same hoist analysis but for `let { ... } = $props()` patterns.
The "false" suffix means the reference behaviour is to NOT hoist (e.g. when
the prop destructure references a TypeScript type alias declared inside the
script body).

Reference: `submodules/language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts`.

### Cluster C: Component export shape (multiple fixtures)

Several non-`.v5` fixtures expect the V4 export shape:

```tsx
export default class Input__SvelteComponent_ extends __sveltets_2_createSvelte2TsxComponent(...) {}
```

But rsvelte's V5 codegen emits the V5 shape:

```tsx
const Input__SvelteComponent_ = __sveltets_2_isomorphic_component(...);
/*Ωignore_startΩ*/type Input__SvelteComponent_ = InstanceType<typeof Input__SvelteComponent_>;
/*Ωignore_endΩ*/export default Input__SvelteComponent_;
```

The test runner currently always picks `SvelteVersion::V5`. Switching to V4
for non-`.v5` fixtures **regresses pass rate from 81.6% → 49.8%** because
rsvelte's V4 codegen path is incomplete.

Affected fixtures (all non-`.v5`): `$store-as-directive`, `binding-group-store`,
`custom-css-properties-with-$store`, `circle-drawer-example`, `creates-no-script-dts`,
`comments-in-attributes` (wait, this is `.v5`)…

**Action**: fix V4 codegen path in `src/svelte2tsx/svelte2tsx.rs` (search for
`SvelteVersion::V4`) and the helper structures that emit `bindings: ""` /
`exports: {}` / `slots: { 'default': {} }` for V4. Then flip the test runner
to pick V4 for non-`.v5` fixtures.

### Cluster D: `$store` template usage (5 fixtures)

`$store-as-directive`, `binding-assignment-$store`, `binding-group-store`,
`custom-css-properties-with-$store`, `reactive-$store-destructuring`.

Auto-store rewriting in template attribute positions (e.g. `style="--p:{$jo}"`
should NOT spread through `__sveltets_2_cssProp`). Diffs show rsvelte
introducing extra `__sveltets_2_ensureAction(...)` / `__sveltets_2_cssProp(...)`
wrappers that the JS reference doesn't add for store-prefixed identifiers.

Reference: `submodules/language-tools/packages/svelte2tsx/src/htmlxtojsx_v2/utils/node-utils.ts`
(`store_subscriptions` and similar helpers).

### Cluster E: SvelteKit `$types` autotype injection (4 fixtures)

`sveltekit-autotypes-$props-rune.v5`, `ts-sveltekit-autotypes-$props-rune.v5`,
`jsdoc-sveltekit-autotypes.v5`, `jsdoc-sveltekit-autotypes-runes.v5`.

The JS reference detects `+page.svelte` / `+layout.svelte` filenames and
inlines `import('./$types.js').PageData` types into the generated `$$ComponentProps`
typedef. rsvelte port emits `any` instead.

Reference: `submodules/language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts`
(search for `sveltekit_autotype` / `addTypeImport`).

### Cluster F: DTS emission (5 fixtures)

`creates-dts`, `creates-no-script-dts`, `transforms-interfaces-dts`,
`ts-$$generics-dts`, `ts-creates-dts`.

These fixtures use `mode: Dts` which switches `svelte2tsx` to emit a `.d.ts`
file (used by `npm pack` of Svelte component libraries). The Rust port's
DTS path is incomplete — see `src/svelte2tsx/svelte2tsx.rs::Svelte2TsxMode::Dts`
branch.

Reference: `submodules/language-tools/packages/svelte2tsx/src/emitDts.ts`.

### Cluster G: Generics (2 fixtures)

`ts-$$generics-interface-references`, `ts-await-generics.v5`.

Generic type parameters from `<script generics="T">` should thread into
`function $$render<T>() { ... }`. Currently the type parameter is dropped
or mis-emitted.

Reference: `submodules/language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/Generics.ts`.

### Cluster H: Slot let-forwarding (2 fixtures)

`component-slot-nest-scope`, `uses-svelte-components-let-forward`.

Cosmetic / scope tracking issue: the spacing of attributes inside
`__sveltets_createSlot("name", { a, })` differs from JS, AND the body of
the synthesised slot consumer uses `;{...}` instead of ` { ... } ` (with
surrounding spaces). The JS reference walks slot `let:` prop bindings and
emits a destructure binding into the synthesised `$$_slot_def.default`
fragment.

Reference: `submodules/language-tools/packages/svelte2tsx/src/svelte2tsx/createRenderFunction.ts`.

### Cluster I: JSDoc emit (3 fixtures)

`js-jsdoc-before-first-import`, `jsdoc-various.v5`, plus the JSDoc
sveltekit-autotypes ones (overlap with cluster E).

JS-mode (`emit_jsdoc: true`) port misplaces leading comments and emits
`@template T` differently from the JS reference.

Reference: `submodules/language-tools/packages/svelte2tsx/src/svelte2tsx/utils/tsAst.ts`.

### Cluster J: One-off fixtures

| Fixture | Symptom |
|---|---|
| `circle-drawer-example` | extra space after `{` in `createElement`'s attribute object — formatting only. Investigation note: the current heuristic in `src/svelte2tsx/template/mod.rs::handle_regular_element` uses `count_tag_to_attr_spaces(...) + 1`, which over-pads when the input is `<div class="x">` (single space) and under-pads when the input is `<button on:click="...">` (extra chars come from the `:` / `"` prefixes that the JS port emits via `MagicString.appendRight` instead of via the prefix string we currently use). Fixing this likely means replicating the JS port's per-attribute appendRight strategy in `magic_string.rs` rather than tweaking the formula. |
| `await.v5` | `await` block body emitted in wrong order vs `let { ... } = $props()` |
| `comments-in-attributes.v5` | template comments inside attribute lists not rewritten correctly |
| `const-tag-component` | `{@const}` inside a component slot — `const $$_tnenopmoC0` declaration form mismatch |
| `rewrite-imports` | path-rewrite of external imports (rare config) |
| `ts-type-assertion` | `<X>e` → `e as X` rewrite happening in the wrong scope |

## Implementation plan

Tackle in this order; each cluster unlocks the next.

1. **Cluster H** (slot let-forwarding) — small mechanical formatting fixes; gets us
   2 more fixtures and confirms the `createRenderFunction` emission path is
   complete.
2. **Cluster J** one-offs — `circle-drawer-example`, `comments-in-attributes`,
   `const-tag-component`, `await.v5`, `ts-type-assertion`. Each is small.
3. **Cluster A** (snippet hoisting) — biggest cluster, one analysis pass + emit
   change unlocks 8 fixtures.
4. **Cluster B** (runes hoistable props) — adjacent to Cluster A, reuses
   the hoistability analyser.
5. **Cluster G** (generics) — small, threads through `Generics.ts`.
6. **Cluster I** (JSDoc) — small.
7. **Cluster D** (`$store` template usage) — touches `htmlxtojsx_v2`.
8. **Cluster E** (SvelteKit autotypes) — only fires for `+page.svelte` /
   `+layout.svelte` filenames.
9. **Cluster F** (DTS) — needs `emitDts` port. Largest single file in the
   reference; can emit a stub that delegates to tsgo for the first iteration.
10. **Cluster C** (V4 codegen) — landing this requires fixing the V4 export
    path in `src/svelte2tsx/svelte2tsx.rs`. Lots of small differences.

After all 10 clusters land, flip the test runner to pick V4 for non-`.v5`
fixtures (`if sample_name.ends_with(".v5") { V5 } else { V4 }`) and expect
245/245.

## Open blockers per cluster (post 207/245)

- **Cluster A — snippet-module-hoist-1/3/4/5/6 (5 fixtures)**: requires per-snippet free-variable analysis. Algorithm (from JS `index.ts` lines 235-248):
  1. For each top-level `{#snippet}`, compute `globals` = identifiers referenced in body that aren't declared inside.
  2. If module script exists AND every global is "allowed" (not in instance script's value-declaration set), hoist to position right after last module-script import (or `moduleAst.astOffset` if no imports).
  3. Else if instance script exists, move to start of `$$render`.
  4. Else don't move.
  Currently rsvelte does step 3 unconditionally for all top-level snippets. Implementing requires walking each snippet body via OXC, plus tracking instance-script declared names.
- **Cluster B — ts-runes-hoistable-props-1/2/4/5/6 + false-5/10/15 (8 fixtures)**: requires a port of `HoistableInterfaces.ts`. The hoistable-types path needs to emit eligible top-level `type/interface` declarations BEFORE `function $$render()` and leave the rest in place. We have `hoistable_type_ranges` declared but unpopulated; populating it requires walking `type X = ...`, `interface X { ... }` and tracking which depend only on imports/types/module-scope/generics (not instance-script values).
- **Cluster C — V4 codegen (~17 fixtures, all non-`.v5`)**: V4 export path in `src/svelte2tsx/svelte2tsx.rs` is incomplete. Flipping the test runner to pick V4 for non-`.v5` regresses to 122/245. Save for last.
- **Cluster D — `$store` template usage (5 fixtures)**: `__sveltets_2_ensureAction` / `__sveltets_2_cssProp` rewriting differs for store-prefixed identifiers. Requires `htmlxtojsx_v2/utils/node-utils.ts::store_subscriptions` port.
- **Cluster E — SvelteKit autotypes (4 fixtures)**: detect `+page.svelte` / `+layout.svelte` filename and inline `import('./$types.js').PageData` types. Touches `ExportedNames.ts::sveltekit_autotype`.
- **Cluster F — DTS (5 fixtures)**: needs `emitDts.ts` port (largest single file in JS reference).
- **Cluster G — generics non-snippet (2 fixtures, `ts-$$generics-interface-references` / `ts-await-generics.v5`)**: thread generic type parameters through `function $$render<T>()`. Partial fix landed for snippets in #34.
- **Cluster H — slot let-forwarding (2 fixtures)**: gated on `MagicString.appendRight`-per-attribute rewrite (see Cluster J finding below).
- **Cluster I — JSDoc emit (3 fixtures)**: `js-jsdoc-before-first-import`, `jsdoc-various.v5`, JSDoc sveltekit-autotypes ones. Misplaces leading comments and emits `@template T` differently.
- **Cluster J one-offs (~6 fixtures)**: per-attribute spacing in `createElement` and `for(let ...)` headers — same root cause: bulk `overwrite()` + padding heuristics can't preserve original positions. Real fix: replicate JS reference's per-`appendRight` strategy in `magic_string.rs`.

## Working tips

- Always read the failing fixture's `input.svelte` and `expectedv2.ts` side-by-side. The diff line numbers in the runner output are good but the surrounding context matters.
- The runner's `relaxed_compare` (in `tests/svelte2tsx_fixtures.rs`) chains many normalisation passes. If a fixture starts passing only after a normalisation, that means rsvelte's output is *still* drifting — investigate before relying on it.
- The JS reference uses `MagicString` (mutate-in-place); rsvelte's `src/svelte2tsx/magic_string.rs` mirrors it. When you find a "I need to insert text at offset X" gap, check `magic_string.rs` for the matching `insert_left` / `insert_right` / `overwrite` helper before writing a new one.
