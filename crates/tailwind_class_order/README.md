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

1. **Variant weight.** Each variant maps to a rank; a class's variant key is the
   list of its variant ranks sorted **descending**. Comparing these lists
   lexicographically is equivalent to comparing Tailwind's OR-ed variant bitmask
   by magnitude — so any variant pushes a class after all bare ones, and stacked
   variants order by their highest-weight member first.
2. **Base utility order.** The variant-stripped base maps to an intrinsic index
   (its position in the default utility order).
3. **Candidate tiebreak.** Ties are broken by an alphanumeric compare of the raw
   token where digit runs compare numerically (`w-2` < `w-10`) — a port of
   Tailwind's `utils/compare.ts`. This resolves modifiers (`bg-red-500` <
   `bg-red-500/25` < `.../50`), `!important` (`!flex` < `flex`), and the
   many same-property utilities the engine orders purely by name.

**Unknown** classes (anything the default system can't resolve) are kept ahead of
the sorted known classes in their original relative order — exactly
`prettier-plugin-tailwindcss`'s rule for a `null` order. Crucially, a custom
theme token (`text-muted-foreground`, `bg-background`) is unknown to *both* this
crate and the real default-config engine, so both agree to leave it first.

### The three data tables (`data/`)

All are generated **from the real Tailwind v4 engine** via
`__unstable__loadDesignSystem` over a default `@import "tailwindcss";` stylesheet
(see `scripts/`), so the numbers are the engine's own, not hand-authored:

| file | contents |
|---|---|
| `default_order.txt` | Every named default utility (~23,300 incl. curated bare/alias forms `getClassList` omits), one per line, in ascending `getClassOrder` order. |
| `default_variants.txt` | The 71 static default variants in order (intermediate; feeds the next file). |
| `variant_roots_order.txt` | The 90 default variant **families** in order — static variants verbatim plus `root-*` labels for parametric families (`group-*`, `data-*`, `@container-named`, …). |

Arbitrary *values* (`w-[10px]`, `h-(--foo)`) and spacing-scale members the table
samples omit (`end-9`, `-inset-y-1`) are placed **among their named
root-siblings** by the same candidate tiebreak, so no per-value table is needed.
A numeric-tail check keeps this from misclassifying custom color scales
(`bg-dark-10`, `primary-600`), which stay unknown like the engine leaves them.

### Regenerating the tables

From a directory containing a `default.css` of `@import "tailwindcss";` and a
`node_modules` with `tailwindcss` + `prettier-plugin-tailwindcss` installed:

```bash
node scripts/gen_base_order.mjs        # -> default_order.txt
node scripts/gen_static_variants.mjs   # -> default_variants.txt
node scripts/gen_variant_roots.mjs     # -> variant_roots_order.txt
node scripts/oracle_sort.mjs           # the reference sorter, for parity checks
```

## Parity with the real sorter

Measured against `prettier-plugin-tailwindcss@0.8.1` + `tailwindcss@4.3.3` with a
default stylesheet, over **3,806 unique real `class="…"` attribute values**
extracted from the shadcn-svelte, flowbite-svelte and bits-ui corpora:

| metric | result |
|---|---|
| **list-level exact match** (whole attribute byte-identical) | **97.9%** (3,727 / 3,806) |
| token position-level accuracy | 98.3% |

A 200-case subset of the matching corpus lines is committed as
`tests/corpus_fixture.json` and asserted by `tests/corpus_parity.rs`, so parity
is locked in-repo without the Node oracle.

### What the remaining ~2% needs (the frontier)

| cause | lists | portable? |
|---|---:|---|
| Arbitrary **value** under a multi-fingerprint root (`text-[10px]` font-size vs `text-[#fff]` color share root `text`) | 34 | Yes — needs a value-type → property classifier per root. |
| Arbitrary **property** (`[content-visibility:auto]`, `[--x:…]`) | 24 | Yes — needs the static `GLOBAL_PROPERTY_ORDER` (~400 entries) from `property-order.ts` to place by emitted property. |
| Within-family variant **value** ordering (`data-[name=amount]:` vs `data-[name=select]:`) and arbitrary-variant selector ordering | 14 | Yes — needs a port of `Variants.compare` (named < arbitrary, then value compare). |
| Custom breakpoints / config (`3xl:`, `desktop:`) | 6 | **No** — requires the project config; correctly left unknown. |
| HTML-entity artifacts in source (`[&amp;_svg]`) | 1 | n/a — corpus quirk. |

## Roadmap to a higher-fidelity default-config sorter

1. **Arbitrary properties** (`property-order.ts` table): extract `GLOBAL_PROPERTY_ORDER`,
   parse `[prop:val]`, order by the property's index (+ a slot for `--custom`).
   ~½ day. Recovers ~24 lists and generalizes beyond the corpus.
2. **Multi-fingerprint root disambiguation**: classify an arbitrary value's type
   (length / color / number / url) to pick the right sibling cluster within
   roots like `text`, `bg`, `border`, `decoration`. ~1 day. Recovers ~34 lists.
3. **`Variants.compare` port**: sub-order within a variant family by value
   (named < arbitrary, numeric-aware). ~1 day. Recovers ~14 lists.
4. **Wire into `rsvelte-fmt`**: back oxc's `TailwindCallback` with this crate when
   the project uses a default config, keep the Node oracle as the fallback for
   custom configs. Gated behind detecting a stock setup. Not started — deferred
   until the fidelity above is confirmed acceptable.

Full parity for *arbitrary projects* remains out of scope by construction (see
the first section); these steps raise fidelity for the **default-config** case
that a large share of real projects — and every Tailwind playground — use.

## License

MIT. Not affiliated with Tailwind Labs. The embedded order data is derived from
Tailwind CSS (MIT).
