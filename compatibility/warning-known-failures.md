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
the same 70 entries; the three position files hold the same 75. That is not a
bug in the partitioning — almost every warning is produced in Phase 1/2 (parse
and analyze), before the target is consulted, so a divergence shows up on all
three targets at once. Only target-specific codes (`node_invalid_placement_ssr`
and friends) can ever differ, and none of those diverge today.

The split is kept anyway: it costs nothing in code, matches the output ratchets,
and stays sensitive to an entry that starts diverging on a second target while
already listed for the first. Expect all six files to move together in a
burn-down PR.

## Warning codes (`warning-known-failures.<target>.json`, 70 entries each)

The multiset of warning **codes** differs: rsvelte warns where upstream does
not, or stays silent where upstream warns. This is a semantic bug — a user sees
noise they cannot suppress, or misses a diagnostic they should have seen.

Treat every entry here as a real defect awaiting a root cause. Clusters
identified so far:

- **`attribute_quoted` over-warning on namespaced SVG child components** —
  rsvelte emits the warning for attributes the official compiler does not
  consider quoted-redundant.
- **`component_name_lowercase` over-warning** — rsvelte flags lowercase names
  that upstream accepts (seen across `svelte-maplibre` example routes).
- **`svelte_self_deprecated` / `reactive_declaration_module_script_dependency`
  over-warning** — concentrated in the Svelte migrate fixtures, which are out of
  scope for codegen but still compile here.

## Warning positions (`warning-position-known-failures.<target>.json`, 75 entries each)

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

Both are position-only divergences and semantically inert — the right diagnostic
is reported, with the right message, at a wrong or absent location.

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

What is left is 650 tuples: the 649 missing-span ones, unchanged, plus a single
`a11y_figcaption_index` that disagrees on **both** line and column. That one is a
third cause, and it is structurally out of reach rather than merely unobserved:
upstream raises it at `:532`, outside both attribute loops, on `children[index]`
— so none of the four stamp sites can see it, and `stamp_attribute` skips
anything that already carries a span. That argument holds regardless of what any
run showed, which is why it is the one to record.

### "One systemic cause" was a hypothesis, and it was wrong

The five codes that dominated the missing-span half — `event_directive_deprecated`
(142 tuples), `element_invalid_self_closing_tag` (118), `export_let_unused`
(110), `non_reactive_update` (102), `options_missing_custom_element` (53), 525
of 649 between them — looked like one bug because they shared one *symptom*.
They had **three** different causes:

- **The visitor already holds the warn target.** `element_invalid_self_closing_tag`
  and `event_directive_deprecated` had `element` / `on` in scope and simply did
  not pass them. This is the only one of the three for which "attach the span
  already available at the emission site" is an accurate description.
- **The visitor holds the wrong node.** Upstream warns
  `options_missing_custom_element` on the `customElement` **attribute**
  (`index.js:692`), while the analysis holds `<svelte:options>`. Attaching what
  was in hand would have produced a plausible span pointing at the wrong thing —
  the same failure as the a11y element-vs-attribute bucket, which is how that
  bucket got misfiled as a missing-span one.
- **The target is not a node in the tree at all.** `non_reactive_update` and
  `export_let_unused` warn on `binding.node`, the declaration identifier, and
  the binding records only `declaration_start`. The end has to be reconstructed
  from the name's byte length, which is a data-availability problem rather than
  a plumbing one.

**Where to look, not just what to doubt:** the earlier reading grouped by
*symptom* (`start === undefined`), which is downstream of all three mechanisms
and therefore cannot separate them at all. What splits them is the warn
**target** — the *input* to the diagnostic rather than its output. Look up each
code's upstream warn node before writing one fix for several codes. Reach for
this and the line-only test above *before* reading entries.

Worth stating because the single-cause reading is what produced every earlier
error in this file. A shared symptom is not evidence of a shared mechanism; the
cheap check is to look up each code's upstream warn target before writing one
fix for all of them.

What is left, measured on the rebased tree after both this fix and the a11y one
(`verify.mjs --no-fmt --update-warning-baseline`, 14,130 corpus entries): 75
entries, one mismatching tuple each. 74 are missing-span, spread over 25 codes
with no code above 9 — there is no next large cluster here. The 75th is the
`a11y_figcaption_index` predicted above, still disagreeing on both line and
column, and still structurally out of reach of the four stamp sites.

**Do not reach that number arithmetically — it is not reachable that way.** From
625 (before either fix), #2384 alone removed 96 and this change alone removed
450, and those two removal sets are **disjoint**. So both set arithmetic (625 −
546 = 79) and the subtraction a rebase invites (529 − 450 = 79) give 79. The
measured answer is 75, because **4 entries are cleared only when both fixes are
present** and by neither alone:

```
svelte/packages/svelte/messages/compile-warnings/a11y.md/16.svelte
svelte/documentation/docs/98-reference/.generated/compile-warnings.md/16.svelte
svelte.dev/…/98-reference/.generated/compile-warnings.md/16.svelte
svelte.dev/…/98-reference/30-compiler-warnings.md/18.svelte
```

All four are listed in the 625, in #2384's 529 **and** in this PR's 175, and in
neither's successor — the signature of an entry needing both. The ratchet is
keyed per *entry* while the comparison is per *tuple*, so an entry with any
surviving tuple stays listed; each of these must therefore carry at least two
mismatching tuples, at least one reachable only by each fix. Disjoint removal
sets are not enough to make the counts add: the interaction lives inside the
entries, not between the sets. Re-baseline off a run, never off the previous
number.

**These spans have no gate but their unit tests.** The ratchet compares one
`(code, line, column)` per warning, so `end` is not observable by it at all, and
neither is the message text at per-message granularity — `diagnostics_test.rs`
pins every diagnostic's wording behind a single digest, which reports that
*something* changed without saying what to, or whether the new text is right.
Where a gate is blind to a field by construction, the unit test is not a
convenience; it is the only oracle.

**On column units, so the tests are not read as settling more than they do:**
columns are UTF-16 code units on both sides, matching upstream's locator over a
JS string. A BMP identifier such as `プロップ` cannot show this — a `char` count
and a UTF-16 count agree everywhere in the BMP — so it pins only byte-`end`
against column. The astral case (`𝕏`, U+1D54F: 1 char, 2 UTF-16 units, 4 bytes)
is what separates them, and rsvelte already agrees with upstream at 19-21 there.
Both are pinned, separately and under names that say which.

`perf_avoid_nested_class` was the first of these to be burned down (#2349),
and it cost two entries rather than the one the `runed` / `svelte-toolbelt`
enrolment attributed: alongside `is-document-visible.test.svelte.ts` it also
cleared `svelte/…/validator/samples/inline-new-class-2/input.svelte`, which no
issue named because the corpus reports counts rather than per-code attribution.
Expect the same when other codes in the list above are fixed — read the movement
off a full run, do not predict it from the issue that motivated the fix.
