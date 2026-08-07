# check-e2e-known-failures.json — why entries are accepted (svelte-check e2e parity)

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

## Units

| Unit | What it is | Why it is in the corpus |
|---|---|---|
| `cmsaasstarter/app` | [CMSaasStarter](https://github.com/CriticalMoments/CMSaasStarter), a single-package SvelteKit SaaS starter (npm, `patch-package`, Supabase/Stripe) | Real SvelteKit route tree: `+page.server.ts`, `+server.js` under `checkJs`, route groups (`(admin)`, `(marketing)`), generated `$env` ambients |
| `skeleton/playground` | `playgrounds/skeleton-svelte` of [skeletonlabs/skeleton](https://github.com/skeletonlabs/skeleton) — a SvelteKit app inside a pnpm workspace | Cross-package resolution: imports two **sibling workspace packages** whose `exports` point at the sibling's `src/index.ts`, so sibling `.svelte`/`.ts` sources really enter the program |
| `skeleton/library` | `packages/skeleton-svelte` of the same monorepo — 300+ components | The library the playground resolves into: `.ts` barrels re-exporting types out of `<script module>`, `.svelte.ts` rune modules, `$props.id()` |

## Current baseline: `check-e2e-known-failures.json`, 0 entries / 0 surplus diagnostics — full parity

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

## Findings that are deliberately NOT in this ratchet

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

## Enrolling skeleton in the compile corpus

`submodules/skeleton` is now also a compile-corpus source
(`scripts/compat-corpus/corpus-sources.json`, #1924), so its ~700 `.svelte` /
`.svelte.(js|ts)` files feed the compiler, svelte2tsx, fmt and lint ratchets too.
Cluster E2 showed why it was worth doing: it was a `.tsx`-text divergence, so the
svelte2tsx track would have caught it natively (upstream's own
`props-variable-and-$props.id*` samples did, once that fixture ratchet existed).

The submodule is still **not** in `auto-update-submodules.yml`. This ratchet keys
on line numbers in skeleton's sources, so an automatic weekly bump would turn CI
red with pure churn; the pin moves only with a deliberate re-baseline.

## Burning an entry down

1. Fix the underlying issue.
2. `pnpm run test:svelte-check-e2e` — the run reports how many divergences
   disappeared.
3. `node scripts/compat-corpus/check-e2e-verify.mjs --update` to prune the
   entries, and update the cluster section here.

Entries may never be *added* to unblock a change. A new divergence means
rsvelte-check now disagrees with the official checker on a real project somewhere
it previously did not, which is the exact failure mode this gate exists to catch.
