# validator-known-failures.json — why entries are accepted

`crates/rsvelte_core/tests/validator.rs` now asserts full upstream parity per
fixture — warning `code`/`message`/`start`/`end` and error `start`/`end` — instead
of only comparing diagnostic counts, mirroring what
`packages/svelte/tests/validator/test.ts` checks. The ratchet may only shrink;
every listed fixture is a real divergence from the last confirmed test run, not
a placeholder.

## Current baseline: 207 divergences

The divergences fall into three clusters:

- **Error spans not populated (~141, the majority).** Many `AnalysisError` call
  sites construct the error without threading the triggering node's span through,
  so `start`/`end` come back `None..None` instead of the real source range (e.g.
  `invalid-node-placement-5`, `module-script-reactive-declaration`). This is a
  structural span-plumbing gap across dozens of call sites in
  `crates/rsvelte_core/src/compiler/phases/2_analyze` rather than one bug —
  fixing it means auditing each `AnalysisError::*` construction individually.

- **Warning span-only mismatches (53).** The warning `code` and `message` match
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
  `use-the-platform`, `reactive-module-variable`, `unknown-code`,
  `script-unknown-attribute`, `script-context-module-runes-deprecated`,
  `script-invalid-spread-attribute`, `tag-custom-element-options-missing`,
  `runes-legacy-syntax-warnings`, and `a11y-aria-unsupported-element`.
  Each is a narrow-the-span fix once the underlying node's precise range is
  identified (per-rule, not architectural).

- **Warning/error content differs from upstream wording (13).** The diagnostic
  fires on the right node but the message text itself — or, for one rule, the
  argument order — diverges from upstream. Not fixed in this change (deferred
  to keep the assertion-tightening change span-neutral); each is a self-contained
  one-line follow-up:
  - `a11y-aria-props`: `a11y_unknown_aria_attribute` phrases the suggestion as
    `"... (did you mean 'labelledby'?)"` instead of upstream's
    `"... . Did you mean 'labelledby'?"`; `a11y_missing_attribute` renders a
    double space and an Oxford comma (`"should have  alt, aria-label, or
    aria-labelledby"`) instead of `"should have an alt, aria-label or
    aria-labelledby"` (missing article, no Oxford comma).
  - `a11y-aria-proptypes-tokenlist`: `a11y_incorrect_aria_attribute_type_tokenlist`
    lists the allowed tokens with an Oxford comma (`"removals", "text"`) instead
    of upstream's `"removals" or "text"`.
  - `invalid-node-placement-5`: `node_invalid_placement_ssr` says `"cannot be a
    descendant of"` instead of upstream's `"cannot be a child of"`.
  - `module-script-reactive-declaration`: `reactive_declaration_invalid_placement`
    says `"are only valid at the top level"` instead of upstream's `"only exist
    at the top level"`.
  - `a11y-no-interactive-element-to-noninteractive-role`: the message swaps the
    element and role naming — rsvelte reports `` `<article>` cannot have role
    'a' `` (interpreting the *role* attribute value as the element and the HTML
    tag as the role) where upstream reports `` `<a>` cannot have role 'article'
    `` (element tag first, role attribute second); the same swap appears in the
    nested `a11y_no_redundant_roles`/`a11y_no_abstract_role` diagnostics emitted
    from the same fixture.
  - The remaining entries in this cluster (`attribute-quoted`,
    `svelte-self-deprecated`, and related singleton wording/argument diffs) are
    each a single message-string correction pending a follow-up pass once the
    span-plumbing work above lands and the fixtures can be re-verified in one
    pass rather than piecemeal.
