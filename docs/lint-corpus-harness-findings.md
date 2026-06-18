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

<!-- Add further harness/upstream findings below as the burn-down continues. -->
