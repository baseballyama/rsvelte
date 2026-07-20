# `tailwind_class_order`

A **pure-Rust Tailwind CSS class sorter** for the *default* (zero-config) Tailwind
design system. It reproduces the ordering that
[`prettier-plugin-tailwindcss`](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)
— and, underneath it, Tailwind v4's `getClassOrder` — produces, **without running
any JavaScript / Tailwind engine**. It sorts from three data tables that were
extracted once from the real engine and embedded into the crate.

The public API is shaped to drop straight into oxc's formatter Tailwind callback
(`TailwindCallback = Arc<dyn Fn(Vec<String>) -> Vec<String>>`):

```rust
use tailwind_class_order::{sort_classes, sort_class_string};

// oxc TailwindCallback shape: sort one class list.
let sorted = sort_classes(vec!["p-4".into(), "m-2".into(), "flex".into()]);
assert_eq!(sorted, ["m-2", "flex", "p-4"]);

// Convenience: sort + dedupe a whole `class="…"` attribute string
// (matches prettier's `sortClassAttributes`).
assert_eq!(sort_class_string("p-4 m-2 flex"), "m-2 flex p-4");
```

## Why this can never be a *complete* port

Tailwind's class order is a function of the **project's** compiled CSS. For any
class, the real engine (v4 `getClassOrder`) compiles it to CSS and sorts by
`(variant-bitmask, generated-CSS-property fingerprint, declaration count,
candidate string)`. The property fingerprint and the very *existence* of a class
depend on the project's stylesheet/config: a JS `tailwind.config.js`, a v3
config, `@plugin`, custom `@utility` / `@custom-variant` / `@theme` tokens, or a
`safelist` can all add utilities/variants and shift ordering. `oxfmt` therefore
delegates the sort to the genuine `prettier-plugin-tailwindcss/sorter` running in
a Node worker, seeded with the project's `stylesheetPath` / `configPath`.

A pure-Rust implementation cannot execute that JavaScript, so **byte-exact
ordering for an arbitrary project is impossible in principle.** What *is*
tractable — and what this crate does — is the **stock, zero-config** design
system: `@import "tailwindcss";` with the default theme, no plugins, no custom
CSS. For that fixed universe the ordering is a fixed function, and we capture it.

## How it works

### The algorithm (faithful to v4)

For each class token the sorter computes a key, then sorts. The key mirrors the
real comparator:

1. **Variant weight.** Each variant maps to a family rank; a class's variant key
   is the list of its ranks sorted **descending**. Comparing these lists
   lexicographically is equivalent to comparing Tailwind's OR-ed variant bitmask
   by magnitude — so any variant pushes a class after all bare ones, and stacked
   variants order by their highest-weight member first.
2. **Variant value.** Within one family the engine orders by value: a named value
   (`data-active`) before an arbitrary one (`data-[x]`), then by candidate; named
   container queries (`@xl`, `@5xl`) order by the theme's container-size sequence.
   This dominates the base order.
3. **Base utility order.** The variant-stripped base maps to an intrinsic index
   (its position in the default utility order). Arbitrary properties
   (`[content-visibility:auto]`) sort at their emitted property's position in
   `GLOBAL_PROPERTY_ORDER`; arbitrary values (`w-[10px]`) sort among their named
   root-siblings, matched to the color / non-color cluster.
4. **Candidate tiebreak.** Ties are broken by an alphanumeric compare of the raw
   token where digit runs compare numerically (`w-2` < `w-10`) — a port of
   Tailwind's `utils/compare.ts`. This resolves modifiers (`bg-red-500` <
   `bg-red-500/25` < `.../50`), `!important` (`!flex` < `flex`), and the
   many same-property utilities the engine orders purely by name.

