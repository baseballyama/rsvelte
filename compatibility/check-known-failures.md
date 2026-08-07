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

## Current baseline: `check-known-failures.json`, 0 entries — full parity

Every scenario agrees with official `svelte-check` diagnostic-for-diagnostic, so
this is a **hard gate**: any divergence at all fails CI. The sections below
document what each scenario is guarding, since a green scenario only earns its
keep by turning red when the thing it covers regresses.

The last three entries were the two resolution-hook cases of #2061, closed by
giving the overlay two ways to answer for a specifier TypeScript's own
resolution routes elsewhere:

- **`ts-companion-named-import-bundler`** — a relative `./widget.svelte` from a
  plain `.ts` file under node10/bundler resolution. TypeScript probes the
  importer's own directory first and finds the user's real `widget.svelte.ts`
  companion there, where official's `svelteSys` answers the very first probe
  (`widget.d.svelte.ts`) with "yes, the component". `paths` never applies to a
  relative specifier and `rootDirs` only offers the mirror after the importer's
  own directory came up empty, so the overlay instead mirrors the importer as a
  blanked *import probe* (`<stem>.rsvelte-import-probe.ts`, everything but the
  hijacked import declarations blanked in place) and re-resolves the import from
  there.
- **`js-rune-module-without-allow-js-nodenext`** — `./lib/counter.svelte` for a
  `counter.svelte.js` with `allowJs` off. The overlay deliberately withholds that
  module's `.d.svelte.ts` bridge (a bridge would forward no names and turn
  official's TS7016 into a wrong TS2614), and ESM-mode resolution substitutes no
  extension, so the specifier reached nothing and TypeScript said TS2307. Having
  withheld the file, the overlay now restates what official reports for it:
  TS7016, or nothing at all when `noImplicitAny` is off.

## Previously: 0 entries / 0 surplus diagnostics — full parity

