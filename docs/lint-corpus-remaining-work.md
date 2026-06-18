# Lint-corpus burn-down playbook

The lint-parity corpus (`scripts/compat-corpus/lint-verify.mjs`) lints every
`.svelte` source in `eslint-plugin-svelte` + `svelte-eslint-parser` with both
the real `eslint-plugin-svelte` (oracle) and the native `rsvelte-lint`, and
records every finding that appears on exactly one side in
`compat/lint-corpus/known-failures.json`. That file may only **shrink** — a new
divergence fails CI (the `lint-parity` job).

This doc is the burn-down plan for the remaining divergences, grouped by
root-cause cluster so the backlog can be worked one cluster at a time. Counts
are a snapshot — regenerate with `pnpm run lint-corpus:update` then `git diff`.

`FP` = rsvelte reports, oracle silent (a false positive — usually the higher
priority, most user-visible bug). `FN` = oracle reports, rsvelte silent.

## Snapshot

**0 divergences** (down from 556 at the start of this burn-down pass; a raw
17,896 / a post-scoping 745 before that) — **100% cleared**. `known-failures.json`
is now empty: the `lint-parity` CI gate passes with full parity. The three
remaining non-comparable findings are documented finding-level `MANUAL_EXCLUSIONS`
in `lint-verify.mjs` (NOT in known-failures): H4 globals-version skew (×2) and
H5 core-`no-undef` capability gap (×1) — see `docs/lint-corpus-harness-findings.md`
and `docs/upstream-issues.md`.

How the final clusters (the **43** that remained at the last snapshot) were
cleared:

1. **Non-CSS `<style lang>` + self-closing (was ~12)** — done. Lenient parser:
   self-closing `<style/>`/`<script/>` no longer abort the parse; a non-CSS
   `lang` block skips CSS-shaped validation; and `scss_is_parseable` (a
   conservative SCSS structural check) suppresses the CSS-aware rules on
   *invalid* SCSS, mirroring postcss-scss failing — so valid SCSS lints and
   invalid SCSS stays silent without a full SCSS parser.
2. **no-immutable module/instance (was ~9)** — done. The rule now walks
   block-body write-only targets, ignores reactive-block-local declarations, and
   resolves cross-script immutability; on a scope-analysis failure it continues
   with empty maps (the unknown-name guard keeps it strictly FN-safe). The
   `ARENA MISMATCH` debug line is `#[cfg(debug_assertions)]`-only and no longer
   affects results.
3. **`no-top-level-browser-globals` in template (was 4)** — done. A
   dual-registered `check_root` walks template `{expr}` tags tracking a monotonic
   `client_guaranteed` flag through `{#if browser}` / `{#if !browser}` guards.
   The 2 globals-version FP are the documented H4 exclusion.
4. **Scattered per-rule edges (was ~16)** — done. Shorthand-directive spans fixed
   in the parser (class/animate/let/style end at the name), unblocking
   `max-attributes-per-line` end-line grouping and `first-attribute-linebreak`;
   `this="…"` static recovery; `no-unused-class-name` empty-`""` parity;
   `<template lang="pug">` treated as opaque (lenient); prefer-const no-init
   destructuring; prefer-svelte-reactivity cross-script. `comment-directive` on
   core `no-undef` is the documented H5 exclusion (verified FN↔FP trade-off).

