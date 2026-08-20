# lint-adversarial-fix-all-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-adversarial-fix-all.mjs` compares, per pattern under
`compatibility/lint-adversarial/`, the **text `--fix` produces with the whole
74-rule universe enabled** — the real `eslint-plugin-svelte` as oracle, native
`rsvelte-lint` as subject, both working on copies, both forced to `warn` on
every rule in `lint-universe.mjs`.

[`lint-adversarial-fix-known-failures.md`](lint-adversarial-fix-known-failures.md)
covers the same corpus with **one** rule enabled per pattern — the rule its
directory names — because resolving overlapping fixes *across* rules is ESLint's
driver policy rather than any rule's port. That scope leaves two populations
uncompared, and both turned out to hold defects:

- **a rule whose fixer touches a pattern filed under another rule's directory.**
  The per-rule gate never enables `svelte/html-quotes` on a `comment-directive/`
  pattern, so it could not see that rsvelte's `--fix` resolved
  `eslint-disable-line` against a different line table than its own report path
  (fixed; see below).
- **what a second pass sees.** A fix by rule A changes the text rule B is handed,
  which reaches arms no single-rule run can (`no-target-blank/10` below), and can
  hand a rule text that crashes it (`no-navigation-without-base/06`).

An entry needs a reason that is *not* "rsvelte is wrong here".

`lint-adversarial-fix-all-known-failures.json` holds 18 entries over 1364
compared patterns; on the run that baselined it the oracle rewrote 793 files and
rsvelte rewrote 792.

Two verdicts share the file, kept apart by the key so neither can suppress the
other on the same pattern: a bare `<id>` is a text divergence, and
`oracle-crash:<id>` is a pattern ESLint threw on while fixing, where there is no
text to compare.

Partition of `lint-adversarial-fix-all-known-failures.json` by cause: `14 + 1 + 1 + 1 + 1`

| cause | entries |
|---|---|
| rsvelte-only autofix (upstream rule is report-only) | 14 |
| upstream autofix defect we decline to reproduce | 1 |
| `svelte_meta_invalid_placement` is a parse error upstream, an analyze error here | 1 |
| a listed upstream-parser defect, surfaced by a fix oscillation | 1 |
| upstream rule crashes on text an earlier pass produced | 1 |

## What this gate found on its first run

**rsvelte's `--fix` and its report path resolved disable directives against
different line tables.** `lint_source_messages` filters on the line the finding
is *reported* on (`runner.rs`), which for the seven rules in
`diagnostic.rs::uses_eslint_line_table` is ESLint's table — the one that counts
U+2028 and U+2029 as line terminators. `fix_source_at` and `lint_source_raw`
filtered on `LineIndex::line`, the parser's table, which never does. Where the
two disagree the fix path and the report path disagree about which line a
directive covers, in both directions:

| pattern | report | `--fix` |
|---|---|---|
| `comment-directive/22-u2028-next-line.svelte` | suppressed | rewrote the source anyway |
| `comment-directive/23-u2029-disable-line.svelte` | reported at 2:9 | applied nothing |

Both reproduce with a **single** rule enabled (`svelte/html-quotes`), which is
what makes them the clearest possible statement of what the per-rule gate cannot
see: not an interaction, just a rule the per-rule gate never runs on that
pattern, because it derives the rule from the directory name. Both paths now go
through `LintDiagnostic::report_line`, and
`runner.rs::fix_honours_a_directive_across_a_js_line_separator` pins it.

The same shape as the `prefer-class-directive` U+FEFF find one gate over: two
implementations of one decision, and no gate that compares them to each other.

## Accepted entries

### `svelte/no-target-blank` — 14 patterns

```
no-target-blank/{01-basic, 02-rel-dynamic, 03-spread-and-shorthand,
04-dynamic-href, 05-component, 06-svelte-element, 07-bind-href,
08-external-variants, 09-options, 10-case-and-decoys, 11-svelte-self,
12-multibyte-crlf, opt-key-allow-referrer, opt-key-dynamic-never}.svelte
```

Thirteen of them are the per-rule gate's entries reproduced here, and
[`lint-adversarial-fix-known-failures.md`](lint-adversarial-fix-known-failures.md)
carries the mechanism: upstream's rule declares no `fixable` and reports only,
while rsvelte's port repairs the `rel` attribute, deliberately, because Svelte 5
dropped the compiler's `security-anchor-rel-noreferrer` warning and this rule is
the only place left where the repair can live.