The gate landed with 16 entries across the #1883–#1889 cluster and was emptied:
`sibling-paths-alias` (#1883, fixed by #1884), `external-self-alias` (#1887, fixed
by #1893), `ts-aliased-import` (#1888, fixed by #1895), `kit-hooks-arrow-ts`
(#1886, fixed by #1892), `kit-hooks-js` (#1886, fixed by #1892 for the
arrow/function-expression form and a follow-up JSDoc-anchor fix for the plain
`export function` form), `sibling-symlink` (#1900, fixed by #1907) and
`boundary-elements` (#1889, fixed by #1906) have all been pruned.

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
- **`ts-aliased-rune-module-nodenext`** — #1942, the intersection the two
  scenarios above each miss by one axis: the rune modules of
  `ts-relative-import-nodenext` reached through the `paths` aliases of
  `ts-aliased-import`. #1916's `.d.svelte.ts` bridge is reachable only via
  `rootDirs`, which TypeScript applies to *relative* specifiers alone, and
  #1888's exact-`paths` overrides enumerated real `.svelte` components alone —
  so `$lib/state.svelte` still fell through to the ambient wildcard. Covers both
  alias kinds (in-workspace `$lib/*` and an aliased sibling package `$libs/*`),
  both importer kinds, and a `.svelte` component whose `.svelte.ts` companion
  must not steal the specifier from it.
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
- **`kit-jsdoc-longtail-js`** — #2108, the two `kit_file.rs` long-tail divergences
  that are observable as diagnostics. A `@type` sharing one line with `@typedef`:
  TypeScript's JSDoc scanner delimits tags at any `@` following whitespace, so
  several tags may share a line and official suppresses the augmentation where a
  line-at-a-time reader injects one. And a rest parameter: it counts towards
  official's `parameters.length` check, but oxc keeps it out of
  `FormalParameters::items`, so `entries(...args)` used to be augmented as if it
  took none (masking official's `TS7019`) and `load = (...args) => …` used to be
  skipped (missing official's `TS2370`).
- **`ts-paths-non-relative`**, **`ts-companion-named-import`**,
  **`js-rune-module-without-allow-js`** — #2061, three ways the overlay used to
  answer a specifier official svelte-check refuses to:
  1. the overlay restates the project's `paths` with absolute targets (it lives
     in a different directory than the config that declared them), which also
     denies TypeScript its own validation of the user's values — the missing
     `TS5090` is replayed by `overlay::paths_option_diagnostics`, positioned in
     the user's config the way `createDiagnosticForOptionPathKeyValue` does it
     and downgraded to a warning the way official downgrades every config
     diagnostic;
  2. a `Foo.svelte.ts` companion's exports used to be folded into the component
     shadow, so a named import through the `.svelte` specifier resolved instead
     of erroring. The companion specifier is re-pointed at the real module
     instead, which keeps #751 working without leaking into the component;
  3. svelte's own declarations carry `declare module '*.svelte'`, which official
     blanks out as it reads the file. rsvelte drives a stock compiler over an
     on-disk overlay, so it emits a blanked copy into the cache dir and
     redirects every module the package declares onto it. Without that, a
     `.svelte` specifier resolving to nothing (or to a `.js` module the program
     excludes) silently typed as a default-only component.

  The named-import case is covered from plain `.ts` importers here; the
  `.svelte`-side importer lives in `svelte-import-diagnostic-line`, which pins
  the source-map half of the same story — svelte2tsx used to emit no segments
  at all for the imports it hoists to the top of the shadow, so every import
  diagnostic in a component landed on line 1 (#2112).

  `ts-paths-non-relative` also pins TypeScript's `${configDir}` template
  (TS 5.5+), which is substituted *before* the check above runs: it must not
  warn, and — since the overlay reads the user's values and restates them in a
  config of its own — it has to expand to the user's project directory rather
  than the cache dir the compiler would otherwise anchor it on. The `include`
  spec uses it too, with an orphan `.ts` file (nothing imports it) as the
  canary: it enters the program through that `include` alone.

  The two arms this cluster used to be divergent on —
  `ts-companion-named-import-bundler` (a *relative* companion-hijacked specifier
  from a plain `.ts` file, answered by the import probe) and
  `js-rune-module-without-allow-js-nodenext` (an ESM-mode specifier landing on a
  withheld `.svelte.js` module, answered by replaying official's TS7016) — are
  described in the baseline section above. Two more scenarios pin the edges
  those two fixes introduce:
  **`ts-companion-named-import-probe-scope`** checks that the probe answers for
  its import declarations and nothing else (the file's unrelated `TS2322` is
  reported once, not twice, and the elided body provokes no `noUnusedLocals`
  complaint), and **`js-rune-module-without-allow-js-loose`** that the replay
  reports *nothing* when `noImplicitAny` is off, which is what official does.
- **`sibling-symlink`** — both cross-package shapes: `src/barrel.svelte` through
  the package `exports` barrel (#782/#805) and `src/deep.svelte` through a bare
  deep specifier (#1900).
- **`svelte-import-diagnostic-line`** — #2112, the position half of the
  named-import cluster: a failing import that is not on the instance script's
  first line, once bare and once behind a leading comment and a blank-line
  group. svelte2tsx hoists instance imports to the top of the shadow, so these
  diagnostics only land on the right line while the hoisted text keeps the
  source-map segments of its original span.
- **`boundary-elements`** — #1889, fixed by #1906: the overlay follows
  `get_global_types` and prefers the installed svelte's `svelte-html.d.ts` over
  the vendored `svelte-jsx-v4.d.ts`, so element and attribute types track
  `svelte/elements` instead of a frozen snapshot. Both arms
  (`<svelte:boundary onerror>` and `<search>`) are the standing canary for the
  next `svelte/elements` addition — a red here means the type environment has
  drifted away from the user's Svelte version again.

## Burning an entry down

1. Fix the underlying issue.
2. `pnpm run test:svelte-check` — the run reports how many divergences
   disappeared.
3. `pnpm run check-corpus:update` to prune the entries, and delete the
   corresponding section here.

Entries may never be *added* to unblock a change. A new divergence at an
existing scenario means rsvelte-check now disagrees with the official checker
somewhere it previously did not, which is the exact failure mode this gate
exists to catch. The only admissible addition is a *new* scenario that documents
a divergence the product already had and cannot fix at its current architecture
— with the reason written down above.
