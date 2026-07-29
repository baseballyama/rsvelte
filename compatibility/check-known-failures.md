# check-known-failures.json — why entries are accepted (svelte-check parity)

The svelte-check parity gate (`scripts/compat-corpus/check-verify.mjs`) runs every
scenario under `compatibility/check-fixtures/` through both the official
`svelte-check` (pinned in `scripts/compat-corpus/check-oracle`) and
`rsvelte-check`, and records every diagnostic that appears on exactly one side.
The ratchet may only shrink.

Entry format: `<scenario>|<+|-><SEVERITY> <relpath>:<line> <code>[ xN]`.
`+` = rsvelte-only (a **false positive** — official reports nothing).
`-` = official-only (a **false negative**).
`xN` is the multiplicity of the surplus: diagnostics are compared as a multiset,
so several diagnostics sharing one key (three binding elements in one
destructured parameter, say) cannot mask each other.

Column and message text are not part of the key on purpose — rsvelte maps
positions back through its own source map and TypeScript wording moves between
patch releases, so keying on them would make the ratchet churn without telling
anyone anything. See the header of `check-verify.mjs`.

## Current baseline: 1 entry / 1 surplus diagnostic (all FP, 0 FN)

The gate landed with 16 entries across the #1883–#1889 cluster. `sibling-paths-alias`
(#1883, fixed by #1884), `external-self-alias` (#1887, fixed by #1893),
`ts-aliased-import` (#1888, fixed by #1895), `kit-hooks-arrow-ts` (#1886, fixed by
#1892), `kit-hooks-js` (#1886, fixed by #1892 for the arrow/function-expression
form and a follow-up JSDoc-anchor fix for the plain `export function` form) and
`sibling-symlink` (#1900, fixed by #1907) are now all fully green and have been
pruned. What remains:

| Scenario | Entries | Diagnostics | Issue | Class |
|---|---|---|---|---|
| `boundary-elements` | 1 | 1 | #1889 | vendored `svelte-jsx-v4` shim predates `svelte:boundary` |

### `boundary-elements` — #1889

```
boundary-elements|+ERROR src/Boundary.svelte:9 7006
```

The overlay unconditionally injects the vendored `svelte-jsx-v4.d.ts`, whose
hand-enumerated `IntrinsicElements` snapshot predates `svelte:boundary`, so
`onerror`'s callback parameter falls back to `any`. Official's `get_global_types`
prefers `<sveltePath>/svelte-html.d.ts` instead — porting that is Layer 3 of
#1897 and the wholesale fix for this class.

The scenario also exercises `<search>`, the other element `svelte/elements` gained
after the shim snapshot. It currently agrees on both sides and is therefore not in
the ratchet — it is here as the drift canary for the next `svelte/elements`
addition.

## Scenarios with no entries

Green scenarios are load-bearing, not filler — a regression turns them red:

- **`basic`** — the positive control. A clean component, an intentional `TS2322`,
  and a Svelte compiler warning (`state_referenced_locally`), all three matching.
  If `basic` goes red, the harness is broken, not the product.
- **`no-tsconfig`** — the regression guard for #1898 (no `--tsconfig`, so both
  checkers synthesize their own compiler options). It does **not** currently
  reproduce against the pinned `typescript@6`, whose default lib is no longer
  ES5; the ES5-default-lib shim failure #1898 describes needs an older compiler.
  Kept because the no-`--tsconfig` path is otherwise untested end to end and the
  scenario would catch the failure the moment the pin or the synthesized config
  moves.
- **`sibling-paths-alias`**, **`external-self-alias`**, **`ts-aliased-import`** —
  fixed by #1884/#1893/#1895 respectively; kept as regression guards for their
  alias-rewrite paths.
- **`kit-hooks-fn-ts`**, **`kit-hooks-arrow-ts`**, **`kit-hooks-satisfies-ts`**,
  **`kit-hooks-js`** — one matrix covering every `handle`/`handleError`/
  `handleFetch`/`reroute` declaration shape:

  | Scenario | Form | Status |
  |---|---|---|
  | `kit-hooks-fn-ts` | `export function` (TS) | green — the form the port already matches |
  | `kit-hooks-arrow-ts` | `export const … = () => {}` (TS) | green — fixed by #1892 |
  | `kit-hooks-satisfies-ts` | `satisfies` / explicit annotation / `sequence()` | green — nothing should be augmented; guards the #1886 fix against over-augmenting |
  | `kit-hooks-js` | plain JS under `checkJs`, function + arrow | green — arrow/function-expression forms fixed by #1892, plain `export function` form fixed by anchoring its JSDoc `@type` tag at the exported statement's start instead of the `function` keyword (TypeScript ignores the tag otherwise) |
  | `kit-routes-js` | `+page.js` `load`/`entries`, `+server.js` method handlers, `params/*.js` `match` under `checkJs` | green — regression guard for the same anchor bug across the other JSDoc-emitting paths in `kit_file.rs` |
- **`sibling-symlink`** — both cross-package shapes: `src/barrel.svelte` through
  the package `exports` barrel (#782/#805) and `src/deep.svelte` through a bare
  deep specifier (#1900).

## Burning an entry down

1. Fix the underlying issue.
2. `pnpm run test:svelte-check` — the run reports how many divergences
   disappeared.
3. `pnpm run check-corpus:update` to prune the entries, and delete the
   corresponding section here.

Entries may never be *added* to unblock a change. A new divergence means
rsvelte-check now disagrees with the official checker somewhere it previously
did not, which is the exact failure mode this gate exists to catch.