Earlier in this pass cleared **486** (87%) across:
Cluster E (inline `/* eslint … */` config + JSON5 leniency), Cluster F
(`<svelte:element/component this={…}>`), Cluster G (browser-globals harness),
Cluster C/D (kit-pages `src/routes` gate, `goto` namespace import, shorthand
`<a {href}>`), **Cluster A (parser: newline-split `{#each … as …}` headers — a
real compatibility fix, CI-validated against the compile-corpus + runtime
suites)**, Cluster B (best-effort SCSS/PostCSS selector extraction), the
`<script>`/`<style>`/`<svelte:options>` layout-rule support (`SpecialElement`
hook), the oracle global environment for ReferenceTracker rules
(infinite-reactive-loop, prefer-svelte-reactivity, no-immutable's `console`), the
`lenient_script` parse path (lint the template even with invalid TS), and many
per-rule logic fixes (mustache-spacing `{@const}`/pug, prefer-const template
tags, no-dupe-else-if operand span, require-store computed-key column,
prefer-style CSS comments, infinite-loop param shadowing, ternary style attrs,
no-immutable destructuring assignments, …). All harness/upstream-rooted
decisions are recorded in `docs/lint-corpus-harness-findings.md`.

Rules **excluded** from the parity universe (see `EXCLUDE` in `lint-verify.mjs`):
`indent`, `valid-compile`, `valid-style-parse`, type-aware rules
(`no-unused-props`, `no-navigation-without-resolve`, `require-event-prefix`),
Svelte-3/4-only rules, option-required rules.

### Remaining 70 — categorised residuals

The remaining divergences need a few larger subsystems, not per-rule tweaks:

1. **Non-CSS `<style lang>` parse + validity (~12)** — `html-self-closing`,
   `no-unused-class-name`, some `prefer-const`/`sort-attributes`. rsvelte's CSS
   parser rejects SCSS/Sass/Less bodies, so the *whole file* fails to parse and
   no rule runs. A lenient skip (tried) makes *valid* scss lint correctly but
   also makes *invalid* scss parse — where the oracle's postcss-scss correctly
   rejects and stays silent — so rsvelte's tolerant SCSS extractor then
   over-reports. Needs a real SCSS validator to distinguish valid from invalid.
2. **`max-attributes-per-line` `generics` (~15)** — svelte-eslint-parser types a
   *valid* `generics="…"` as `SvelteGenericsDirective` (full-text message) but an
   *invalid* one as `SvelteAttribute` (key-only). rsvelte cannot tell which
   without parsing the value as TS type parameters. Excluded for now (counts as
   FN), since reporting it unconditionally would add a FP on the syntax-error
   fixture.
3. **`no-immutable-reactive-statements` module/instance combos (~9)** — `<script
   module>` + instance-script interactions; some are rsvelte parser gaps.
4. **`no-top-level-browser-globals` in template (4)** — the rule is a
   `ScriptRule`; it must also scan template `{expr}` tags with `{#if browser}`
   *SvelteIfBlock* guards.
5. **Scattered per-rule edges (~30)** — `sort-attributes` (this-in-middle,
   parse-failure files), `no-reactive-reassign`, `prefer-const` destructure/each,
   `first-attribute-linebreak` style-directive, `comment-directive`,
   `prefer-svelte-reactivity` (1, cross-block Set mutation). Several sit on
   files that fail to parse for residual (1).

The CI `lint-parity` gate (`known-failures.json`) holds at 70; it may only
shrink. Each residual above is a self-contained follow-up.

## How to work a cluster

```bash
pnpm run lint-corpus:sync && pnpm run lint-corpus:oracle-install
cargo build --release --bin rsvelte-lint
pnpm run lint-corpus:collect
node scripts/compat-corpus/lint-verify.mjs --show 80   # list current diffs
# inspect a failing source on both engines:
#   node scripts/compat-corpus/lint-oracle/run.mjs --rules <(echo '["svelte/<rule>"]') <file>
#   ./target/release/rsvelte-lint --config <cfg> --format sarif <file>
# fix → rebuild → re-verify; expect "0 new", then:
pnpm run lint-corpus:update   # prune the fixed entries (only shrinks)
```

Always re-run `cargo test -p rsvelte_lint --test eslint_plugin_oracle` (the
exact-fixture oracle) after a rule change — it must stay 100%.

---

## Cluster A — Parser robustness: newline-split block tags (≈85 divergences)

**Layer: compiler/parser. Effort: high. Risk: high (codegen).**

The dominant FN source. Several fixtures format a block-open tag with a newline
between *every* token:

```svelte
{
#each
cats
as
{ id, name }
,
i
}
```

`svelte-eslint-parser` parses this; rsvelte's parser bails, so the **whole file
fails to parse and no rule runs** → FN for everything in it.

Affected (FN): `mustache-spacing` (≈54 of 62, files `each01`,
`newline-in-blocks`), `spaced-html-comment` (16, `each01`), `require-each-key`
(7, `each01`), part of `max-attributes-per-line` and `prefer-const`.

**Fix:** make the block-tag parser tolerant of arbitrary whitespace/newlines
between `{`, the `#each`/`#if`/… keyword, and the rest. Validate against the
compile corpus + runtime suites (codegen risk) before landing. NB:
`{#each x as { a, b }, i}` destructuring itself already parses — only the
newline-split form fails.

## Cluster B — SCSS / non-CSS `lang` style blocks (≈70 divergences)

**Layer: compiler (CSS). Effort: high. Risk: medium.**

rsvelte skips `<style lang="scss|less|stylus|…">` entirely (`has_unknown_lang`
returns early), so any rule that inspects CSS selectors/classes can't reason
about it; the oracle parses with postcss-scss.

Affected (FN): `consistent-selector-style` (≈40 of 49, files `style-lang*`,
`*scss*`), `no-unused-class-name` (18, `style-lang*`), a couple of
`html-self-closing`.

**Fix:** a best-effort SCSS→selector extraction (SCSS is a CSS superset, but
nesting / `&` / interpolation need handling), or wire a real preprocessor. Big;
defer unless SCSS parity is a priority.

## Cluster C — Unenforced `meta.conditions` gate (≈60 divergences)

**Layer: lint engine. Effort: medium. Risk: medium (judgment call).**

eslint-plugin-svelte gates rules via `meta.conditions` evaluated against a
**SvelteContext** (`src/utils/index.ts` `shouldRun` + `svelte-context.ts`):
Svelte major version, **runes vs legacy** mode, and file type. rsvelte declares
`RuleConditions { runes_only, legacy_only }` on every rule meta but **never
enforces them** (no reader in `engine`/`visitor`/`runner`), so legacy-only rules
fire on the Svelte-5 corpus where the oracle skips them.

Affected (mostly FP): `no-immutable-reactive-statements` (22),
`prefer-svelte-reactivity` (18), `infinite-reactive-loop` (15 FP),
`require-event-prefix` (7 FP), `no-reactive-reassign` (5).

**Caveat / why it's a judgment call:** the oracle treats the whole corpus as a
Svelte-5 *project* (so a `$:`-only file is "runes by default" → legacy rules
skipped), whereas rsvelte's per-file detection sees `$:` → legacy → fires —
arguably *more* correct for real per-file usage. Matching the oracle means
porting the project-level `getSvelteVersion()` + `svelteParseContext.runes`
detection and wiring a `shouldRun(conditions)` check into the rule dispatcher,
then tagging each native rule with its upstream conditions. Decide the desired
semantics before implementing.

## Cluster D — SvelteKit version / `resolve()` context (≈25 divergences)

**Layer: lint engine + rule logic. Effort: medium. Risk: medium.**

The deprecated SvelteKit nav rules are version-gated and don't understand the
newer `$app/paths` `resolve()` API. The corpus declares SvelteKit 2 (synthetic
`package.json`), so rsvelte fires them on fixtures the oracle skips.

Affected (FP): `no-navigation-without-base` (15, mostly
`no-navigation-without-resolve` fixtures using `resolve(...)`),
`valid-prop-names-in-kit-pages` (4), `no-export-load-in-svelte-module-in-kit-pages`
(4), `no-goto-without-base` (2 FN).

**Fix:** part of Cluster C's conditions machinery (these carry
`svelteKitVersions` conditions + a `svelteKitFileType` that depends on the file
being a real `src/routes/+page.svelte`), plus teaching the base-path check to
treat `resolve()` as already-resolved.

