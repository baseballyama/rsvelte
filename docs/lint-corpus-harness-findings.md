# Lint-corpus harness & upstream findings

While burning down the lint-parity corpus (`scripts/compat-corpus/lint-verify.mjs`)
to zero divergences vs the real `eslint-plugin-svelte`, several divergences turned
out **not** to be rsvelte bugs but issues in the comparison harness (our own
oracle config) or in upstream `eslint-plugin-svelte` itself. This document
records them so the fixes/decisions are auditable and so any genuinely
upstream-side items can be reported to `sveltejs/eslint-plugin-svelte`.

Versions at time of writing: `eslint-plugin-svelte@3.19.0`,
`svelte-eslint-parser@1.8.0`, `svelte@5.56.3`, `eslint@9`.

---

## H1 — Oracle declared no browser globals → `no-top-level-browser-globals` never fired (harness, FIXED)

**Symptom:** 66 false positives — rsvelte flagged textbook top-level browser
globals (`window.localStorage.getItem(...)`, `location.href`) that the oracle did
not.

**Root cause:** the rule iterates references with `eslint-utils`
`ReferenceTracker`, which is **scope-based** — it only yields references to names
present in `globalScope.set` (declared globals). eslint-plugin-svelte's
`flat/base` config (the only config the oracle layered) declares **no** browser
globals, and the oracle added none, so the rule found zero references and stayed
silent on every file. rsvelte does a name-based AST walk and (correctly) flags
them.

**Verification:** configuring the oracle with the same global names makes the two
engines byte-identical on the guard fixtures (`guards01`–`08`, `env01`–`03`,
`test01`–`03`) — rsvelte's guard model (`isAvailableLocation`, READ-only,
`{#if browser}` env guards) is faithful.

**Fix:** `scripts/compat-corpus/lint-oracle/browser-globals.json` declares a
curated browser-global environment shared with rsvelte's `BROWSER_GLOBALS`. The
full `globals.browser` set (763 names) is **not** used: it contains common
identifiers (`name`, `event`, `length`, `status`, `top`, `open`, `find`, …) that
rsvelte's name matcher cannot distinguish from local bindings without full
ESLint-style scope resolution, which would re-introduce false positives.

**Not an upstream bug** — a real Svelte project using this rule must configure
`globals.browser` (or equivalent) itself; the corpus oracle simply mirrored the
plugin's bare base config. Possible upstream DX improvement: the rule could warn
when no browser globals are configured (it is otherwise a silent no-op), but that
is a suggestion, not a defect.

---

## (template) `no-top-level-browser-globals` does not scan template expressions (rsvelte gap, tracked)

Exposed once the oracle was configured (above): the rule must also flag browser
globals in **template** mustaches (`{location.href}`) under `{#if browser}` /
`{#if !browser}` *SvelteIfBlock* guards. rsvelte's rule is a `ScriptRule` and
only walks `<script>` programs. Tracked in
`docs/lint-corpus-remaining-work.md` (Cluster G remaining).

---

## H2 — Oracle declared no ES/Web-API globals → ReferenceTracker rules never fired (harness, FIXED)

Same class of bug as H1, for two more rules whose `eslint-utils`
`ReferenceTracker` is scope-based:

- **`svelte/infinite-reactive-loop`** tracks calls to `setTimeout` /
  `setInterval` / `queueMicrotask` (`ReferenceTracker.CALL`). With none of those
  declared as globals, it found zero references and stayed silent — even on its
  *own* `invalid/queueMicrotask/test01` fixture (15 FP vs rsvelte).
- **`svelte/prefer-svelte-reactivity`** tracks `new Date/Map/Set/URL/URLSearchParams`
  (`ReferenceTracker.CONSTRUCT`). With those undeclared it was silent (≈17 FP).

**Verification:** declaring the relevant globals makes the oracle byte-identical
to rsvelte on every fixture for both rules (confirmed by oracle-only probes on
`queueMicrotask/setTimeout/setInterval/test01` and
`url-search-params/append01,delete01`).

