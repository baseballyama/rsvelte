# validator-known-failures.json — why entries are accepted

`crates/rsvelte_core/tests/validator.rs` asserts full upstream parity per
fixture — warning `code`/`message`/`start`/`end` and error `start`/`end` — instead
of only comparing diagnostic counts, mirroring what
`packages/svelte/tests/validator/test.ts` checks. The ratchet is shrink-only in
**both** directions: a new failure fails the run, and so does a listed entry that
already passes, so an entry that starts passing must be removed by the change
that made it pass.

## Current baseline: `validator-known-failures.json`, 181 entries

Every cluster count below is measured from the failure report the suite prints,
by classifying each block on what actually diverges, not by subtracting from the
previous baseline:

| cluster | entries | what diverges |
|---|---:|---|
| error span not populated | 141 | `start`/`end` come back `None..None` |
| warning span-only | 36 | `code` and `message` match; spans differ |
| warning content | 4 | codes, messages or their order differ |
| | **181** | |

- **Error spans not populated (141).** Many `AnalysisError` call sites construct
  the error without threading the triggering node's span through, so `start`/`end`
  come back `None..None` instead of the real source range (e.g.
  `css-invalid-global-selector-2`, `const-tag-readonly-1`,
  `window-binding-invalid-dimensions`). This is a structural span-plumbing gap
  across dozens of call sites in
  `crates/rsvelte_core/src/compiler/phases/2_analyze` rather than one bug — fixing
  it means auditing each `AnalysisError::*` construction individually.

- **Warning span-only (36).** The warning `code` and `message` match upstream
  exactly and appear in the same order; only the reported `start`/`end` differs —
  typically rsvelte reports `None..None` or a whole-node span where upstream
  reports a narrower sub-span (an attribute value, a role token, an identifier).
  Each is a narrow-the-span fix once the underlying node's precise range is
  identified (per-rule, not architectural).

- **Warning content (4).** These are *not* span bugs, and fixing the spans would
  leave every one of them failing. They are listed individually below because a
  cluster of four has no excuse to be described in aggregate.

### The four content divergences

- **`a11y-anchor-in-svg-is-valid` — the diagnostic names the wrong attribute.**
  rsvelte reports `'' is not a valid href attribute` for `<a xlink:href=''>`
  inside an `<svg>`; upstream reports `'' is not a valid xlink:href attribute`.
  `a11y/mod.rs:490` passes the literal `"href"` where upstream passes
  `href.name`, so the message names an attribute that is not in the source.
  This is a user-visible correctness bug, not a formatting difference.

- **`unknown-code` — warning emission order, not spans.** All six warnings match
  on code and message and the multisets are equal, but rsvelte emits the three
  `svelte-ignore` comment-code warnings (`legacy_code`, `unknown_code`) as a
  batch ahead of the three a11y warnings, where upstream interleaves all six in
  source order (lines 3, 5, 8, 10, 13, 14). Neither compiler sorts its warning
  list, so this is a genuine difference in *when* the comment pass runs, and the
  ordered comparison in `warnings_match` is what exposes it. Those three warnings
  also carry `None` spans, but that is a second, independent defect: populating
  the spans would not reorder anything.

- **`attribute-quoted`** and **`svelte-self-deprecated`** — singleton message
  wording differences, each a one-line correction to the format string.

### Corrections made when this baseline was measured

The previous baseline's cluster descriptions had drifted, and the drift is
recorded here rather than quietly overwritten, because each item is a place where
a ratchet entry was absorbing something other than what it claimed:

- `unknown-code` was listed under *warning span-only*, whose stated property is
  that code and message match. Under the ordered comparison the suite performs,
  they do not. The entry has been absorbing an ordering bug described as a span
  bug — and the promised span fix would not have cleared it.
- `a11y-anchor-in-svg-is-valid` appeared in no cluster's list at all, so the
  wrong-attribute bug above had no justification of any kind behind it.
- `invalid-node-placement-5` and `module-script-reactive-declaration` were cited
  as examples of the *error-span* cluster **and** given wording bullets under the
  *content* cluster, while the counts summed to the baseline as if each entry
  were counted once. Both are span-only failures today — their codes and
  messages match upstream — so the wording defects they were credited with are
  gone, whichever change removed them.
- Of the 26 entries removed in this change, 3 — `a11y-alt-text`, `a11y-aria-role`
  and `a11y-no-noninteractive-element-to-interactive-role` — were named nowhere
  in the old doc, so nothing recorded why they were accepted.

The other 23 removals were named, 3 of them by a *content* claim that can be
checked in source independently of the fixture. All 3 check out — the named
defect is gone, so those pass for the reason recorded rather than having merely
stopped observing it: `a11y_unknown_aria_attribute` and `a11y_missing_attribute`
now match upstream's format strings verbatim,
`a11y_incorrect_aria_attribute_type_tokenlist` likewise, and
`a11y_no_interactive_element_to_noninteractive_role` is called with
`(element, role)` in upstream's order. The remaining 20 were *span-only* claims,
where the recorded cause is a span and the only available evidence that it was
the cause is that the fixture now matches on spans — so for those, "passing for
the recorded reason" is not independently checkable and is not asserted here.
