# eslint-plugin-svelte rule-port status

`rsvelte_lint` ports eslint-plugin-svelte's rules natively, validated for
byte-exact parity against the real upstream fixtures by the registry-driven
compat oracle (`crates/rsvelte_lint/tests/eslint_plugin_oracle.rs`): every
registered rule is run over `submodules/eslint-plugin-svelte/.../tests/fixtures/rules/<rule>/{valid,invalid}`
and must reproduce the upstream messages, positions, autofix output, and
editor-suggestion `{desc, output}` exactly.

## Ported (parity-verified by the oracle)

All previously-shipped rules, plus suggestion parity added for: no-at-debug-tags,
no-reactive-literals, no-reactive-functions, no-extra-reactive-curlies,
no-unnecessary-state-wrap, prefer-writable-derived, no-add-event-listener,
prefer-destructured-store-props, require-store-callbacks-use-set-param.

Newly ported in this effort: no-spaces-around-equal-signs-in-attribute,
spaced-html-comment, shorthand-attribute, shorthand-directive, html-quotes,
first-attribute-linebreak, html-closing-bracket-spacing, mustache-spacing,
no-trailing-spaces, html-self-closing, html-closing-bracket-new-line,
max-attributes-per-line, sort-attributes, prefer-class-directive,
prefer-style-directive, derived-has-same-inputs-outputs,
require-optimized-style-attribute, block-lang, valid-prop-names-in-kit-pages,
no-export-load-in-svelte-module-in-kit-pages, no-unused-class-name,
consistent-selector-style, infinite-reactive-loop.

`comment-directive` (the meta-rule) is ported as a post-walk phase in
`crate::runner::lint_source`: the `reportUnusedDisableDirectives` reporting is a
faithful port of upstream's `CommentDirectives.filterMessages` (block-enable
pre-pass + per-message enable/disable resolution + self-suppression of the
rule's own reports). It has no upstream fixture directory (upstream tests it
inline), so it's exempt from the oracle's fixture-coverage check
(`NO_FIXTURE_RULES`) and verified by `crates/rsvelte_lint/tests/comment_directive.rs`
(porting upstream's `reportUnusedDisableDirectives` cases with the Svelte rules
rsvelte implements) plus `comment_directive` unit tests.

## Deferred (with reason)

These are intentionally not yet ported; each needs work outside "add a rule".

### Type-aware — gated typed-rule track (design doc §B)
Require the TypeScript checker (tsgo/corsa), which the design doc scopes to the
gated Wave-3 spike, not the syntactic/scope engine:
- `no-unused-props`, `require-event-prefix`, `no-navigation-without-resolve`,
  `require-event-dispatcher-types`, `experimental-require-slot-types`,
  `experimental-require-strict-events`.

`valid-compile` is ported as an opt-in meta-rule
(`crate::rules::valid_compile`, wired into `runner::lint_source`): it compiles
the component (warnings-only) and surfaces each compiler warning under the single
id `svelte/valid-compile` with the `"{message}({code})"` shape, honouring
`ignoreWarnings`, the always-ignored `missing-declaration`, and the
`<style global>` `css_unused_selector` filter (`isGlobalStyleNode`). Off by
default because the validator wrap already surfaces every warning under its own
(finer-grained) code. The warning-kind fixtures (a11y, `css_unused_selector`,
svelte-ignore scoping) are parity-verified by the oracle plus
`crates/rsvelte_lint/tests/valid_compile.rs`.

The following `valid-compile` fixtures remain skipped in the oracle, each
blocked on something outside the rule port:
- `svelte-config-onwarn` / `-custom-warn` / `-warning-filter` /
  `-experimental-async` — JS config callbacks (`onwarn`/`warningFilter`) and
  `_config.cjs` execution; no JS runtime in a native linter.
- `experimental-async-disabled`, `ts/enum01` — compile-*error* fixtures whose
  position can't be matched: rsvelte's `AnalysisError` variants carry no source
  span (report at the default position).
- `invalid-svelte-ignore03` — rsvelte_core doesn't emit `block_empty` for an
  empty `{#await}` *pending* block.
- `custom_element_props_identifier`, `valid-custom-element-with-props-identifier`,
  `svelte-options-custom-element` — rsvelte_core divergences (the
  `custom_element_props_identifier` warning has no precise span, and
  `<svelte:options customElement>` over-emits `options_missing_custom_element`).
- `babel/*` — Babel-only JS syntax (function-bind `::`) the rsvelte JS parser
  rejects; upstream uses a Babel parser via fixture config.

`valid-style-parse` is ported for its **unknown-lang** half
(`crate::rules::valid_style_parse`, a `<style>` source-scan meta-path in
`runner::lint_source`): a `<style lang="…">` whose language isn't a recognised
CSS/preprocessor lang is reported `Found unsupported style element language "…"`
at the opening tag. It runs as a source scan (not a `check_root` rule) so it
still fires when the unsupported-lang body would abort the main parse. The
unknown-lang and valid fixtures are parity-verified by the oracle plus
`crates/rsvelte_lint/tests/valid_style_parse.rs`. The two CSS parse-error
fixtures (`invalid-css01`, `invalid-scss01`) are skipped: their messages embed
PostCSS's own error text/position which rsvelte's hand-written CSS parser can't
reproduce (and `lang="scss"` needs a real SCSS preprocessor) — but rsvelte still
surfaces an invalid `<style>` as a hard `parse-error` via the validator wrap.

### Blocked on an `rsvelte_core` capability
- `no-unused-svelte-ignore` — needs a compile mode that surfaces warnings
  *without* applying `<!-- svelte-ignore -->` suppression, plus which ignore
  codes were consumed (today `emit_warning` silently drops suppressed ones).

### Large / complex
- `indent` — one of the largest ESLint layout rules; a faithful byte-exact port
  is a substantial standalone effort.

## Known minor divergences

These are inputs not covered by the upstream oracle fixtures where the port
diverges from upstream in a benign or hard-to-fix way.

- **mustache-spacing**: nested `{:else}` branches are located by a raw source
  scan, which can mismatch when an inner `{#if}` / `{:else}` is nested inside
  an outer `{:else}` body. The `{:then}` / `{:catch}` "has expression"
  detection does not skip comments between the tag and the expression.

- **max-attributes-per-line** / **html-closing-bracket-new-line**: attributes
  are grouped by their *start* line; upstream groups by the group-leader's
  *end* line, so a multi-line attribute value whose following attribute starts
  on that end-line is grouped differently (leads to under-reporting). Affects
  only rare multi-line attribute values.

- **infinite-reactive-loop**: local-shadow detection ignores declaration
  position within a block (contrived TDZ/redeclaration patterns); microtask
  boundary node identity uses the node start offset (collapses when two nodes
  share a start byte); `$store` tracking is a heuristic over top-level names.

- **prefer-style-directive**: CSS property names and value escape sequences are
  handled by a byte scan rather than a full CSS parser; diverges on non-ASCII
  property names and escaped CSS values.

- **derived-has-same-inputs-outputs**: rename-conflict detection treats
  member-property-key identifiers as references (conservatively withholds the
  suggestion); does not see `let`/`const` inside `if`/`for`/`try` bodies or
  object-destructuring binds.

- **no-unused-class-name**: the `allowedClassNames` option only honours the
  `i` (case-insensitive) regex flag; the `m` (multiline) and `s` (dotAll)
  flags are silently ignored.