**Fix:** the oracle declares a realistic, **collision-safe** global environment —
`globals.builtin` (ES intrinsics: `Date`/`Map`/`Set`/`Promise`/…) plus the
universal Web/Node APIs the rules track (`URL`, `URLSearchParams`, the
`setTimeout`/`setInterval`/`queueMicrotask`/… timer family) plus the curated
browser-only set from H1. The full `globals.browser` set is still avoided (its
common identifiers `name`/`event`/`length`/… would collide with locals in
rsvelte's name-based `no-top-level-browser-globals`). rsvelte's rule logic was
correct throughout.

### (exposed gap) `no-immutable-reactive-statements` misses all-immutable `$:` IIFEs (rsvelte gap, tracked)

Declaring the environment globals (above) also lets the oracle correctly fire
`no-immutable-reactive-statements` on `infinite-reactive-loop/valid/test01`:
`$: (async () => { let a = 0; … setTimeout(…) … })()` references only immutable
free variables (the inner `a` shadows the outer one; `setTimeout`/`Promise` are
globals), so the statement is non-reactive. rsvelte does not detect this case
(its referenced-variable mutability analysis doesn't account for the shadowed
local + all-global body). Tracked with the other `no-immutable-reactive-statements`
gaps in `docs/lint-corpus-remaining-work.md`; it is a real rsvelte gap, not a
harness artifact.

## H3 — `require-event-prefix` is type-aware → excluded from the parity universe (harness)

`svelte/require-event-prefix` resolves a component's event names from TypeScript
types. The corpus oracle wires only the TS *parser* (`@typescript-eslint/parser`,
no `parserOptions.project`/type checker), so the rule gets no type info and
returns `{}` — staying silent even on its own `invalid/` fixtures. rsvelte's
syntactic port recovers the event names and (correctly) fires. A finding-level
comparison is therefore meaningless, exactly like the already-excluded
`no-unused-props` / `no-navigation-without-resolve`. Added to the `EXCLUDE` set
in `lint-verify.mjs`; the rule stays covered by the exact-fixture oracle test
(`eslint_plugin_oracle`).

## H4 — `no-top-level-browser-globals`: globals-version split on `localStorage`/`navigator` (2 documented FP)

The corpus oracle runs `eslint-plugin-svelte` against `globals@16.5`, where
`navigator` / `localStorage` / `sessionStorage` are **node-available** — so
upstream's `getBrowserGlobals()` (`globals.browser` minus `globals.node`)
excludes them and the rule does **not** flag a bare `localStorage.getItem(…)` at
module top level (`test03`, `…md/1`). rsvelte's `BROWSER_GLOBALS`, however, must
keep them: eslint-plugin-svelte's **own** fixture suite (the exact-fixture oracle
gate, `eslint_plugin_oracle`) declares `invalid/test03` and expects
`"Unexpected top-level browser global variable \"localStorage\""`. Removing them
to satisfy the corpus oracle breaks that hard gate. Per the "keep rsvelte
correct" rule, rsvelte keeps flagging them (the upstream fixtures are the
authoritative behavior); the 2 corpus FP are an oracle globals-version artifact,
documented and tracked.

**Resolution (applied):** these two findings are listed in
`MANUAL_EXCLUSIONS` in `scripts/compat-corpus/lint-verify.mjs` and filtered
from the divergence set (the same pattern as the per-rule `EXCLUDE`, but
finding-scoped). This is the only finding-level exclusion in the corpus and it
is justified by an upstream inconsistency, NOT an rsvelte defect — see
[upstream-issues.md](upstream-issues.md) (U1). The exact-fixture
`eslint_plugin_oracle` gate continues to assert the (authoritative) flagging
behaviour, so rsvelte stays correct.

## H5 — `comment-directive` reportUnusedDisableDirectives on a core ESLint rule (capability gap, EXCLUDED)

**Symptom:** 1 false negative — the oracle reports an
`<!-- eslint-disable-next-line no-undef -->` as *unused* (the
`reportUnusedDisableDirectives` doc fixture), rsvelte does not.

**Root cause:** ESLint decides a disable is unused by checking whether the
disabled rule produced an error on that line. For a **core** ESLint rule like
`no-undef` — which rsvelte does not implement — rsvelte always sees zero
findings, so it cannot distinguish "the rule ran and found nothing"
(→ unused) from "the rule would have fired but we never ran it" (→ used). The
rule (`comment_directive.rs`) therefore deliberately stays silent for
unimplemented targets to avoid a false positive.

**Verification:** removing that guard does fire the missed report — but it
simultaneously introduces a **real FP** on the very next directive in the same
fixture (`comment-directive.md/4.svelte`), whose line 8 has an undefined
variable, so the oracle's `no-undef` fires and the disable is genuinely *used*.
The FN↔FP trade-off confirms the guard is correct and the case is not
comparable without running core ESLint rules.

**Resolution:** same class as the type-aware rules — excluded at the
finding level via `MANUAL_EXCLUSIONS` in `lint-verify.mjs` (the svelte/* unused
-directive behaviour stays compared; only this single core-rule finding is
dropped). Not an rsvelte defect; not an upstream defect — an inherent scope
boundary of a svelte-only linter.

<!-- Add further harness/upstream findings below as the burn-down continues. -->
