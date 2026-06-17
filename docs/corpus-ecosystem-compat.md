# Ecosystem corpus — real-world compatibility snapshot

The ecosystem corpus runs rsvelte's three output-equality tracks over the
*shipped source* of the production projects tracked by ecosystem-ci, comparing
byte-for-byte against the official toolchain. See
[scripts/compat-corpus/README.md](../scripts/compat-corpus/README.md#ecosystem-corpus-real-world-projects)
for how to run it.

Projects (from `compat/ecosystem-ci/targets/*.json`): **bits-ui**,
**flowbite-svelte**, **melt-ui**, **shadcn-svelte**. Only real
`.svelte` / `.svelte.(js|ts)` files are collected (project markdown docs are
skipped as noise — they carry non-Svelte doc tooling like flowbite's
`{#include}` directive and truncated pseudo-code the official compiler rejects).

## Snapshot

Measured against the projects' `main` branches, svelte `5.56.3`. `match` =
byte-identical after the corpus's normalization contract; `error-parity` = both
sides reject identically.

| Track | match / total | compat |
|---|---|---|
| **Compiler** (CSR + SSR byte-equality) | 3497 / 3751 | **93.2 %** |
| **svelte2tsx** (TSX byte-equality) | 3524 / 3635 | **96.9 %** |
| **Formatter** (oxfmt + prettier-plugin-svelte oracle) | 3412 / 3635 | **93.9 %** |

The compiler track rose from an initial **81.7 %** (3064) after the SSR/CSR
output fixes below; `eco-known-failures.json` ratcheted from 689 → 254.

`error-mismatch` is essentially zero on real files (compiler: 1, svelte2tsx: 0)
— i.e. rsvelte never spuriously accepts/rejects a real shipped component, only
its *output* diverges.

### Per project (compiler track)

| Project | before | after |
|---|---|---|
| bits-ui | 54.2 % | **91.1 %** |
| flowbite-svelte | 91.2 % | **92.2 %** |
| melt-ui | 77.4 % | **77.4 %** |
| shadcn-svelte | 85.6 % | **95.6 %** |

## Fixed in this burn-down (81.7 % → 93.2 %)

1. **`$props.id()` emission order** — emit `const uid = $.props_id();` as the
   component's first line (before `$.push` on the client). Drove bits-ui.
2. **Namespaced / member-expression components with snippets** — a dynamic
   `<DropdownMenu.Trigger>` keeps its `{#snippet}` `function` declarations
   *outside* the `if (X.Y) { … }` hydration guard (both the bindingless and
   `bind:` server paths), matching upstream `build_inline_component`.
3. **Render-tag spread argument** — `{@render child({ …, ...rest })}` memoizes
   into a `$.derived` (upstream sets `has_call` for `SpreadElement`).
4. **`children` snippet → `default` $$slots key** (no spurious `children: true`).
5. **Spread-props object merging** — snippet/`$$slots` props and bind getter/setter
   pairs fold into the last props object rather than a separate trailing `{}`.
6. **Typed `$props()` rest** — exclude `$$slots`/`$$events` (detect + TS-annotation
   strip + brace-aware multiline collapse that survives template-literal `}`).
7. **`$.stringify` elision** for a `$props.id()` interpolation in component props.
8. **Arrow-parens** — never strip required parens after `??`/`||`/`&&`.

### Remaining (254 known failures)
A long tail across ~250 single-entry clusters. Notable remaining root causes:
`$derived.by(() => { … })` multi-line brace miscounting (produces an extra `})`
→ ~10 unparsable outputs), the keyed-`{#each … as x, i (i)}` index param emitted
even when `i` is used only in the key, and assorted one-off string/marker diffs.
melt-ui (77 %) is the lowest project and its remaining cases are mostly these.

### svelte2tsx (111 real-file ts-mismatches)
No dominant cause — a long tail across ~51 clusters. The largest are the
`$$ComponentProps` type-alias emitted for some generic/`ComponentProps<typeof X>`
prop shapes, and TS `as`-cast handling inside template expressions
(`value as string` → rsvelte drops the cast).

### Formatter (223 real-file diffs)
Dominated by long mustache/`{@render}` argument wrapping — prettier breaks
`{@render child({ props: …, …extra })}` across lines past the print width;
rsvelte keeps it on one line. Concentrated in flowbite-svelte. Same family as
the base corpus's remaining "long open-tag wrapping + child breaking" cluster.