**Unknown** classes (anything the default system can't resolve) are kept ahead of
the sorted known classes in their original relative order — exactly
`prettier-plugin-tailwindcss`'s rule for a `null` order. Crucially, a custom
theme token (`text-muted-foreground`, `bg-background`) is unknown to *both* this
crate and the real default-config engine, so both agree to leave it first.

### The data tables (`data/`)

All are generated **from the real Tailwind v4 engine** via
`__unstable__loadDesignSystem` over a default `@import "tailwindcss";` stylesheet
(see `scripts/`), so the numbers are the engine's own, not hand-authored:

| file | contents |
|---|---|
| `default_order.txt` | Every named default utility (~23,300 incl. curated bare/alias forms `getClassList` omits), one per line, in ascending `getClassOrder` order. |
| `default_variants.txt` | The 71 static default variants in order (intermediate; feeds the next file). |
| `variant_roots_order.txt` | The 90 default variant **families** in order — static variants verbatim plus `root-*` labels for parametric families (`group-*`, `data-*`, `@container-named`, …). |
| `property_anchor.txt` | Tailwind's `GLOBAL_PROPERTY_ORDER` as `property → anchor` (utilities sorting before `[property:…]`); positions arbitrary properties. |
| `color_families.txt` | The theme's color-family namespace (`red`, `blue`, …); tells `text-red-500` (color) from `text-sm` (non-color) so an arbitrary value joins the right cluster. |
| `container_sizes.txt` | Container-query breakpoints in size order, so `@xl` sorts before `@5xl`. |

Arbitrary *values* (`w-[10px]`, `h-(--foo)`) and spacing-scale members the table
samples omit (`end-9`, `-inset-y-1`) are placed **among their named
root-siblings** by the candidate tiebreak, so no per-value table is needed. A
numeric-tail check keeps this from misclassifying custom color scales
(`bg-dark-10`, `primary-600`), which stay unknown like the engine leaves them.

### Regenerating the tables

From a directory containing a `default.css` of `@import "tailwindcss";` and a
`node_modules` with `tailwindcss` + `prettier-plugin-tailwindcss` installed:

```bash
node scripts/gen_base_order.mjs        # -> default_order.txt
node scripts/gen_static_variants.mjs   # -> default_variants.txt
node scripts/gen_variant_roots.mjs     # -> variant_roots_order.txt
node scripts/gen_property_anchor.mjs   # -> property_anchor.txt
node scripts/gen_color_families.mjs    # -> color_families.txt
node scripts/gen_container_sizes.mjs   # -> container_sizes.txt
node scripts/oracle_sort.mjs           # the reference sorter, for parity checks
```

## Parity with the real sorter

Measured against `prettier-plugin-tailwindcss@0.8.1` + `tailwindcss@4.3.3` with a
default stylesheet, over **3,806 unique real `class="…"` attribute values**
extracted from the shadcn-svelte, flowbite-svelte and bits-ui corpora:

| metric | result |
|---|---|
| **list-level exact match** (whole attribute byte-identical) | **99.8%** (3,799 / 3,806) |
| token position-level accuracy | 99.7% |

This is after six fidelity passes over the initial 97.9% prototype:

| pass | what it added | list-level |
|---|---|---:|
| baseline | variant bitmask + base order + candidate compare | 97.9% |
| Phase 1 | arbitrary properties via `GLOBAL_PROPERTY_ORDER` | 98.5% |
| Phase 2 | color / non-color split for arbitrary values | 98.8% |
| Phase 3 | within-family variant value ordering + container sizes | 99.2% |
| Phase 4 | `(root, data-type)` anchors + data-type inference (`text-[10px]` = font-size) | 99.5% |
| Phase 5 | unified variant compare + arbitrary-variant selector normalization | 99.6% |
| Phase 6 | compound functional roots (`grid-cols`), string type, depth-0 modifier `/` | **99.8%** |

A ~200-case subset of the matching corpus lines is committed as
`tests/corpus_fixture.json` and asserted by `tests/corpus_parity.rs`, so parity
is locked in-repo without the Node oracle.

### What the remaining 7 lists need (the frontier)

None are the "impossible" (JS-config) barrier — a custom breakpoint like `3xl:`
is treated as unknown by *both* this crate and the default-config engine, so
those match. The residue is 2 corpus artifacts plus 5 finicky single-value cases:

| cause | lists | portable? |
|---|---:|---|
| A source-level HTML-entity artifact (`[&amp;_svg]`) and two non-Tailwind literal words the corpus ships as `class` values (`Serendipity`, `Morning`) | 3 | n/a — corpus quirks, not real classes. |
| Multi-value arbitrary values (`bg-size-[20px_20px]` size pair, `shadow-[0px_1px_…]` box-shadow list) that carry no single data type | 2 | Yes — model the composite value shapes. |
| A named thickness gap (`decoration-4`) the table omits, ordered against style siblings, and a CSS-variable arbitrary value (`ring-offset-(--color)`) whose type is unknowable statically | 2 | Partly — the first needs per-utility signatures; the second is inherently ambiguous (`var()` could be any type). |

## Roadmap to the last 7

Phases 1–6 above are **done** (97.9% → 99.8%). The remaining 5 non-artifact
lists each need bespoke, low-yield handling (composite value shapes; per-utility
signatures for named thickness gaps; heuristic typing of `var()` values), and a
targeted numeric-gap attempt regressed net, so they are deferred rather than
forced.

Full parity for *arbitrary projects* remains out of scope by construction (see
the first section); these steps raise fidelity for the **default-config** case
that a large share of real projects — and every Tailwind playground — use.

## rsvelte-fmt integration

`@rsvelte/fmt`'s `sortTailwindcss` is backed by this crate. The CLI sorts
natively only when it detects a stock, zero-config Tailwind v4 stylesheet
(`@import "tailwindcss";` with no `@plugin` / `@utility` / `@custom-variant` /
`@theme` / `@config` and no v3 `tailwind.config.js`); any custom setup warns and
leaves classes unchanged, since its order depends on the JS engine. See
`crates/rsvelte_fmt/src/tailwind.rs`.

## License

MIT. Not affiliated with Tailwind Labs. The embedded order data is derived from
Tailwind CSS (MIT).
