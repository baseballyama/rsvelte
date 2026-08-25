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

## Why the four per-target files are currently identical

`warning-known-failures.<target>.json` holds the same 90 entries on all four,
and `warning-position-known-failures.<target>.json` 0 entries on all four. That is not a
bug in the partitioning — almost every warning is produced in Phase 1/2 (parse
and analyze), before the target is consulted, so a divergence shows up on all
four targets at once. Only target-specific codes (`node_invalid_placement_ssr`
and friends) can ever differ, and none of those diverge today.

The split is kept anyway: it costs nothing in code, matches the output ratchets,
and stays sensitive to an entry that starts diverging on a second target while
already listed for the first. Expect all eight files to move together in a
burn-down PR.

## Warning codes (`warning-known-failures.<target>.json`, 90 entries each)

The multiset of warning **codes** differs: rsvelte warns where upstream does
not, or stays silent where upstream warns. This is a semantic bug — a user sees
noise they cannot suppress, or misses a diagnostic they should have seen.

Not every entry is equally bad. Of the 90 entries that still diverge, **23 are
under-warnings** — rsvelte stays silent where upstream warns — and **67 are
over-warnings**, noise the user cannot suppress. No entry diverges in both
directions at once. A missing diagnostic and an extra one fail
differently, and the ratchet count alone does not distinguish them:

Partition of `warning-known-failures.<target>.json` by direction: `23 + 67`

