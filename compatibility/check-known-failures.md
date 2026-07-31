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

## Backend matrix (tsc vs tsgo)

`check-parity` in `corpus-compat.yml` runs this gate twice: `--rsvelte-backend
tsc` (rsvelte-check type-checks with the oracle's own `tsc`, as before) and
`--rsvelte-backend tsgo` (rsvelte-check type-checks with the pinned
`@typescript/native-preview` in `scripts/compat-corpus/check-tsgo` — the other
backend the product ships, `rsvelte-check --tsgo`, previously never exercised
in CI; #1897 Layer 4). The oracle side is unconditionally `tsc`-based in both
legs — only rsvelte-check's own backend switches.

Measured locally across every scenario at the time the matrix landed: **tsc and
tsgo produce byte-for-byte identical diagnostic sets** (down to file/line/code
for every diagnostic in every scenario, `basic` included). Both legs therefore
ratchet against the same `check-known-failures.json` rather than a
backend-specific file — see the `BACKEND`/`KNOWN` comment in
`check-verify.mjs` for the reasoning. If a real tsc/tsgo divergence is ever
found, split the ratchet then (a `.tsgo.json` sibling, same shrink-only +
per-entry-justification convention) rather than papering over it in the shared
file.

## Current baseline: 0 entries / 0 surplus diagnostics — full parity

The gate landed with 16 entries across the #1883–#1889 cluster and is now empty:
`sibling-paths-alias` (#1883, fixed by #1884), `external-self-alias` (#1887, fixed
by #1893), `ts-aliased-import` (#1888, fixed by #1895), `kit-hooks-arrow-ts`
(#1886, fixed by #1892), `kit-hooks-js` (#1886, fixed by #1892 for the
arrow/function-expression form and a follow-up JSDoc-anchor fix for the plain
`export function` form), `sibling-symlink` (#1900, fixed by #1907) and
`boundary-elements` (#1889, fixed by #1906) have all been pruned.

Every scenario now agrees with official `svelte-check` diagnostic-for-diagnostic,
so this is a **hard gate**: any divergence at all fails CI. The sections below
document what each scenario is guarding, since a green scenario only earns its
keep by turning red when the thing it covers regresses.

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
- **`ts-relative-import-nodenext`**, **`ts-relative-import-bundler`** — #1916, the
  *relative* counterpart of `ts-aliased-import`: one source tree checked under
  both module-resolution modes. The `nodenext` arm is the failing axis (ESM-mode
  resolution adds no implicit extension, so `./x.svelte` only ever probes
  `./x.d.svelte.ts` and everything else fell through to the ambient `*.svelte`
  wildcard); the `bundler` arm guards the precedence shift the fix introduces,
  since the emitted `.d.svelte.ts` bridge is now probed *before* the
  `.svelte.tsx` shadow and has to carry the same types. Both arms cover a
  component, a generic component and two `.svelte.ts` rune modules (one with a
  default export), imported from a plain `.ts` barrel and from a `.svelte` file.
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
- **`boundary-elements`** — #1889, fixed by #1906: the overlay follows
  `get_global_types` and prefers the installed svelte's `svelte-html.d.ts` over
  the vendored `svelte-jsx-v4.d.ts`, so element and attribute types track
  `svelte/elements` instead of a frozen snapshot. Both arms
  (`<svelte:boundary onerror>` and `<search>`) are the standing canary for the
  next `svelte/elements` addition — a red here means the type environment has
  drifted away from the user's Svelte version again.

## Burning an entry down

Kept for the next time the baseline is non-empty (a new scenario lands red, say):

1. Fix the underlying issue.
2. `pnpm run test:svelte-check` — the run reports how many divergences
   disappeared.
3. `pnpm run check-corpus:update` to prune the entries, and delete the
   corresponding section here.

Entries may never be *added* to unblock a change. A new divergence means
rsvelte-check now disagrees with the official checker somewhere it previously
did not, which is the exact failure mode this gate exists to catch.
