# lint-severity-known-failures.json — why each entry is accepted

`scripts/compat-corpus/lint-severity.mjs` runs both linters **the way a user
runs them**: `eslint-plugin-svelte`'s `flat/recommended` verbatim against
`rsvelte-lint` with no `--config`, over every pattern in
`compatibility/lint-adversarial/`, comparing each finding's
`(ruleId, line, column, severity, message)`, and the process **exit code**.

Every other lint gate writes an explicit all-rules-`"warn"` config on both
sides. That is the right key for comparing rules, and it makes three things
constants none of them can vary: a finding's **severity**, the **exit code**,
and whether an inline `/* eslint … */` comment can still enable a rule the
preset leaves `off`. Gate 33 (`lint-preset.mjs`) pins the two presets, but it
reads them through `--list-rules` and upstream's exported config object — the
declared tables, never a run (gate-coverage blind spot 33b).

`lint-severity-known-failures.json` holds 62 entries.

Key classes:

| class | key | meaning |
|---|---|---|
| `severity` | `severity\|<id>\|<rule> <line>:<col>\|<oracle>-><rsvelte>` | both sides report it, at different levels |
| `missing` / `extra` | `missing\|<id>\|<rule>⇥<line>:<col>⇥<message>` | one side reports it |
| `exit` | `exit\|<id>\|<oracle>-><rsvelte>\|<causes>` | the process exit codes differ |
| `oracle-crash` | `oracle-crash\|<id>\|<rule>` | an upstream rule threw and took the file's whole report with it |

Partition of `lint-severity-known-failures.json` by cause: `55 + 4 + 1 + 1 + 1`

Two of those addends are a `4` and they are unrelated: the standalone `4` is the
`exit` 1→0 class below (a type-aware rule `lint-universe.mjs` excludes, which
still reports at `error` upstream). The four rsvelte over-rejections that used to
sit *inside* the first addend are fixed and no longer listed, which is why it
reads 55 rather than 59.

## `severity` — zero entries, and that is the measurement

Not a blank row. Over the 33 rules both presets enable by default, the run
compares 1,179 oracle findings against 1,178 rsvelte findings and **no pair
differs in level**. The 21 rules gate 33 found at `error` upstream and `warn`
here are confirmed aligned through an actual run, not only in the table
`--list-rules` prints.

A zero is only worth reading if the measurand could have moved, so the gate
refuses to pass unless **both** `warn` and `error` appear among each side's
findings — a run in which every finding carries one level cannot tell a severity
divergence from agreement. It currently sees 402 `warn` / 1,035 `error` from the
oracle and 2,504 / 1,034 from rsvelte. The control was also exercised directly:
re-running the subject with `--error svelte/no-at-debug-tags` moves 38 findings
and the gate reports **76** `severity` keys.

## `exit` 0→1, 55 entries — rsvelte surfaces a compiler diagnostic ESLint cannot see

`rsvelte-lint` merges the Svelte compiler's own diagnostics into its report and
exits non-zero on any `Error`, exactly as it does for a rule at `error`.
`svelte-eslint-parser` is deliberately more permissive than the compiler, so a
file the compiler rejects is linted cleanly by ESLint and exits 0.

Every one of these 55 patterns fails to compile, and it is the compiler saying
so rather than a rule: the key's cause field carries the diagnostic code, and
all 55 are compiler codes (`slot_element_invalid_name` ×13,
`dollar_prefix_invalid` ×7, `state_invalid_placement` ×4, `legacy_export_invalid`
×4, `animation_invalid_placement` ×4, `parse-error` ×3, and 15 more codes accounting for
20 between them), never a `svelte/…` rule id. Many are inherent to the rule being
exercised — `no-dynamic-slot-name`'s whole subject is a construct Svelte 5
rejects outright.

**Cross-checked against the official compiler, not assumed.** Compiling all 55
with `submodules/svelte`'s own `compile`/`compileModule`: **all 55 are rejected by
the official compiler too**, so the two tools disagree only about whether a linter
should report a compile error — a product decision, and rsvelte's is the more
useful one for a Svelte-specific linter.

