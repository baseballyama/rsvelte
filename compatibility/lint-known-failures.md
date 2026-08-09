# known-failures.json — why entries are accepted (lint corpus)

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

## Current baseline: `lint-known-failures.json`, 104 entries — 104 divergences (32 FP, 72 FN)

**24 of the 104 are the `.svelte.(js|ts)` surface, enrolled when it entered the gate.**
Until then the diff loop iterated `kind === 'component'` only, so both linters were
run over rune modules and the result was discarded. 23 of the 24 are one rule —
`prefer-svelte-reactivity`, whose module path `rules/prefer_svelte_reactivity.rs:19-21`
declined to port *citing the absence of this coverage as the reason*. That makes them
a licensed gap now forced into view rather than drift, which is why they are enrolled
rather than fixed here: the fix is a rule port, not a harness change. The 24th is
`no-navigation-without-base` on a module, same shape as the 6 component `no-goto-without-base`
entries below.

The former largest cluster — `no-top-level-browser-globals` (136 FP) — is now
resolved: an oxc-semantic scope resolver (`rsvelte_lint::compiler_scope` +
`rsvelte_lint::scope::ScopeResolver`) distinguishes a real browser global
(`window`) from a local binding that shares its name (`open` / `top` / `name` /
`status` — a prop / import / `let`) in both the `<script>` and template paths.
That dropped the baseline from 238 to 102. The `shorthand-directive` (11 FP) and
`shorthand-attribute` (7 FP) clusters are now resolved as well, along with part of
the `prefer-const` tail — 102 → 80.

The remainder are genuine rsvelte gaps, each a self-contained follow-up rather
than a novel class — production code re-surfaces the already-known clusters at
higher volume:

- **`sort-attributes` — 36 (11 FP / 25 FN).** Attribute ordering around
  `bind:`/directives and inline `/* eslint … */` custom `order`.
- **`prefer-svelte-reactivity` — 25 (25 FN).** 2 on components; 23 on
  `.svelte.(js|ts)` modules, the deliberately unported path described above.
- **`valid-prop-names-in-kit-pages` (16 FP) / `no-goto-without-base` (6 FN).**
  SvelteKit route-file-type gating + `resolve()`/base-path handling on real
  `src/routes/+page.svelte` files.
- **`prefer-const` (9 — 8 FN / 1 FP) / `no-target-blank` (7 FN).** Small per-rule
  tail (TS `let`, `{@const}`, template-attribute reassignment scan).
- **Singletons:** `experimental-require-slot-types` (2 FP),
  `prefer-destructured-store-props` (2 FP), `no-navigation-without-base` (1 FN,
  on a module).

By repo: flowbite-svelte 45, bits-ui 28, shadcn-svelte 18, eslint-plugin-svelte 10,
melt-ui 3. By file kind: 80 component, 24 module.

The three splits above each cover every entry exactly once:

Partition of `lint-known-failures.json` by rule: `36 + 25 + 16 + 6 + 9 + 7 + 2 + 2 + 1`
Partition of `lint-known-failures.json` by direction: `32 + 72`
Partition of `lint-known-failures.json` by repo: `45 + 28 + 18 + 10 + 3`

## Harness-config decisions (NOT rsvelte bugs)

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

## Finding-level exclusions (`MANUAL_EXCLUSIONS` in lint-verify.mjs)

- **globals-version skew (×2, `localStorage`/`navigator`).** With `globals@16.5`
  these are node-available, so upstream's `getBrowserGlobals()` excludes them and the
  rule does not flag a top-level `localStorage.getItem(…)`. But eslint-plugin-svelte's
  **own fixtures** (the authoritative gate) still assert the flag, so rsvelte keeps
  flagging them. The 2 corpus FP are a documented upstream inconsistency (see U1
  below), not an rsvelte defect.
- **`comment-directive` on core `no-undef` (×1).** ESLint marks a disable "unused" by
  checking whether the disabled rule fired; for a **core** ESLint rule rsvelte does
  not implement, it always sees zero findings and cannot tell "ran, found nothing"
  from "never ran". Removing the guard introduces a real FP on the next directive
  (FN↔FP trade-off confirmed). An inherent scope boundary of a svelte-only linter.

## Upstream bug (report to sveltejs/eslint-plugin-svelte)

- **U1 — `no-top-level-browser-globals` fixtures disagree with the runtime `globals`
  version.** The rule computes `globals.browser ∖ globals.node`; in `globals@16.5`
  `localStorage`/`navigator`/`sessionStorage` are in `globals.node`, so the rule no
  longer flags them at runtime — yet the plugin's own fixtures/docs still assert it.
  Suggested upstream fix: keep an explicit browser-only allow/deny list, or
  regenerate fixtures against the pinned `globals`. rsvelte matches the authoritative
  fixtures.
