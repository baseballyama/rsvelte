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
of. The clusters below are what one afternoon of real trees produced.

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

## Current baseline: 374 entries / 375 surplus diagnostics

All remaining clusters are **rsvelte-only false positives**; there are no false
negatives. Nothing here is a wontfix — each cluster is a live bug filed with a
reproduction (E1 + E3 → #1916, E4 → #1918), and the ratchet shrinks as they land.
Cluster E2 (`$props` treated as a store subscription, 30 entries, `TS2448`,
#1917) is **fixed** and pruned.

### Cluster E1 — ambient `*.svelte` shadows real resolution for named imports (372 entries, `TS2614`, #1916)

`skeleton/library`, every entry `Module '"*.svelte"' has no exported member 'X'`.
The overlay's vendored shim declares `declare module "*.svelte"`, and any
specifier ending in `.svelte` that TypeScript cannot resolve on disk falls back
to it. A **default** import then merely degrades to `any` (silent), but a
**named** import errors. Two shapes hit it:

- a plain `.ts` barrel re-exporting a component's `<script module>` type —
  `export type { TooltipArrowProps } from './anatomy/arrow.svelte';`. The `.ts`
  file is passed into the program verbatim from its real location, so its
  relative specifier points at the real `.svelte` file, not at the generated
  `.svelte-check/svelte/**.svelte.tsx` shadow;
- a `.svelte.ts` **rune module** imported with the `.ts` stripped —
  `import { useAccordion } from '../modules/provider.svelte';` resolving to
  `modules/provider.svelte.ts`. The specifier ends in `.svelte`, so the wildcard
  claims it before the real file is found.

Official `svelte-check` never hits either: it drives a TypeScript
LanguageService with its own `resolveModuleNames` host that maps `.svelte`
imports onto the in-memory `.tsx` documents, whereas rsvelte-check type-checks an
on-disk overlay with a stock compiler and must repoint the specifiers itself.
`rewrite_aliased_svelte_imports` (`crates/rsvelte_check/src/svelte_check/overlay.rs`)
already does exactly that for **aliased** specifiers (#1888, fixed by #1895) but
returns early for anything starting with `.`, and it never runs over real
`.ts`/`.js` sources at all.

### Cluster E3 — snippet parameter implicit `any` (1 entry, `TS7006`, #1916)

`skeleton/library`, `test/components/toast.svelte:8`, `Parameter 'toast'
implicitly has an 'any' type` for `{#snippet children(toast)}`. The snippet
parameter's type comes from the component's `children: Snippet<[ReturnType<typeof
useToast>]>` prop, and `useToast` is imported from a `.svelte.ts` rune module —
i.e. exactly the import cluster E1 breaks. Kept as a separate entry because it is
a different code and file, but it is expected to disappear with E1.

### Cluster E4 — `+server.js` handlers in arrow-const form are not augmented (1 entry ×2, `TS7031`, #1918)

`cmsaasstarter/app`, `src/routes/(marketing)/auth/callback/+server.js:5`,
`Binding element 'url' / 'supabase' implicitly has an 'any' type` for

```js
export const GET = async ({ url, locals: { supabase } }) => { … };
```

SvelteKit route files get a generated `@type {import('./$types').RequestHandler}`
annotation so the destructured event is typed. `kit_file.rs` matches only the
`FunctionDeclaration` form for route handlers — the same narrowing that #1886
reported for hooks and #1892 fixed *for hooks only*. Layer 1's `kit-routes-js`
fixture uses `export function GET(event)`, so it is green and the arrow-const
form is untested. This is the epic's porting rule ("each ported `match` narrower
than upstream's needs a fixture proving the narrowing is intentional") failing in
a second place.

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
  not appear here. Tracked as #1919.

## Enrolling skeleton in the compile corpus

`submodules/skeleton` is intentionally **not** in
`scripts/compat-corpus/corpus-sources.json` yet: adding a source repository
requires re-baselining the compiler, svelte2tsx, fmt and lint ratchets in the
same change, which is a separate piece of work from this gate. Cluster E2 showed
why it is worth doing: it was a `.tsx`-text divergence, so the svelte2tsx track
would have caught it natively (upstream's own `props-variable-and-$props.id*`
samples did, once that fixture ratchet existed).

The submodule is also **not** in `auto-update-submodules.yml`. This ratchet keys
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
