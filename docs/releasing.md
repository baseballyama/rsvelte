# Releasing

rsvelte ships several npm packages that are all compiled from the **one**
`rsvelte_core` Rust crate. Changesets versions packages by their **npm**
dependency graph, which is blind to the shared Rust crate — so a core change can
be released into one package while leaving another, built from the same code,
stale.

## The hazard

`@rsvelte/svelte2tsx` is a thin JS wrapper around the wasm `svelte2tsx` export in
`@rsvelte/compiler`. `@rsvelte/svelte-check` embeds the **same** `rsvelte_core`
svelte2tsx code, but as a self-contained native binary with **no** npm
dependency on `@rsvelte/compiler` or `@rsvelte/svelte2tsx`. There is no edge for
Changesets to cascade along, so svelte-check only bumps when a changeset **names
it**.

This actually shipped: the 254→0 svelte2tsx corpus-parity fix (#1295) named only
`@rsvelte/svelte2tsx`. `@rsvelte/compiler` was rebuilt (it's named on nearly
every PR) and picked the fix up for free, so `@rsvelte/svelte2tsx@0.1.20` got it
— but `@rsvelte/svelte-check` was never named, stayed on its `0.3.7` build from
before the fix, and shipped different diagnostics for weeks.

## Which packages are "islanded"

Islanded = separately-compiled artifact of `rsvelte_core` whose `package.json`
has **no** `@rsvelte/*` dependency that Changesets could cascade a bump along.
These must be named explicitly whenever the core code they embed changes:

| Package | Embeds | Cascade in? |
|---|---|---|
| `@rsvelte/compiler` | full core (wasm compile + svelte2tsx) | ❌ islanded — but named on almost every PR, so rarely drifts |
| `@rsvelte/svelte-check` | core svelte2tsx overlay + parse/analyze | ❌ islanded — **drifts**, this is the one that bit us |
| `@rsvelte/vite-plugin-svelte-native` | core compile / hmr / preprocess NAPI | ❌ islanded |
| `@rsvelte/language-server` | `rsvelte_lint` → core | ❌ islanded |
| `@rsvelte/lint` | core validator/a11y wrap + native rule engine (`rsvelte_lint`) | ✅ fixed-group with `@rsvelte/compiler` |

Packages that **do** cascade (no need to name for a core change, though naming
is harmless): `@rsvelte/svelte2tsx` → `@rsvelte/compiler`;
`@rsvelte/vite-plugin-svelte` → `@rsvelte/vite-plugin-svelte-native`.

`@rsvelte/lint` is also islanded by the dependency-graph definition above (its
`package.json` has no `@rsvelte/*` dependency), but it is placed in the same
Changesets **`fixed`** group as `@rsvelte/compiler` (`.changeset/config.json`)
specifically to avoid the svelte-check-style drift: `@rsvelte/compiler` is
named on nearly every core PR, and a `fixed` group forces every member to the
same version whenever any one of them gets a changeset — so `@rsvelte/lint`
is republished in lockstep with `@rsvelte/compiler` without needing to be
separately named. Because the fixed group closes the drift edge,
`check-core-consumer-changesets.mjs` intentionally carries **no**
`crates/rsvelte_lint/**` rule (see the NOTE in that script). The residual gap —
a PR that touches `rsvelte_lint` code but names neither `@rsvelte/compiler` nor
`@rsvelte/lint` in its changeset — is not machine-guarded; it falls to ordinary
changeset review, like any package.

## The rule

When you change shared core code, add the affected islanded consumers to your
changeset (a `patch` bump is enough to trigger a rebuild + republish). The most
common miss is: **a `crates/rsvelte_core/src/svelte2tsx/**` change must name
`@rsvelte/svelte-check` as well as `@rsvelte/svelte2tsx`.**

## The guard

`scripts/release/check-core-consumer-changesets.mjs` enforces the proven edges in
CI (the `Changeset` job in `.github/workflows/ci.yml`). It maps changed core
source directories to the consumer packages that must be named, and fails the PR
if the pending changesets don't cover them. It is intentionally narrow — only
edges observed to drift — so routine compiler PRs aren't forced into
multi-package changesets. Extend the `RULES` table in that script as new
islanded consumers or shared-source directories appear. Bypass a one-off with
the `skip-changeset` label.
