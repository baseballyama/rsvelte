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

Measured on origin/main @ `fbdbd52` against the projects' `main` branches,
svelte `5.56.3`. `match` = byte-identical after the corpus's normalization
contract; `error-parity` = both sides reject identically.

| Track | match / total | compat |
|---|---|---|
| **Compiler** (CSR + SSR byte-equality) | 3064 / 3751 | **81.7 %** |
| **svelte2tsx** (TSX byte-equality) | 3524 / 3635 | **96.9 %** |
| **Formatter** (oxfmt + prettier-plugin-svelte oracle) | 3412 / 3635 | **93.9 %** |

`error-mismatch` is essentially zero on real files (compiler: 1, svelte2tsx: 0)
— i.e. rsvelte never spuriously accepts/rejects a real shipped component, only
its *output* diverges.

### Per project

| Project | Compiler | svelte2tsx | Formatter |
|---|---|---|---|
| bits-ui | 54.2 % | 96.1 % | 97.4 % |
| flowbite-svelte | 91.2 % | 97.5 % | 87.7 % |
| melt-ui | 77.4 % | 95.3 % | 95.3 % |
| shadcn-svelte | 85.6 % | 96.9 % | 97.3 % |

## Dominant divergences (burn-down order)

### Compiler (686 real-file js-mismatches)
Two root causes account for ~58 % of all compiler divergences:

1. **Namespaced / member-expression components** (~221) — `<DropdownMenu.Item>`,
   `<RangeCalendar.Root>`, … rsvelte wraps the component call in an existence
   guard `if (DropdownMenu.Item) { … }`; the official compiler calls it
   directly. This is the single biggest cluster and spans every project.
2. **`$props.id()` emission order** (~177) — official emits
   `const uid = $.props_id();` *before* `$.push($$props, true)`; rsvelte emits it
   *after*. Drives bits-ui's low score (it uses `$props.id()` in nearly every
   component).
3. **`{@const}`-in-snippet** (a handful) — a `{@render child(...)}` snippet whose
   body opens with a `{@const}` is wrapped by the official compiler in an extra
   `{ let $0 = $.derived(...); $.snippet(...); }` block; rsvelte flattens it.

Fixing (1) + (2) alone would lift compiler real-file compat from 81.7 % to
~92 % and bits-ui from 54 % to >90 %.

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
