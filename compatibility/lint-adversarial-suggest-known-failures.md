# lint-adversarial-suggest-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-adversarial-suggest.mjs` compares, per finding
position, the **ordered list of `{desc, text produced by applying that one
suggestion}`** for every pattern under `compatibility/lint-adversarial/`, with
the real `eslint-plugin-svelte` as oracle and native `rsvelte-lint` as subject.

A suggestion is an editor-offered code action that `--fix` never applies, so it
appears in no other comparison this project runs: `lint-adversarial.mjs` and
`lint-verify.mjs` key on `(ruleId, line, column, message)`, and
`lint-adversarial-fix.mjs` compares the text `--fix` produces — which by
definition excludes every suggestion. The comparison is on the resulting TEXT
rather than the edit range, because ESLint's ranges are UTF-16 code units into a
JS string and rsvelte's are UTF-8 byte offsets, so equal edits have unequal
coordinates.

An entry needs a reason that is *not* "rsvelte is wrong here".
`lint-adversarial-suggest-known-failures.json` currently holds 1 entry.

## Accepted entries

### `html-closing-bracket-new-line/05-script-style-tags.svelte` `svelte/block-lang 7:1`

Not an independent divergence: it restates the report-level entry of the same
name in
[`lint-adversarial-known-failures.md`](lint-adversarial-known-failures.md).
`svelte-eslint-parser` builds no `SvelteStyleElement` for a `</style⏎⏎>` end
tag, so upstream's rule never runs and offers no suggestion, while rsvelte's
parser recognises the block and reports it — with the suggestion its
`enforceStylePresent` arm carries. The comparison key starts with the finding
position, so a finding only one side reports lands here as an empty list against
a one-element list.

It is listed rather than skipped because the alternative — comparing suggestions
only where the *report* already matches — would silently drop this whole class,
and the class contains real cases: a rule that reports correctly but attaches a
suggestion upstream does not attach would look identical to a rule that does not
report at all. Expect this entry to disappear if the report-level entry is ever
resolved; the ratchet is two-sided, so it will fail rather than rot.
