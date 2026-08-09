# css-prune-known-failures.json — why entries are accepted

The CSS-prune differential sweep (`scripts/compat-corpus/css-prune-sweep.mjs`)
generates many tiny synthetic components from a grid of ingredients — CSS
selector shape × the markup context that produces the candidate siblings × an
unrelated "corruptor" node elsewhere in the template — and compiles each with
BOTH the official `svelte/compiler` and rsvelte, diffing the emitted `css.code`
**and** the `code@line:column` of every warning. The unused-CSS prune decision is
visible in the CSS as `(unused)` / `(empty)` comments plus scoping-class
(`.svelte-<hash>`) placement, so a `css.code` divergence **is** a prune
divergence — but the converse does not hold: a nest whose outer rule is dead
prunes to the same byte-identical `(empty)` stylesheet whether or not that outer
rule is reported unused, so `css_unused_selector` has to be compared too.

This ratchet exists because the happy-path corpus (`compile.mjs` / `verify.mjs`)
compares real-world code, and real components almost never hit the odd
combinations that break the prune algorithm's per-sibling traversal — the exact
gap that let issue #1700 ship. The ratchet may only **shrink**: an entry may be
removed when its component starts matching the official compiler, never added
without a justification below. New divergences absent from this file fail
`--check` as regressions.

Every entry here is a **genuine rsvelte bug** (rsvelte diverges from the correct
official output), not an oracle bug — so the goal is to drive this file to empty,
not to accept the entries permanently. They are ratcheted rather than
hard-failed only so the harness can land before every underlying fix does.

Sweep shape: 1969 components, ~5s. Client and server prune identically
(`--both` reports 0 client≠server divergences), so the sweep compiles one target
(`generate: 'client'`, `css: 'external'`) per component.

