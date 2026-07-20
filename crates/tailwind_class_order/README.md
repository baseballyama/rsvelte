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
| **list-level exact match** (whole attribute byte-identical) | **99.2%** (3,777 / 3,806) |
| token position-level accuracy | 99.5% |

This is after three fidelity passes over the initial 97.9% prototype:

| pass | what it added | list-level |
|---|---|---:|
| baseline | variant bitmask + base order + candidate compare | 97.9% |
| Phase 1 | arbitrary properties via `GLOBAL_PROPERTY_ORDER` | 98.5% |
| Phase 2 | color / non-color split for arbitrary values | 98.8% |
| Phase 3 | within-family variant value ordering + container sizes | **99.2%** |

A ~200-case subset of the matching corpus lines is committed as
`tests/corpus_fixture.json` and asserted by `tests/corpus_parity.rs`, so parity
is locked in-repo without the Node oracle.

### What the remaining ~0.8% needs (the frontier)

| cause | lists | portable? |
|---|---:|---|
| Arbitrary **value** under a multi-fingerprint root — the color split is not fine enough (`text-[10px]` font-size vs `text-align`, `bg` image/size/position) | 19 | Yes — needs a per-utility CSS-property signature (+ declaration count) and a port of Tailwind's data-type inference, so an arbitrary value joins its exact property cluster rather than just color/non-color. |
| Stacked-variant value interaction and arbitrary-variant selector ordering (`[&_div>button]` vs `[&>div>div]`) | 9 | Yes — needs the full `Variants.compare` recursion (value order can cross a variant-count boundary; selectors are normalized). |
| HTML-entity artifacts in source (`[&amp;_svg]`) | 1 | n/a — corpus quirk (the source ships an un-decoded entity). |

The color/non-color split (Phase 2) resolves the common multi-fingerprint case;
the residue is finer intra-root fingerprints (font-size vs text-align, background
image vs size vs position) that need real per-utility property signatures.

## Roadmap to a higher-fidelity default-config sorter

Phases 1–3 above are **done**. Remaining:

1. **Per-utility property signatures**: generate `name → (property list, declaration
   count)` for every utility (via `candidatesToCss`) and port Tailwind's
   `infer-data-type.ts`, so an arbitrary value is placed by its exact emitted
   property + declaration count rather than the color/non-color approximation.
   ~1 day. Recovers most of the remaining ~19 arbitrary-value lists.
2. **Full `Variants.compare`**: the current value ordering is faithful for a
   single family; the recursion for stacked variants of mixed families and
   normalized arbitrary selectors closes the last ~9 lists. ~1 day.
3. **Wire into `rsvelte-fmt`**: back oxc's `TailwindCallback` with this crate when
   the project uses a default config; keep the Node oracle as the fallback for
   custom configs. Gated behind detecting a stock setup. Not started — deferred
   until the fidelity is confirmed acceptable for wiring.

Full parity for *arbitrary projects* remains out of scope by construction (see
the first section); these steps raise fidelity for the **default-config** case
that a large share of real projects — and every Tailwind playground — use.

## License

MIT. Not affiliated with Tailwind Labs. The embedded order data is derived from
Tailwind CSS (MIT).