This bucket held **59** entries until #3172 fixed issues #3127 and #3128. The four
that left were rsvelte over-rejections rather than a product decision — a
`$`-prefixed class member NAME read as a store reference, and legacy mode
(`runes: false`, or `<svelte:options runes={false} />`) not turning a rune-named
`$` reference into a store subscription. The remaining 55 are the ones official
rejects too, which is what the re-measured cross-check above now reports as
55 of 55.

## `exit` 1→0, 4 entries — `svelte/no-navigation-without-resolve`

`no-goto-without-base/{17-non-call-references,21-module-goto.svelte.js,23-alias-chains}`
and `no-navigation-without-base/12-module-file.svelte.ts`. Upstream's
`flat/recommended` runs this rule at `error`; it reports, and ESLint exits 1
while rsvelte exits 0.

The rule is on `scripts/compat-corpus/lint-universe.mjs`'s `EXCLUDE` list — it
needs the TypeScript checker to match upstream, and the type-aware path lives in
the out-of-workspace `rsvelte_lint_types` crate — so its findings are outside
this gate's comparison population, as they are outside gate 28's. The **exit
code is not**, because it is a property of the whole run: excluding a rule from a
finding comparison cannot exclude it from the process's exit status. That is the
one thing this class records, and it is why an `EXCLUDE` entry is not free.

## `exit` 1→0, 1 entry — `no-unused-svelte-ignore/10-style-scss-css-ignore.svelte`

The exit-code consequence of the `missing` entry below; the same single finding,
which upstream defaults to `error`.

## `missing`, 1 entry — `svelte/no-unused-svelte-ignore 2:20`

Not an independent divergence: it restates the entry of the same name in
[`lint-adversarial-known-failures.md`](lint-adversarial-known-failures.md).
`svelte-eslint-parser` builds no `SvelteStyleElement` for a `</style⏎⏎>` end tag,
so the two tools disagree about whether the `svelte-ignore` comment above it is
used. It appears here as well because this gate compares the same finding under a
different configuration, and suppressing it would mean special-casing one gate's
population against another's ratchet.

## `oracle-crash`, 1 entry — `no-target-blank/02-rel-dynamic.svelte`

`svelte/no-navigation-without-resolve` **throws** (`Cannot read properties of
undefined (reading 'type')`) on `<a href="…" rel>` and on `<a href="…" rel="">`
— an `<a>` with a valued `href` and a `rel` that has no value. ESLint reports the
throw as a fatal message, so the file yields no findings at all and the run exits
1. Minimal repro, in a tree whose `package.json` declares `@sveltejs/kit` (the
rule is SvelteKit-gated, so it does not run without it):

```svelte
<a href="/x" rel>y</a>
```

Reported upstream in
[`upstream_issues/eslint-plugin-svelte-no-navigation-without-resolve-crash.md`](../upstream_issues/eslint-plugin-svelte-no-navigation-without-resolve-crash.md).

The crash is only reachable because this gate runs upstream's **default preset**:
every other lint gate enables an explicit rule universe that excludes this rule,
so the rule never runs and never throws. A file whose report the oracle destroys
has no findings and no meaningful exit code to compare, so the pattern is scored
as this one key and skipped for the other three classes — never as a hard error,
because the crash is a property of the oracle configuration the gate exists to
exercise.

## Inline configuration: measured equal, and guarded

The patterns carry `/* eslint <rule>: [...] */` comments, and 26 of the shared
rules are `off` in **both** presets — so a finding on one of them can only have
come from the file's own inline comment. Both sides honour it identically:
`svelte/button-has-type` 13 findings each, `svelte/prefer-class-directive` 6 each,
`svelte/no-trailing-spaces` 9 each, `svelte/sort-attributes` 7 upstream / 6 here
(the one difference is the `order`-option entry already listed in
`lint-adversarial-known-failures.json`, not a failure to enable). None of these
rules is in the comparison population, so the gate asserts the population exists
instead: it fails if no pattern reports a rule both presets leave off, which
would mean the axis had silently stopped being exercised.
