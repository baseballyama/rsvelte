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

## Divergence clusters (81 entries, 2 root causes)

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

Fixed on branch `fix/1700-sibling-combinator-prune`: 36 sweep entries cleared
(every `head_void` / `head_link_void` variant on a non-nested selector, plus all
`:has` variants). The 14 `A/&+&/…/head_void` variants that remain are **not**
head-void bugs — they diverge identically with `corr=none` and belong to cluster
3 below (nested-`&`); the head void no longer perturbs them.

### 2. `:global(.a) + .b` inside `{#await}` / snippet — 16 entries (issue #1702)

`:global(.a) + .b` where a `:global` leads a scoped following-sibling, when the
pair lives inside a `{#await}…{:then}` branch or a `{#snippet}` fragment
rendered with `{@render}`. rsvelte prunes the whole selector as `(unused)`;
official keeps it (`.a + .b.svelte-X`). Corruptor-independent (diverges with
`corr=none`). Asymmetric: `.a + :global(.b)` is **not** affected, and the same
selector in `{#each}` / `{#if}` / `{#key}` / nested-`{#each}` contexts matches —
the bug is specific to the await-branch and snippet fragment child-lists not
being traversed for the `:global`-prefixed leading segment.

Representative: `A/:global(.a)+.b/await_then/none`,
`A/:global(.a)+.b/snippet_render/none`. Pre-existing, unrelated to #1700 —
tracked as issue #1702.

### 3. Nested `.a { & + & {} }` sibling combinator — 65 entries (issue #1703)

A nested rule whose inner selector uses the parent-selector sibling combinator
(`.a { & + & { … } }`, i.e. `.a + .a`) against a real adjacent-`.a` sibling
pair. Official scopes and keeps it (`.a.svelte-X { & + & {} }`); rsvelte marks
the whole nested rule `(empty)` and drops it. Corruptor-independent (diverges at
`corr=none`) and spans nearly every markup context that produces the sibling
pair — including the 14 `head_void` / `head_link_void` variants, which now
diverge exactly as their `corr=none` counterparts do. rsvelte's nested-rule
(`&`) expansion is not consulted during sibling-relationship pruning.

Representative: `A/&+&/literal/none`, `A/&+&/each_all/none`. Pre-existing,
unrelated to #1700 — tracked as issue #1703.

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
