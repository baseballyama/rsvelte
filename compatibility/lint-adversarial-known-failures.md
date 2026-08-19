# lint-adversarial-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-adversarial.mjs` lints every pattern under
`compatibility/lint-adversarial/` with both the real `eslint-plugin-svelte`
(oracle) and native `rsvelte-lint`, comparing every finding by
`(ruleId, line, column, message)` — the same key as the real-world lint gate.
Unlike that gate, the population here is **constructed**: each pattern is written
to separate two plausible implementations of one rule, so a divergence is a
deliberate probe coming back positive rather than an accident of what published
code happens to contain.

**The expectation is that `lint-adversarial-known-failures.json` stays at 5 entries.**
It is not a burndown backlog: a new entry needs a reason that is *not*
"rsvelte is wrong here", and the five below are the only such reasons found
across 1365 patterns and 74 rules. Everything else the corpus surfaced (330
divergences on the first run, 35 more when it grew past 1000 patterns) was fixed.

`+` = rsvelte reports, oracle silent. `-` = oracle reports, rsvelte silent.

## The five accepted entries

### 1. `html-closing-bracket-new-line/05-script-style-tags.svelte` `+svelte/block-lang 7:1`

An **upstream parser** artifact, not a rule difference. The pattern closes its
style block as `</style⏎⏎>`. `svelte-eslint-parser` does not produce a
`SvelteStyleElement` for that spelling, so `block-lang`'s `SvelteStyleElement`
visitor never fires and the block is never checked; rsvelte's parser does
recognise it and reports the `lang="css"` that upstream's own default option
(`style: null`) disallows.

Measured, not assumed: with the end tag written `</style>` and nothing else
changed, upstream reports both blocks (`1:1` script and `7:1` style); with
`</style⏎⏎>` it reports only the script. Matching upstream here would mean
teaching rsvelte's parser to *drop* a style element Svelte itself accepts.

### 2. `no-top-level-browser-globals/03-guard-browser.svelte` `+svelte/no-top-level-browser-globals 7:14`

The `globals`-version split already documented as **H4** in
`compatibility/lint-known-failures.md` and excluded by name in
`MANUAL_EXCLUSIONS` (`scripts/compat-corpus/lint-verify.mjs`), reproduced here on
`navigator`. Upstream computes its global set as `globals.browser ∖ globals.node`;
modern Node declares `navigator`, so upstream can never flag a top-level
`navigator` no matter what the harness declares. rsvelte keeps flagging it
because eslint-plugin-svelte's own bundled fixtures — the authority the
exact-fixture oracle gate enforces — expect exactly that report for this class.
The two upstream artefacts disagree; rsvelte follows the fixtures.

### 3. `no-unused-svelte-ignore/10-style-scss-css-ignore.svelte` `-svelte/no-unused-svelte-ignore 2:20`

A `<!-- svelte-ignore css_unused_selector -->` in front of `<style lang="scss">`.
Neither linter can run a preprocessor here, but they draw opposite conclusions
from that: the oracle blanks the block, sees no CSS warning, and calls the ignore
unused; rsvelte deliberately treats a CSS ignore on a non-CSS dialect as **used**,
because reporting it would be a false positive for every project that does have
the preprocessor configured. This is the same reasoning the exact-fixture gate
records for `no-unused-svelte-ignore/invalid/style-lang0*`, whose expectations
upstream recorded *with* the preprocessor installed.

### 4. `sort-attributes/07-lookahead-order.svelte` `-svelte/sort-attributes 5:14`

A custom `order` option containing a JS regex with lookahead
(`"/^(?=x-)x-a$/u"`). Rust's `regex` crate does not implement lookaround, so the
pattern fails to compile and the order group is dropped. Accepted as a **known
engine limitation** rather than fixed, because the alternative is a
lookaround-capable engine (`fancy-regex`) in a linter whose rule set is
performance-critical, for a JS-only construct in one rule's option. Plain and
`(?i)`-style patterns in `order` are handled and covered by sibling patterns.
Note the failure is silent today: if this is ever revisited, the first move is to
make an uncompilable `order` pattern observable rather than to widen the engine.

### 5. `no-nested-style-tag/14-component-lookalike.svelte` `-svelte/html-self-closing 5:8`

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
