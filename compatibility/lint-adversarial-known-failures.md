# lint-adversarial-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-adversarial.mjs` lints every pattern under
`compatibility/lint-adversarial/` with both the real `eslint-plugin-svelte`
(oracle) and native `rsvelte-lint`, comparing every finding by
`(ruleId, line, column, message)` — the same key as the real-world lint gate.
Unlike that gate, the population here is **constructed**: each pattern is written
to separate two plausible implementations of one rule, so a divergence is a
deliberate probe coming back positive rather than an accident of what published
code happens to contain.

**The expectation is that `lint-adversarial-known-failures.json` stays at 1 entry.**
It is not a burndown backlog: a new entry needs a reason that is *not*
"rsvelte is wrong here", and the entry below is the only such reason found
across 1365 patterns and 74 rules. Everything else the corpus surfaced (330
divergences on the first run, 35 more when it grew past 1000 patterns) was fixed.

`+` = rsvelte reports, oracle silent. `-` = oracle reports, rsvelte silent.

## The accepted entry

### `no-nested-style-tag/14-component-lookalike.svelte` `-svelte/html-self-closing 5:8`

`<Style />` — a component whose name differs from `style` only in case. Upstream
reports `html-self-closing` on it; rsvelte does not, and **rsvelte is right**.

`svelte-eslint-parser` blanks script/style/template blocks out of the template
before handing it to the Svelte compiler, using
`/<!--[\s\S]*?-->|<(script|style|template)([\s>])/giu`
(`lib/context/index.js:236-238`). That regex is **case-insensitive**, so `<Style `
matches, and the self-closing form is rewritten to `<S---- />`
(`lib/context/index.js:115-120`), which fails Svelte's component-name test. The
compiler therefore returns a `RegularElement`, `extractElementTags` restores the
name, and the rule sees an "HTML element" literally named `Style` →
`getElementType` `normal` → the default `"never"` → reported.

Verified against the compiler itself rather than inferred:
`svelte/compiler`'s `parse("<Style />", { modern: true })` yields
`Component Style`. rsvelte classifies from the compiler AST and agrees with it.

Measured boundary (direct `parseForESLint` probe): `<Style />` and `<Script />`
land on `html`; `<Style/>` with no space, `<Style></Style>`, `<Styled />`,
`x<Style />` and `<Template />` (explicitly guarded upstream) all land on
`component`.

Not reproduced, and that decision is not close. Element kind is shared by every
template rule, so deliberately misclassifying `<Style />` would have to be
threaded through all of them to buy this one row — and it would make rsvelte
disagree with the Svelte compiler about what a component is. Reported at
[`upstream_issues/svelte-eslint-parser-self-closing-style-lookalike-component.md`](../upstream_issues/svelte-eslint-parser-self-closing-style-lookalike-component.md).

The pattern is kept rather than renamed to a non-colliding component: its subject
is `no-nested-style-tag`, where both sides agree, and the case-lookalike name is
the whole point of the input. Expect this entry to disappear if upstream anchors
that regex case-sensitively; the ratchet is two-sided, so it will fail rather
than rot.

## Adding a pattern

Patterns are grouped one directory per rule. A pattern must be valid Svelte 5
that `svelte-eslint-parser` accepts — the harness treats an oracle parse error as
a **hard error** (a pattern that does not parse measures nothing), where the
collected corpus merely counts and skips it. Run one rule at a time with
`--filter '<rule>/'` while iterating; `--update` refuses to run under `--filter`
because it would delete every entry the filtered run did not measure.
