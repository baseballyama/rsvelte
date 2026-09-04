# Known-failure ratchets — per-entry justification

This file is the consolidation of what used to be one Markdown file per ratchet.
Each former file is an anchored section below; the anchor is the former filename's
stem, which is what `known-failures-md-check.mjs` and `deliberate-divergences-check.mjs`
resolve. Do not rename an anchor — they are machine-facing.

| section | was |
|---|---|
| [`check-e2e-known-failures`](#check-e2e-known-failures) | `compatibility/check-e2e-known-failures.md` |
| [`check-known-failures`](#check-known-failures) | `compatibility/check-known-failures.md` |
| [`css-prune-known-failures`](#css-prune-known-failures) | `compatibility/css-prune-known-failures.md` |
| [`dual-run-known-failures`](#dual-run-known-failures) | `compatibility/dual-run-known-failures.md` |
| [`error-known-failures`](#error-known-failures) | `compatibility/error-known-failures.md` |
| [`fmt-known-failures`](#fmt-known-failures) | `compatibility/fmt-known-failures.md` |
| [`fmt-oracle-excluded`](#fmt-oracle-excluded) | `compatibility/fmt-oracle-excluded.md` |
| [`known-failures`](#known-failures) | `compatibility/known-failures.md` |
| [`lint-adversarial-end-known-failures`](#lint-adversarial-end-known-failures) | `compatibility/lint-adversarial-end-known-failures.md` |
| [`lint-adversarial-fix-all-known-failures`](#lint-adversarial-fix-all-known-failures) | `compatibility/lint-adversarial-fix-all-known-failures.md` |
| [`lint-adversarial-fix-known-failures`](#lint-adversarial-fix-known-failures) | `compatibility/lint-adversarial-fix-known-failures.md` |
| [`lint-adversarial-known-failures`](#lint-adversarial-known-failures) | `compatibility/lint-adversarial-known-failures.md` |
| [`lint-adversarial-suggest-known-failures`](#lint-adversarial-suggest-known-failures) | `compatibility/lint-adversarial-suggest-known-failures.md` |
| [`lint-conditions-known-failures`](#lint-conditions-known-failures) | `compatibility/lint-conditions-known-failures.md` |
| [`lint-env-known-failures`](#lint-env-known-failures) | `compatibility/lint-env-known-failures.md` |
| [`lint-known-failures`](#lint-known-failures) | `compatibility/lint-known-failures.md` |
| [`lint-preset-known-failures`](#lint-preset-known-failures) | `compatibility/lint-preset-known-failures.md` |
| [`lint-severity-known-failures`](#lint-severity-known-failures) | `compatibility/lint-severity-known-failures.md` |
| [`lsp-known-failures`](#lsp-known-failures) | `compatibility/lsp-known-failures.md` |
| [`matrix-known-failures`](#matrix-known-failures) | `compatibility/matrix-known-failures.md` |
| [`mutation-known-failures`](#mutation-known-failures) | `compatibility/mutation-known-failures.md` |
| [`parse-ast-known-failures`](#parse-ast-known-failures) | `compatibility/parse-ast-known-failures.md` |
| [`parse-known-failures`](#parse-known-failures) | `compatibility/parse-known-failures.md` |
| [`parse-oracle-excluded`](#parse-oracle-excluded) | `compatibility/parse-oracle-excluded.md` |
| [`scss-known-failures`](#scss-known-failures) | `compatibility/scss-known-failures.md` |
| [`sourcemap-known-failures`](#sourcemap-known-failures) | `compatibility/sourcemap-known-failures.md` |
| [`sourcemap-oracle-excluded`](#sourcemap-oracle-excluded) | `compatibility/sourcemap-oracle-excluded.md` |
| [`svelte2tsx-fixtures-known-failures`](#svelte2tsx-fixtures-known-failures) | `compatibility/svelte2tsx-fixtures-known-failures.md` |
| [`svelte2tsx-known-failures`](#svelte2tsx-known-failures) | `compatibility/svelte2tsx-known-failures.md` |
| [`svelte2tsx-map-known-failures`](#svelte2tsx-map-known-failures) | `compatibility/svelte2tsx-map-known-failures.md` |
| [`svelte2tsx-unparseable-known-failures`](#svelte2tsx-unparseable-known-failures) | `compatibility/svelte2tsx-unparseable-known-failures.md` |
| [`validator-known-failures`](#validator-known-failures) | `compatibility/validator-known-failures.md` |
| [`validator-message-known-failures`](#validator-message-known-failures) | `compatibility/validator-message-known-failures.md` |
| [`validator-message-not-comparable`](#validator-message-not-comparable) | `compatibility/validator-message-not-comparable.md` |
| [`warning-known-failures`](#warning-known-failures) | `compatibility/warning-known-failures.md` |
| [`warning-message-known-failures`](#warning-message-known-failures) | `compatibility/warning-message-known-failures.md` |

<a id="check-e2e-known-failures"></a>

## check-e2e-known-failures.json — why entries are accepted (svelte-check e2e parity)

The **Layer 2** svelte-check parity gate
(`scripts/compat-corpus/check-e2e-verify.mjs`, #1897) runs both the official
`svelte-check` (pinned in `scripts/compat-corpus/check-oracle`) and
`rsvelte-check` over **real project trees** — pinned submodules with their own
installed `node_modules`, their own `tsconfig` chain and, for the monorepo, real
cross-package resolution — and records every diagnostic that appears on exactly
one side. The ratchet may only shrink.

Layer 1 (`compatibility/check-known-failures.md`) is at full parity on committed
mini-projects. Layer 2 exists because every one of #1883–#1889 was found by
pointing the checker at somebody's actual repository, and none of them by a
fixture: a synthetic project only contains the shapes its author already thought
of. One afternoon of real trees produced four clusters, all four now fixed.

Entry format: `<project>/<unit>|<+|-><SEVERITY> <relpath>:<line> <code>[ xN]`.
`+` = rsvelte-only (a **false positive** — official reports nothing).
`-` = official-only (a **false negative**).
`xN` is the multiplicity of the surplus (diagnostics are compared as a multiset,
so several diagnostics sharing one key cannot mask each other). Column and
message text are not part of the key — see the header of `check-verify.mjs`.

### Units

| Unit | What it is | Why it is in the corpus |
|---|---|---|
| `cmsaasstarter/app` | [CMSaasStarter](https://github.com/CriticalMoments/CMSaasStarter), a single-package SvelteKit SaaS starter (npm, `patch-package`, Supabase/Stripe) | Real SvelteKit route tree: `+page.server.ts`, `+server.js` under `checkJs`, route groups (`(admin)`, `(marketing)`), generated `$env` ambients |
| `skeleton/playground` | `playgrounds/skeleton-svelte` of [skeletonlabs/skeleton](https://github.com/skeletonlabs/skeleton) — a SvelteKit app inside a pnpm workspace | Cross-package resolution: imports two **sibling workspace packages** whose `exports` point at the sibling's `src/index.ts`, so sibling `.svelte`/`.ts` sources really enter the program |
| `skeleton/library` | `packages/skeleton-svelte` of the same monorepo — 300+ components | The library the playground resolves into: `.ts` barrels re-exporting types out of `<script module>`, `.svelte.ts` rune modules, `$props.id()` |

### Current baseline: `check-e2e-known-failures.json`, 0 entries / 0 surplus diagnostics — full parity

The gate landed with 404 entries across four clusters and is now empty. Every
unit agrees with official `svelte-check` diagnostic-for-diagnostic, so this is a
**hard gate**: any divergence at all fails CI. What each cluster was, and what
fixed it:

- **E1** (372 entries, `TS2614`) and its downstream **E3** (1 entry, `TS7006`) —
  fixed by #1916. Relative `.svelte`-suffixed specifiers fell through to the
  ambient `declare module "*.svelte"` wildcard because ESM-mode module resolution
  (`moduleResolution: nodenext` in a `"type": "module"` package, which is what
  `skeleton/library` uses) adds no implicit extension: the sole candidate
  TypeScript probes for `./x.svelte` is `./x.d.svelte.ts`, so neither the
  `.svelte.tsx` shadow nor a real `x.svelte.ts` rune module was ever reached. The
  overlay now emits that `.d.svelte.ts` bridge for both. Layer 1's
  `ts-relative-import-{nodenext,bundler}` fixtures guard it.
- **E2** (30 entries, `TS2448`) — fixed by #1917. `svelte2tsx` emitted a store
  auto-subscription for `$props` in a component that also declares a local
  `props`, putting the use before the binding.
- **E4** (1 entry ×2, `TS7031`) — fixed by #1918. `kit_file.rs`'s route-handler
  matcher now accepts `ArrowFunctionExpression` / `FunctionExpression` alongside
  `FunctionDeclaration`, mirroring official svelte2tsx's `sveltekit.ts`.

The units stay in CI: an empty ratchet is what makes the gate load-bearing, since
a regression in any of these paths now turns it red instead of merely growing a
baseline.

### Findings that are deliberately NOT in this ratchet

- **`--workspace <relative>` mis-rewrites escaping relative imports.** With a
  relative `--workspace` (e.g. `--workspace .`, which Layer 1's harness passes),
  `rewrite_external_imports` emits one `../` too many for any relative specifier
  that climbs out of its directory, producing false-positive `TS2307`s (9 of them
  on cmsaasstarter). Root cause: `relative_posix`
  (`crates/rsvelte_projection/src/svelte2tsx/helpers/rewrite_external_imports.rs`)
  filters empty path components but not `"."`, so a leading `./` counts as a real
  directory; and with a relative workspace `is_within_dir` also stops recognising
  in-workspace targets, so the rewrite fires where it should not. Layer 2 runs
  both checkers exactly the way the projects' own `check` scripts do — from the
  package directory, `--tsconfig ./tsconfig.json`, no `--workspace` — so this does
  not appear here. Fixed by #1938 (`--workspace` is now absolutized at
  `runner::run`'s entry point, and `relative_posix` skips `.` segments).

### Enrolling skeleton in the compile corpus

`submodules/skeleton` is now also a compile-corpus source
(`scripts/compat-corpus/corpus-sources.json`, #1924), so its ~700 `.svelte` /
`.svelte.(js|ts)` files feed the compiler, svelte2tsx, fmt and lint ratchets too.
Cluster E2 showed why it was worth doing: it was a `.tsx`-text divergence, so the
svelte2tsx track would have caught it natively (upstream's own
`props-variable-and-$props.id*` samples did, once that fixture ratchet existed).

The submodule is still **not** in `auto-update-submodules.yml`. This ratchet keys
on line numbers in skeleton's sources, so an automatic weekly bump would turn CI
red with pure churn; the pin moves only with a deliberate re-baseline.

### Burning an entry down

1. Fix the underlying issue.
2. `pnpm run test:svelte-check-e2e` — the run reports how many divergences
   disappeared.
3. `node scripts/compat-corpus/check-e2e-verify.mjs --update` to prune the
   entries, and update the cluster section here.

Entries may never be *added* to unblock a change. A new divergence means
rsvelte-check now disagrees with the official checker on a real project somewhere
it previously did not, which is the exact failure mode this gate exists to catch.

<a id="check-known-failures"></a>

## check-known-failures.json — why entries are accepted (svelte-check parity)

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

### Backend matrix (tsc vs tsgo)

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

### Current baseline: `check-known-failures.json`, 0 entries — full parity

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

### Previously: 0 entries / 0 surplus diagnostics — full parity

The gate landed with 16 entries across the #1883–#1889 cluster and was emptied:
`sibling-paths-alias` (#1883, fixed by #1884), `external-self-alias` (#1887, fixed
by #1893), `ts-aliased-import` (#1888, fixed by #1895), `kit-hooks-arrow-ts`
(#1886, fixed by #1892), `kit-hooks-js` (#1886, fixed by #1892 for the
arrow/function-expression form and a follow-up JSDoc-anchor fix for the plain
`export function` form), `sibling-symlink` (#1900, fixed by #1907) and
`boundary-elements` (#1889, fixed by #1906) have all been pruned.

### Scenarios with no entries

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

### Burning an entry down

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

<a id="css-prune-known-failures"></a>

## css-prune-known-failures.json — why entries are accepted

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

Current baseline: `css-prune-known-failures.json`, 0 entries.

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

### Fixed root causes

The history below is kept as the record of why the ratchet could shrink.

#### 1. `<svelte:head>` void-element perturbation — FIXED (issue #1700)

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

#### 2. `:global(.a) + .b` inside `{#await}` / snippet — FIXED (issue #1702)

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

#### 3. Nested `.a { & + & {} }` sibling combinator — FIXED (issue #1703)

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

#### 4. Outer rule of an unused nest, warning-only — FIXED (issue #2474)

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

#### 5. Five selector-shape families — FIXED (issue #2535)

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

#### Known limitation: combinators inside a resolved compound (issue #1719)

The #1702/#1703 resolution above only fires for a **single-relative** selector.
A combinator inside the resolved compound — `:global(.a .z) + .b`, or a
multi-relative parent like `.foo > .a { & + & }` — carries an ancestor/child
constraint the compound-only matcher can't verify, so it is intentionally left
unresolved (erring toward over-pruning, never over-keeping). This is a
pre-existing limitation of the transform's dom-structure prune heuristic, not a
regression from this PR, and is tracked in issue #1719.

### How to run

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

<a id="dual-run-known-failures"></a>

## Dual-run known failures

`dual-run-known-failures.json` holds **0 entries**.

### What this ratchet gates

Every ported Phase-3 client pass has two implementations — the collect-and-splice
text path it started as, and the in-place `&mut Program` path that replaced it.
`ast_rewrite::dual_run::resolve` picks between them from `RSVELTE_AST_SPLICE`,
which is a process-wide `LazyLock` over the environment. So when the two
implementations disagree, **the compiler's byte output depends on an environment
variable**, and no test that goes through the public entry point can see it: one
process only ever exercises one of the two.

`crates/rsvelte_devtools/tests/dual_run_gate.rs` runs both implementations over
every official `.svelte` fixture, for `client` and `client-dev`, and lists the
`(fixture, pass)` pairs whose two sides survive esrap normalisation still
differing. The list may only shrink; an entry that starts passing fails the gate
too, so the fix and the re-baseline land together.

#### What it cannot see

The comparison is `esrap(parse(x))` on each side, so anything that round-trip
cancels is invisible here — most of all **whitespace and line breaks**. It is
also scoped to passes routed through `dual_run::resolve`; a pass with only one
implementation has nothing to compare and is absent from the denominator rather
than passing.

### Entries

None. The last divergence was removed by modelling the location-less arrow body
that upstream synthesizes for a reactive destructuring assignment. That body
exhausts esrap's comment cursor, so both store-assignment implementations now
receive the same official-compatible comment stream instead of attaching the
otherwise-dead comments to different generated nodes.

<a id="error-known-failures"></a>

## Error-parity known failures

Companion to `known-failures.md` and `warning-known-failures.md`, for the
**compile error** half of the corpus gate.

`scripts/compat-corpus/compile.mjs` records every compile failure as
`(code, message, start, end, frame)` in `error.json` beside the output;
`verify.mjs` compares them and ratchets four failure modes independently. Every
ratchet is shrink-only and two-sided: an unlisted entry that diverges fails CI,
and a listed entry that has started passing fails CI too.

Regenerate after a change that moves compile errors:

```
node scripts/compat-corpus/verify.mjs --no-fmt --update-error-baseline
```

`--update-error-baseline` touches **only** these sixteen files, never the output
or warning ratchets — error comparison needs no oxfmt normalization, so it is
valid under `--no-fmt`, which the output comparison is not.

Every one of these comparisons scores `match` when there is nothing to compare,
so the verdicts alone cannot tell "rsvelte agrees" from "no error survived to be
compared". `verify.mjs` therefore prints the size of the compared population
beside the counts, records it in `report.json` as `errorComparedPairs`, and
refuses `--update-error-baseline` when it is zero. See *What an absent artifact
scores* below.

### Why this gate exists

The output verdict has always known whether both compilers *rejected* an entry
and whether the error `code` agreed. It knew nothing else: `errorInfo` recorded
the first message line but `verify.mjs` never read it back, and no `start`/`end`
was captured on either side (#2446). So an error with the right code at the
wrong position, or with prose naming the wrong construct, scored `error-parity`
— a passing verdict.

The size of that blind spot is measured, not assumed. Over the 14,179-entry
corpus, 948 entries are rejected by both compilers, giving 2,843 `(id, target)`
pairs with two errors to compare. Per compared field, **as first measured** — the
current backlog is the entry counts under *Why the per-target files are
near-identical*, and the shape of the burn-down is recorded per section below:

| compared field | diverging pairs | diverging ids (client) |
|---|---|---|
| `code` (pre-existing) | **0** | 0 |
| `message` | 362 | 121 |
| `start` `(line, column)` | 678 | 226 |
| `end` `(line, column)` | 729 | 243 |
| `frame` | 15 → **0** | 5 → **0** |

The `code` row is the point. It is saturated — not one pair in 2,843 disagrees —
so growing the corpus could never have moved this gate, while every other row was
diverging the whole time. The `frame` row is stated as a transition because the
comparison that first ran it found a single renderer defect and this PR fixed it;
see *Error frames* below for why 0 there is "saturated" and not "unenrolled".

Nor do the fixture suites cover it. 33 of the 121 message divergences and 120 of
the 403 position divergences are
`svelte/packages/svelte/tests/compiler-errors/samples/…` — entries the
145/145-passing Compiler Errors suite compiles. That suite *parses* the sample's
expected `message` and `position`, then asserts only `error_code_matches`
(`crates/rsvelte_core/tests/compiler_errors.rs:272`); the parsed `message` field
is `#[allow(dead_code)]`. So those 153 divergences were being compiled by a green
test and compared on the one field that agrees.

### Why the four ratchets are split

Same argument as `warning-known-failures.md`. Wrong prose is a semantic bug
fixed one message string at a time; a wrong span is one systemic cause (raising
sites that never thread the triggering node through). Folded together, the
larger span backlog would hide every semantic regression behind it.

`end` is separate from `start` for a reason that is measured rather than argued
by analogy: **an entry listed for one suppresses everything about that entry**,
so folding `end` into the `start` ratchet would silently absorb the 51 pairs /
**17 ids that diverge on `end` while `start` agrees**. Those 17 are the entries
where the error points at the right place and underlines the wrong amount of
code — the only ones a user could not diagnose from the message. They are 7% of
the `end` population and 100% of what the fold would cost.

`frame` is the one comparison that is deliberately **chained**, and for the
opposite reason to the others: upstream derives it from `start.line` and
`end.column` alone (`compile_diagnostic.js:72`), so an unchained `frame`
comparison would be a third restatement of the two span comparisons rather than a
new question. Gated on both endpoints agreeing, it can only see the renderer —
the line window, the tab expansion and the caret column.

Message, `start` and `end` are compared **independently** of each other — unlike
warning positions, which are only compared once the codes agree. There is exactly
one error per entry and target, so there is no pairing problem that would require
chaining, and chaining would mean a PR that fixes a message surfaces a "new"
position failure that was merely masked.

All four comparisons are skipped when the two codes differ: the message and span
of two unrelated errors say nothing, and the code divergence is an
`error-mismatch` on the output ratchet already.

### Why the per-target files are near-identical

`error-message-known-failures.client.json` holds 0 entries;
`error-message-known-failures.client-dev.json` holds 0 entries;
`error-message-known-failures.server.json` holds 0 entries; and
`error-message-known-failures.server-dev.json` holds 0 entries. All four of
`error-position-known-failures.<target>.json` hold 0 entries, all four of
`error-end-known-failures.<target>.json` hold 0 entries, and all four of
`error-frame-known-failures.<target>.json` hold 0 entries. The wave-2 enrolment
(#3176) added 1 message, 16 position and 24 end entries — and **no frame entries
at all**, which keeps that comparison's population saturated at 0 across a corpus
that more than doubled. The counts above are the re-measurement against the tree
this branch was rebased onto (message 18/17 → 13/12, position 99 → 81, end
128 → 101); the current population is **34,601 entries and 5,138 both-reject
`(id, target)` pairs**, against the 14,179 / 2,843 the table above was first
measured on. Almost every
compile error is raised in Phase 1/2, before the target is consulted, so a
divergence shows up on all four targets at once. Expect the sixteen files to move
together in a burn-down PR.

The malformed-markup position pass then retired 6 position and 12 end entries
per target, and the block-header pattern pass retired another 6 position and 2
end entries. The scoped-store diagnostic pass retired another 10 position and 10
end entries by attaching the offending `$name` identifier range. The detailed
shape partitions below remain the measured snapshot
from before those passes; they are historical evidence about the backlog's shape,
not a decomposition of the current files, which are now empty.

The former client-only asymmetry is gone from the current corpus population, so
all four files now carry no message entries.

### Error messages

The codes agree; the prose does not. This is not tolerated as "upstream rewords
things on a minor bump": both compilers run on the same source, in the same
process, at the pinned version, so a difference here is rsvelte's — the argument
settled for warning text in #2403.

Clustered by code (client target, 0 entries):

- **Former `js_parse_error` cluster — 2 entries retired.** The Svelte code is right, but the
  text is oxc's parser message (`Expected `,` or `}` but found `+`) where upstream
  forwards acorn's (`Unexpected token`). This is the one cluster whose fix is not a
  string edit: the two parsers phrase their own diagnostics, and rsvelte's text is
  often the *more* informative of the two. Listed as a divergence rather than
  silently normalised, so the decision to keep or converge stays explicit. Five
  entries retired from this cluster at once: four were the semicolon-free and
  end-of-input shapes #3200/#3206 aligned, and `illegal-expression` was #3220 —
  acorn's `Assigning to rvalue`, which OXC's own `invalid_assignment` diagnostic
  had been pre-empting. Two more retired in #3317/#3319: the `(…)` this port
  wraps a template expression in to hand it to OXC has diagnostics of its own
  (`()`, a trailing comma, an arrow parameter list) that acorn — parsing the body
  unwrapped — never sees, and the body is now re-probed unwrapped when one of
  them fires.
  The template-expression strict-mode escape then retired separately: OXC had
  already recovered the string-literal AST, but its generic lexer diagnostic
  pre-empted the existing acorn-compatible `Octal literal in strict mode`
  check. Recovered AST restrictions now win only when they occur no later than
  OXC's first reported position.
  The top-level `return` fragment from the attachments tutorial retired as the
  fixed-message case: both parsers reject it at the same byte, and the program
  diagnostic adapter now translates OXC's wording to acorn's
  `'return' outside of function`.
  The incomplete `{let }` declaration tag retired by handling acorn's bare
  reserved-word error before OXC's generic incomplete-declaration diagnostic.
  The object-pattern rest-comma fixture retired through the exact diagnostic
  adapter: OXC and acorn reject the same grammar error at the same parse site,
  but acorn reports `Comma is not permitted after the rest element`.
  The two reserved-word binding patterns retired together: the adapter uses
  OXC's keyword label for an array pattern and walks back from its missing-colon
  label to an object shorthand property, matching both acorn's contextual text
  and its point position.
  The malformed snippet-header entry retired separately: the parameter scanner
  now preserves upstream's required `)` diagnostic at the trimmed end of the
  component instead of falling through to the outer `}` check.
  The final two entries retired together by adapting OXC's expected-delimiter
  diagnostics to acorn's `Unexpected token`: one malformed object expression
  in a template and one TypeScript annotation in a plain-JavaScript snippet
  parameter list.

### Error positions

The codes agree; `start` does not. An editor, a Vite overlay and `rsvelte-check`
all place the diagnostic from `start`, so a wrong one points the user at the
wrong code.

By shape (client target, 92-entry measurement snapshot), classified from the run's own
`error.json` records rather than by subtracting from the previous baseline:

- **29 — rsvelte reports no span at all.** The raising site constructs
  `AnalysisError::validation(...)` instead of `validation_at(...)`, so
  `start`/`end` are `None` and the JS error carries no `start` property. This is
  the same structural gap `validator-known-failures.md` tracks, and the two burn
  down together — one `validation_at` call per raising site.
- **35 — same line, different column.** A span exists but is narrowed or widened
  wrongly (e.g. `expected_token`, `attribute_empty_shorthand`).
- **28 — different line entirely.** The worse symptom of the same defect: a
  plausible but wrong location. `date-picker-svelte/src/lib/DateInput.svelte`
  reports 296:0 where upstream reports 262:11 — 34 lines off, and column 0 means
  the squiggle lands on the indentation of an unrelated statement.

The shrink from 226 is **entirely inside the no-span cluster** — 174 → 29 — and
the different-line cluster has not grown. That is the shape a
span-attachment change should have, and it is worth stating because the failure
mode it rules out is the one `validator-known-failures.md` names: a fallback that
lands a *plausible wrong* span in place of none would have moved entries from
no-span into different-line, shrinking the count while making the diagnostics
worse. It did not.

Clustered by code, the largest are `expected_token` (19: 12 different-line, 7
same-line), `css_expected_identifier` (16, all different-line), `js_parse_error`
(16, all same-line), `store_invalid_scoped_subscription` (10, all no-span),
`block_invalid_continuation_placement` (6, all same-line), then
`attribute_empty_shorthand` (3) —
followed by a long tail with one raising site each, which is why this is a
per-site burn-down and not one edit.

### Error end positions

The codes agree; `end` does not, so the diagnostic underlines the wrong amount of
code. The canonical shape is `<div a="1" a="2">`, where `attribute_duplicate`
reports `position: [11, 12]` against upstream's `[11, 16]` — the right start, one
character of highlight instead of the whole attribute.

Partition of the measured error-end snapshot by shape (client target,
classified from the run's own `error.json` records):

- **29 — rsvelte reports no `end` at all.** The same `validation(...)` vs
  `validation_at(...)` raising sites the `start` ratchet's no-span cluster names;
  these two clusters burn down together, one call per site. It is the same 29
  entries, which is what "one call per site" predicts.
- **50 — same line, different column.** A span exists and stops in the wrong
  place. This is the cluster the `start` ratchet cannot reach, and it is still the
  largest: attaching a span fixes `start` and leaves `end` free to be wrong.
- **33 — different line entirely.** A multi-line construct whose closing node was
  not threaded through.

Neither the wave-2 enrolment nor the rebase re-measurement moved the *shape* of
this backlog — all three clusters move together, which is the answer to "did new
repositories find a new shape of span defect, or more instances of the three we
had?" — more instances.

**20 of the 112 diverge on `end` while `start` agrees** (15 same-line, 5
different-line). Those are the ones that would have been invisible had `end` been
folded into the `start` ratchet, and they are the argument for the split: an
entry already listed suppresses everything about that entry.

### Error frames

Both endpoints agree, and the rendered code frame does not — which under the
chaining above can only be the renderer.

`error-frame-known-failures.<target>.json` holds **0 entries, and that 0 is
saturated, not unenrolled.** The comparison inspects **2,114 of the 2,843
both-reject pairs** (the ones whose `start` and `end` both agree), 2,112 of which
carry a frame on both sides and 2 of which carry one on neither; no pair has a
frame on exactly one side. Its first run reported **15 pairs / 5 ids** diverging,
all one cause: `tabs_to_spaces_column` computed the caret column as
`leading_tabs + column` with no upper bound, while upstream measures
`tabs_to_spaces(line.slice(0, column)).length`, which saturates at the line's own
length. The caret column comes from `end`, which for a multi-line construct sits
past the end of the `start` line the frame quotes, so every affected frame put the
caret one column too far right. Fixed in the same PR that added the comparison,
which is why the enrolled baseline is 0 — the 15 pairs are the evidence that the
comparison can move, and `frame_caret_stops_at_the_end_of_the_quoted_line`
(`crates/rsvelte_core/src/compiler/mod.rs`) is the unit-level control.

### What an absent artifact scores

Every comparison here reads `expected/<id>/error.json` and `actual/<id>/error.json`
and skips the pair when either is missing, so a **missing artifact scores
`match`** — a run against a half-swept tree reports 100% error parity rather than
failing, and `--update-error-baseline` would then write twelve empty ratchets.
Measured on a real half-swept tree: with `expected/` gone and `actual/` intact,
the comparison scored **0 pairs compared, 14,179/14,179 entries `match`**.

Three things now stand between that state and a verdict. `verify.mjs` requires,
**per tree** rather than on the union of the two, that every manifest entry carry
either `<target>.js` or that target's key in `error.json` for **every** selected
target — the exact invariant `compile.mjs`'s `writeOutputs` establishes. It prints
the compared-pair count beside the verdicts and stores it in `report.json`. And
`--update-error-baseline` refuses outright when that count is zero.

### What these four ratchets still do not see

- **Entries only one side rejects.** Those are `error-mismatch` on the output
  ratchet; there is no second error to compare against.
- **The `character` offset and `filename`.** Only `(line, column)` is compared
  for each endpoint, and `filename` is not captured at all.
- **`frame` where the endpoints already diverge.** 729 of the 2,843 pairs are
  outside the frame comparison's population by construction; their frames are
  wrong *because* their spans are, and they are counted once, under `start` or
  `end`.
- **Every NAPI entry except `compile` / `compileBoth` / `compileModule` /
  `compileWithCssHash`.** The corpus drives the first three and this PR converted
  the fourth, but `compileEnvelope*` — which is what `@rsvelte/vite-plugin-svelte`
  actually calls for `compile()` and for `compileAsync()` without a `cssHash` —
  still surfaces a failure as a Rust `Debug` string with no `code`/`start`/`end`.
  The corpus cannot see that: it calls the legacy entries.

<a id="fmt-known-failures"></a>

## fmt-known-failures.json — why entries are accepted

The formatter-parity corpus formats every `.svelte` component with both
`rsvelte-fmt` and the `oxfmt(svelte:true)` oracle (prettier-plugin-svelte for the
Svelte structure, oxc for embedded JS, and PostCSS for embedded CSS) and requires
**byte-identical** output. rsvelte-fmt uses in-process `oxc_formatter_css` for
embedded CSS by default, so the ratchet intentionally includes CSS-engine parity
as well as Svelte-structure parity. The ratchet may only shrink.

**Current baseline: `fmt-known-failures.json`, 524 entries.** The 789-entry
split this paragraph used to give (22 pre-enrolment + 766 expanded population + 1
pattern-corpus repro) no longer holds: 239 entries left the ratchet in the
2026-09-01 re-baseline, and the CI report the baseline is derived from carries a
first-differing-line signature per entry but not which corpus generation it came
from, so the three-way split cannot be recomputed without the oracle trees.
Oracle-bug / invalid-input / migrate cases are NOT here — those are permanently
excluded in `fmt-oracle-excluded.json` (see `fmt-oracle-excluded.md`).

**The two halves are justified to different standards, and the difference is the
point.** Each of the original **22** was individually diffed against its oracle
to confirm the cluster it belongs to; none is a guess from file-name
pattern-matching. The 17 `skeleton/…` entries are the seed set from enrolling
`submodules/skeleton` in the corpus (#1924); each was reduced to a standalone
minimal repro before being filed into a cluster (9 into the new Cluster 9, 2 into
the new Cluster 10, the other 6 into existing Clusters 1/2/3). Entries in the
expanded population are clustered **mechanically**, by a rule over the report's
own `expected`/`actual` strings (Clusters 20-27 below) — *not* individually
diffed. Do not read a wave-2 cluster as a reviewed diagnosis: it is a bucket, and
one example per bucket was inspected by hand.

An id that carries two clusters' divergences at once is filed under its dominant
one (see *Multiple clusters per id*), so the per-cluster counts below remain a
partition of the ratchet rather than an over-count:

Partition of `fmt-known-failures.json` by cluster: `246 + 212 + 15 + 36 + 13 + 1 + 1`

**The partition is now the mechanical rule applied to all 524 entries**, where it
used to be the hand-diagnosed Clusters 1-12 (23 entries) plus the mechanical
Clusters 20-27 over the rest. The hand-diagnosed sections below are kept — their
diagnoses did not stop being true — but their ids are now counted inside the
mechanical buckets, because the CI report names an entry's first differing line
and not the cluster a human filed it under. The addends are, in order:
20 breaks-later 246, 21 breaks-earlier 212, 22 intra-line-ws 15,
23 indent-only 36, 24 other 13, 25 extra-line 1, 26 missing-line 1;
27 quote-style is now empty.

**21 entries left in #4191** — 11 from **20 — breaks-later** and 10 from
**23 — indent-only** — when a `<script>` body stopped being formatted at a
narrowed width and re-indented as text, and became a Doc under
`indent([hardline, body])` the way the oracle builds it. The two clusters are one
mechanism: narrowing the width and indenting the text agree with a real `indent`
on where the budget is, and disagree on where it is *measured*, which shows up
either as a break in the wrong place or as a line at the wrong column. Their
clusters were measured on the `origin/main` arm — on the fix arm all 21 are
`IDENTICAL-NOW` and carry no cluster.

The same change retired an `fmt-oracle-excluded.json` entry, and the interesting
part is that its stated **reason was wrong**, not merely lapsed.
`flowbite-svelte/…/builder/range/+page.svelte` was filed `engine-divergence` —
"oxc vs prettier template-literal `${}` substitution indentation inside
`<script>` … rsvelte delegates to `oxc_formatter`. Upstream oxc-alignment item" —
so it was booked as neither side's defect and pointed at oxc. It is rsvelte's:
the divergence is `indent-only` at line 69 on the `origin/main` arm
(`  labelStatus` against `    labelStatus`) and disappears against **the same
`oxc_formatter`** once the body is handed over as a Doc under `indent`. A uniform
offset (the reason records "8/10 by the oracle vs 4/6 by oxc") is the signature of
a re-indent, not of a break heuristic. Excluded count 26 → 25; the
`engine-divergence` bullet naming it is deleted.

`sparrow-app/…/text-upload/TextUpload.svelte` and
`sparrow-app/…/request-navigator/RequestNavigator.svelte` left
**21 — breaks-earlier** in #4187. Both are block headers whose expression exceeds
`LineWidth::MAX = 320` (338 and 344 columns), which is a width OXC cannot be asked
for, so it broke a logical chain the oracle keeps on one line; `removeLines`
rejoins it. Their cluster was measured on the `origin/main` arm — on the fix arm
they classify as `IDENTICAL-NOW` and carry no cluster at all.

`headscale-ui/…/DeviceTags/NewDeviceTag.svelte` left **20 — breaks-later** and
`sveltepress/…/icons/logos/Bun.svelte` left **23 — indent-only** in #4151; both
were the leading-comment hug above, which is why the same fix moves a
close-bracket decision and an indent width.

`svelte-inspect-value/packages/svelte/src/lib/CustomLine.svelte` left
**24 — other** in #4062: its only differing line was
`type={(type) as unknown as ValueType}` against the oracle's `type={type as …}`,
which no rule above matches (not a prefix, not whitespace- or quote-equal). It is
the one entry that fix moves, out of 34,686 real components whose output was
diffed across the change.

### Wave-2 enrolment (#3176) — Clusters 20-27

The corpus went from 37 to 104 corpus sources, and the formatter-parity set
with it. The current run has **33,483 included components, 32,667 matched, 787
failing** (29 excluded, 239 skipped) — those five numbers are the CI report as it
stood *before* the 2026-08-31 reclassification below, which moves one id out of
`excluded` and into this ratchet without changing what the two formatters emit. The original enrolment added 764 entries
from the 67 new repositories; later submodule and pattern-corpus updates moved
that expanded-population residue to 765. At enrolment time 51 repositories
contributed at least one; sparrow-app
(104), open-webui (93), carbon-components-svelte (80) and svelte-commerce (73) are
46% of the new half between them.

**This baseline is a Linux CI run** (`corpus-compat.yml`, the `corpus-fmt-report`
artifact), per the *Cross-platform baseline rule* at the end of this file. A macOS
run of the same tree reported **865** new failures, 80 more, all of them the BOM
defect below — the two platforms genuinely disagree here, so a local
`--update-baseline` would enrol a set CI does not reproduce.

**80 entries never reached this list, because the enrolment found a real defect
first.** `parse` strips a leading UTF-8 BOM, so its spans are relative to the
stripped text, while `rsvelte_formatter` kept slicing the unstripped source with
them — three bytes off. Every BOM-prefixed component with a `<script>` failed with
`script closing tag missing` and was left *completely unformatted*; the ones
without a `<script>` formatted but dropped the BOM, which prettier keeps. All 80
BOM-prefixed components in the corpus now match the oracle byte-for-byte; without
that fix they would all have landed in `indent-only` below.

**The cluster table was re-derived after this branch was rebased onto `main`.**
Eighteen stale ids left the ratchet after the branch was rebased onto `main`.
Because the *first differing line* of an entry that still fails can move whenever
the formatter changes, the buckets moved with them: the current expanded population
of 765 entries classifies as shown below. Read that as the property of this table it has always
had — **it is keyed on the first differing line, so it re-partitions whenever the
formatter changes, with or without a change in what fails.** The counts below are
the rule below applied to the current Linux report; the previous ones were the
same rule applied to a different formatter.

The clustering rule, applied to the first differing line, in this order: equal
after `trim()` but differing leading whitespace → **indent-only**; one side blank
→ **extra-line** / **missing-line**; one side a prefix of the other →
**breaks-earlier** / **breaks-later** (rsvelte's line is the shorter / the longer);
equal after swapping quote characters → **quote-style**; equal after removing all
whitespace → **intra-line-ws**; anything else → **other**.

**The table below is the wave-2 enrolment measurement, over a population of 765 —
it is NOT a partition of the current 549.** Its `n` column sums to **766**, one
more than the 765 the paragraph above claims, so it was already inconsistent with
its own stated population before this ratchet shrank. What each of its rows would
be against the current 549 is **unmeasured**: re-deriving it needs every entry's
first differing line, which lives only in the CI report. The live partition is the
`Partition of …` line above, which `known-failures-md-check.mjs` verifies; this
table is kept for the per-cluster descriptions, not for its counts.

| n | cluster | what the first differing line looks like |
|---|---|---|
| 386 | **20 — breaks-later** | rsvelte keeps on one line what the oracle has already broken (`{#each …sort( (a,b) => {` vs a wrapped form) |
| 239 | **21 — breaks-earlier** | the mirror image: rsvelte breaks where the oracle keeps going (`selected_category.id ===` vs `… === category.id}`) |
| 38 | **23 — indent-only** | same trimmed text at a different indent, typically a member-chain continuation inside `<script>` or a nested element's body |
| 85 | **22 — intra-line-ws** | same tokens, different interior spacing — most of it a sole arrow argument the oracle hugs (`sort((a, b) =>`) and rsvelte pads (`sort( (a, b) =>`) |
| 14 | **24 — other** | no rule matches; includes a SCSS `,`/`;` terminator on a declaration list whose last entry is followed by `//` comments, a lowercased invalid hex colour (`#E7E7E7l`), a tab-vs-space indent on a wrapped text run, and a doubled space inside a `class` attribute |
| 1 | **25 — extra-line** | rsvelte emits a line where the oracle has none; the #3498 pattern's line-comment-separated class rune stays on its own line |
| 2 | **26 — missing-line** | the reverse; both are CRLF sources where rsvelte leaves a bare `\r` |
| 1 | **27 — quote-style** | an import specifier printed with single quotes where the oracle uses double |

Two #3404 pattern files make the CSS-engine part of Cluster 22 explicit (they
are included in its count of 85, not additional clusters):

- `pattern/issues/3404-repeated-combinators.svelte` contains `.card >> .a`.
  The embedded PostCSS oracle accepts the repeated combinator and removes its
  spaces; `oxc_formatter_css` rejects that selector, so rsvelte-fmt's documented
  parse-failure fallback preserves the source spelling.
- `pattern/issues/3404-unhandled-combinator-scope.svelte` contains the valid
  column combinator `.a || .b`. Both engines accept it, but PostCSS removes the
  spaces around `||` while OXC retains them.

The native parse-failure fallback's former extra leading blank line was a
separate product bug and was fixed by #3629. These two entries remain because
gate 9 intentionally compares the shipped native CSS path rather than replacing
it with `--no-native-css`; #3628 records that decision and the engine boundary.

**472 of 549 (86%) are cluster 20 or 21 — one question, where a line breaks** —
and that is the burndown target, not the tail. That is the live `Partition of …`
line above (258 + 214), the one the doc check verifies. The figure this sentence
carried until #4062, *624 of 765 (82%)*, was the wave-2 table's population, and it
did not agree with that table either — its own rows give 386 + 239 = 625.
Nothing here is an oracle bug: the
`oracle-invalid` classification already carries those and is a pass, not a ratchet
entry.

**And 398 of those 472 are inside the TEMPLATE, not inside embedded JS or CSS
(2026-09-01).** The cluster table names the *shape* of the first differing line and
never says which printer produced it, which reads as a line-breaking backlog in the
embedded-JS formatter. Locating each entry’s first differing line back in its **source**
— by a token needle, reporting `unlocated` rather than guessing — partitions the 549 as
`template 438 | unlocated 48 | script 41 | style 22`, and crossed with the shape rule:
`breaks-later|template 215`, `breaks-earlier|template 183`, `indent-only|template 31`,
`breaks-later|script 19`, `indent-only|script 14`, `intra-line-ws|style 9`, the rest in
single digits. So **72.5% of this ratchet is one question about Svelte markup**, and the
embedded-JS and embedded-CSS engines together carry 63 entries.

The positive control is that the same local harness reproduces the CI gate’s own
partition on **five of its seven buckets exactly** (`breaks-later 258`,
`breaks-earlier 214`, `intra-line-ws 15`, `extra-line 1`, `missing-line 1`), differing by
two entries that move between `indent-only` and `other`. A region split measured by a
harness that did not reproduce the shape split would be describing a different
population.

### Three axes the cluster table does not carry (2026-08-31)

The table above keys on the **first differing line**, which answers *what the
divergence looks like* and nothing about *how much it costs*. Three orthogonal
measurements over the same 788, each run on the current tree with the same
invocations the gate uses (`oxfmt -c scripts/fixtures/fmt-corpus.oxfmtrc.json
--stdin-filepath <basename>` and `rsvelte-fmt --stdin --stdin-filepath <basename>
-c <same config> --oxfmt-bin <same oxfmt>`). Positive control that the harness
reproduces the gate: **0 of 788 came back byte-equal** — the harness agrees with
the ratchet on every entry.

**1. Does the divergence change what the compiler emits?** Each side's formatted
output was compiled with the official compiler (`generate: 'client'` and
`'server'`, comparing `js.code` and `css.code`):

| n | class |
|---|---|
| 674 | **render-neutral** — the compiler emits byte-identical JS *and* CSS from both forms |
| 114 | **render-changing** — at least one of the four outputs differs |

The 114 split 53 `client:js+server:js`, 43 `client:css+server:css`, 17
`client:js` alone, 1 all four. **86% of this ratchet is invisible to the
compiler**, so it is a formatting-taste backlog, not a correctness one — but the
gate's unit is bytes, so the 114 that *are* a correctness question are filed
beside the 674 that are not, indistinguishably.

**2. Is rsvelte inside the oracle's own width budget?** Counting lines longer
than `printWidth: 80` in each whole output:

| n | class |
|---|---|
| 411 | both outputs overflow (long attribute values, URLs, class lists — neither engine can break them) |
| 264 | **only rsvelte overflows** — rsvelte emits over-width lines the oracle does not |
| 101 | neither overflows — pure break-point preference, both inside the budget |
| 12 | only the oracle overflows |

The asymmetry is the finding: 264 against 12. rsvelte **under-breaks**, which is
the same direction Cluster 20 (385, *breaks-later*) reports and the opposite of
what Cluster 21 (239, *breaks-earlier*) reads like in isolation — an entry can be
`breaks-earlier` on its first differing line and still overflow further down.

**3. Does rsvelte's own output still compile?** This is the question the gate
structurally cannot ask, because its verdict is byte equality against the oracle:
a mismatch is a mismatch whether the actual text is a two-space indent or is not
a Svelte document at all.

| n | class |
|---|---|
| 0 | **rsvelte-fmt output is rejected by the official compiler** |
| 2 | oracle output rejected, rsvelte's accepted |

Measured over the whole 33,644-entry formatter-parity population by compiling both
sides' formatted text: 1,014 of those sources are not compilable at all (both
sides are rejected identically — `lang="ts"` and friends), and the 2 the oracle
alone loses are the nested-destructure mangling already carried by
`fmt-oracle-excluded.json`.

This row read **1** until #4151. That one was
`sveltepress/packages/theme-default/src/components/icons/SystemDefault.svelte`,
and it was not a formatting preference — rsvelte-fmt **overwrote an HTML
comment's `-->`**, so the document was destroyed:

```svelte
<svg Q="1" R="2"><!-- ZZZZZZZZ --><path d="a"><animate aaaaaaaaaaaaaaaa="1" bbbbbbbbbbbbbbbbbb="2" cccccccccccccccccc="3" /></path></svg>
```

```
<svg Q="1" R="2"><!-- ZZZZZZZZ --><path d="a"
<svg Q="1" R="2"><!-- ZZZZZZZZ   ><animate
```

`try_hug_mixed` declined any element with a `Comment` child on the premise that a
comment is a line boundary. The oracle glues `><!-- … -->` to a wrapped open tag
exactly as it glues text, so the premise is wrong — and declining left the child
that breaks to a later pass, whose `ws_indent` was the line prefix sliced up to
its last space. That slice **is** the comment when the comment precedes the
element, so it was re-emitted as indentation over the `-->`. The indent is now
the line's own leading whitespace, which is the same string on the shape the
slice was written for (a parent's hugged `>` alone on the line) and the right one
on every other. The defect had a second face the corruption hid: on an inline
host the same slice produced *valid* output indented at the comment's end column
(10 where 2 is correct), so the repro
(`crates/rsvelte_formatter/tests/leading_comment_hug.rs`) carries both, plus the
`>`-only prefix as the arm that reports an over-narrowing. 2 entries left this
ratchet with 0 new failures; `SystemDefault.svelte` itself stays listed, on the
`<g>` nesting level rather than on the comment.

**Attribution status of this ratchet.** *Nothing here is an oracle bug* — that
classification lives in `fmt-oracle-excluded.json` — so **no entry is attributed to
an `upstream_issues/` report**, and **none is attributed to a
`deliberate-divergences` section either**. All 524 have to be burned down to zero.

The previous version of this paragraph said `5 + 783`, against a ratchet holding
547. The partition line above and this paragraph state quantities of the same
population, and `known-failures-md-check.mjs` was comparing only the first of them
to the JSON — **one half was gated and the other rotted alone**, which is a
different failure from "the count and the split go stale together". The fix is
therefore not a corrected number but the sidecar below, so that the number is
derived rather than typed.

The `deliberate-divergences` claim did not survive re-reading either. The
CSS-engine boundary (#3628) is a recorded divergence, but the section
[*The formatter's CSS engine is oxc, not prettier's PostCSS*](GATES.md#deliberate-divergences)
names `fmt-oracle-excluded.json` as its ratchet, and its pin
(`crates/rsvelte_formatter/tests/css_native.rs`, 8 tests) covers **value
spelling** — a custom property, a nested `calc()` group. None of its tests reaches
selector source spelling, a CSS escape's terminator, a multi-line function value's
reindent or an unhandled combinator, which is what the five entries below actually
carry. A recorded divergence whose pin covers a different facet does not pin these,
so they are a **candidate** and are counted as unattributed until a test exists —
the same standing `lsp-known-failures.md` gives its own unpinned candidate.

The 43 CSS-only render-changing entries above are very likely the same engine
boundary in its *line-breaking* facet (e.g.
`huly/packages/ui/src/components/SearchInput.svelte`, where PostCSS breaks
`background-color: var(--theme-button-default); // …` across three lines and OXC
does not), but that facet has no pin either, so it is recorded here as a
hypothesis rather than as a mechanism.

### Entries by mechanism (2026-09-04)

**This table is generated from a one-to-one id → mechanism assignment**
(`compatibility/fmt-mechanisms.json`), **and the `n` column is derived from it** —
`known-failures-md-check.mjs` fails if a row disagrees with the sidecar, if an
entry carries no mechanism, or if a mechanism carries no entry. Every row is
`pinned: none`, which is the whole finding: this ratchet's end state is
elimination for every entry it holds.

The embedded-CSS engine split was a single label until 2026-09-04, and a key that
cannot tell its members apart suppresses all of them. Re-measured by running the
gate's own two production stages — `oxfmt -c … <paths>` for the oracle and
`rsvelte-fmt . -c … --oxfmt-bin …` for the actual, over the five sources staged at
their corpus paths — it is the set of rows below rather than one row. Only the
first is a *reject* path, and its fingerprint is in the output rather than in the
diff: tabs survive in rsvelte's text while the config says `useTabs: false`, with
the other three CSS candidates at 0 tab-bearing lines in the same run, so the body
was copied rather than printed. None of the five changes the compiled CSS —
`#\31\32\33` / `.a\5c` and the gradient indent are byte-identical through the
official compiler after scope-hash normalization, and the other three carry their
spelling through verbatim with identical scoping — so what a pin here would record
is the engine choice, not a claim about which side is correct.

The remaining entries are one bucket rather than seven because the mechanical
`20`-`26` split above is recomputed from `compatibility/fmt-report.json`, which is
a build artifact of a full oracle run and is not in the tree — assigning those
buckets per entry from the doc would be transcription, not measurement.

| n | mechanism | pinned |
|---|---|---|
| 1 | `oxc_formatter_css` rejects the `<style>` body, so `native_style_formatter` returns it verbatim and the source's own indentation survives — measured as 6 tab-bearing lines in rsvelte's output under `useTabs: false`, against 0 in the oracle's own output for the same file and 0 on both sides for three of the four sibling candidates (the fourth reads 1 on both sides, inside a declaration value); the oracle's PostCSS path accepts the same body and reformats it | none — candidate, not pinned for this facet |
| 2 | the two engines disagree about whitespace around a selector token neither models — the column combinator and a `nth-child(… of <selector>)` clause: rsvelte's `oxc_formatter_css` prints the space, the oracle's PostCSS path closes it up; the official compiler carries either spelling through verbatim and scopes both identically | none — candidate, not pinned for this facet |
| 1 | a hex escape ending a selector: rsvelte emits the escape's terminating space and the separator before `{` as two spaces where the oracle emits one — the same file's 18 other selectors, including every hex escape followed by more text, agree; the official compiler's scoped CSS is byte-identical for the two spellings | none — candidate, not pinned for this facet |
| 1 | continuation indent of a comma-separated multi-value declaration: rsvelte's engine prints every continuation at one depth where the oracle's PostCSS path keeps the source's uneven depth; the official compiler's scoped CSS is byte-identical for the two spellings | none — candidate, not pinned for this facet |
| 519 | no upstream report and no pinned deliberate divergence; elimination is the only end state open to these entries | none |

Partition of `fmt-known-failures.json` by mechanism: `1 + 2 + 1 + 1 + 519`

### Cluster 1 — close-tag-dangle / open-tag hugging for inline & void children (3)

The most common failure. Prettier prints whitespace-sensitive inline elements
(`<a>`, `<span>`, `<title>`, a `<pre><code>` pair, small inline components
like `<Icon>`/`<Kbd>`) with a dangling close bracket — `</tag` + softline +
`>` — and hug-breaks a long open tag so its `>` (and the first child) lands on
its own line. rsvelte's `children.rs` port (`build_element_doc`) has since
been widened to cover element-only children runs, `{#if}`/`{#each}`/`{#key}`
flow-block children, whitespace-separated flow-block children, a prose prefix
immediately before a claimed element (`.<span …>`), and Component children;
self-closing tags print correctly (no more `<path … />` corrupted into
`<path …></path>`); a `<pre>` child's close `>` now dangles when its open tag
breaks; and an empty `<textarea>`'s open-tag `>` now dangles when the glued
last line would overflow the print width; and a hugged content line's close
tag now participates in the width measurement, so an inner self-closing
component's attributes break where the oracle breaks them. Two further
widenings landed since (see Resolved): `node_to_child` now has a `RenderTag`
arm claiming it as a bare atom (added to the block-run gate too, while a
prose-position `RenderTag` still bails to the #1669 fill path) instead of
falling through to the legacy string path, fixing an `{:else if}`-branch
title/element dangle; and `<pre><code class="…">` open-tag hugging now
follows three rules confirmed against a `printToDoc` dump — a `<pre>` child's
open `>` dangles when its content is multi-line or its own open tag
overflows, re-hugs only when the attrs themselves break onto multiple lines,
and (when `<pre>` itself overflows) prefers breaking a breakable child's tag
over the `<pre>`'s own attributes.

The remaining 3 entries are the shapes those widening steps did not reach: an
`<a>`/`<span>` dangling-close that falls through to the compact fallback (2
ids — `cmsaasstarter/.../(marketing)/+page.svelte`'s `</div></a>` pair and
`svelte-ux/.../Collapse.svelte`'s `<span>…</span>` pair), and — in the
opposite direction — a short `<a>` kept compact by rsvelte that the oracle
still breaks onto its own lines (1 id, entangled with Cluster 2 and the
since-resolved Cluster 5). Both compact-fallback ids sit behind the same
`>`-prefix bail in `try_children_port`. A strict-condition experiment
narrowing that bail from `>`/`}` to `}`-only was tried and reverted — **0
fixed / 1 regressed** (`shadcn` code-viewer), and the (then four) targeted
ids stayed unchanged or got worse (see Proven net-negative) — confirming,
alongside the earlier `hug_glue_prefix` narrowing experiment, that this
cluster needs children.rs's hug-boundary construction rebuilt, not a gate
relaxation. Fix belongs in rsvelte — continuing to widen the `children.rs`
Doc-IR gate. (Two ids formerly listed in this paragraph —
`svelte-ux/.../TextField/+page.svelte`'s wrong-node `<a>`-hug and
`layercake/.../routes/components/+page.svelte`'s `<a>…</Blockquote` pair —
are gone from the baseline: PR #1877's real-world-layout width fix, already
on `main` before this corpus expansion, cleared both; this doc just hadn't
caught up.)

A 4th member (`skeleton/sites/skeleton.dev/src/components/landing-page/
design-system.svelte`) — the `<pre><code>` shape where the `<code>` open tag's
`>` must dangle onto a multi-line template-literal child — is gone from the
baseline: the three ported `<pre><code>` hug rules reach it after all, and this
doc had not caught up.

### Cluster 2 — attribute/style/directive value break-point selection (8)

A quoted attribute or directive value with one or more `{…}` interpolations
overflows the line, and the oracle's break-point choice differs from
rsvelte's. Most of this cluster's former members are now handled by a
whole-value Doc model (see Resolved): the value's literal text prints
verbatim, and each interpolation is a `group([RawExpr{flat, broken}])` whose
break decision is measured through the *whole remaining tail* — not just its
own width — reproducing prettier's own greedy, left-to-right break-point
choice. The 4 remaining ids split into two distinct blockers:

`style:` **directive** values are not yet routed through that model — their
text is a real `fill` structure in the oracle (unlike a regular attribute's
verbatim text), a deliberately different shape the new model doesn't cover
yet — so `layercake/.../AxisY.percent-range.html.svelte` and
`AxisYRight.percent-range.html.svelte` still show the original symptom:
trailing interpolations are counted at zero absorbed width, so the model
breaks an earlier interpolation the oracle keeps flat inside a deeply nested
`calc(...)` expression.

The wrong-indent half of this cluster turned out to be a double-indent bug,
not the RawExpr width limitation, and is now fixed (see Resolved): the model
baked the absolute attribute indent into continuation lines while the
open-tag assembly re-indents interpolation-led values a second time. That
cleared `svelte-calendar/.../Popover.svelte` outright and resolved
`powertable/.../PowerTable.svelte`'s `placeholder` half (the id keeps
failing on its other clusters — see Multiple clusters per id).
`cmsaasstarter/.../delete_account/+page.svelte`'s
single-interpolation `message=` attribute is not currently routed through
the new model at all (an attempt to widen the gate to that shape was
reverted — see Proven net-negative), but the experiment confirmed its
break-point choice is downstream of the same narrow-width limitation, so its
current diff still shows the un-routed symptom rather than the indent
symptom.

The four skeleton entries are the same limitation on four value shapes: a
`class="…{cond === x ? 'a' : ''}"` conditional whose interpolation the oracle
breaks one operand earlier (`sites/skeleton.dev/.../ui/header/theme.svelte`,
`.../ui/preview.svelte`), a `bind:value={obj[call(…)]}` directive where the
oracle breaks immediately after `{` and indents the whole member expression
(`sites/themes.skeleton.dev/.../Controls/ControlsColors.svelte`), and a
`style:background={obj["k"] === "inherit" ? … : …}` directive — the `style:`
sub-case named above — where the oracle breaks *inside* the computed member
(`.../Controls/ControlsTypography.svelte`).

The RawExpr model has captured everything reachable within its architecture;
what remains needs printing-time nested-expression formatting. Fix belongs
in rsvelte — give each interpolation a *live* Doc subtree (formatted at its
real indent) instead of a pre-narrowed string, so a nested subexpression can
measure against its true column.

### Cluster 3 — embedded-JS member-chain / call-argument break-point divergence (6)

A single JS expression inside one interpolation (`a.b.c`, `x ?? 'default'`)
needs to break, and oxc's chosen break point differs from what the oracle
emits in the same context — e.g. a plain member chain (`$page.error.message`,
`api.rest_props.name`) breaks one property earlier/later or one level deeper
than the oracle. (The block-header variant — a `{#if long-call(…)}` header the
oracle keeps on one line entirely — is resolved, see Resolved.) One entry
(`svelte-form-builder/FormBuilder.svelte`)
shows the same divergence repeated many times inside one multi-line
`style="…"` value, each `?.`/`??` chain choosing a different break point than
the oracle. This is oxc's member-chain / call-argument merge heuristic
disagreeing with the oracle's context, not a width-narrowing problem —
unlike the single-interpolation attribute shapes now filed under Cluster 2,
these divergences persist unchanged after the new attribute-value Doc model
landed — `$page.error.message` sits in a `<pre>` tag's element content (an
expression tag, never routed through any attribute-value model), and
`api.rest_props.name`'s `href` attribute still shows the exact same
break-depth mismatch it always did, so the new model either doesn't reach it
or reaches it without changing the outcome. The divergence is
oxc_formatter's own internal choice, not a width-narrowing problem. Fix
belongs in `oxc_formatter` (member-chain and call-argument printing).

`powertable/app/src/routes/examples/+layout.svelte` was reclassified into
this cluster after the two other mechanisms it used to carry were both
resolved (a Cluster 5 multi-pass fill artifact and a Cluster 1 void-element
dangle — see Resolved): the residual diff is a member-chain break-point
choice inside an `href` attribute's interpolation — the oracle breaks after
`example{$page`, rsvelte after `$page.data` — plus one unrelated stray
trailing space immediately before an `<a>` link's text. The break-point part
is the same oxc member-chain heuristic divergence as the other three ids in
this cluster; the trailing-space part is unexamined but low-priority next to
it.

`skeleton/sites/plus.skeleton.dev/src/routes/(app)/content/blocks/+page.svelte`
is the same mechanism in element content: a parenthesized
`(arr.find(fn)?.blocks ?? []).length` interpolation, where the oracle breaks
inside the parens (`>{(` then the chain indented) while oxc keeps the whole
`find(…)` call on the first line and breaks before `.length`.

`layerchart/packages/layerchart/src/lib/components/Labels/Labels.base.svelte`
is the call-argument form: the oracle breaks the `extractLayerProps` arguments
inside a spread expression while oxc keeps them on one line.

### Cluster 4 — inline `{expr} {expr}` hug/join collapse (1)

The mirror image of Cluster 1's hugging: adjacent expression-tag children
(`{key} {first} {last}`) are kept on one line by the oracle but split onto
separate lines by rsvelte (`svelte-table/example/example6/ContactButtonComponent.svelte`).
**This is not on the same lever as Cluster 1, nor as the since-resolved
Cluster 5** — confirmed by direct testing, not inference. Cluster 1's
hug/dangle gate governs element open/close-tag decisions, not bare `{expr}`
siblings. Cluster 5's prose-fill divergence (see Resolved) was a
width/lookahead disagreement *inside* a run that both sides agree is
fillable; here the Fill algorithm falls back to one-word-per-line entirely
where the oracle keeps the run joined. The leading (unconfirmed)
suspect is the prose-fill side-hug context — the Fill algorithm's decision of
which sibling a `{expr}` "word" is allowed to hug depends on surrounding
text/element context, not on bare adjacency — but the actual fix location is
unknown pending further investigation. Several targeted fixes were attempted
and are proven net-negative (see below).

### Cluster 6 — oxc paren / type-annotation divergence (1)

The oracle's prettier-plugin-svelte layer omits parens that oxc's
`NeedsParentheses` printer adds: `{@const y = a = item.n}` stays
unparenthesized in the oracle but oxc parenthesizes the inner assignment
(`(a = item.n)`). String-surgery paren stripping is forbidden by project rule.
Fix belongs in `oxc_formatter` (expression-position parens).

The former second member of this cluster — a `… as HTMLElement | undefined`
union that the oracle keeps flat while oxc expands it to a leading-`|`
multi-line union — is now resolved for template expressions (see Resolved).
The confirmed mechanism (three repro experiments in the PR for #1484): the
oxfmt oracle formats **template-position** expressions (attribute values,
mustaches) with prettier's estree printer, whose `as`/`satisfies` layout is
`group([expr, " as", indent([line, group(type)])])` — a break after the
operator that keeps the union's own group flat when it fits. oxc ties the
union's leading-`|` separator into a single group, so once the annotation
breaks the union *always* expands, and **no print width reaches the
oracle's layout** (width tuning is not the lever — the divergence reproduces
at markup depth 0). `<script>` blocks are unaffected because oxfmt formats
those with oxc on *both* sides (they agree on leading-`|`), and rsvelte
formats `<script>` through the separate `format_program` path. The principled
upstream fix is still a separate-group `as` layout in `oxc_formatter`; until
that lands, rsvelte reproduces prettier's layout for template expressions only
(see Resolved).

### Cluster 8 — CSS declaration reindent, native engine (1)

A `<style>` block declaration whose value spans multiple lines and mixes a
comment with several `repeating-linear-gradient(...)` calls
(`background-image: /* comment */ repeating-linear-gradient(…), /* comment */
repeating-linear-gradient(…), …`) gets both its leading comment and its
continuation-argument lines indented differently than by the oracle — a
stray space+tab mix on the comment line, and a 2-space-narrower indent on
every subsequent `repeating-linear-gradient` argument line. Root cause
(byte-level reproduction of both pipelines, minimal repro with identical
input): this is NOT an `oxc_formatter_css` indent-tracking bug but a
**engine difference in the two sides** — the oracle's PostCSS path preserves a
multi-line function value's interior lines verbatim (1:1 tab→space mapping
of the source's uneven indents), while the OXC CSS formatter parses the function
and normalizes the arguments to one canonical level. The comment-line
whitespace mix is a secondary rsvelte dedent artifact, but fixing it alone
cannot clear the entry while the engine difference remains. Changing the shipped
engine or reproducing PostCSS's source-preservation rule has a high blast radius.
Cluster 11 is the same engine split reached through a different construct.

### Cluster 11 — CSS selector source spelling, native engine (2)

Two `submodules/svelte` fixtures that arrived with the 5.56.10 bump. Both are
selectors the CSS printer re-emits from the AST rather than from the source:

- `css-nth-of-minified/input.svelte` — `li:nth-child(2n of.important)`. A
  minifier may drop the space after `of` because the `.`/`#`/`[`/`*`/`&` that
  follows already ends the `of` identifier. The oracle keeps the input
  spelling; rsvelte prints `of .important`.
- `css-escape-sequences/input.svelte` — `#\31\32\33 { … }`. The space after
  `\33` is the escape's terminator and belongs to the selector token, so
  re-emitting the token and then adding the separator before `{` yields two
  spaces where the oracle has one.

Same root cause as Cluster 8, reached from the selector side rather than the
declaration side: **the embedded PostCSS oracle preserves selector source text,
while the OXC CSS formatter re-prints selectors from the parsed AST**. Running
oxfmt over the same two selectors as standalone CSS
reproduces rsvelte's output byte for byte. Neither spelling changes what the
selector matches. Changing the product engine or teaching the AST printer to
preserve these spellings has the same high blast radius as Cluster 8.

### Cluster 12 — a block written entirely on one line is expanded, and that is significant whitespace (1)

`pattern/issues/4046-each-const-parameter-comment.svelte`. The source is

```svelte
{#each [1] as i}{@const c = /* c */ v * i}<p>{c}</p>{/each}
```

with no whitespace anywhere between the block tag, the `{@const}` and the child.
The oracle keeps the first child glued to the open tag and the close tag glued to
the last child — `{#each [1] as i}{@const c = /* c */ v * i}` then
`  <p>{c}</p>{/each}` — which reads oddly and is the whitespace-sensitive answer.
rsvelte-fmt normalizes the block to the canonical multi-line form instead.

**This one is not cosmetic: the formatted text compiles to different code.** Run
through the official compiler, the source and the oracle's output are
byte-identical (`compile(source).js.code === compile(oracle).js.code`), while
rsvelte-fmt's output is not — the each callback loses the comment from its
parameter list, `($$anchor, i /* c */) =>` becoming `($$anchor, i) =>`. A
formatter must not move that, so the fix belongs in rsvelte: a block whose first
child begins with no whitespace must not gain any.

Two controls were measured. Removing the comment reproduces the same five-line
divergence, so **the comment is not the trigger** — the one-line layout is. And
handed the multi-line spelling, both formatters return it unchanged and agree
byte-for-byte, so this is rsvelte-fmt *adding* whitespace rather than the oracle
preserving something rsvelte cannot see.

The repro cannot be re-spelled to dodge this. Its subject is exactly the comment
that the multi-line spelling drops, so a multi-line version pins nothing.

### Resolved

- **Overflowing block header: grouped call arguments keep their expanded
  spacing (former Cluster 9, 9 ids, #1976).** When a `{#if}` / `{#each}` /
  `{#key}` / `{#await}` header line does not fit the print width, the oracle
  still prints it on one line, but renders every call in it from the layout oxc
  would have broken out — `callee( a, b )`, one space inside each delimiter,
  arguments flat, no trailing comma:

  ```svelte
  {#each datePicker().getMonthsGrid( { columns: 4, format: "short" } ) as months, id (id)}
  ```

  The trigger was measured to be the **whole header line** (indent + `{#each ` +
  expression + the `as …}` suffix) exceeding the print width — exactly, by
  sweeping the width one column at a time: a header whose flat form is 69 wide
  stays flat at `printWidth: 69` and expands at 68. It applies to every call in
  the expression tree at any depth (inside logical operands, ternary arms,
  optional chains, object property values, array elements, curried callees, the
  each-block key) and to `new` expressions, not just a top-level call.

  An `{#each}` header carries **two** expressions, and the oracle settles them
  left to right: the iterable is judged first, against the not-yet-settled key at
  its widest, and the key is then judged against whatever the iterable actually
  ended up at — two columns per grouped call. So with a flat header of 78 columns
  holding three grouped calls, the split between the two expressions moves the
  boundary. One call in the iterable and two in the key: the iterable measures
  78 + 4 and expands from `printWidth: 81` down, the key measures 78 + 2 (the
  iterable having expanded) and joins it at 79. The same counts reversed: the
  iterable measures 78 + 2 and only expands at 79, and the key — with the
  iterable still flat above that — measures a bare 78, so **nothing** expands at
  80. Measuring each expression against the other *unconditionally* expanded gets
  that second shape wrong, adding spacing the oracle does not. All boundaries
  were confirmed by width sweep across both directions.

  Which calls get the spacing turned out to be exactly oxc's own
  `arguments_grouped_layout` predicate (last-argument or first-argument
  grouping), confirmed against ~60 shapes: a non-empty object/array last
  argument expands, but an empty one does not; a same-shaped penultimate
  argument (`f({…}, {…})`) suppresses it; a numeric-only array last argument
  alongside another argument is printed concisely and so does not expand; an
  arrow last argument expands only when its body is a block, object, array,
  call, conditional or nested arrow — never a bare binary expression. That
  predicate lives in a private oxc module, so `expression/call_args.rs` mirrors
  it, under-approximating (leaving the header flat) for shapes a block header
  cannot realistically hold rather than guessing.

- **Cluster 10 — `prettier-ignore` subtree only partially preserved (2 ids,
  #1977).** A `<!-- prettier-ignore -->` comment must leave the whole next
  node's source verbatim, but only 2 of the collapse pass's 12 recursive
  collectors (`collect` and `collect_children_port_only`; `fill_inline_runs`,
  which builds prose-run edits ahead of the per-node guard, had no check
  either) checked `prettier_ignore::preceded_by_prettier_ignore` before
  recursing/reflowing — `collect_try_collapse_only`,
  `collect_hug_mixed_non_ws_prefix`, `collect_break_block_non_ws_prefix`,
  `collect_break_inline_open_tag`, `collect_recollapse_open_tag`,
  `collect_content_tag_breaks`, and `collect_pre_block_reformats` had no
  guard, so a nested element inside an ignored subtree (e.g. the `<a>` inside
  an ignored `<p>`) could still get its open tag broken by a later sweep. Both
  ids were this one shape (`<a href="…" target="_blank" class="…">` re-broken
  inside an ignored `<p>`), reproduced standalone in
  `crates/rsvelte_formatter/tests/prettier_ignore.rs`. Fixed by adding the same
  index-based guard (`continue` without recursing when the node is preceded by
  the ignore comment in its own parent fragment) to every unguarded collector,
  and by making `fill_inline_runs` treat an ignored node as a run boundary so
  it can never join — or get folded into — a prose-run edit.

- **`RenderTag` claimed as a bare atom in the children port (Cluster 1,
  `{:else if}` title/element dangle, 2 ids).** `node_to_child` had no arm for
  `RenderTag` (`{@render …}`), so an `<svg>` body shaped like `{#if
  cond}<title>{@render title()}</title>{:else if …}…` bailed to the legacy
  string path and dangled the wrong `<title>`'s close tag. A `printToDoc`
  dump confirmed the oracle's actual rule: the first `<title>`'s group
  measures its own fit *including* the following `{:else if}` branch, and
  dangles its close only because that combined measurement overflows — not
  because of anything specific to the branch itself. Fixed by giving
  `RenderTag` a `node_to_child` arm that claims it as a bare atom (and adding
  it to the block-run gate so runs containing one aren't skipped); a
  `RenderTag` in prose position still bails, deferring to the fill
  infrastructure from the `{@render …}`/`{format(...)}` fix (see the Cluster
  5 entry above). Surfaced a latent bug along the way: a whitespace-only
  element body (`<i> </i>`) was printing two spaces instead of prettier's
  single-space collapse; fixed alongside. Commit ddc55220 (PR #1696).
  Cleared `layercake/src/lib/layouts/ScaledSvg.svelte` and
  `layercake/src/lib/layouts/Svg.svelte`.
- **`<pre><code class="…">` open-tag hug, three-rule model (Cluster 1, 3
  ids).** Three rules confirmed by diffing a `printToDoc` dump against
  rsvelte's output: (a) a `<pre>` child's open `>` dangles onto its own line
  when its content is multi-line *or* its own open tag overflows the print
  width; (b) it re-hugs (glues `>` to the last attribute) only when the
  attributes themselves are forced to break across multiple lines; (c) when
  the `<pre>` element itself overflows, a breakable child element's own tag
  is preferred for breaking over the `<pre>`'s own attributes —
  `try_break_pre_own_attrs` now defers whenever a breakable child exists.
  Commits 7160ae13 and 8d04ff59 (PR #1696). Cleared
  `cmsaasstarter/.../blog/(posts)/awesome_post/+page.svelte`,
  `cmsaasstarter/.../blog/(posts)/example_blog_post/+page.svelte`, and
  `svelte-fa/src/routes/components/ui/docs-code.svelte`.
- **Cluster 5 — prose fill / text wrap (solved, last entries cleared).** A
  long mixed text run word-wrapped by the oracle's `fill` algorithm with
  `pair_fits` lookahead sometimes disagreed with rsvelte on the wrap point;
  the last two members of this cluster shared a multi-pass artifact. Collapse
  is a multi-pass post-process that re-parses its own intermediate output
  each pass: an earlier breaking pass hug-breaking an inline `<code>`/`<b>`
  sibling (dangling its close tag) pushes the following prose onto a fresh
  line in that pass's *intermediate* output, and the final children-port pass
  then re-parses that intermediate and has `split_text_to_docs` read the
  artifact newline as if it were a source line break — prepending a Hardline
  and flipping the prose fill to its inverted, last-word-overflow-tolerant
  form, so an overflowing word stays on the line instead of wrapping (the
  oracle, reading the original single space, wraps it). Fixed by threading
  the pre-collapse source text into the children-port pass via a thread-local
  map (intermediate text-node start → original text): `node_to_child` now
  classifies each text child's boundary whitespace from the original text
  when available. Collapse never changes non-whitespace content or node
  structure (a corruption guard enforces this), so intermediate and original
  trees normally align 1:1 on non-text nodes — but the map is built via a
  structural, signature-keyed lock-step walk (`node_signature_matches`: same
  AST variant, plus same tag/name for elements and components) rather than by
  raw position, so any single misalignment anywhere in a fragment falls that
  whole fragment's subtree back to classifying from the intermediate text
  instead of risking a wrong pairing. Four unit tests (the concrete repro
  shape, both sides of the alignment guard — matched and deliberately
  divergent — and a revert-confirms-the-failure check); 0 regressions across
  the 12,657-file corpus. Commits 5ffc4a34 and 5a9578e9. Cleared
  `svelte-ux/packages/svelte-ux/src/routes/+page.svelte` outright; the same
  fix also cleared the multi-pass half of
  `powertable/app/src/routes/examples/+layout.svelte`'s divergence (that id
  remains in the baseline, filed under Cluster 3, for an unrelated
  member-chain break-point issue — see Cluster 3). A related but
  non-flipping fix landed alongside it: the children port previously emitted
  a void HTML element (`<br />`, `<img … />`, `<input … />`) as a verbatim
  single-line atom, so one glued to the end of an overflowing prose line
  stayed on that line past the print width instead of the oracle's
  `group(['<', tag, indent(group([…attrs, dedent(line)])), '/>'])`, which
  dangles the `/>` onto its own line (`<br\n/>`) when the group breaks. Fixed
  via a new `build_void_element_doc` in `node_to_child` (also covering the
  no-attribute `<br />` case `build_self_closing_regular_doc` skips), with a
  flat-form guard that keeps the group only when it round-trips to the
  canonical `<tag … />`, so a void element that already fits stays
  byte-for-byte unchanged. Commit b8f88c05 — this alone flipped no id to PASS
  on its own, but combined with the whitespace-classification fix to fully
  clear the non-Cluster-3 portion of `powertable/.../+layout.svelte`'s
  divergence.
- **Prose expression/render tag breaks its call arguments in place (Cluster
  5, 2 ids).** A long call inside an expression/render tag in prose was
  treated as an atomic fill word, so rsvelte wrapped at the word boundary
  before it instead of breaking the call's arguments and gluing the next
  word to the `)}` line. A `printToDoc` dump showed prettier builds such a
  paragraph as fill + expression-tag concat + fill — the tag sits outside
  the fill with its own call-arguments group, so the fill never measures it.
  Element-body prose (`try_fill_mixed`) now represents multi-line content
  tags as a breakable flat/broken doc inside the run; all other call sites
  keep the atomic behavior. Cleared `layerchart/.../LineChart/
  perf-wide-data-processed.svelte` and `layerchart/.../docs/examples/
  +page.svelte`.
- **Block-header call expressions forced onto one line (Cluster 3, the
  `{#if long-call(…)}` variant).** prettier-plugin-svelte reprints block
  headers with `removeLines`, which keeps a group's baked `shouldBreak` — a
  `shouldExpandLastArg` call joins with inner spaces (`fn( a, b )`), every
  other call without them. rsvelte formatted the header at `LineWidth::MAX`,
  but oxc still expands hug-eligible-last-arg calls at MAX width, and the
  multi-line result skipped the single-line path entirely, splicing the raw
  expansion at the wrong indent. `collapse_block_header_expanded_call` folds
  the flat-args expanded form back (structural gate: fires only when oxc
  refuses flat at MAX width; curried `)(` inner lines bail). Resolved the
  Cluster 3 half of `stacked-zoom.svelte`.
- **Interpolation-led attribute value continuation double-indent (Cluster
  2's wrong-indent half).** The whole-value Doc model baked the absolute
  attribute indent into continuation lines, but the open-tag assembly
  re-indents interpolation-led values (`value="{…}"`) a second time —
  text-led values (`class="text {…}"`) are kept verbatim — so a wrapped
  interpolation's continuation landed at double the intended column
  (28+26=54). The model's base indent now matches `is_string_value_attr`'s
  split: absolute for text-led, relative for interpolation-led; break-point
  selection unchanged. Cleared `svelte-calendar/.../Popover.svelte` and the
  Cluster 2 half of `stacked-zoom.svelte` (completing that id's PASS), and
  resolved `PowerTable.svelte`'s `placeholder` half.
- **Template-position `as`/`satisfies` union kept flat (Cluster 6, union
  member).** oxc expands `x as A | B` to a leading-`|` multi-line union
  whenever the annotation breaks; the oxfmt oracle formats template
  expressions with prettier's estree printer, which keeps the union flat on
  the annotation line when it fits (`… as\n  A | B`) — a layout oxc reaches at
  no print width. Fixed template-side only, in `format_expr_core`
  (`crate::expression`): an AST gate (`oxc_ast_visit::Visit`) confirms the
  formatted program contains an `as`/`satisfies` node with a ≥2-member
  `TSUnionType`, then a structural pass collapses each broken union block —
  a line ending in the `as`/`satisfies` token directly followed by a run of
  same-indent `| ` member lines — back onto the annotation line when the flat
  form fits the (already depth-narrowed) budget. Blocks whose members span
  multiple lines, or whose flat form overflows, are left expanded (matching
  the oracle for long unions). `<script>` blocks are untouched — they format
  through the separate `format_program` path and agree with the oracle on
  oxc's leading-`|`. The proper upstream fix (a separate-group `as` layout in
  `oxc_formatter`) is unchanged as the eventual target. Cleared
  `svelte.dev/packages/site-kit/src/lib/search/SearchBox.svelte`.
- **Cluster 7 — multi-line attribute-value continuation reindent (solved,
  last entry cleared).** A `style:` value made of multiple interpolations
  where at least one wraps (two nested ternaries in `style:transform-origin`)
  took the whole-value re-indent path, which prepends the attribute indent to
  every line — but the literal whitespace *between* interpolations still
  carried its source indentation, so the second interpolation's opening line
  was double-indented. Prettier normalizes inter-interpolation whitespace to
  the attribute indent (verified empirically at several source indents).
  Fixed at the assembly site (`normalize_interpolation_value_indent`): a
  depth-0 newline's horizontal whitespace is stripped only when the next
  content is the next interpolation's `{`; literal-text lines keep their
  source indentation verbatim (an unconditional strip regressed melt-ui's
  `tree.svelte`, whose class value has tab-indented literal lines the oracle
  preserves). Not fixed in the shared `reindent` scanner, which treats `"` as
  a JS-string opener — adding markup brace-depth there would shift semantics
  shared with script/expression callers. Cleared
  `layerchart/.../Text/Text.html.svelte`.
- **Hugged content line's close tag excluded from width measurement.** When a
  multi-line open tag's hugged content line (`>{content}</tag`) overflowed,
  the Doc-IR reformat printed the body alone and string-glued `>` and
  `</tag` afterwards, so the printer's fits lookahead never charged the close
  tag's width — an inner `<Icon … />` whose attributes fit on their own but
  overflow once `</button` is appended never broke. Now printed as prettier's
  `group(['>', body, '</tag'])` (the same structure as the faithful port in
  `children.rs`) with the dangling `>` appended after; body columns are
  unchanged, so layouts that fit stay byte-identical. Cleared
  `layerchart/docs/.../playground/+page.svelte`.
- **`<pre>` embedded block-tag reindent.** Inside a literal `<pre>` whose body
  mixed raw text with a Svelte block tag (`{#if …}…{/if}` wrapping a `<code>`
  child), `reformat_pre_inner` regenerated the block tag's own indentation as
  tabs, on the assumption that oxfmt always preserves a `<pre>` body's
  element-direct whitespace as tabs. That assumption only held when the
  source itself indented with tabs — a space-indented `<pre>` body is kept
  verbatim as spaces by oxfmt, so regenerating its block-tag lines as tabs
  diverged. Fixed by gating tab regeneration on whether the `<pre>` body's
  source indentation actually uses tabs (`pre_uses_tabs`); a space-indented
  body now stays spaces throughout. Cleared `svelte-calendar/.../Code.svelte`
  and `svelte-calendar/.../JSONEditor.svelte`.
- **`<pre>` child close-dangle.** A `<code class={…}>text</code>` inside a
  `<pre>` whose own open tag is broken onto its own line kept its close tag
  glued (`</code>`) while the oracle dangles it (`</code\n>`), matching
  prettier's `shouldHugEnd`. Fixed by moving the close `>` onto its own line,
  one indent level shallower than the open tag's `>`, whenever the last
  content character is whitespace-sensitive text touching the close tag.
  Cleared `svelte-ux/.../Code.svelte` and `svelte-maplibre/.../CodeBlock.svelte`.
- **Empty `<textarea>` open-tag dangle is width-driven, not categorical.** An
  empty `<textarea …>` whose open tag wraps across lines glued its `>` to the
  last attribute line even when the oracle dangles it onto its own line.
  `<textarea>` is inline-block, so prettier's `shouldHugStart && shouldHugEnd`
  branch *can* dangle the `>` — but only when the glued last line
  (`{indent}{last attr}></textarea>`) would exceed the print width; when it
  fits, it stays glued. `<pre>` is a block element and always glues instead,
  so it is unaffected. Fixed by rendering the glued form, measuring its last
  line plus the `</textarea>` close width, and keeping the glued form only
  when that fits — dangling otherwise. Cleared `cmsaasstarter/.../
  contact_us/+page.svelte`.
- **Whole-value Doc model for attribute break-point selection.** The legacy
  per-interpolation width model counted a trailing interpolation as zero
  width, so it picked the wrong interpolation (or none) to break whenever a
  later interpolation could have absorbed the overflow. Replaced with a
  model matching prettier's own Doc structure: a regular attribute's literal
  text prints verbatim (not a `fill` — that's for element children, not
  attribute values), and each interpolation is a `group([RawExpr{flat,
  broken}])` measured through the whole remaining tail. This makes prettier's
  greedy, left-to-right break-point selection an *emergent* property of the
  engine's `fits` semantics rather than something hand-simulated: in Break
  mode, `fits` measuring a breakable group in the rest charges only its
  first broken line and short-circuits, so an earlier interpolation stays
  flat whenever a later one can break to absorb the overflow, and only
  breaks when everything up to the first later break point still overflows.
  Block-bodied breakable interpolations (object/array/arrow, or a call whose
  broken first line ends with `(`/`{`) still fall back to the legacy path; a
  computed member (`x[y]`) is allowed. `style:` directive values stay on the
  legacy path (see Cluster 2). Cleared `svar-core` calendar `Panel.svelte`,
  `layerchart/.../Chord/ticks.svelte`, `layerchart/.../Vector.base.svelte`,
  `svelte-splitpanes/.../Button.svelte`, and `layercake/.../AxisRadial.svelte`.

### Multiple clusters per id

Several ids carry divergences from two or more clusters at once, so fixing one
cluster alone leaves them failing: `powertable/.../PowerTable.svelte` needs
Cluster 1 (an open-tag hug) and a directive-value break decision
(`bind:checked={...}`, unrouted by the new model, same shape as Cluster 2's
un-routed `delete_account` case) in the same file — its former Cluster 2
`placeholder` wrong-indent half was resolved by the double-indent fix;
`svelte-ux/.../Gooey/+page.svelte` needs Cluster 1, Cluster 2 (a
`style:transform` directive value, un-routed, same legacy symptom as
AxisY/AxisYRight), and the since-resolved Cluster 5 together. `layerchart/.../Treemap/
stacked-zoom.svelte` used to sit here (Cluster 3 block-header + Cluster 2
wrong-indent) — both halves are now resolved and the id passes. Each id above is filed
under its dominant/first-encountered divergence. `svelte-ux/routes/+page.svelte`
used to belong on this list too (Cluster 5 plus a wrongly hug-broken `<Kbd>`
component) — widening the children port to convert Component children
resolved the `<Kbd>` half, leaving it a pure single-cluster (Cluster 5) entry,
which was itself a useful data point at the time: a fix aimed at one cluster
can silently collapse an entangled id down to a different, single-cluster
one instead of a straight PASS. That remaining Cluster 5 half is now also
resolved (see Resolved) and the id passes outright.
`powertable/app/src/routes/examples/+layout.svelte` followed the same
pattern from the opposite direction: it used to need Cluster 5 (the
multi-pass fill artifact) and Cluster 1 (a void-element `<br />` dangle)
together; both are now resolved by the same PR (see Resolved), leaving it a
pure single-cluster entry — but now filed under Cluster 3 for a residual
member-chain break-point divergence, rather than reaching PASS.
`layercake/_components/AxisRadial.svelte` used to
be on this list too (Cluster 2 plus Cluster 1); it's now fully resolved (see
Resolved), another instance of the same pattern.

One id improved without reaching PASS from that same fix, worth recording
even though it doesn't change the count: `svelte-ux/.../ApiDocs.svelte` (its
file has many `<Button>`/`<Tooltip>` component children; whichever of those
were previously unclaimed are now fixed, leaving only the unrelated Cluster 3
member-chain divergence visible in the diff). Its sibling from that same
component-child gap, `layerchart/LineChart/sparkline-within-a-paragraph.svelte`
(structurally identical to the now-fixed `BarChart/sparkbar-within-a-paragraph.svelte`),
did improve the same way but stayed on a genuine Cluster 5 divergence for a
while afterward — that divergence is since resolved too (see Resolved,
`splitTextToDocs` first-child parity, PR #1651), and the id now passes.

### Proven net-negative (do not re-attempt without a different mechanism)

- **Global fill "break-after-overflow"** (dropping `pair_fits`) — fixed 4 prose
  cases (Cluster 5) but caused 48 new failures; the oracle's fill is
  context-dependent and not hand-characterizable.
- **Const-initializer wrapper to drop Cluster-6 parens** — fixed 4 files but
  regressed ~50 (the wrapper's `+20` width compensation also inflates
  continuation-line budgets, collapsing multi-line objects the oracle breaks).
- **Blanket `ws_only_text_between_elements` relaxation** (attempted for
  Cluster 4) — **+0 fixed / −12 regressed**, and Cluster 4's own entries stay
  FAIL under it. Regressions included `layercake/.../Nav.svelte`, an id the
  narrow element-only `children.rs` gate had just fixed — actively fighting
  Cluster 1's work. Correct only for the specific hugged-sibling shape, not as
  a blanket rule.
- **hug-start suppression of `fragment_is_broken`** (Cluster 4, for
  `ContactButtonComponent`'s shape: a `<button>` with a hugged start and a
  whitespace end, where the oracle keeps `{a} {b}` inline) — as a blanket
  "first node is not whitespace-only text" test, **+1/−8** (the document root
  trivially satisfies it, suppressing all root-level breaking); as a properly
  threaded per-element `hug_start` parameter, it **does not terminate** — one
  corpus file ran 20+ minutes without finishing, because suppressing the break
  stops a later pass from reaching a fixed point. A real fix needs the hug
  state to reach the *layout* decision (the Doc/Fill path), not to
  short-circuit `effectively_broken`.
- **Narrowing `hug_glue_prefix` to `>` only** (letting `}` through): **+0/−1**,
  and it rescues zero ids. That gate blocks no fixable id.
- **Narrowing `try_children_port`'s `>`-prefix bail to `}`-only** (Cluster 1,
  targeting the 4-id `>`-prefix bail cluster: `svelte-ux/.../Collapse.svelte`,
  `cmsaasstarter/.../(marketing)/+page.svelte`,
  `svelte-ux/.../TextField/+page.svelte`,
  `layercake/routes/components/+page.svelte`) — **0 fixed / 1 regressed**
  (`shadcn` code-viewer), and the 4 targeted ids stayed unchanged or got
  worse. Matches the earlier `hug_glue_prefix` narrowing result: this cluster
  needs `children.rs`'s hug-boundary construction rebuilt, gate relaxation
  alone doesn't reach it. (The `TextField` and `layercake/routes/components`
  ids have since left the baseline via #1877, unrelated to this experiment;
  see Cluster 1.)
- **Relaxing `build_attrs_concat`'s multi-line-attribute bail**: rescues zero
  ids — for every id that hits it, the multi-line attribute is the *symptom*
  (their real divergences are Cluster 2 and the since-resolved Cluster 7),
  not the cause.
- **Estimating trailing-interpolation width** (Cluster 2) — fixed `svar-core`
  Panel but regressed `Legend`, `BarStack`, a `docs-[topic]` fixture, and
  `unused-selector-string-concat`.
- **Widening the whole-value Doc model's gate to single-interpolation +
  surrounding-text attributes** (targeting `cmsaasstarter/.../delete_account`
  specifically) — rerouted 9 files, regressed 6, fixed 0. The target itself
  stayed FAIL: its break-point choice is downstream of the same RawExpr
  narrow-width limitation the model can't yet solve (see Cluster 2), so
  routing it through the model doesn't help without also fixing that
  limitation. Reverted.
- **`splitTextToDocs` first-child parity for self-closing siblings (Cluster
  5).** Prettier's fill list shape for a text run depends on whether its
  leading whitespace was trimmed, which in turn depends on whether the text
  sits at its parent's first-child position: trimmed (first child) yields a
  word-first fill list where the overflowing word wraps; untrimmed (not
  first child) yields a hardline-first fill list where the last word before
  the boundary is allowed to overflow instead. `collapse.rs`'s
  `text_preceded_by_close_tag` recognized only a preceding `</tag>` as the
  not-first-child signal, so text immediately after a self-closing sibling
  (`<Code … />`) was misclassified as first-child and wrapped early instead
  of overflowing like the oracle. Fixed by also recognizing a `/>` prefix as
  a not-first-child signal. Three unit tests added; reverting the fix
  reproduces the test failures; 0 regressions across the 12,657-file corpus.
  Cleared `smelte/src/routes/index.svelte` and
  `layerchart/docs/.../LineChart/sparkline-within-a-paragraph.svelte`
  (commit 6d57221c, PR #1651).
- **`try_fill_run`'s single-text-node bail was over-eager (Cluster 5).** A
  `run.len()==1 && Text && !whole.contains('\n')` guard skipped reflow for
  any single-node text run, on the assumption (correct for a *mixed*,
  `run.len()>1` run) that such a run should stay flat. For a lone text node
  that had already passed the flat-fit check and still overflowed, prettier's
  fill always wraps it — the guard was blocking exactly the case it should
  have let through. This was reached whenever a preceding element-level bail
  (e.g. a block sibling forcing the mixed-fill path to give up) pushed a long
  prose run down to `try_fill_run` as a single node. Fixed by removing the
  guard (11 lines); unit tests added, reverting reproduces the failures, 0
  regressions across the corpus. This id was previously (mis)diagnosed as a
  children-port Component-child gap from its whole-file diff shape; the
  actual mechanism is the fill-layer bail above. Cleared
  `sveltestrap/src/Popover/Popover.stories.svelte` (commit d12da203, PR
  #1663).

### Methodology notes

- **Co-occurrence is not causation.** A first pass counted, per failing file,
  which port bail reasons appeared anywhere in that file, and ranked work by
  (failing ids) / (passing files at risk). Both top-ranked candidates by that
  ranking (`hug_glue_prefix` 5:32, `attrs_bail` 4:47) turned out to rescue
  **zero** ids. A causal harness (overlap of the bailing element's line range
  with the diff hunk's line range) reduced 15 co-occurring ids to 11 causal
  ones and changed which child kinds were implicated.
- **Causal is necessary but not sufficient.** Of 5 causal ids for a
  block-display fix, only 1 actually reached PASS: clearing a bail does not
  help if the element's layout then depends on another mechanism that is still
  missing (e.g. a multi-line open tag needing a dangling close). Expect
  attrition when estimating scope from causal counts. Two later, unrelated
  fixes (block-display `Child::Block` wiring, then Component-child
  conversion) added 9 more causal ids between them and landed only 2 further
  PASSes — a similar ~20% causal-to-PASS conversion rate, so treat that
  attrition ratio as the expected norm for this corpus, not a one-off.
- **`is_inline` gates hugging, not child classification — the two are
  different questions and the same word invites conflating them.** Prettier's
  own `isInlineElement`/`isBlockElement` both require `type ===
  'RegularElement'`, so a Component is neither — it is pushed as a bare
  `Child::Other`, unrelated to whether *its own* open tag is allowed to hug.
  `shouldHugStart`/`shouldHugEnd` only bail for block elements, and a
  Component is never one, so a Component's hug stays enabled regardless of
  its `Child` classification. Wiring a newly-converted node with `is_inline:
  false` (reading "inline" as "is this an inline *child*") gave +1/−12;
  `is_inline: true` (reading it correctly as "is this allowed to hug") gave
  +1/−0. Same lesson as the Cluster 4 vs. Cluster 5 "shared lever" trap above:
  two mechanisms that sound like the same axis rarely are.
- **Open one regression before calling a change net-negative.** The +1/−12
  result above, read at face value, looks exactly like the pattern this
  document already calls out as proven net-negative elsewhere. The only
  reason it didn't get filed there is that one of the 12 regressions was
  opened and diffed against the oracle before giving up, which is what
  surfaced the `is_inline` misreading and turned a net-negative attempt into
  a +1/−0 fix. A "many regressions" result is a prompt to open one and check
  it against the oracle, not a verdict on its own.
- **An id whose individual shapes all format correctly in isolation should
  first be checked for a whole-file pass bail, not assumed to be a
  pass-ordering / claim-suppression interaction between passes.** A prior
  hypothesis blamed exactly that (an element-claiming pass not recursing into
  an already-claimed ancestor) for a set of entries whose isolated shapes all
  reproduced cleanly on their own; instrumentation showed the suspected pass
  was never even invoked for those files. The real cause was a post-pass
  re-parsing its own output with `ParseOptions` missing a flag the main parse
  sets, so one unsupported construct anywhere in the file (a non-CSS
  `<style lang>`) made the re-parse fail and silently skipped the *entire*
  post-pass for the whole file. Isolation repros cannot see this class of bug
  by construction, since a minimal repro won't happen to include the
  unrelated construct that trips the whole-file bail.
- **Completeness-check lesson: when one pass consults an option/flag, check
  every sibling pass for the same consultation.** `prettier-ignore` was
  honoured by the indent/markup/expression passes but not by either collapse
  traversal (`collect` and `collect_children_port_only`), and it stayed
  invisible only because the port bailed on block-display children before
  reaching such content — once that bail was cleared, both traversals needed
  the guard; fixing only one left the gap. The same check separately found
  three `ParseOptions` construction sites in the `<pre>` sub-parse path
  diverging from the main parse, all now fixed. When the port's claim range
  widened again later (Component children), this was checked again and held:
  all 12 regressions from that change were hug-related, none from
  `prettier-ignore` — the guard is doing its job on both traversals. Still,
  it's exactly the kind of regression to check for first the next time the
  port's claim range widens.
- **A categorical-looking oracle behavior can secretly be width-driven —
  sweep the width axis before classifying it as binary.** An empty
  `<textarea>`'s wrapped-open-tag dangle looked categorical: every hand-picked
  repro and edge probe dangled the `>`. Wiring it as "always dangle when
  wrapped" passed those probes but regressed 6 new files (short-attribute
  empty textareas in flowbite, shadcn, svar-core, and svelte-ux) where the
  oracle glues instead. Re-characterizing by sweeping the glued last line's
  length from 40 to 76 columns (38/38 byte-exact against the oracle at every
  point) found the real rule: glue while the last line
  (`{indent}{last attr}></textarea>`) fits the print width, dangle only once
  it overflows. Two lessons stack here: (a) isolated repros passing is not
  the same signal as a full-gate run passing, again; (b) for any hug/dangle
  choice that looks like a two-way switch, sweep the width boundary before
  assuming it's categorical — a plausible "always X" story can be a "X below
  a threshold" story that just never got measured against the edge.
- **Element-category and hug/glue-within-the-category are two separate
  layers — don't conflate them.** Whether an element is even a hug
  *candidate* is categorical: prettier's `shouldHugStart` bails outright for
  block-display elements (`<pre>` always glues, never dangles), while
  inline-block elements like `<textarea>` remain hug candidates. But *within*
  that hug-candidate category, whether the candidate actually glues or
  dangles is not categorical — it's the print-width sweep above. Getting this
  two-layer structure backwards (treating the inner width decision as if it
  were the same kind of switch as the outer category bail) is what produced
  the width-driven-textarea surprise.
- **A structural-sounding explanation can be a misdiagnosis for a much
  simpler width-driven one.** A `style:transform="translate({a}px,
  calc(...))"` value breaking at the `px,` boundary looked like it needed
  CSS-aware breaking (recognizing `calc(...)` or the `px` unit as a
  structural boundary). It doesn't: the same shape with a *short*
  interpolation stays on one line even at 90 columns. The break is plain
  column-driven space-fill — a long interpolation pushes the following
  content past the print width, nothing CSS-specific about it. Don't reach
  for a domain-specific (CSS/JS-aware) explanation before checking whether a
  narrower, general mechanism (width) already accounts for the behavior.
- **Dump the oracle's own Doc, don't just probe its input/output.**
  `prettier.__debug.printToDoc` renders prettier-plugin-svelte's actual
  intermediate Doc tree for a given source. Two false assumptions about
  attribute-value formatting — that their text goes through the same `fill`
  element children use, and that a trailing interpolation is measured at its
  full flat width — were both resolved by one Doc dump, faster than any
  number of input/output-only probes could have narrowed them down.
- **A pre-formatted string can only ever have one width — that's a real
  architectural limit, not a tuning problem.** Representing an interpolation
  as `RawExpr{flat, broken}` (two pre-rendered strings chosen between by a
  group) works when the interpolation's ideal width doesn't depend on where
  it ends up printing. It breaks down when a nested subexpression needs its
  *own* full print-width budget at its actual indent (an outer binary
  operator might get a narrow budget while a nested `(a && b)` two levels in
  needs the full 80 columns from its own indent) — the pre-formatted string
  was narrowed once, uniformly, and can't un-narrow a piece of itself for a
  deeper context. This is a general limitation of the RawExpr representation,
  not specific to the shapes it was first found in: any interpolation with a
  sufficiently nested subexpression can hit it, regular attributes included.

### Cross-platform baseline rule (critical)

The committed baseline is the **Linux CI** failure set. Shrink it only from a
Linux `corpus-compat.yml` run (macOS `--update-baseline` drops
loose-declaration-tag entries Linux includes and breaks CI): read the
Formatter-parity job log for the "N known failures now PASS" count and per-id
NOTICEs, then remove exactly the confirmed-fixed ids.

#### 2026-08-31 — one entry arrived by reclassification, not by regression

`shadcn-svelte/docs/src/lib/components/theme-customizer-code.svelte` (Cluster 20,
breaks-later) is the 789th entry, and it did not start failing: it had been
**excluded** from the comparison set since it was enrolled, so no run ever
compared it. Its exclusion reason claimed the oracle was platform-dependent
("collapsed on macOS, attribute-wrapped on Linux, so byte-parity is undefined").
Measured with the pinned oracle on macOS (`oxfmt@0.64.0`,
`fmt-corpus.oxfmtrc.json`, five consecutive runs, byte-identical) the oracle
emits the attribute-wrapped form at all 20 `<ColorIndicator>` sites — the form
the reason ascribes to Linux — so the two platform descriptions coincide and
nothing supports the claim. What is left is an ordinary line-break divergence
inside `<pre>`: the oracle wraps the component's attribute, rsvelte-fmt keeps
`<ColorIndicator color={value} />` on the line and breaks before `{value};`
instead. Full outputs and the controls are in `fmt-oracle-excluded.md`.

**Growing a shrink-only ratchet is legitimate here only because the pair was
never in the compared population.** The *Cross-platform baseline rule* above
governs shrinking, and it still does; this addition changes neither formatter,
and the accompanying commit touches no formatter code. The claim that the entry
fails on Linux is inferred from the oracle agreeing across the two platform
descriptions, not measured there — if the Formatter-parity job reports this id
as already passing, delete it from this ratchet rather than re-excluding it.

#### 2026-08-31 — the formatter now normalizes line endings; 67 entries are ready to shrink

`rsvelte_formatter::format_with_arenas` rewrote spans in the source it was
handed, so every region it copies **verbatim** carried that source's line
endings through. Prettier normalizes `\r\n` / `\r` to `\n` before it parses, so
the oracle never can. Two regions were reachable — a comment body and a
whitespace-only `<style>` — and everything else (markup between tags, a
`<script>`, a non-empty `<style>`) was already normalized because the indent
pass rewrites those separators itself. That asymmetry is why the defect looked
like six unrelated clusters: **how loud it is depends on which region the file's
CRLF happens to land in, not on the defect.**

Measured on the 788 listed ids that have a source, staged and formatted with the
pinned oracle and `rsvelte-fmt` in directory mode:

| | ids |
|---|---|
| listed and diverging before | 788 |
| rsvelte keeps a CR the oracle does not | 76 |
| …of which the CR is the *only* difference | 63 |
| **now byte-equal to the oracle** | **67** |

The four beyond the 63 are ids where removing the CR also removed a second
difference that the CR was creating (a line the CR pushed past the print width).

**Blast radius, stated as a set rather than as a risk.** The normalizer returns
its input borrowed when the source holds no `\r`, so every source without one is
byte-identical by construction. Of the 33,776 component entries, **306** contain
a CR: 84 listed here, and **222 unlisted — all 222 still match the oracle**
after the change (they were re-formatted and compared, not assumed).

The 67 ids are **not removed from the JSON here**: the *Cross-platform baseline
rule* above binds this file to the Linux CI failure set, and this measurement is
macOS. Shrink them from the next Linux Formatter-parity run.

The regression tests are `crates/rsvelte_formatter/tests/line_endings.rs`, one
per region plus two controls, rather than a `pattern-corpus/` repro: convention 5
of that directory is *commit formatted files*, and a CRLF file is by definition
not the shape the oracle emits.

#### 2026-08-31 — what the remaining entries are, by which printer owns them

The residue is classified by **region**, because the ratchet's own clusters
(`breaks-later`, `indent-only`, …) name the *symptom* and every target the
attribution contract accepts names a *printer*. Each diverging line's first
differing column is mapped to an offset in the oracle's output and tested against
the spans official's `parse({modern: true})` reports, so a file is labelled by
the set of regions its divergences fall in — `js` (a `<script>` body or a
template expression: oxc here, prettier there), `css` (`oxc_formatter_css` here,
PostCSS there), `markup` (Svelte structure, which both sides print with the
*same* intent).

Measured on the 721 that still diverge after the line-ending fix:

| region set | layout-only | characters differ |
|---|---|---|
| `js` only | 51 | 6 |
| `css` only | 13 | 1 |
| `js` + `markup` | 182 | 72 |
| `css` + `js` + `markup` | 114 | 52 |
| `css` + `markup` | 30 | 0 |
| `markup` only | 182 | 2 |
| oracle unparseable | 12 | 4 |

`layout-only` means the two outputs are byte-equal once all whitespace is
removed. Read the table by the two totals it implies: **71 files diverge only
where a different engine prints**, and **634 carry at least one `markup`
divergence**. The existing `deliberate-divergences` entry *The formatter's
JavaScript engine is oxc, not prettier* is about embedded JS and CSS, so it
reaches the 71 and not the 634 — and a `markup` divergence cannot be attributed
to a deliberate choice at all, because the same Svelte-structure printer is held
to the svelte.dev formatter gate, which has **no tolerance** and is green. Those
are defects to fix.

#### 2026-08-31 — an element's edge whitespace: the predicate was already right, the branch was unreachable

`<RadioTile value="test"> <div>c</div> </RadioTile>` — the space either side of the
child is not significant inside a component, and the oracle drops it. rsvelte kept
it. The rule was measured rather than read: 45 parent tags × a `<span>` child, and
a 7×4 parent × child grid.

**The oracle's answer depends on the parent alone.** Block-display elements,
`<slot>` and components trim; inline elements (`span`, `a`, `b`, `button`,
`label`, `svg`, a custom element, …) keep. rsvelte already agreed on every
`RegularElement` in prettier-plugin-svelte's `blockElements` list and disagreed on
exactly three parents — a component, `<svelte:element>`, and `<slot>` — plus,
inconsistently, on a block parent whose child is *also* block, where it was
consulting the child's display as well.

rsvelte's predicate was already correct: `trims_edge_whitespace(tag) ||
is_component_tag(tag)` (`collapse/collect.rs`) is the same partition the oracle
uses. What was wrong is that `try_collapse` returns before reading it as soon as
any child is an element, so only a *pure-text* body was ever trimmed.

**Where the pass runs is not a detail: that whitespace is also the hug signal.**
`shouldHugStart` hugs only when the content touches the open tag, so a trim placed
*before* the layout passes makes both sides believe the content is adjacent and
changes the layout. The pass therefore runs **last**, after every breaking pass has
read the whitespace it needs. Two consequences worth stating: the trim only ever
deletes spaces and tabs, so it can neither remove a line break nor lengthen a line;
and it declines a fragment with two or more element children, where the element is
laid out broken and the oracle breaks its edges too.

Measured over the whole corpus with the two binaries, hashing all 33,776 component
outputs:

| | ids |
|---|---|
| output changed | 59 |
| …now byte-equal to the oracle (was not) | **48** |
| …**regressed** (was equal, now not) | **0** |
| …differ from the oracle before and after | 11 |

Regression tests: `crates/rsvelte_formatter/tests/edge_whitespace.rs`, four
trimming shapes and five controls (three inline parents, a newline-bearing edge, a
`<pre>`, and the two-child shape the pass declines).

As with the line-ending fix above, the ids are **not** removed from the JSON here —
the *Cross-platform baseline rule* binds this file to the Linux CI failure set.

#### 2026-08-31 — the same trim, seven node types it never reached

The pass above was measured on *tags* and implemented on *node types*, and the two
are not the same partition. `is_component_tag` already answers `true` for every
`svelte:` prefix, so the predicate was right for `<svelte:fragment>` and its
siblings — but `trim_edge_target`'s `match` listed only `SvelteElement`
(`<svelte:element>`) and `SvelteComponent`, and the other seven `svelte:*` node
types fell to its `_ => None`. **A predicate keyed on a name cannot be reached by a
caller keyed on a variant**, and nothing in the first measurement could see the gap:
the 45-parent grid injected tags into one `RegularElement` slot.

Measured one tag at a time against the oracle, `<TAG> <b>c</b> </TAG>`:

| parent | oracle trims | rsvelte trimmed (before) |
|---|---|---|
| `svelte:fragment`, `svelte:head`, `svelte:boundary`, `svelte:body`, `svelte:window`, `svelte:document`, `svelte:self` | yes | **no** |
| `svelte:element`, `svelte:component`, `div`, `Comp` | yes | yes |
| `span` | no | no |

`<svelte:options>` is absent because both compilers reject content in it
(`svelte_meta_invalid_content`) — measured, not assumed.

Corpus differential over all 33,776 component outputs, base = the merge commit's
own binary (md5 identical to the tree built before this change):

| | ids |
|---|---|
| output changed | 24 |
| …now byte-equal to the oracle | **24** |
| …**regressed** | **0** |
| …still differ from the oracle | 0 |

Those 24 are exactly the residue's `intra-line-ws` × `markup` cell — 23
`<svelte:fragment slot="…">` and one `<svelte:head>`. Positive control: with the
seven arms removed, `every_svelte_special_element_drops_it` fails at
`<svelte:fragment>` and the other eight tests in the file stay green.

#### 2026-08-31 — the axis the collected corpus cannot hold: an input where the reorder actually runs

`reorder_sections` hoists a `<script>` / `<style>` that sits between two markup
runs and rejoins them. The separator was a hardcoded `\n`, so a blank line after
`</script>` was lost. It is fixed, and the interesting part is the population.

**Published components write `<script>` first**, so on the 33,776 collected
components the hoist is a no-op or nearly so: the merge branch fires on **2** of
them and neither has a blank line at that gap. The corpus therefore scored
33,776 byte-identical outputs before and after the fix — the gate could not see
the defect at any corpus size, because *the axis is not "which repository" but
"does the reorder run at all"*. What reached it was a hand-written
`compatibility/pattern-corpus` file (`d129fd211`'s analyze repro, which happens to
put `<script>` after the markup) landing in the gate as one NEW entry.

Two consequences worth keeping. The deciding gap is the source's gap **after** the
section, and it has to be read off the *source*: by the time the reorder pass runs,
an earlier pass has normalised that gap in `out` to a blank line either way, so
`out` cannot answer the question. And the hand-written cases in
`blank_lines.rs` all opened their trailing markup run with an element — the corpus
entry opens it with a **comment**, which is why that exact input is now pinned as
`the_corpus_repro_leads_the_hoisted_script_with_a_comment`. Positive control:
hardcoding the separator back to `\n` turns that test red along with the six
others covering the same join.

#### 2026-08-31 — a fill is a break OPPORTUNITY, and the cluster it was scoped against had four mechanisms

prettier prints a fragment's children as a **fill**: an inline space between two
children is a break opportunity taken only when the line would overflow. rsvelte's
indent pass took every one of them once the fragment was broken. Where the run can
be measured from the source — every non-whitespace child an `ExpressionTag`, whose
flat text is its own source slice — the width is now computed and the run stays on
one line when it fits.

The guard on that predicate is the load-bearing half. Upstream's `shouldHugStart`
is false when the first child is a text node opening with a line break, and it then
sets `noHugSeparatorStart = hardline` (`prettier-plugin-svelte/plugin.js:1218`),
which **breaks the enclosing group** — so under a non-hugged start every separator
breaks however well the run fits. Without the guard the first version of this fix
turned `<div>\n  {key} {a}\n</div>` and its `<span>` twin from MATCH to DIVERGE.
Both directions are pinned in `adjacent_expression_tags.rs`, and each ablation
kills exactly the test that names it: no-op the predicate and only
`a_hugged_run_separated_by_spaces_stays_on_one_line_when_it_fits` fails; delete the
`shouldHugStart` guard and only `a_run_under_a_non_hugged_start_breaks_at_every_space`
fails.

Corpus differential over all 33,776 component outputs, base = the same tree without
this change: **1 output moved, it moved to byte-equal with the oracle, 0 regressed**
(`svelte-table/example/example6/ContactButtonComponent.svelte`, a listed entry).
svelte.dev hard gate `1103/1103 pass, 0 fail, 0 unparseable`.

**The reach is the finding.** This work was scoped against a cluster measured at 84
files ("inline element content wrapping") and re-measured at 63 after the CRLF fix.
Re-run against the oracle on the current tree, **45 of those 63 already match** — the
list is a historical record, not an inventory — and the 18 that remain are not one
mechanism: 11 are a hugged-close inline element whose content keeps the source
indent, 3 are `<style>` body indentation, 2 a `<script type="application/ld+json">`
body, 2 a block body that keeps source tabs. **A cluster named from a symptom
(an indent delta) partitions by symptom, not by decision point.**

The sibling cluster was two *directed* sets — 3 files where the oracle keeps a
`} {` run flat and rsvelte breaks it, 34 where rsvelte keeps it flat and the oracle
breaks it. The fix moves **1 of the 3 and 0 of the 34**, which answers the open
question about whether they share a decision point: they do not. The mechanism says
the same thing independently — the predicate can only *permit* a flat run, never
force a break, so it structurally cannot reach the 34.

#### 2026-08-31 — an element's width budget omits four of its possible children

Found while characterising those 34. `<strong><CHILD … /></strong>` at 90 columns
under `printWidth: 80`, one cell per child kind, oracle = oxfmt(`svelte: true`):

| child | oracle | rsvelte |
|---|---|---|
| `<div>`, `<em>`, `<Self>` | BROKEN | BROKEN (MATCH) |
| `<svelte:self>`, `<svelte:fragment>` | BROKEN | **FLAT** |
| `<svelte:component>`, `<svelte:element>` | BROKEN | BROKEN, but not the oracle's shape |

Every ordinary child kind matches; all four `svelte:*` kinds diverge, in the same
parent, with the same attributes. The controls move, so this is not a property of
the width itself: the same four tags **do** break their own attribute list when they
are the top-level node (measured, 6/6 MATCH), so what is missing is their
contribution to the *parent's* budget. This is the same shape as the
`trim_edge_target` gap recorded above — a `match` that enumerates
`RegularElement` / `Component` and lets the `svelte:*` variants fall to `_` — and
`build_open_attr_doc` (`collapse/doc_build.rs:685`) is one confirmed instance of the
pattern, not yet shown to be *the* cause. Unfixed; its corpus reach is unmeasured.

#### 2026-08-31 — the over-width direction is 260 to 12, and the `svelte:*` sliver is 1

The `svelte:*` grid above says nothing about how much of the ratchet it reaches, so
that was measured separately. Per listed entry, count the output lines wider than
`printWidth` on each side and compare the two counts *within the file* (which
controls for a genuinely unbreakable long line, since it appears on both sides):

| | entries |
|---|---|
| rsvelte has MORE over-width lines than the oracle | **260** |
| the oracle has more than rsvelte | 12 |
| equal and non-zero | 323 |
| neither side over width | 53 |

788 listed, 648 of which still diverge on this tree. The direction is one-sided
21:1, which is the signature of a missing width check rather than of layout noise.
**33 of the 34 "rsvelte keeps a `} {` run flat" ids sit inside the 260**, so that
cluster is a subset of this one.

Two cautions on the number. It counts a *symptom* (an over-width line), not a
decision point — the section above is about exactly that mistake, and 260 is an
upper bound on however many mechanisms are inside it. And the `<svelte:` variant
that motivated the measurement reaches **1** entry, against 11 for `<div`, 36 for
`<span` and 126 for any tag: the first proxy tried — "the first differing line
mentions `svelte:`" — returned 13, and inspecting them showed the string was in the
surrounding *context* line in 12 of the 13. A substring hit near a divergence is not
a reach measurement.

#### 2026-08-31 — the 260 partitioned, and the largest decision point in it is 54

Bucketed by the shape of the first over-width line rsvelte emits that the oracle
does not (`instruments/overwidth260.mjs`; the list is
`agent-c/overwidth260.json`):

| n | the over-width line starts with |
|---|---|
| 67 | script / style / prose text |
| 66 | a block header `{#…}` |
| 30 | an attribute |
| 28 | a hugged `>` line |
| 21 | an HTML open tag |
| 20 | an expression `{…}` |
| 15 | other |
| 6 | a component open tag |
| 5 | `{@…}` / `{:…}` / `{/…}` |
| 2 | a close tag |

The block-header bucket splits again by where the width goes: **9** where the
header expression itself is over width and the oracle breaks the expression, and
**54** where the header fits and the one-line *body* overflows. That 54 is the
largest single decision point found in the residue so far, and it reproduces in
three cells with two controls (oracle = oxfmt(`svelte: true`), `printWidth: 80`):

```
B1 {#if isSub}<div class="header-row"><slot … /></div>{/if}   DIVERGE
B3 {#each xs as x}…{/each}                                     DIVERGE   same shape
B4 {#key k}…{/key}                                             DIVERGE   same shape
B2 the same body, short enough to fit                          MATCH     control
B6 the same body, already broken in the source                 MATCH     control
```

The oracle keeps the block tags glued and breaks the *element's* content
(`{#if isSub}<div class="header-row">⏎    <slot … />⏎  </div>{/if}`); rsvelte
leaves the whole line flat. B6 matching is what rules out a source-layout
explanation.

**B5 is the discriminating cell.** With two arms
(`{#if a}<div …>…</div>{:else}<div …>…</div>{/if}`) rsvelte leaves the *first*
arm flat and breaks the *second* one's open tag — so a pass that can break this
shape exists and reaches one arm and not the other. Whatever gates it is a
position test, not a missing capability.

#### 2026-08-31 — the 54 is one parameter: a block's closing tag is not in the width

Holding the body fixed and growing it one column at a time, the two formatters'
break thresholds can be read off directly. The oracle breaks at total 81 in every
form, which calibrates the instrument; rsvelte's threshold is late by **exactly the
length of the closing block tag**:

| form | closer | oracle breaks at | rsvelte breaks at | late by |
|---|---|---|---|---|
| `{#if a}…{/if}` | 5 | 81 | 86 | **5** |
| `{#key a}…{/key}` | 6 | 81 | 87 | **6** |
| `{#each a as b}…{/each}` | 7 | 81 | 88 | **7** |
| `<span>…</span>` | 7 | 81 | 81 | 0 |
| `<Wrap>…</Wrap>` | 7 | 81 | 81 | 0 |
| the element alone | — | 81 | 81 | 0 |
| the element + 7 characters of trailing text | — | 81 | 81 | 0 |
| the element + a trailing sibling element | — | 81 | 81 | 0 |

So it is not "trailing content on the line is ignored" — trailing text and a
trailing sibling are both counted. It is the block's `{/…}` specifically, and the
element parents are the controls that make that a claim rather than an
observation. An element's own close tag is inside its span; a block's is not.

50 of the 54 entries are a block header directly followed by an element (33 a
component, 17 an HTML element), and the remaining 4 are a text or nested-block
body, which the same rule predicts. Whether all 54 share this one parameter is
what the fix will measure — the id list is in `agent-c/overwidth260.json`.

The rule **composes**, which is the prediction that makes it a rule rather than a
fitted constant: a block nested in a block (`{#if a}{#if b}<el …/>{/if}{/if}`) is
late by **10**, exactly the two closers. Two body kinds are *not* covered and must
not be folded in — a bare expression body is late by 3, and a prose-text body never
breaks at all in the range measured while the oracle breaks at 86. Those are
separate constants, so "all 54 share one parameter" stays a prediction the fix will
test rather than a claim.

#### 2026-08-31 — the fix, and what it measured: 33 of the 54, not 54

`push_open_tag` measures the open tag against the width from the element's leading
column; `open_tag_leading_indent` already accounts for a `{#if …}` *prefix* by
reading the element's source column, and nothing accounted for the `{/…}` *suffix*.
`trailing_block_close_width` adds it. Every threshold in the table above is now 0,
including the nested case, and the element controls did not move.

Corpus differential over all 33,776 component outputs, base = the same tree with
only this change reverted: **34 moved, 33 to byte-equal with the oracle, 0
regressed**, 1 moved without reaching equality. All 34 are inside the 54.

**So the 54 was not one decision point — 33 of it was.** The 21 that remain are not
a residue of the same rule; they are the same missing quantity in a *different*
pass, and the split is legible:

- a body element with **no attributes to wrap** (`{#if p.rating}<small><Star … /> ({p.rating})</small>{/if}`)
  must break by **hugging**, which is `collapse/hug.rs`, not the open-tag path;
- a body that is a bare expression (`{@render children(feature)}`) is the
  separately-measured constant of 3;
- two are `<pre>` content indentation, which is a different mechanism entirely.

That is the two-ports shape again: one upstream decision, two implementations here,
and fixing one leaves the other. The hug path is the next instalment.

**The first version of this fix regressed exactly one real file**, and no grid
predicted it: `svelte-ux/…/docs/components/Table/+page.svelte` writes
`</td>{/each}`, so the closer sits on the **close tag's** line, not the open tag's,
and charging it to the open tag broke a tag that fits. The guard is that the
element's own span must be single-line. Both halves have a positive control, and
the first attempt at each was **non-discriminating**: the `{#each}` test passed
under full ablation until its header was shortened so the element alone lands
exactly on 80 (a longer header breaks with or without the fix), and the
`</td>{/each}` test passed under guard ablation until the open tag was widened to
75 columns so the closer is what crosses the width. Neither was visible from the
assertion; both came out of running the ablation.

#### 2026-08-31 — `rsvelte(oracle(S)) == oracle(S)` splits the residue without writing a fix

Byte parity needs `rsvelte(oracle(S)) == oracle(S)`: the oracle's output is already in the
oracle's own normal form, so a formatter that agrees with it must leave it alone. The condition
is necessary, not sufficient, and it costs one extra pass — which makes it a way to size a
defect class *before* anyone writes the fix. Measured over the listed ids on the tree at
`9cbb4148b` (`instruments/fixedpoint.mjs`):

| | ids |
|---|---|
| `rsvelte(S)` already equals `oracle(S)` | 173 |
| diverges, but `rsvelte(oracle(S)) == oracle(S)` | **66** |
| diverges on the oracle's own normal form | **549** |

The 66 are the ones whose divergence **cannot survive re-formatting**, so nothing about the
input's own content explains them — only its layout does. That is the fingerprint of a
source-range pipeline: `format_with_arenas` rewrites spans, so a decision that reads the
source's line breaks is reading an input prettier does not have (it parses and re-prints, and
its input's layout is gone by then). The CRLF defect recorded above is the same shape one level
down — a copied region carried the source's line *endings*; here a decision reads the source's
line *positions*.

**It is not the element-flatten decision.** That one was tested directly and is
source-independent: the same over-width element flat in the source and broken in the source
produce byte-identical rsvelte output (`instruments/widthgrid.mjs`, W1 vs W2), and the same
holds for an under-width element (W3 vs W4). So whatever reads the layout sits in a different
pass, and a fix aimed at the flatten decision would move none of the 66. Recorded before the
66 are worked so the next person does not re-derive the hypothesis the grid already killed.

Two cautions on the split. The 549 includes the 8 ids on which **the oracle is not its own
fixed point** (below), where "agrees with the oracle" is not well-defined at all, so 549 is an
upper bound on the layout-independent defects. And the buckets move as fixes land: the same
measurement read 139 / 66 / 575 + 8 before the two fixes above, and the 34 they moved went from
the third bucket to the first with the 66 unchanged — which is the control that the condition
is measuring the classes it claims to.

#### 2026-08-31 — the hug path's guard, and a perfect grid worth one corpus file

The 21 the closer fix did not reach split by measurement, not by inspection. Growing the
body one column at a time inside `{#if r}…{/if}`:

| the body element's content | oracle breaks at | rsvelte breaks at |
|---|---|---|
| plain text only | 81 | 81 |
| an expression tag | 81 | 81 |
| text **and a nested element** | 81 | never, to ~147 columns |

Same position, same tags, only the content's *kind* varies — so this is reachability, not
width. `element_hug_parts` (`collapse/hug.rs:146`) refuses any content containing `<`, and
`try_hug_block_inline_body` is its only route for a block's body. The caller splices `content`
back verbatim, so a nested element in it is safe; the doc-building caller treats it as a text
run and still refuses, which is why the guard is now a parameter rather than deleted. Two
places in `doc_build.rs` already carry hand-rolled copies of "the same hug group without the
`contains('<')` guard" — the codebase had hit this wall twice before.

**The grid went from 3 diverging cells to 0 and the corpus moved one file.** That is the number
to keep: a minimal grid can be completed while the population it was drawn from barely moves,
because the real inputs are blocked further along. Do not size a class by the grid that
diagnoses it.

The 20 that remain are two shapes, and their offsets name themselves:

| shape | oracle | rsvelte | late by | what that equals |
|---|---|---|---|---|
| `{#if a}<Label … />{:else}{label}{/if}` | 81 | 100 | **19** | `{:else}{label}{/if}` exactly |
| `{#if a}<div class="…"><slot … /></div>{/if}` | 81 | 104 | **23** | `<slot name="a" />` + `</div>` exactly |
| the same with `<span>` (control) | 81 | 81 | 0 | — |

The first is `trailing_block_close_width` scanning only a run of `{/…}`: a block *arm* opens
with `{:`, and the whole remainder of the block follows it on that line. The second is a
block-display body, where the oracle emits the block-break form rather than a hug and rsvelte
measures the open tag alone — the content and the close tag are outside its budget. The
`<span>` control is what makes that a claim about block-display rather than about blocks.

#### 2026-08-31 — the trailing-tag scan reads a closer only, and the arm is on the line too

`trailing_block_close_width` counted a run of `{/…}` after the element and nothing else, so
`{#if a}<Label … />{:else}{label}{/if}` was late by **19** — the exact width of
`{:else}{label}{/if}`. Reading any tag rather than only a closer fixes it, and the same one-line
change also fixes a shape that was never diagnosed: a plain sibling expression tag
(`{#if a}<Label … />{aVeryLongExpressionNameIndeedYes}{/if}`) was late by 34 on all four widths
probed, and now matches on all four.

The scan stops at the first thing that is **not** a tag, and that boundary is measured rather
than assumed. With a second element there (`{#if a}<Label … /><OtherComponent />{/if}`) the
oracle breaks the SECOND element and keeps the first flat at 26, 30 and 36 columns of
attribute — so charging that element's width to the first would move rsvelte in the wrong
direction. That trio diverges identically before and after the change, which is what makes it a
control rather than a regression.

Measured: the `{:else}` width grid goes 5 diverging cells → 0, the expression-tag grid 4 → 0,
the 33,776-file corpus differential moves **7 files, 3 to byte equality, 0 regressions**, and the
`overwidth260` cluster goes 34 → 37 matching.

#### 2026-08-31 — where the layout-independent residue actually is

The 549 entries that satisfy `rsvelte(oracle(S)) != oracle(S)` were split by the SIGN of the
first differing line's width — the direction team-lead asked for, because "packs one more" and
"packs one fewer" are opposite defects that a count folds together:

| | count |
|---|---|
| later — rsvelte packs more onto the line | 328 |
| earlier — rsvelte packs fewer | 218 |
| same width, different text | 2 |

Crossed with the construct that starts the line, the largest single cell is **135 = later ×
attribute or CSS declaration**, and reading it names one shape: **the oracle breaks inside an
expression embedded in an attribute value and rsvelte does not**. Splitting `later` by where the
oracle's line ends gives 17 that break immediately after the `{` and **179 that break
mid-expression**; of those 179, **101** have a ternary arm (`?` / `:`) on rsvelte's next line.

Two reductions came out of that 101, and the second is the one that matters:

- A `style:` / `class:` directive whose value is a ternary keeps the test flat where a **plain
  attribute of the identical name length** breaks it exactly like the oracle (12 columns each,
  same expression, same indent; a plain attribute swept from 6 to 16 columns never diverges).
  That is the directive value's own narrowing path in `markup/directive.rs`. It is **6 of the
  101**.
- The dominant sub-shape is **78 of the 101**: an expression interpolated into a *quoted*
  attribute value whose literal prefix is already past the width. Six lines reproduce it, with
  three controls at MATCH — a short prefix, the same ternary as the whole unquoted value, and a
  long prefix with a non-ternary binary.

The reusable part is that the first reduction **drifted**: it is a real defect and a real
control, and it accounts for 6 of the population the grid was drawn from. A hand-built grid
finds the shape its author reached for; only classifying the whole cluster says which shape the
population is made of.

The code path for that 78 is located, and it is a policy rather than an oversight.
`render_value_sequence_doc` (`markup/value_sequence.rs:52`) — the Doc model that formats each
interpolation at its true running column — returns `None` when `interp_count < 2`, so a value
with exactly ONE interpolation falls to the legacy branch. That branch narrows by the
expression's start column only, and when the start-column form still fits it calls
`minimal_break_extra`, whose stated contract is *"force the MINIMAL break so only the
expression's top-level operator wraps, matching the oracle"*. For a ternary the top-level
operator is `?`/`:`, so the test is never re-measured — which is exactly the divergence. The
oracle instead formats the expression at the width actually left at its start column, and at a
start column past 80 that breaks the test too. Changing this is a change to that policy, not a
missing case, so it needs its own before/after id set.

#### 2026-08-31 — a display:block body is the other half of the block-body rule, and one predicate hid it

`{#if a}<div class="…"><slot name="a" /></div>{/if}` stayed flat at 81 columns while the oracle
put the content on its own indented line. The `<span>` twin — identical position, identical
content, identical width — was already correct after the hug fix, which is the control that makes
this about **display** rather than about width; and with the class long enough that the open tag
itself breaks (60 columns) both sides agree, so the gap is exactly the interval where the open tag
fits and the whole line does not.

The reason nothing reached the decision is worth recording, because the first fix for it measured
**zero**. `element_hug_parts` guarded on
`is_block_display(tag) || is_inline_block(tag) || trims_edge_whitespace(tag)` — and
`trims_edge_whitespace` is *defined* as `is_block_display(tag) || matches!(tag, "slot" | "title" |
"svelte:boundary")`, so the first disjunct is redundant and bypassing it alone leaves the element
rejected by the third. Both binaries were built and run: the half-bypass is byte-identical to no
bypass at all on the whole grid. **A guard written as a disjunction can have one term subsume
another, and negating the term you were thinking of is then a no-op** — the two arms have to be
measured, not read.

Measured: the display × width grid goes 4 diverging cells → 0 with 14 controls unchanged, the
33,776-file corpus differential moves **5 files, all 5 to byte equality, 0 regressions**, and the
ablation moves exactly one of the three new tests.

The quoted-interpolation cluster is pinned before any fix touches it, so the count that moves
afterwards is the number of decision points rather than a guess. Classifying all 549 by whether
the first divergence sits at an interpolation **inside a quoted attribute value** — anchored on
the enclosing open tag so the quote parity does not depend on where the walk starts — gives
**104: 87 later and 17 earlier**, against 304 with no interpolation at the divergence at all, 132
with an interpolation outside a quoted value, and 7 with no anchor within 40 lines. A first,
deliberately cruder predicate (a fixed 12-line window) answered 106, so the number is not an
artefact of how the walk is anchored. **Both signs are in one cluster**: `{step.requires_id &&
!location.id` is the same budget with rsvelte breaking too early, so a fix measured only against
the `later` half would report half its own effect — and could move the `earlier` half the wrong
way without anyone seeing it.

#### 2026-08-31 — the quoted-value interpolation cluster: 57 of the pinned 104, and a constant bracketed by its own regressions

The framing in the section above — that this needs a change to `minimal_break_extra`'s policy —
was wrong, and measuring it first is what showed that. `render_value_sequence_doc` already
formats every interpolation at its true running column; it just declined to run below two
interpolations. Letting a single-interpolation value through (`interp_count < 2` → `< 1`) reaches
the whole cluster, and the legacy path's policy is untouched — it simply stops being reached for
these values.

The second half is one column, and it was **bracketed, not derived**. That function's printer
measures at `line_width - 1` (reserving the closing `"`), while `broken_width` — which decides the
*shape* — used a bare `line_width - col`. Three binaries, three full-corpus differentials:

| reserved | moved | byte-identical | **regressed** |
|---|---|---|---|
| 0 columns (threshold alone) | 93 | 56 | **4** |
| 2 columns | 91 | 57 | **4**, a different four |
| **1 column** | 86 | **57** | **0** |

The two sets of four run in opposite directions. At 0 the oracle breaks at 79 and rsvelte emits
81 — under-breaking; at 2 the oracle's line lands on exactly 80 and rsvelte breaks earlier —
over-breaking. Measured on the real columns, one set requires the reservation to be at least 1 and
the other at most 1, so the integer is pinned from both sides by inputs that exist. Deriving it
from the printer's own arithmetic gives 2, which is the value the corpus rejects.

Against the id set pinned *before* the change, `match-oracle` goes **0 → 57 with 0 broken**, and
those 57 are exactly the corpus-wide fixes — the change has no effect outside the cluster it was
aimed at. The other 47 of the 104 are further decision points.

**The first boundary tests written for this measured nothing.** Both passed on all four binaries,
because the indentation was chosen by hand and put the first chunk off the boundary. Reduced again
at the two real files' real attribute indents (4 columns and 14), each fails on exactly one wrong
constant and on neither the right one nor the base. Two of the other four expectations were
transcribed wrong — a continuation indented by 2 where the oracle indents by 4, and single
quotes where an unquoted value keeps double — and the suite caught both, which is the whole
reason a test states the output rather than asserting that the output did not change. A boundary case is a property of the column
arithmetic, not of the shape — writing the shape and picking a plausible indent reproduces the
shape and not the boundary.

With that landed the layout-independent set stands at **490 of 549 diverging (59 now reproduce the
oracle's fixed point, up from 2)**, and its largest cell changes hands: `later × attribute/CSS`
drops 135 → 62 while `earlier × text/script` rises 120 → 133. The rise is not a regression — the
corpus differential recorded 0 — it is 15 units whose *first* divergence moved to a later line
once the earlier one was fixed, which is what a first-divergence key does by construction.

That new largest cell has a name already. Its members are continuation lines of a quoted value
with **two or more** interpolations, where the oracle keeps 68 columns and rsvelte breaks at 55 —
over-narrow. `col` in `render_value_sequence_doc` is the running *flat* column, so once an earlier
interpolation in the same value has broken, a later one's real column is much smaller than `col`
says and `broken_width` is far too tight. That is the next decision point, and it is the mirror of
the one just fixed: the same variable, wrong in the other direction, on the population the model
was already running on.

#### 2026-08-31 — the mirror defect, pinned and reduced but NOT a one-liner

The cluster named above is pinned at **44 ids** (`agent-c/multi-interp-ids.json`) and reduces to
five lines of input at four indentation depths, all four diverging:

```svelte
<div class="step-badge {index <= currentStep ? 'bg-primary text-primary-content' : 'bg-base-200'} {step.requires_id && !location.id ? 'opacity-50 cursor-not-allowed' : ''} {index === 0 && isEditMode ? 'ring-2' : ''}"></div>
```

The oracle keeps `: 'bg-base-200'} {step.requires_id && !location.id` at 60 columns; rsvelte breaks
it at 47. The second interpolation's real column is about 27, because the first interpolation
above it has already broken — but `col` is the running **flat** column, so `broken_width` is
computed as if all of the first interpolation's text still sat on this line.

**The obvious fix does not work, and that is why this is recorded rather than attempted.** Resetting
`col` after a breakable part assumes that part breaks; the printer decides that per group, at print
time, and both outcomes occur. A shape built under the broken assumption is right exactly when the
earlier group breaks and too wide when it stays flat — the two cases need two different shapes from
one build-time computation. Doing this properly means the `broken` form becoming a function the
printer evaluates at the column it actually has, which is a change to `Doc::RawExpr`'s contract
rather than to an arithmetic expression. The 44 are pinned so that whoever takes it can count.

<a id="fmt-oracle-excluded"></a>

## fmt-oracle-excluded.json — why each id is excluded

Justification for every id permanently excluded from the formatter-parity gate
(`fmt-oracle-excluded.json`). Excluded ids are removed from the comparison set
entirely (neither matched nor failed). Each entry carries a `"class"`
(`oracle-bug` | `invalid-input` | `migrate` | `engine-divergence`) and a
`"reason"`; this file records the class-level rationale.

**Current baseline: `fmt-oracle-excluded.json`, 25 entries.**

`fmt-verify.mjs` warns if an excluded id is no longer in the parity set (can be
deleted) and notices if an excluded id now matches byte-for-byte (the oracle bug
was fixed upstream, or rsvelte was wrongly changed to reproduce it — avoid the
latter).


#### DoD-4 attribution

Attribution of `fmt-oracle-excluded.json`:

| n | target | cluster |
|---|---|---|
| 3 | [`deliberate-divergences`](#deliberate-divergences) | the `$props()` comment slot the #3515 repros depend on |
| 3 | [`deliberate-divergences`](#deliberate-divergences) | `engine-divergence` — oxc's line-breaking, not prettier's |
| 5 | [`deliberate-divergences`](#deliberate-divergences) | `invalid-input` and `migrate` — inputs no compiler accepts, and Svelte 4 migrator output |
| 5 | [`deliberate-divergences`](#deliberate-divergences) | both texts compile to byte-identical client and server `js` **and** `css` |
| 3 | [`deliberate-divergences`](#deliberate-divergences) | rsvelte reproduces `oxfmt <file>.css` byte-for-byte; the oracle's Svelte path disagrees with oxfmt itself |
| 2 | [`upstream_issues/3035-prettier-plugin-svelte-drops-a-nested-pattern-key-in-each.md`](../upstream_issues/3035-prettier-plugin-svelte-drops-a-nested-pattern-key-in-each.md) | `oracle-bug` — the `{#each}` head drops a nested pattern's property key |
| 1 | [`upstream_issues/oxfmt-svelte-css-eats-a-css-escape-terminator-space.md`](../upstream_issues/oxfmt-svelte-css-eats-a-css-escape-terminator-space.md) | `oracle-bug` — a CSS escape's terminator space is eaten, and a live rule becomes dead |
| 3 | [`upstream_issues/oxfmt-svelte-css-keeps-source-tabs-around-a-selector-comment.md`](../upstream_issues/oxfmt-svelte-css-keeps-source-tabs-around-a-selector-comment.md) | `oracle-bug` — source tabs survive on a comment-bearing selector under `useTabs: false` |

**Every one of the 25 entries now carries a target.** The last one that did not —
`shadcn-svelte/.../theme-customizer-code.svelte` — was not an oracle bug at all, and it left
this file for `fmt-known-failures.json`; the measurement is under *A second stated reason was
falsified* below. The control that decides it is one character wide: replace the `<pre>` with a
`<div>` and the two formatters agree byte-for-byte, so breaking a line at a text whitespace
position inside a whitespace-preserving element is rsvelte-fmt's defect alone, not one it
shares with the oracle. Compiled three ways, source-vs-oracle differs on 28 server and 8 client
lines and **every one of them differs only in leading horizontal whitespace** — the
`useTabs: false` reindentation both formatters perform; `css.code` is byte-identical on all
three texts and both targets.

### Re-measured twice: **six reasons did not reproduce on 2026-08-30, and the 2026-08-31 pass closed nine of the ten**

On 2026-08-31 the ten entries that had carried no attribution target were run through
`scripts/compat-corpus/fmt-one.mjs` against the current `rsvelte-fmt`, and both texts of each were
compiled for `client` and `server` and compared on `js.code` **and** `css.code`:

- **`textarea-content` now matches the oracle byte-for-byte** (720 bytes on each side) and has been
  removed from the list. CI's Linux run reports the same for it and for `snippet-rest-args`
  (`[fmt-verify] NOTICE: excluded id now matches oracle`), which is also removed — 29 entries → 27.
- **Five compile to byte-identical output on all four comparisons** and are now recorded under
  [`deliberate-divergences`](#deliberate-divergences).
- **Three are the CSS engine**, and `rsvelte-fmt` reproduces `oxfmt <file>.css` byte-for-byte on
  every one, so the oracle is the same tool answering differently —
  [`deliberate-divergences`](#deliberate-divergences).
- **One is left open**, for the reason stated above the table.

### The 2026-08-30 pass: **six recorded reasons do not reproduce**

Every `oracle-bug` entry was re-run through the pinned oracle (`oxfmt@0.64.0` with
`scripts/fixtures/fmt-corpus.oxfmtrc.json`, the same in-place invocation `fmt.mjs` uses), and
where the recorded reason claimed a *semantic* loss the two texts were additionally compiled with
`submodules/svelte/packages/svelte/src/compiler/index.js` and their outputs compared.

| entry | recorded reason | measured 2026-08-30 |
|---|---|---|
| `await-then-destruct-array-nested-rest` | drops nested rest → `...[...undefined]` | **does not reproduce** — `{:then [a, b, ...[, , c, ...{ length }]]}` is preserved |
| `block-expression-assign` | emits invalid `{@const x = (h = 0}` | **does not reproduce** — emits valid `{@const x = h = 0}`; it *adds* parens to `{#if a = 0}` |
| `textarea-content` | collapses whitespace-significant content | **does not reproduce** |
| `whitespace-after-script-tag` | reads an empty script and **loses the body** | **does not reproduce** — `let name = "world";` survives |
| `whitespace-after-style-tag` | loses `div { color: red; }` | **does not reproduce** — it survives |
| `parser-legacy/textarea-end-tag` | collapses whitespace the textarea renders | **does not reproduce as a semantic defect.** Trailing `</textarea` text and blank lines *are* deleted from the file, but both texts compile to a **byte-identical** `<textarea>` body — the deleted run is past where Svelte closes the element |
| `css/comment-html`, `comments-after-last-selector`, `parser-modern/css-pseudo-classes` | mixed tab/space indentation | **reproduces**, and it is one cause, now filed — see the table above |
| `css/unicode-identifier` | a cosmetic space before `{` | **reproduces, and is worse than recorded** — the escape-terminator collapse turns a used scoped rule into a pruned one; filed |
| `css/css-vars` | `--bar: !important;` gains a second space | **reproduces**; the compiled CSS differs only in that space |
| `adversarial/css/css-custom-property-values` | the same value formatted two ways | **reproduces**, and is cosmetic: `--sel: a > b ~ c` → `a > b ~c` (whitespace around a combinator is optional, so the selector is unchanged) and `url('/x.png')` → `url("/x.png")` |
| `shadcn-svelte/theme-customizer-code` | platform-dependent output | the **platform axis was not re-measured**; the output does carry 61 tab-bearing lines under `useTabs: false` |
| `svelte.dev/.../+layout.svelte` | `calc()` wrap position | **not re-verified in this pass** |

Two things this cost, and both generalize. **A reason can be stale in either direction**: five of
the six above overstate the defect, and `unicode-identifier` *under*states it — the entry was
filed as a space before a brace and is in fact a selector whose meaning changes. And **"the
formatter deleted text" is not "the output is wrong"**: `textarea-end-tag` reads as content loss
and compiles identically, which only a compile of both texts can tell you.

**This exclusion list is permanent, so nothing re-checks it.** The ratchets are two-sided and a
listed entry that starts passing fails CI; an *exclusion* has no such pressure, and its
justification was written against whatever oxfmt version was installed that day. `fmt-verify.mjs`
warns when an excluded id matches byte-for-byte, which catches the strongest case and not this
one: a reason can go stale while the pair still differs.

**Two facts about this set were measured on 2026-08-30 and neither was known when it was
written.** Re-running the pinned oracle (`oxfmt@0.64.0`, `fmt-corpus.oxfmtrc.json`) over all
sixteen and feeding each result back to `svelte@5.56.10`'s `parse({modern: true})`:

- **Exactly 2 of 16 still produce text the official compiler rejects** — the two
  `{#each}` nested-pattern files above, one cause, now filed. The other 14 produce
  output that *parses*, which is not the same as output that is correct: the recorded
  defects there are semantic (a dropped variable, collapsed whitespace-significant
  `<textarea>` content) or cosmetic (indentation), and **the parse oracle cannot see
  either class**. Read the 2 as "confirmed by an instrument", not the 14 as "cleared".
- **At least one stated reason no longer reproduces.**
  `runtime-legacy/samples/block-expression-assign/main.svelte` is recorded as "oxfmt drops
  the closing paren in `{@const x = (h = 0)}`, producing `{@const x = (h = 0}` — invalid".
  Under 0.64.0 the output is `{@const x = h = 0}`, which parses and is semantically
  identical (`=` is right-associative). Whether the entry would now *match* rsvelte-fmt
  byte-for-byte — and so should be deleted rather than re-worded — is unmeasured; it needs
  a built `rsvelte-fmt`.

**A second stated reason was falsified on 2026-08-31, and that entry left this file.**
`shadcn-svelte/docs/src/lib/components/theme-customizer-code.svelte` was excluded as
`oracle-bug` for "cross-platform non-determinism": the overflowing self-closing
`<ColorIndicator color={value} />` inside `<pre>` was recorded as *collapsed on macOS,
attribute-wrapped on Linux*, with rsvelte-fmt matching the macOS form — so byte-parity
was declared undefined. Re-measured on macOS with the pinned oracle (`oxfmt@0.64.0`,
`fmt-corpus.oxfmtrc.json`, run over the real corpus source), the oracle emits the
**attribute-wrapped** form — the one the reason ascribes to Linux — at all 20
`<ColorIndicator>` sites, byte-identically on 5 consecutive runs:

```
oracle (macOS)   >&nbsp;&nbsp;&nbsp;--{key}: <ColorIndicator
                   color={value}
                 /> {value};</span
rsvelte-fmt      >&nbsp;&nbsp;&nbsp;--{key}: <ColorIndicator color={value} />
                 {value};</span
```

The two platform descriptions now coincide, so nothing is left of the non-determinism
claim; what remains is an ordinary rsvelte-fmt line-breaking divergence, which belongs in
`fmt-known-failures.json` and is now there. **The ratchet growing by one is a
reclassification, not a regression** — this pair has always differed, it was merely
unobserved. Two controls from the same repository (`announcement.svelte`,
`block-viewer-code.svelte`) were run through the same staged invocation and came out
byte-identical, so the harness can produce a match. What is *not* measured is the Linux
oracle: that needs CI. If the Formatter-parity job reports this id as already passing, the
right correction is to delete it from both files, not to restore the exclusion.


### oracle-bug — the `oxfmt(svelte:true)` oracle output is itself wrong/corrupt

Matching the oracle would require rsvelte to emit broken output. rsvelte-fmt is
correct; file upstream at `oxformatter/oxfmt` or `prettier/prettier-plugin-svelte`.

- **Nested-rest destructuring dropped → `...undefined`.** `{#each a as [x, y, ...[z, ...{n}]]}`
  is mangled to `[x, y, ...undefined]`, silently erasing `z`/`n`/`length` (source
  corruption). — `each-block-destructured-array-nested-rest`,
  `await-then-destruct-array-nested-rest`.
- **`{@const x = (h = 0)}` closing paren dropped** → `{@const x = (h = 0}`, invalid
  Svelte. — `block-expression-assign`.
- **Nested object destructure with a default loses its key.** In an `{#each}`
  context, `{ id, meta: { tags: […] } = {} }` is emitted as
  `{ id, { tags: … } = { } }` — the `meta:` key vanishes and the output is not
  JavaScript. — `pattern/issues/3035-destructure-defaults`,
  `pattern/adversarial/control-flow/each-destructure-exotic`.
- **`<textarea>` whitespace collapse.** Whitespace-significant body (`\n  A\n  B\n`)
  collapsed to `A B`, with inconsistent per-case rules. — `textarea-content`,
  `textarea-end-tag` (adversarial split close-tags).
- **CSS selector-list indentation mixes tabs and spaces.** Inline comments cause
  raw tab characters to leak into continuation lines while the body uses 2 spaces
  (non-idempotent). — `comment-html`, `comments-after-last-selector`,
  `css-pseudo-classes` (`:is()` inner selectors tab-indented).
- **Malformed `</script  >` / `</style  >` close tag loses body.** Whitespace
  before `>` makes prettier-plugin-svelte treat the block as empty and discard its
  content. — `whitespace-after-script-tag`, `whitespace-after-style-tag`.
- **`--svelte` CSS path defects.** Double-spaces an empty custom-property value
  (`css-vars`); emits a single space before `{` after an escaped-unicode selector
  (`unicode-identifier`); wraps a deeply-nested `calc(...)` differently
  (`svelte.dev .../docs/[topic]/[...path]/+layout.svelte`).
- **oxfmt formats embedded CSS differently from standalone CSS.** For
  `--arr: [1, 2]` / `--sel: a > b ~ c`, `oxfmt x.css` prints `[1 , 2]` /
  `a > b ~ c` while `oxfmt --svelte` prints `[1, 2]` / `a > b ~c` — the same tool
  disagreeing with itself, because the svelte path uses prettier's CSS printer
  and the `.css` path the oxc engine. rsvelte-fmt reproduces oxfmt's own `.css`
  output byte-for-byte, so parity against the svelte path is undefined here (and
  the svelte path's `~c` changes the token stream the value substitutes). —
  `pattern/adversarial/css/css-custom-property-values`.
- **Cross-platform non-determinism.** oxfmt produces different output on macOS vs
  Linux for the same input (an overflowing self-closing component inside `<pre>` is
  collapsed on macOS, attribute-wrapped on Linux), so byte-parity is undefined. —
  `shadcn-svelte .../theme-customizer-code.svelte`.
- **Nested object-destructure default in `{#each}` loses its key.**
  `{#each xs as { id, meta: { tags: [t = 'x'] } = {} }}` is mangled to
  `{ id, { tags: [t = 'x'] } = { } }` — the `meta:` property key is dropped,
  which is not JavaScript. — `pattern/issues/3035-destructure-defaults.svelte`,
  `pattern/adversarial/control-flow/each-destructure-exotic.svelte`.

### invalid-input — the input is invalid and rsvelte correctly rejects it

- **Snippet optional param with initializer** — `{#snippet c5(c?: number = 5)}` is
  illegal TypeScript (TS1015: a parameter cannot have both `?` and `= …`); oxc
  correctly rejects. — `snippet-typescript`.
- **Snippet rest parameter** — snippets do not support rest params
  (`snippet_invalid_rest_parameter`); rsvelte-fmt correctly rejects. —
  `snippet-rest-args`.
- **Genuinely-invalid Svelte-specific CSS** — a parser-modern edge `<style>` block
  with invalid `:nth` syntax. — `css-nth-syntax`.
- **At-rule inside `:global()`** — `:global(@keyframes shared)` is rejected by both
  compilers (`css_expected_identifier`, #3120); rsvelte-fmt leaves a stylesheet its
  parser rejects untouched. — `rejected-global-keyframes-selector`.

### migrate — Svelte 4→5 migrator output (out of scope per AGENTS.md)

Svelte-4 syntax (legacy `let:` directives, `slot=` attributes) that rsvelte's
Svelte-5 compiler formats differently. — `migrate/samples/slot-non-identifier/output.svelte`,
`migrate/samples/slot-usages/output.svelte`.

### engine-divergence — oxc vs prettier JS layout, both valid

Not oracle bugs and not rsvelte bugs: rsvelte formats embedded JS with the
`oxc_formatter` crate (a deliberate design choice for the 100x-perf / oxc
integration goals), which makes different-but-valid line-break choices than the
oracle's prettier-based JS printer. Reproducing them would mean abandoning oxc or
fragile prettier-mimicking string surgery (forbidden). The long-term fix is
aligning `oxc_formatter`'s break heuristics with prettier upstream.

- Ternary-condition break granularity in a long `class=` (`flowbite TimelineColor`).
- IIFE arrow parameter-list vs call-argument break point (`flowbite GitHubSourceList`).
- Member-chain-only vs `&&`/call-args break priority in an `{#if}` header
  (`flowbite forms/tags/Tags`).
- Line-comment attachment between a destructuring assignment and its initializer:
  prettier keeps `= // comment\n $props()` in that separator slot (and inserts a
  blank line), while oxc emits `= $props(); // comment`. Both are valid, but the
  original slot is deliberately retained in the three `3515-props-*-line-comment`
  pattern fixtures because it distinguishes the compiler comment-cursor defect.

<a id="known-failures"></a>

## known-failures.{client,server,client-dev,server-dev}.json — why each entry is accepted

The output-equality corpus compiles every source with both the official Svelte
compiler and rsvelte (CSR + SSR + CSR/SSR `dev: true`) and requires byte-identical output after
comparison-side normalization. The comparison is **AST-structural**
(`normalize.astEquivalent` via acorn): comment position, `${}` line-wrapping,
redundant parens, and quote style are already absorbed, so any entry here is a
**genuine structural (AST-distinct) divergence** in the generated code, not a
cosmetic one.

The ratchet (`corpus-compat.yml`) fails only on an `(id, target)` pair not in the
baseline — the lists may only shrink, never grow. Each accepted entry must be
justified in this file.

The JSON files are CI-enforced this way, but the header counts and (for
client-dev) the cluster-table residue below are hand-maintained prose and were
not checked anywhere, so a burn-down PR could update the JSON without keeping
this file's numbers in sync (#2062, drift from #2048). `corpus-compat.yml` now
runs `scripts/compat-corpus/known-failures-md-check.mjs` first, which fails
the job if a header count (or the client-dev "attributed to a cluster" /
"remaining" reconciliation, when that sentence is present) stops matching the
JSON array length.

The five skeleton seeds from #1924 are gone (#2017): #1973 (fixed by #1996),
#1974 (fixed by #1988), #1975 (fixed by #1993). All three divergences the
checked-in pattern corpus (#2019) surfaced are gone too: the two SSR
destructuring ones (#2033, #2034) were fixed by #2036, and the block-local
snippet render tag (#2031) by #2057.

### Client (`known-failures.client.json`, 1 entry)

Partition of `known-failures.client.json` by verdict: `1`

- **1 — the generated JS differs** (`js` / `code-differs`).

No CSS entry survives on this target: the one that did left with the ancestor-scoping fix
below.

`musicat/…/settings/SettingsPopup.svelte` left this target and `client-dev` with a phase-2
filter whose comment asserted the opposite of upstream. `2-analyze/index.js:445` declares each
`$name` as a real `store_sub` binding, so `scope.get('$s')` returns one and
`RegularElement.js:81` attaches a `<select bind:value={…}>`'s indirect bindings to it like any
other binding; rsvelte discarded exactly that case in two places, so the store branch of the
setter and every `$s.a = …` in the file lost the `$.invalidate_inner_signals` tail. Upstream's
exclusion of `store_sub` is on the **assign** arm's proxy flag (`AssignmentExpression.js:147`)
and the mutate arm at `:154-181` has no condition on binding kind at all — which is why the same
grid separates the two: `$s.a = 2` and `$s.a += 2` must gain the tail and `$s.a++` must not,
since `UpdateExpression.js` never imports `build_assignment`. The first version of the fix
wrapped both and the six store cells went 6 DIFF → 4 EQ / 2 DIFF, which is what named the
update arm. **17 of 18 cells EQ after** (the one that stays is a separate defect: `$: st.a++`
loses its `$.mutate` entirely). Two arms over the corpus moved **2 of 134,180 units**,
`MISMATCH -> match: 2`, `match -> MISMATCH: 0`.

`ha-fusion/…/Modal/VisibilityConfig/Index.svelte` left this target and `client-dev` with the
ninth application site of one upstream rule. Upstream reads a **reassigned** each item as
`collection[$index]` and never as `$.get(item)` (`EachBlock.js:216-227`); rsvelte ports that as
`build_reassigned_item_read` and calls it from eight places, and the dependency list an inner
`bind:` hands to `$.invalidate_inner_signals` is a ninth — built by a string loop that reads
`state.transform` directly, so the rule never reached it. Every *other* read of the item in the
same file was already correct, which is why the divergence was one line of 336 and why a grid
over each-block shapes with one read per cell would have been green: the axis is which read, not
which block. Two arms over the whole corpus moved **2 of 134,180 units** (129,450 live), both
this file, `MISMATCH -> match: 2`, `match -> MISMATCH: 0`.

`svelteui/…/Modal/ModalForm.svelte` and `mathesar/…/sort-entry/SortEntry.svelte` left this target
and `client-dev` when a **write** inside a prop's default value started reaching the passes an
instance body already gets. Upstream has one `AssignmentExpression` visitor and one
`UpdateExpression` visitor for every expression it walks, so a default value is not a special
host at all; rsvelte reaches a default through passes that skip any line containing `$.prop(`,
and only the read halves had a default-scoped counterpart. A prop write and a store write had
none, so `export let f = () => ($store = 1)` emitted `() => ($store() = 1)` — text no JS parser
accepts — while `() => (subject = 1)` silently dropped the invalidation.

The grid is binding kind × operation, with the operation always inside another `export let`'s
default: **10 EQ / 8 DIFF before, 18/18 after**, and three of the eight produced unparseable
output. What makes it worth recording is the **order**, not the missing pass. The instance body
runs `transform_store_sub_calls` → `transform_store_assignments_client` →
`transform_store_reads_client`, and the write matcher keys on the **bare** `$store`; reversing
just the last two — one edit, everything else held — takes the same grid to 14/18 and breaks
exactly the four store-write cells, three of them back to unparseable. So a pass placed in the
right pipeline in the wrong position fails on the same cells as a pass that is absent, and the
two are not separable by the count: measured, `base` and `reversed` print the identical
`() => ($store()++)` for the update cell. Only reading which function ran tells them apart.

`SortEntry` is also the entry that shows a local byte comparison naming the wrong verdict, in
the direction this file records twice already. Its residue after the fix is one dropped comment
(`// Ideally should never happen`), so a raw-text reconstruction reports it as still diverging;
the gate hands every byte-different output to `ast_equiv_batch`, which does not represent comment
placement, and scores it a pass. The line that moved went **to** official's spelling —
`$_('descending')` → `$_()('descending')`, which is what upstream emits — and that direction was
measured against the oracle rather than inferred from the entry leaving.

`primo/…/ui/Button.svelte` carried two defects on one line pair, and the first is closed.
`is_simple_expression_str` read a leading JSDoc comment as the callee of the parentheses after
it, so `type = /** @type {…} */ ('button')` took the lazy branch — `19, (/** … */) => 'button'`
where official emits `3, 'button'`. Neither axis reproduces it alone (a comment without
parentheses does not end in `)`, parentheses without a comment have nothing before the matching
`(`), so `crates/rsvelte_core/tests/prop_default_leading_comment.rs` crosses them.

**It has now left both targets, and the local sweep said it would not.** What remains in the
output is comment PLACEMENT, and the oracle's rule there is not the one a single-prop grid can
show. Measured on one, two and three props: official emits the annotation after the value of the
**first** `$.prop` in the declaration — `let a = $.prop($$props, 'a', 3, '' /** … */)` — however
many props precede the one that carried it, because esrap flushes a pending comment at the first
located node past it and the `$.prop` calls are builder-made. A one-prop cell reaches that rule
and cannot separate it from "place it ahead of the value", since there is nothing before it to
trail; rsvelte agrees there and drops the comment everywhere else. That line is still divergent
and the entry still passes, because the gate hands every byte-different output to
`ast_equiv_batch`, **which does not represent comment placement** — the same rescue the
`SettingsPopup` paragraph above describes.

The lesson is the one this repository already records about reconstructions, arriving from its
other side. A two-arm sweep over 134,180 units moved exactly this entry's two targets and scored
them `MISMATCH -> MISMATCH`, so the PR was prepared with the entry kept — and the sweep's
comparison stops at the normalized byte diff, which makes it **stricter** than the gate. A
non-zero from a stricter reconstruction is a list of candidates, never a verdict; here it
produced two false keeps, and CI's two-sided ratchet caught them as `already PASS`. When a
retained entry's own justification is "what remains is comment placement", that is precisely the
sentence that predicts the gate will rescue it.

The error classes this section used to carry are gone: the run behind this
baseline reports `error-mismatch: 0` and `js-unparseable: 0` on every target, so
no entry here is "both compilers reject with a different code", "one compiler
rejects and the other compiles", or "rsvelte's output is not JavaScript".

`appwrite-console/…/sortButton.svelte` left this target when `:global(.foo)` stopped
answering "is this a global block". Upstream sets `metadata.is_global_block` only for a
**bare** `:global` (`css-analyze.js:24-30`), and `is_empty` reads it to short-circuit
(`3-transform/css/index.js:432`); rsvelte's `is_rule_empty` treated an argument-bearing
`:global(...)` as one too, so a parent whose only surviving child was pruned kept its
declarations instead of being commented out. The two-sided ratchet named this entry in the
PR's own `Compiler parity` job (`1 baseline entries already PASS … client 1`).

**The fix also repairs `server` CSS, and no gate can see that.** `targets.mjs` sets
`css: false` for `server` and `server-dev`, so CSS is compared on `client` and `client-dev`
only. A two-arm sweep over this branch moved **2** units — this file on `client` and on
`server`, both `css DIFF → EQ` — while the ratchet can hold only the first. The asymmetry is
worth stating rather than rounding away: "the sweep moved 2 and the ratchet retires 1" is not
a discrepancy, it is the population of the gate.

`pattern/issues/3072-extends-shapes-legal.svelte.js` left this target and `client-dev` when
the class-body scan stopped taking the first `{` after the header. A heritage clause can open
a brace of its own, and `find_class_header` counted exactly one thing that does — a nested
`class` expression — so `class A extends function () {} { e = $state(5) }` read the
function’s body as the class body and never privatised the field. A heritage is a
`LeftHandSideExpression`, which closes the set: a class expression, a function expression in
its four spellings, and an object literal in primary position. Measured one cell per member,
**eight of eighteen diverged** and the shape this entry carries was one of them. The scan is
shared by the client and the server (`client/class_transforms.rs:996`,
`server/transform_script.rs:4864`), so the change was swept on all four targets rather than
on the two this entry sits in.

Two entries left this target and `client-dev` because a read transform was handed the wrong
identifier. `$.invalidate_inner_signals(() => (…))` names the bindings an each-item mutation
must invalidate, and each name goes through that binding's read transform. A legacy **reactive
import**'s read expects the identifier already swapped for its `$$_import_` alias —
`client/visitors/program.rs` registers that swap as `replacement_id`, and both
`shared/utils.rs:907` and `shared/utils.rs:1572` consult it — while `each_block.rs` passed the
raw name, so `photon/…/settings/{app,moderation}` emitted `settings()` where official emits
`$$_import_settings()`. That output is **exactly what a prop read looks like**, so a check
asking only "is it not the bare name" passes on the bug; the repro therefore varies the
binding KIND behind one fixed each block (`plain-import` → `settings`, `local-state` →
`$.get(settings)`, `exported-prop` → `settings()`, nested each → `$.get(filter),
$$_import_settings()`). A 139,252-unit four-target sweep moved exactly these 4 units.

One entry left this target and `client-dev` because a destructured `export let` was lowered by
text rather than through its keys. Upstream's `_extract_paths` builds a rest element as
`$.exclude_from_object(expression, [keys])` and every property as
`b.member(expression, prop.key, prop.computed || key.type !== 'Identifier')`; the port
re-destructured for the rest and spelled every key as a dot access. `huly/…/
TrainingRequestDueDateEditor.svelte` carries the first. The second is louder and had no
carrier: **seven of the eight key cells emitted text no JS parser accepts** (`tmp.'a-b'`,
`tmp.0`, `tmp.[k]`), and only a plain identifier key was right — which is why the repro
(`crates/rsvelte_core/tests/destructured_export_let_keys.rs`) is one cell per key kind crossed
with whether the pattern has a rest, rather than the reported shape alone. A 135,560-unit sweep
moved exactly the 2 units this entry occupies.

One entry left this target and `client-dev` because upstream's `should_proxy` resolves an
Identifier **through its binding** and rsvelte's class-field lowering did not:
`joy-of-code/…/preferences.svelte.ts` initialised a field from a name whose declaration
is a non-proxied `$state` and rsvelte re-proxied it. There are **four** ports of that
predicate here and no gate compares any two, so a 24-cell grid — one cell per call site of
the scope-less port, crossed with four right-hand-side shapes — was written before the fix
and reported `EQ 19 | DIFF 5`. The scope set is now computed once and threaded into the
class-field pass and into `private_class_assign_ast`, whose walk starts inside the class
body and cannot see an outer declaration. A 104,439-unit sweep moved 2 units, one of them
`MISMATCH -> match`; the module half of that sweep is only live because the harness strips
TypeScript first — `compile_module` parses plain JS, so all 923 `.svelte.(js|ts)` units had
been erroring identically in both arms and the first run's `MOVED 0` was arithmetically
forced.

Two entries left this target and `client-dev` because a compound assignment's binary
right-hand side lost its parentheses. Expanding `s += <rhs>` to
`$.set(s, $.get(s) + <rhs>)` needs `<rhs>` parenthesized when it is itself a binary
expression, and the difference is a **value** rather than a spelling: `1 + (2 + '3')` is
`'123'` and `1 + 2 + '3'` is `'33'`. The predicate deciding it was a character scan whose
"starts and ends with a quote, so it is a string literal" early return also matches
`'a' + x + 'b'` — the closing quote now has to be the one that opens the text. The two ids
are `svelte-maplibre-gl/…/Geolocate.svelte` and `svelte-spa-router/test/app/src/App.svelte`;
the repro is `crates/rsvelte_core/tests/compound_assignment_rhs_parens.rs`.

Two entries left this target and `client-dev` on two `$.mutate` decisions that answer
differently depending on the HOST the write is written in. `musicat/…/Scrollbar.svelte`
was over-wrapped: upstream walks an assignment target’s `.object` chain only while it is
a `MemberExpression` and then requires an `Identifier`, so
`stage.container().style.cursor = 'grab'` has no root binding and is not a mutation, while
rsvelte’s `get_base_object` crossed the `Call` via its callee. Only the
template-expression port did — an arrow declared in `<script>` reaches a different
implementation and was already right, which is why the axis that separates the two is the
host and not the binding. `ha-fusion/…/TransformAttributes.svelte` was under-wrapped: a
`$:` body is lowered by branching on the shape of its left-hand side, and the pass that
wraps a state member write was wired into two of eight branches — the note recording that
fix called them “both sibling branches”, and five more were missing it. Both are
byte-identical to official on `js.code` and `css.code`, on `prod` and on `dev`.

Two syntaxfm-website entries left this target and `client-dev` when an attribute-free
custom element stopped making its ancestors dynamic: upstream gates that
`mark_subtree_dynamic` on `node.attributes.length > 0`
(`2-analyze/visitors/RegularElement.js`) and rsvelte's stand-in predicate dropped the
attribute half, so every ancestor emitted a `$.child` / `$.sibling` / `$.reset` chain
official replaces with nothing. The third syntaxfm entry
(`routes/(site)/guests/+page.svelte`) is a different cause and stays: its output is
byte-identical before and after that fix.

One trakt-web entry (`test/beds/component/ComponentTestBed.svelte`) left this target and
`client-dev` when a dotted component tag name started reading through its root binding's
transform. Upstream lowers a tag name with `context.visit(b.member_id(name))` — the whole
member expression — and the rest-prop read rule sits in `Identifier.js` keyed on the
parent, so transforming the root alone never reached it and `<input.component />` stayed
`input.component` where official emits `$$props.component`. Whether a corpus-wide sweep
attributes anything else to that change is answerable rather than assumed: hashing all
104,439 (entry, target) outputs before and after reports exactly these two as changed.

Two entries (`shadcn-svelte-extras/…/demo/demo-code.svelte` and
`photon/…/community/CommunityCard.svelte`) left this target and `client-dev` when an
`{#await … then X}` / `{:catch X}` binding started shadowing a prop of the same name.
Upstream shadows by overriding `state.transform[name]`; rsvelte registered that transform
too, but a non-source prop never reaches it — the identifier arm returns `$$props.name`
early, guarded only by `shadowed_prop_names`, which the await visitor did not populate.
A prop with a default was unaffected, because a default makes it a source prop, which is
why the shape looked narrower than it was. Hashing all 104,439 (entry, target) outputs
before and after attributes exactly these four to the change.

Four entries (`carbon-components-svelte/…/NotificationQueue.svelte`,
`gitlight/…/NotificationLabels.svelte`, `huly/…/Timeline.svelte`,
`huly/…/InboxCard.svelte`) plus `svelte-tweakpane-ui/…/ClsPad.svelte` left this target and
`client-dev` when a `style:` directive's chunk metadata started reaching phase 3. Upstream's
`StyleDirective` visitor calls `context.next()` and `ExpressionTag` swaps `state.expression`
for the **tag's own** metadata before walking, merging each chunk up afterwards; rsvelte wrote
into the directive's metadata, so the chunk stayed empty — and `build_attribute_value` reads
the chunk, so `has_call` was always false and `build_expression` returned early, dropping the
legacy `($.deep_read_state(dep), $.untrack(() => value))` wrapper. Only a **call** diverged,
because `has_member_expression` and `has_assignment` are re-derived in phase 3. Hashing all
69,626 client (entry, target) outputs before and after reports 14 changed units over 7 ids,
`match -> MISMATCH = 0`, and 10 of the 14 newly matching.

The other two of those seven ids — `open-webui/…/Models.svelte` and
`huly/…/OptimizeSkills.svelte` — retire as well, and **only CI could say so**. A local
reconstruction of the gate reported both as still mismatching on both targets, because it
stopped at the byte comparison of the oxfmt-normalized text; the gate runs an **AST
comparison on every byte-different output** after that, and each of those two residues is a
comment placement, which the AST comparator does not represent. So the reconstruction was
strictly *stricter* than the gate it stood in for — the opposite direction from the usual
reconstruction hazard.

Which direction a reconstruction misses in follows from **what kind of stage it dropped**: a
gate's verdict is a pipeline, and dropping a *rescue* stage (this AST comparison, oxfmt) makes
the reconstruction stricter, while dropping a *judging* stage makes it looser. That asymmetry
is worth stating because it makes one side of the fidelity question free. A reconstruction
that is stricter than the gate can report **zero** with no fidelity argument at all — a zero
under a stricter comparison is a zero under the gate's. It is only a **non-zero** from a
stricter reconstruction that is not a finding: it is a list of candidates to ask the gate
about, and every entry on it can be a false positive. Both halves were exercised on the same
day: these two entries are the false positives, and a 135,592-pair `compile()` sweep on raw
hashes over four targets reported zero, which needed no gate confirmation for exactly this
reason.

One `huly/…/CreateIssueTemplate.svelte` entry left this target and `client-dev` when a legacy
store or `$:` read **nested inside** a prop default stopped being judged simple. Upstream runs
`is_simple_expression` on the *transformed* initializer, where `$s` is already the call `$s()`
and a `$:` variable is already `$.get(r)` — hence non-simple, hence thunked with
`PROPS_IS_LAZY_INITIAL`; rsvelte tested the untransformed source, where each is a plain
identifier. A **bare** identifier already had its own three branches, so the divergence lived
only where the read sat inside a logical / conditional / binary operand, and a 6 binding-kind ×
5 position grid isolates it exactly: 8 diverging cells, all of them `store` or `$:` in one of
the four non-bare positions, with a plain `let` in the same four positions as the control that
stays simple. For a store the value itself was wrong, not only the flags — the post-pass that
rewrites `$s` to `$s()` inside a default fires only when the default is already `() => …`, so
the emitted default was the getter function rather than the store's value. Hashing all 69,626
client (entry, target) outputs before and after reports **2** changed units over 1 id,
`match -> MISMATCH = 0`; the other two ids of that cluster do not move and stay listed.

All five entries the `bind:this` collection fix touched left this target and `client-dev`
(#4121): `ha-fusion/…/Main/Views.svelte`, the two `svelte-bits` text animations,
`ha-fusion/…/Sidebar/Navigate.svelte` and `kite-public/…/CategoryNavigation.svelte`. The
callback parameters are now decided from the DECLARATION's scope rather than from the loop
variable's name. The sweep over all 104,439 (entry, target) outputs moved those five ids and
no others, and every one was already listed — so no passing entry changed.

The last two of the five were reported here as *still diverging*, and only CI could say
otherwise. A local sweep compares output text; the gate runs an **AST comparison on every
byte-different output** afterwards, and the residue on both is comment placement, which that
comparator does not represent. So the local reconstruction was strictly *stricter* than the
gate — the direction that reports a **false** remaining divergence, not a missed one. It is
the same reconstruction defect recorded above for the `style:`-directive cluster, found the
same day by a different person on a different file: **a reconstruction that drops a rescue
stage is over-strict, and its non-zero is a candidate list, not a finding.**

Two entries left this target and `client-dev` because a component's `let:` variable was
treated as in scope inside that component's NAMED slots. Upstream's `Component` scope
visitor gives every `slot=`-carrying child `context.state.scope.child()` — a child of the
scope OUTSIDE the component — while the `let:` bindings are declared in
`metadata.scopes.default` (`phases/scope.js`), so the name is a plain global there:
`is_pure` reports the read as non-reactive and legacy `build_expression` collects no
reference for it. rsvelte answered both questions by name, and scope 0 is deliberately
polluted with every child scope's declarations, so the lookup always found the binding —
`mathesar/…/DisconnectDatabaseModal.svelte` and `…/UpgradeDatabaseModal.svelte` came out
with the read inside a `$.template_effect` and with a `$.deep_read_state` in front of it.
The repro crosses the slot the read sits in with the **mode**, because the two halves sit on
opposite sides of `build_expression`'s `runes || maybe_runes` early return: a component with
no `<script>` is `maybe_runes`, where no `$.deep_read_state` can be emitted at all, so a grid
without a legacy row measures only one of the two ports.

A first version answered the reference half in phase 2 instead, by testing the binding's
declaring scope against the reference's — and a 135,560-unit sweep reported a third id
moving. `svelte-ux/…/SelectField/+page.svelte` was **not listed**, so that unit was
`match -> MISMATCH`: upstream's `determine_slot(node) ? context.state : …` declares a
slotted node's own `let:` in the ENCLOSING scope, so `<M slot="option" let:option
class={cls(option)}>` still reads it from its own attributes, and the phase-2 rule dropped
four dependency reads. The nine-cell grid was green through all of it, because every cell it
held put the `let:` and the reference on **different** nodes — the axis was varied and the
three-on-one-node arrangement was held fixed. The repro now carries that cell, chosen the
way a control has to be: an implementation that makes it red exists and was run before the
cell was written.

The corrected version then moved a fourth id, and the second sweep is the only reason it was
not shipped: `carbon-components-svelte/…/TreeView.lazyLoad.test.svelte` and Svelte's own
`runtime-legacy/samples/const-tag-component/main.svelte` went `match -> MISMATCH`. The mask is
keyed by NAME, and a slotted node's own `let:` of the SAME name is a different binding that
upstream declares in the enclosing scope — so `<C let:a>` around `<span slot="t" let:a>` had
the child's binding masked by the parent's. The reduction is two cells: with the `let:` on only
one of the two nodes, both spellings already agreed. Clearing the mask where a `let:` is
registered is three edits, not one, because rsvelte registers a `let:` in three places —
`build_slot_function`, `process_element_let_directives` and `visit_svelte_fragment` — and the
reported file reaches the second while the corpus file reaches the third. (`<svelte:element
let:x>` is the fourth candidate and needs nothing: both compilers reject it.) The repro carries
one cell per place, plus the cell that separates a scope stack from a flag — inside one named
slot, an `{#each xs as a}` body reads `$.get(a)` and the very next expression reads a bare `a`.

`huly/…/DrawingBoardEditor.svelte` left this target and `client-dev` because whether an
attribute can go in the template string was asked of the NORMALIZED name. Upstream
(`RegularElement.js:234-256`) computes `name = get_attribute_name(node, attribute)` and uses it
only for the branch selectors (`class`, `style`, `autofocus`); both `cannot_be_set_statically`
and `template.set_prop` take `attribute.name`. rsvelte passed the normalized name to both, so
`<input autoFocus />` matched the four-name `NON_STATIC_PROPERTIES` list, took the JS branch,
and emitted `$.autofocus(input, true)` where official writes `<input autofocus=""/>`.

The reported spelling is one cell of ten. A grid over name spelling × namespace × value shape
reports **22 EQ / 10 DIFF**, and the other four names — `Muted`, `MUTED`, `DefaultValue`,
`defaultchecked` — lose the attribute **entirely**, with nothing emitted in its place: the
guard sends them down the JS branch and no arm there handles them. `defaultchecked` is the
sharpest, because normalization maps it INTO the list from outside it. The svg rows are all EQ
and stay in the repro as the control that rejects the wrong spelling of the fix:
`get_attribute_name` is the identity outside `html`, so a fix written as "lowercase the raw
name" is green on every reported cell and red there. The second, separately-suspected
divergence in the same lowering — that `template.js`'s `stringify` lowercases a key only in the
html namespace — was measured over seven cells and **agrees**; it is recorded here so it is not
re-opened as unmeasured.

Two entries (`networking-toolbox/…/home/SiteMapList.svelte` and
`trakt-web/…/select/SegmentedSelect.svelte`) left **all four** targets when ancestor scoping
started following a `{@render}` into the snippet it renders. Where a `{#snippet}` body sits in
the DOM is decided twice in this tree; #4155 fixed the pruning half, so the CSS rule was kept
while the ancestor never received its scope class — the two halves of one answer disagreeing
inside a single output (`compatibility/GATES.md#two-ports-inventory` row 27). Hashing all
139,252 (entry, target) outputs over the four targets before and after reports **8 changed keys
over exactly these 2 ids** and nothing else.

`SegmentedSelect` retires from `client` and `client-dev` for a reason the byte comparison cannot
state: after the fix its only residue there is a comment placement (official emits
`const // eslint-disable-next-line …` then `segment = …`), and `verify.mjs` hands every
byte-different output to `ast_equiv_batch` with no `--comments`, so a comment-only divergence is
AST-equivalent and scores a pass. That was **measured, not inferred** — the same comparator on
the same run reports `code-differs` for `haptic/…/tooltip.svelte`, so a green here is a property
of the input rather than of a comparator that stopped working. A hand-rolled "strip the
comments and compare" said the opposite, because official's line reduces to a bare `const` and
the stripper invents a structural difference; that is the stricter-reconstruction hazard two
paragraphs above, reached from the other side.

`syntaxfm-website/…/guests/+page.svelte` left this target and `client-dev` on the right-hand
side of a destructuring assignment. `shared/assignments.js:20-22` reads
`should_cache = value.type !== 'Identifier'` off the **visited** node, so a prop is cached in
`$$value` whichever read form it takes; rsvelte answered from the list of props eligible as
assignment *targets*, which in runes mode excludes a prop that is never written — and that is
exactly the prop whose read is `$$props.data`, a member expression. A 7-row grid over the
binding kind of the right-hand side separates it from "cache whenever the binding is reactive":
a `$state` object reads as a bare identifier and must NOT be cached, while a `$derived` reads as
`$.get(data)` and must be. Two arms moved 2 of 134,180 units (129,450 live),
`MISMATCH -> match: 2`, `match -> MISMATCH: 0`.

Three entries left this target and `client-dev` on three separate decisions, each measured with
its own grid.

`headscale-ui/…/ServerSettings.svelte` carried `pattern={String.raw`…`}`.
`TaggedTemplateExpression.js` gives a tagged template `has_state` only when its TAG is not pure,
and `is_pure` calls any identifier with no binding a global — so `String.raw`…`` is inert and the
attribute is written once at init. rsvelte's `has_reactive_state_json` has no arm for the node
type at all and fell into its conservative `_ => true`, wrapping every tagged template in a
`$.template_effect`. That default is why nothing found it earlier: over-wrapping is correct
behaviour and wrong bytes, so only output equality can see it. 15 expression kinds × 2 hosts
reads 24 EQ / 6 DIFF, and all six are a pure tag; a local tag and a member tag rooted at a local
stay wrapped, which separates the fix from "never wrap a tagged template". The sibling
`has_call_json` names the node type correctly, citing the upstream file — two ports of one
visitor disagreeing about which node types exist, and nothing compares them.

`photon/…/navbar/Profile.svelte` was an ordering divergence with no other content:
`transform-client.js:201` unshifts the legacy `$.reactive_import(…)` declarations onto the
MODULE program's body and `:513` assembles `[...imports, ...module_level_snippets, ...body]`, so
a hoisted `{#snippet}` precedes them. rsvelte emitted them straight after the imports. Both
outputs were 593 lines; moving two declarations 60 lines made 62 lines differ, which is what a
first-differing-line reading would have called a large divergence. Each control in the 4-cell
grid holds only one of the two declarations and so cannot express an order at all.

`trakt-web/…/navbar/_internal/NavbarHeader.svelte` is upstream aliasing an array.
`RegularElement.js:333` gives an element's children the PARENT's `consts` array itself when
`has_declarations` is false, and `:443` splices that same array into the `{ … }` wrapper the
element grows for a `{#snippet}` — so an enclosing `{@const}` is declared a second time inside
the wrapper. `has_declarations` is `!fragment.metadata.transparent`, which only a
**`DeclarationTag`** (`{const x = …}` / `{let x = …}`, no `@`) clears; `{@const}` cannot be an
element's immediate child at all, so the first version of that cell was rejected by both
compilers. `<svelte:element>` delegates to `Fragment.js:68`, whose `consts` is a fresh `[]`, and
is the cell that separates the aliasing from "an element with a snippet re-expands".

Two arms over the corpus moved 6 of 134,180 units (129,450 live) — the three files on `client`
and `client-dev` and nothing else — `MISMATCH -> match: 6`, `match -> MISMATCH: 0`.

The remaining 1 entry arrived with the wave-2 enrolment (#3176) and is described
in § *Wave-2 enrolment*. The list was **0** before it, and the one entry it ever
held — #2031, a `{#snippet}` declared inside
an `{#if}` branch and `{@render}`ed as a sibling in that same branch, lowered
through the dynamic path (`$.comment()` anchor + `$.snippet(...)`) instead of
being called directly — was fixed by #2057: the scope builder gives each branch
its own scope, but the analysis visitor never entered it, so the render tag's
lexical lookup started above the branch and missed the snippet binding.

It stayed empty through the `runed` / `svelte-toolbelt` enrolment, which raised
the module share of corpus entries from 3.4% to 5.1% — modules were the thinnest
surface the corpus covered. That enrolment surfaced eleven divergences and every
one that this target can see was fixed before it landed: #2300 (`$state`
declaration in a module not lowered), #2301 (reactive getter not unwrapped at a
call argument), #2302 (missing `$.proxy`), #2303 (private class-field state
read), #2304 (`$.template_effect` without its deps array), #2305, #2309, #2330
and #2343 (the spurious `$.set` proxy flag for a `BinaryExpression`). #2307
(spurious `/* @__PURE__ */`) is comment-only, so the AST-structural comparator
does not see it at all; it burns down with the esrap comment epic (#2336).

An empty list is not the same claim as "client output matches upstream
everywhere". Divergences this target keeps on purpose — because reproducing
upstream's bytes would emit invalid JavaScript — are recorded in
[`deliberate-divergences.md`](#deliberate-divergences), each pinned by a test.

### Server (`known-failures.server.json`, 2 entries)

Partition of `known-failures.server.json` by verdict: `2`

Attribution of `known-failures.server.json`:

| n | target | cluster |
|---|---|---|
| 2 | `deliberate-divergences` | a `$`-prefixed function parameter is a local binding; upstream's server visitor decides by name and lowers a write to `$.store_mutate`, which throws — reported in `upstream_issues/svelte-server-treats-a-dollar-parameter-as-a-store.md`, pinned by `crates/rsvelte_core/tests/dollar_parameter_is_not_a_store.rs` |

`networking-toolbox/…/SiteMapList.svelte` and `trakt-web/…/SegmentedSelect.svelte` left this
target, and the other three, when ancestor scoping started following a `{@render}` into the
snippet it renders — see § *Client* for the measurement.

- **2 — a recorded deliberate divergence, not a burndown target.**
  `pattern/issues/dollar-function-parameter.svelte` and
  `threlte/packages/extras/src/lib/hooks/useViewport.svelte.ts`. A `$`-prefixed
  **function parameter** is a local binding, not a store subscription; upstream's
  server visitor decides by name alone and lowers a write to it to
  `$.store_mutate`, which throws at runtime, while upstream's own *client*
  agrees with rsvelte. Reported in
  [`upstream_issues/svelte-server-treats-a-dollar-parameter-as-a-store.md`](../upstream_issues/svelte-server-treats-a-dollar-parameter-as-a-store.md),
  recorded in
  [`deliberate-divergences.md`](#deliberate-divergences)
  and pinned by `crates/rsvelte_core/tests/dollar_parameter_is_not_a_store.rs`.
  **These two are listed so the gate stops the difference spreading, not so it is
  fixed** — the pin is what keeps the justification from rotting.

**No burndown entry survives on this target.** Every one that arrived with the wave-2
enrolment has been retired, the last two by #4115's ancestor-scoping port; what is
left is the deliberate divergence above, which is recorded rather than scheduled. The history
below is kept because it records what the ratchet was *for*, not what it currently holds.

This target was at 0 before wave-2. The last pre-enrolment entry was #2308, from the
`runed` / `svelte-toolbelt` enrolment:
`watch.test.svelte.ts` writes `runs = runs + 1` and rsvelte **contracted** it to
`runs += 1` (that direction, not the reverse). The `.svelte.(js|ts)` server path
round-trips through the client transform, which rewrote the assignment, so the
operator was already gone before the server printer ran. Fixed by lowering
`$state` to its bare initializer *before* the client transform, so state
bindings on this path are never signal-wrapped and nothing has to be
reconstructed.

Its previous sole entry was the SSR half of the same #2031 divergence (the extra
`<!---->` the dynamic form pushes), fixed by the same change.

The two SSR destructuring seeds this corpus also surfaced — #2033 (computed /
quoted key dropped in a destructured `$derived`) and #2034 (`$.to_array` arity
with a rest element) — were resolved by #2036, which mirrored #2010's client
destructuring fixes onto the server target.

### Server dev (`known-failures.server-dev.json`, 2 entries)

The `server-dev` target is the server transform with `dev: true`. It separately
ratchets server-only development instrumentation: component metadata, element
locations, dynamic-element validation, snippet validation, and injected CSS.

Partition of `known-failures.server-dev.json` by verdict: `2`

Attribution of `known-failures.server-dev.json`:

| n | target | cluster |
|---|---|---|
| 2 | `deliberate-divergences` | a `$`-prefixed function parameter is a local binding; upstream's server visitor decides by name and lowers a write to `$.store_mutate`, which throws — reported in `upstream_issues/svelte-server-treats-a-dollar-parameter-as-a-store.md`, pinned by `crates/rsvelte_core/tests/dollar_parameter_is_not_a_store.rs` |

The same two snippet-scoping entries left this target with the other three; see § *Client*.

What remains is the same deliberate divergence as on `server` — the `$`-prefixed function
parameter — carried on both targets because the server transform runs on both.

- **2 — the same recorded deliberate divergence as on `server`.**

**No burndown entry survives on this target either**, and its counts still match `server`:
the last two went with #4115's ancestor-scoping port, leaving only the deliberate divergence.
This target was at 0 before wave-2. The one extra entry it once carried was SoftShadows output
that became unparseable only with `dev: true`; #3877 corrected the component
callback tail-comment insertion point, so both its parse and output entries have
been retired.

### Client dev (`known-failures.client-dev.json`, 5 entries)

Partition of `known-failures.client-dev.json` by verdict: `5`

- **5 — the generated JS differs.**

Unlike `client`, no CSS entry survives on this target.

`huly/…/HelpAndSupport.svelte` left this target with the site claim in
`assign_dev_ast.rs`. `$.assign(…, '<file>:<line>:<column>')` locates the assignment's own
left-hand side, and rsvelte finds that by matching the lowered target back against a
source-order site list keyed `(root, path, operator)` — where a computed member contributes a
valueless `Computed` element, so `o.p[2]` and `o.p[3]` share a key and only the order the sites
are consumed in separates them. The visitor claimed its site *after* descending, so the inner
link of `loc.path[2] = loc.path[3] = settingId` took the outer's site and reported `53:4` where
official reports `53:18`. A static-key chain (`o.a = o.b = s`) has two distinct keys and was
correct throughout, which is what separates "claims in source order" from "always claims the
first site"; a grid of computed chains alone cannot. Two arms over the corpus moved 2 of 134,180
units (129,450 live), `MISMATCH -> match: 1`, `match -> MISMATCH: 0`.

`svelvet/…/Edge/Edge.svelte` moved on this target without leaving it. Upstream runs
`is_simple_expression` on the **visited** default of a legacy `export let`, and in dev
`BinaryExpression.js` rewrites all four equality operators into `$.strict_equals` / `$.equals`
CALLS unconditionally — so `export let straight = edgeStyle === 'straight'` is simple in
production and not simple in dev, where it becomes `$.prop(…, 24, () => …)`. rsvelte answered
from the source shape, and the same reduction found a second, opposite defect in the text scan
that decides it: a `(` after an operator opens a parenthesised operand, not a call, so
`a || (b === 'x')` was read as a call and made lazy in production where official is eager. A
13-shape × 2-mode grid separates the two directions and holds five mode-invariant rows
(`a < 1`, `a + 1`, a literal, an identifier, and an arrow whose body holds the operator — an
arrow is simple whatever it contains, which is what fails a text search for the token). Two arms
over the corpus moved 1 of 134,180 units (129,450 live).

**The entry has left this target.** It was kept on the reading that its remaining line is comment
placement — esrap attaches a trailing `//` to the literal inside `$.mutable_source(false)` and
rsvelte keeps it at end of line — and that reading is still correct about the bytes. It is wrong
about the verdict for the same reason the `Button.svelte` paragraph above gives: comment
placement is exactly what `ast_equiv_batch` cannot represent, so the gate rescues it once the
code line matches. Both keeps came from the same stricter-than-the-gate local sweep, and both
were caught by CI's stale-entry check rather than by any local instrument.

The other moved unit is `svelte-bits/…/MetallicPaint.svelte`, whose verdict did **not** change:
its location is now right and its remaining line is the other half — upstream declines to wrap
the innermost link of `a[i] = a[j] = a[k] = gray` because `scope.evaluate(gray)` follows the
binding's initializer to `Math.round(…)` and calls it primitive, which rsvelte answers from the
expression's shape alone. A moved unit is not a retired entry.

All remaining 5 arrived with the wave-2 enrolment (#3176); this target was at 0 before
it, and it is the largest of the four — 5 JS entries that `client` does not
carry, which is the reason it is ratcheted separately.

`immich/…/asset-viewer/ActivityViewer.svelte` left this target and `client` for the other half of
the same predicate. Upstream's `should_proxy` answers `false` for `undefined` in the **same
clause** as the literal types, and resolves a bare identifier by recursing on `binding.initial` —
so a prop whose destructure default is `undefined` is not proxied when it is written into a
`$state`. rsvelte ports that node-type list twice: `should_proxy_node_type` carries the
`undefined` arm, and `is_non_proxy_node_type` was its negation **without** it. Two of that
function's four call sites had bolted the arm back on at the call site and two had not, which is
the "a pass is missing from a branch" shape — measured one cell per shape, 8 of 24 diverged and
the reported one was among them. The name is now a parameter of the predicate, so the decision
cannot be spelled without answering it. One shape is still open and is a **different** port: a
`<script module>` local initialised to `undefined` and written into a module `$state` reaches the
module text pipeline, which carries its own list. Its carrier count over the collected corpus is
**0 of 33,545** — measured with two positive controls, 1,981 files do have a module script and
3,425 do contain a `= undefined`, so the zero is the conjunction and not the detector — which is
why it is filed (#4264) rather than fixed here.

`svelte-lexical/…/notesStore.svelte.ts` left it when the text port of upstream's `should_proxy`
became transparent to parentheses (#4254). acorn builds no `ParenthesizedExpression`, so
upstream decides on what the parens hold; rsvelte ports that predicate twice and only the AST
one recursed through the pair. The entry was `client-dev`-only because the dev await
instrumentation rewrites the right-hand side into `(await $.track_reactivity_loss(…))()` before
the proxy decision reads it, so production never reached the shape — one line of 166, with the
same source byte-equal on `client`.

Four entries left this target when a module script started reaching the dev `$.assign` rule.
Upstream has one `AssignmentExpression` visitor and no module/component split, so
`obj.prop = value` in a `.svelte.js` / `.svelte.ts` or a `<script module>` is wrapped exactly
as it is in an instance script; rsvelte's `transform_module_dev_tail_ast` collected the
`$.strict_equals` / `await` / `console.*` / `$.tag` edits and not this one, so the whole module
surface emitted the bare assignment. The axis is not "is this a module" but **whether the
assignment sits in value position** — a 65-cell grid crossing the three entry points
(`.svelte.js`, `.svelte.ts`, `<script module>`) with the assignment's position and the operator
reads 7/16, 7/16, 7/16 and 15/16 per host before the fix and 16/16 on all four after it. The
component host is in the grid as the control that is nearly green throughout, and an arm with
the root-binding guard removed emits `$.assign(globalThis, …)` on **all four** hosts, which is
what keeps the guard from being deleted along with the bug.

`huly/…/SelectAvatarPopup.svelte` left it when a member assignment whose root resolves to
no binding stopped being wrapped. Upstream's `build_assignment` opens with `if (!binding)
return null` (`AssignmentExpression.js:117`), so `document.body.style.overflow = 'hidden'`
gets no `$.assign` at all; rsvelte wrapped it, and did so from two ports of that function
which had to be corrected separately. Both compilers' output for this file is now
byte-identical on `client-dev` before any normalization — and the two-sided ratchet named
it independently, on Linux, in the PR's own `Compiler parity` job (`1 baseline entries
already PASS … client-dev 1`). The local measurement carried its own control (two entries
still listed on this ratchet, run through the identical script, both `DIFF`), but the CI
naming is the stronger citation because it is the gate's own verdict rather than a
reconstruction of it.

`musicat/…/InternetArchiveView.svelte` left this target when the dev `console.*` wrap started
asking whether an argument's **value** is known rather than whether its name is a state binding.
The pass reads lowered text, so `$state(0)` had reached it as an opaque `$.state(0)` call; upstream
evaluates the rune's argument (`scope.js:465-500`). A two-arm sweep over 139,252 `(id, target)`
pairs moved this unit and no other.

#4192 retired two `huly` entries (`process-resources/.../ProcessAttributeEditor.svelte`,
`tracker-resources/.../move/SelectReplacement.svelte`). Upstream latches
`analysis.needs_mutation_validation` before it builds the mutation's property path
(`shared/utils.js:406`), so a computed key it cannot spell still emits
`$$ownership_validator`; rsvelte derived the flag from a text scan for the wrap, which by
construction only finds a mutation that was wrapped. Measured on two arms sharing the merge
base `c1af73536` (base sha256 `3c7a3ccb…`, fixed `ec564195…`): both entries read `PASSES`
on the fixed arm and the base arm reports `PASSES on base: 0`, so the retirement is
attributed rather than inherited.

The same PR then narrowed the latch again — upstream reaches the validator through
`scope.get(name)`, so a name that spells a prop but resolves to a parameter, a `for`
binding or a `catch` binding declares nothing — and **that half was not re-measured
locally**: the `PASSES` above was read on the pre-narrowing arm. The two-sided ratchet is
the complete check for these two entries, because a listed-but-passing entry and a new
failure both fail, so the verdict here is CI's rather than a local reconstruction's. The
count of entries `client` does not carry was read as 15 while the file held 13; it is
recomputed above rather than decremented, because the partition line is gated and this
sentence is not.

The `client-dev` target is the `client` target with `dev: true`. It is a
separate ratchet because `dev` gates 18 client codegen files plus the CSS
transform (`css/index.js:146` keeps empty rules in dev), so a dev-only
divergence is invisible to the two `dev: false` targets — #1981
(`<X.Y bind:…>`) was live in 524 corpus files and undetected for exactly that
reason. CSS is compared for this target too and currently contributes no
CSS-only baseline entry: the one `css-mismatch` left in the four ratchets is on
`client`.

The enrolment seed was 4566. The dev-cluster campaign (#2020, #2022–#2026,
#2029, #2030, #2039, #2040, and the #2021 series) took it to 896, #2116
(legacy instance-script instrumentation) to 639, #2090 (module-script
`await` instrumentation) to 427, #2028 (`console.*` wrapping) to 306, #2027
(ownership validation on `bind:` member mutations) to 284, #2231 (the same
validation on member assignments inside `$effect`) to 281, and the legacy
each-block `bind:` accessor shape (named `function get()` / `function
set($$value)` instead of arrows) to 234, the residual `$.tag` tail
(uninitialized legacy state without a trailing semicolon) to 224, and #2089 (the
same ownership validation on assignments and update expressions written in
template expressions, which are converted through the typed `JsNode` path) to
203, and the legacy half of the same validation (`prop_mutation_vars` was
gated on `analysis.runes`, so no `export let` prop member mutation in an
instance script was ever wrapped) to 187 — all with no regression on `client`
or `server`, both of which were empty throughout that campaign. Making the Phase-3 in-place path the one
that ships took it to 186: the text path dropped the `;` after a state
assignment that an `await` followed, so the two ran together into a call chain.
The dev eager read of a snippet parameter that carries a default value
(`{#snippet item(id = expr)}` — the plain-identifier parameter took a code path
that skipped the `$.get(id);` upstream emits so `Cannot access x before
initialization` still throws) took it to 180. The `bind:this={obj.foo}` setter
took it to 133: upstream builds that setter by visiting a synthesized
`obj.foo = $$value` assignment, so it reaches `validate_mutation()`
(`shared/utils.js:300`), whereas rsvelte built it directly and so emitted
neither the wrapper nor the preamble. Eight of the 47 cleared entries are that
fix; the rest were already passing and had simply not been re-measured since the
PRs that fixed them.

Seven more dev fixes took it to 91: arrow-only event-handler naming
(`shared/events.js` names a handler only when it is an
`ArrowFunctionExpression`, so a bubble handler no longer burns a
`scope.generate()` slot), the `$.tag` label for a hand-written accessor over a
private field, `state.filename` (`analysis.filename` held only the basename, so
every dev source location was short), the `;` a wrapped whole-statement `await`
needs before the statement ASI used to separate, the quote style of the
`console.*` wrap's method name, the prop-mutation locator consuming a match
written inside a comment or a string, and the comments leading a `$:` statement
that has a surviving successor.

Emitting the `$.assign` stale-value wrap from the typed `JsNode` path took it to
85. Three of the six cleared entries are that fix; the other three are the
equality instrumentation the dev constant-fold fix had already corrected without
being re-measured.

Pairing each `$$ownership_validator.mutation(...)` with the source position of
its **own** member path took it to 46. The locator scanned the source with a
single monotonic cursor per prop, which assumes mutations are emitted in source
order; legacy `$:` statements are re-grouped in dependency order, so every
mutation of a prop that is mutated more than once reported its neighbour's
line/column. 16 of the 39 cleared entries are that fix (`svelthree/*` and
`svelte-ux/DateRange`, all of which mutate one prop from several `$:`
statements); the rest were already passing and had not been re-measured since
the PRs that fixed them.

Pairing them by the *value* each mutation writes took it to 42. Matching on the
member path alone cannot separate two mutations of the same member, and matching
in output order gets them backwards whenever a `$:` body — emitted at the end as
a `legacy_pre_effect` — competes with a function declared after it. The locator
now also reads a chain written through a TypeScript non-null assertion or an
optional access (`selected!.from`, `selected?.from`), which it had been skipping
entirely.

Building the injected stylesheet's dev source map took it to 22. `css/index.js`
runs the whole `.svelte` source through MagicString, so the map is not a
per-token table: a segment lands at the first character of every unedited chunk,
after every newline inside one, and at every `addSourcemapLocation` — which the
`_` visitor calls on the `start` and `end` of every node it visits, recursing
into a `PseudoClassSelector` only for `is`/`where`/`has`/`not`. The scoping
modifier is inserted with `appendLeft`, which maps nowhere at all. rsvelte builds
its stylesheet by writing into a string, so the writer now records the source
offset of every copied run alongside the marks, and the map is emitted from
those. A selector that the transform did not reproduce verbatim (anything beyond
skipping the modifier) falls back to unmapped rather than mapping to the wrong
place. A custom element gets the map too: upstream's gate is `dev &&
inject_styles && css.code`, which `$css.code` satisfies like any other injected
stylesheet.

Honouring `path.at(-1) !== 'ExpressionStatement'` on the JSON expression path
took it to 20. That half of upstream's condition had no equivalent there, so a
bare assignment statement inside an `{@attach}` block body was wrapped even
though its value is discarded.

Restricting the component-prop exemption to a component that is a `Fragment`
child took it to 18. Upstream spells it `path.at(-2) === 'Component' &&
path.at(-3) === 'Fragment'`, and an element's children are the one container it
does not visit through a `Fragment` node, so a component nested in an element
keeps the wrap.

Nesting the legacy `$.invalidate_inner_signals` sequence inside the ownership
wrap took it to 16. Upstream builds that sequence in `build_assignment` and
hands the result to `validate_mutation`, so it is the wrap's third argument;
rsvelte's text pass matched only the `prop(...)` call and left the sequence
around the wrap instead.

Validating every prop-rooted `bind:` setter mutation took it to 14.
`validate_mutation` gates on the *root binding* being a prop, not on whether the
mutation itself is wrapped, so a runes non-bindable prop — which assigns the
member directly, with no `prop(…, true)` call around it — needs the wrap too.

Labelling every proxied `$state` initializer took it to 12.
`create_state_declarator` decides on the **visited** expression, so in dev an
`a === b` initializer has already become a `$.strict_equals(...)` call and
therefore proxies (an arithmetic `BinaryExpression` still does not); and a
`$state` declared inside a template handler body reaches the expression
converter, which had no way back to the declarator's name.

Instrumenting a `$derived` destructuring default took it to 11. The pattern's
source text was lifted verbatim before the walk reached it, so a default value
never got the dev equality rewrite any other expression gets.

Locating the traced function past a comment took it to 9. The `$inspect.trace()`
label carries `locate_node(fn)`, which rsvelte finds by scanning backwards from
the call — and a comment between the function head and the call answered for it.

Resolving a shadowed name through the scope chain a script reference actually
sees took it to 7. Two things fed the `console.*` wrap's `scope.evaluate`
lookup the wrong binding: a legacy instance declaration wrote its initializer
onto a same-named module binding (the write resolved through the root scope's
declarations only), and a template binding — an each item — stayed a candidate
for a reference inside the instance script.

Leaving the async-destructuring IIFE uninstrumented took it to 4. `[a, b] =
await …` is lowered to `await (async ($$value) => { … })(…)`, and the dev
`await` pass wrapped that generated call as well as the source `await` it was
built around — upstream destructures after a single instrumented `await`.

Four last fixes took it to 0. `build_assignment` hands the `await` it adds to
`context.visit`, so `$.assign_async(…)` is instrumented like any other `await`
while `arrow` (`utils/builders.js`) collapses the lazy getter it wraps back to a
synchronous `() => x()`. A site the transform decision rejects still has to be
spent, or a later identical member chain reports its position. The dev `await`
wrapper opens with `(`, so it continues *any* statement ASI left open — not just
another wrapped `await`, which is all the previous check covered. And in a
partially pruned selector list the `/* (unused) ` markers are `prependRight` /
`appendRight` insertions while the separator before a pruned selector goes
through `overwrite`, which keeps the chunk it replaces — so both selectors and
that separator still carry source-map segments.

#### What is left

Nothing. The last entry — `runed/…/demos/scroll-state.svelte`, which writes
`onsubmit={preventDefault(() => (scroll.x = x))}` and had rsvelte emitting the
bare `scroll.x = $.get(x)` where upstream wraps it as
`$.assign(scroll, "x", "=", $.get(x), "…scroll-state.svelte:41:69")` — is fixed.
The event-attribute exemption from the coerced-away-proxy dev warning
(`AssignmentExpression.js:170-236`) was applied to every arrow anywhere in the
attribute expression, but upstream requires the arrow to *be* that expression
(`path.at(-2) === 'RegularElement'`), so an arrow passed as a call argument was
never exempt. Every other dev-helper cluster the enrolment-era table tracked —
the equality instrumentation, `$.track_reactivity_loss`, ownership mutation
validation, `$.tag()` / `$.tag_proxy()`, `console.*` wrapping and the signal
read/write row — was already empty.

The two divergences this section used to defer — both were deferred only because
**no corpus entry reached them** — are now **closed**, and both are pinned in the
pattern corpus rather than described here:

- **Over-reach**, `assign-exempt-arrow-does-not-cover-a-nested-arrow.svelte`.
  `onclick={() => (a.b = f(() => (c.d = e)))}` must emit `$.assign(c, 'd'` and
  must not emit `$.assign(a, 'b'` — one input, both signs. Official emits exactly
  that and so does rsvelte, on all four targets.
- **Under-reach**, `assign-exempt-arrow-on-svelte-element.svelte`.
  `<svelte:element this={tag} onclick={() => (o.x = v)}>` must emit no `$.assign`
  at all; official emits `() => o.x = v` and so does rsvelte.

Both repros were verified to **reach** the decision before being called closed:
official's own output for the first carries `$.assign(c, 'd', '=', e, …)`, so a
port that exempted nothing would still differ. A repro that goes green without
reaching the decision is evidence about the repro, not about the defect.

Counting method, for whoever picks this up: attribute an entry by **comparing
how many times each helper appears** on each side, never by the first differing
line. A pure statement **reordering** reports as the helper on the expected side
being *absent*, so a positioning bug reads as an unported feature — #2020, #2022
and #2023 were all filed as "not emitted" and all turned out to be emitted in
the right number and the wrong place.


### Wave-2 enrolment (#3176) — where all 1,413 entries come from

The corpus went from 37 corpus sources to 104 (103 pinned repositories plus
the in-repo `pattern-corpus`) and from 14,780 entries to 34,601. Every entry in all four ratchets above comes from one of the 67 new
repositories: **49 of them contribute at least one, and the 37 pre-existing
sources contribute zero.** That is the positive control for the enrolment — it
added inputs, it did not regress anything already covered.

The four ratchets were re-measured after this branch was rebased onto `main`,
which took them from 1,977 entries to 1,413: `client` 663 → 542, `server`
307 → 148, `server-dev` 304 → 145, `client-dev` 703 → 578. Nothing here was
fixed by the rebase itself — `main` had landed the fixes and the entries had
simply not been re-measured against it, which is why a baseline is a
measurement of the merge base and has to be retaken after one moves.

Five defect classes the enrolment found were fixed rather than listed here.
Four of them are not divergences you can ratchet at all; the fifth is, and the
gate that found it is the one that compares rsvelte to nothing:

- **Two CSS-parser infinite loops.** `parse_rule` records
  `css_expected_identifier` and consumes nothing when the selector is empty, so
  both callers that dispatch to it spun forever. `@media #{devices.$break1} { … }`
  (SCSS interpolation in plain CSS, from appwrite-console) reaches the first: the
  prelude scan stops at the interpolation's brace, leaving ` {` as a block item.
  A hang is not a verdict — it stalls the whole sweep, so `compile.mjs` now kills
  a worker that stops making progress and records `rust_hang`.
- **Two UTF-8 char-boundary panics**, both slicing a `&str` at a byte offset
  measured somewhere else: the source-map column (an em dash in an instance-script
  comment, threlte and primo) and the `svelte-ignore` back-scan (a variation
  selector in markup, dev mode only, kite-public). Each aborted the process.
- **The UTF-8 BOM was template text.** rsvelte had no equivalent of upstream's
  `remove_bom`, so a component whose markup is one child element emitted a stray
  text node around it. **320 of the enrolment's divergences were this one
  character** — 14% of the backlog, in cnblocks alone.
- **A `$store` setter read its store as a bare name.** Upstream resolves the
  store *variable* through its own binding (`get_store()`), so the first
  argument of `$.store_set` is `$.get(store)` / `store()` / `$$props.store`.
  Both ports of the store builders emitted the bare identifier and left a later
  pass to fix it up — which the `$.store_mutate` call sites did and the
  `$.store_set` ones did not, so eight bind-setter entries (mathesar,
  svelte-lexical, svelvet) were wrong. **The transform-idempotency gate is what
  found it**: applying the transform twice produced the *correct* text, and no
  amount of output comparison names which of the two passes is the defect.

#### The largest remaining clusters

Counts are `(id, target)` pairs and clusters are keyed by the first differing
line, so this is a diagnostic ordering, **not a partition** — most of the tail
is one entry. `E:` is official, `A:` rsvelte.

| n | target | first differing line | example repo |
|---|---|---|---|
| — | — | — | — |

**Every appwrite-console cluster is gone, and with it both server targets.**
Six of the ten rows above used to be a `$$renderer.push` / template-string
divergence on appwrite-console, and the largest was 71 pairs; `main` fixed them
before this branch was rebased onto it. The TypeScript legacy-reactive prop-read
clusters were retired by #3934. The 45 huly entries whose first difference was
a destructuring assignment returning `res`, `result`, or `$$value` from its
generated IIFE were all the statement-boundary defect fixed by #3933 and are
now retired from both client baselines. The remaining two Huly files combined
that ordering graph with a nested `[[mode]] = config`: Phase 2 recorded `mode`
as an assignment, but Phase 3 rebuilt the assignment side with a text scan that
could not cross the destructuring brackets. Both graph sides now consume the
same typed metadata, retiring four more target-pairs. The two open-webui entries whose comment
text rewrote `$i18n.languages` to `$i18n().languages` were fixed by #3941's
comment-aware store-read transform and are now retired from both client baselines.
Fourteen title entries across cobalt, mathesar and open-webui were one
memo-definedness defect: upstream evaluates the fresh `$N` returned by its
memoizer and retains `?? ''`, while rsvelte evaluated the original call and
incorrectly removed the fallback. The single- and multi-expression title paths
now both preserve it, retiring 28 target-pairs.
Eight remaining legacy-title entries used a store subscription as the callee
(`$t('key')` or `$i18n.t('key')`). The title visitor's local copy of
`build_template_chunk` applied identifier transforms directly and skipped
`build_expression`, dropping both the coarse-grained store dependency read and
the `$.untrack` wrapper. Both title paths now use the same expression builder as
the shared template-chunk path, retiring 16 client target-pairs.
Six client-dev entries emitted the correct ownership-validation wrapper but
reported the wrong source line. One matcher counted every repeated RHS word, so
a later generic `filter.value.filter(...)` assignment could outscore the actual
site; source words are now deduplicated before scoring. Five more sites used a
parenthesized TypeScript assertion target (`(step.params as any) = params`),
which disappears from generated JavaScript and was skipped by the textual site
collector. The collector now crosses that assertion only when its closing
parenthesis is followed by a mutation operator. The six verified entries are
retired without suppressing the distinct computed- and mid-chain-assertion
shapes that remain.
The remaining computed and mid-chain TypeScript assertion shapes are now
collected too. The scanner finds the assertion wrapper with the shared
JavaScript-aware bracket matcher, then resumes the member chain after `)`, so
nested parentheses in a type cannot terminate the target early. This retires
the two corresponding client-dev entries.
The two threlte `bush.svelte` files destructure `[$gltf, $texture1]` in an
`{:then}` clause while an unrelated top-level `gltf` store exists. The lexical
store scan ignored the await scope and synthesized a root `$gltf` subscription;
template-block collection now removes each/await/snippet bindings only inside
the fragment where they shadow, retiring four target-pairs without hiding a
same-named top-level store reference elsewhere.
Threlte's `Particle.svelte` binds a component instance into a member of a runes
mode each item. The synthesized `bind:this={audio.ref}` setter now records the
same each-item mutation as upstream's transform, retaining the required index
parameter and retiring its client and client-dev entries.
The three AdventureLog entries whose same-line legacy-prop comments disappeared
from the final `$.prop` argument were fixed by #3937's comment-preserving prop
lowering and are now retired from both client baselines.
The two sparrow-app entries whose callback-leading `"click dont save"` string
statements disappeared were fixed by restoring OXC's separately stored
`FunctionBody.directives` before the ordinary statements, and are now retired
from both client baselines.
The two svelte-commerce entries whose generated `<meta>` local was unnecessarily
renamed to `meta_1` were fixed by excluding `import.meta` and `new.target` name
slots from the Phase 2 global-reference conflict set and are retired from both
client baselines.
The latest completed report is filtered through the current baselines before
each removal. Its remaining larger normalized signatures are re-audited rather
than removed as a cluster, because identical first lines can hide different
later causes.

#### The SCSS custom-property under-rejection cluster

This is the class no amount of corpus growth found before, because it needs
code that is *almost* legal. The latest completed report's observable residue,
filtered through the current baselines, was three source entries (twelve
target-pairs), all under-rejections of SCSS interpolation in a custom-property
value. The style look-ahead now follows upstream and treats the first `{` as
the start of a nested rule, producing `css_expected_identifier`; all three
entries are retired here.

### Hard-cluster warnings for future work

Deep areas where past fixes caused wide regressions (mirror upstream exactly;
verify against the full corpus + byte-exact runtime/ssr/css suites before
landing):

- **scope.evaluate `is_defined` / `should_proxy` lattice** — widening it to drop a
  spurious `?? ''` or proxy regresses real props that need `?? ''`. svelte resolves
  via scope; a name-keyed approximation cannot represent per-site outcomes — use
  per-site (Semantic / scope-chain) resolution.
- **each-item reactivity wrapping** (function-depth `has_external_dependencies`
  check) — a prior attempt caused ~498 regressions.
- **`$derived` currying** (`yScale()(tick)`) — reverted twice; do not retry naively.
- **store/runes name-conflict resolution** — two independent sub-bugs that must land
  together and distinguish getter-vs-user-call by context.
- **CSS structural prune** (`is_structural_descendant_chain_unused`) bails on
  snippet-declared elements, `<selectedcontent>`, `:host`/`:root`/`:global`,
  functional pseudo-classes, and escaped identifiers — extend only with the
  matching upstream semantics.

<a id="lint-adversarial-end-known-failures"></a>

## lint-adversarial-end-known-failures.json — history and invariant

`scripts/compat-corpus/lint-adversarial-end.mjs` compares, for every finding
whose full `(ruleId, line, column, message)` key **already matches** on both
sides, the `(endLine, endColumn)` pair. Every other lint gate keys a finding on
its START, so a rule that reports at the right place with the right text and
underlines the wrong region was invisible to all of them — the same split the
compiler-error gates already make, where `end` is ratcheted apart from `start`
because an entry listed for one suppresses everything about that entry.

Entry format: `<pattern>|<ruleId> <start>\t<oracle end>\t<rsvelte end>`.

The first run reported **670 divergences over 4611 compared findings across 20
rules**. Every divergence is now fixed, and in every ranged case the cause
was one wrong `ctx.report` argument rather than many separate bugs — four rules
were passing `end == start`, i.e. a zero-width range, which alone accounted for
73 rows.

`lint-adversarial-end-known-failures.json` currently holds **0 entries** over
5519 compared findings. It briefly grew from 7 to 12 when ~290 patterns made
five more `experimental-require-slot-types` findings comparable; the last
section explains why fixing the report gate can expose new end comparisons.

### The last shape closed: upstream has no end at all

ESLint omits `endLine` / `endColumn` entirely when a rule reports a bare
position (`loc: { line, column }`) instead of a node. Two rules do that:

- `experimental-require-slot-types` — `context.report({ loc: { line: 1, column: 1 }, messageId })`
  (`experimental-require-slot-types.ts:53-58`). 10 entries.
- `block-lang`, the `enforceStylePresent` arm — `context.report({ loc: { line: 1, column: 1 }, message, suggest })`
  (`block-lang.ts:105-112`). 2 entries. Its per-node arms pass `node: styleNode` /
  `scriptNode` and already match.

`block-lang`'s `enforceScriptPresent` arm reports the same way and would add a
third source, but it is **unreachable by this corpus**: options are supplied to
a pattern through an inline `/* eslint <rule>: [...] */` comment, which ESLint
only reads from a JS comment, which requires a `<script>` — whose absence is the
condition that arm tests. Neither an HTML comment nor a CSS comment is picked up
(measured). The arm was checked by hand instead, driving both sides with an
explicit config: both report at 1:2 with the same message.

The shared `rsvelte_diagnostics::Range` remains unchanged: internal consumers,
fixes and the language server still receive a concrete range. Lint findings now
carry separate `omit_end` metadata. The SARIF and engine JSON compatibility
encoders use it to omit `endLine` / `endColumn`, while consumers that need a
range fall back to the start. This represents upstream's bare location without
weakening the shared diagnostic model.

### Reading this gate next to gate 28

The two are coupled in one direction. A finding one side does not report has no
counterpart, so it is skipped here rather than reported — which keeps this
ratchet from becoming a copy of the report ratchet, and means **fixing a
start-side divergence ADDS rows here** as newly-matched findings become
comparable. A growing count after a report-gate fix is expected. A *shrinking*
count is the one to look at: it can mean a finding stopped being reported at
all, which is a report-gate regression wearing this gate's clothes.

<a id="lint-adversarial-fix-all-known-failures"></a>

## lint-adversarial-fix-all-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-adversarial-fix-all.mjs` compares, per pattern under
`compatibility/lint-adversarial/`, the **text `--fix` produces with the whole
74-rule universe enabled** — the real `eslint-plugin-svelte` as oracle, native
`rsvelte-lint` as subject, both working on copies, both forced to `warn` on
every rule in `lint-universe.mjs`.

[`lint-adversarial-fix-known-failures.md`](#lint-adversarial-fix-known-failures)
covers the same corpus with **one** rule enabled per pattern — the rule its
directory names — because resolving overlapping fixes *across* rules is ESLint's
driver policy rather than any rule's port. That scope leaves two populations
uncompared, and both turned out to hold defects:

- **a rule whose fixer touches a pattern filed under another rule's directory.**
  The per-rule gate never enables `svelte/html-quotes` on a `comment-directive/`
  pattern, so it could not see that rsvelte's `--fix` resolved
  `eslint-disable-line` against a different line table than its own report path
  (fixed; see below).
- **what a second pass sees.** A fix by rule A changes the text rule B is handed,
  which reaches arms no single-rule run can (`no-target-blank/10` was one), and can
  hand a rule text that crashes it (`no-navigation-without-base/06`).

An entry needs a reason that is *not* "rsvelte is wrong here".

`lint-adversarial-fix-all-known-failures.json` holds **1 entry** over 1364
compared patterns.

Two verdicts share the file, kept apart by the key so neither can suppress the
other on the same pattern: a bare `<id>` is a text divergence, and
`oracle-crash:<id>` is a pattern ESLint threw on while fixing, where there is no
text to compare.

Partition of `lint-adversarial-fix-all-known-failures.json` by cause: `1`

| cause | entries |
|---|---|
| upstream rule crashes on text an earlier pass produced | 1 |

#### DoD-4 attribution — **U**

Attribution of `lint-adversarial-fix-all-known-failures.json`:

| n | target | cluster |
|---|---|---|
| 1 | `upstream_issues/eslint-plugin-svelte-no-navigation-without-base-empty-href-crash.md` | ESLint throws while fixing; there is no oracle output to compare |

`oracle-crash:no-navigation-without-base/06-template-literals.svelte` is attributed to
[`upstream_issues/eslint-plugin-svelte-no-navigation-without-base-empty-href-crash.md`](../upstream_issues/eslint-plugin-svelte-no-navigation-without-base-empty-href-crash.md).

The chain is two upstream rules, not one: `no-useless-mustaches` rewrites `href={``}` to
`href=""`, and `svelte-eslint-parser` gives an attribute written `href=""` an **empty** `value`
array, so `no-navigation-without-base` dereferences `node.value[0]` on `undefined`. The entry is
therefore reachable only through `--fix`, which is why the per-rule fix gate never produced it —
that gate enables one rule per pattern.

Nothing on rsvelte's side diverges here: there is no oracle output to compare against, because
the oracle threw. The entry leaves this ratchet when eslint-plugin-svelte ships the guard.

### What this gate found on its first run

**rsvelte's `--fix` and its report path resolved disable directives against
different line tables.** `lint_source_messages` filters on the line the finding
is *reported* on (`runner.rs`), which for the seven rules in
`diagnostic.rs::uses_eslint_line_table` is ESLint's table — the one that counts
U+2028 and U+2029 as line terminators. `fix_source_at` and `lint_source_raw`
filtered on `LineIndex::line`, the parser's table, which never does. Where the
two disagree the fix path and the report path disagree about which line a
directive covers, in both directions:

| pattern | report | `--fix` |
|---|---|---|
| `comment-directive/22-u2028-next-line.svelte` | suppressed | rewrote the source anyway |
| `comment-directive/23-u2029-disable-line.svelte` | reported at 2:9 | applied nothing |

Both reproduce with a **single** rule enabled (`svelte/html-quotes`), which is
what makes them the clearest possible statement of what the per-rule gate cannot
see: not an interaction, just a rule the per-rule gate never runs on that
pattern, because it derives the rule from the directory name. Both paths now go
through `LintDiagnostic::report_line`, and
`runner.rs::fix_honours_a_directive_across_a_js_line_separator` pins it.

The same shape as the `prefer-class-directive` U+FEFF find one gate over: two
implementations of one decision, and no gate that compares them to each other.

### Accepted entries

#### `oracle-crash:no-navigation-without-base/06-template-literals.svelte`

**ESLint throws; there is no oracle output to compare.** `svelte/no-useless-mustaches`
rewrites the pattern's `<a href={``}>` to `<a href="">`, and the next `--fix`
pass hands that to `svelte/no-navigation-without-base`, which reads
`node.value[0].type` without checking that the attribute has a value node —
`svelte-eslint-parser` gives `href=""` an empty `value` array.

Minimal reproduction, verified against v3.23.0 in a project declaring
`@sveltejs/kit`: `<a href="">x</a>` throws, `<a href="/y">x</a>` does not.
rsvelte reports `href=""` and does not crash. Reported in
[`upstream_issues/eslint-plugin-svelte-no-navigation-without-base-empty-href-crash.md`](../upstream_issues/eslint-plugin-svelte-no-navigation-without-base-empty-href-crash.md).

It is a ratchet entry rather than a hard abort because a crashing oracle would
otherwise make this gate unrunnable, and rather than a skip because the entry is
what fails the day upstream fixes it — which is when the pattern becomes
comparable again.

<a id="lint-adversarial-fix-known-failures"></a>

## lint-adversarial-fix-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-adversarial-fix.mjs` compares, per pattern under
`compatibility/lint-adversarial/`, the **text `--fix` produces** with only the
rule its directory names enabled — the real `eslint-plugin-svelte` as oracle,
native `rsvelte-lint` as subject, both working on copies.

A fix appears in no other comparison this project runs. `lint-adversarial.mjs`
and `lint-verify.mjs` key on `(ruleId, line, column, message)`, which cannot see
an edit at all: a rule can report at exactly the right position and still write
the wrong replacement text, or write correct text over the wrong range.
`lint-adversarial-suggest.mjs` compares suggestions, which by definition are the
edits `--fix` never applies. Upstream's own fixtures gate this only for the
shapes upstream ships (`crates/rsvelte_lint/tests/eslint_plugin_oracle.rs`,
`*-output.svelte`).

Fixes are compared one rule at a time rather than with the whole universe
enabled, because ESLint resolves overlapping fixes *across* rules by a
scheduling policy that belongs to ESLint's driver rather than to any rule's
port. Within a rule both sides multi-pass to a fixpoint (10 passes, ESLint's
`Linter.verifyAndFix` bound; `runner.rs::fix_all` mirrors it), so an entry here
can be a difference in what a *later* pass sees rather than in any single edit —
the gate runs to the same ten-pass fixpoint even when its ratchet is empty.

An entry needs a reason that is *not* "rsvelte is wrong here".

`lint-adversarial-fix-known-failures.json` holds **0 entries**.

Partition of `lint-adversarial-fix-known-failures.json` by cause: `0`

The gate found one defect no other lint gate could have: a rule's *fix* path and
its *report* path had two different notions of whitespace.
`prefer-class-directive` reported through `js_whitespace` (JS semantics, U+FEFF
included) but trimmed through Rust's `str::trim*` (Unicode `White_Space`, U+FEFF
excluded), so a `class` value padded with U+FEFF was reported at the same
position on both sides and rewritten differently. That split is invisible to
every gate keyed on `(ruleId, line, column, message)` by construction. Both paths
now go through `js_trim` / `js_trim_start` / `js_trim_end`.

### Accepted entries

None.

<a id="lint-adversarial-known-failures"></a>

## lint-adversarial-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-adversarial.mjs` lints every pattern under
`compatibility/lint-adversarial/` with both the real `eslint-plugin-svelte`
(oracle) and native `rsvelte-lint`, comparing every finding by
`(ruleId, line, column, message)` — the same key as the real-world lint gate.
Unlike that gate, the population here is **constructed**: each pattern is written
to separate two plausible implementations of one rule, so a divergence is a
deliberate probe coming back positive rather than an accident of what published
code happens to contain.

`lint-adversarial-known-failures.json` holds **0 entries** and must stay empty.
It is not a backlog that may grow: all 1365 constructed patterns across 74
rules agree. Everything the corpus surfaced (330 divergences on the first run,
35 more when it grew past 1000 patterns) has been fixed or reproduced at the
narrowest compatibility boundary.

`+` = rsvelte reports, oracle silent. `-` = oracle reports, rsvelte silent.

### Last entry closed

#### `no-nested-style-tag/14-component-lookalike.svelte` `-svelte/html-self-closing 5:8`

`<Style />` is a component whose name differs from `style` only in case.
Upstream reports `html-self-closing` on it because of a parser preprocessing
quirk; rsvelte now reproduces that classification inside this rule only.

`svelte-eslint-parser` blanks script/style/template blocks out of the template
before handing it to the Svelte compiler, using
`/<!--[\s\S]*?-->|<(script|style|template)([\s>])/giu`
(`lib/context/index.js:236-238`). That regex is **case-insensitive**, so `<Style `
matches, and the self-closing form is rewritten to `<S---- />`
(`lib/context/index.js:115-120`), which fails Svelte's component-name test. The
compiler therefore returns a `RegularElement`, `extractElementTags` restores the
name, and the rule sees an "HTML element" literally named `Style` →
`getElementType` `normal` → the default `"never"` → reported.

The compiler AST remains correct: `svelte/compiler`'s
`parse("<Style />", { modern: true })` yields `Component Style`, as does
rsvelte. `html_self_closing.rs` applies an oracle-compatibility adapter after
that shared AST boundary, so unrelated template rules continue to see a
component.

Measured boundary (direct `parseForESLint` probe): the parser's
`/>\s*$|^\s*$/m` prefix check means `<Style />`, `<Script />`,
`<div><Style /></div>`, and even `x\n<Style />` land on `html`; `<Style/>`
with no space, `<Style></Style>`, `<Styled />`, `x<Style />`, and
`<Template />` land on `component`. Unit tests pin both sides of that boundary.
The upstream defect remains documented at
[`upstream_issues/svelte-eslint-parser-self-closing-style-lookalike-component.md`](../upstream_issues/svelte-eslint-parser-self-closing-style-lookalike-component.md).

### Adding a pattern

Patterns are grouped one directory per rule. A pattern must be valid Svelte 5
that `svelte-eslint-parser` accepts — the harness treats an oracle parse error as
a **hard error** (a pattern that does not parse measures nothing), where the
collected corpus merely counts and skips it. Run one rule at a time with
`--filter '<rule>/'` while iterating; `--update` refuses to run under `--filter`
because it would delete every entry the filtered run did not measure.

<a id="lint-adversarial-suggest-known-failures"></a>

## lint-adversarial-suggest-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-adversarial-suggest.mjs` compares, per finding
position, the **ordered list of `{desc, text produced by applying that one
suggestion}`** for every pattern under `compatibility/lint-adversarial/`, with
the real `eslint-plugin-svelte` as oracle and native `rsvelte-lint` as subject.

A suggestion is an editor-offered code action that `--fix` never applies, so it
appears in no other comparison this project runs: `lint-adversarial.mjs` and
`lint-verify.mjs` key on `(ruleId, line, column, message)`, and
`lint-adversarial-fix.mjs` compares the text `--fix` produces — which by
definition excludes every suggestion. The comparison is on the resulting TEXT
rather than the edit range, because ESLint's ranges are UTF-16 code units into a
JS string and rsvelte's are UTF-8 byte offsets, so equal edits have unequal
coordinates.

An entry needs a reason that is *not* "rsvelte is wrong here".
`lint-adversarial-suggest-known-failures.json` currently holds 0 entries.

<a id="lint-conditions-known-failures"></a>

## lint-conditions-known-failures.json

`scripts/compat-corpus/lint-conditions.mjs` compares whether each rule can run
under Svelte 5. `lint-conditions-known-failures.json` has 0 entries. rsvelte and
eslint-plugin-svelte agree on the runes-mode pair, the Svelte-version
eligibility, and the SvelteKit-gated set for every shared rule.

The gate derives upstream's answer from `meta.conditions`; it does not maintain
a copied oracle list. `shouldRun` treats condition objects as alternatives, so
the reduction first removes objects whose `svelteVersions` does not admit `5`
and then unions the runes values of the reachable objects. Unioning every
object would incorrectly make a Svelte-3/4 alternative affect Svelte-5
behaviour.

### Svelte-version eligibility

Two upstream rules have no condition object reachable on Svelte 5:

- `svelte/experimental-require-strict-events`
- `svelte/require-event-dispatcher-types`

They are listed in `crates/rsvelte_lint/src/svelte_version.rs`. Both the native
and script rule engines consult that model, and the source-scan runner uses it
before invoking either legacy rule. Explicitly configuring either rule
therefore remains silent, matching upstream; default severity is no longer the
only protection against an over-report. The condition gate independently
derives the unreachable upstream set and diffs it against this Rust list with
`svelte-3-4-only-{missing,extra,unknown}` keys.

The finding-level lint universe includes both rules. That makes the ordinary
parity gates exercise the skip instead of hiding the difference with a manual
exclusion.

### Body-level runes checks

Upstream's `svelte/no-at-const-tags` declares no runes condition and performs
`runes === true` gating inside the rule body. rsvelte now mirrors that layout:
its `RuleConditions` has no runes restriction and `check_root` performs the
mode check. This avoids representing one effective condition twice and makes
the metadata comparison truthful without changing findings or fixes.

The apparent upstream third value, `'undetermined'`, is not reachable for a
file parsed by svelte-eslint-parser: an unspecified component mode is resolved
through `hasRunesSymbol` to a boolean. If that parser behaviour changes, a
body-level gate may need its own explicit comparison; the present gate cannot
discover arbitrary checks inside `create()`.

### SvelteKit and remaining blind spots

`svelteKitVersions` and `svelteKitFileTypes` are represented by
`crates/rsvelte_lint/src/sveltekit.rs`. The gate derives the upstream gated set
and compares both directions against `SVELTEKIT_ONLY`.

`svelteFileTypes` remains uncompared. `svelteVersions` is reduced to whether a
rule is reachable on Svelte 5, so narrower distinctions within Svelte 5 are not
represented. The rsvelte metadata side is also a guarded regex over Rust
source. See gate 34 in `compatibility/gate-coverage.md` for the evidence and
limits.

<a id="lint-env-known-failures"></a>

## lint-env-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-env.mjs` lints the mini-projects under
`compatibility/lint-env/` with both the real `eslint-plugin-svelte` (oracle) and
native `rsvelte-lint`, comparing findings by `(ruleId, line, column, message)` —
the same key as the other lint gates. What is different is the **population**:
the sources are byte-identical across projects and only the `package.json`
differs, so a divergence is attributable to the environment and to nothing else.
The gate asserts that identical-sources invariant rather than trusting it.

**`lint-env-known-failures.json` is expected to stay empty, and holds 0 entries
today.** It is not a burndown backlog. An entry
here means rsvelte behaves differently from ESLint *because of what the project
declares*, which is a class of bug users hit on their own machines and no other
gate can reach.

### Why this gate exists

eslint-plugin-svelte gates five rules on SvelteKit being resolvable **from the
linted file's path** (`getSvelteKitVersion` in `src/utils/svelte-context.ts`):
`no-goto-without-base`, `no-navigation-without-base`,
`no-navigation-without-resolve`, `no-export-load-in-svelte-module-in-kit-pages`
and `valid-prop-names-in-kit-pages` — the last two indirectly, because
`svelteKitFileType` is only computed once a version is known, so a
`svelteKitFileTypes` condition also fails without SvelteKit.

Every other lint gate compares files that share one ancestry, and
`compatibility/lint-adversarial/package.json` declares `@sveltejs/kit` for the
entire adversarial corpus — deliberately, so those rules are exercised. The
consequence is that "is SvelteKit installed" was a **constant** across every
population this project measures, and rsvelte's total absence of the condition
was invisible: in a plain Svelte project it reported all five rules where ESLint
reports none. Measured on a two-file project whose only difference was a
`@sveltejs/kit` entry in `package.json`: 3 rsvelte-only findings without it, 0
with it.

`svelteVersions` is deliberately **not** modelled, and that is not an omission.
Upstream's `getSvelteVersion()` takes no file path — it reads the `svelte`
package the *plugin itself* resolves — so it describes the linter's own
installation rather than the linted project. rsvelte, being a Svelte 5 port,
behaving as "5" is the faithful answer.

### Adding a project

Copy an existing directory and change **only** the `package.json`. The gate
refuses to run if two projects' same-named sources differ, because a population
that varies the sources measures the sources. It also refuses when every
project yields the same oracle finding count: that means the manifests do not
separate any rule, so agreeing with upstream would prove nothing.

<a id="lint-known-failures"></a>

## known-failures.json — why entries are accepted (lint corpus)

The lint-parity corpus (`scripts/compat-corpus/lint-verify.mjs`) lints every
`.svelte`, `.svelte.js` and `.svelte.ts` source in `eslint-plugin-svelte` +
`svelte-eslint-parser` plus the real-world libraries bits-ui / flowbite-svelte /
melt-ui / shadcn-svelte / skeleton with both the real `eslint-plugin-svelte`
(oracle) and native `rsvelte-lint`, recording every finding that appears on
exactly one side. The ratchet may only shrink.
`FP` = rsvelte reports, oracle silent. `FN` = oracle reports, rsvelte silent.

The exact-fixture oracle gate (`crates/rsvelte_lint/tests/eslint_plugin_oracle.rs`)
is the authoritative behaviour check and must stay 100%; this corpus is the
real-world volume check.

### Current baseline: `lint-known-failures.json`, 0 entries

The last three entries were one shape: a CSS-warning ignore in front of an
SCSS/Sass/Less style block. Upstream tries an installed style transform before
deciding whether the ignore is unused; rsvelte had only implemented its conservative
fallback for unavailable transforms and therefore treated every such ignore as used.
The native lint path now probes those dialects through the Sass-compatible backend,
uses the transformed warning-code set for the decision, and falls back conservatively
when a transform is unavailable or fails. PostCSS and Stylus remain on that fallback.

The input/output pair for eslint-plugin-svelte's TypeScript decorator indent fixture
previously added two `prefer-const` misses: the compatibility AST keeps a decorated
class opaque, hiding method-local declarations from the JSON walk. The rule now uses
its existing OXC semantic pass as a narrow fallback for initialized `let` bindings
that the JSON walk did not see; `prefer-const/22-decorated-class-method.svelte` keeps
that boundary in the constructed corpus.

Partition of `lint-known-failures.json` by rule: `0`
Partition of `lint-known-failures.json` by direction: `0`
Partition of `lint-known-failures.json` by repo: `0`

#### How it got here — 104 → 45 → 3 → 5 → 3 → 0

The entries this file used to describe were not burned down one at a time; they were a
side effect of the adversarial campaign documented in `AGENTS.md` under `rsvelte_lint`.
A *constructed* corpus of 809 patterns (`compatibility/lint-adversarial/`) found 330
divergences on inputs written to separate two implementations of one rule, and the fixes
for those classes closed 101 of the 104 entries here — the collected corpus had been
carrying defects whose discriminating shape it could not phrase.

Two clusters are worth remembering because they were the largest and neither was found
by the adversarial patterns first:

- **`sort-attributes` (36 entries)** stayed at 36 through the whole adversarial pass and
  then went to 0 in one fix: shorthand attributes and `this` are not `SvelteAttribute`
  nodes upstream, so the port was grouping and *naming* the wrong neighbour in
  "should go before". A generated family reaching a rule is not the same as it being able
  to discriminate that rule's decision.
- **`prefer-svelte-reactivity` (25 entries)** was a licensed gap: the module path declined
  to port *citing the absence of module coverage as the reason*, and enrolling
  `.svelte.(js|ts)` into the gate turned that licence into 23 visible entries. It is now
  ported, exports and all.

The historical narrative for the 238 → 104 phase (the `no-top-level-browser-globals`
scope resolver, the shorthand clusters) is preserved in this file's git history.

### Harness-config decisions (NOT rsvelte bugs)

These were divergences that turned out to be oracle/harness config, now resolved so
the comparison is meaningful. rsvelte's rule logic was correct throughout.

- **Browser globals must be declared for `no-top-level-browser-globals`.** The rule's
  `ReferenceTracker` is scope-based; `flat/base` declares no browser globals, so it
  was a silent no-op on every file. The oracle now declares a **curated**
  browser-global set (`scripts/compat-corpus/lint-oracle/browser-globals.json`),
  shared with rsvelte's `BROWSER_GLOBALS`. The full `globals.browser` (763 names) is
  intentionally avoided — the curated set already covers every global the corpus
  exercises, and keeping it small keeps the oracle environment auditable. (rsvelte
  now resolves scope for this rule — see the baseline note above — so common names
  like `open`/`name` are no longer mis-flagged when they are locals.)
- **ES/Web-API globals must be declared** for the other ReferenceTracker rules
  (`infinite-reactive-loop` tracks `setTimeout`/`setInterval`/`queueMicrotask`;
  `prefer-svelte-reactivity` tracks `new Date/Map/Set/URL/URLSearchParams`). The
  oracle declares `globals.builtin` + universal Web/Node APIs (collision-safe).
- **Type-aware rules are excluded from the parity universe** (`no-unused-props`,
  `no-navigation-without-resolve`, `require-event-prefix`): the oracle wires only the
  TS parser (no type checker), so they return `{}` and stay silent, while rsvelte's
  syntactic port correctly fires — a finding-level comparison is meaningless. They
  stay covered by the exact-fixture oracle test. (`EXCLUDE` in `lint-verify.mjs`.)

### Finding-level exclusions (`MANUAL_EXCLUSIONS` in lint-verify.mjs)

- **`comment-directive` on core `no-undef` (×1).** ESLint marks a disable "unused" by
  checking whether the disabled rule fired; for a **core** ESLint rule rsvelte does
  not implement, it always sees zero findings and cannot tell "ran, found nothing"
  from "never ran". Removing the guard introduces a real FP on the next directive
  (FN↔FP trade-off confirmed). An inherent scope boundary of a svelte-only linter.

The former `globals`-version exclusions are gone. eslint-plugin-svelte's own lock
uses `globals@16.4.0`, where `localStorage` and `sessionStorage` are browser-only but
`navigator` is also a Node global. The isolated oracle now pins that exact transitive
dependency: rsvelte keeps the two storage globals and excludes `navigator`, matching
both the live rule and its `localStorage` fixture without an exclusion.

<a id="lint-preset-known-failures"></a>

## lint-preset-known-failures.json — why each recorded difference is accepted

`scripts/compat-corpus/lint-preset.mjs` compares **what a user gets when they
write no configuration at all**: the default severity (`off` / `warn` / `error`)
that `eslint-plugin-svelte`'s `flat/recommended` and `rsvelte-lint`'s
`recommended` preset give each shared rule, plus rule ids present on only one
side.

Every other lint gate this project runs sets all 74 shared rules to `"warn"`
explicitly on both sides. That is the right key for asking "does this rule
behave the same", and it makes the default configuration a **constant those
gates cannot vary** — so a rule that runs out of the box on one side and not the
other, or at a different severity, is invisible to all of them no matter how
large the corpus grows.

`lint-preset-known-failures.json` holds **5 entries**. All shared-rule severity
differences have been removed; the remaining entries are rule-membership
differences.

Key format: `<upstream severity>-><rsvelte severity>|<rule id>`, plus two
membership classes `not-ported|<id>` and `rsvelte-only|<id>`.

Partition of the 5 entries by cause: **2 + 3** — two upstream-only ids and three
rsvelte-only ids.

### Severity is in the key, and putting it there is what found the largest class

The first version of this gate keyed on membership alone — `default-on-here` /
`default-off-here` — and reported **29** differences. Adding severity to the key
took it to **50**: twenty-one rules that both sides run by default, which
upstream defaults to `error` and rsvelte defaulted to `warn`.

That is not cosmetic. `crates/rsvelte_lint/src/main.rs` exits non-zero when any
finding has `DiagnosticSeverity::Error`, exactly as ESLint does — so on those 21
rules `rsvelte-lint` exited **0** on code where `eslint` with `flat/recommended`
exits **1**, and a CI pipeline that swapped one for the other went green on the
same source. A membership-only key reported all 21 as agreeing, which is the
`warning-missing:<code>` lesson again: a ratchet entry suppresses everything its
key cannot tell apart, so put the class in the key.

**All 21 were fixed rather than listed**, because the evidence says they were an
incomplete transcription and not a curation choice. rsvelte and upstream agreed
on the severity of every rule where rsvelte's value was not the blanket `warn` —
all 11 of rsvelte's `error` rules are `error` upstream, and both of upstream's
two `warn` rules are `warn` here, 13 for 13 — while the divergence ran one way in
all 21 cases, always rsvelte weakening. A deliberate policy does not have that
shape. `apps/npm/lint/README.md`'s "a handful … default to `error`" describes the
old set; that alignment made it 32, matching the independently gated
`require-event-dispatcher-types` declaration made it 33, and enabling
`no-unused-props` after fixing the native path's `ignorePropertyPatterns`
handling makes the shared default table fully aligned.

`no-unused-props` still deliberately skips declarations whose property set
cannot be resolved without a type checker (extends, intersections, generics and
imported types), rather than guessing and over-reporting. Its type-aware path is
covered separately against real `tsgo`; this gate only claims that the shared
rule's declared default now matches upstream.

### `not-ported` — 2 entries

- `svelte/system` is upstream's internal rule that implements comment
  directives (`<!-- eslint-disable-next-line -->` and friends). rsvelte
  implements the same behaviour in `crates/rsvelte_lint/src/suppression.rs`,
  which is not a rule and so has no id to compare. Suppression parity is
  covered by the finding-level gates, where a mis-parsed directive shows up as
  a missing or extra finding.
- `svelte/@typescript-eslint/no-unnecessary-condition` is upstream's Svelte-aware
  wrapper around a `typescript-eslint` rule and needs a type checker. rsvelte's
  type-aware backend lives in the out-of-workspace `rsvelte_lint_types` crate;
  the wrapper has no native counterpart.

### `rsvelte-only` — 3 entries

`svelte/no-undef`, `svelte/no-unused-vars` and `svelte/no-companion-module-shadow`
have no upstream counterpart. The first two are Svelte-aware ports of ESLint
**core** rules, which `eslint-plugin-svelte` deliberately does not ship (users
get them from ESLint itself, where the plugin's parser feeds them); rsvelte-lint
is a single binary with no ESLint underneath it, so it must carry them or leave
the checks unavailable. `no-companion-module-shadow` is rsvelte-only outright.

None of the three can produce a finding-level divergence in the other gates:
`scripts/compat-corpus/lint-universe.mjs` intersects the two rule lists, so a
rule only one side has is never enabled during a comparison. That is precisely
why they need a key here — they are, by construction, invisible everywhere else.

### DoD-4 attribution — **D**

All 5 are recorded in
[`deliberate-divergences.md`](#deliberate-divergences)
and pinned by the tests that cover the behaviour each entry claims is covered elsewhere:
`crates/rsvelte_lint/tests/comment_directive.rs` (9) for `svelte/system`,
`no_undef.rs` (6) / `no_unused_vars.rs` (23) / `no_companion_module.rs` (5) for the three
rsvelte-only rules, and `pnpm run test:type-aware-lint` (9) for the type-aware wrapper's
counterpart. **The pin is not the list** — it is the claim each entry makes about where the
behaviour lives, which is the part that would rot if a rule were quietly dropped.

### What this gate still cannot see

It reads `--list-rules`, which prints `RuleMeta::default_severity` — not what a
lint run actually enables, which is that filtered by `enabled_script_rules`
(SvelteKit availability, `RuleConditions` mode gating). And it never writes a
config file, so `extends` layering, `files`/`ignores` globs and per-rule options
are all off this path. Both limits are recorded as `compatibility/gate-coverage.md`
blind spots 33b and 33c.

Attribution of `lint-preset-known-failures.json`:

| n | target | cluster |
|---|---|---|
| 5 | [`deliberate-divergences`](#deliberate-divergences) | `rsvelte-lint` is one binary with no ESLint underneath it: it must carry the core checks or leave them unavailable, and it implements comment directives as a mechanism rather than as a rule id |

<a id="lint-severity-known-failures"></a>

## lint-severity-known-failures.json — why each entry is accepted

`scripts/compat-corpus/lint-severity.mjs` runs both linters **the way a user
runs them**: `eslint-plugin-svelte`'s `flat/recommended` verbatim against
`rsvelte-lint` with no `--config`, over every pattern in
`compatibility/lint-adversarial/`, comparing each finding's
`(ruleId, line, column, severity, message)`, and the process **exit code**.

Every other lint gate writes an explicit all-rules-`"warn"` config on both
sides. That is the right key for comparing rules, and it makes three things
constants none of them can vary: a finding's **severity**, the **exit code**,
and whether an inline `/* eslint … */` comment can still enable a rule the
preset leaves `off`. Gate 33 (`lint-preset.mjs`) pins the two presets, but it
reads them through `--list-rules` and upstream's exported config object — the
declared tables, never a run (gate-coverage blind spot 33b).

`lint-severity-known-failures.json` holds 58 entries.

Key classes:

| class | key | meaning |
|---|---|---|
| `severity` | `severity\|<id>\|<rule> <line>:<col>\|<oracle>-><rsvelte>` | both sides report it, at different levels |
| `missing` / `extra` | `missing\|<id>\|<rule>⇥<line>:<col>⇥<message>` | one side reports it |
| `exit` | `exit\|<id>\|<oracle>-><rsvelte>\|<causes>` | the process exit codes differ |
| `oracle-crash` | `oracle-crash\|<id>\|<rule>` | an upstream rule threw and took the file's whole report with it |

Partition of `lint-severity-known-failures.json` by cause: `57 + 1`

Two of those addends are a `4` and they are unrelated: the standalone `4` is the
`exit` 1→0 class below (a type-aware rule `lint-universe.mjs` excludes, which
still reports at `error` upstream). The four rsvelte over-rejections that used to
sit *inside* the first addend are fixed and no longer listed, which is why it
reads 56 rather than 60.

### `severity` — zero entries, and that is the measurement

Not a blank row. Over the 33 rules both presets enable by default, the run
compares 1,179 oracle findings against 1,179 rsvelte findings and **no pair
differs in level**. The 21 rules gate 33 found at `error` upstream and `warn`
here are confirmed aligned through an actual run, not only in the table
`--list-rules` prints.

A zero is only worth reading if the measurand could have moved, so the gate
refuses to pass unless **both** `warn` and `error` appear among each side's
findings — a run in which every finding carries one level cannot tell a severity
divergence from agreement. It currently sees 402 `warn` / 1,035 `error` from the
oracle and 2,504 / 1,035 from rsvelte. The control was also exercised directly:
re-running the subject with `--error svelte/no-at-debug-tags` moves 38 findings
and the gate reports **76** `severity` keys.

### `exit` 0→1, 57 entries — rsvelte surfaces a compiler diagnostic ESLint cannot see

`rsvelte-lint` merges the Svelte compiler's own diagnostics into its report and
exits non-zero on any `Error`, exactly as it does for a rule at `error`.
`svelte-eslint-parser` is deliberately more permissive than the compiler, so a
file the compiler rejects is linted cleanly by ESLint and exits 0.

Every one of these 57 patterns fails to compile, and it is the compiler saying
so rather than a rule: the key's cause field carries the diagnostic code, and
all 57 are compiler codes (`slot_element_invalid_name` ×13,
`dollar_prefix_invalid` ×7, `state_invalid_placement` ×4, `legacy_export_invalid`
×4, `animation_invalid_placement` ×4, `parse-error` ×5, and 15 more codes accounting for
20 between them), never a `svelte/…` rule id. Many are inherent to the rule being
exercised — `no-dynamic-slot-name`'s whole subject is a construct Svelte 5
rejects outright.

**Cross-checked against the official compiler, not assumed.** Compiling all 57
with `submodules/svelte`'s own `compile`/`compileModule`: **all 57 are rejected by
the official compiler too**, so the two tools disagree only about whether a linter
should report a compile error — a product decision, and rsvelte's is the more
useful one for a Svelte-specific linter.

**That cross-check is now a test, not a measurement.**
`scripts/dev/test-lint-severity-exit-attribution.mjs` re-runs it in CI over whatever
this list currently holds, with two valid patterns as an accepting control so a
harness that rejected everything could not pass. The bucket is recorded as a
deliberate divergence in
[`deliberate-divergences.md`](#deliberate-divergences);
these 57 are an accepted difference rather than a burndown target. Four entries that
were rsvelte over-rejections hid in this same bucket until #3172, which is exactly
what the check exists to catch: if a listed pattern ever compiles, it goes red and
names the file.

This bucket held **59** entries until #3172 fixed issues #3127 and #3128. The four
that left were rsvelte over-rejections rather than a product decision — a
`$`-prefixed class member NAME read as a store reference, and legacy mode
(`runes: false`, or `<svelte:options runes={false} />`) not turning a rune-named
`$` reference into a store subscription. The remaining 56 are the ones official
rejects too, which is what the re-measured cross-check above now reports as
57 of 57 with the entry below.

The 56th is `prefer-const/22-decorated-class-method.svelte`, whose decorated class the
official compiler rejects with `typescript_invalid_feature` at the same point rsvelte
does. It was invisible until the `lint-adversarial-end` step above it stopped failing:
the job's shell is `bash -e`, so a red step hides every comparison below it.

The 57th is `prefer-const/23-redeclared-let.svelte`, and it is worth its own note
because the shape is not optional. rsvelte's `prefer-const` used to report a `let`
declared twice in one scope; ESLint merges a redeclaration into one variable with two
write references and bails. Reproducing that needs an actual redeclaration, and a
redeclared `let` is an early error in every JavaScript — so the pattern that pins the
fix cannot also be a program the compiler accepts. Official rejects it too.

### `exit` 1→0 — **closed, 0 entries**

`no-goto-without-base/{17-non-call-references,23-alias-chains}` were the last two.
Upstream resolves `goto` through `ReferenceTracker.iterateEsmReferences`, which
follows a copied binding (`const one = goto; const two = one; two('/x')`) and a
copied namespace (`const nsCopy = nav; nsCopy.goto('/x')`); rsvelte's local
`call_kind` matched the imported identifier and a `* as ns` member directly and
stopped there. The rule now resolves its callee through `kit_nav::nav_call_kind`,
the scope index the sibling `no-goto-without-base` already used, and `call_kind`
is deleted.

**This bucket held four entries and the reason was not one cause.** It was read as
"the rule needs the TypeScript checker, and the type-aware path lives in the
out-of-workspace `rsvelte_lint_types` crate" — which the rule's `EXCLUDE` entry in
`scripts/compat-corpus/lint-universe.mjs` makes plausible, and which was wrong for
half of them. Measured instead of assumed, with the rule's own binary:

| input | in a `.svelte` | in a `.svelte.(js\|ts)` |
|---|---|---|
| `export function bad() { return goto('/module-bad'); }` | reported | **silent** |

`no-navigation-without-resolve` was a `check_root` rule only, so a
`.svelte.(js|ts)` — which reaches `run_script_rules_module`, a separate entry
point — never ran it, while its sibling had implemented both halves since it
shipped. `crates/rsvelte_lint/tests/navigation_resolve_module_surface.rs` pins
both halves: the module surface reports, a component still reports once, a
resolved URL is the accepting control, and the two sibling hooks are asserted to
run on the same file set — with the note that the sibling is a port-vs-port
oracle and the absolute answers are pinned separately.

#### DoD-4 attribution

Attribution of `lint-severity-known-failures.json`:

| n | target | cluster |
|---|---|---|
| 57 | [`deliberate-divergences`](#deliberate-divergences) | `exit\|…\|0->1\|<code>` — `rsvelte-lint` exits 1 on a source the compiler rejects, ESLint exits 0 |
| 1 | [`upstream_issues/eslint-plugin-svelte-no-navigation-without-resolve-empty-rel-crash.md`](../upstream_issues/eslint-plugin-svelte-no-navigation-without-resolve-empty-rel-crash.md) | `oracle-crash` — the rule throws on `<a href="…" rel>` |

The 57 are one product decision, not 57: every one is a file the official compiler
rejects, verified 57 of 57 by the pin the deliberate-divergences entry names, with
accepting controls. Splitting them per compiler code would multiply one decision by
its inputs — the rows here are causes, and the `code` histogram that belongs to this
table is above, not in it.

### `oracle-crash`, 1 entry — `no-target-blank/02-rel-dynamic.svelte`

`svelte/no-navigation-without-resolve` **throws** (`Cannot read properties of
undefined (reading 'type')`) on `<a href="…" rel>` and on `<a href="…" rel="">`
— an `<a>` with a valued `href` and a `rel` that has no value. ESLint reports the
throw as a fatal message, so the file yields no findings at all and the run exits
1. Minimal repro, in a tree whose `package.json` declares `@sveltejs/kit` (the
rule is SvelteKit-gated, so it does not run without it):

```svelte
<a href="/x" rel>y</a>
```

Reported upstream in
[`upstream_issues/eslint-plugin-svelte-no-navigation-without-resolve-empty-rel-crash.md`](../upstream_issues/eslint-plugin-svelte-no-navigation-without-resolve-empty-rel-crash.md).

The crash is only reachable because this gate runs upstream's **default preset**:
every other lint gate enables an explicit rule universe that excludes this rule,
so the rule never runs and never throws. A file whose report the oracle destroys
has no findings and no meaningful exit code to compare, so the pattern is scored
as this one key and skipped for the other three classes — never as a hard error,
because the crash is a property of the oracle configuration the gate exists to
exercise.

### Inline configuration: measured equal, and guarded

The patterns carry `/* eslint <rule>: [...] */` comments, and 26 of the shared
rules are `off` in **both** presets — so a finding on one of them can only have
come from the file's own inline comment. Both sides honour it identically:
`svelte/button-has-type` 13 findings each, `svelte/prefer-class-directive` 6 each,
`svelte/no-trailing-spaces` 9 each, `svelte/sort-attributes` 7 upstream / 6 here
(the one difference is the `order`-option entry already listed in
`lint-adversarial-known-failures.json`, not a failure to enable). None of these
rules is in the comparison population, so the gate asserts the population exists
instead: it fails if no pattern reports a rule both presets leave off, which
would mean the axis had silently stopped being exercised.

<a id="lsp-known-failures"></a>

## LSP differential known failures

`lsp-known-failures.json` contains 23742 entries. Fixture and upstream entries identify one normalized
structural field for which `rsvelte-language-server` differs from the pinned official
`svelte-language-server`, or from an upstream expected snapshot. A mismatched scalar key includes
both value digests; a missing/extra field includes the present-side digest. Unmatched semantic
array items are represented by their count and multiset digest.

### Why this ratchet's attribution is partial

The DoD gate allows three end states per entry: gone, a filed `upstream_issues/` report, or
`deliberate-divergences` pinned by a test. **Every entry outside the table below has a target of
neither the second nor the third kind**, and that is a property of the population rather than an
unwritten column. The exceptions are the `initialize` capability cluster, attributable only
because a capability's value can be recovered from each side's source and checked against the
ratchet's digest. No count is written into this paragraph on purpose: the ratchet's size is
declared once above, where `known-failures-md-check` compares it to the JSON, and a subtraction
of it here would be the one number in the section that nothing gates.

* Outside that cluster, every entry is a field or aggregate on which `rsvelte-language-server`
  answers differently from the pinned official `svelte-language-server`. The oracle is the
  official server, so a divergence is rsvelte's side unless someone reproduces the value and
  shows otherwise — which is what the one `upstream_issues/` row below did.
* Outside that cluster, this section references `upstream_issues/` **zero** times and no entry
  names one.
* The standing decision on this ratchet is that it is not finished until it reaches **0**. For
  the unattributed remainder that is a statement that the terminal state is elimination, so
  there is nothing to attribute.

Writing a target for the rest would mean inventing one for every entry the table does not cover.
The ratchet stays on the pending list until it is burned down.

**No cluster breakdown is offered for the remainder, deliberately.** For entries all headed for
deletion, a cluster table buys no attribution and would cost a classification pass over every
remaining key; shrinking the ratchet advances the DoD directly and a taxonomy of it does not.

Partition of `lsp-known-failures.json` by key kind: `21630 + 1772 + 340` — real-world corpus
aggregates, per-field divergences against the pinned official server, and per-field divergences
against an upstream expected snapshot. The three prefixes (`aggregate:corpus/`, `differential:`,
`expected:`) are disjoint by construction in `merge-current.mjs`, which rejects an artifact
carrying a key outside its suite's prefix.

Partition of `lsp-known-failures.json` by request phase: `11876 + 11866`

Opened-document keys and post-`didChange` keys. The edit phase re-runs the same request set, so the
two addends differ by exactly the session-level keys, which run once per session rather than once per
unit: the difference is 10, and those 10 are precisely the `differential:fixtures/capabilities|
initialize|` keys below. There were 17 when the phase landed; six were `initialize` fields #3016
closed and one more has since.

The one-sided sets are now exactly that difference: measured on this baseline, **10 keys appear only
in the opened phase and 0 only in the edit phase**, and the 10 are the `initialize` keys named above.
An earlier baseline read 17 and 7, and the extra 7 on each side were the same seven corpus files'
`textDocument/hover` aggregates enrolling under two keys because `divergentRequestCount` differed
between the phases. `aggregateCorpusDifferences` no longer puts that count in the key, so a corpus
file's method is one unit per phase and the partition is exactly explainable. Progress here is still
better read as divergent fields and requests than as a change in entry count, but the entry count is
no longer moved by a divergence merely getting smaller.

Partition of `lsp-known-failures.json` entries under `aggregate:corpus/` by repository: `3662 + 7672 + 258 + 10038`

bits-ui, flowbite-svelte, melt-ui, shadcn-svelte, in that order. This is the count
that moves when a corpus submodule is bumped, and it is the reason the population floor is
committed separately: a repository dropping out shrinks its cluster to zero and would otherwise
read as a clean burndown.

Ten entries sit under `differential:fixtures/capabilities|initialize|`, and they are the one cluster
whose justification is per key rather than per class, because a declared capability is a promise a
client acts on. The rest of that cluster was closed by #3016 rather than justified. The ten reach
four different terminal states, and the split that matters is between a capability this server
*chooses* to declare differently and one it has *not built* — recording the second as deliberate
would pin "unimplemented" in place, which is the `completions.emmet` failure gate 42 records.

**Five are deliberate and pinned** in [`deliberate-divergences`](GATES.md#deliberate-divergences):
`completionProvider.triggerCharacters` declaring `" "` (upstream deliberately does not, and this
server answers attribute completions there), the two `source.fixAll` code-action kinds,
`workspace.workspaceFolders`, `positionEncoding`, and `diagnosticProvider.identifier`. Each names a
behaviour that exists and a test that exercises it.

**Two are unimplemented, and stay listed as such** — not deliberate, and not pinned. No
`codeAction/resolve` handler exists, so `codeActionProvider.resolveProvider` is absent; and ten of
upstream's eleven `executeCommandProvider` commands are tsgo refactors this server does not offer
plus the Svelte-4 migrator, which is out of scope. The honest terminal states are the handler and
the commands, or an explicit decision that they are out of scope; until one of them these two are
open work, and a test pinning today's answer would assert the absence.

**One is upstream**: `upstream_issues/svelte-language-server-duplicate-completion-trigger-character.md`
— upstream's array lists `"@"` twice, which is a multiset a deduplicated list cannot match.

**Two are a property of this gate's client, not of the server.** The semantic-token legend stays
narrowed to the token names the editor advertised, because tsgo narrows its own legend the same way
and its token data indexes the narrowed one; declaring upstream's legend here would misname every
index past a dropped entry. This gate's `initialize` sends no `textDocument.semanticTokens` at all,
so the filter keeps nothing and the whole of upstream's legend reads as missing — confirmed without
re-running either server, because the ratchet carries no `extra-rsvelte` for either pointer and the
recorded `missing-rsvelte` digests are reproduced exactly by an *empty* rsvelte legend
(`scripts/compat-lsp/capability-hashes.test.mjs`). `crates/rsvelte_language_server/tests/protocol.rs`
drives the other client shape and gets a correctly filtered legend back. The terminal state is the
gate carrying both client shapes, not a change to the filter; that is tracked as a gate-coverage
item rather than attributed here.

Attribution of `lsp-known-failures.json`:

| n | target | cluster |
|---|---|---|
| 5 | `deliberate-divergences` | `initialize` capabilities rsvelte declares differently on purpose, each pinned by a test: the `" "` completion trigger, the two `source.fixAll` code-action kinds, `workspace.workspaceFolders`, `positionEncoding`, `diagnosticProvider.identifier` |
| 1 | `upstream_issues/svelte-language-server-duplicate-completion-trigger-character.md` | upstream lists `"@"` twice in `completionProvider.triggerCharacters`, so the arrays differ as multisets |

This table is **partial**, and its coverage is the sum of its own `n` column against the entry count declared above -- `attribution-check` prints the two side by side, so neither is repeated here. The remaining entries are unattributed, not
attributed to nothing — the `aggregate:` half carries no field in its key, so what an entry is
cannot be read from the ratchet at all, and every row above had to be recovered by reproducing a
digest. A partial table is the honest intermediate state for a ratchet this size; the alternative
is that nothing may be recorded until everything can be, which would keep the first cluster
unattributed because the last one is.

Those digests are how the first four states were separated at all. The ratchet stores a digest and
never the values, so a recorded divergence cannot be read back — but reproducing the digest from
each side's declared values identifies the preimage, which running the two servers does not, since a
run reports only *that* two arrays differ. Six of the cluster's recorded hashes are reproduced from
source in `scripts/compat-lsp/capability-hashes.test.mjs`, which needs no build, no servers and no
corpus.

The real-world corpus uses one compact entry per `(file, method)`, and its key records the divergent
request count and nothing else. It carried a raw divergent-field count and a digest over every
sorted `(position, value-aware diff pointers)` observation until two full sweeps of one revision
were compared: **664 of that revision's 16,348 keys moved between them** — 661 on the digest alone, 3 on the field
count — while the request count agreed on every one, and `textDocument/completion` owned 661 of the
664 against zero for `textDocument/definition`. A key that does not reproduce cannot ratchet, so
the two irreproducible components are out. Both sweeps reproduce the committed baseline exactly.

What that costs is stated rather than implied: within a `(file, method)` whose divergent-request
count does not move, another wrong field in a known response, a different diverging position, and a
fix/regression swap are all invisible here. Count growth and shrinkage still change the key
directly, and the fixture and upstream suites keep per-field keys, so the loss is confined to the
corpus aggregate.

Every unit is compared twice. The harness sends `didOpen`, runs the request set, then applies a
deterministic `didChange` script derived from the source and runs the **same** request set again.
The script inserts an `import` at the end of the first `<script>`, a rule at the end of the first
`<style>`, and an unclosed `{#if}` at EOF, then removes all three in reverse — every change an
incremental range on both legs, because a full-document undo would restore a server whose
incremental apply is broken. The final text is asserted byte-identical to the opened text, so the
second phase asks each server whether it returns to the answer it gave from scratch, at the same
positions, and a divergence there is a state-transition difference alone. Keys from the second phase
carry `|phase=edit`; the opened phase carries no segment, so its keys are the ones this ratchet has
always held and a baseline diff shows the edit phase as pure addition. The phase has to be in the
key: without it an opened-phase entry would suppress a post-edit divergence in the same
`(unit, method)`, which is the #2521 failure mode.

The ratchet is shrink-only and two-sided: a new entry and an entry that no longer reproduces both
fail verification. Baseline updates require one fixture/upstream artifact and sixteen
stable-hash corpus artifacts with `--write-current`; `merge-current.mjs` accepts only the complete,
disjoint union at one project, language-tools, corpus-source, and comparison-configuration revision.
It checks the union's file-universe hash and the committed per-repository file/identifier/request
population before `--update-baseline` may write. Missing, duplicate, subset, and mixed-revision
artifacts are rejected as false shrink. A normal merge compares the complete union with the
committed ratchet.

Fixture and pinned-upstream runs are trusted so their committed project configuration is observable.
Real-world corpus runs are deliberately untrusted: the gate must not execute arbitrary configuration
from collected repositories, and its result must not depend on installing four applications' package
graphs. Both servers receive the same trust bit; preprocess/config execution has dedicated fixtures.
After the project-ready positive control, corpus requests have a `--request-timeout-ms` deadline
(180 s). A timeout is cancelled and compared as a stable transport-error response, which means the
deadline is part of the measurement rather than a safety net around it: at the original two seconds
one shard measured 2,304 timeouts and then 1,645, moving 201 of its 1,380 entries — including 53
divergent-request counts. At 60 s the whole 1.9-million-request sweep had 12. Any timeout therefore
fails the run after the artifact is written, so a load-dependent key cannot be baselined; raise the
deadline instead.

`configurationId` in `scripts/compat-lsp/artifacts.mjs` is the artifact schema for the comparison
contract. Any change to request construction, normalization, semantic array identity, or diff-key
encoding must bump it so artifacts produced by different contracts cannot be merged.

Every run must happen in an **installed** workspace. The shadow's TypeScript program reaches the
repository root for ambient `@types`, so an uninstalled tree measures a smaller global scope: the
fixture suite yields 4380 keys without root `node_modules` and 4397 with it, and the completion-item
counts embedded in those keys move with it. This is not a preference — the two jobs that run this
comparison (`Language server` in `ci.yml` and `LSP fixture parity current` in `corpus-compat.yml`)
provisioned the tree differently at first, and only one of them could ever have satisfied the
resulting baseline. `verify.mjs` now refuses to run without it.

The population floor is `scripts/compat-lsp/corpus-population.json`. An intentional corpus
submodule bump must use an unsharded, all-suite, all-repository `--update-population` run; ordinary
population loss is an error. Shard-local reports retain their exact measured population and the
merge requires their sums to equal that manifest. It counts the **input** universe — files,
identifiers, and identifiers × 3 methods — not the compared request count, which is twice that
because every unit is requested in both phases; `report.json`'s `compared` is what carries the
latter.

### Measured causes

The entries have never been partitioned by cause, and the two facts that partition
matters most are these. First, **the `aggregate:corpus/` half is not 21,630 defects**: it is
3,632 distinct files × 3 methods × 2 phases, i.e. essentially *every* corpus file on
`textDocument/{completion,definition,hover}`. Read a shrink there as a systemic fix, and a
count as a population size.

Second, the first cause traced end to end came out of one fixture rather than out of the count.
`upstream-features/const-tag/input.svelte` diverged on four `textDocument/diagnostic` items, and
diffing the two servers' raw responses separated three mechanisms in one file:

| what differed | cause |
|---|---|
| `tags` absent on every rsvelte diagnostic | tsgo's LSP omits it; #4067 derives it from the code |
| `'result' …` at `28:15-28:15` against official's `28:21-28:27` | the `{:then}` / `{:catch}` binding had **no map segment**: upstream pushes `[value.start, end]` as a source range and rsvelte interpolated its text into the surrounding overwrite, so the identifier lived in an edited chunk and every position on it collapsed to that chunk's start |
| two extra `svelte/require-each-key` items, `source: "rsvelte"` | this server answers with its own lint findings, which the official server has no counterpart for |

The middle row is the one worth generalising: **the emitted TSX is byte-identical either way**, so
the svelte2tsx text gate cannot see it, the svelte2tsx *map* gate asserts well-formedness rather
than equality, and this ratchet is the only gate in the repository that compares the resulting
positions. `crates/rsvelte_projection/tests/svelte2tsx_await_binding_map.rs` pins all five
`{#await}` shapes; ablating the range predicate reddens every one.

The third row is not a defect on either side and is the first candidate for
`deliberate-divergences` in this ratchet — but only once it is pinned by a test, which it is not
yet.

### Two `code-action-foreign` entries retired because the request changed, not the server

`suites.mjs` built every `textDocument/codeAction` request's diagnostic with `source: "svelte"`
hardcoded, while the manifest entry it was built from declares `diagnostic_source: "eslint"` —
so the fixture transcribing upstream's `it('if no svelte diagnostic')` had never sent a foreign
source, and neither server was answering the question the case is named for. Reading the field
retires both of its entries.

This is a **(c) retirement — the input changed** — and not a fix: nothing in
`rsvelte-language-server` moved. Measured on two arms differing only in `suites.mjs` (same server
binaries, distinct file hashes, a probe separating them in both directions), the fixtures suite
goes from 226 divergent fields to 224 with `cases`, `compared`, `skipped` and all three
oracle-calibration ratios identical, 2 stale entries and **0 new**.

**The axis those entries were observing is not preserved, and cannot be here.** With the source
corrected both servers decline for the stated reason, so what the pair had actually been
measuring — whether an ignore action is offered on an **empty document**, the case's `source`
being `""` — no longer has a carrier. A fixture that preserves it cannot be added: `fixtureCases`
draws only from `manifest.behavior_cases`, whose names are asserted equal as a multiset to
upstream's `it()` call sites, with no unported call site to attach one to. #4217 tracks giving
that axis somewhere to live; it is deliberately not fixed here, because a second case list
changes this gate's population and needs its own control.

The same object's `severity` was unread too (12 of 14 codeAction entries declare it; the string
occurred nowhere under `scripts/compat-lsp/`). It is read now and moves nothing, because the
upstream case that names the condition sends no `code` and is answered before severity is
reached — see `GATES.md` blind spot 27t, which is why reading it does not make the guard gated.

### The mechanism of a divergence is carried beside the ratchet, not in its key

`compatibility/lsp-mechanisms.json` holds two maps: `entries` takes a ratchet id to the **set** of
mechanisms measured on it, and `mechanisms` takes a label to where it is answered — an
`upstream_issues/` path that exists on disk, the literal `deliberate-divergences`, or `null` for a
terminal not yet established. `scripts/compat-lsp/mechanism.mjs` is the classifier and the
vocabulary; `scripts/ci/lsp-mechanisms-check.mjs` checks the two files against each other and
against the ratchet, and `scripts/dev/test-lsp-mechanisms-check.mjs` is its positive control —
including the case that a well-formed sidecar **passes**, which a suite of red-only cases never
measures.

**Why a set, and why beside rather than inside.** An `aggregate:` entry is a
`(file, method, phase)`, and every mechanism that fires anywhere in that one response is a
separate label on the same entry. Measured on 931 records of one corpus shard (bits-ui, shard 8
of 16, 52 components, 151 `(file, method)` groups): **6.17 distinct labels per entry on average**,
median 5, max 22, and **88.7% of entries carry more than one** — `textDocument/completion` alone
averages 11.13. Putting a label in the ratchet key would therefore multiply one entry into its
six, which is the same "one identifier, one key, a six-figure file" judgement the corpus half is
aggregated to avoid. Picking *one* label per entry would need a precedence rule, and a rule
choosing among six co-occurring labels encodes its author's ordering — the hazard AGENTS.md
records for a classifier that stops at its first matching predicate.

**What the set costs to read.** For each label, the entries on which it is the *only* label — the
ones that would actually leave the ratchet if that mechanism were fixed — are almost all zero:

| label | entries it appears on | entries where it is the only label |
|---|---|---|
| `completion-item-set-extra-html` | 42 | **0** |
| `completion-item-pairing-key-kind+sort-text-ts` | 42 | **0** |
| `completion-item-set-missing-ts` | 42 | **0** |
| `completion-item-set-missing-mixed` | 42 | **0** |
| `completion-item-set-missing-html` | 41 | **0** |
| `completion-commit-characters-value-extra-paren` | 37 | **0** |
| `rsvelte-empty` | 31 | **0** |
| `ts-render` | 30 | **0** |
| `projection-target-position-declaration` | 30 | 3 |
| `projection-origin-range` | 27 | 5 |

Nine of the shard's 62 labels are ever the sole label of an entry, together covering **17 of 151
(11.3%)**; the eleven largest are all zero. Repairing `completion-item-set-extra-html` on every
file it names removes **no entry**, because each of those files still diverges on five other
mechanisms in the same response. **A per-label count sizes an investigation and never a shrink**,
and the two differ here by a factor of zero for the largest labels.

The sets are structure rather than noise, which was predicted before it was measured: an empty
answer cannot have an item-level difference, and of the 66 groups carrying `rsvelte-empty` or
`rsvelte-empty-import-only`, **0** also carry an item-level label.

**Two absences are spelled rather than left blank.** `classifyDivergence` runs on the corpus
branch only — its context is that branch's source text — so every `differential:` and `expected:`
entry carries the explicit label `unclassified`. And a label whose terminal has not been
established carries `null`, which is **not** `rsvelte`: an unestablished terminal and a defect of
ours are different facts, and writing one as the other puts a sign on an unmeasured quantity.
Either one blocks its entry from an attribution table, and the checker reports how many entries
are blocked rather than folding them into a pass — a blank and a zero render the same.

The scope of that table is 151 entries from one of sixteen corpus shards. It is now also measured
ratchet-wide, from the complete 17-artifact set of the `2026-09-02T20:48Z` `lsp-corpus` run. At
`46f07b412`, that run's `projectRevision` carried the same `lsp-known-failures.json`,
`mechanism.mjs` and `merge-current.mjs` blobs as `main`, so the id set could not have moved and
re-baselining shrank nothing: the control run reported `23746 current, 0 new, 0 stale` and the
ratchet came back byte-identical. #4221 then retired four entries, and the four were dropped from
the sidecar by set difference against the rebased ratchet — which is why the figures below are
23,742 rather than the 23,746 that control quotes.

All **23,742** entries carry a set, at a mean of **7.36** labels each — 1 to 28, with 3,606 entries
(15.2%) carrying exactly one. The structural claim survives the change of population and the
magnitudes do not:

| label | appears on | sole label on |
|---|---|---|
| `rsvelte-empty` | 10602 | 148 |
| `completion-item-set-extra-ts` | 7262 | **0** |
| `completion-text-edit-range-end` | 7262 | **0** |
| `completion-command-presence-rsvelte-only` | 7260 | **0** |
| `completion-item-set-missing-mixed` | 7212 | **0** |
| `completion-item-set-extra-html` | 7024 | **0** |
| `completion-item-set-missing-ts` | 7018 | **0** |
| `rsvelte-empty-import-only` | 6720 | 982 |
| `official-empty` | 6682 | 4 |

**10 of the 72 labels are ever the sole label of an entry** (the shard read 9 of 62), and the
largest completion labels are still zero — repairing any one of them removes no entry from the
ratchet.

**Two counts of "labels" answer different questions, and the smaller one is the work.** The sidecar
declares more labels than the artifacts use: **72** are carried by an entry, and because the merge
only ever adds a label, every other declared label is carried by zero entries and has nothing behind
it to establish a terminal for. Sizing the terminal work by the declared vocabulary counts a
vocabulary, not a population — `pnpm run check:lsp-mechanisms` prints the declared count, so it is
not restated here. Going the other way, a greedy union over the used labels touches every one of
those entries with **12** labels, and two of them (`rsvelte-empty`,
`completion-item-set-extra-ts`) already reach 75.2% — so neither the declared vocabulary nor 72 is
the number of decisions that would move the ratchet either.

`unclassified` is 2,120 entries and is the sole label on 2,116 of them, which is the `differential:`
and `expected:` half spelled out rather than left blank: the classifier runs on the corpus branch
only. Those are the entries a terminal cannot be established for without a second classifier, not
entries awaiting a judgement.

Normalization removes only these non-parity fields and path-specific values:

- `initialize.result.serverInfo`
- `textDocument/diagnostic.resultId`
- the absolute workspace URI, replaced with `<workspaceUri>`
- the prefix through `/node_modules/`, replaced with `<node_modules>`

Object keys are sorted for stable serialization. Diagnostics, completion items, locations,
folding ranges, and inlay hints are matched by method-specific semantic identities before their
fields are diffed, so an ordering change does not renumber unrelated entries. Other arrays are
compared as multisets of exact values. All remaining response fields retain their original values.

<a id="matrix-known-failures"></a>

## Generated shape matrix — known failures

Ratchet for `scripts/compat-corpus/matrix/run.mjs` (#2281 Gate 2). Shrink-only and
two-sided: a new divergence fails CI, and so does a listed entry that already passes, so
the PR that fixes entries re-baselines in the same PR
(`node scripts/compat-corpus/matrix/run.mjs --update-baseline`).

### Why this gate exists

The collected corpus samples the **marginal** distribution of published Svelte code. Every
bug in the #2253/#2254/#2255/#2256 batch was an **interaction** — a binding kind × a
syntactic position, or a construct × a comment slot — and a found corpus under-samples
interactions exponentially:

| shape | occurrences in the 14,026-entry corpus |
|---|---|
| #2254 — `{#each … as X}` item as a `switch` discriminant | 0 |
| #2253 — `#private` `$state` assigned from a literal containing a `//` comment | 0 |
| #2256 — `svelte-ignore` before an object-literal property | 6 |

`client` and `server` were at **0 known failures** — saturated — when all four were
reported. Growing the corpus from 14k to 140k real files moves those counts from 0 to
approximately 0. Generating the product moves them to whatever the product contains.

### Scope of what a listed entry means

Normalization here is identical to `verify.mjs` (flatten template holes → oxfmt → strip
blank lines), so formatting-only differences are tolerated exactly as the corpus gate
tolerates them. An entry is a divergence that survives that.

The **verdict is part of the key**, and these can appear: `js-mismatch` (the
difference survives comment + whitespace normalization), `comment-mismatch` (it does not),
`output-unparseable` (acorn rejects what rsvelte emitted, whatever the bytes say),
`warning-missing:<code>` / `warning-extra:<code>`, `over-accept` (rsvelte compiles a
program official rejects) and `over-reject` (the reverse), and
`error-code-mismatch:<official>-vs-<rsvelte>` (both reject, with different codes).
None of them is more tolerated than another — every one is ratcheted two-sided. The
split exists because a listed entry suppresses everything its key cannot tell apart: under
one flat `js-mismatch`, an id whose comments already diverge absorbs a later code
regression on that id for free. That is not hypothetical — when the split was added, every
comment carrier in `opaque-keyword` diverged on comment placement (#2990), so re-breaking
#2986 would have reproduced an already-listed key on the very cases written to catch it.
Those entries are gone now, which is what the split was for: the family clears rather than
carrying a key that would absorb the next regression.

### Matrix known failures (`matrix-known-failures.json`, 0 entries)

Partition of `matrix-known-failures.json` by family: `0`

#### `binding-position` — 0 entries

The upstream fix landed. `submodules/svelte/.../3-transform/server/visitors/LabeledStatement.js`
used to return early for a non-`$` label **without calling `context.next()`**, so zimmerframe
never descended into the labeled subtree and, since `$.derived()` returns a function in
`svelte/internal/server`, upstream emitted `if (doubled)` — always truthy — where every
other position emitted `doubled()`. Store auto-subscriptions inside a labeled body were
mis-emitted the same way. Svelte 5.56.10 adds the `context.next()` call at that guard, which
is what these four entries (`derived-local` and `store-auto-sub`, `label.body`, on `server`
and `server-dev`) were waiting for, so the submodule bump cleared them.

The rest of the family (7 bindings × 47 positions × 3 targets, minus these) passes. It is
the axis that found #2254 plus `SwitchCase.test`, class-expression field initializers and
class-expression computed method keys, all fixed in #2269.

#### `comment-slot` — 0 entries

Partition of `matrix-known-failures.json` entries under `comment-slot/` by what diverges: `0`

Partition of `matrix-known-failures.json` entries under `comment-slot/` by seed: `0`

The final 20 `legacy-reactive` entries had two causes on `client` and `client-dev`.
Leading `svelte-ignore` comments remained in the ordinary script output even though upstream's
rebuilt `legacy_pre_effect` has no surviving node for them. Script-tail comments took the
opposite path: a located block nested in the final reactive body revives esrap's comment cursor,
so the first located template node prints them. The client transform now removes the former only
when it collects the reactive statement and preserves the latter whenever the body contains a
nested source-located block.

The `.svelte.(js|ts)` module-path cluster is also empty: location-less Programs discard their
top-level and EOF comments while located nested bodies can still resynchronize the cursor,
matching esrap. A comment is the one token that may appear between any two other tokens, so the
matrix continues to cross eight comment kinds with every line boundary instead of relying on
published-code frequency.

The 24 `server-dev` tail-comment entries for `class-private-state`, `class-static-block`, and
`const-fold-line-continuation` were the nested component-callback close-position defect fixed by
#3877. That change made the comment collector search at the generated callback's actual nesting
depth; the pre-#3877 matrix artifact therefore left stale ratchet entries after the implementation
was corrected.

The location-less cursor port clears 144 entries without adding a failure: all 96 trailing
module-path rows (`module-class-state`, `module-rune-exports`, and
`module-ts-extension`, eight kinds × four targets each), plus 48 leading `<script module>`
rows on `server` and `server-dev`. The latter needed the generated component body to inherit
the instance-script region while the outer Program remained location-less.

`module-script`'s 24 were unchanged in cause by #3005, and their slots moved
(`L07`/`L11` → `L18`/`L22`) because the seed grew the bodies that make the cursor observable:
a rune class, a static block and a bare block, each followed by a slot outside the body it
revived from. Those new slots all passed; the remaining `L18` slot was a cross-chunk cursor
effect: upstream leaves the module's standalone EOF comment pending until it opens the generated
component body, after its parameters have printed. rsvelte now carries that comment explicitly
from the isolated module transform to the component function's final parameter, including the
line-comment layout and generated source-map adjustment, so the seed is empty. `server-dev`
continues to drop the comment, as upstream does.

`await-block`'s 16 entries were the same cursor rule on the client side. The inserted
comment was at the instance-script tail, not inside the await header: upstream's first located
template node is the promise expression, so the pending comment belongs in that expression's
generated thunk parameters. The await call now always marks its promise argument as the comment
owner; the marker is output-neutral when no comment is pending and prevents the comment from
drifting into the following pending callback.

#### `each-collection` — 0 entries

Every collection shape now matches across all targets.

Partition of `matrix-known-failures.json` entries under `each-collection/` by collection: `0`

#### `keyword-regex` — 0 entries

These 24 rows were the six `extends` cases × four targets. #2772 fixed their shared cause:
the class-declaration visitor now treats a legacy `$:` body as nested scope and emits
`perf_avoid_nested_class`. The entries remained in the ratchet after that fix and are now
removed, restoring two-sided coverage for those ids.

Partition of `matrix-known-failures.json` entries under `keyword-regex/` by target: `0`

Worth stating because it is the generalization argument for the comparison: a family written for
a *parser* question, by another author, with no warning intent, originally exposed this warning
class. The comparison earns its place on populations nobody built for it.

#### `param-pattern` — 0 entries

Parameter defaults and computed keys now contribute their enclosing reactive dependencies.

Partition of `matrix-known-failures.json` entries under `param-pattern/` by shape: `0`

#### `directive-element` — 0 entries

All 1,976 generated comparisons now match across every directive, special-element host, mode,
and target.

Partition of `matrix-known-failures.json` entries under `directive-element/` by verdict and host: `0`

#### `bind-setter` — 0 entries

All 189 generated comparisons now match. #2484's three special-element dev setter cases are
covered by the direct regression tests as well as this zero-residue matrix family.
#### `removed-statement-comment` — 0 entries

The family crosses statements the SERVER transform removes (`$effect`, `$effect.pre`,
`$effect.root`, `$inspect`) with the comment slot (leading / interior / trailing), 6 comment
kinds, 3 hosts (`compileModule`, the instance script's top level, one function deep) and
whether a statement survives after the removed one. 396 cases, 1188 comparisons; the fix that
landed with it cleared 79 of them (403 → 324, all on `server`).

Partition of `matrix-known-failures.json` entries under `removed-statement-comment/` by
cluster: `0`

The 24 `js-mismatch` entries were one lexical-context bug: non-dev `$inspect` removal read
the last byte of a leading line comment as JavaScript syntax and emitted `undefined` instead
of the statement-position `;;`. It now asks the shared code-byte scanner for the last
significant token, so braces, parentheses and arbitrary text inside comments cannot select
the lowering.

The 48 `server-dev` comment mismatches came from rebuilding `console.log('$inspect(', …,
')')` as interpolated source text. That discarded the original argument nodes' spans, so
comments belonging beside an argument became statement-leading or statement-trailing
comments. The lowering now clones the original argument AST into location-less generated
wrappers, matching upstream's builder shape and retaining the argument locations.

The final 14 `server` mismatches were one location-carrier bug. The two kept empty statements
that model upstream's removed `$inspect` residue preserved `;;`, but their sentinel spans were
excluded from comment-region placement. Their keep marker now remains in the span end while
the source-backed start is remapped and participates as a statement anchor, so leading and
trailing comments stay on the removed statement's side of the following markup or statement.

**[D].** It was reduced to a hand-written repro outside the family and measured against the
pinned official compiler.

---

#### `async-derived` — 0 entries

Partition of `matrix-known-failures.json` entries under `async-derived/` by cause: `0`

#### `async-attribute-slot` — 0 entries

10 value shapes × 6 attribute slots × 4 hosts = 200 cases / 792 comparisons. The subject is
which lowering an async attribute value reaches: `Memoizer` hoists a call or an `await` out
of the `template_effect` arrow into its `sync`/`async` argument and passes the
top-level-await `blockers` as the fourth, but
`build_custom_element_attribute_update_assignment` builds its own one-argument
`$.template_effect(b.thunk(call))` — so the same value is lowered two different ways
depending only on whether the tag name has a dash. Neither `directive-element` (which varies
the directive, not the value) nor `async-derived` (which varies the declaration, not where
it is read) crosses that pair.

The family reported **310** divergences on its first run. #3621's fix — the client `style`
attribute value, whose memoizer call hardcoded `has_await: false` in all three arms of
`build_style_attribute_value_with_memoization` — clears 28 of them (16 `output-unparseable`
+ 12 `js-mismatch`, both hosts × all four literal-`await` values × `client`/`client-dev`)
with zero regressions elsewhere in the matrix's 25,836 comparisons. #3649 then cleared the
38 client rows where a non-tail `await` was not pickled through `$.save`. #3764 routed server
attribute and directive values through the per-host promise optimiser; its object-expression
await scan also covers spread values and distinguishes a nested async-IIFE await. That clears
the remaining 230 server rows. #3650 cleared the final four client rows by giving
`<svelte:element>` its own memoizer and passing its parameters into the element-local
`template_effect`. The generated arrow now binds the `$0` used by a `class:` directive,
including the `derived-await-read` and `script-await-read` shapes.

Partition of `matrix-known-failures.json` entries under `async-attribute-slot/` by cause: `0`

**Four cases are narrowed to the server targets** (`custom-element` × `attribute` × a value
carrying a literal `await`). Under the pinned oracle that cell compiles — on *both*
compilers alike — to `await` inside a non-async arrow, which is not JavaScript, so there is
no client oracle to compare against; `run.mjs` aborts the run on an official output the
parse oracle rejects rather than turning it into an entry. This is the same
`targets:`-narrowing `private-field` uses and for the same stated reason. The server
lowering of those four is unaffected and still compared. Upstream fixed that slot in
5.56.10 by giving `build_custom_element_attribute_update_assignment` a `Memoizer`, and the
family is calibrated against it: compiled with `svelte@5.56.10` instead of the pin, **8
currently-matching rows move** — `custom-element/attribute` × `{call, async-iife,
derived-await-read, script-await-read}` × `{client, client-dev}`. Two of those four values
carry no `await` (`call` is the shape the `dynamic-attributes-casing` snapshot pins), which
is why the value axis carries sync rows at all. The submodule bump therefore cannot land
with that port missing: these rows report it. See
[#3621](https://github.com/baseballyama/rsvelte/issues/3621).

#### `constant-fold` — 0 entries

The final eight rows were not folding divergences but `{@render}` memoization divergences:
four pure call expressions × `client` / `client-dev`. The transform now consumes Phase 2's
`has_call` metadata, which already applies upstream's purity and dependency rules, instead
of a second syntax-only walk that treated every call as impure. Pure arguments remain inline;
impure and reactive calls retain their existing memoization.

#### `fold-value-type` — 0 entries

All 936 generated comparisons match on `client`, `client-dev` and `server`. The family exists
because `constant-fold` above **reached the folder on every run and measured nothing about
it**: its rows enumerate the `case` arms of upstream's `scope.evaluate` switch and every one is
single-typed, so #3027 — a folded value carried as `Option<Option<String>>`, in which `null` and
`undefined` are one value and `0` and `'0'` are one value — was invisible to it. Here the
expression shape is fixed and the operand's **type** varies: 8 values chosen to collide under
stringification while differing as JS values, × 11 binary operators, 5 unary operators, and 3
ternary hosts whose test is *unknown* (`constant-fold`'s `conditional-constant` has a known
test, so only branch selection runs there).

Partition of `matrix-known-failures.json` entries under `fold-value-type/` by operator class: `0`

#### `opaque-keyword` — 0 entries

The family generalizes #2986: a token the transforms scan for **raw**, carried inside a
region where it is text rather than code, crossed with the construct whose boundary a scan
has to find and with both compiler entry points. Its own motivating defect passes — the
class-header scan is lexical now — and so do the two it found on the way (#2987, #2988):
the module rune loops locate `$state(` / `$derived(` through `js_scan::find_code`, which
yields only occurrences outside every string, template, regex literal and comment.

Partition of `matrix-known-failures.json` entries under `opaque-keyword/` by cause: `0`

The last cluster it carried is worth recording, because it is the only one so far whose
cause was upstream and whose resolution was still ours (#2990). A comment between two
classes that both carry rune fields was dropped by official and kept by rsvelte — the
keyword content was irrelevant, all five keyword rows reproduced identically, and `server` /
`server-dev` matched throughout. `client/visitors/ClassBody.js` lowers a **public** rune
field into `b.method('get'…)` / `b.method('set'…)`, whose `BlockStatement` has no `loc`, and
esrap's `body()` answers an unlocated node by setting `comment_index = comments.length`, a
cursor only a *located* body moves back. The discriminating row was a **private** rune field
(`#x = $state(0)`): it rebuilds the class body just the same, emits no accessor, and the
later comment survives. rsvelte builds its accessors as source text, so its cursor never
died; `client/dead_comments.rs` now deletes what upstream loses. The upstream report stays in
[`upstream_issues/2990-svelte-class-accessor-drops-later-comments.md`](../upstream_issues/2990-svelte-class-accessor-drops-later-comments.md),
and these rows are what will report the day it lands in `submodules/svelte`.

#### `write-host` — 0 entries

The eight `member-update-self` rows this family shipped with are gone: `p.a++` on a
**bindable** prop (`prop-bindable` in runes mode, `legacy-let-prop` in legacy) written in a
`script-fn` or `script-arrow` host, on `client` and `client-dev`. Upstream wraps the update in
the prop setter so the parent is notified (`p(p().a++, true)`); rsvelte emitted a bare
`p().a++`, so a `bind:`-ing parent never saw the mutation. `prop_member_mutate_ast` handled
`AssignmentExpression` only, and the runes instance path in `ast_state_transform.rs` had a
prop-member branch in `visit_assignment_expression` with no counterpart in
`visit_update_expression`. Fixed by #3048; the family's own PR and the fix's PR landed
separately, which is why this section names the merge-order rule at the top of the file.

The whole family (5 bindings × 6 hosts × 11 write shapes × 4 targets) now passes. It is the axis that would have caught #3026: `binding-position` varies binding kind
but bakes one host into each binding's `wrap`, so binding × host has no cell there.

#### `class-modifier` — 0 entries

The family (33 members × 7 hosts × 4 targets) is what #3100 and #3203 needed: its subject is
what a **plain** `<script>` may contain, and upstream answers that with a different *parser*
(stock acorn) rather than with a flag, while rsvelte answers it by switching OXC's
`SourceType`. Every TypeScript-only class modifier, and the stage-3 `accessor`, therefore
compiled here and was a `js_parse_error` there — an over-acceptance, which no collected corpus
can hold because published code compiles. All of those rows pass now, on all three JS entry
points (instance script, `<script module>`, `compileModule`), and so do the two rules
acorn-typescript enforces in the parser that OXC leaves to a checker (`abstract` outside an
`abstract class`, `override` with no superclass).

The historical acorn-typescript/OXC modifier-table discrepancy is recorded in
[`upstream_issues/3203-acorn-typescript-accessor-modifier-table.md`](../upstream_issues/3203-acorn-typescript-accessor-modifier-table.md),
but the current generated family has no ratcheted divergence.

#### `rune-statement-container` — 0 entries

The family added for #3146 varies rune declarations across labels, switch cases, branches,
and loop bodies for component and `compileModule` entry points. Its first run exposed two
places that had reduced a scoped binding to a name: the client module state pipeline lost
`var` and emitted `$.get` instead of `$.safe_get`, while the nested SSR rune lowerer lost
`var` and emitted a required derived call instead of `value?.()`. The SSR path could also
wrap a call already produced by the script-level read visitor, yielding `value()?.()`.

Those decisions now retain the resolved declaration kind, and the nested SSR pass recognizes
an existing derived call before descending into its callee. All generated rows are expected
to pass, so this family adds no ratchet entries.

### Burn-down

Re-baseline in the same PR as the fix:

```
cargo build --release -p rsvelte_napi --lib
mkdir -p .corpus-cache && cp target/release/librsvelte_napi.{dylib,so} .corpus-cache/rsvelte.node.staging && mv .corpus-cache/rsvelte.node.staging .corpus-cache/rsvelte.node
node scripts/compat-corpus/matrix/run.mjs --update-baseline
```

`--update-baseline` refuses to run under `--no-fmt` (which counts formatting-only
differences the corpus tolerates) or under a `--families` subset (which would delete every
baseline entry the run did not measure).

<a id="mutation-known-failures"></a>

## Corpus-seeded mutation fuzz — known failures

Ratchet for `scripts/compat-corpus/mutate-corpus.mjs` (#2281 Gate 3). Shrink-only; two-sided
under `--full` (a sampled run cannot prove an entry is stale, so it checks regressions only).
Re-baseline with `pnpm run corpus:mutate:update`.

**Every current number below was measured under oxfmt 0.64.0.** The code/comment split is *defined* by
what the normalizer absorbs, so these verdicts are only comparable across runs on the same
version — which is why the gate prints the version it used. Re-deriving this baseline from
0.61.0 to 0.62.0 moved the gated bucket from 213 to 525; see "Sensitivity to the normalizer".
The bucket was burned down from 525 to **30**, and `unparseable` from 2 to **0**, on the
14,229-seed corpus. The wave-2 enrolment (#3176) took the seed set to 33,406 and the ratchet to
**168** — `code-mismatch` 160 and `unparseable` **8**. Subsequent fixes reduced that ratchet to
**165** — `code-mismatch` 159 and `unparseable` **6**. The enrolled entries were not regressions:
every one is a pre-existing defect in a repository the corpus did not previously hold,
and the 30 that predate the enrolment all still diverge.
The 2026-08-25 release sweep reduced it again to **122** — `code-mismatch` 116 and
`unparseable` **6** — by proving 43 listed entries stale; it found no new gated divergence.
The 2026-09-01 sweep took it to **0** on all four gated verdicts, proving all 122 stale; the
three defects behind them are below.

**Six of the entries that sweep cleared had arrived from shrinking a different ratchet, and that
coupling is worth stating once — it outlives them.** `eligible` here is `manifest ∖ (union of the four output ratchets)` — a seed that
diverges *unmutated* is excluded, because a mutant of it could not attribute anything. So when
the rebase onto `main` took the output ratchets from 759 ids to 601, **158 seeds entered this
gate's population for the first time**, and two of them (`huly`'s
`DocUpdateMessagePresenter` and `ProcessesExtension`) produced divergent mutants on 6
`(id, target)` pairs. A `NEW` divergence here can therefore be a newly *reachable* seed rather
than a regression, and the two are distinguished by asking whether the seed was in an output
ratchet before — not by reading the count. Same shape as `start`/`end` in
[`error-known-failures.md`](#error-known-failures), where fixing one comparison adds rows to
the other.

### Why this gate exists

When this gate was built the collected corpus was at **0 known failures on all three targets** —
saturated. That did not mean the compiler was correct; it meant that input distribution had
nothing left to teach. So the entries stop being the test set and become a **seed set**: insert
one semantics-preserving comment at a line boundary inside a `<script>` region and require
parity on the mutant.

The enrolment restated the same point one level up. It broke the saturation by *adding inputs*
(the collected ratchets went 0 to 1,977, and to 1,413 once re-measured against a newer `main`),
and this gate then found more defects **in those
same inputs** that the unmutated comparison scores as passing. Growing the population and
perturbing it are not substitutes.

Two live bugs came out of the first sweep, neither reachable from the unmutated corpus. Both
are now **fixed and closed**, and the sweep reproduces neither — `compiler-crash` and
`error-mismatch` are both at 0:

- **#2351** — a comment containing `}`, `)` or `;` inside a `$:` block body **aborted the client
  compiler with SIGSEGV**. Not an exception: the host process died.
- **#2347** — a `//` comment before the closing brace of a `$props()` pattern swallowed the
  `$.rest_props(...)` initializer. The output parsed, so nothing caught it; at runtime every
  forwarded attribute silently disappeared.

The gate keeps the child-process isolation and the `error-mismatch` verdict regardless: they
are what made those two findings attributable, not artefacts of them.

### What is gated, and what is only counted

A divergent mutant is classified by whether the difference survives normalizing comments,
whitespace and trailing commas away:

| verdict | in this ratchet | meaning |
|---|---|---|
| `code-mismatch` | yes | the generated **code** changed because a comment moved |
| `compiler-crash` | yes | rsvelte aborted the process on the mutant |
| `error-mismatch` | yes | exactly one compiler rejected the mutant |
| `unparseable` | yes | rsvelte emitted JavaScript that does not parse |
| `comment-mismatch` | **no** | the comment was dropped, duplicated or relocated, or a line broke differently |

The split is the difference between a gate and a backlog dump. The full sweep produces
many comment-only divergences (**15,351** on the current sweep) against **0** gated ones —
ratcheting per id without the split would mean a five-figure file that churns on every submodule
bump and buries the class that matters. That ratio is also why the empty ratchet must not be read
as "the mutation operator finds nothing": it finds 15,351 divergences and this gate is scored on
none of them. Comment fidelity is already ratcheted per id by Gate 2
(`matrix-known-failures.md`), on **generated** seeds that do not move when a submodule bumps,
which is where a stable per-id ratchet belongs.

Trailing commas are normalized away because oxfmt adds one exactly when it breaks a construct
across lines, so a comment that changes the line-breaking decision changes the comma too.
Ignoring that took the code class from 45 apparent findings to 2 real ones in the first
300-seed sample. A comma preceded by another comma is left alone — that is array elision,
which is semantically real.

Quote style is normalized for the same reason, and it survives only on pairs oxfmt could not
parse. It was measured to reclassify **0 of 213** entries under oxfmt 0.61 and has not been
re-measured under 0.62, so it is in for honest reporting rather than to change a verdict: the first difference
the gate prints must be the reason for the verdict, and before this a reviewer could see
`import 'x'` vs `import "x"` and dismiss a real finding sitting further down the same file.

### Mutation known failures (`mutation-known-failures.json`, 0 entries)

Full sweep: 34,813 manifest entries, 92 already-diverging unmutated (excluded), **34,721
eligible seeds** → 31,470 mutants → 125,880 comparisons, under oxfmt 0.64.0. 3,251 seeds are
skipped (no mutable `<script>` line boundary).

The `mutation-known-failures.provenance.json` file records 0 entries, one SHA-256 seed-content
hash for each source represented by the failure ratchet. A full sweep reports a changed
hash as re-keyed instead of claiming that the old mutation now passes.

| verdict | entries |
|---|---|
| `code-mismatch` | 0 |
| `unparseable` | 0 |
| `compiler-crash` | 0 |
| `error-mismatch` | 0 |

**The ratchet is empty, and an empty ratchet makes 0 the bar** — every future sweep must stay at
0 on all four verdicts, with no entry left to suppress anything. The progression was
525 → 30 → 168 → 165 → 122 → **0**; the last step proved all 122 remaining entries stale in one
sweep, on 34,721 seeds against the 34,100 the 122-entry baseline was measured on.

Read the zero with the section below, not on its own: `comment-mismatch` is **15,351** on the
same sweep and is deliberately not gated, so this is a statement about the *code* class only.

#### What took it to 0

Three defects, all of them a scan reading a comment — or a removed statement — as something it
is not. Each is now pinned by a `compatibility/pattern-corpus/issues/` repro **and** a unit test,
because the repro alone is only as strong as the corpus gate that runs it:

| what the scan assumed | what broke it | where |
|---|---|---|
| a destructure's right-hand side ends at the first unbalanced `}` / `)` / `;` | those bytes inside a following `/* } c */` comment | `client/destructure_transforms.rs` |
| the character before a property name says whether it is shorthand | a `/* c */` line between two object entries | `client/expression_utils.rs` |
| a removed `$effect` leaves nothing behind | upstream returns `b.empty`, which esrap prints as `;` outside a `body` sequence | `server/mod.rs` + `server/ast/script.rs` |

The third is the one this gate was uniquely able to see. Upstream's server
`ExpressionStatement` visitor returns `b.empty` for a statement-position `$effect` /
`$effect.pre` / `$effect.root` / `$inspect.trace`, and esrap's `body` helper — used by
`Program`, `BlockStatement`, `ClassBody`, `StaticBlock` and `TSModuleBlock` — is the only place
that filters an `EmptyStatement` out. A switch case consequent is visited directly
(`SwitchStatement` loops `block.consequent`), as is the unbraced body of `if` / `else` /
`while` / `do` / `for` or of a label, so all of those print the `;`. **The corpus output gate
cannot see that class at all**: oxfmt drops a lone empty statement from both sides, so it
surfaced only as a mutant of one `runed` seed. It also lived in two ports of one upstream rule —
the `compileModule` text rewrite and the component `visit_statements` — and only the module half
was in the ratchet.

#### `unparseable` is 0, and it has been non-zero three times

Progression: **16** at `d88546a7`, 10 after #2639/#2642, **0** after #2619/#2626, back to **8**
with the wave-2 enrolment, 6 after the next fixes, and **0** again now. The same counter has
moved in both directions on the same corpus, which is the positive control for reading this
zero as a measurement rather than as an instrument that cannot move.

The six that the enrolment reopened were three units × two targets, and all three are gone:
`huly/…/create-doc/steps/TemplateStep` and `ha-fusion/src/lib/Sidebar/History` were a `//`
comment landing where a **continuation** was expected, so a chained `.then` / `.catch` was
swallowed; `svelte-put/packages/toc/src/toc.svelte.js` split a class field into `id =;` and its
initializer on the `.svelte.(js|ts)` path.

Two of those PRs are worth separating, because each looks ineffective under the other's gate.
#2619 changed 8 real corpus files and **0** mutation seeds; #2626 changed **0** real files and 5
of the remaining seeds. A `0/0/0` corpus delta meant the byte-identity corpus could not express
the shape, not that the change did nothing.

**One shape in this family remains unreachable by this gate at any corpus size**: a delimiter
inside an ordinary string literal reproduces the same defect with no comment present, and the
operator inserts comments and only comments. See `gate-coverage.md` row 20a.

#### The delimiter is one mechanism, and the residue it explained is gone

Each comment kind is chosen with equal probability, so the per-kind mutant counts are uniform
(3,862–4,008) and the rates are directly comparable. The gate prints this table itself, so it
cannot drift from the ratchet it describes:

| comment kind | findings | mutants | per 1,000 |
|---|---|---|---|
| `block-with-brace` (`/* } c */`) | 0 | 3,911 | 0.0 |
| `line-with-brace` (`// } c`) | 0 | 4,008 | 0.0 |
| `line-with-semi` (`// ; c`) | 0 | 3,967 | 0.0 |
| `line` (`// c`) | 0 | 3,940 | 0.0 |
| `svelte-ignore` | 0 | 3,900 | 0.0 |
| `block` (`/* c */`) | 0 | 3,862 | 0.0 |
| `line-with-paren` (`// ) c`) | 0 | 3,962 | 0.0 |
| `block-with-paren` (`/* ) c */`) | 0 | 3,920 | 0.0 |

**Delimiter-carrying kinds: 0.0 per 1,000. Plain comments: 0.0. The ratio is undefined.**

That is the honest end state of a quantity this section has cited eight times: 2.81× (oxfmt
0.61), 1.30× (0.62), 1.66× (0.62, after the invalid-JS burndown), 1.38× after the inspect
empty-statement fix, **0.92×** on the enrolled corpus, **1.13×** after the rebase onto `main`,
**1.10×** after the next fixes, **1.22×** after the 2026-08-25 release sweep — and now 0/0. It
crossed 1.0 in both directions without the mechanism moving, because it tracked the normalizer
and the current residue rather than the compiler. **Do not restore it as a constant if the
bucket goes non-zero again**; recompute it, and say which sweep it came from.

**The claim this table used to carry was falsified by a change of inputs alone**, and that is
still the lesson worth keeping. At 14,229 seeds the two plain kinds were at 0 findings each, and
the doc concluded that "every surviving code divergence in this bucket involves a
delimiter-carrying comment". On 34,100 seeds `line` was at 12 and `svelte-ignore` at 8 — and
`svelte-ignore` carries no delimiter at all yet accounted for one of the three `unparseable`
units. A plain comment that lands on a line where a *continuation* was expected breaks the same
scans a delimiter does; the delimiter was never the mechanism, only the cheapest way to reach it.
A zero for both kinds is not evidence for the old claim either — it is the absence of a
population to compare.

The delimiter share is the #2253 signature: a text-level rewrite locates a terminator by
scanning bytes instead of lexing, so a `}` / `)` / `;` inside a comment is read as code. #2283
consolidated five such scans behind `shared/js_scan.rs::skip_opaque`.

#### Behavioral residue is back to zero

At 14,229 seeds the residue was entirely cosmetic — empty-statement placement and optional-chain
parenthesisation. The enrolled corpus reopened two behavioral classes against the larger seed
set, and the last of them is now closed: the `cnblocks/src/lib/svgs/vercel` client entries, whose
`$.rest_props` initializer vanished so attributes silently disappeared, were #2347's shape
exactly — the bug this gate was built on, on an input the corpus did not hold when it was fixed.
**A closed defect class reappearing on new seeds is evidence about coverage, not about the fix**,
and it will reappear again the next time the corpus grows.

#### By source repository

Empty. The last non-empty distribution — `huly` 74, `open-webui` 16, `flowbite-svelte` 4,
`layerchart` 4, `networking-toolbox` 4, `powertable` 4, `svelte-lexical` 4, `cnblocks` 2,
`ha-fusion` 2, `runed` 2, `svelte-put` 2, `threlte` 2, `trakt-web` 2 — put **`huly` at 61% of
the ratchet** on a corpus where it is one repository of 103. Read that as a statement about the
*seed distribution* rather than about huly: it is a large Svelte-4-era application, so it carried
far more of the legacy `$:` / chained-promise shapes these scans mis-located than a modern
component library does.

**The hazard that table existed to catch outlives it.** `runed` was one of two corpus submodules
absent from the tree during an earlier attempt at a re-baseline. `collect.mjs` skips a missing
source with a warning and exits 0, so the run measured 14,035 entries and looked complete — and
`--update-baseline` would have deleted a live entry as fixed, after which CI would have reported
it as new. The `MIN_FULL_CORPUS_ENTRIES` floor cannot catch that: 14,035 cleared the 12,000 lower
bound of the day, and the floor is now 30,000 against 34,813 collected entries, so the margin a
silently-missing source has to eat is about 12% — which the largest source alone exceeds. Only 2
of the 104 corpus sources are marked `required`. **With an empty ratchet this is strictly more
dangerous, not less**: there is no longer a listed entry whose disappearance would signal that
the population shrank, so the entry count and the eligible-seed count printed by the run are the
only witnesses left.

#### Sensitivity to the normalizer

Re-deriving this baseline from oxfmt 0.61.0 to 0.62.0 took the gated bucket from **213 to
525** — it grew, rather than shrinking as a strictly-more-normalizing formatter would suggest.

That was measured directly rather than inferred. Holding the compiler and the corpus fixed and
varying only the normalizer, over the 193 seeds behind the newly-added entries:

| | oxfmt 0.61.0 | oxfmt 0.62.0 |
|---|---|---|
| `match` | 331 | 45 |
| `comment-mismatch` | 244 | 146 |
| `code-mismatch` | 4 | 388 |

Same seeds, same 193 mutants, same 579 comparisons. So **384 of the 388 additions are the
normalizer**, not the 13 intervening commits on `main` and not the corpus growing by 104
entries. 0.61 was collapsing redundant parentheses on *both* sides, which made a real rsvelte
divergence compare equal; 0.62 preserves them and the divergence becomes visible. The larger
ratchet is the more honest one.

The direction is the trap worth remembering: a normalizer that absorbs more can *expose* more,
because what it stops rewriting on the expected side is what the actual side was being
compared against.

### Stability of the ratchet

Ids are `<corpus id with __m<n>__<kind> before the extension> [verdict] (target)`.

- The mutant a seed contributes is chosen from **that seed's own hash**, not from its index in
  the manifest, so adding or removing a corpus entry does not reshuffle every other entry's
  mutants.
- The tag goes **before** the extension so the compiler still receives a filename ending in
  `.svelte` / `.svelte.js` / `.svelte.ts`. Appending it instead produced 9 spurious
  `error-mismatch` entries that vanished when the filename was made valid — dev mode bakes the
  filename into its output, and an unrecognised extension selects paths the real pipeline never
  takes.
- The tag carries the mutant INDEX, not the slot's line. `n` and the comment kind derive from
  the seed id alone; the line does not, so keying on it made an edit anywhere in a seed file
  rewrite every entry for that file — surfacing as a regression and a staleness at once, for a
  divergence that had not changed.
- Seeds already listed in `known-failures.<target>.json` are excluded: they diverge before
  anything is inserted, so a divergent mutant of one is not attributable to the mutation. **92**
  of 34,813 entries are currently excluded on that basis, and that number moves whenever an
  output ratchet does — shrinking one *adds* seeds here.

<a id="parse-ast-known-failures"></a>

## Public `parse()` AST parity ratchet

Gate: `scripts/compat-corpus/parse-ast-verify.mjs`.
Ratchet: `parse-ast-known-failures.json`, currently **287 entries**.

### The question it asks

`parse()` is a documented export of `svelte/compiler`, separate from `compile()`, and it is what
svelte2tsx, `eslint-plugin-svelte` and an editor integration read. Until this gate landed
(#3389) **nothing in the repository compared its return value to official's.** The corpus gates
compare `compile()` output; the svelte2tsx and lint gates consume rsvelte's own AST and never
diff it against upstream's.

The two suites that come closest are the `Parser Modern` / `Parser Legacy` rows of the
compatibility report (`crates/rsvelte_core/tests/parser_fixtures.rs`), and they answer a
narrower question three ways over: they call rsvelte's **internal** `parse` rather than the
exported entry point, they pick the AST mode from the fixture's directory rather than from an
option, and `normalize_json` deletes `loc.*.character` from both sides before the assert.

### Unit and key

One `(corpus entry, axis)` pair; axes are `modern` (`{ modern: true }`), `legacy` (no options —
the default shape) and `loose` (seven inline sources). Both sides go through
`JSON.parse(JSON.stringify(...))` first.

The ratchet key is a **field, not a file**: `<axis>::<NodeType>.<field>#<kind>`, where the node
type is the `type` of the nearest enclosing typed object and the kind is `missing` (absent on
rsvelte's side), `extra`, `value`, `type`, `length` or `span`. Two other keys were measured
first and both were worse — per entry id gives a five-figure file that churns on every submodule
bump, and per *set* of divergent paths multiplies independent defects into 472 classes over
4,468 files. The script's header carries the numbers.

A third was found by reading the ratchet rather than by designing it, and it fails in the
opposite direction: the path descended into objects whose keys are **user data**. The
`<svelte:options customElement={{ props: { … } }} />` bag is keyed by the prop names the
component author chose, so one defect — official evaluates `customElement.props` into a
descriptor map, rsvelte returns the raw `ObjectExpression` — was filed under one key per name
(`props.count`, `props.foo`, `props.camelCase`, `props.anArray`, …). That makes the ratchet
**grow when a new corpus file carries a new prop name**, for a defect already listed. Measured
on `--filter custom-element`: **15 keys before, 2 after**. Such paths are listed in
`DATA_KEYED_PATHS` and collapse to `{}` exactly as array indices collapse to `[]` — no
divergence stops being reported, it is reported once instead of once per name. A key too
coarse suppresses a second defect; a key too fine invents entries for the first one.

Acceptance divergences are the one exception: "official rejects this document and rsvelte does
not" is a fact about the document, so those keys carry the entry id. A single shared key could not
tell two such entries from one, which is the whole shrink the ratchet exists to observe.

### Why the baseline is not 0

Because the API was never compared. The run that established these figures measured **66,591
compared pairs** over 33,721 corpus components — 9,446 modern-axis and 9,622 legacy-axis entries
byte-identical, with the remainder producing **482** field-level keys. **The ratchet has since
been re-baselined to 321**; the pair and byte-identical counts above belong to the 482 run and are
left as measured rather than rescaled, because no run has been made at 321 to replace them. The
partition below is counted from the current JSON.

The modern-axis identical count was **1,075** when this ratchet was first baselined. #3386
(`Root.end`) accounted for the other 4,177 on its own: it diverged on 12,324 of 14,102 entries, so
one key was suppressing more than a quarter of the population from ever being byte-identical.

**The comparator manufactures none of them.** Running the same `diffKeys` with the official
compiler on *both* sides over the same population produces **0 keys from 28,178 self-compared
pairs**. Every listed key is attributable to rsvelte's side.

**One entry in an earlier draft of this file was manufactured, and it is worth recording how.**
A `1n` literal puts a real `BigInt` in official's `Literal.value`, and `JSON.stringify` throws on
one. The round-trip sat inside the same `try` as the parse, so 11 corpus entries were recorded as
`official-rejects` — "rsvelte accepts a document the official parser refuses" — when official had
parsed all 11 without complaint. The verdict named the loudest thing it could see; the cause was
one line of the harness. Serialization now sits outside the parse `try`, and a bigint goes through
a replacer so its value stays comparable instead of being dropped.

#### Why this ratchet carries no attribution block

The DoD gate (`scripts/ci/attribution-check.mjs`) allows three end states per entry: the entry is
gone, it names a filed `upstream_issues/` report, or it names `deliberate-divergences` with a test
pinning the behaviour. **This population has no targets of the second or third kind — not a
missing column, an absent domain.** Measured rather than argued:

* Running the gate's own `diffKeys` with the official compiler on **both** sides over the same
  population yields **0 keys from 28,178 self-compared pairs** (recorded above). The comparator
  invents none of these, so each one is a real difference between rsvelte's `parse()` and
  official's.
* Exactly **one** key of the 301 is answered by an upstream report, and its output is attached
  below rather than inferred.
* **Zero** are `deliberate-divergences`: nothing in this ratchet is a behaviour rsvelte intends to
  keep, and no test pins one.

So 300 of 301 are rsvelte's own unfixed defects, whose only permitted end state is elimination.
Writing a block here would mean inventing a target for each, which is the failure the gate exists
to prevent — a target that is not true is worse than an absent one, because it reads as an answer.
This ratchet therefore belongs on the pending list until it is burned down, and the default mode's
exit 1 is the correct verdict meanwhile.

**The one upstream-answered key**, measured against `submodules/svelte` (the source path, `VERSION`
5.56.10) rather than reasoned from the issue text:

```
gate source                  text                        official parse(modern, loose)
unclosed-element             "<div><b>x"                  OK    type=Root
unclosed-attribute-quote     "<div class=\"a>text</div>"   THROW Error: An impossible situation occurred
stray-closing-tag            "</div>"                     THROW TypeError: … (reading 'name')
```

`loose:unclosed-attribute-quote::(accepted)#official-rejects` is therefore
[`upstream_issues/3385-svelte-loose-parse-crashes.md`](../upstream_issues/3385-svelte-loose-parse-crashes.md):
official does not *reject* that document, it **crashes** on it, and `loose` is the mode that exists
to return an AST for a document still being typed.

**The neighbouring key is not, and the reason is a name collision worth recording.** The issue's
second crashing input is `</div>`, and this gate has a source called `unclosed-element` — but that
source is `<div><b>x`, which official parses fine (above); `</div>` is the gate's
`stray-closing-tag`, a deliberate control both sides must still reject, and it is not in the
ratchet at all. So `loose:unclosed-element::RegularElement#span` is an ordinary rsvelte span
defect. Reading the issue and the gate as sharing a vocabulary would have attributed an rsvelte
defect upstream.

Partition of `parse-ast-known-failures.json` by cluster: `80 + 52 + 46 + 38 + 32 + 16 + 14 + 6 + 2 + 1`

| cluster | keys | bases | what it is |
|---|---|---|---|
| `span` | 80 | 42 | `start` / `end` / `loc` disagree on a node type. Merged into one key per node type on purpose: they are derived from the same offsets, and split by field they were 672 keys for the same defects. |
| `node-type` | 52 | 27 | rsvelte labels a node with a different `type` than acorn/acorn-typescript does. Almost all are TypeScript nodes; the walk stops at a `type` mismatch, so each is one key rather than a spray of derived field keys. |
| `estree-fields` | 38 | 19 | ESTree fields rsvelte's serializer omits or adds: `importKind`, `exportKind`, `attributes` on an import/export, `accessor`, `typeAnnotation`, `returnType`, `optional`, `readonly`, `declare`. The lint gates already found three of these from the other side. |
| `unclustered` | 32 | 20 | keys nobody has classified. The cluster exists so an unclassified key reads as unclassified instead of joining someone else's row. |
| `comment-attachment` | 46 | 23 | #3387 — comments disagree on statements and programs; one key represents each affected node type and attachment field. #3702 fixed the walk order for five template-literal shapes in both AST modes. |
| `accepts-what-official-rejects` | 1 | 1 | the loose `unclosed-attribute-quote` source, and nothing else. See below. |
| `css-shape` | 14 | 9 | the legacy CSS selector conversion (`Selector` vs `ComplexSelector`, `combinator` / `selectors` / `name`). |
| `child-count` | 16 | 10 | an array of children with a different length. |
| `loc-presence` | 6 | 3 | a node that has a `loc` on one side and none on the other — kept apart from `span` because "no position at all" is a different defect from "wrong position". |
| `ast-mode` | 2 | 2 | #3385 — the remaining legacy-root shape differences. |

**Read the `keys` column as `bases x axis`, not as work.** A key is
`<axis>::<NodeType>.<field>#<kind>` and most node types diverge identically under `modern` and
`legacy`, so 287 keys are **156 distinct bases**: 131 appear on both axes and 25 on one
(131x2 + 25 = 287, a 1.84x collapse). The defect ceiling is 156. The per-cluster collapse is not
uniform — `estree-fields` and `comment-attachment` are 2.00x (every base is on both axes),
`css-shape` 1.56x and `child-count` 1.60x (legacy-only shapes), `ast-mode` and
`accepts-what-official-rejects` 1.00x by construction.

**No base's two axes sit in different clusters** (0 of 131), so a cluster can be worked end to end
without a key from it turning up under someone else's row. Measured directly from the JSON, which
is authoritative for the partition: the ten rows above are its `Counter(values())`.

Attribution of `parse-ast-known-failures.json`:

| n | target | cluster |
|---|---|---|
| 1 | [`upstream_issues/3385-svelte-loose-parse-crashes.md`](../upstream_issues/3385-svelte-loose-parse-crashes.md) | `loose:unclosed-attribute-quote::(accepted)#official-rejects` — official does not reject that document, it **crashes** on it, so matching it would mean reproducing the crash |

Both sides, on the gate's own source text (`parse-ast-verify.mjs:121`), under `{modern: true,
loose: true}`:

```
official  Error: An impossible situation occurred
rsvelte   OK type=Root
```

The error carries no code, no position and no frame, which is what separates it from a diagnostic:
`loose` exists to return an AST for a document still being typed, so rsvelte accepting it is the
behaviour the mode is for.

This table is **partial**; `attribution-check` prints its `n` sum against the ratchet's own length,
so neither number is repeated here. Every other key is a rsvelte-side defect whose only terminal is
the entry going away — `upstream_issues/` would be false, and `deliberate-divergences` asserts a
choice plus a test pinning the behaviour, which for a wrong span or a wrong node type would pin the
defect.

**The two `ast-mode` keys are not covered by that row, and what separates them is a number
collision.** The cluster table above cites `#3385` for them, and `upstream_issues/` reports are
named after the rsvelte issue that tracks them — so one number reaches two different things:
official's `loose` crash, which is the row above, and a rsvelte-side legacy-root shape difference,
which is those two keys. They stay unattributed. This is the second instalment of the collision
recorded above for `unclosed-element`: that one was a shared *name* between an issue and a gate
source, this one is a shared *number*, and it points the worse way, because one of the two things
is ours and the other is upstream's.


**A fix here shrinks and grows the ratchet at once, and the two directions have to be read
separately, and [`GATES.md` 39b](GATES.md#39b--a-divergence-stops-the-walk-so-what-is-behind-it-is-uncompared--s)
said so before any of it happened** — "fixing one will *add* keys as its children become
reachable. This is the same one-directional coupling the lint gates have between `start` and
`end` — expected, not a regression." A property written into the coverage table in advance is a
stronger warrant than the same sentence written afterwards to explain a red run.
`diffKeys` stops descending at a `type` mismatch, so a `.type#value` key does not
mean "this one field disagrees" — it means **the whole subtree under that node was never
compared**. Correcting a node's type therefore retires its key and makes everything beneath it
comparable for the first time, which can enrol keys that were always wrong and never visible.
The seven TypeScript type nodes fixed in #4220 are the worked example: **16 keys retired and 2
enrolled**, net -14, from **one** mechanism (a catch-all arm emitting `TSUnknownKeyword`) — so
"14 fixed" is the wrong reading in both halves. Three of the retired node types
(`TSLiteralType`, `TSParenthesizedType`, `TSTypeAliasDeclaration`) were not in that fix's list
at all; they came out from under a `.type#value` that had been masking them, and four of the
sixteen are `leadingComments` keys, which is the `comment-attachment` cluster shrinking as a
side effect of a `node-type` fix.

The two enrolled keys are `{modern,legacy}::TSTypeParameter.leadingComments[]#length`. A
`TSMappedType` synthesizes a single `TSTypeParameter` spanning `K in C` — acorn-typescript has
no node for the two halves separately — and that synthesized node is now reached by the walk,
where its comment list disagrees. It is **not a regression**: the divergence predates the fix
and was unreachable while the parent's type mismatch stopped the descent. This is the same
"collapse over-counts, an absent carrier under-counts, and one mechanism does both" shape the
ratchet has elsewhere; here the retired 16 are the collapse side and the enrolled 2 are the
carrier side.

**#4249 is the second instance of that coupling, and it is net-zero rather than net-negative.**
Correcting `{modern,legacy}::TSModuleBlock.type#value` — rsvelte emitted a `TSModuleBlock` where
official has a nested `TSModuleDeclaration` for a dotted `namespace A.B { }`, along with the
absent `id` and `declare` fields — retired **6** keys (2 `node-type`, 4 `unclustered`) and
enrolled **6**: `{modern,legacy}` x `Literal.type#value`, `TSModuleBlock#span` and
`TSModuleBlock.body[]#length`. The total is unchanged at 287. What is *not* net-zero is
`unclustered`, which fell 36 -> 32: those four keys were in the bucket for divergences nobody had
classified.

All six enrolled keys are **one** mechanism, it is **pre-existing**, and it is not this fix's.
rsvelte's `parse()` drops a top-level `declare function` from the script body
(`convert_function_declaration_as_node` returns `None` for `FunctionType::TSDeclareFunction`,
`1_parse/read/expression.rs:10489`). Because `diffKeys` compares arrays index-by-index, one
missing statement misaligns every sibling after it, and official's `declare module 'foobar'`
block is compared against rsvelte's `namespace SomeNamespace` block one position out. Attribution:
**#4249**.

Two rsvelte binaries on the same input, against official. This is what establishes that the fix
did not introduce the divergence, and it is the kind of evidence that cannot be reconstructed
once both arms are gone:

```
STAGED 0f773c75 (fix/parse-ts-module-declaration)   body=1  types=[VariableDeclaration]
ref    2523e10f (without the module-decl change)    body=1  types=[VariableDeclaration]
official                                            body=2  types=[TSDeclareFunction, VariableDeclaration]
```

That it is one mechanism and not six was settled by **ablation** rather than by reading the key
names: deleting only the line `declare function declared_fn(): void;` from a copy of the carrier
takes that file's divergence-key set from **26 to 9 on both axes**, and every `TSModuleBlock` and
`Literal` key disappears. That measurement used a re-implementation of `verify.mjs`'s keyer, so
it establishes the mechanism's cardinality, not the gate's key spellings.

The strip itself is correct for `compile()`, where a type-only declaration must not reach the
output, and wrong for `parse()`, where official returns the node — one strip serving two public
surfaces, the same family as #3385 / #3386 / #3387. It is therefore not a deliberate divergence.
`crates/rsvelte_core/tests/parse_ts_exotic_types.rs:151` pins the current behaviour, so fixing
#4249 turns that assertion red; that is the single assertion having pinned `compile()`'s correct
erasure and `parse()`'s incorrect one together, not a regression. Exactly **1** of 30,698
collected `.svelte` files carries the shape, so no amount of corpus growth reaches it.

#### What the `unclustered` bases actually are (measured 2026-08-31)

The counts in this subsection are as measured on that date, when the cluster held **27** bases;
the table above is counted live from the JSON and now reads **20**, the seven having been fixed
since. The dated figures are left as measured rather than rescaled.

Classified by reproducing each key from a minimal source with the gate's own `diffKeys` algebra,
so every line below is the ratchet's own key string, and the cause is read off the two ASTs rather
than guessed from the key name. **17 of the 27 bases reproduced; 10 did not** — an unreproduced
key means no input shape was found for it, not that it is stale.

**A. TypeScript declaration children are not serialized (7 bases).** rsvelte emits the node
envelope — `type`, `start`, `end`, `loc` — and none of its children:
`TSEnumDeclaration.id` / `.members`, `TSModuleDeclaration.id` / `.global` (and `.declare`),
`TSIndexSignature.parameters` (and `.typeAnnotation`), `TSParameterProperty.parameter` (and
`.accessibility`). This is the same gap AGENTS.md already records from the lint side — a
`TSTypeAliasDeclaration` dropped entirely, no `returnType` — and the named fix site is
`1_parse/read/expression.rs`. The probes also turn up neighbours not in this cluster:
`TSModuleBlock` is labelled `BlockStatement`, and a class's `typeParameters` and a
`PropertyDefinition`'s `typeAnnotation` are absent.

**The precondition for fixing A was measured before any of it was attempted, and it holds.** The
question was whether the existing `Option<Box<serde_json::Value>>` machinery
(`convert_ts_type_parameter_declaration` and friends, on `push_span_fields`) can reproduce
official's positions at all, since every fix here builds on it. A generic function's
`typeParameters` — built exactly that way — diverges on **zero** keys, so the answer is yes and
the remaining work is writing the missing builders rather than replacing the approach. The
sizing is *not* uniform per base: `TSIndexSignature` had one emitter and every helper already
present; `TSEnumDeclaration` has **two** emitters (a typed `JsNode` variant on the statement
path and a `Value` on the declaration path, which is itself a two-ports pair);
`TSModuleDeclaration` needs an `id` *and* a `body` whose node type and span are both wrong
(`BlockStatement` spanning the whole declaration, where official has a `TSModuleBlock` spanning
the braces); `TSParameterProperty` is unmeasured.

**`TSEnumDeclaration` is done too, and the ordering mattered.** It had **two emitters** — a typed
`JsNode::TSEnumDeclaration { start, end, loc }` on the statement path and a `Value` built inline on
the declaration path — which is itself a two-ports pair, so adding children to one of them would
have created an eleventh instance rather than closing a defect. Both now go through one
`convert_ts_enum_declaration_value`, and the variant joins the opaque `value: Box<Value>` group the
other retained TS declarations already use (`TSTypeAliasDeclaration` / `TSInterfaceDeclaration` /
`TSDeclareMethod`), so the envelope needs no new tag — it moves onto the generic `write_json_node`
escape. That **removes** `JS_TS_ENUM_DECLARATION` rather than adding a tag, and the envelope
`VERSION` still has to move (7 → 8): the object a JS caller receives changes shape even though
dispatch stays generic.

It removes the four ratcheted keys `{legacy,modern}::TSEnumDeclaration.{id,members}#missing`, plus
**two** with no carrier in the ratchet — `const#missing` and `declare#missing`, which the repro
carries because `const enum` and `declare enum` are separate acorn-typescript flags emitted in that
order. Measured: the repro reports 4 keys per axis pre-fix and 0 post-fix; over the 4,898-unit x
2-axis parse sweep exactly those four ratcheted keys leave, **0 appear and 0 change count**
(159 → 155 distinct); compile output is byte-identical over 14,694 pairs; the NAPI two-surface round
trip is 16/16, and ablating the decoder to drop `members` takes it to 4/16 on exactly the four enum
cases. One neighbour is measured and **not** carried: acorn-typescript **rejects** a computed member
key (`enum E { ['C'] = 1 }`, `js_parse_error`), so rsvelte accepting it is a separate
over-acceptance in the `param-default` / `class-modifier` family's shape, not a field divergence.

**`TSIndexSignature` is done** (`parameters`, `typeAnnotation`, `readonly`), which removes four
ratcheted keys — and those four sat in **two** clusters (`unclustered` and `estree-fields`) for
one mechanism, the same split recorded under B. A fifth key it closes, `readonly#missing`, has no
carrier at all. Its `leadingComments#missing` is untouched and belongs to `comment-attachment`: a
`Value`-built node never reaches `ser_comments!`. One measured neighbour is **not** fixed —
`class C { static [k: string]: number }` drops the member entirely (`ClassBody.body[]#length`),
because a class element goes through two further converters, the pair that also drops a
`static {}` block.

**B. A field with the wrong shape rather than a missing one (4 bases) — and this grouping was
wrong.** It was cut by the KEY's shape (`#type` / `#extra` rather than `#missing`), and measuring
the four split them three ways.

*Two are one family with two more bases filed in other clusters, and it is FIXED.*
`ImportExpression.options#extra` and `ExportNamedDeclaration.attributes#extra` are the same
mechanism as `ImportDeclaration.attributes#extra` (`estree-fields`) and
`ImportDeclaration.attributes[]#length` (`child-count`): **acorn and acorn-typescript emit
different node shapes, and rsvelte emitted acorn's under both.** So one mechanism spanned three
cluster rows — the partition is by key shape, not by cause. A 41-construct x plain/`lang="ts"` x
2-axis grid found five such shapes, of which only two had a corpus carrier; the tree went from 32
cells carrying 20 distinct keys to 8 carrying 4. Pinned by
`crates/rsvelte_core/tests/import_export_parser_shapes.rs` and two pattern-corpus files.

*One is really cluster A.* `ClassDeclaration.implements` is a boolean `true` where official has an
array of `TSExpressionWithTypeArguments`, and the node stores a `bool` (`ast/typed_expr.rs:521`)
because the TypeScript children are not serialized — the same cause as A, reached through a
different key kind.

*One is not a compiler defect at all.* `Literal.value` for a bigint is `null` because
`parse()`'s NAPI binding returns a JSON **string**, which cannot express a `BigInt`. Measured on
one input: official `{"value": 123n, "bigint": "123", "raw": "123n"}`, rsvelte
`{"value": null, "bigint": "123", "raw": "123n"}` — **`bigint` and `raw` agree exactly, so no
information is lost.** Matching would mean emitting the gate harness's own `{"__bigint__": …}`
normalization shape. It cannot be closed without changing the binding's return type, and it
should not be read as outstanding work.

**C. `Root.options.customElement.props` is raw AST, not a value (2 bases).** rsvelte emits the
`ObjectExpression` node; official emits the evaluated bag, `{ p: { reflect: true } }`. The `#extra`
and `#missing` keys are the two halves of that one substitution.

**D. `Let.modifiers` is one omitted empty array (1 base, legacy only) — FIXED, awaiting a
re-baseline.** Official emits `modifiers: []` on a `let:` attribute; `convert_let_directive` was
the one of eight directive converters that omitted it. Reproduced on both `<svelte:fragment
let:x>` and a component `let:`, and pinned by
`pattern-corpus/issues/let-directive-carries-an-empty-modifiers-array.svelte`. A 4,898-unit x
2-axis parse sweep removes exactly this one distinct key and adds none; `compile()` output is
byte-identical on all four targets, so this base was observable through no other gate.

**E. `ExpressionStatement.directive` — the statement is dropped (1 base).** A `'use strict';`
directive in an instance script does not appear in `Program.body` at all, so official's body has
one more element and the first statements have different types. AGENTS.md records the same loss
for a `FunctionBody`'s `directives`.

**E2. `export * from` never reached the program body — FIXED.** `convert_statement_for_program`
had no `ExportAllDeclaration` arm, so the statement fell through `_ => None` and vanished; it is a
cause of `{legacy,modern}::Program.body[]#length`, though that key has other causes and no
`.svelte` in `submodules/svelte` carries the shape, so **how much of that entry it moves is
unmeasured until a collected-corpus run**. `compile()` kept the statement throughout.

**F. Not reproduced (10 bases)**, listed so the next attempt starts from a smaller set:
`TSTypeParameterDeclaration.extra`, `Decorator.expression` (the parent's whole `decorators` array
is dropped, so any input reaching this key must be one where the array survives),
`Literal.regex.flags`, `Line.value`, `CSSComment.position` / `.value`, `Text.raw`,
`Attribute.name` / `.name_loc`, `Identifier.name`, `Comment.ignores[]`. Plain sources for each
(entities, CRLF, unicode escapes, `svelte-ignore` with two codes, CSS comments inside and outside
a rule, a shorthand and a spread attribute) all produce **no keys**, so the corpus reaches these
through a shape none of those covers.

### The acceptance rows are the interesting ones

**No collected document is left in this row.** The only key that remains is the loose
`unclosed-attribute-quote` source. Nine TypeScript documents left this set when the early-error
layer taught OXC's split type/value namespaces about acorn-typescript's `import type`/
value-declaration collision, and the six that were still listed — including the original two,
`css-invalid-combinator-selector-4` (`css_selector_invalid`) and `invalid-empty-css-declaration`
(`css_empty_declaration`), raised by upstream from `1-parse` and by rsvelte from `2-analyze` —
now agree on both axes. That is the class AGENTS.md already records for
`svelte_meta_invalid_placement` — anything that parses without analyzing sees a valid tree where
the official toolchain sees a fatal error. It is deliberately **in scope**: a drop-in `parse()`
that accepts more than official does is a divergence, and listing it here is what makes it
visible. An earlier draft of this file listed eleven more, and all eleven were the harness (see
above).

The custom-property block fix adds four real-world SCSS carriers to this set: gitlight's
`ScrollbarContainer.svelte`, plus trakt-web's `SearchResultsGrid.svelte`, `DropdownItem.svelte`,
and `Switch.svelte`, use Sass interpolation inside custom-property values. These entries and
the retained CSS child-count keys are measured against the corpus's pinned gitlinks; a local
working tree with newer submodule checkouts produces a different set and must not be used to
baseline this gate.

**rsvelte no longer throws on any collected component that official accepts.** The former
`chatgpt-web` `Home.svelte` and immich `VideoNativeViewer.svelte` entries were removed after the
parser fix made both axes agree. In the loose suite, `unclosed-element`, `unclosed-block`, and
`empty-expression` agree; `valid-control` is the accepted control, while `unterminated-script`
and `stray-closing-tag` remain rejected by both. `loose` is not blanket recovery on either side.

### Shrinking it

`node scripts/compat-corpus/parse-ast-verify.mjs --update-baseline`, from a full run only (the
script refuses below 10,000 compared modern-axis pairs, and refuses under `--filter`). The
ratchet is two-sided: a key that no longer diverges fails the run, so the PR that fixes keys
re-baselines in the same PR.

#3761 is the first shrink that changed which later program children the comparator could align:
retaining type aliases and interfaces removed 384 listed keys and exposed 18 keys that an earlier
missing child or node-type mismatch had stopped the walk before it could observe. The measured
baseline therefore moved from 856 to 490 keys; the 18 are existing downstream AST-shape residue,
not a claim that the newly retained declarations match on those fields.

<a id="parse-known-failures"></a>

## Output-parseability ratchet

Gate: the "output parseability" section of `scripts/compat-corpus/verify.mjs`.
Ratchet: `parse-known-failures.client.json` holds **0 entries**,
`parse-known-failures.client-dev.json` holds **0 entries**,
`parse-known-failures.server.json` holds **0 entries** and
`parse-known-failures.server-dev.json` holds **0 entries**.

### The question it asks

Every other comparison in `verify.mjs` is *rsvelte's text against official's text*. That makes
"wrong text" and "text that is not JavaScript" the same row, carrying the same verdict into the
same ratchet. This gate asks a question with no reference to official's bytes at all: **does
the module rsvelte emitted parse?**

A compiler may emit output we would call wrong. It may never emit output that is not
JavaScript, so this ratchet has no tolerance to spend beyond what is listed here.

### The baseline was 0 because the inputs were absent, and the enrolment proved it

Everything below the next two paragraphs was written while this ratchet was empty, and it
said so in as many words: *"the 30 defects above are in repositories that are not corpus
sources … an empty baseline here is therefore the expected result, not a measurement that
was skipped."* The wave-2 enrolment (#3176) made huly, open-webui,
carbon-components-svelte and SMUI corpus sources, along with 63 more repositories, and the
ratchet went to **12 entries across two targets on the first run**. The current tree holds
**0 entries** after retiring the repaired classes listed below. That is the
prediction being paid out, and it is the reason blind spot 19c in
[`gate-coverage.md`](#gate-coverage) is now closed for these inputs and for no others.

The enrolled entries and repaired classes, none of them a formatting difference:

| id | acorn says | cause |
|---|---|---|
| `svelte-bits/…/CircularGallery.svelte`, `photon/…/Commands.svelte` (fixed) | `Unexpected token` | OXC stores a rest parameter outside the ordinary parameter list, so removing the TypeScript `this` parameter left its comma behind: `function (, ...args)`; the stripper now uses either kind of following runtime parameter |
| `svelte-tweakpane-ui/…/HomeDemo.svelte`, `…/TweakpaneDemo.svelte` (fixed) | `Assigning to rvalue` | the parser attached a next-line leading `;` to the preceding `derived(..., ($point4) => …)` declaration; the line pipeline therefore put the following setter in the same transform unit and extended the callback parameter's shadow over its real `$point4 = …` write. The boundary normalizer now separates the statement after that explicit terminator. |
| `sveltekit/…/query/instance.svelte.js` (fixed) | `Assigning to rvalue` | a raw-state private-field `??=` nested in `void untrack(() => (...))` reached the read wrapper as `$.get(this.#promise) ??= …`; the private assignment AST pass lowers it before reads, and the exact module host is now pinned. |
| `huly/…/ModernEditbox.svelte`, `threlte/…/Sequence.svelte` (fixed) | `Unexpected token` | a standalone `//` comment was folded into the following destructured declaration's transform unit; rewriting a prop read in its initializer re-emitted the comment between the binding pattern and `=`, so the line comment swallowed the initializer |
| `huly/…/NavigatorCardsSection.svelte` (fixed by #3934) | `Unexpected token` | Its TypeScript reactive statement contains `query<Card>`. The prop-read AST pass parsed the whole statement as JavaScript, failed on that type argument, and fell back to the heuristic text scanner; that scanner joined object-spread lines onto the preceding `//` comment, so the comment swallowed all three spreads. Parsing reactive fragments as TypeScript keeps the scope-aware splice path and preserves every original newline. |
| `huly/…/FilePreviewPopup.svelte` (fixed) | `Unexpected token` | the dev ownership pass emitted overlapping edits for an outer prop setter and setters inside its async right-hand side. The flat splicer applied the outer replacement with offsets from the unmodified program and corrupted the module; child-first traversal now folds contained replacements into their parent before splicing. Covered by `issues/nested-prop-setter-mutations.svelte`. |
| `adventurelog/…/CollectionMap.svelte`, `…/CollectionStats.svelte` | `Missing initializer in const declaration` | A template `$t` created the component store-sub binding, then the name-only client script transform rewrote a nested local `const $t` declaration and its calls as store reads. The transform now excludes every store spelling declared as a binding inside the top-level statement, matching lexical shadowing. Covered by `adversarial/legacy/store-sub-shadowed-local-binding.svelte`. |
| `threlte/…/SoftShadows.svelte` (`server-dev`, fixed by #3877) | ``Expected `,` or `)` but found `Identifier` `` | comments attached to later `$effect` statements were emitted inside the preceding derived template literal; #3877 corrected the dev component-callback tail insertion point |

No entry remains on either client target, and both server targets are also at 0. The former
target split prevented the dev-only FilePreviewPopup and SoftShadows failures from suppressing
the production SSR output while it remained open.

The enrolment PR initially listed these because its job was to enrol; every one broke its
consumer unconditionally, and the completed burn-down has now retired all of them.

### What the empty baseline was worth, as argued at the time

An empty ratchet is the weakest kind of evidence, so here is what stood behind it.

**The oracle is calibrated.** `parseable.mjs` uses acorn, deliberately not OXC: rsvelte parses
JavaScript with OXC, and both existing "does it parse" checks in the repo
(`ast_equiv_batch`, `crates/rsvelte_core/tests/ast_gate_preconditions.rs`) re-use OXC, so an
acceptance quirk in the parser rsvelte depends on is invisible to all of them. Compiling 3,509
real-world components from four repositories (huly, open-webui, carbon, SMUI) with the
**official** compiler across all three targets produced 10,464 modules, of which acorn under
`parseable.mjs`'s `OPTIONS` rejected **0**. That is the positive control for "these options do
not reject legal output".

**The oracle discriminates.** On the same repositories, rsvelte emits output that no parser
accepts for 30 components. acorn rejects **30 of 30** — the same set esbuild rejects. The gate
is not merely permissive.

**The gate can move.** `scripts/dev/test-corpus-parse-gate.mjs` drives `verify.mjs` over a
synthetic corpus and asserts each of the properties this ratchet depends on, including the two
that a plausible-but-wrong implementation would break: an entry already listed in
`known-failures.<target>.json` must **not** be suppressed here, and an entry whose input the
*official* compiler rejected must still be parsed. Both were confirmed by running the test
against a mutated `verify.mjs`; both flipped.

**So why was the ratchet empty?** Because the 30 defects above were in repositories that were
not corpus sources. `corpus-sources.json` listed sveltejs/svelte, svelte.dev and 33 shipped
libraries; huly, open-webui, carbon and SMUI were none of them. An empty baseline was
therefore the expected result, not a measurement that was skipped — and #3176 enrolled all
four, which is what the table at the top of this file is.

What that meant honestly, then: **this gate was a regression gate, not a burn-down.** It
closed the hole where a future defect of this class rides in under an existing ratchet entry,
and it closed one of the two structural blind spots recorded for gate 15 in
`gate-coverage.md` (oracle shares rsvelte's parser). It could not, by itself, find the 30
known defects — only enrolling those repositories would. It is now both: a regression gate
and a completed burn-down.

### Adding an entry

Don't, unless the divergence is understood and the fix is scheduled. Unparseable output breaks
every consumer of the compiler unconditionally; there is no "formatting difference" reading of
it. If an entry must be listed, give it a heading here with the acorn message, the target, and
the mechanism.

### Related list

`parse-oracle-excluded.json` is a different thing and is documented in its own paired `.md`: it
enumerates the `(id, target)` pairs where **official's** output does not parse, which the gate
skips on both sides because there is no reference to hold rsvelte to.

### What this gate does not look at

See `compatibility/gate-coverage.md` § 19 for the surveyed list. In short: CSS output, source
maps, the `.d.ts`/TSX outputs, and *semantics* — a module that parses can still be wrong, which
is what the output ratchet is for.

<a id="parse-oracle-excluded"></a>

## Parse-oracle exclusions

`parse-oracle-excluded.json` — **2 entries**, one `(id, target)` pair per line.

The output-parseability gate in `scripts/compat-corpus/verify.mjs` parses official's module
before rsvelte's, as its own control: nothing else in the pipeline would notice a parser
configuration that rejects legal compiler output. When official's output does not parse, there
is no reference for "must parse", so that `(id, target)` pair is skipped **on both sides**.

Skipping is not free — it removes an rsvelte output from the gate — so every skipped pair is
listed here rather than absorbed, and the list is shrink-only in both directions: an
unlisted oracle rejection fails the run, and a listed pair whose official output now parses also
fails the run.

#### DoD-4 attribution — **U**

Attribution of `parse-oracle-excluded.json`:

| n | target | cluster |
|---|---|---|
| 2 | `upstream_issues/3609-svelte-snippet-param-shadowed-by-const.md` | official's own client output declares one name twice, so the "is this JavaScript?" oracle has no reference for the pair |

The pair leaves this list the day upstream stops emitting a redeclaration; the shrink-only
check in both directions is what makes that automatic rather than something to remember.

### The entries

#### `compiler-errors/samples/const-tag-snippet-invalid-reference-1/main.svelte` — `client`, `client-dev`

acorn: `Identifier 'foo' has already been declared`.

This is an **early error**, not a syntax error: the text tokenises and shapes fine, and a parser
is free to accept or reject it. acorn rejects; the gate's question ("is this JavaScript?") is
about syntax, so this is a place where the oracle is stricter than the question.

The input is a `compiler-errors` sample — deliberately invalid Svelte, kept in the corpus because
error parity is gated too. Official's client codegen emits a `{@const}` binding alongside the
snippet parameter it collides with, producing two lexical declarations of `foo` in one scope. The
`server` target is unaffected and stays in the gate.

**Not a reason to widen `parseable.mjs`'s `OPTIONS`.** Disabling early-error checks (there is no
acorn option for this short of a different parser) would weaken the oracle for all ~42,000
modules to accommodate two. Two named exclusions cost less.

### Why the calibration missed it

`parseable.mjs`'s options were calibrated on 10,464 modules compiled from 3,509 **real-world**
components, where acorn rejected none. The corpus's population is not that: it includes Svelte's
own deliberately-invalid fixtures, which is exactly where a compiler is most likely to emit
something a strict parser refuses. A calibration corpus reproducing the measurement only shows
the method is sound on *its* population — see `AGENTS.md` on what a gate's inputs do and do not
contain.

<a id="scss-known-failures"></a>

## SCSS backend parity — known failures

`rsvelte_preprocess` compiles Sass/SCSS with [`grass`](https://docs.rs/grass), standing in for
dart-sass. Nothing compared the two until `scripts/compat-corpus/scss-verify.mjs`
(`pnpm run corpus:scss`) existed: the crate's tests port the upstream packages' **own** unit tests
— language filtering, indented-syntax selection, a small nesting sample — which exercise the
wrapper's dispatch, not the CSS compiler. The substitution was therefore an assumption, not a
measurement.

The gate compiles every `<style lang="scss"|"sass">` block and every standalone `.scss` / `.sass`
file in the corpus source repositories with both backends and compares the CSS byte-for-byte after
trailing-whitespace normalisation. `scss-known-failures.json` holds **315 entries** and may only
shrink; it is two-sided, so an entry that starts agreeing fails the run until it is
re-baselined in the same PR.

### What the population is, and what it is not

The first run measured 118 units: **64 match**, **30 diverge**, and **24 are compared only as
"both backends reject"**. Read the denominator as 94, not 118 — a both-reject pair is parity, but
it is parity on a comparison that never reached the CSS.

**After the wave-2 enrolment (#3176) the population is 3,033 units**: 1,762 match, 216 diverge on
the CSS, 99 are inputs `grass` rejects and dart-sass accepts, and 956 are both-reject. The
denominator is therefore 2,077, and `grass` agrees with dart-sass on **84.8%** of it. Treat that
as the current size of the "near-substitute, not drop-in" claim — it was measured on 94 units
before, and the 25× larger population did not change the verdict, only its precision.

Two consequences worth stating rather than discovering later:

- **A both-reject pair does not compare the two error messages.** Two backends rejecting one input
  for unrelated reasons score identically to two backends agreeing. This is the same shape the
  shape-matrix gate had before #2583 taught it to compare error codes; SCSS error text is not
  comparable across implementations, so the gate does not try.
- **The corpus is Tailwind-era Svelte, so SCSS is rare.** 101 of the original 118 units came from
  two repositories (`attractions`, `powertable`), and the prediction recorded here was that
  adding one SCSS-heavy repository would grow the gate where more Tailwind libraries would not.
  The enrolment paid that out: 15 repositories now contribute entries, led by
  `svelte-material-ui` (67), `mathesar` (46), `carbon-components-svelte` (41), `huly` (34) and
  `musicat` (33) — all of them SCSS-era codebases, none of them Tailwind-era.

`scripts/compat-corpus/scss-verify.mjs` builds a `node_modules` symlink shim from every
`package.json` in the corpus and hands it to **both** backends as an extra load path. Without it,
`attractions`'s self-referencing `@use 'node_modules/attractions/_variables'` fails to resolve and
65 of its stylesheets fall into the both-reject bucket — the gate would have looked green while
comparing almost nothing.

Partition of `scss-known-failures.json` by verdict: `216 + 99`

- **216 — the CSS differs** (`css-mismatch`).
- **99 — `grass` rejects an input dart-sass compiles** (`grass-rejects-accepted`). This is the
  half a text diff cannot describe, and it is a third of the list.

The clusters below are a **diagnostic ordering of the `css-mismatch` half, not a partition**: the
gate prints one differing line per unit and 192 of the 216 produced one, so the counts sum to 192.
The original five clusters were written when the whole ratchet was 30 entries; each is still the
same mechanism, at the size the enrolment found.

| n | cluster | changes the cascade? |
|---|---|---|
| 71 | declarations after nested rules (cluster 2 below) | **yes** |
| 44 | indentation of a nested rule | no |
| 32 | colour serialisation (cluster 1) | no |
| 26 | a trailing `/* … */` dropped (cluster 4) | no |
| 11 | attribute-selector quote style — dart-sass keeps `'`, `grass` prints `"` | no |
| 8 | a comment `grass` emits before the block dart-sass emits it after | no |

### Six `date-picker-svelte` entries moved when the abort stopped happening

`grass` asserts that an indented-Sass document's top-level indentation is zero and **aborts** on a
`<style lang="sass">` block, whose body carries the surrounding file's indentation. Dart Sass reads
that shared prefix as the document's base indentation instead. `remove_indented_base` existed for
this, but it was reached only from a `catch_unwind` — and every shipped binary except the three
with an explicit `panic = "unwind"` override is built under `panic = "abort"`, so the fallback
never ran where it mattered and the process died. Removing the base *before* `grass` sees the
document made six units compile that previously aborted: three now agree with dart Sass and left
the ratchet, three compile to different CSS and moved from `grass-rejects-accepted` to
`css-mismatch` (one each into the three clusters above). The leading blank line is part of the
condition, not incidental — dart Sass rejects a document whose very first line is indented, so
dedenting that shape would make rsvelte accept what dart Sass refuses.

The one cluster that changes rendering is also the largest, which was not true at 30 entries.

Each cluster section below closes with the files that carried it **when the ratchet was 30
entries**. Those lists are kept as the worked examples that named the mechanism; they are no
longer the cluster's membership, which is now the counts in the table above.

### What the 315 entries are, measured

The clusters below were written by reading the first differing line of each unit, which is what
`--list` prints. That answers "what does the text differ in", not "can it change rendering" — and
the two come apart: a colour printed as `rgba(86, 86, 92, 0.1019607843)` on one side and
`#56565c1a` on the other is the same colour, while a declaration that merely *moved* is a cascade
change with no textual smell at all. The split below is computed instead of read:

`scripts/compat-corpus/scss-classify.mjs` parses both CSS outputs and flattens each to a list of
`(selector chain, property, value)` in document order; values are normalised for whitespace,
quoting and **colour** (every `#hex` of 3/4/6/8 digits, `rgb()/rgba()`, `hsl()/hsla()` with or
without `deg`, and the named colours are folded to one `rgba(r,g,b,a)` spelling, RGB channels
rounded to 8 bits and alpha to four decimals — that rounding is the tolerance, and it is what
makes dart-sass's `rgb(100%, 41.3333333333%, 20%)` equal to `grass`'s `#ff6933`). Then

- **equal lists** → the divergence cannot change rendering;
- **equal multisets, different order** → the cascade changes;
- **different content** → a value differs.

| class | n | meaning |
|---|---|---|
| render-neutral | **155** | comments, whitespace, quote style, colour spelling |
| order-differs | **59** | the `mixed-decls` class — a declaration written after a nested rule |
| content-differs | **2** | a genuinely different value |
| `grass` rejects an accepted input | **99** | five causes, each with an `upstream_issues/` report |

**The last row is a different severity, and this ratchet folds it in with the other three.**
The first three classes are units where both compilers produce CSS and the CSS differs; the
fourth is units where **`grass` does not compile the input at all**, so a consumer's build
fails rather than renders differently. `scss-known-failures.json` carries one entry shape for
both, which makes the count read as one severity:

| n | severity | what a consumer sees |
|---|---|---|
| 155 | render-neutral | nothing — comments, whitespace, quote style, colour spelling |
| 59 | wrong cascade | the `mixed-decls` class: a declaration written after a nested rule is hoisted |
| 2 | wrong value | `grid-row: 0.4`, which a browser drops |
| **99** | **does not compile** | `sass:color` API 35, `*.import.scss` 32, explicit `.scss` extension 28, relative colour 3, `@apply` `!` 1 |

155 + 59 + 2 + 99 = 315. Splitting the ratchet is a separate decision; recording the split is
not, because a single number reads as a single severity.

**How the population last grew is worth one line, because it did not grow from the corpus.**
`pattern-corpus/issues/indented-sass-error-position.svelte#style0` is a `grass-rejects-accepted`
unit that #3967 added as a repro and did not list here, so it entered as a NEW divergence rather
than a ratcheted one. It went in because this gate was red for an unrelated reason on that PR —
`Build the grass side of the gate` failed to compile (`error[E0609]` on an oxc field rename), so
the comparison never ran, and the PR merged with nine jobs red. A gate that is red for a reason
unrelated to what it measures stops being read, and a real NEW arrives under cover of that noise;
this is the failure mode one step earlier than #2405's "a skipped gate reads as a passing one",
because nothing was skipped. It needs no entry here: the indented-Sass base removal that landed
after #3967 makes the unit compile, so the gate reports it as a match rather than a divergence —
which is why the count above is unchanged by it.

**There is no upstream fix to take for any of them.** crates.io's newest `grass` is 0.13.4
(2024-08-04), which is what this repository locks; `master` has two commits since, one of them
packaging-only, and its single functional change (a `string.split` overflow) appears in none of
the justifications here. The seven `upstream_issues/grass-*.md` reports are all written against
0.13.4 and none is fixed upstream — whether they were *filed* is `unrecorded`, which per
[`upstream_issues/README.md`](../upstream_issues/README.md) means unrecorded rather than unfiled.

Run the same classification with colour folding **off** (drop `CANON_COLORS=1`) and it reads
111 / 51 / 54: the 44 units that move are all colour spelling, with identical computed colours.
Both numbers are reported because "cosmetic" is a line someone drew, and this is where it sits.

The flattener is hand-rolled rather than postcss, so the script needs no dependency this
repository does not already declare. It was written against a postcss implementation and agrees
with it on **216 of 216** rows under both colour settings; that agreement is the control, since a
flattener that silently dropped nodes would report everything as render-neutral.

### The two `content-differs` units are real, and one ships broken CSS

```
musicat/src/App.svelte#style0
  dart-sass:  grid-row: 2/5   grid-row: 2/5   grid-column: 1/5
  grass:      grid-row: 0.4   grid-row: 0.4   grid-column: 0.2
```

`grid-row: 0.4` is not a valid value, so the browser drops the declaration — this is the only
entry in the ratchet that produces output a browser rejects. **Three** declarations in that file
are corrupted, not the one the ratchet's first differing line shows.

**The obvious reduction is wrong, and it fails in the direction that reads as a fix.** "`grass`
evaluates `2/5` as division" describes nothing: the two agree on `a { grid-row: 2/5 }`, on the
same rule inside `@media`, on `$n/5` (both divide, dart-sass with a `slash-div` warning) and on
`calc(2/5)` (both fold to `0.4`). The trigger is the Sass **`not` keyword followed by `(`**, in a
rule **nested inside another rule** — `:nots(`, `:xnot(`, `:is(`, `:and(`, a bare `:not` with no
paren, and `:not(` at the top level all keep the list. And the corrupted declaration need not be
the one under `:not` at all: **once triggered, every later slash list in the file divides** —
a sibling rule, the parent rule, a deeper rule, and a rule after the whole nested block. That is
why the ratchet's count understates it and why the pin asserts four positions rather than one.
See
[`upstream_issues/grass-slash-list-divided-inside-a-nested-rule.md`](../upstream_issues/grass-slash-list-divided-inside-a-nested-rule.md).

The second `content-differs` unit is
`carbon-components-svelte/.../tabs/_tabs.scss`, where the universal-selector reset rule
(`.bx--tabs *, .bx--tabs *::before, .bx--tabs *::after { box-sizing: inherit }`) lands in a
different place.

### Cluster 1 — colour serialisation (part of the 155)

dart-sass ≥ 1.79 serialises a computed colour in the space its channels were computed in, so
`color.adjust` / `lighten` / `darken` results print as `rgb(92.6666666667%, …)` and
`rgba(255, 64, 0, 0.6117647059)`. `grass` prints the legacy shortest form — `#ececec`,
`#ff40009c`, `darkgray`.

**Same colour, different spelling**, confirmed by folding both to `rgba()` above: no rendered
pixel changes. They are still listed rather than normalised away in the gate, because a normaliser
that folds every colour form would also fold a genuine colour-arithmetic divergence, which is
precisely the class this gate exists to catch.

### Cluster 2 — declarations after nested rules (the 59)

```scss
.btn {
  @include appearances.button;   // emits nested rules
  background: none;              // …then a declaration
}
```

dart-sass ≥ 1.77 (the `mixed-decls` change) emits that declaration **where it was written** — a
second `.btn { background: none; … }` block after the nested rules. `grass` still hoists it into
the first block.

**This one changes the cascade**, so it is not cosmetic: a hoisted declaration loses to a
nested-rule declaration it was written to win against. It is the highest-value cluster in this
ratchet and the reason the gate was worth building. Reported in
[`upstream_issues/grass-hoists-a-declaration-written-after-a-nested-rule.md`](../upstream_issues/grass-hoists-a-declaration-written-after-a-nested-rule.md).

The `.md` used to list seven files here. After the wave-2 enrolment the class is **59** units and
its centre of mass moved: `carbon-components-svelte` 38, `attractions` 7, `mathesar` 5, `musicat`
3, `networking-toolbox` 2, and one each from `appwrite-console`, `date-picker-svelte`, `huly` and
`powertable`. Sizing a cluster from the file list a pre-enrolment run happened to print
understates it by an order of magnitude.

### Cluster 3 — `grass` panics on the indented syntax

Every `lang="sass"` block in `date-picker-svelte` aborts `grass` with an assertion failure in
`grass_compiler-0.13.4/src/parse/sass.rs:200`. dart-sass compiles all six.

**A panic, not an error, and `catch_unwind` cannot contain it** — the release profile aborts
rather than unwinds, so the helper announces each unit's index on stderr and the gate resumes past
whichever one it died on. The shipped `preprocess_sass` has no such recovery, so an indented-syntax
block of this shape takes the whole compiler process down.

### Cluster 4 — comment preservation (part of the 155)

`grass` drops a trailing `/* … */` that follows a declaration on the same line, and rewrites the
leading tab of a continuation line inside a preserved multi-line comment to a single space.
Comments survive into shipped CSS, so this is an output difference a consumer can see, but it
changes no rule — the flattening above ignores comment nodes, and these units land in
`render-neutral` for that reason.

### Cluster 5 — multi-line selector indentation inside `@media` (part of the 155)

A selector list that wraps across lines inside an `@media` block keeps the block's indentation on
every line under dart-sass; `grass` indents only the first.

### The 99 `grass` rejections are five causes, each minimally isolated

| n | cause | report |
|---|---|---|
| 35 | the CSS Color 4 `sass:color` API (`color.channel`, `color.space`, `color.to-space`, `color.is-in-gamut`, `color.same`) is missing | [`grass-missing-css-color-4-api.md`](../upstream_issues/grass-missing-css-color-4-api.md) |
| 32 | a `*.import.scss` file is resolved from `@use` / `@forward`, so the `@import` shim walks back into the module being loaded | [`grass-import-only-file-loaded-by-use.md`](../upstream_issues/grass-import-only-file-loaded-by-use.md) |
| 28 | a specifier carrying an explicit `.scss` extension does not resolve | [`grass-explicit-extension-specifier.md`](../upstream_issues/grass-explicit-extension-specifier.md) |
| 3 | CSS Color 4 relative colour syntax is parsed as a Sass `rgb()` call | [`grass-css-color-4-relative-syntax.md`](../upstream_issues/grass-css-color-4-relative-syntax.md) |
| 1 | Tailwind's `!`-prefixed utility inside `@apply` | [`grass-tailwind-important-apply.md`](../upstream_issues/grass-tailwind-important-apply.md) |

Every one was reduced to a file pair small enough to paste into a report, rather than attributed
from the error string. That mattered twice. The 28 look like a load-path problem in **our** shim
until the probe shows `@use "./vars"` succeeding and `@use "./vars.scss"` failing on the same
directory — the extension is the whole trigger. And the 32 are not a loop in the corpus's
stylesheets at all: deleting the sibling `_functions.import.scss` turns five otherwise-identical
cases green and restoring it turns all five red, which is the ablation that names the cause.

### Running it

```bash
cargo build --release -p rsvelte_preprocess --bin scss_parity
pnpm run corpus:scss                                  # gate
node scripts/compat-corpus/scss-verify.mjs --list     # every divergence, with the first differing line
node scripts/compat-corpus/scss-verify.mjs --update-baseline
```

Both backends are version-pinned so the ratchet is reproducible: `sass` 1.102.0 in the root
`devDependencies`, `grass` 0.13.4 in `crates/rsvelte_preprocess/Cargo.toml`. Bumping either is
expected to move entries; re-baseline in the same PR and update the cluster counts above.

### Attribution

Attribution of `scss-known-failures.json`:

| n | target | cluster |
|---|---|---|
| 155 | `deliberate-divergences` | render-neutral serialisation — colour spelling, comment placement, wrapped-selector indentation, quote style. Pinned by `crates/rsvelte_preprocess/tests/grass_serialisation.rs`. |
| 59 | `upstream_issues/grass-hoists-a-declaration-written-after-a-nested-rule.md` | a declaration written after a nested rule is hoisted above it — the `mixed-decls` class, and the only css-mismatch cluster that changes the cascade |
| 35 | `upstream_issues/grass-missing-css-color-4-api.md` | the CSS Color 4 `sass:color` API is missing, so the input does not compile |
| 32 | `upstream_issues/grass-import-only-file-loaded-by-use.md` | a `*.import.scss` file is resolved from `@use` / `@forward` |
| 28 | `upstream_issues/grass-explicit-extension-specifier.md` | a specifier carrying an explicit `.scss` extension does not resolve |
| 3 | `upstream_issues/grass-css-color-4-relative-syntax.md` | relative colour syntax is parsed as a Sass `rgb()` call |
| 2 | `upstream_issues/grass-slash-list-divided-inside-a-nested-rule.md` | a slash list divides after a `not(`-shaped pseudo-class in a nested rule; `grid-row: 0.4` is CSS a browser drops |
| 1 | `upstream_issues/grass-tailwind-important-apply.md` | Tailwind's `!`-prefixed utility inside `@apply` |

The split is the computed classification of § *What the 315 entries are, measured* (155 / 59 / 2)
plus the five `grass-rejects-accepted` causes (99), not a second reading of the same units.

<a id="sourcemap-known-failures"></a>

## sourcemap-known-failures.json — why each entry is accepted

The source-map gate (`crates/rsvelte_core/tests/sourcemaps_gate.rs`) runs the 29
official `packages/svelte/tests/sourcemaps` samples through rsvelte and checks
the resulting `js.map` / `css.map`. Ground truth is the official compiler: the
`client.js` / `client.js.map` / `server.js` / `server.js.map` fixtures under
`fixtures/<sha>/sourcemaps/` come from `scripts/fixtures/generate-fixtures.mjs`
calling `submodules/svelte`'s own `compile()` on the same input with the same
options (`{ dev: false, generate, filename: 'input.svelte' }` — the gate asserts
each sample's recorded `metadata.json` still says exactly that).

| kind | id shape | meaning |
|---|---|---|
| `anchor` | `anchor\t<sample>\t<target>\t<index>\t<str>` | an official `_config.js` `client:` / `server:` / `css:` expectation that rsvelte's map does not satisfy |
| `map-parity` | `map-parity\t<sample>\t<target>\t<count>` | budget: official map segments that rsvelte does not reproduce, where the generated code is byte-identical (missing + wrong) |
| `out-of-range` | `out-of-range\t<sample>\t<target>\t<count>` | budget: out-of-range segments not also emitted by the official map at the same generated and original position |

**Current baseline: `sourcemap-known-failures.json`, 0 entries.** The
before/after tables further down record what one specific change did at the time
it landed; they are history, not the current size. Reading the newest number in
those tables as today's count is the mistake this line exists to prevent — the
`73` under the anchoring fix was correct when written (#2264 took the list 75 →
73), #2312 later took it to 74, and the location-less comment cursor brought it
back to 73.

Ratchet semantics, matching `fmt-verify.mjs` / `verify.mjs`:

- an `anchor` id **not** in this list fails CI;
- a `map-parity` / `out-of-range` count **above** its recorded budget fails CI;
- an entry that starts passing (or a count below its budget) only prints a
  reminder to shrink the list — the list may shrink, never grow.

Two things deliberately **cannot** be expressed as a known failure, because
"measured less" must never look like "passed":

- a budgeted `<sample>/<target>` that disappears from the measurement is a
  regression, not a win;
- an `anchor` id in this list whose entry no longer exists in the test's
  `ANCHORS` table is a regression, so anchors cannot be deleted to go green.

On top of that the gate holds hard floors — sample count, anchor count, and the
number of byte-identical outputs `map-parity` can observe — and panics rather
than skipping when a sample's `input.svelte` or `metadata.json` is unreadable.

Regenerate the whole list from a measurement (never hand-edit the counts):

```bash
UPDATE_SOURCEMAP_RATCHET=1 cargo test -p rsvelte_core --test sourcemaps_gate -- \
  --ignored --nocapture sourcemap_gate_measure
```

### After a Svelte bump

The four constants at the top of `sourcemaps_gate.rs` are the only things a bump
can touch beyond the ratchet itself. Raise a floor only *after* a measurement
justifies it — never to make a red run go green.

- **Upstream adds samples.** Nothing to do. The floors are `>=` lower bounds, so
  they stay satisfied, and a new sample has no ratchet entry — any failure it
  brings is correctly reported as a regression. Once it is triaged, regenerate
  the ratchet and raise `EXPECTED_SAMPLES` / `EXPECTED_ANCHOR_COUNT` /
  `EXPECTED_IDENTICAL_OUTPUTS` to the new measured values in the same commit.
- **Upstream removes or renames samples.** A floor trips, or `load_input`
  panics. That is the intended outcome — confirm against the upstream diff that
  the sample really is gone, then lower the floor and drop its ratchet entries.
  Never lower a floor without that confirmation: an unreadable sample and a
  deleted one look identical from here, and the first is a broken checkout.
- **Upstream adds a sourcemaps `_config.js` that the fixture generator can
  import.** `check_fixture_options` fails with "the comparison would be
  meaningless". This is a benign cause with a loud symptom: the generator now
  compiles that sample with options this test does not use, so the oracle and
  rsvelte are no longer comparable. Either teach `compile_sample` the same
  options, or exclude the sample — do not relax
  `EXPECTED_FIXTURE_COMPILE_OPTIONS` to paper over the divergence.
- **Anchors.** `_config.js` expectations are copied by hand into `ANCHORS`;
  re-read the changed ones on a bump, since nothing detects an upstream
  expectation that silently changed value.

### Baseline at the time this gate was added

Measured on Svelte `b29d7002ecf9`, 29 samples × {client, server} (55 of the 58
pairs are byte-identical to the official output, so 55 take part in
`map-parity`):

| measure | client | server | total |
|---|---|---|---|
| official segments reproduced | 0 / 480 | 164 / 284 | **164 / 764 (21.5%)** |
| — of which missing / wrong | 393 / 87 | 113 / 7 | 506 / 94 |
| out-of-range segments | 37 | 0 | **37 / 545 (6.8%)** |
| ported `_config.js` anchors passing | 0 / 12 | 9 / 10 | **10 / 23** (incl. 1 CSS) |

The split is nearly, but not entirely, along the client/server line:

- **Client maps reproduce nothing.** Every client sample scores `0 exact` — not
  one segment of the official client map is reproduced at the same generated
  position with the same origin — all 12 client anchors fail, and all 37
  out-of-range segments are client.
- **Server maps are directionally correct but coarser than official.** 164 of
  284 official server segments are reproduced exactly and no server map has an
  out-of-range segment, but 113 are *missing* (the official compiler emits
  segments rsvelte's printer does not) and 7 are *wrong* (in
  `preprocessed-styles` and `source-map-generator`). One server anchor fails:
  `sourcemap-empty-source` has no segment at the start of `let doubled`. So
  "the server side is fine" would be an overstatement — server is where the
  burndown is tractable, not where it is finished.
- The single CSS anchor passes: CSS maps come from a separate
  `string_wizard`-based path that the client JS refactor does not touch.

#### First catch: #1772

The baseline above was re-measured when this branch was rebased onto a main that
had gained #1772 ("keep `<script>` comments on the direct-AST codegen path"),
and the gate moved. The delta is confined to the two sourcemaps samples that
have a `//` comment inside `<script>` — exactly the files #1772 switches from
the text generator to the direct-AST path:

| | before #1772 | after |
|---|---|---|
| `typescript` client — byte-identical to official | no | **yes** |
| `typescript` client — official segments reproduced | not measured | 0 / 52 (40 missing, 12 wrong) |
| `typescript` client — out-of-range | 0 | **4** |
| `sourcemap-offsets` client — out-of-range | 0 | **1** |

Both directions in one change: generated-code parity *improved* (54 → 55
byte-identical, which is why `typescript` newly qualifies for `map-parity` at
all), while map quality *regressed* (0 → 5 new out-of-range segments). Server
totals are byte-for-byte unchanged, confirming the change is client-only.

This is the degradation issue #1781 describes, and it is the reason this gate
exists: the same change passed every other suite. No other sample's counts
moved, so nothing else on main has touched source maps.

#### Second catch: #1784

Same shape as the #1772 entry above. Fixing #1784 (a trailing
`<script>` comment now flushes at the next node upstream gives a location, not
at the end of the function body) made `sourcemap-offsets` client output
byte-identical to the official compiler for the first time, so it newly
qualifies for `map-parity` and reports its resolution loss: 8 official segments,
0 reproduced.

| | before #1784 | after |
|---|---|---|
| `sourcemap-offsets` client — byte-identical to official | no | **yes** |
| `sourcemap-offsets` client — official segments reproduced | not measured | 0 / 8 (8 missing, 0 wrong) |

`EXPECTED_IDENTICAL_OUTPUTS` rises 55 → 56 in the same commit. Nothing else
moved: no anchor changed, and no existing budget grew.

#### Third catch: instance-script chunk anchor

The instance script chunk was anchored at `ScriptContent::start` — the byte
immediately after `<script>`, i.e. the newline ending that line. Every segment
derived from it therefore resolved to a column past the end of the `<script>`
line. Anchoring the chunk at the script's first non-whitespace byte instead
halved `out-of-range` and produced the first non-zero client `exact` count this
gate has ever recorded; generated code is unchanged (the offset only feeds the
map).

| | before | after |
|---|---|---|
| client `out-of-range` segments | 37 | **19** |
| samples with an `out-of-range` budget | 16 | **14** |
| client official segments reproduced | 0 / 488 | **9 / 488** |
| client `wrong` segments | 81 | **72** |
| ratchet entries | 75 | **73** |

#### Fourth catch: location-less comment cursor

Marking synthesized client nodes as location-less removes the last
`sourcemap-offsets` client segment whose origin pointed past its source line.
Generated output and the sample's `map-parity` budget are unchanged.

| | before | after |
|---|---|---|
| `sourcemap-offsets` client — out-of-range | 1 | **0** |
| ratchet entries | 74 | **73** |

### Root cause

The client entries all shared one cause, tracked in issue #1781: the client AST
output path mapped an entire emitted *chunk* to the one source offset the chunk
started at (`js_ast/to_oxc.rs::take_chunk_region`), and the printer's column
arithmetic then accumulated on top of that single anchor. Individual nodes inside
a chunk lost their own provenance, which produced both symptoms at once —
segments that no longer existed (`missing`, the resolution loss) and segments
that addressed a column past the end of the anchor's line (`out-of-range`).

Two findings from the #1781 burndown sharpened this. First, the official map's
segments are overwhelmingly *identifier and literal* start/end pairs, emitted by
esrap's `Context.write(content, node)`; `rsvelte_esrap` only emitted anchors from
`Printer::write_source_keyword`, so it had none of them and reproduced 0 / 488
client segments. Second, adding those anchors did not help on its own: a
comment-free chunk is parsed in place (`to_oxc.rs::parse_chunk`), so its node
spans are *chunk-local* byte offsets that the printer then read as offsets into
the original `.svelte` file. Chunk-local offsets and real source offsets share
one number space with nothing to tell them apart, so per-node anchors resolved to
unrelated positions.

Both halves are now fixed. `Printer::write_node` ports esrap's
`Context.write(content, node)` — every source-backed identifier, literal, member
property and block brace is bracketed by anchors for its own span — and the
spans reaching it are real source offsets, carried through client and SSR
lowering rather than reconstructed from a chunk. That took the gate from 73
entries to 3, with the `anchor` and `out-of-range` classes eliminated entirely.

#### Fifth catch: the empty baseline was never a measurement

#3896 replaced a 3-entry list with `[]` in the same commit that made parity pair
duplicate generated columns by occurrence. That pairing is right for `effects`
(server), whose two official segments at one column rsvelte reproduces in order,
but on its own it also reports a *redundant* official duplicate — the same
segment emitted twice at one column, which `basic`'s `let foo = $.prop(…)` line
carries — as a segment rsvelte failed to reproduce. Measured on #3896's own base
(`b734a16ac`, its `baseRefOid`), that commit's gate scores **47 missing, 7 wrong
over 33 ratchet keys**, so `[]` describes no tree the comparison has ever run on
— and no tree it *could* have run on, because matching a redundant duplicate
would mean reproducing the official map byte for byte.

Nothing caught it because the CI runs for #3896 and its three successors are all
`cancelled`. This is the worked example of the rule in `CLAUDE.md`: **a cancelled
run and a green run are indistinguishable in the branch header**, so a ratchet
merged behind one has never been checked against anything. The gate stayed red on
`main` for the 145 commits that followed, and the failure list at `main` is
identical to the one on a branch cut from it — which is how a branch inherits a
regression that reads as its own.

Both defects of the comparison are now fixed together. `counterpart` still pairs
by occurrence — an extra *leading* rsvelte segment shifts every occurrence and is
still `wrong`, which the unit test pins — but when official has more segments at
a column than rsvelte does, an exact match anywhere at that column satisfies the
surplus one. A redundant duplicate resolves to the same original position for
every consumer, so reproducing it once is reproducing it.

Two compiler defects were behind the rest, both found by comparing against the
official fixture maps rather than against the ratchet:

- **The `bind:` element identifier started at `<`.** Upstream stamps
  `element.name_loc` on the identifier it reuses for the declaration and every
  runtime use, so `$.bind_value(input, …)` maps to the *tag name*;
  `bind_directive.rs` spanned it from `element.start`. The sibling site
  (`$.remove_input_defaults`) already used `element.start + 1`, and the
  `--lib` unit test had pinned the wrong column rather than the fixture's.
- **A source without a trailing `;` lost its whole statement span.** The
  generated terminator has no copied byte behind it, so
  `RestoreRawMappedSpans::source_end_offset` could not map the statement's end
  and `visit_span` dropped the span entirely — leaving the statement in chunk
  coordinates, where it resolves to offset 0. `export let foo = 5` and
  `export let foo = 5;` differ in the map by exactly this one segment. The end
  now falls back to the last copied run at or before the offset, which is where
  upstream's own declaration span ends. An offset past the end of the chunk is
  excluded: a kept `;` for a removed `$inspect` marks itself with
  `span.end == u32::MAX`, and mapping that sentinel to a real position deletes
  the marker, so the `;;` upstream prints collapses to `;`.

| | before | after |
|---|---|---|
| official segments reproduced | 741 / 770 | **768 / 770** |
| — of which missing / wrong | 24 / 5 | **0 / 2** |
| out-of-range segments | 0 | 0 |
| ratchet entries | 0 (unattainable) | **2** |

#### Sixth catch: the keyword anchor, ported twice and guarded once

The last two entries were `attached-sourcemap` on `client` and `server`, one
segment each, and they read as one defect: official emits two segments at one
generated column and rsvelte emitted only the second. They were **four**
defects, in two ports of one upstream function
(`write_source_keyword`, `esrap/src/languages/ts/index.js:113`), which anchors
`location(line, column)` / `location(line, column + keyword.length)` around a
fragment that *includes* the keyword's trailing space.

| # | where | what it did |
|---|---|---|
| A | `KeywordCursor::write`, `Printer::write_keyword` | dropped the end anchor when `column + keyword.len()` exceeded the source line's length. Upstream has no such test; `let` alone on a line is 3 wide and the anchor for `let ` is at column 4. |
| B | `Driver::push_mapping` | **overwrote** the previous mapping when the generated position matched. esrap pushes one segment per `Location` command, so two anchors at one generated column are two segments. |
| C | `keyword_cursor`, `write_keyword` | mapped a builder-made node's keyword. Upstream guards every keyword write on `node.loc`; rsvelte spells "no loc" as an empty or sentinel span and only `write_node` was checking it, so every synthesized `var root = …` / `import …` anchored at offset 0 of the `.svelte` file. |
| D | `generate_token_mappings_inner` (`3_transform/mod.rs`) | the **server** map is not built by esrap at all — `print_split` runs with `emit_locations: false` and a text token scan supplies the anchors. It anchored the 3-character token `let`, so its end anchor was one column short of upstream's. |

Each was measured on its own by restoring it and re-running the gate:

| restored | official segments reproduced | out-of-range | which sample |
|---|---|---|---|
| — (all four fixed) | **770 / 770** | **0 / 1634** | — |
| A | 769 / 770 | 0 / 1633 | `attached-sourcemap/client` |
| B | 769 / 770 | 0 / 1596 | `attached-sourcemap/client` |
| C | 758 / 770 | 3 / 1870 | 10 samples, all `client` |
| D | 769 / 770 | 0 / 1634 | `attached-sourcemap/server` |

Two things generalize past the fix.

**B was masking C.** The dedup made a spurious anchor invisible whenever a
correct one landed on the same generated column, which is exactly what happens
after `var ` in `var h1 = root();`. Removing the dedup alone takes the gate from
2 wrong to 13, and twelve of those thirteen are C, which had been there the whole
time — 236 spurious segments over the 29 samples (1870 with C restored against
1634 without it). A collapse rule that keeps "the last write wins" is not a
normalization — it is a repair that hides whatever it repaired.

**The two ports could not be compared to each other by anything.** The client's
anchors come from `rsvelte_esrap`, the server's from a text token scan in
`3_transform/mod.rs`, and every gate here compares each of them to *upstream* on
whatever inputs a sample happens to supply. `attached-sourcemap` is the one
sourcemaps sample whose `let` is alone on its source line, and it is the only
reason either half was visible. See `two-ports-inventory.md`.

Four independently-failing pins keep them apart:
`crates/rsvelte_esrap/tests/keyword_anchor_fidelity.rs` (A, B, C — one test
each, each failing only under its own ablation) and
`crates/rsvelte_core/tests/server_declaration_keyword_anchor.rs` (D). There is no
`compatibility/pattern-corpus/` repro because the corpus pipeline never writes a
`js.map`: `scripts/compat-corpus/compile.mjs` stores generated code only, so a
file added there would measure nothing about this class.

| | before | after |
|---|---|---|
| official segments reproduced | 768 / 770 | **770 / 770** |
| — of which missing / wrong | 0 / 2 | **0 / 0** |
| out-of-range segments | 0 / 1816 | **0 / 1634** |
| ratchet entries | 2 | **0** |

Total segments fall 1816 → 1634 because C's spurious anchors are gone; the
official map is reproduced in full at the same time, so the drop is
over-emission being removed, not resolution being lost.

### Entries

No entry is accepted as correct behaviour; all are burndown targets. The list is
currently **empty**: every official segment is reproduced and no segment points
outside its source. Unlike the empty list #3896 wrote (see the fifth catch), this
one is a measurement — `sourcemap_gate` asserts it, and the four ablations above
each turn it red.

<a id="sourcemap-oracle-excluded"></a>

## sourcemap-oracle-excluded.json — why each anchor is excluded

The source-map gate (`crates/rsvelte_core/tests/sourcemaps_gate.rs`) ports the
`client:` / `server:` / `css:` assertions from
`submodules/svelte/packages/svelte/tests/sourcemaps/samples/*/_config.js` and
runs them against rsvelte's map.

**Current baseline: `sourcemap-oracle-excluded.json`, 0 entries.**

Before an anchor is held against rsvelte it is run against the **official
compiler's own map** for the same sample — the `client.js.map` / `server.js.map`
fixtures that `scripts/fixtures/generate-fixtures.mjs` produces by calling
`submodules/svelte`'s `compile()`. If the assertion already fails there, the
expectation cannot be reproduced under this harness and the anchor is listed
here instead of being counted against rsvelte.

This happens for one structural reason: the upstream runner
(`tests/sourcemaps/test.ts`) drives `compile_directory`, which sets
`outputFilename` / `cssOutputFilename` and applies the sample's `preprocess`
chain. The fixture generator does neither — it compiles the *raw* `input.svelte`
with `{ dev: false, generate, filename: 'input.svelte' }`. Anchors that describe
preprocessed text therefore have no counterpart in the fixture. (Samples whose
`_config.js` is preprocessor-driven are not ported at all; see the `ANCHORS`
doc comment in the test. Only anchors that survive the raw-input compile are
listed here.)

The gate prints a note when an excluded anchor starts passing on the oracle —
that means the harness changed and the exclusion should be removed.

Coverage caveat: the oracle cross-check needs an official fixture to run against,
and the fixture generator emits no CSS output for this category. So 22 of the 23
ported anchors are oracle-checked; the one `css` anchor is not (its expected
generated string was instead verified by hand against `submodules/svelte`'s
`compile()` — see the comment on it in `ANCHORS`).

### Excluded anchors

(none — all 22 oracle-checked anchors hold on the official map)

<a id="svelte2tsx-fixtures-known-failures"></a>

## svelte2tsx-fixtures-known-failures.json — why entries are accepted

The svelte2tsx **fixture** gate (`crates/rsvelte_projection/tests/svelte2tsx_fixtures.rs`,
logic in `crates/rsvelte_projection/tests/common/svelte2tsx.rs`) runs every sample under
`submodules/language-tools/packages/svelte2tsx/test/svelte2tsx/samples` and compares
rsvelte's TSX against the checked-in `expectedv2.ts`. The ratchet may only shrink.

This is a different gate from `svelte2tsx-known-failures.json`, which compares
rsvelte against **official `svelte2tsx` run live** over the real-world corpus
(`scripts/compat-corpus/svelte2tsx-verify.mjs`). This one is the upstream
exact-fixture suite; that one is the real-world volume check.

Note on the comparison chain: `relaxed_compare`'s `strip_return_statement` stage
deletes the whole `return {…}` statement, not just the differing trailing
`class __sveltets_Render<T> { … }` wrapper it exists to bridge, so nothing
downstream would compare the returned `props`/`slots`/`events` reflection again —
that is how a real `$$slot_def["b"]` vs `$$slot_def['b']` divergence once passed.
`return_statement_matches` (same file) independently re-verifies just the return
statement through the same relaxations, on top of the existing chain.

The ratchet is **two-sided**: a fixture that fails without being listed fails the
suite, and so does a listed fixture that already passes. So a PR that fixes one of
the entries below does not get to leave the removal for later — it must delete the
entry from the `.json` and its justification here in the same change, or CI is red.
If you meet that failure on an unrelated PR it is not breakage: it means your change
fixed a listed fixture, and the fix is to re-baseline.

Adding an entry requires a written justification here. Re-baselining either
direction:

```bash
UPDATE_S2TSX_FIXTURES_BASELINE=1 cargo test --test svelte2tsx_fixtures
```

`STRICT_S2TSX_FIXTURES=1` ignores the baseline entirely (every failure fails),
which is how you check whether an entry is still needed.

### Current baseline: `svelte2tsx-fixtures-known-failures.json`, 0 entries — 0 of 254 (pass rate 100.0%)

The ratchet is empty — every upstream fixture matches byte-for-byte. Any new
entry needs a justification section here.

#### Previously listed, now fixed

- **`attributes-foreign-ns`** — a harness gap: upstream derives
  `namespace: 'foreign'` from the sample-name suffix, our `build_options`
  hardcoded `Html`. The runner now mirrors it, and `Svelte2TsxNamespace::Foreign`
  threads `preserveAttributeCase` into `transform_attribute_case`.
- **`module-snippet-component-instance-reference.v5`** — a snippet's component
  tag names are references to their bindings, but a tag name is not an
  expression, so the lexical free-variable scan never saw `<Icon />`. Ported
  upstream's `collectSnippetComponentGlobals`.
- **`ts-runes-hoistable-props-false-6.v5`** — `typeof $store` resolves through
  the auto-subscription to `store`, which `isAllowedReference` disallows;
  `type_text_typeof_references_local_value` only compared the literal `$store`.
- **`ts-await-generics.v5`** — upstream relocates the props annotation itself, so
  the `$$ComponentProps` alias is a moved chunk that precedes the snippets moved
  to the same index; rsvelte inserts it as text, which always rendered last. Plus
  `legacy.js::remove_surrounding_whitespace_nodes` was applied only to
  `{#snippet}` / `<svelte:boundary>` bodies, not to the `{#each}` / `{#if}` /
  `{#key}` fragments it also trims.
- **`ts-type-assertion`** — upstream rewrites `<T>expr` → `expr as T` in the
  module script unconditionally but in the instance script only in `dts` mode
  (`mode !== 'ts'`), because the instance body ends up inside
  `function $$render()` where the angle-bracket form still parses.

<a id="svelte2tsx-known-failures"></a>

## svelte2tsx-known-failures.json — why entries are accepted

The svelte2tsx output-parity corpus (`scripts/compat-corpus/svelte2tsx-*`) compares
rsvelte's svelte2tsx port against **official `svelte2tsx`** byte-for-byte (after
oxfmt normalization). The ratchet may only shrink.

**Current baseline: `svelte2tsx-known-failures.json`, 2 entries.**

Partition of `svelte2tsx-known-failures.json` by verdict: `2`

- **2 — one side rejects and the other compiles** (`error-mismatch`). Both are
  `cnblocks`'s `(app)/veil/` components, and the rejecting side is **official**:
  a UTF-8 BOM together with a `<script>` block and markup makes `svelte2tsx`
  throw from `magic-string`, reduced and filed as
  `upstream_issues/svelte2tsx-bom-crashes-on-any-component-with-a-script.md`.

A third class left this file entirely: rsvelte emitting text no TypeScript parser
accepts is now its own verdict with its own ratchet — see
[`svelte2tsx-unparseable-known-failures.json`](#svelte2tsx-unparseable-known-failures).

A third upstream defect has **no entry here at all**, and that absence is a measurement
rather than a gap: official svelte2tsx throws a raw `TypeError` when a lowercase element's
`is` attribute has a mustache as its **first** value chunk, and of the 33,904 corpus
components the 165 carrying `is=` yield **0** such carriers (158 have a mustache-first
value, every one of them on a component, which upstream's own gate excludes; all 158
convert cleanly). Not appearing in a ratchet is not the same as not existing — see
[`upstream_issues/4177-svelte2tsx-is-attribute-mustache-first-chunk-crash.md`](../upstream_issues/4177-svelte2tsx-is-attribute-mustache-first-chunk-crash.md).

Attribution of `svelte2tsx-known-failures.json`:

| n | target | cluster |
|---|---|---|
| 2 | `upstream_issues/svelte2tsx-bom-crashes-on-any-component-with-a-script.md` | official throws on a BOM-prefixed component that has both a `<script>` and markup; rsvelte converts it |

Every entry now carries a target, and every one of them is upstream. The
`ts-mismatch` half of this ratchet is empty: the four entries it held on
2026-09-02 were each measured against official, each was an rsvelte defect, and
each is fixed — see the `### Previously:` sections below.

### Entries by mechanism (2026-09-02)

Both implementations are run on the listed sources with the options
`svelte2tsx-compile.mjs` passes (`{filename, isTsFile, mode:'ts', namespace:'html',
version:'5'}`), and the outputs are normalized exactly as the gate normalizes them.
The last column says how far each was pinned — **reduced** (a hand-written input of a
few lines reproduces it), **source** (the construct is identified in the listed file),
or **output only** (the outputs differ and the cause is *not* isolated). Read an
"output only" row as an open question rather than a finding.

**This table is generated from a one-to-one id → mechanism assignment**
(`compatibility/svelte2tsx-mechanisms.json`, which covers this ratchet and the
unparseable one together), **and the `n` column is derived from it.** The previous table was written the other way
round — mechanisms first, counts assigned by hand — and it summed to exactly the
ratchet's entry count while not being a partition: `svelty-picker`'s three files
were counted under two rows (the `@type` → `@typedef` rewrite and the `props:`
JSDoc placement are two hunks of one file, not two files), and three mechanisms
that did exist had no row at all. **An arithmetic check on the total cannot see a
double count**, so the assignment has to be per entry.

| n | mechanism | pinned |
|---|---|---|
| 2 | official svelte2tsx throws from magic-string on a BOM-prefixed component that has both a `<script>` and markup; rsvelte converts it | upstream |

Partition of `svelte2tsx-known-failures.json` by mechanism: `2`

### Previously: `extra-slot-prop` (2026-09-02, at 3 entries)

Kept as `output only` because the divergence was one prop, `dragItem`, and the
axis is the attribute's **value form**. `<slot … dragItem … />` writes the name
with no value at all; `handleSlot` (`nodes/slot.ts`) opens its loop with
`if (!attr.value?.length) continue;` and a valueless attribute's `value` is
`true`, so official declares no such slot prop and rsvelte declared `dragItem:
dragItem`.

Named after the prop, the entry reads as a question about `dragItem`. Enumerated
over the shapes a `<slot>` attribute can take — valueless, shorthand, `=""`,
a text literal, a mustache, a quoted mustache, text + mustache, a spread, a
`let:` — **the valueless rows are the only ones that move**, and there are ten
of them once position (first / last / between two kept entries) and host (a
named slot, an `{#each}`, a component slot) are crossed in.
`crates/rsvelte_projection/tests/svelte2tsx_valueless_slot_attribute.rs` is the
grid; ablating the fix fails exactly those 10 of 19.

The whole-corpus sweep moved 1 unit of 33,901: `MISMATCH -> match` 1,
`match -> MISMATCH` 0.

### Previously: `template-hole-comment-dropped` (2026-09-02, at 4 entries)

Kept because the description named a **comment**, and the axis is the mustache's
interior against the expression node's span. Official copies the text between the
braces into its template literal; rsvelte copied the expression's own span, so
everything the braces hold that the node does not was dropped — a comment, yes,
but also a newline and plain padding. `class="x { a } z"` lost its two spaces and
has no comment in it anywhere.

A repro written from the justification would have been all comments, and half of
the 25 cells the fix moves carry none. **A justification is a hypothesis about
why an entry diverges; it is not the identification of the axis**, and a repro
built from it inherits the hypothesis.

The interior reaches a template literal through **two ports** — the string
builder and the segment builder in `template/attributes/attribute.rs` — and no
gate compares them to each other. Measured one arm at a time on the same 46-cell
grid: reverting only the string builder leaves 10 cells failing (`<slot>` and
named-slot-element attributes), reverting only the segment builder leaves 15
(element, `style`, component attributes), reverting both leaves 25. This is the
third of the three svelte2tsx entries retired on 2026-09-02 to be a two-ports
defect.

`crates/rsvelte_projection/tests/svelte2tsx_mustache_interior.rs` is the grid.
The whole-corpus sweep moved 4 units of 33,901 and changed one verdict:
`MISMATCH -> match` 1, `match -> MISMATCH` 0.

### Previously: `bind-this-shape` (2026-09-02, at 5 entries)

Kept because the description named ONE directive, and the cause is that an
element carrying a `slot` **attribute** is lowered by a second port of the element
transform which never ran the binding pass at all.

`<C><svelte:fragment slot="x"><button bind:this={e}/></svelte:fragment></C>`
reaches `handle_regular_element`, which declares `const $$_button1 = …` and
appends `e = $$_button1;`. Move the `slot` onto the element —
`<C><button slot="x" bind:this={e}/></C>` — and it reaches
`handle_named_slot_element`, which built its own attribute object and its own
class/style + transition suffix. `bind:this` was one of three things that port
lost:

- `bind:this` and the one-way binding attributes stayed props instead of
  becoming an element variable plus an assignment;
- a two-way `bind:value` kept its prop but lost the
  `() => v = __sveltets_2_any(null)` setter the suffix pass appends;
- a **void or self-closing** element closed with a leading space, which only an
  overwritten `</tag>` leaves behind — a divergence with no binding in it at all,
  and one **oxfmt normalizes away**, so the output gate could never report it.

The last one is why the sweep moved **6 units and retired 1**: five of the six
changed their bytes without changing their verdict. A changed hash is not a fixed
file, and the two have to be printed separately.

Two hosts share that attribute builder and DO emit the binding suffix
(`<svelte:element>`, the special elements), so they had the same prop and now
lower it; `<svelte:fragment>` shares the builder and emits no suffix, and takes
only `slot` and `let:`, so it keeps the old behaviour behind an explicit flag
rather than silently dropping a binding.

The positive control fails 10 of the 19 cells; the 9 that pass carry no `slot`
attribute and went through the other port, where all of this was already right.

### Previously: `ignore-region-merge` (2026-09-02, at 6 entries)

Kept because its description named the symptom — *"two adjacent regions are
emitted as ONE"* — and the symptom points at a merge that does not exist. There is
no merging step: upstream builds a **second `ImplicitStoreValues`** for the module
script (`index.ts:202`), seeded with the instance script's accessed stores but with
its own `importStatements`, and each instance wraps ITS names in one region and
appends it at the render-function start. Two regions are two instances. rsvelte
collected both scripts' import names into one list.

**Six of the 17 grid cells diverged and only two of them discriminate.** The other
four are satisfied by an implementation that merely splits adjacent regions,
because with distinct names the union and the two instances print the same
characters in the same order. What separates the rules:

- a name imported by **both** scripts is declared in **both** regions
  (`[<a>][<a>]`), because the second instance is seeded with the accessed stores
  and not with the first one's import list — a union drops the duplicate;
- the instance region comes first **even when the module script is written
  second**, so an implementation that emits in file order passes the other five.

Reaching the mechanism is not being able to tell two rules for it apart; count the
discriminating cells, not the diverging ones.

### Previously: `unterminated-export-let` (2026-09-02, at 7 entries)

Kept because its own description named the symptom as an rsvelte addition — *"gains
`x = __sveltets_2_any(x)`"* — where it is an upstream **loss**, and the two spellings
point at different code.

`preprendStr` (`utils/magic-string.ts:7-17`) does not append. It `overwrite`s the
single character at the insertion point with `text + that character`, and
`propTypeAssertToUserDefined` uses it to add `;x = __sveltets_2_any(x);` at
`declaration.end`. When the declaration is the script's last byte that character is
the `<` of `</script>`, whose chunk the script-tag removal overwrites afterwards —
so the widener is discarded with no error. Filed as
[`upstream_issues/svelte2tsx-preprendstr-insertion-at-the-script-end-is-overwritten.md`](../upstream_issues/svelte2tsx-preprendstr-insertion-at-the-script-end-is-overwritten.md).

The description also recorded that *"adding `;` and a newline makes the two agree"*,
which is two changes for a one-byte condition: **a space, a tab, a trailing block
comment, a `;` or a newline each restore it on their own**, because any of them moves
the insertion point off the `<`. Markup after `</script>` does not, because the
position that matters is the end of the script **content**.

**Three insertion sites had to be told apart, and two of them are unreachable rather
than fixed.** Measured one cell per site: the `export { x as y }` re-export path never
fires when the export precedes the declaration (both tools emit nothing, at the end
and with a trailing space alike), and a non-exported sibling of that declaration list
cannot be the script's last token, because the `export { … }` statement has to follow
it. A guard added to all three on the strength of the mechanism would have been
untestable at two of them.

That measurement did find a divergence of its own, unrelated to the script end:
for `export { a as b };let a = 1, c: number` — the export **before** the declaration —
official widens nothing while rsvelte widens the non-exported sibling `c`, identically
with and without a trailing space and identically on both arms of this fix. It has no
corpus witness: the gate is two-sided and green apart from the entries listed above, so
a divergence that is not one of them is reproduced by no collected unit.

The positive control fails **9 of the 19** cells, and the 10 that pass are the ones a
position-blind suppression would break.

### Previously: `store-get-missing` (2026-09-02, at 8 entries)

Kept because the reduction that was supposed to settle it **agreed on both sides**,
and the table above recorded that agreement as evidence the cause was elsewhere:
*"had a plausible cause — `$permissions` as a destructuring-rename KEY — and a
five-line reduction of that has both tools agreeing, so the cause is something
else."* The cause was the destructuring-rename key. The reduction put it in a
pattern of **one** element, which is the one position where upstream does not
resolve it as a store.

`processInstanceScriptContent` (`:284-296`) tracks "am I inside a declaration"
with a single boolean, and the on-leave callback a binding element pushes clears
it unconditionally — so leaving a pattern's **first** element clears a flag the
enclosing pattern had set, and every element after it is walked as an expression.
A `$`-prefixed property name then reaches the store branch of `handleIdentifier`
(`:155`). The rule this produces is "a `$`-prefixed key is a name iff it is the
first element of its own pattern", which is why a one-element reduction is the
only shape that cannot see it. Filed as
[`upstream_issues/svelte2tsx-isdeclaration-is-a-boolean-not-a-stack.md`](../upstream_issues/svelte2tsx-isdeclaration-is-a-boolean-not-a-stack.md).

The nested rows are what named the mechanism rather than merely fitting it:
`{ a, x: { $p: p } }` is quiet because entering the nested pattern **re-sets** the
flag its sibling had cleared, and `{ x: { a, $p: p } }` is loud for the same
reason one level down. A rule stated as "not the first key in the statement"
fits the flat rows and gets both of those backwards.

**Two method notes.** A reduction that reproduces nothing is a fact about the
reduction, not about the defect — the entry sat at "output only" for that reason
alone, and the sentence recording it read as a finding. And the positive control
is what sized the fix: ablating it fails **7 of the 14** grid cells, which is the
branch condition splitting the grid in half; a fix that reached every cell or one
cell would have been a different rule. The sweep moved 1 unit of 33,901 —
`MISMATCH -> match: 1`, `match -> MISMATCH: 0` — and that unit is the entry
dropped here.

### Previously: `jsdoc-typedef-injected` (2026-09-02, at 9 entries)

Kept because the entry's own description named the wrong side, and because the
correct rule, ported correctly, **broke two files that were passing**.

Official does not "copy the props JSDoc verbatim": `getLastLeadingDoc`
(`tsAst.ts:143-160`) removes every `@typedef` tag from the comment first. Porting
that removal made `TreeViewNode.svelte` match and took `attractions`'s
`popover.svelte` and `snackbar-container.svelte` from **match to MISMATCH** — a
transition only a whole-corpus hash diff can report, because a ratchet lists what
is failing and so structurally cannot contain what is passing.

The cause is that `getLastLeadingDoc` reads `tag.pos` / `tag.end`, which are
**SourceFile-absolute**, and slices them out of `node.getFullText()`, which is
**node-relative**. The removal is therefore offset by `node.pos`, and there are
three outcomes rather than one:

| `node.pos` | shifted slice occurs in the comment? | official |
|---|---|---|
| 0 | — | the tag is removed, as intended |
| > 0 | no | `replace` no-ops and the tag survives |
| > 0 | yes | the wrong text is deleted and the comment is corrupted |

rsvelte reproduces rows 1 and 2 — it strips only when the comment is the script's
first token. Row 3 is **not** reproduced and is filed as
[`upstream_issues/svelte2tsx-getlastleadingdoc-mixes-absolute-and-relative-offsets.md`](../upstream_issues/svelte2tsx-getlastleadingdoc-mixes-absolute-and-relative-offsets.md);
**0 of the 172 corpus components whose source mentions `@typedef` reach it**, all
172 matching after the fix. A unit test pins the divergence with official's own
corrupted output quoted, so the row is not rediscovered as a defect.

Two method notes. The reduction grid that produced the *corrected* rule had every
declaration at the top of its script, so `node.pos` was 0 in every cell — **the
constant the grid held fixed was the branch condition**, and no extra axis would
have found it. And the same commit's other half — official writes
`\n${doc}${name}` where rsvelte wrote `${doc} ${name}` — moves **738 units and
changes 0 verdicts**, because oxfmt normalizes the difference away: an arm built
with only that change is byte-identical in verdict to the arm without it. "The
gate cannot see it" and "the output does not move" are different measurements,
and only the second was ever true here.

### Previously: `render-open-position` (2026-09-02, at 12 entries)

Kept because the three entries were **one symptom over three defects**, and the
count is what hid that. The table above carried them as a single row reading "the
direction differs" — rsvelte hoisting where official does not, and the reverse —
which is as far as a symptom key can go. Reducing each direction separately named
three independent causes, none of which explains the other two: a
`type T = $$Generic` alias name was not in the set of generics in scope on
`$$render`, so a type referencing it was hoisted to module scope where the name
does not exist; `$$Props` / `$$Slots` / `$$Events` were excluded from the hoist
candidates by an rsvelte-only rule, where upstream calls
`analyzeInstanceScriptNode` on every top-level node; and the lexical dependency
scan read the `title` of `({ title }: { title: string })` as a value reference,
so a prop of the same name blocked the hoist. **One row, three fixes, and the row
would have read as fixed after any one of them** — `photon`'s `Switch.svelte`
alone retires on the first.

Two divergences the reduction grid found that the corpus does not carry, recorded
so they are not rediscovered as new: a class name used as a *type* reference
blocks hoisting here and not upstream (`collectTypeDependencies` files a
`TypeReferenceNode` under `type_deps`, and a named props interface's `type_deps`
are checked only against `disallowed_types` and `interface_map` —
`isAllowedReference` never sees them); and an `interface $$Events` in a runes
component makes official emit `__sveltets_2_isomorphic_component` where rsvelte
emits `__sveltets_2_fn_component`. Both were measured on both arms of this fix
and are unchanged by it. Neither has a corpus witness: the sweep moved 3 of
33,901 units, and those three are exactly the entries dropped here.

### Previously: the comment-blind scans (2026-09-01, at 20 entries)

Kept because the finding is about the KEY, not about the entries, and both the
entries and the key are gone from the table above.

**The largest mechanism this table ever carried is gone, and the ten entries it
held are the ten this ratchet lost at 30 → 20.** The commented-out `<script>`, the
commented-out `dispatch(…)` and the commented-out `$store` were one class — a
scan that does not exclude code inside a comment, **10 of 30 entries, 33%**,
against a largest mechanism of 5 when the table was keyed by symptom. #4136
routed those scans through the parser's own comment-, string- and regex-aware
primitives. **The mapping from entry to mechanism was measured, not inferred from
the arithmetic:** diffing the two arms' output on each of the ten names its cause
— five drop an injected commented-out `<script>` body (9-128 lines), four drop an
event name that only a comment dispatches (`BulkEditorMergeView` goes from two
events to none), and `appwrite-console`'s
`databases/database-[database]/table-[table]/+layout.svelte` drops an extra
`$columnsOrder` store-get.

**Two of those rows could not be read off the first-differing-line key at all**,
which is why the table above is keyed by mechanism. Under the old key they read
`async () => {` against an `import` — an instance/module *statement order* defect
— and "store declarations emitted in a different order". Both read as orderings
and neither was one: the first is the commented-out `<script>`'s body injected at
the head of `$$render()`, which pushes the imports down, and the second is the
`$columnsOrder` declaration above. Running both implementations on the source is
what showed it; the differing line named neither cause.

It is the class the compiler side keeps rediscovering (#2986, #2987, #3127),
reached here through a different port, and **no gate compares the two ports** —
`compatibility/GATES.md#two-ports-inventory` row 6 carries it.

**Six rows were `output only`, and the count is not their size.** They were six
of twenty rather than six of thirty, and nothing about them had changed — a share
moves when the denominator does. The symptom-keyed table put 13 of those entries
in a "one entry each" tail, which is where a mechanism goes to look unimportant;
all such a count says is that nobody has reduced them yet.

### Wave-2 enrolment (#3176)

The list was **0** before the enrolment and all 139 entries come from one of the
67 new repositories. The 37 pre-existing *real-world* sources still contribute
zero, which is the same positive control the compiler ratchets report.
26 repositories contribute at least one; svelte-lexical (42) and
svelte-gantt (10) are the two largest contributors.

**The first baseline was 173 and was written from a macOS run; Linux CI reports
the set this file carries.** The 15 it dropped are 14 tiny
`sveltekit/packages/package/test/fixtures/…` components plus one carbon fixture,
all `ts-mismatch`, all passing on Linux — the two-sided ratchet is what surfaced
them. That platform split is **still live**: re-measuring on macOS after the
rebase reports those same 15 as NEW failures, which is the positive control that
the file here is the Linux set and not a local one. Read it as the same caveat
`fmt-known-failures.md` states for its own gate: **shrink this ratchet from a
Linux `corpus-compat.yml` run, not locally.**

The drop from 158 to 139 is the rebase onto `main` plus the fix for
`pattern/issues/3200-asi-reactive-block.svelte`: re-measuring removed **19
entries that already passed**, and the fix removed one more.

The drop from 139 to 125 removes 14 entries that the Linux full-corpus run
measured as passing after the import-preservation fixes: 13 from
svelte-tweakpane-ui and sveltepress's `GlobalLayout.svelte`.

The drop from 125 to 123 removes `chatgpt-web`'s `Home.svelte` and immich's
`VideoNativeViewer.svelte`, which the Linux full-corpus run measured as passing
after the parser fix.

The `ts-mismatch` clusters, keyed mechanically by the first differing line
(the classifier is the one in this file's history, not a hand review — it asks
what the differing line contains, in this order):

| n | class |
|---|---|
| 42 | rsvelte emits an **extra** `/*Ωignore_startΩ*/` region marker |
| 8 | rsvelte **omits** an `/*Ωignore_startΩ*/` marker official emits |
| 16 | `__sveltets_2_ensureType(String, Number, …)` — a text run's interior whitespace is collapsed |
| 17 | a CSS selector inside a JSDoc comment (` * .demo {`) is truncated |
| 38 | a tail, most of it one entry each |

The two marker clusters are the single largest cause and are one question —
**where a `/*Ωignore_*Ω*/` region begins and ends** — not two. Nothing here is
an oracle bug: the `oracle-invalid` classification (94 entries this run) already
carries those, and it is a pass, not a ratchet entry.

**Read that table as five buckets, not as five causes, and the reason is the key.**
`svelte2tsx-cluster.mjs:24` keys a cluster on `diffSignature` — the **first differing line**
after blank-line normalization. A first differing line names a *symptom*, and for a whole class
of defect it does not preserve the cause: a parser- or emitter-state leak surfaces at whichever
later construct happens to be affected, so one cause scatters across several signatures while two
unrelated causes with the same line shape fold into one. The row above where 42 and 8 are
hand-annotated as "one question" is that failure mode caught after the fact, not a property of
the key. The same key produced a wrong summary for the SCSS gate on 2026-08-30 — the divergence
there was written up from its first differing line as a `:not()`-selector rule and is actually a
parser-state leak that reaches every later slash list in the file — so treat this partition as a
starting hypothesis and re-derive the cause from the mechanism before sizing any work off it.

**And one number in it is a question that has not been asked.** The largest cluster is 42, and
`svelte-lexical` contributes exactly 42 of the 123 entries. Whether those are the same 42 decides
what the cluster means: one repository's one pattern (a single fix, and the "largest cause"
framing is an artifact of which repositories were enrolled) or a coincidence between an
emitter-wide defect and an unrelated concentration. The per-entry class is not stored anywhere —
`svelte2tsx-cluster.mjs` reads `compatibility/report-s2t.json`, which is regenerated per run and
not checked in — so answering it needs a corpus run, not a re-reading of this file. The
distribution over sources IS derivable from the ratchet and is: `svelte-lexical` 42,
`svelte-gantt` 10, `sveltekit` 8, `trakt-web` 7, `primo` 6, `svelte-inspect-value` 6, then 18
sources with 1–5 each, 24 in total.

Whoever picks this up should also read the Linux caveat above as a constraint on *what they can
measure*, not only on what they can commit: a local macOS run reports a different set, so it can
produce a classification but not a count.

### The 42-vs-42 question is answered, and the cluster is one question about `$name`

Measured 2026-08-31 on the 123 listed ids by running both implementations directly with the
options `svelte2tsx-compile.mjs` passes (`{filename, isTsFile, mode:'ts', namespace:'html',
version:'5'}`) and taking the first differing line after blank-line normalization. The bucket
sizes reproduce this file's own table exactly — 42 extra-marker, 8 missing-marker, 16
`ensureType` — which is the evidence that the *classification* is stable even though a macOS run
cannot be trusted for a count.

**They are not the same 42.** `svelte-lexical` contributes 42 entries and the extra-marker cluster
holds 42, but the intersection is **36**: six `svelte-lexical` entries are in the tail, and the
cluster's other six come from `svelte-inspect-value` (4), `sveltekit` (1) and `trakt-web` (1). So
it is neither one repository's pattern nor a coincidence — it is an emitter-wide defect that one
repository concentrates.

**And the marker is a symptom, not the cause.** In 41 of the 42, rsvelte emits a
`let $<name> = __sveltets_2_store_get(<name>);` declaration — inside the `/*Ωignore_startΩ*/`
region, which is why the region marker is what the first differing line shows — and **official
emits no `__sveltets_2_store_get` at all** in the same file. The question is therefore *when does
`$name` become a store subscription*, one level below the marker. Splitting the 41 by whether the
component is in runes mode and by where the `$name` text actually occurs:

| n | component | where `$name` occurs | example |
|---|---|---|---|
| 28 | runes | in code | `svelte-lexical/…/TypeAheadMenu.svelte` — `$getSelection`, `$isRangeSelection` imported from `lexical` |
| 9 | legacy | in code | `svelte-lexical/…/FontSizeDropDown.svelte` — same names, legacy component |
| 4 | runes | **only inside a string literal** | `svelte-inspect-value/…/+layout.svelte` — the only `$types` in the file is `from './$types.js'` |

The four string-literal cases are a scan reading a quoted import path, which the *compiler's* copy
of this decision already excludes (`2_analyze/store_subscriptions.rs` skips object keys, member
properties, string literals and comments). A fifth file, `trakt-web/…/Switch.svelte`, has its only
`$color` inside a `<style lang="scss">` block, where it is an SCSS variable. So this is another
instance of [`two-ports-inventory.md`](#two-ports-inventory)'s shape: the svelte2tsx port carries
its own answer to a question the compiler already answers, and no gate compares the two.

The runes rows are the larger half and the same family as #3127/#3128: in runes mode `$name` is
never a store subscription, and 32 of the 41 are components official reads as runes.



The former `pattern/issues/3200-asi-reactive-block.svelte` entry was removed when
[#3232](https://github.com/baseballyama/rsvelte/issues/3232) was fixed. The file is
a deliberately-unparseable compiler repro, but svelte2tsx now repairs its missing
ASI before re-parsing and applies the same script transforms as official.

The usual justified reason to add an entry is that **official svelte2tsx is buggy
and rsvelte is more correct** — matching the oracle would require reproducing a
crash, executing embedded scripts, or emitting malformed TSX. Such cases should be
fixed **upstream** (`sveltejs/language-tools`), never mirrored in rsvelte (that
would regress rsvelte's correct output). The verify script
(`scripts/compat-corpus/svelte2tsx-verify.mjs`) classifies these `oracle-invalid`
(a pass) only when the official side is broken AND rsvelte's side is valid
(oxfmt-parseable), so it never masks a real rsvelte bug.

Known upstream svelte2tsx bug classes (reference, should any resurface):

- **`</script  >` / `</style  >` (whitespace before `>`) not recognised.** The htmlx
  extraction regex requires no trailing whitespace, so the script/style is mis-emitted
  as a template element (invalid TSX). rsvelte extracts it correctly.
- **`<script>` inside an attribute value is executed.** Attribute strings are parsed
  as markup, so an embedded `<script>` (e.g. `href="</noscript><script>…</script>"`)
  is re-extracted as a top-level statement. Attribute values are not markup.
- **Crash on a valid `{#await p then x}` that shadows a top-level binding** — official
  throws `Cannot overwrite across a split point` (a MagicString range conflict); the
  component is valid and rsvelte produces valid TSX.
- **Garbage from table auto-close** — official leaks a `}` into a tag name
  (`createElement("}tr", …)`).
- **Malformed migrate output** — Svelte-4 migrate inputs produce unparseable TSX
  (e.g. `const st x = …`, inconsistent `props: {  }` spacing).

#### 2026-08-31 — one space, 90 files, and a gate that cannot see any of them

`ExportedNames.ts:476` writes the combined SvelteKit block as
`` `${kitType};${name} = __sveltets_2_any(${name});` `` — `kitType` already carries
its leading `: `, so the separator between the annotation and the widener is a
bare `;`. rsvelte spelled the same string as one format literal and put a space
after that `;`. Fixed.

The measurement is the point. Over all 33,776 corpus components, comparing the
**raw** `svelte2tsx` text of three implementations:

| | ids |
|---|---|
| output changed | 96 |
| …now byte-identical to official | **90** |
| …**regressed** | **0** |
| …differ from official before and after | 6 |

**86 of those 90 were not in this ratchet**, which is the finding: the gate
normalizes both trees with `oxfmt` before comparing (`svelte2tsx-verify.mjs:218`),
and oxfmt reprints `; data` and `;data` identically. So this divergence was
present in 90 real files and *structurally invisible* to the gate — no corpus size
reaches it, because the normalizer, not the population, is what hides it. The
other 6 carry a further raw difference that normalization also absorbs, and
re-running the gate's own normalization over all 96 confirms 0 gate-visible
regressions.

Recorded so the next person does not read a green gate as "the text agrees":
what this gate compares is the text *after* oxfmt, and whitespace inside a
statement is below its resolution.

#### 2026-08-31 — a `lang="ts"` script never reads the JSDoc above its `$props()`

Upstream reaches its whole JSDoc scan under `if (!this.isTsFile)`
(`ExportedNames.ts:242`), so in a TS file the `/** @type {Props} */` above a
`$props()` destructuring is never consulted and `createPropsStr` runs, emitting
`;type $$ComponentProps = { … };`. rsvelte read `jsdoc_type` regardless of the
language, took the JS branch, and emitted **nothing** — so the props return type
loses the author's shape entirely.

Corpus differential over all 33,776 components: **4 outputs change, 4 become
byte-identical to official, 0 regress**, and all four are ratchet entries.
Re-running the gate's own normalization over the 70 ratchet ids moves the
already-matching count 30 → 34 with 0 gate-visible regressions.

The control is the same source as JavaScript: it must keep the JSDoc and emit no
alias. Both arms are pinned in
`crates/rsvelte_projection/tests/svelte2tsx_ts_props_ignores_jsdoc.rs`; dropping
the `!is_ts` guard turns the TS arm red and leaves the JS arm green.

<a id="svelte2tsx-unparseable-known-failures"></a>

## svelte2tsx-unparseable-known-failures.json — why entries are accepted

rsvelte emitting TSX that no TypeScript parser accepts, while official's output for
the same source parses. Kept apart from `svelte2tsx-known-failures.json` for the
reason the compiler-error gates keep `start` and `end` apart: **a ratchet entry
suppresses everything its key cannot tell apart**, and this file's ids were already
listed there as ordinary `ts-mismatch` entries, so a newly unparseable output on any
of them would have been scored green.

The gate had only the mirror question. `oracle-invalid` asks whether OFFICIAL's
output is unparseable while rsvelte's parses (a pass, because there is no valid
target to match); the opposite direction had no name, so it had no ratchet. The
`oracle-invalid` test already computed both sides' parseability and discarded one of
the two answers, so the new verdict costs no extra work.

**Current baseline: `svelte2tsx-unparseable-known-failures.json`, 0 entries.**

The ratchet is empty, so any output rsvelte emits that no TS parser accepts — while
official's parses — fails CI.

Partition of `svelte2tsx-unparseable-known-failures.json` by mechanism: `0`

### Previously: a `//` comment swallowed the props typedef

`svelte-virtuallists/src/lib/VirtualListNew.svelte` emitted
`// ====== PROPERTIES ================;type $$ComponentProps =  {` on one line, so the
line comment ran to the end of the line and took the declaration with it. Upstream
inserts that typedef at `node.parent.pos`, and TypeScript's `pos` spans the
declaration's LEADING TRIVIA, so official's insertion lands before the comment
(`};type $$ComponentProps =  {`). rsvelte walked back from the `const` keyword instead,
and only one of the three branches that compute this offset walked back through
comments — the other two stopped at whitespace.

Two things about the entry as it was written. It said official emits no
`$$ComponentProps` for this source at all, and that is wrong: both tools emit it and
only the offset differed, so there was one defect here rather than two. And its
"not reduced" note was right about the reduction while wrong about why — a
hand-written probe reproduces nothing because the axis it was missing is
`generics=`, which is what makes this offset reachable at all (without it the typedef
is hoisted out of `$$render` and none of the three branches runs). Delta-debugging
the real file from 690 lines to 34 is what surfaced it.

The two entries this file did NOT need are the reason it exists. Both were one
mechanism: an element carrying `slot=` inside a component went through a second
attribute emitter, which wrote a `use:` action as an entry *inside* the props object
(`Expected function body`) and a transition as
`__sveltets_2_ensureTransition(f)(tag, {})`. Routing named-slot elements through
`build_directive_prefix_suffix` fixed both, and a third and fourth consequence of the
same duplication with them (`$$action_N` block scoping, and `tabindex="0"` emitted as
a template literal where `svelte/elements` types it `number`).


<a id="svelte2tsx-map-known-failures"></a>

## svelte2tsx-map-known-failures.json — why entries are accepted

The svelte2tsx **source-map** gate (`scripts/compat-corpus/svelte2tsx-verify.mjs`,
invariants in `scripts/compat-corpus/sourcemap.mjs`) checks the `mappings` string
rsvelte's svelte2tsx port returns for every component corpus entry. The ratchet
may only shrink.

**Current baseline: `svelte2tsx-map-known-failures.json`, 0 entries.**

The two `map-missing` entries enrolled by wave 2 (#3176), `chatgpt-web`'s
`Home.svelte` and immich's `VideoNativeViewer.svelte`, now pass after the parser
fix and were removed together with their stale TSX baseline entries.
`map-invalid` remains **0** — no map rsvelte emits violates an invariant.

### Why this gate is structural rather than a diff against official

The other svelte2tsx ratchet compares TSX text to official `svelte2tsx`
byte-for-byte. The map cannot be compared that way. Both tools emit hires maps,
but magic-string segments its output differently — it adds chunk-boundary
segments, omits trailing empty generated lines, and splits runs at edit
boundaries rsvelte does not. The two maps therefore disagree entry-for-entry,
and not only cosmetically: they also answer `originalPositionFor` differently at
some generated positions.

Measured parity, where **13,464** is every corpus component for which *both*
tools return a map:

| Rule | Entries identical |
|---|---|
| `mappings` byte-identical | 0 of 13,464 |
| decoded segment sets identical | 0 of 13,464 |
| `originalPositionFor` identical at every generated position | 0 of a 245-component sample |
| per-generated-line set of referenced original lines identical | 4 of the same 245 |

A parity ratchet would therefore start at ~100% of the corpus and gate nothing.

**So this gate does not assert that the two maps agree.** It asserts that
rsvelte's map is structurally well-formed against the text it describes, using
the official map only as a **calibration oracle**: an invariant magic-string
itself violates is by definition too strict and does not belong in the set.
Official is clean on every entry. An entry where official *does* violate an
invariant is classified `map-oracle-invalid` and skipped, so an upstream change
can never be reported as an rsvelte failure.

### The invariants

- `undecodable` — `mappings` is not valid VLQ, or a segment has an unexpected
  field count (svelte2tsx never emits `names`).
- `extra-mapping-lines` — more mapping lines than the generated file has.
- `columns-not-sorted` — generated columns must be non-decreasing within a line.
- `copy-run-stalled` — **three or more** consecutive segments at one generated
  column whose original columns advance by `+1` each step on the same original
  line. This is the invariant that catches issue #2066, where every
  generated-column delta was zero so whole copied runs collapsed onto column 0.
  Both bounds are load-bearing and were measured, not guessed:
  - Only `+1` steps count. A *larger* original jump at an unchanged generated
    column is legitimate — deleted text (e.g. a hoisted `import`) collapses onto
    the surviving position — and occurs in ~48% of real corpus entries.
  - Runs of two are legitimate: the closing boundary of one chunk and the opening
    boundary of the next meet at one generated column when a single character
    between them is deleted (`$: (` → `let `). Flagging pairs produced 7
    false positives across the corpus; requiring three produces **0**.

  This rule fires on none of the **13,465** components for which rsvelte returns
  a map — the 13,464 above plus the one entry where official crashes internally
  and rsvelte does not. Reverting the #2066 fix in `magic_string.rs` and
  recompiling the 81 `pattern/` components flags 67 of them; simulating the same
  bug corpus-wide — zeroing every generated-column
  delta — flags 12,563 of the **13,352** components whose map has at least one
  generated line carrying two or more segments (the rest are too small for the
  bug to be observable). The gate therefore fails loudly, not marginally, if the
  bug returns.
- `generated-out-of-bounds` / `original-line-out-of-bounds` /
  `original-column-out-of-bounds` — every position must lie inside the text it
  refers to, in UTF-16 code units.

### What would justify an entry

Only a case where rsvelte's map is **correct and the invariant is wrong** — i.e.
official svelte2tsx produces a structurally analogous map for the same input and
is merely not caught by the same rule. Such a case means the invariant needs
narrowing (as `copy-run-stalled` was narrowed to `+1` steps), not that the entry
should be tolerated. A genuinely malformed map is always a bug to fix in
`crates/rsvelte_projection/src/svelte2tsx/magic_string.rs`, never a baseline
entry.

<a id="validator-known-failures"></a>

## validator-known-failures.json — why entries are accepted

`crates/rsvelte_core/tests/validator.rs` asserts full upstream parity per
fixture — warning `code`/`message`/`start`/`end` and error `start`/`end` — instead
of only comparing diagnostic counts, mirroring what
`packages/svelte/tests/validator/test.ts` checks. The ratchet is shrink-only in
**both** directions: a new failure fails the run, and so does a listed entry that
already passes, so an entry that starts passing must be removed by the change
that made it pass.

"Not failing" is **two** states and the suite separates them: a listed entry that
ran and passed is stale (delete it), while a listed entry that names no runnable
fixture is *unmeasured* — the fixture was renamed, deleted or started being
skipped — and deleting it would bury whatever removed the fixture. Both are fatal;
only the first invites a re-baseline.

**If you are here because `test_validator` failed and you were not working on a
ratchet:** the list is empty, so a failure now means a *new* divergence — the
honest fix is the diagnostic, not the baseline. Re-run the suite and read the
fixture it names; never hand-edit a count to match.

### Current baseline: `validator-known-failures.json`, 0 entries — 0 divergences

All 332 runnable validator fixtures match upstream on code, message and position,
for both errors and warnings.

Partition of `validator-known-failures.json` by cluster: `0`

The three clusters this doc used to carry — error spans not populated (141),
warning span-only (30), warning content (1) — are all gone; there is no
population left to partition.

Three structural notes, so the empty state is not accidentally undone:

- **Diagnostics carry their own span.** The constructors in
  `2_analyze/errors.rs` / `2_analyze/warnings.rs` build a span-less diagnostic and
  each raising site attaches the range with `AnalysisError::at(start, end)` /
  `AnalysisWarning::at(start, end)`. Take the node upstream passes to its `e.*` /
  `w.*` constructor — frequently a sibling attribute or a child, not the node the
  enclosing visitor is looking at. `regular_element.rs` still back-fills a11y
  warnings with the element's span, but only as the fallback for the warnings
  upstream really does attribute to the element.

- **Emission order is asserted.** The gate zips actual against expected, so two
  diagnostics on one fixture must be emitted in upstream's order. This is why
  `unknown_code` / `legacy_code` are emitted from the per-node loop in
  `visitors/shared/fragment.rs` rather than up front.

- **The harness passes no `filename`.** Upstream's `test.ts` passes only
  `generate` plus the sample's own options, so `svelte_self_deprecated` must see
  the unset-filename sentinel and report `Self` / `Self.svelte`. Module-ness
  therefore cannot be inferred from a `.svelte.(js|ts)` filename here;
  `compile_module` sets `CompileOptions::is_module_source` instead, mirroring
  upstream's separate `analyze_module` entry point.

### What the previous baselines recorded

Kept because each item is a place where a ratchet entry was absorbing something
other than what it claimed — the failure mode to watch for if this file ever
grows again:

- `unknown-code` was listed under *warning span-only*, whose stated property is
  that code and message match. Under the ordered comparison the suite performs,
  they did not. The entry had been absorbing an ordering bug described as a span
  bug — and the promised span fix would not have cleared it.
- `a11y-anchor-in-svg-is-valid` appeared in no cluster's list at all, so the
  wrong-attribute bug behind it had no justification of any kind.
- `invalid-node-placement-5` and `module-script-reactive-declaration` were cited
  as examples of the *error-span* cluster **and** given wording bullets under the
  *content* cluster, while the counts summed to the baseline as if each entry
  were counted once. That is exactly what the partition line above now fails on.
- Of the 26 entries removed when the 198-entry baseline was re-measured, 3 —
  `a11y-alt-text`, `a11y-aria-role` and
  `a11y-no-noninteractive-element-to-interactive-role` — were named nowhere in
  the doc, so nothing recorded why they had been accepted.

<a id="validator-message-known-failures"></a>

## Validator warning message known failures

Shrink-only ratchet for `compatibility/validator-message-known-failures.json`, enforced by
`validator_warning_messages_match_official` in `crates/rsvelte_core/tests/validator.rs`.

It compares the **rendered text** of every warning whose code and ordinal already agree with
official, and is deliberately independent of `validator-known-failures.json`.

### Why a separate ratchet

`validator-known-failures.json` is per-fixture and all-or-nothing. Once a fixture is listed —
almost always because a span is missing — it stops being watched for its **message text** too.
Both entries this ratchet was created for were suppressed that way, and `attribute_quoted`
shipped a message asserting the warning applies to plain elements, which it never does
(#2391).

The generalisation is the point: **an entry suppresses everything about itself, not the thing
its justification names.** A justification should therefore say what the entry *stops
covering*, not only why it fails.

Nothing else covers this. `DIAGNOSTICS_DIGEST` in `2_analyze/diagnostics_test.rs` pins every
diagnostic's code and message, but it calls each constructor with **fixed placeholder
arguments** and its failure text asks a human to confirm the new wording — so the oracle is a
person and the unit is the template. It detects *change*, not *incorrectness*, and an
interpolation bug is invisible to it because the interpolated value is a placeholder.

### The oracle: "official run on this input", never "the official expectation"

The comparison uses the **generated** fixture — `fixtures/*/validator/<name>/warnings.json`,
produced by running the official compiler on the identical input — and **not** the sample's
checked-in `submodules/svelte/.../warnings.json`.

Upstream committed those files under a different `filename` than this harness passes. Any
message that interpolates the filename therefore disagrees with them spuriously: measured
against the checked-in file, `svelte-self-deprecated` looks like `Self`/`./Self.svelte` vs
`Input`/`./Input.svelte` — a bug that does not exist — instead of the real path-capitalisation
bug below. Diagnosing a real defect as a different defect is worse than a false positive,
because the wrong fix earns a green tick.

This bites message comparison specifically: codes and positions do not depend on the input's
*name*, which is why no earlier gate hit it. The corpus warning gate is immune by
construction — it runs both compilers on the same source in the same process. **A fixture-side
gate has to reproduce that property deliberately**, which is the whole reason this test reads
the generated tree rather than the sample directory.

### Current baseline: `validator-message-known-failures.json`, 0 entries

Empty. Every fixture matches upstream's rendered warning text. Both entries this ratchet was
created with are fixed:

- `a11y-anchor-in-svg-is-valid` — `a11y_invalid_attribute` named `href` where the source
  spells it `xlink:href`, sending the reader to fix an attribute that is not there (#2413,
  fixed by #2451).
- `svelte-self-deprecated` — the suggested self-import path was capitalised, so following the
  suggestion breaks the build on a case-sensitive filesystem (#2411, fixed by #2477).

Keep it empty: a new entry means a message regression, and the honest fix is the format
string, not the baseline.

### "No longer diverging" is two states, and one of them is a regression

The comparison only runs where codes and counts already agree, so an entry stops appearing in
`diverged` under two conditions that used to be reported with identical wording: its message
was fixed, or its **codes/counts regressed** and it never reached the text comparison at all.
Deleting an entry for the second reason permanently hides the regression that caused it.

The test therefore separates them. A listed entry that stops diverging fails as *"now match —
remove them"* only if it was actually **compared**; otherwise it fails as *"no longer reach the
message comparison … this is a REGRESSION, not a fix"*, naming the cause. The set of causes and
the ratchet for fixtures that legitimately leave the comparison are in
[`validator-message-not-comparable.md`](#validator-message-not-comparable).

### Removing an entry

Fix the message, then delete the id here and in the `.json`. The ratchet is two-sided: a listed
entry that starts matching fails the suite just as a new divergence does, so the fix and the
re-baseline land in the same PR. If the suite says the entry is *no longer comparable*, do not
delete it — that verdict is a regression report, and the entry is the only thing still naming
the fixture.

<a id="validator-message-not-comparable"></a>

## Validator fixtures excluded from the warning-message comparison

Shrink-only ratchet for `compatibility/validator-message-not-comparable.json`, enforced by
`validator_warning_messages_match_official` in `crates/rsvelte_core/tests/validator.rs`.

It does not list *divergences* — those live in `validator-message-known-failures.json`. It
lists fixtures the message comparison **never reaches**, which is a third state, and the one
the gate used to be unable to name.

### Why a third state exists

The message comparison only runs where the two sides already agree on which warnings were
emitted; codes, counts and spans are `validator-known-failures.json`'s business. So a fixture
leaves the comparison whenever anything upstream of the text disagrees — and before this
ratchet existed, leaving was indistinguishable from passing:

- a listed entry that starts matching drops out of `diverged`, which is the intended signal;
- a listed entry whose **codes or counts regress** never reaches the text comparison, so it
  also drops out of `diverged`, and was reported with the identical wording.

Acting on the second as if it were the first deletes the entry and permanently hides the
regression that caused it. The test now reports the two separately: a listed entry that stops
diverging fails as `now match — remove them` only when it was **compared**, and as
`no longer reach the message comparison … this is a REGRESSION, not a fix` otherwise.

### The taxonomy, and which half needs an entry here

`NotComparable` (`validator.rs`) records exactly why each fixture dropped out. Three causes are
**structural** — properties of the fixture rather than of rsvelte — and need no entry:

| cause | meaning |
|---|---|
| `OptedOut` | upstream's `_config.js` sets `skip: true` or a `warningFilter` |
| `NoInput` | the sample carries no readable `input.svelte(.js)` |
| `BothRejected` | official rejects the input and so does rsvelte — there are no warnings on either side |

The remaining six are rsvelte divergences that *also* silently remove the fixture from this
gate, and each one must be listed here with a justification:

| cause | meaning |
|---|---|
| `NoOracle` | no generated `warnings.json` — the official run left no oracle |
| `Panicked` | rsvelte panicked while compiling |
| `RsvelteRejected` | rsvelte rejects an input official accepts |
| `RsvelteAccepted` | rsvelte accepts an input official rejects |
| `CountDiffers` | the two sides emit a different number of warnings |
| `CodesDiffer` | the two sides emit different codes, or in a different order |

The point of requiring a declaration is that the last four are already covered by
`test_validator`, whose ratchet is empty. Adding an entry to
`validator-known-failures.json` therefore has a **second** cost that was invisible: the fixture
stops being watched for message text too. This file is where that cost has to be written down.

### Current baseline: `validator-message-not-comparable.json`, 0 entries

Empty, and empty is the load-bearing state: with `validator-known-failures.json` also at 0,
every runnable fixture either reaches the message comparison or falls into one of the three
structural causes. A single non-structural drop-out fails the suite.

Raw counts are printed on every run (`fixture(s) compared`, `message(s) compared`, and a
per-cause histogram of the non-comparable set) because a rate cannot distinguish "no
divergences" from "no comparisons".

### Removing an entry

Fix the cause, then delete the id here and in the `.json`. The ratchet is two-sided: an entry
that becomes comparable again fails the suite just as an undeclared drop-out does.

<a id="warning-known-failures"></a>

## Warning-parity known failures

Companion to `known-failures.md`, for the **warning** half of the corpus gate.

`scripts/compat-corpus/compile.mjs` records every compiler warning as
`(code, line, column)` in `warnings.json` beside the output; `verify.mjs`
compares them and ratchets two failure modes independently. Both ratchets are
shrink-only: an entry not listed here that diverges fails CI.

Regenerate after a change that moves warnings:

```
node scripts/compat-corpus/verify.mjs --no-fmt --update-warning-baseline
```

`--update-warning-baseline` touches **only** these files, never the output
ratchets — warning comparison needs no oxfmt normalization, so it is valid under
`--no-fmt`, which the output comparison is not.

### Why this gate exists

It did not exist until #2281, and its absence was measured, not assumed. The
corpus compiled every entry with both compilers and then **discarded
`result.warnings`**, so a warning divergence scored `MATCH` no matter how large
the corpus grew.

The proof was a corpus entry, not a constructed one:
`layerchart/docs/src/routes/+layout.svelte` carries a `// svelte-ignore
state_referenced_locally` before an object-literal property. rsvelte did not
honour it (#2256) and emitted a warning upstream does not — and the gate
reported that entry as passing. Adding this comparison turns the entire existing
corpus into a warning-parity gate at essentially zero marginal cost, since both
compilers already run on every entry.

### Why the four per-target files are currently identical

`warning-known-failures.<target>.json` holds 0 entries on all four,
and `warning-position-known-failures.<target>.json` 0 entries on all four. That is not a
bug in the partitioning — almost every warning is produced in Phase 1/2 (parse
and analyze), before the target is consulted, so a divergence shows up on all
four targets at once. Only target-specific codes (`node_invalid_placement_ssr`
and friends) can ever differ, and none of those diverge today.

The split is kept anyway: it costs nothing in code, matches the output ratchets,
and stays sensitive to an entry that starts diverging on a second target while
already listed for the first. Expect all eight files to move together in a
burn-down PR.

### Warning codes (`warning-known-failures.<target>.json`, 0 entries each)

The multiset of warning **codes** differs: rsvelte warns where upstream does
not, or stays silent where upstream warns. This is a semantic bug — a user sees
noise they cannot suppress, or misses a diagnostic they should have seen.

**All four files are empty.** The last two entries were one source file reached
through two corpus sources
(`svelte.dev/apps/svelte.dev/content/docs/svelte/03-template-syntax/11-declaration-tags.md/2.svelte`
and `svelte/documentation/docs/03-template-syntax/11-declaration-tags.md/2.svelte`)
emitting `state_referenced_locally` where upstream does not; the Linux CI run
behind this baseline scores both as matching on all four targets. An empty
ratchet is not the claim that warning codes agree everywhere — it is the claim
that they agree on every source the corpus holds.

Partition of `warning-known-failures.<target>.json` by direction: `0`

**73 of the 83 pre-existing entries arrived with the wave-2 enrolment (#3176)**,
which took the corpus from 37 corpus sources to 104. The remaining per-code
incidences total 81 across 80 entries (one entry differs on two codes):
`css_unused_selector` 48, `state_referenced_locally` 20,
`non_reactive_update` 8, `component_name_lowercase` 1,
`a11y_consider_explicit_label` 4. `css_unused_selector` is half the file and the
burn-down target; it is the one that is neither over- nor under-warning in a
fixed direction — it is a pruning disagreement, so it moves with the CSS entries
in [`known-failures.md`](#known-failures).

The two template-expression class fixtures that used to diverge now reach the
same `perf_avoid_nested_class` check as script classes. The template expression
walker previously discarded `ClassDeclaration` statements before the regular
class visitor could see them; its relative function depth is now mapped onto
the component scope depth used by upstream.

The instance-script visitor now starts from the instance scope built in phase
1 rather than the module/root scope. This restores the missing
`state_referenced_locally` warning when an instance prop shadows a same-named
module export, as in melt-ui's `motion.svelte`.

The `state_referenced_locally` eligibility check now agrees with upstream
`should_proxy` for logical and conditional `$state` initializers. Those
expressions can produce proxyable values, so LayerChart's two later reads of a
state initialized with `selected ?? fallback` no longer produce noise.

The file was 171 entries before this branch was rebased onto `main`, and this is
the second re-measurement against a moving `main`: the first removed **81 and
added none**, all of them `reactive_declaration_module_script_dependency` (the
code that used to head the list at 83 entries and is now absent from it
entirely), and the second removed a further **2**, taking
`options_missing_custom_element` to 0 and `a11y_consider_explicit_label` from 5
to 4. Neither is this branch's fix; the entries had simply never been
re-measured against a tree that carried them.

The `options_missing_custom_element` under-warning that used to sit in the first
half is gone, and it was one condition rather than a missing pass:
`<svelte:options customElement={null} />` is skipped by `read_options` *before*
it sets `component_options.customElement`, but upstream's analyze loop keys on
the attribute **name**, so it still warns. rsvelte keyed on the parsed option and
so stayed silent — and the entry that reproduced it,
`runtime-browser/custom-elements-samples/$$slot-dynamic-content/main.svelte`, is
the corpus's only file with that spelling. It is inlined as a test in
`crates/rsvelte_core/tests/svelte_options_deprecations.rs`, so the shape keeps a
guard now that the ratchet no longer holds it.

Four entries left in #3027, and they are one cause in both directions: phase 2's
`UpdateExpression` visitor never walked its argument, so `x++` recorded no
reference to `x`. Three legacy components whose only use of a prop was `p++` were
reported `export_let_unused` (5 tuples), and `runtime-runes/derived-unowned-12`,
whose only read of a `$derived` is `linked.current++`, was **missing** the
`state_referenced_locally` upstream raises — the same omission over- and
under-warning at once, which is why the two directions moved together.

Three earlier under-warnings were the whole of the
`a11y_no_static_element_interactions` cluster
(`runtime-legacy/samples/dynamic-element-{event-handler1,event-handler2,pass-props}`),
removed by #2523: the a11y pass had no call site in `svelte_element.rs`, so
**every** element a11y rule was absent on `<svelte:element>`. The corpus saw only
this one code because it holds so few dynamic elements with an a11y-relevant
shape — the class was far wider than the three entries, which is why the fix
lands its own gate rather than relying on this ratchet to have measured it.

The six `component_name_lowercase` over-warnings are fixed by #3361. Their
lowercase component references resolved to a later declaration, but the
analysis visitor made the warning decision before reaching that declaration;
the pre-analysis scope graph now supplies the binding first, matching upstream.

The **`reactive_declaration_module_script_dependency` over-warning** that used to
head this list is gone, and its 62 tuples were one predicate, not the "migrate
fixtures" story the clustering suggested. Upstream's rule is
`binding.scope === analysis.module.scope && binding.reassigned` inside a `$:`
statement, and it declares the synthetic `$store` subscription binding in
`instance.scope` (`2-analyze/index.js`), so a store auto-subscription can never
satisfy it. rsvelte parks that synthetic binding in scope 0 alongside the real
module-script declarations, so **every** `$: $store = …` warned. That took 12
entries off this ratchet — 8 of them real-world files (`layercake`,
`svelte-form-builder`, four `svelte-ux` components, `svelthree`), which is why
"concentrated in the migrate fixtures" was the wrong read: the fixtures were
merely where the entries were counted from.

The `svelte_self_deprecated` half of the old cluster is fixed: the warning is
gated on `analysis.runes` upstream, and rsvelte emitted it in legacy mode too,
where `<svelte:self>` is the supported spelling. That removed 19 entries from
each of the three files, verified per entry against official 5.56.8 on all three
targets.

`attribute_quoted` was burned down independently: 19 further entries — the two
burn-downs together take the ratchet from 70 to 28 — four of the entries needed
both fixes, so neither burn-down could remove them alone — with **0 remaining tuples
in either direction**. Both counts are read off
`verify.mjs --no-fmt --update-warning-baseline` runs over the same 14,130-entry
corpus, not off the issue that motivated the fix. It was **one
predicate**, not the SVG-namespace story this file previously recorded: upstream
reaches the check only through `validate_attribute`, and both callers guard it
with `analysis.runes`, so legacy components never warn. rsvelte ran it
unconditionally at all four emission sites. The earlier description was inferred
from where the entries happened to cluster in the corpus rather than from
upstream's control flow — worth remembering when reading the clusters above,
which were written the same way.

### Warning positions (`warning-position-known-failures.<target>.json`, 0 entries each)

The codes agree but a `(line, column)` does not. **No entry remains.**

The last one — `svelte/…/migrate/samples/accessors/output.svelte`, code
`options_deprecated_immutable`, rsvelte reporting **no position at all** (`?:?`)
— was the `<svelte:options>` reader, the one emission site the span-attachment
pass never reached. Reading the whole of upstream's loop rather than attaching a
span at the one site turned out to matter: the warning was raised from a
per-option `if`, and upstream raises all three `<svelte:options>` diagnostics
from a single walk of `root.options.attributes`, which is also what fixes their
**order** (source order of the attributes, not the order the checks are written
in) and what makes `options_deprecated_accessors` fire at all. **An empty
ratchet makes "no worse than last time" a zero-information bar here** — the
guards are the pinned `(code, line, column)` triples in
`crates/rsvelte_core/tests/svelte_options_deprecations.rs`.

The three `attribute_avoid_is` entries were the same shape and are fixed:
upstream passes the attribute node (`2-analyze/visitors/shared/element.js`), and
the emission site in `2_analyze/visitors/shared/element.rs` already had
`attr_start`/`attr_end` in hand from the enclosing attribute loop — the two
neighbouring warnings raised from that same loop were already spanned.

#### How the backlog was cleared

This ratchet held **528** entries per target and now holds none. Two systemic causes
were measured over the 625 entries listed before the a11y half was fixed, which
carried 967 mismatching tuples between them:

- **No span at all (649 tuples, 67.1%)** — rsvelte emitted the warning with
  `start === undefined` where upstream reports a real position, so an editor or
  CLI that places a squiggle from `warning.start` got nothing. Concentrated in
  `event_directive_deprecated` (142), `element_invalid_self_closing_tag` (118),
  `export_let_unused` (110), `non_reactive_update` (102) and
  `options_missing_custom_element` (53). "Attach the span already available at
  the emission site" describes only part of it — see the three causes below.
- **A span that is real but too wide (318 tuples, 32.9%)** — every one an a11y
  code, and every one a *column*-only disagreement: 315 column-only, 3
  line-and-column, and **0 line-only**. The line agreed because the attribute and
  its element are on the same line; the column disagreed because rsvelte reported
  the element where upstream reports the attribute. Not "attach the missing
  span": the span was attached, by the wrong owner.

**The discriminator, for the next mixed position bucket:** count line-only
mismatches. A bucket with *zero* of them is a wrong-**owner** bucket, not a
missing-span one — if two candidate nodes sit on the same line (an attribute and
its element always do), only the column can move, so a span attached to the
wrong node produces column-only disagreements and nothing else. That test is
geometric and costs one pass over the tuples; it does not require reading any
entries, and it is what separated these two causes. Reach for it before
inspecting cases.

Split from the code ratchet on purpose: this backlog was far larger, and folded
together it would have hidden every semantic regression above.

#### The a11y half

Fixing it took the list from 625 entries to **529**: 96 removed, 0 added, and the
code ratchet unmoved at 70.

`2_analyze/visitors/regular_element.rs` stamped `element.start`/`element.end` on
any a11y warning that arrived spanless, and `shared/a11y/mod.rs` pushed *every*
warning spanless — so the element fallback won even for the warnings upstream
attaches to an attribute. Of the 17 warn sites inside `a11y/index.js`'s first
attribute loop (`:108`-`:287`), 14 pass `attribute` and exactly three pass
`node`. The fix gives each attribute-scoped warning its attribute's
span at the point it is raised, leaving the element fallback to cover only the
three codes upstream genuinely scopes to the element
(`a11y_interactive_supports_focus`,
`a11y_no_interactive_element_to_noninteractive_role`,
`a11y_no_noninteractive_element_to_interactive_role`).

Codes cleared, summing to all 317 (`120 + 59 + 41 + 24 + 24 + 20 + 10 + 4 + 3 +
3 + 2 + 7x1`): `a11y_role_supports_aria_props` 120,
`a11y_role_supports_aria_props_implicit` 59, `a11y_no_redundant_roles` 41,
`a11y_no_abstract_role` 24, the `a11y_incorrect_aria_attribute_type*` family 24
(boolean 6, tokenlist 5, integer 4, token 4, bare 3, tristate 2),
`a11y_invalid_attribute` 20, `a11y_autofocus` 10,
`a11y_role_has_required_aria_props` 4, `a11y_autocomplete_valid` 3,
`a11y_misplaced_scope` 3, `a11y_unknown_role` 2, and one tuple each of
`a11y_aria_activedescendant_has_tabindex`, `a11y_unknown_aria_attribute`,
`a11y_aria_attributes`, `a11y_misplaced_role`, `a11y_hidden`, `a11y_accesskey`
and `a11y_positive_tabindex` (seven codes).

The tail matters for a reason beyond bookkeeping: an earlier draft of this list
stopped at the counts of 3 and reported the type family as 22 rather than 24,
so it summed to 306 against a measured 317. A list that reads as exhaustive and
is not is the same defect as a cause inferred from a code name — **state the
sum, or say the list is partial.**

Note that `a11y_role_supports_aria_props` was previously listed above as a
missing-position code. It never was: rsvelte always emitted a span for it. That
mis-attribution is exactly what a single-cause reading of this bucket produces —
the split above was measured per tuple, not inferred from the code names.

A single `a11y_figcaption_index` disagreeing on **both** line and column used to
sit beside them, recorded here as a third cause that was "structurally out of
reach rather than merely unobserved": upstream raises it at `:532`, outside both
attribute loops, on `children[index]`, so none of the four stamp sites can see it
and `stamp_attribute` skips anything that already carries a span. It was noted
that the argument held "regardless of what any run showed".

**The argument was sound and the conclusion was wrong** (#2490). Every step about
the stamp sites was true; what did not follow is that the span was therefore
unreachable. The fix does not stamp at all — it constructs the warning with
`children[idx]`'s span at the emission site, which is what upstream does
(`w.a11y_figcaption_index(children[index])`), and the caller's element fallback
then leaves it alone. The reasoning enumerated the repair mechanisms that exist
today and mistook that for the set of mechanisms available. An "out of reach"
claim needs the second half stated: out of reach *of what*, and why no new
emission site may be added.

#### "One systemic cause" was a hypothesis, and it was wrong

The five codes that dominated the missing-span half — `event_directive_deprecated`
(142 tuples), `element_invalid_self_closing_tag` (118), `export_let_unused`
(110), `non_reactive_update` (102), `options_missing_custom_element` (53), 525
of 649 between them — looked like one bug because they shared one *symptom*.
They had **three** different causes:

- **The visitor already holds the warn target.** `element_invalid_self_closing_tag`
  and `event_directive_deprecated` had `element` / `on` in scope and simply did
  not pass them. This is the only one of the three for which "attach the span
  already available at the emission site" is an accurate description.
- **The visitor holds the wrong node.** Upstream warns
  `options_missing_custom_element` on the `customElement` **attribute**
  (`index.js:692`), while the analysis holds `<svelte:options>`. Attaching what
  was in hand would have produced a plausible span pointing at the wrong thing —
  the same failure as the a11y element-vs-attribute bucket, which is how that
  bucket got misfiled as a missing-span one.
- **The target is not a node in the tree at all.** `non_reactive_update` and
  `export_let_unused` warn on `binding.node`, the declaration identifier, and
  the binding records only `declaration_start`. The end has to be reconstructed
  from the name's byte length, which is a data-availability problem rather than
  a plumbing one.

**Where to look, not just what to doubt:** the earlier reading grouped by
*symptom* (`start === undefined`), which is downstream of all three mechanisms
and therefore cannot separate them at all. What splits them is the warn
**target** — the *input* to the diagnostic rather than its output. Look up each
code's upstream warn node before writing one fix for several codes. Reach for
this and the line-only test above *before* reading entries.

**These spans have no gate but their unit tests.** The ratchet compares one
`(code, line, column)` per warning, so `end` is not observable by it at all, and
neither is the message text at per-message granularity — `diagnostics_test.rs`
pins every diagnostic's wording behind a single digest, which reports that
*something* changed without saying what to, or whether the new text is right.
Where a gate is blind to a field by construction, the unit test is not a
convenience; it is the only oracle (`tests/warning_span_attach.rs`).

**On column units, so the tests are not read as settling more than they do:**
columns are UTF-16 code units on both sides, matching upstream's locator over a
JS string. A BMP identifier such as `プロップ` cannot show this — a `char` count
and a UTF-16 count agree everywhere in the BMP — so it pins only byte-`end`
against column. The astral case (`𝕏`, U+1D54F: 1 char, 2 UTF-16 units, 4 bytes)
is what separates them, and rsvelte already agrees with upstream at 19-21 there.
Both are pinned, separately and under names that say which.

`perf_avoid_nested_class` was the first of these to be burned down (#2349),
and it cost two entries rather than the one the `runed` / `svelte-toolbelt`
enrolment attributed: alongside `is-document-visible.test.svelte.ts` it also
cleared `svelte/…/validator/samples/inline-new-class-2/input.svelte`, which no
issue named because the corpus reports counts rather than per-code attribution.
Expect the same when other codes in the list above are fixed — read the movement
off a full run, do not predict it from the issue that motivated the fix.

<a id="warning-message-known-failures"></a>

## warning-message-known-failures.\<target\>.json — why entries are accepted

`scripts/compat-corpus/verify.mjs` compares each corpus entry's compiler warnings
against the official compiler in three dimensions, as a cascade — each reached only
when the one above it already agrees:

| dimension | ratchet | what a failure means |
|---|---|---|
| code | `warning-known-failures.<target>.json` | rsvelte warns where upstream does not, or is silent where it warns |
| position | `warning-position-known-failures.<target>.json` | codes agree, `(line, column)` does not |
| **message** | **`warning-message-known-failures.<target>.json`** | **code and position both agree, the prose differs** |

The three are separate because they have different causes and different fixes. Folded
together, the much larger position backlog would hide every semantic regression.

> **Not to be confused with `validator-message-known-failures.json`.** That is a
> different gate over a different population: the 332 `packages/svelte/tests/validator`
> fixtures, checked by `crates/rsvelte_core/tests/validator.rs`. This file gates the
> ~14k-entry real-world corpus. The names are one word apart and the two are unrelated
> — an entry in one says nothing about the other, and their counts are not comparable
> because the populations have different warning mixes.

### Why the message dimension needs its own gate

Until this file existed, the corpus never recorded `message` at all —
`compile.mjs`'s `normalizeWarnings` projected each warning to `(code, line, column)`
and the text was gone before anything reached disk. So the message was not "compared
loosely": it was **absent from both sides of every comparison**, at any corpus size.

That is invisible by construction rather than by sampling, which is the same shape as
the missing warning oracle behind #2281. Widening the comparison in `verify.mjs`
alone would not have fixed it — it would have compared a field neither side carried
and scored every entry as a match.

The dimension is not redundant with the other two. Measured on the real compilers,
`<svg><text><a xlink:href=''>x</a></text></svg>`:

```
codes    MATCH
position MATCH
message  DIFFER
  official: a11y_invalid_attribute: '' is not a valid xlink:href attribute
  rsvelte:  a11y_invalid_attribute: '' is not a valid href attribute
```

Both existing ratchets score that entry green. The message names an attribute that is
not on the element. Negative control, `<a href="">x</a>`: all three MATCH.

### What this gate cannot see

Measured, not estimated. Reproduce with `node scripts/compat-corpus/collect.mjs &&
node scripts/compat-corpus/compile.mjs && node scripts/compat-corpus/verify.mjs --no-fmt`:

```
manifest entries                14131
entries emitting >=1 warning     1191   (8.4% of corpus)
entries reaching the message      592   <-- this gate's real denominator
warnings recorded               15282
distinct warning codes seen         74   (of 89 in VALID_WARNING_CODES)
```

- **The denominator is 592, not 14,131.** Only 8.4% of corpus entries emit any warning,
  and of those, **just under half never reach the message comparison at all**: 70 are
  consumed by the code dimension and 529 by the position dimension (70 + 529 + 592 =
  1191 exactly). The cascade stops at the first divergence, so an entry already listed
  in the code or position ratchet is invisible here. **This gate's reach is coupled to
  the position backlog rather than independent of it** — burning that down widens this
  one, and no one should read "1 divergence" as "1 divergence among 14,131 entries".
- **Entries either compiler rejects** are skipped (the `expErr`/`actErr` guard in
  `verify.mjs`) — error parity covers those separately.
- **15 of the 89 ignorable codes never fire on this corpus.** Only three of those are
  compile-time diagnostics at all: `a11y_incorrect_aria_attribute_type_idlist` and
  `options_deprecated_accessors` have real emission sites that no corpus entry reaches,
  and `a11y_incorrect_aria_attribute_type_id` is declared without one — upstream
  declares it without a call site too (`packages/svelte/src/compiler/warnings.js:251`),
  so that is parity, not a gap. The other twelve are runtime warnings whose only
  compiler-side mentions are `svelte-ignore` lookups (`await_reactivity_loss`,
  `binding_property_non_reactive`, `hydration_*`, `ownership_*`,
  `state_snapshot_uncloneable`) or codes declared for `svelte-ignore` with no site at
  all (`await_waterfall`, `options_removed_*`, `options_renamed_ssr_dom`). They cannot
  appear in `result.warnings`, so no gate over compiler output can watch them.
- **The docs link is stripped** (`https://svelte.dev/e/<code>`, matching
  `crates/rsvelte_core/tests/validator.rs:202`). Both compilers emit it identically, so
  stripping changes no verdict at the point in the cascade where messages are compared
  — codes already agree by then. It is stripped so a code-level defect cannot leak into
  this ratchet, and so the two gates share one definition of "message".

### Current baseline: `warning-message-known-failures.<target>.json`, 0 entries

Empty because the corpus says so, not because the gate was scoped until it was. The
first full run found **exactly one** message divergence in 14,131 entries, on all three
targets — `svelte/packages/svelte/tests/validator/samples/a11y-anchor-in-svg-is-valid`:

```
expected: a11y_invalid_attribute: '#' is not a valid xlink:href attribute
actual:   a11y_invalid_attribute: '#' is not a valid href attribute
```

That is #2413, fixed by #2451, which lands before this. Re-measured against a build
carrying that fix, the count is **0** with the denominator unchanged at 592 — so the
entry became a match rather than dropping out of comparison.

The final two entries were fixed together. The first was
`svelte/packages/svelte/tests/migrate/samples/self-closing-elements/input.svelte`.
All four targets agree on the warning code and position, but rsvelte renders the
element name as `table` where upstream preserves the namespace form `f:table` in
the self-closing-tag warning. This is a message-only compiler parity defect, so it
belongs in this ratchet rather than in the code or position ones.

The second arrived with the wave-2 enrolment (#3176):
`open-webui/src/lib/components/common/Tags.svelte`. Upstream's
`a11y_role_has_required_aria_props` lists **every** missing attribute for the role
(`"aria-controls" and "aria-expanded"`); rsvelte lists only the first. The code and
the position agree, so this ratchet is the only one that can see it — and the
defect is in how the list is built, not in which attribute is detected, which makes
it one fix for every role with more than one required prop.

Both implementations now follow the upstream distinction directly: the local
name is used only for void/SVG/MathML classification while the original element
name is rendered in the warning, and a role warning renders the role's complete
required-prop contract once any required prop is absent. The four target
baselines therefore shrink from two entries each to zero.

Every entry added later must carry a justification here naming the divergence and,
where known, the issue tracking it.
