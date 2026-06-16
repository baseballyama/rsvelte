# Lint-corpus burn-down playbook

The lint-parity corpus (`scripts/compat-corpus/lint-verify.mjs`) lints every
`.svelte` source in `eslint-plugin-svelte` + `svelte-eslint-parser` with both
the real `eslint-plugin-svelte` (oracle) and the native `rsvelte-lint`, and
records every finding that appears on exactly one side in
`compat/lint-corpus/known-failures.json`. That file may only **shrink** — a new
divergence fails CI.

This doc tracks the remaining divergences and the root-cause clusters so the
backlog can be burned down rule-by-rule. Counts are a snapshot (regenerate with
`pnpm run lint-corpus:update` then `git diff`); the shape matters more than the
exact numbers.

`FP` = rsvelte reports, oracle silent (a false positive — usually the higher
priority, most user-visible bug). `FN` = oracle reports, rsvelte silent.

## Snapshot

~556 divergences across ~34 rules, after the burndown so far:
`prefer-const` (export-prop, `{@render}`-arg writes, robustness to analysis
errors + bind/destructuring/redeclaration), `no-spaces-around-equal-signs`
(shorthand), `consistent-selector-style` (dynamic-class affixes),
`max-attributes-per-line` (shorthand name), `html-self-closing` (`<slot>`).
The excluded rules (not in the parity universe — see `EXCLUDE` in
`lint-verify.mjs`) are tracked separately: `indent`, `valid-compile`,
`valid-style-parse`, type-aware rules, Svelte-3/4-only rules, option-required
rules.

Biggest remaining clusters (regenerate with `pnpm run lint-corpus:update`):
`max-attributes-per-line` (80, mostly the `<svelte:element this={…}>` implicit
attribute + the newline-in-block parser gap), `mustache-spacing` (72, mostly the
parser gap), `no-top-level-browser-globals` (66 FP, guard semantics),
`sort-attributes` (57, inline-config options), `consistent-selector-style` (49,
SCSS/`lang` blocks), the conditions-gated legacy rules
(`no-immutable-reactive-statements`, `prefer-svelte-reactivity`,
`infinite-reactive-loop`), `no-unused-class-name` (18, SCSS), and SvelteKit
context rules (`no-navigation-without-base`).

These remaining clusters are predominantly structural — they need a compiler
parser change (newline-split block tags, `{#each}` destructuring), SCSS/`lang`
preprocessing, inline-config option parsing, the `meta.conditions` gate
(cluster 1), or reverse-engineering a complex guard rule — rather than a
self-contained per-rule fix.

## Root-cause clusters

### 1. Missing `meta.conditions` gating (the largest systematic cause)

eslint-plugin-svelte gates many rules on a `meta.conditions` block evaluated
against a detected **SvelteContext** — the Svelte major version, runes vs legacy
mode, and the file type (`.svelte` vs `.svelte.[js|ts]` vs SvelteKit route
files). When the context doesn't match, the rule is skipped entirely.
`rsvelte-lint` currently runs every rule unconditionally, so it **over-reports**
(FP) any rule upstream would have gated off — and the corpus declares Svelte 5,
so 3/4-flavoured fixtures diverge.

Affected (FP) clusters:

- `infinite-reactive-loop` (15 FP) — fires on the rule's own `$:`-based invalid
  fixtures; upstream gates these by the legacy/runes context.
- `prefer-svelte-reactivity` (17 FP) — fires where upstream's `'.svelte'` +
  version gate skips.
- `no-immutable-reactive-statements`, `no-reactive-reassign` partial.

**Fix direction:** port the `SvelteContext` detection + `shouldRun(conditions)`
gate (eslint-plugin-svelte `src/utils/index.ts` + `src/utils/svelte-context.ts`)
into the rsvelte rule dispatcher, then tag each native rule with its upstream
conditions. This is one feature that clears several clusters at once.

### 2. SvelteKit-route file-type rules

`valid-prop-names-in-kit-pages`, `no-export-load-in-svelte-module-in-kit-pages`
(4 FP each) only fire upstream when the file path is a real SvelteKit route
(`src/routes/+page.svelte`, …); rsvelte keys off weaker signals. Same gating
machinery as cluster 1 (`svelteKitFileType`). `no-navigation-without-base`
(15 FP) fires on doc/demo links upstream skips.

### 3. Template declaration tags (`{@const}` / `{let}`)

`prefer-const` (54 FN) misses `{@const x = …}` / `{let x}` template declaration
tags — svelte-eslint-parser surfaces them as `VariableDeclaration`s, so the core
`prefer-const` fires; rsvelte's `prefer-const` only walks the `<script>` AST.
**Fix:** extend `prefer_const` to the template declaration-tag nodes.

### 4. Stylistic / layout rules (whitespace & attribute layout)

The biggest raw counts; hard to match byte-exactly on real-world markup:

- `max-attributes-per-line` (52 FP / 124 FN)
- `mustache-spacing` (10 FP / 62 FN)
- `html-self-closing` (61 FN), `sort-attributes` (20/37),
  `first-attribute-linebreak` (7 FN), `html-closing-bracket-*` (5 FN each),
  `spaced-html-comment` (16 FN).

These need per-rule alignment of the layout heuristics with upstream. Lower
priority than the semantic clusters.

### 5. `no-top-level-browser-globals` (66 FP)

rsvelte flags bare-identifier / member-write browser-global uses upstream's
`ReferenceTracker` (READ-only) doesn't (e.g. `document.title = x`, `foo(window)`).
Align the access-kind detection with upstream.

### 6. `consistent-selector-style` (49 FN)

rsvelte under-reports selector-style suggestions on real CSS. Needs a pass over
the `style`-array priority resolution to match upstream's chosen suggestion.

### 7. CSS/usage long-tail

`no-unused-class-name` (18 FN), `block-lang` (14 FN), `no-dupe-style-properties`,
`no-shorthand-style-property-overrides`, `no-nested-style-tag`, etc. — small
per-rule gaps, each a self-contained fix.

## Workflow

```bash
pnpm run lint-corpus:sync && pnpm run lint-corpus:oracle-install
cargo build --release --bin rsvelte-lint
pnpm run lint-corpus:collect
node scripts/compat-corpus/lint-verify.mjs --show 80   # list current diffs
# pick a rule, inspect a failing source on both engines:
#   node scripts/compat-corpus/lint-oracle/run.mjs --rules <(echo '["svelte/<rule>"]') <file>
#   ./target/release/rsvelte-lint --config <cfg> --format sarif <file>
# fix the rule, rebuild, then:
pnpm run lint-corpus:update    # prune the fixed entries (only shrinks)
```
