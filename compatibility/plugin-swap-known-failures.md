# plugin-swap known failures

Justification for every entry in `plugin-swap-known-failures.json`, the
shrink-only, **two-sided** ratchet behind
`scripts/compat-corpus/plugin-swap-verify.mjs` — a new divergence and a
baselined entry that starts passing both fail the gate.

The gate runs a pinned real project's own test suite twice against one frozen
dependency tree — once with official `@sveltejs/vite-plugin-svelte`, once with
`@rsvelte/vite-plugin-svelte` staged in its place — and requires the same tests
to pass. See the header of `plugin-swap-verify.mjs` for the design and
`scripts/compat-corpus/README.md` for the two resolution invariants it asserts.

**Total: 0 entries.**

## Why this list is empty

It previously held 86 `suite-load-failure` entries for `bits-ui`, filed as
#2299. Those were **not** rsvelte defects — they were produced by the gate's own
swap mechanism, which symlinked the shim into the target's store. Node resolves
a symlinked package's imports from its realpath, so the shim imported vite 8
(rolldown) while driving bits-ui's vite 7 (esbuild) server; the optimizer
plugins were registered on a path the running vite never read, and every
prebundled dependency `.svelte.js` reached the browser uncompiled.

Staging the shim as a real directory with peers linked from the target removes
all 86. The gate now asserts the peer match before running, so that class cannot
recur silently.

## The constraint that keeps this gate from running today

With the artifact gone, `bits-ui` still cannot be gated, for a reason that is
not a bug in either side:

| | compiler | runtime | matched? |
|---|---|---|---|
| official plugin | resolved from the target | target | ✅ by construction |
| rsvelte plugin | pinned to the mirrored svelte | target | only if the versions coincide |

`bits-ui` runs `svelte@5.46.4`; rsvelte mirrors `5.56.8`. Between them
`rest_props`'s `exclude` changed from an Array (`.includes`) to a Set (`.has`),
so rsvelte emits Set-shaped code into a runtime calling `.includes` — 2436
"regressions" that measure the version gap, not rsvelte. Verified not to be the
compiler: the failing component compiles byte-identically under both compilers
at identical options.

The gate hard-fails on that skew rather than reporting a diff it cannot
attribute, so `bits-ui` is currently **asserted-out, not baselined** — there is
nothing to justify here, which is why this file lists zero entries.

Resolving it means either pinning the target's svelte to the mirrored version
during setup (no longer the project as shipped, and it breaks
`--frozen-lockfile`) or enrolling only targets that already match (fragile —
an upstream bump becomes a gate outage). That decision is open.