## Cluster E — Inline-config options (≈73 divergences)

**Layer: harness / config. Effort: low–medium. Risk: low.**

The docs rule-example snippets carry `/* eslint svelte/<rule>: ["error", {…}] */`
to demonstrate a rule under *custom* options. The oracle honours the inline
options; rsvelte doesn't parse them and uses defaults → divergence. These are
**not real rsvelte bugs**.

Affected: `sort-attributes` (57, custom `order`), `block-lang` (16, custom
required langs).

**Fix options:** (a) parse inline `/* eslint … */` option config in rsvelte
(makes it a real feature), or (b) set `linterOptions.noInlineConfig: true` in
the oracle so both sides use the configured (default) options — re-baseline and
confirm it doesn't unmask inline-`eslint-disable` divergences first. (b) is the
cheaper harness-only path.

## Cluster F — `<svelte:element this={…}>` implicit attribute (≈20 divergences)

**Layer: lint (rule). Effort: medium. Risk: medium (FP).**

rsvelte stores the `this={…}` of `<svelte:element>` / `<svelte:component>` in a
separate `tag: Expression` field, not in `attributes`. svelte-eslint-parser
counts `this` as the first attribute, so rsvelte under-counts by one and
mis-positions attribute-layout findings.

Affected: part of `max-attributes-per-line` (≈20, `svelte-element01` /
`svelte-component01`), possibly `sort-attributes`/`first-attribute-linebreak`.

