# lint-adversarial-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-adversarial.mjs` lints every pattern under
`compatibility/lint-adversarial/` with both the real `eslint-plugin-svelte`
(oracle) and native `rsvelte-lint`, comparing every finding by
`(ruleId, line, column, message)` — the same key as the real-world lint gate.
Unlike that gate, the population here is **constructed**: each pattern is written
to separate two plausible implementations of one rule, so a divergence is a
deliberate probe coming back positive rather than an accident of what published
code happens to contain.

`lint-adversarial-known-failures.json` holds **0 entries** and must stay empty.
It is not a backlog that may grow: all 1365 constructed patterns across 74
rules agree. Everything the corpus surfaced (330 divergences on the first run,
35 more when it grew past 1000 patterns) has been fixed or reproduced at the
narrowest compatibility boundary.

`+` = rsvelte reports, oracle silent. `-` = oracle reports, rsvelte silent.

## Last entry closed

### `no-nested-style-tag/14-component-lookalike.svelte` `-svelte/html-self-closing 5:8`

`<Style />` is a component whose name differs from `style` only in case.
Upstream reports `html-self-closing` on it because of a parser preprocessing
quirk; rsvelte now reproduces that classification inside this rule only.

`svelte-eslint-parser` blanks script/style/template blocks out of the template
before handing it to the Svelte compiler, using
`/<!--[\s\S]*?-->|<(script|style|template)([\s>])/giu`
(`lib/context/index.js:236-238`). That regex is **case-insensitive**, so `<Style `
matches, and the self-closing form is rewritten to `<S---- />`
(`lib/context/index.js:115-120`), which fails Svelte's component-name test. The
compiler therefore returns a `RegularElement`, `extractElementTags` restores the
name, and the rule sees an "HTML element" literally named `Style` →
`getElementType` `normal` → the default `"never"` → reported.

The compiler AST remains correct: `svelte/compiler`'s
`parse("<Style />", { modern: true })` yields `Component Style`, as does
rsvelte. `html_self_closing.rs` applies an oracle-compatibility adapter after
that shared AST boundary, so unrelated template rules continue to see a
component.

Measured boundary (direct `parseForESLint` probe): the parser's
`/>\s*$|^\s*$/m` prefix check means `<Style />`, `<Script />`,
`<div><Style /></div>`, and even `x\n<Style />` land on `html`; `<Style/>`
with no space, `<Style></Style>`, `<Styled />`, `x<Style />`, and
`<Template />` land on `component`. Unit tests pin both sides of that boundary.
The upstream defect remains documented at
[`upstream_issues/svelte-eslint-parser-self-closing-style-lookalike-component.md`](../upstream_issues/svelte-eslint-parser-self-closing-style-lookalike-component.md).

## Adding a pattern

Patterns are grouped one directory per rule. A pattern must be valid Svelte 5
that `svelte-eslint-parser` accepts — the harness treats an oracle parse error as
a **hard error** (a pattern that does not parse measures nothing), where the
collected corpus merely counts and skips it. Run one rule at a time with
`--filter '<rule>/'` while iterating; `--update` refuses to run under `--filter`
because it would delete every entry the filtered run did not measure.
