# validator-known-failures.json — why entries are accepted

`crates/rsvelte_core/tests/validator.rs` asserts full upstream parity per
fixture — warning `code`/`message`/`start`/`end` and error `start`/`end` — instead
of only comparing diagnostic counts, mirroring what
`packages/svelte/tests/validator/test.ts` checks. The ratchet is shrink-only in
**both** directions: a new failure fails the run, and so does a listed entry that
already passes, so an entry that starts passing must be removed by the change
that made it pass.

**If you are here because `test_validator` failed and you were not working on a
ratchet:** you almost certainly fixed a fixture that is listed below, and the
entry has to go in *your* PR. This is the same rule the corpus ratchets follow —
the PR that fixes entries re-baselines in the same PR rather than leaving a
backlog — but it is newer here, so a failure reading `N stale entries in
compatibility/validator-known-failures.json (they already pass)` is your change
succeeding, not unrelated breakage. Re-run the suite and delete the entries it
names; never hand-edit a count to match.

## Current baseline: `validator-known-failures.json`, 172 entries

Every cluster count below is measured from the failure report the suite prints,
by classifying each block on what actually diverges, not by subtracting from the
previous baseline:

| cluster | entries | what diverges |
|---|---:|---|
| error span not populated | 141 | `start`/`end` come back `None..None` |
| warning span-only | 30 | `code` and `message` match; spans differ |
| warning content | 1 | codes, messages or their order differ |
| | **172** | |

- **Error spans not populated (141).** Many `AnalysisError` call sites construct
  the error without threading the triggering node's span through, so `start`/`end`
  come back `None..None` instead of the real source range (e.g.
  `css-invalid-global-selector-2`, `const-tag-readonly-1`,
  `window-binding-invalid-dimensions`). This is a structural span-plumbing gap
  across dozens of call sites in
  `crates/rsvelte_core/src/compiler/phases/2_analyze` rather than one bug — fixing
  it means auditing each `AnalysisError::*` construction individually.

- **Warning span-only (30).** The warning `code` and `message` match upstream
  exactly and appear in the same order; only the reported `start`/`end` differs —
  and the divergence is **rsvelte reporting no span at all** (`None..None`) where
  upstream reports a real range, not a span that is merely too wide, because the
  warning is constructed without threading the triggering node through. On the
  ~14k real-world corpus the same split is 2,082 missing against 3
  present-but-different (99.86%). Each is therefore an *attach*-the-span fix, not
  a narrow-the-span one: pass the triggering node to the warning constructor so
  the caller's element-span fallback is not reached. Per-rule, not architectural —
  one systemic cause but one emission site per code, so the work does not collapse
  into a single edit. Where the check locates its subject by walking children (as
  `figure` does for `a11y_figcaption_index`, #2490), the same fallback lands a
  **plausible wrong** span rather than none, which is the worse symptom of the
  same defect.

- **Warning content (1).** Not a span bug, and fixing the spans would leave it
  failing.

### The one content divergence

- **`svelte-self-deprecated`** — a message wording difference. The format string
  interpolates the component's own name into its example import, and rsvelte
  lowercases it: `import Input from './input.svelte'` where upstream writes
  `import Self from './Self.svelte'`. One string to correct.

### Two content divergences that are now span-only

Re-measured with this baseline: `unknown-code` and `attribute-quoted` no longer
diverge on content, so both moved into the span-only cluster and the claims the
old doc made about them no longer hold.

`unknown-code` was recorded as an emission-*order* bug — the `svelte-ignore`
comment-code warnings emitted as a batch ahead of the a11y warnings. The suite's
report now shows all six interleaved in upstream's source order, so whatever
reordered the comment pass fixed it, and only the `None` spans remain.
`attribute-quoted` was recorded as a wording difference; its messages now match
verbatim.

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
