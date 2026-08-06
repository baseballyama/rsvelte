# validator-known-failures.json — why entries are accepted

`crates/rsvelte_core/tests/validator.rs` asserts full upstream parity per fixture —
warning `code`/`message`/`start`/`end` and error `start`/`end` — instead of only
comparing diagnostic counts, mirroring what
`packages/svelte/tests/validator/test.ts` checks. The ratchet may only shrink;
every listed fixture is a real divergence from the last confirmed test run, not
a placeholder.

## Current baseline: 63 divergences

The error-span cluster is gone: every `AnalysisError` now carries the source range
upstream attributes it to. Constructors in
`crates/rsvelte_core/src/compiler/phases/2_analyze/errors.rs` still build a
span-less error, and each raising site attaches the span with
`AnalysisError::at(start, end)` — taking the same node upstream passes to its
`e.*` constructor, which is often a sibling attribute or a child rather than the
node the enclosing visitor is looking at.

What remains is warnings only, in two clusters:

- **Warning span-only mismatches (59).** The warning `code` and `message` match
  upstream exactly; only the reported `start`/`end` differs — typically rsvelte
  reports a whole-line/whole-node span where upstream reports a narrower
  sub-span (an attribute value, a role token, an identifier). Affects
  `component-name-lowercase`, `custom-element-props-identifier*`,
  `rest-eachblock-binding*`, `invalid-self-closing-tag`,
  `a11y-aria-proptypes-*`, `a11y-scope`, `a11y-no-abstract-roles`,
  `a11y-role-supports-aria-props`, `a11y-heading-has-content`,
  `a11y-anchor-is-valid`, `a11y-autocomplete-valid`, `a11y-tabindex-no-positive`,
  `a11y-no-autofocus`, `a11y-no-redundant-roles`, `a11y-no-access-key`,
  `a11y-aria-activedescendant`, `a11y-not-on-components`,
  `a11y-role-has-required-aria-props`, `store-runes-conflict`,
  `store-rune-conflic-from-props`, `runes-referenced-nonstate*`,
  `svelte-component-deprecated`, `component-legacy-instantiation`,
  `inline-new-class*`, `unreferenced-variables*`, `empty-block`,
  `global-event-reference`, `illegal-attribute-character`,
  `implicitly-closed-by-{parent,sibling}`, `bidirectional-control-characters`,
  `use-the-platform`, `reactive-module-variable`, `script-unknown-attribute`,
  `script-context-module-runes-deprecated`, `script-invalid-spread-attribute`,
  `tag-custom-element-options-missing`, `runes-legacy-syntax-warnings`,
  `invalid-node-placement-5`, `module-script-reactive-declaration`,
  `reactive-declaration-non-top-level` and `a11y-aria-unsupported-element`.
  Each is a narrow-the-span fix once the underlying node's precise range is
  identified (per-rule, not architectural).

  Note that these are invisible to the Compatibility Report, which compares only
  the *number* of warnings a successful compile emits — this gate is the only
  thing that sees them.

- **Warning content differs from upstream wording (4).** The diagnostic fires on
  the right node but the message text itself — or, for one rule, the argument
  order — diverges from upstream. Each is a self-contained message-string
  correction:
  - `a11y-anchor-in-svg-is-valid`: the `a11y_missing_attribute` /
    `a11y_unknown_aria_attribute` wording — `a11y_unknown_aria_attribute` phrases
    the suggestion as `"... (did you mean 'labelledby'?)"` instead of upstream's
    `"... . Did you mean 'labelledby'?"`, and `a11y_missing_attribute` renders a
    double space and an Oxford comma (`"should have  alt, aria-label, or
    aria-labelledby"`) instead of `"should have an alt, aria-label or
    aria-labelledby"` (missing article, no Oxford comma).
  - `unknown-code`, `attribute-quoted` and `svelte-self-deprecated` are singleton
    wording/argument diffs of the same kind.
