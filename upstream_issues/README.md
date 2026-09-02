# Upstream defect reports

A divergence whose cause is upstream still needs a decision here, and *"leave it listed"* is only
one of the two — the other is to report it. This directory holds the reports.

`scripts/ci/check-upstream-issues.mjs` holds this index to a **bijection** with the `.md` files
beside it: a file with no row is undocumented, and a row with no file describes something that is
not there.

## The `filed` column

It must be either the upstream issue URL or the literal **`unrecorded`**. A blank is rejected, and
so is a link back to **this** repository — every one of the six URL-bearing reports carries an
rsvelte back-reference, so that is the mistake most available to whoever fills the column in, and
it would read as an upstream filing while pointing at the issue the report came from.

`unrecorded` means *this repository does not say whether the report was filed* — not that it was
not filed. When #3680 measured it, **0 of 27** reports carried an upstream issue URL, so every row
starts at `unrecorded`. Nobody had checked the upstream trackers; the point of the column is that
the difference between "we looked" and "we never wrote it down" now has somewhere to live. Replace
a value with a URL whenever you file one, and only then.

## Two files may share a numeric prefix

The prefix is the originating **rsvelte** issue, and one rsvelte issue can produce two reports to
two projects — `3451-oxc-*` and `3451-oxfmt-*` are the same defect addressed to the library and to
the published binary. The guard therefore does **not** require the prefix to be unique.

The two `3422-*` files and the later unprefixed report are genuine duplicates: one defect, one
project, written up three times. They are **not** a supersession in any direction — the shortest
report carries the root-cause analysis
(`remove_typescript_nodes.js` erases the `typeAnnotation`, esrap's printer then reads `.type` off
`undefined`), an eight-row reproduction table and eleven controls; the longer one carries the
`parse()` result, the three targets and five variants. Merging them is a content edit, not a
deletion, and is deliberately left to its own change rather than folded into the indexing.

## Index