**Fix:** in the `svelte:element`/`svelte:component` hooks, treat `this` as an
implicit leading attribute (line = element-start line) for counting/grouping.
The reported attribute stays a real one (index ≥ max ≥ 1), so the `this` span
isn't needed for the message — only its line for the single-line/grouping math.

## Cluster G — `no-top-level-browser-globals` (RESOLVED at the script level)

**Root cause was a harness misconfiguration, not a rsvelte bug.** The upstream
rule's `ReferenceTracker` is *scope-based*: it only flags identifiers that ESLint
resolves to a **declared global**. eslint-plugin-svelte's `flat/base` config
declares **no** browser globals, and the corpus oracle did not add any, so
`globalScope.set` contained none of `window`/`document`/`location`/… — the rule
found zero references and stayed silent on *every* file, making all 66 of
rsvelte's (correct) findings look like false positives. rsvelte's guard analysis
(`getGuardChecker*` / `isAvailableLocation` / READ semantics) is faithful: with
the oracle properly configured, the two engines are byte-identical on the guard
fixtures (`guards01`–`guards08`, `env01`–`env03`, `test01`–`test03`).

**Fix (landed):** the oracle declares a curated browser-global environment
(`scripts/compat-corpus/lint-oracle/browser-globals.json`), shared with rsvelte's
`BROWSER_GLOBALS`, so both engines test the identical environment. The full
`globals.browser` set (763 names) is intentionally **not** used: it contains
common identifiers (`name`, `event`, `length`, `status`, `top`, `open`, …) that
rsvelte's name-based matcher cannot tell apart from local bindings without full
ESLint-style scope resolution — using it produced 23 false-`name` divergences in
testing. See `docs/lint-corpus-harness-findings.md`.

**Remaining (≈4 FN, tracked):** `in-template01` shows the rule must also flag
browser globals used in **template** expressions (`{location.href}`) with
`{#if browser}` / `{#if !browser}` *SvelteIfBlock* guards. rsvelte's rule is a
`ScriptRule` (it walks `<script>` programs only), so template-expression
detection + SvelteIfBlock guard handling is a separate rule extension. The full
`globals.browser` parity also needs a scope/binding resolver (`scope.rs`
`ComponentAnalysis`) so common-name globals can be distinguished from locals.

## Cluster H — Small / position-precision tail (≈40 divergences)

**Layer: lint (rule). Effort: low each. Risk: low.**

Self-contained per-rule gaps, each a handful of divergences:

- `prefer-const` (13) — remaining `{@const}` / `{let}` template declaration tags
  (svelte-eslint-parser flags a never-reassigned `{let x}`; rsvelte only walks
  `<script>`) and a TS-column case.
- `require-store-reactive-access` (12), `no-target-blank` (6),
  `no-reactive-reassign` (3 FP), `no-dupe-else-if-blocks` (4, compound-`&&`
  reported-column precision), `prefer-style-directive` (6, CSS-comment column
  precision), `html-closing-bracket-spacing` / `-new-line` (5 each),
  `first-attribute-linebreak` (7), `no-dupe-style-properties` (3),
  `no-shorthand-style-property-overrides` (2), `no-nested-style-tag` (2),
  and assorted singletons (`no-useless-mustaches`, `no-add-event-listener`,
  `no-inline-styles`, `comment-directive`, `no-inner-declarations`,
  `no-unnecessary-state-wrap`).

Pick these off opportunistically; each is a small, low-risk rule fix.

---

## Priority suggestion

1. **Cluster E (b)** — cheap harness change, removes ~73 non-bug divergences.
2. **Cluster H** — many small, low-risk, real-rule wins.
3. **Cluster F** — bounded rule fix, clears the biggest layout cluster's tail.
4. **Cluster C/D** — decide the conditions-gating semantics, then implement once
   (clears ~85 together).
5. **Cluster A / B / G** — high-effort structural work (parser, SCSS, guard
   reverse-engineering); schedule deliberately.
