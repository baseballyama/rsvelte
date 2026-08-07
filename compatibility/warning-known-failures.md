# Warning-parity known failures

Companion to `known-failures.md`, for the **warning** half of the corpus gate.

`scripts/compat-corpus/compile.mjs` records every compiler warning as
`(code, line, column)` in `warnings.json` beside the output; `verify.mjs`
compares them and ratchets two failure modes independently. Both ratchets are
shrink-only: an entry not listed here that diverges fails CI.

Regenerate after a change that moves warnings:

```
node scripts/compat-corpus/verify.mjs --no-fmt --update-warning-baseline
```

`--update-warning-baseline` touches **only** these files, never the output
ratchets — warning comparison needs no oxfmt normalization, so it is valid under
`--no-fmt`, which the output comparison is not.

## Why this gate exists

It did not exist until #2281, and its absence was measured, not assumed. The
corpus compiled every entry with both compilers and then **discarded
`result.warnings`**, so a warning divergence scored `MATCH` no matter how large
the corpus grew.

The proof was a corpus entry, not a constructed one:
`layerchart/docs/src/routes/+layout.svelte` carries a `// svelte-ignore
state_referenced_locally` before an object-literal property. rsvelte did not
honour it (#2256) and emitted a warning upstream does not — and the gate
reported that entry as passing. Adding this comparison turns the entire existing
corpus into a warning-parity gate at essentially zero marginal cost, since both
compilers already run on every entry.

## Why the three per-target files are currently identical

`warning-known-failures.client.json`, `.server.json` and `.client-dev.json` hold
the same 51 entries; the three position files hold the same 528. That is not a
bug in the partitioning — almost every warning is produced in Phase 1/2 (parse
and analyze), before the target is consulted, so a divergence shows up on all
three targets at once. Only target-specific codes (`node_invalid_placement_ssr`
and friends) can ever differ, and none of those diverge today.

The split is kept anyway: it costs nothing in code, matches the output ratchets,
and stays sensitive to an entry that starts diverging on a second target while
already listed for the first. Expect all six files to move together in a
burn-down PR.

## Warning codes (`warning-known-failures.<target>.json`, 51 entries each)

The multiset of warning **codes** differs: rsvelte warns where upstream does
not, or stays silent where upstream warns. This is a semantic bug — a user sees
noise they cannot suppress, or misses a diagnostic they should have seen.

Not every entry is equally bad. Of the 51 entries that still diverge, **6 are
under-warnings** — rsvelte stays silent where upstream warns
(`a11y_no_static_element_interactions` ×3, `state_referenced_locally` ×2,
`options_missing_custom_element` ×1). The other 45 are noise the user cannot
suppress, 116 tuples over five codes. Both are defects, but a missing diagnostic
and an extra one fail differently, and the ratchet count alone does not
distinguish them; no entry diverges in both directions at once.

Clusters identified so far:

- **`component_name_lowercase` over-warning** — rsvelte flags lowercase names
  that upstream accepts (seen across `svelte-maplibre` example routes).
- **`svelte_self_deprecated` / `reactive_declaration_module_script_dependency`
  over-warning** — concentrated in the Svelte migrate fixtures, which are out of
  scope for codegen but still compile here.

`attribute_quoted` was burned down: 19 entries, taking the ratchet from 70 to 51,
with **0 remaining tuples in either direction**. Both counts are read off
`verify.mjs --no-fmt --update-warning-baseline` runs over the same 14,130-entry
corpus, not off the issue that motivated the fix. It was **one
predicate**, not the SVG-namespace story this file previously recorded: upstream
reaches the check only through `validate_attribute`, and both callers guard it
with `analysis.runes`, so legacy components never warn. rsvelte ran it
unconditionally at all four emission sites. The earlier description was inferred
from where the entries happened to cluster in the corpus rather than from
upstream's control flow — worth remembering when reading the clusters above,
which were written the same way.

## Warning positions (`warning-position-known-failures.<target>.json`, 528 entries each)

The codes agree but a `(line, column)` does not. There are **two** systemic
causes, not one, and they need different edits. Measured over the 625 entries
listed before the a11y half was fixed, which carried 967 mismatching tuples
between them:

- **No span at all (649 tuples, 67.1%)** — rsvelte emits the warning with
  `start === undefined` where upstream reports a real position, so an editor or
  CLI that places a squiggle from `warning.start` gets nothing. Concentrated in
  `event_directive_deprecated` (142), `element_invalid_self_closing_tag` (118),
  `export_let_unused` (110), `non_reactive_update` (102) and
  `options_missing_custom_element` (53). Here the fix really is mechanical:
  attach the span already available at the emission site.
- **A span that is real but too wide (318 tuples, 32.9%)** — every one of these
  is an a11y code, and every one is a *column*-only disagreement: 315 column-only,
  3 line-and-column, and **0 line-only**. The line agrees because the attribute
  and its element are on the same line; the column disagrees because rsvelte
  reported the element where upstream reports the attribute. This one is not
  "attach the missing span": the span was attached, by the wrong owner. See below.

**The discriminator, for the next mixed position bucket:** count line-only
mismatches. A bucket with *zero* of them is a wrong-**owner** bucket, not a
missing-span one — if two candidate nodes sit on the same line (an attribute and
its element always do), only the column can move, so a span attached to the
wrong node produces column-only disagreements and nothing else. That test is
geometric and costs one pass over the tuples; it does not require reading any
entries, and it is what separated these two causes. Reach for it before
inspecting cases.

Split from the code ratchet on purpose: this backlog is far larger, and folded
together it would hide every semantic regression above.

### The a11y half (fixed)

Fixing it took the list from 625 entries to **529**: 96 removed, 0 added, and the
code ratchet unmoved at 70.

`2_analyze/visitors/regular_element.rs` stamped `element.start`/`element.end` on
any a11y warning that arrived spanless, and `shared/a11y/mod.rs` pushed *every*
warning spanless — so the element fallback won even for the warnings upstream
attaches to an attribute. Of the 17 warn sites inside `a11y/index.js`'s first
attribute loop (`:108`-`:287`), 14 pass `attribute` and exactly three pass
`node`. The fix gives each attribute-scoped warning its attribute's
span at the point it is raised, leaving the element fallback to cover only the
three codes upstream genuinely scopes to the element
(`a11y_interactive_supports_focus`,
`a11y_no_interactive_element_to_noninteractive_role`,
`a11y_no_noninteractive_element_to_interactive_role`).

Codes cleared, summing to all 317 (`120 + 59 + 41 + 24 + 24 + 20 + 10 + 4 + 3 +
3 + 2 + 7x1`): `a11y_role_supports_aria_props` 120,
`a11y_role_supports_aria_props_implicit` 59, `a11y_no_redundant_roles` 41,
`a11y_no_abstract_role` 24, the `a11y_incorrect_aria_attribute_type*` family 24
(boolean 6, tokenlist 5, integer 4, token 4, bare 3, tristate 2),
`a11y_invalid_attribute` 20, `a11y_autofocus` 10,
`a11y_role_has_required_aria_props` 4, `a11y_autocomplete_valid` 3,
`a11y_misplaced_scope` 3, `a11y_unknown_role` 2, and one tuple each of
`a11y_aria_activedescendant_has_tabindex`, `a11y_unknown_aria_attribute`,
`a11y_aria_attributes`, `a11y_misplaced_role`, `a11y_hidden`, `a11y_accesskey`
and `a11y_positive_tabindex` (seven codes).

The tail matters for a reason beyond bookkeeping: an earlier draft of this list
stopped at the counts of 3 and reported the type family as 22 rather than 24,
so it summed to 306 against a measured 317. A list that reads as exhaustive and
is not is the same defect as a cause inferred from a code name — **state the
sum, or say the list is partial.**

Note that `a11y_role_supports_aria_props` was previously listed above as a
missing-position code. It never was: rsvelte always emitted a span for it. That
mis-attribution is exactly what a single-cause reading of this bucket produces —
the split above was measured per tuple, not inferred from the code names.

What is left is the 649 missing-span tuples, unchanged.

A single `a11y_figcaption_index` disagreeing on **both** line and column used to
sit beside them, recorded here as a third cause that was "structurally out of
reach rather than merely unobserved": upstream raises it at `:532`, outside both
attribute loops, on `children[index]`, so none of the four stamp sites can see it
and `stamp_attribute` skips anything that already carries a span. It was noted
that the argument held "regardless of what any run showed".

**The argument was sound and the conclusion was wrong** (#2490). Every step about
the stamp sites was true; what did not follow is that the span was therefore
unreachable. The fix does not stamp at all — it constructs the warning with
`children[idx]`'s span at the emission site, which is what upstream does
(`w.a11y_figcaption_index(children[index])`), and the caller's element fallback
then leaves it alone. The reasoning enumerated the repair mechanisms that exist
today and mistook that for the set of mechanisms available. An "out of reach"
claim needs the second half stated: out of reach *of what*, and why no new
emission site may be added.

`perf_avoid_nested_class` was the first of these to be burned down (#2349),
and it cost two entries rather than the one the `runed` / `svelte-toolbelt`
enrolment attributed: alongside `is-document-visible.test.svelte.ts` it also
cleared `svelte/…/validator/samples/inline-new-class-2/input.svelte`, which no
issue named because the corpus reports counts rather than per-code attribution.
Expect the same when other codes in the list above are fixed — read the movement
off a full run, do not predict it from the issue that motivated the fix.
