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

## Current baseline: `lint-known-failures.json`, 0 entries

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

### How it got here — 104 → 45 → 3 → 5 → 3 → 0

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
