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
`lint-adversarial-suggest-known-failures.json` currently holds 0 entries.