**79 of the 89 pre-existing entries arrived with the wave-2 enrolment (#3130)**,
which took the corpus from 37 corpus sources to 104. Across all 89 pre-existing
entries, the codes counted over entries rather than tuples sum to exactly 89:
`css_unused_selector` 48, `state_referenced_locally` 22,
`non_reactive_update` 8, `component_name_lowercase` 6,
`a11y_consider_explicit_label` 4,
`perf_avoid_nested_class` 1. `css_unused_selector` is half the file and the
burn-down target; it is the one that is neither over- nor under-warning in a
fixed direction — it is a pruning disagreement, so it moves with the CSS entries
in [`known-failures.md`](known-failures.md).

The 90th entry, `pattern/issues/3482-template-class-indent.svelte`, deliberately
adds another nested class to exercise client output indentation. Its four target
tuples are under-warnings for the already-known `perf_avoid_nested_class` gap;
that diagnostic is independent of the output-formatting repair and remains
ratcheted here rather than suppressing the fixture from the output gate.

The file was 171 entries before this branch was rebased onto `main`, and this is
the second re-measurement against a moving `main`: the first removed **81 and
added none**, all of them `reactive_declaration_module_script_dependency` (the
code that used to head the list at 83 entries and is now absent from it
entirely), and the second removed a further **2**, taking
`options_missing_custom_element` to 0 and `a11y_consider_explicit_label` from 5
to 4. Neither is this branch's fix; the entries had simply never been
re-measured against a tree that carried them.

The `options_missing_custom_element` under-warning that used to sit in the first
half is gone, and it was one condition rather than a missing pass:
`<svelte:options customElement={null} />` is skipped by `read_options` *before*
it sets `component_options.customElement`, but upstream's analyze loop keys on
the attribute **name**, so it still warns. rsvelte keyed on the parsed option and
so stayed silent — and the entry that reproduced it,
`runtime-browser/custom-elements-samples/$$slot-dynamic-content/main.svelte`, is
the corpus's only file with that spelling. It is inlined as a test in
`crates/rsvelte_core/tests/svelte_options_deprecations.rs`, so the shape keeps a
guard now that the ratchet no longer holds it.

Four entries left in #3027, and they are one cause in both directions: phase 2's
`UpdateExpression` visitor never walked its argument, so `x++` recorded no
reference to `x`. Three legacy components whose only use of a prop was `p++` were
reported `export_let_unused` (5 tuples), and `runtime-runes/derived-unowned-12`,
whose only read of a `$derived` is `linked.current++`, was **missing** the
`state_referenced_locally` upstream raises — the same omission over- and
under-warning at once, which is why the two directions moved together.

Three earlier under-warnings were the whole of the
`a11y_no_static_element_interactions` cluster
(`runtime-legacy/samples/dynamic-element-{event-handler1,event-handler2,pass-props}`),
removed by #2523: the a11y pass had no call site in `svelte_element.rs`, so
**every** element a11y rule was absent on `<svelte:element>`. The corpus saw only
this one code because it holds so few dynamic elements with an a11y-relevant
shape — the class was far wider than the three entries, which is why the fix
lands its own gate rather than relying on this ratchet to have measured it.

Clusters identified so far:

- **`component_name_lowercase` over-warning** — rsvelte flags lowercase names
  that upstream accepts (seen across `svelte-maplibre` example routes).

The **`reactive_declaration_module_script_dependency` over-warning** that used to
head this list is gone, and its 62 tuples were one predicate, not the "migrate
fixtures" story the clustering suggested. Upstream's rule is
`binding.scope === analysis.module.scope && binding.reassigned` inside a `$:`
statement, and it declares the synthetic `$store` subscription binding in
`instance.scope` (`2-analyze/index.js`), so a store auto-subscription can never
satisfy it. rsvelte parks that synthetic binding in scope 0 alongside the real
module-script declarations, so **every** `$: $store = …` warned. That took 12
entries off this ratchet — 8 of them real-world files (`layercake`,
`svelte-form-builder`, four `svelte-ux` components, `svelthree`), which is why
"concentrated in the migrate fixtures" was the wrong read: the fixtures were
merely where the entries were counted from.

The `svelte_self_deprecated` half of the old cluster is fixed: the warning is
gated on `analysis.runes` upstream, and rsvelte emitted it in legacy mode too,
where `<svelte:self>` is the supported spelling. That removed 19 entries from
each of the three files, verified per entry against official 5.56.8 on all three
targets.

`attribute_quoted` was burned down independently: 19 further entries — the two
burn-downs together take the ratchet from 70 to 28 — four of the entries needed
both fixes, so neither burn-down could remove them alone — with **0 remaining tuples
in either direction**. Both counts are read off
`verify.mjs --no-fmt --update-warning-baseline` runs over the same 14,130-entry
corpus, not off the issue that motivated the fix. It was **one
predicate**, not the SVG-namespace story this file previously recorded: upstream
reaches the check only through `validate_attribute`, and both callers guard it
with `analysis.runes`, so legacy components never warn. rsvelte ran it
unconditionally at all four emission sites. The earlier description was inferred
from where the entries happened to cluster in the corpus rather than from
upstream's control flow — worth remembering when reading the clusters above,
which were written the same way.

## Warning positions (`warning-position-known-failures.<target>.json`, 0 entries each)

The codes agree but a `(line, column)` does not. **No entry remains.**

The last one — `svelte/…/migrate/samples/accessors/output.svelte`, code
`options_deprecated_immutable`, rsvelte reporting **no position at all** (`?:?`)
— was the `<svelte:options>` reader, the one emission site the span-attachment
pass never reached. Reading the whole of upstream's loop rather than attaching a
span at the one site turned out to matter: the warning was raised from a
per-option `if`, and upstream raises all three `<svelte:options>` diagnostics
from a single walk of `root.options.attributes`, which is also what fixes their
**order** (source order of the attributes, not the order the checks are written
in) and what makes `options_deprecated_accessors` fire at all. **An empty
ratchet makes "no worse than last time" a zero-information bar here** — the
guards are the pinned `(code, line, column)` triples in
`crates/rsvelte_core/tests/svelte_options_deprecations.rs`.

The three `attribute_avoid_is` entries were the same shape and are fixed:
upstream passes the attribute node (`2-analyze/visitors/shared/element.js`), and
the emission site in `2_analyze/visitors/shared/element.rs` already had
`attr_start`/`attr_end` in hand from the enclosing attribute loop — the two
neighbouring warnings raised from that same loop were already spanned.

### How the backlog was cleared

This ratchet held **528** entries per target and now holds none. Two systemic causes
were measured over the 625 entries listed before the a11y half was fixed, which
carried 967 mismatching tuples between them:

- **No span at all (649 tuples, 67.1%)** — rsvelte emitted the warning with
  `start === undefined` where upstream reports a real position, so an editor or
  CLI that places a squiggle from `warning.start` got nothing. Concentrated in
  `event_directive_deprecated` (142), `element_invalid_self_closing_tag` (118),
  `export_let_unused` (110), `non_reactive_update` (102) and
  `options_missing_custom_element` (53). "Attach the span already available at
  the emission site" describes only part of it — see the three causes below.
- **A span that is real but too wide (318 tuples, 32.9%)** — every one an a11y
  code, and every one a *column*-only disagreement: 315 column-only, 3
  line-and-column, and **0 line-only**. The line agreed because the attribute and
  its element are on the same line; the column disagreed because rsvelte reported
  the element where upstream reports the attribute. Not "attach the missing
  span": the span was attached, by the wrong owner.

**The discriminator, for the next mixed position bucket:** count line-only
mismatches. A bucket with *zero* of them is a wrong-**owner** bucket, not a
missing-span one — if two candidate nodes sit on the same line (an attribute and
its element always do), only the column can move, so a span attached to the
wrong node produces column-only disagreements and nothing else. That test is
geometric and costs one pass over the tuples; it does not require reading any
entries, and it is what separated these two causes. Reach for it before
inspecting cases.

Split from the code ratchet on purpose: this backlog was far larger, and folded
together it would have hidden every semantic regression above.

### The a11y half

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

**These spans have no gate but their unit tests.** The ratchet compares one
`(code, line, column)` per warning, so `end` is not observable by it at all, and
neither is the message text at per-message granularity — `diagnostics_test.rs`
pins every diagnostic's wording behind a single digest, which reports that
*something* changed without saying what to, or whether the new text is right.
Where a gate is blind to a field by construction, the unit test is not a
convenience; it is the only oracle (`tests/warning_span_attach.rs`).

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
