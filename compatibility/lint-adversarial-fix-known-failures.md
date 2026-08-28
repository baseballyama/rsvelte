# lint-adversarial-fix-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-adversarial-fix.mjs` compares, per pattern under
`compatibility/lint-adversarial/`, the **text `--fix` produces** with only the
rule its directory names enabled — the real `eslint-plugin-svelte` as oracle,
native `rsvelte-lint` as subject, both working on copies.

A fix appears in no other comparison this project runs. `lint-adversarial.mjs`
and `lint-verify.mjs` key on `(ruleId, line, column, message)`, which cannot see
an edit at all: a rule can report at exactly the right position and still write
the wrong replacement text, or write correct text over the wrong range.
`lint-adversarial-suggest.mjs` compares suggestions, which by definition are the
edits `--fix` never applies. Upstream's own fixtures gate this only for the
shapes upstream ships (`crates/rsvelte_lint/tests/eslint_plugin_oracle.rs`,
`*-output.svelte`).

Fixes are compared one rule at a time rather than with the whole universe
enabled, because ESLint resolves overlapping fixes *across* rules by a
scheduling policy that belongs to ESLint's driver rather than to any rule's
port. Within a rule both sides multi-pass to a fixpoint (10 passes, ESLint's
`Linter.verifyAndFix` bound; `runner.rs::fix_all` mirrors it), so an entry here
can be a difference in what a *later* pass sees rather than in any single edit —
the gate runs to the same ten-pass fixpoint even when its ratchet is empty.

An entry needs a reason that is *not* "rsvelte is wrong here".

`lint-adversarial-fix-known-failures.json` holds **0 entries**.

Partition of `lint-adversarial-fix-known-failures.json` by cause: `0`

The gate found one defect no other lint gate could have: a rule's *fix* path and
its *report* path had two different notions of whitespace.
`prefer-class-directive` reported through `js_whitespace` (JS semantics, U+FEFF
included) but trimmed through Rust's `str::trim*` (Unicode `White_Space`, U+FEFF
excluded), so a `class` value padded with U+FEFF was reported at the same
position on both sides and rewritten differently. That split is invisible to
every gate keyed on `(ruleId, line, column, message)` by construction. Both paths
now go through `js_trim` / `js_trim_start` / `js_trim_end`.

## Accepted entries

None.
