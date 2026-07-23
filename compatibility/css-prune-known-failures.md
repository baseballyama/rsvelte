# css-prune-known-failures.json — why entries are accepted

The CSS-prune differential sweep (`scripts/compat-corpus/css-prune-sweep.mjs`)
generates many tiny synthetic components from a grid of ingredients — CSS
selector shape × the markup context that produces the candidate siblings × an
unrelated "corruptor" node elsewhere in the template — and compiles each with
BOTH the official `svelte/compiler` and rsvelte, diffing the emitted `css.code`.
The unused-CSS prune decision is visible in the CSS as `(unused)` / `(empty)`
comments plus scoping-class (`.svelte-<hash>`) placement, so a `css.code`
divergence **is** a prune divergence.

This ratchet exists because the happy-path corpus (`compile.mjs` / `verify.mjs`)
compares real-world code, and real components almost never hit the odd
combinations that break the prune algorithm's per-sibling traversal — the exact
gap that let issue #1700 ship. The ratchet may only **shrink**: an entry may be
removed when its component starts matching the official compiler, never added
without a justification below. New divergences absent from this file fail
`--check` as regressions.

Every entry here is a **genuine rsvelte prune bug** (rsvelte diverges from the
correct official output), not an oracle bug — so the goal is to drive this file
to empty, not to accept the entries permanently. They are ratcheted rather than
hard-failed only so the harness can land before every underlying fix does.

Sweep shape: 1222 components, ~4s. Client and server prune identically
(`--both` reports 0 client≠server divergences), so the sweep compiles one target
(`generate: 'client'`, `css: 'external'`) per component.

## Divergence clusters (0 entries — all root causes fixed)

The ratchet is empty: the sweep reports 0 divergences. The three root causes
found by this sweep are all fixed. The history is kept here as the record of why
the ratchet could shrink.

### 1. `<svelte:head>` void-element perturbation — FIXED (issue #1700)

A void element in `<svelte:head>` (`<meta />`, `<link />`) perturbed rsvelte's
per-sibling traversal, so a sibling-combinator selector was mis-decided in both
directions (false-prune for `{#each}`-generated siblings, false-keep for
`{#if}`/`{:else}` mutually-exclusive ones). Root cause was not the prune
algorithm itself but a `dom_idx` desync in
`crates/rsvelte_core/src/compiler/phases/2_analyze/control_flow.rs`:
`collect_elements_and_paths` assigned element indices with its own counter but
did not descend into `<svelte:head>` (nor the other `svelte:*` wrappers), while
the analysis visitor that builds `dom_structure.elements` does — so a scopable
element inside such a wrapper shifted every later element's sibling data by one.
`<title>` never triggered it because a `TitleElement` is not scopable and gets
no index.

Fixed in #1708: 36 sweep entries cleared (every `head_void` / `head_link_void`
variant on a non-nested selector, plus all `:has` variants).

### 2. `:global(.a) + .b` inside `{#await}` / snippet — FIXED (issue #1702)

`:global(.a) + .b` where a `:global` leads a scoped following-sibling, when the
pair lives inside a `{#await}…{:then}` branch or a `{#snippet}` fragment
rendered with `{@render}`. rsvelte pruned the whole selector as `(unused)`;
official keeps it (`.a + .b.svelte-X`). Asymmetric: `.a + :global(.b)` was **not**
affected, and the same selector in `{#each}` / `{#if}` / `{#key}` contexts already
matched. Root cause: `{#await}` branches and `{#snippet}` bodies both set
`css.has_opaque_elements`, which forced the transform's `:global(X) + Y` prune
check down a branch that only accepted `Y` when it immediately followed an opaque
boundary — a real previous sibling `.a` is not an opaque boundary, so the rule
was pruned. `{#each}`/`{#if}`/`{#key}` do not set `has_opaque_elements`, so they
took the root-child branch and matched.

Fixed in this PR (`is_sibling_combinator_unused` in
`crates/rsvelte_core/src/compiler/phases/3_transform/css.rs`): the acceptable
predecessors of `Y` are now unioned — a real previous sibling matching the inner
`:global(...)` selector, an opaque boundary, or `Y` being a root-level element
(the global `.a` may be injected by the parent). 16 sweep entries cleared.
Representative: `A/:global(.a)+.b/await_then/none`,
`A/:global(.a)+.b/snippet_render/none`. Regression test:
`crates/rsvelte_core/tests/css_global_sibling_1702.rs`.

### 3. Nested `.a { & + & {} }` sibling combinator — FIXED (issue #1703)

A nested rule whose inner selector uses the parent-selector sibling combinator
(`.a { & + & { … } }`, i.e. `.a + .a`) against a real adjacent-`.a` sibling
pair. Official scopes and keeps it (`.a.svelte-X { & + & {} }`); rsvelte marked
the whole nested rule `(empty)` and dropped it, spanning nearly every markup
context that produces the sibling pair. Root cause: the transform's
`is_sibling_combinator_unused` built the `SelectorInfo` for `&` (NestingSelector)
via `extract_selector_info`, which ignores NestingSelector and yields an empty
(matches-nothing) info, so the sibling walk never found a match.

Fixed in this PR: `extract_selector_info_resolving_nesting` resolves `&` against
the parent rule's subject compound (`.a`) before matching. 65 sweep entries
cleared. Representative: `A/&+&/literal/none`, `A/&+&/each_all/none`. Regression
test: `crates/rsvelte_core/tests/css_nested_sibling_1703.rs`.

## How to run

```bash
pnpm run corpus:css-prune                 # full sweep + clustered report
pnpm run corpus:css-prune:check           # CI gate: fail on any NEW divergence
node scripts/compat-corpus/css-prune-sweep.mjs --both     # also assert client==server
node scripts/compat-corpus/css-prune-sweep.mjs --id A/&+&/each_all/none
node scripts/compat-corpus/css-prune-sweep.mjs --list
node scripts/compat-corpus/css-prune-sweep.mjs --update-baseline
```

Requires a staged NAPI binding at `.corpus-cache/rsvelte.node`
(`cargo build --release -p rsvelte_napi --lib`, then
`cp target/release/librsvelte_napi.dylib .corpus-cache/rsvelte.node`).