| file | upstream project | rsvelte issue | filed |
|---|---|---|---|
| `1681-oxc-css-commented-gradient-indent.md` | oxc-project/oxc (`oxc_formatter_css`) | #1681 | unrecorded |
| `2582-oxc-nel-whitespace.md` | oxc-project/oxc (`oxc_parser`) | #2582 | unrecorded |
| `2990-svelte-class-accessor-drops-later-comments.md` | sveltejs/svelte | #2990 | unrecorded |
| `3035-prettier-plugin-svelte-drops-a-nested-pattern-key-in-each.md` | sveltejs/prettier-plugin-svelte | #3035 | unrecorded |
| `3052-svelte-css-custom-property-brace-block.md` | sveltejs/svelte | #3052 | unrecorded |
| `3054-svelte-bigint-mix-compile-crash.md` | sveltejs/svelte | #3054 | unrecorded |
| `3070-svelte-template-comment-leaks-into-generated-code.md` | sveltejs/svelte | #3070 | unrecorded |
| `3082-svelte-abstract-property-not-erased.md` | sveltejs/svelte | #3082 | unrecorded |
| `3123-svelte-let-directive-default-crash.md` | sveltejs/svelte | #3123 | unrecorded |
| `3132-svelte2tsx-let-object-rest-crash.md` | sveltejs/language-tools (svelte2tsx) | #3132 | unrecorded |
| `3173-svelte-client-drops-an-eager-declarator.md` | sveltejs/svelte | #3173 | unrecorded |
| `3203-acorn-typescript-accessor-modifier-table.md` | sveltejs/acorn-typescript | #3203 | unrecorded |
| `3213-svelte-inspect-declarator-emits-two-semicolons.md` | sveltejs/svelte | #3213 | unrecorded |
| `3213-svelte-inspect-in-a-value-position.md` | sveltejs/svelte | #3213 | unrecorded |
| `3231-svelte-inspect-in-expression-position-emits-invalid-js.md` | sveltejs/svelte | #3231 | unrecorded |
| `3234-svelte2tsx-style-shorthand-store-is-referenced-but-not-declared.md` | sveltejs/language-tools (svelte2tsx) | #3234 | unrecorded |
| `3261-svelte-let-directive-non-pattern-value-crashes-the-compiler.md` | sveltejs/svelte | #3261 | unrecorded |
| `3300-svelte-client-never-rewrites-a-for-head-rune-read.md` | sveltejs/svelte | #3300 | unrecorded |
| `3306-svelte-a-bindings-read-expression-lands-on-the-lhs-of-a-write.md` | sveltejs/svelte | #3306 | unrecorded |
| `3316-svelte-stripping-inspect-inside-a-sequence-expression-leaves-a-bare-semicolon.md` | sveltejs/svelte | #3316 | unrecorded |
| `3337-svelte-nul-byte-for-a-surrogate-character-reference.md` | sveltejs/svelte | #3337 | unrecorded |
| `3344-svelte-bidi-regex-lastindex.md` | sveltejs/svelte | #3344 | unrecorded |
| `3376-svelte-bare-debug-tag-dropped-inside-an-element.md` | sveltejs/svelte | #3376 | unrecorded |
| `3376-svelte-drops-a-bare-debug-tag-in-a-regular-element.md` | sveltejs/svelte | #3376 | unrecorded |
| `3385-svelte-loose-parse-crashes.md` | sveltejs/svelte | #3385 | unrecorded |
| `3388-svelte-fromcodepoint-compile-crash.md` | sveltejs/svelte | #3388 | unrecorded |
| `3420-svelte-case-clause-state-references-untransformed.md` | sveltejs/svelte | #3420 | unrecorded |
| `3421-svelte-class-method-overload-signature-emits-unparseable-output.md` | sveltejs/svelte | #3421 | unrecorded |
| `3421-svelte-overload-signature-not-erased.md` | sveltejs/svelte | #3421 | unrecorded |
| `3422-svelte-class-index-signature-crash.md` | sveltejs/svelte | #3422 | unrecorded |
| `3422-svelte-class-index-signature-crashes-the-compiler.md` | sveltejs/svelte | #3422 | unrecorded |
| `3441-svelte-inspect-in-an-operand-slot.md` | sveltejs/svelte | #3441 | unrecorded |
| `3441-svelte-rune-in-a-declarator-initializer.md` | sveltejs/svelte | #3441 | unrecorded |
| `3451-oxc-private-in-parens.md` | oxc-project/oxc (`oxc_formatter`) | #3451 | unrecorded |
| `3451-oxfmt-drops-required-parens-after-a-private-in.md` | oxc-project/oxc (`oxfmt`) | #3451 | unrecorded |
| `3513-svelte-instance-import-boundary-reactivity.md` | sveltejs/svelte | #3513 | unrecorded |
| `3568-svelte-dotted-namespace-crash.md` | sveltejs/svelte | #3568 | unrecorded |
| `3609-svelte-snippet-param-shadowed-by-const.md` | sveltejs/svelte | #3609 | unrecorded |
| `3635-esrap-side-effect-import-drops-attributes.md` | sveltejs/esrap | #3635 | unrecorded |
| `3651-svelte-async-autofocus-and-event-output-is-unparseable.md` | sveltejs/svelte | #3651 | unrecorded |
| `4046-svelte-a-reordered-reactive-statement-reprints-earlier-comments.md` | sveltejs/svelte | #4046 | unrecorded |
| `4111-svelte-await-catch-binding-transform-leaks-out-of-the-block.md` | sveltejs/svelte | #4111 | unrecorded |
| `4117-svelte-class-shorthand-reaches-attributes-untransformed.md` | sveltejs/svelte | #4117 | unrecorded |
| `4177-svelte2tsx-is-attribute-mustache-first-chunk-crash.md` | sveltejs/language-tools (svelte2tsx) | #4177 | unrecorded |
| `4197-svelte-class-index-signature-typeerror.md` | sveltejs/svelte | #4197 | unrecorded |
| `grass-css-color-4-relative-syntax.md` | connorskees/grass | — | unrecorded |
| `grass-explicit-extension-specifier.md` | connorskees/grass | — | unrecorded |
| `grass-hoists-a-declaration-written-after-a-nested-rule.md` | connorskees/grass | — | unrecorded |
| `grass-import-only-file-loaded-by-use.md` | connorskees/grass | — | unrecorded |
| `grass-missing-css-color-4-api.md` | connorskees/grass | — | unrecorded |
| `grass-slash-list-divided-inside-a-nested-rule.md` | connorskees/grass | — | unrecorded |
| `grass-tailwind-important-apply.md` | connorskees/grass | — | unrecorded |
| `eslint-plugin-svelte-no-add-event-listener-suggestion.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `eslint-plugin-svelte-no-goto-without-base-namespace-import-crash.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `eslint-plugin-svelte-no-navigation-without-base-empty-href-crash.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `eslint-plugin-svelte-no-navigation-without-resolve-empty-rel-crash.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `eslint-plugin-svelte-shorthand-directive-modifier.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `esrap-property-prints-a-function-expression-as-a-method.md` | sveltejs/esrap (shipped by sveltejs/svelte's lockfile) | — | unrecorded |
| `lsp-render-tag-kills-every-template-definition.md` | sveltejs/language-tools | — | unrecorded |
| `oxfmt-const-tag-ending-in-a-line-comment.md` | oxc-project/oxc (`oxfmt`) | #3567 | unrecorded |
| `oxfmt-each-pattern-default-unknown-node-type.md` | oxc-project/oxc (`oxfmt`) | #3567 | unrecorded |
| `oxfmt-single-quoted-attribute-containing-a-double-quote.md` | oxc-project/oxc (`oxfmt`) | #3567 | unrecorded |
| `oxfmt-style-terminator-inside-a-css-string.md` | oxc-project/oxc (`oxfmt`) | #3567 | unrecorded |
| `oxfmt-svelte-css-eats-a-css-escape-terminator-space.md` | oxc-project/oxc (`oxfmt`, `svelte: true`) | — | unrecorded |
| `oxfmt-svelte-css-keeps-source-tabs-around-a-selector-comment.md` | oxc-project/oxc (`oxfmt`, `svelte: true`) | — | unrecorded |
| `prettier-plugin-svelte-inline-element-overflows-print-width.md` | sveltejs/prettier-plugin-svelte | — | unrecorded |
| `svelte-bind-group-unresolved-identifier-crash.md` | sveltejs/svelte | #3567 | unrecorded |
| `svelte-class-index-signature-crash.md` | sveltejs/svelte | #3422 | unrecorded |
| `svelte-class-static-block-shares-the-instance-scope.md` | sveltejs/svelte | — | unrecorded |
| `svelte-declaration-tag-dollar-identifier.md` | sveltejs/svelte | #3614 | unrecorded |
| `svelte-eslint-parser-self-closing-style-lookalike-component.md` | sveltejs/svelte-eslint-parser | — | unrecorded |
| `svelte-fromcodepoint-rangeerror.md` | sveltejs/svelte | #3617 | unrecorded |
| `svelte-inspect-with-in-a-declarator.md` | sveltejs/svelte | #3614, #3627 | unrecorded |
| `svelte-named-class-expression-shadowing-a-rune-emits-unparseable-output.md` | sveltejs/svelte | — | unrecorded |
| `svelte-scss-line-comment-hides-an-animation-name-from-keyframe-scoping.md` | sveltejs/svelte | #4048 | unrecorded |
| `svelte-server-treats-a-dollar-parameter-as-a-store.md` | sveltejs/svelte | #4048 | unrecorded |
| `svelte-snippet-name-colliding-with-an-import.md` | sveltejs/svelte | #3567 | unrecorded |
| `svelte2tsx-bom-crashes-on-any-component-with-a-script.md` | sveltejs/language-tools (svelte2tsx) | #4048 | unrecorded |
| `svelte2tsx-getlastleadingdoc-mixes-absolute-and-relative-offsets.md` | sveltejs/language-tools (svelte2tsx) | — | unrecorded |
| `svelte2tsx-isdeclaration-is-a-boolean-not-a-stack.md` | sveltejs/language-tools (svelte2tsx) | — | unrecorded |
| `svelte2tsx-preprendstr-insertion-at-the-script-end-is-overwritten.md` | sveltejs/language-tools (svelte2tsx) | — | unrecorded |
| `svelte2tsx-shorthand-style-directive-modifier.md` | sveltejs/language-tools (svelte2tsx) | #3567, #3578 | unrecorded |
| `svelte2tsx-transposes-an-unclosed-start-tag.md` | sveltejs/language-tools (svelte2tsx) | — | unrecorded |
| `tsgo-lsp-completion-item-omits-the-typescript-kind.md` | microsoft/typescript-go (`tsgo --lsp`) | — | unrecorded |

**25** reports carry no rsvelte issue number. Six came out of the lint-parity campaign (five
against `eslint-plugin-svelte`, one against `svelte-eslint-parser`), two out of the
`two-ports-inventory.md` row 21 shadow probes, seven out of the SCSS-backend burndown — five
covering every unit `scss-known-failures.json` lists as `grass-rejects-accepted`, plus the two
classes in that ratchet whose output is not render-neutral (a hoisted declaration, and a slash list
divided inside a nested rule) — and two out of the LSP differential campaign. The remaining eight
are later: two `oxfmt` CSS reports from the formatter-parity corpus, one against `esrap`, one
against `language-tools`, and one against `prettier-plugin-svelte` from the formatter-parity
burndown (an inline element in a text run overflows `printWidth`, and re-formatting the output is
not a fixed point), and three against `svelte2tsx` from the svelte2tsx-ratchet burndown.
None of them names an issue internally — `—` records that, rather than
inventing a number, and `check-upstream-issues.mjs` holds the count above to the table so this
paragraph cannot go stale the way it already had (it read "Fifteen" against 19 rows).