Two products feed it, and they vary different axes. Families **A/B/C/C3** live in
`css-prune-sweep.mjs` and vary the *markup* around a small fixed set of sibling
selectors, because the bug they were built for (#1700) was in the per-sibling
traversal. Families **D-H** live in `css-prune-families.mjs` and vary the
*selector* against a fixed set of arrangements — explicit `&`,
`:is()`/`:where()`/`:not()`/`:has()` arguments, `:root`, trailing `:global(...)`,
and attributes whose value the compiler must reason about (#2535).

The comparison key lives in `scripts/compat-corpus/css-prune-verdict.mjs`, apart
from the sweep so it can be exercised without the NAPI binding;
`scripts/dev/test-css-prune-sweep-warning-verdict.mjs` pins it in CI and fails on
a comparator that stops looking at warnings.

## Divergence clusters (`css-prune-known-failures.json`, 4 entries)

All four are **`css.code`-only**: the two compilers agree about which selectors
are used, and the `css_unused_selector` sets are identical. They are not prune
bugs at all — they are selector-*scoping* bugs that the D-H families exposed
because those families are the first to generate `:is()` arguments. Read that
as a warning about this ratchet rather than as reassurance: the comparison key
this whole gate is named for scores all four green, and only the `css.code` half
of the key moves.

Each is tracked separately so a partial fix cannot silently close the others.

| entry | issue | cause |
|---|---|---|
| `E/is(.a)>.b/nested_ab` | [#2719](https://github.com/baseballyama/rsvelte/issues/2719) | Upstream scopes a complex selector's own relative selectors first and descends into `:is()` arguments afterwards, so the argument inherits an already-bumped specificity and is written `:where(.svelte-X)`. rsvelte scopes arguments during the compound walk, in source order, and emits the plain class. A real specificity difference in shipped CSS, not cosmetic |
| `E/is(.a,.miss)+.b/sibling_ab` | [#2719](https://github.com/baseballyama/rsvelte/issues/2719) | Same cause with a sibling combinator. Kept as a second entry because the control that isolates the ordering is the *absence* of a divergence when the `:is()` is the whole selector — `E/is(.a,.b)`'s other arrangements match on both sides |
| `E/is(.a,.b)/only_b` | [#2720](https://github.com/baseballyama/rsvelte/issues/2720) | Official comments an unused `:is()` branch out **in place**, taking its trailing comma; rsvelte emits the surviving branch first and appends the commented-out one, reordering the argument list |
| `E/is(.a):is(.b)/compound_ab` | [#2721](https://github.com/baseballyama/rsvelte/issues/2721) | Upstream skips the scoping modifier only for a **standalone** `:is()` (`selectors.length === 1`); with two of them the compound still gets a leading `.svelte-X`. rsvelte omits it, so the emitted rule carries no scoping class of its own and is not scoped to the component |

## Fixed root causes

The history below is kept as the record of why the ratchet could shrink.

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

### 4. Outer rule of an unused nest, warning-only — FIXED (issue #2474)

`.grand { .foo > .a { & + & {} } }` where no `.grand` is an ancestor of `.foo`:
rsvelte warned about the innermost `& + &` but not about the enclosing
`.foo > .a`, because it asked only whether each enclosing selector matched *some*
element rather than an **ancestor** of a match. 16 entries — the `.grand{...&+&}`
and `.grand{...&~&}` families in the `no_grand` arrangement across all 8
structural corruptors, which is why the corruptor axis is irrelevant to it.

Two separate failures, and they must not be collapsed. The compiler bug was fixed
in #2534 (regression test
`crates/rsvelte_core/tests/css_nested_ancestor_2474.rs`). The *gate* bug is that
the sweep never saw it: the pruned stylesheet is byte-identical in both
directions, so a `css.code`-only key scored all 16 as `match`. The comparison key
now includes warnings.

### 5. Five selector-shape families — FIXED (issue #2535)

#2474 closed the implicit-`&` ancestor case and named five families it did not
touch. Measured on the D-H grid (539 components) against `origin/main` and again
with the fix, identical denominators both sides:

| family | before | after | of which warning divergences (before → after) |
|---|---|---|---|
| D explicit `&` under a non-ancestor parent | 19/70 | 0/70 | 19 → 0 |
| E `:is()`/`:where()`/`:not()`/`:has()` arguments and compounds | 36/126 | 4/126 | 32 → 0 |
| F `:root` | 6/70 | 0/70 | 6 → 0 |
| G trailing `:global(...)` | 4/126 | 0/126 | 4 → 0 |
| H dynamic attributes | 2/147 | 0/147 | 2 → 0 |
| **total** | **67/539** | **4/539** | **63 → 0** |

Families A/B/C/C3 are 0/1430 on both sides.

Two of D's rows (`deep_.a:hover_&`, `deep_.miss_&`) were added *after* the grid
was first green, because the first version of the explicit-`&` fix over-pruned
three real `svelte.dev` components and the grid did not see it — every family-D
row then written had a single-compound parent, and the shape needs a
two-compound parent **and** a subject `&`. They are worth reading as a pair: on
`origin/main` they contribute 3 of D's 19, all warning-only under-reports, so
the rows are discriminating in both directions rather than only against the
regression that prompted them.

The E row is wider than the family name suggests. `.a:is(.b)` turned out not to
be an `:is()` problem: `.a.b` and `#i.a` split across two elements diverged the
same way, because each simple selector was checked for existence *separately*.
The fix is `is_structural_compound_unused`, which requires one element to satisfy
the whole compound. The shapes that show it (`.a.b`, `:is(.a):is(.b)`,
`.a:where(.b)`, `div.a:is(.b)`, `p.a`) were added to the grid **after** the first
baseline was taken; on the reverted compiler they account for 14 of E's 36 and
for 4 of G's 4, so the pre-existing-rows-only figures are 46 → 3 over 392
components. Both numbers are reported because neither alone is the whole claim.

Not fixed here, and split out because it lives in a different pass:
`:root<compound>:has(...)` is now correctly reported as used, but the element it
matches is still not given the scope class, so the emitted rule cannot fire
(#2744). This gate cannot see that at any grid size — it discards `js.code`, and
element scoping is only observable there.

### Known limitation: combinators inside a resolved compound (issue #1719)

The #1702/#1703 resolution above only fires for a **single-relative** selector.
A combinator inside the resolved compound — `:global(.a .z) + .b`, or a
multi-relative parent like `.foo > .a { & + & }` — carries an ancestor/child
constraint the compound-only matcher can't verify, so it is intentionally left
unresolved (erring toward over-pruning, never over-keeping). This is a
pre-existing limitation of the transform's dom-structure prune heuristic, not a
regression from this PR, and is tracked in issue #1719.

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
`mkdir -p .corpus-cache && cp target/release/librsvelte_napi.{dylib,so} .corpus-cache/rsvelte.node.staging && mv .corpus-cache/rsvelte.node.staging .corpus-cache/rsvelte.node`).