**`10-case-and-decoys.svelte` is the fourteenth, and it is here and not there.**
Its links are all decoys for `no-target-blank`, so with only that rule enabled
neither side reports and the outputs are identical — which is exactly why the
per-rule doc names it as the directory's one unlisted pattern. With the universe
enabled, `svelte/no-useless-mustaches` first rewrites

```svelte
<a href="https://example.com/" target="_blank{''}">mustache in target, ok</a>
```

to `target="_blank"`, and the *next* pass hands `no-target-blank` a static
`_blank` it now flags. Both sides report it in that pass; only rsvelte has a
fixer. Same cause, reached only through another rule's edit.

### `shorthand-directive/16-never-mode-modifiers.svelte`

Upstream's `prefer: "never"` fix inserts `={name}` after the directive *name*
rather than after the *key*, so `style:color|important` becomes
`style:color={color}|important` — text that parses, compiles, and silently drops
the `!important`. rsvelte writes `style:color|important={color}`. Reported in
[`upstream_issues/eslint-plugin-svelte-shorthand-directive-modifier.md`](../upstream_issues/eslint-plugin-svelte-shorthand-directive-modifier.md);
the full evidence, including the two compiled outputs, is in the per-rule doc.

### `no-raw-special-elements/14-nested-inside-each.svelte`

Both sides report identically and produce the same pass-1 text; upstream's pass 2
never runs because `svelte-eslint-parser` calls the compiler's `parse()`, which
raises `svelte_meta_invalid_placement` from
`phases/1-parse/state/element.js:161`, while rsvelte raises it from
`phases/2_analyze/visitors/svelte_head.rs` — a phase the linter never reaches — so
rsvelte relints cleanly and fixes one level deeper. Neither output is a file
Svelte accepts; the input is unfixable by this rule. The per-rule doc carries the
verification.

### `no-nested-style-tag/14-component-lookalike.svelte`

Two causes stacked, and the divergence needs both.

The first is already a ratchet entry on the **report** gate, entry 4 in
[`lint-adversarial-known-failures.md`](lint-adversarial-known-failures.md), and
**rsvelte is the correct side of it**: `svelte-eslint-parser` blanks
`<(script|style|template)([\s>])` case-insensitively, so `<Style />` is rewritten
to `<S---- />` before the compiler sees it and comes back a `RegularElement`.
Upstream's `html-self-closing` therefore treats a component as an HTML element
and reports; rsvelte classifies from the compiler AST, which says `Component`,
and does not. Reported in
[`upstream_issues/svelte-eslint-parser-self-closing-style-lookalike-component.md`](../upstream_issues/svelte-eslint-parser-self-closing-style-lookalike-component.md).

The second is why it is invisible to the per-rule gate. Upstream's
`html-self-closing` fix expands `<Style />` to `<Style></Style>`, and on the next
pass it collapses it back: an oscillation, which ESLint's driver stops with its
`ESLintCircularFixesWarning`. With only `html-self-closing` enabled the loop ends
on the source text and the per-rule gate sees parity; adding
`html-closing-bracket-spacing` shifts the loop's parity and it ends on the
expanded text instead. Leave-one-out over the universe confirms the pair:
removing either rule makes the file unchanged again.

So the *text* divergence is ESLint driver policy, and the reason rsvelte has
nothing to oscillate is the listed parser defect. It stays listed here rather
than being cited only on the report gate, because a two-sided ratchet is what
makes the pairing fail the day either half moves.

### `oracle-crash:no-navigation-without-base/06-template-literals.svelte`

**ESLint throws; there is no oracle output to compare.** `svelte/no-useless-mustaches`
rewrites the pattern's `<a href={``}>` to `<a href="">`, and the next `--fix`
pass hands that to `svelte/no-navigation-without-base`, which reads
`node.value[0].type` without checking that the attribute has a value node —
`svelte-eslint-parser` gives `href=""` an empty `value` array.

Minimal reproduction, verified against v3.23.0 in a project declaring
`@sveltejs/kit`: `<a href="">x</a>` throws, `<a href="/y">x</a>` does not.
rsvelte reports `href=""` and does not crash. Reported in
[`upstream_issues/eslint-plugin-svelte-no-navigation-without-base-empty-href-crash.md`](../upstream_issues/eslint-plugin-svelte-no-navigation-without-base-empty-href-crash.md).

It is a ratchet entry rather than a hard abort because a crashing oracle would
otherwise make this gate unrunnable, and rather than a skip because the entry is
what fails the day upstream fixes it — which is when the pattern becomes
comparable again.
