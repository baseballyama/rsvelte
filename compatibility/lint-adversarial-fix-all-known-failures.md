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
  which reaches arms no single-rule run can (`no-target-blank/10` was one), and can
  hand a rule text that crashes it (`no-navigation-without-base/06`).

An entry needs a reason that is *not* "rsvelte is wrong here".

`lint-adversarial-fix-all-known-failures.json` holds **1 entry** over 1364
compared patterns.

Two verdicts share the file, kept apart by the key so neither can suppress the
other on the same pattern: a bare `<id>` is a text divergence, and
`oracle-crash:<id>` is a pattern ESLint threw on while fixing, where there is no
text to compare.

Partition of `lint-adversarial-fix-all-known-failures.json` by cause: `1`

| cause | entries |
|---|---|
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
