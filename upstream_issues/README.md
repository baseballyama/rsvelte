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
| `eslint-plugin-svelte-no-add-event-listener-suggestion.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `eslint-plugin-svelte-no-goto-without-base-namespace-import-crash.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `eslint-plugin-svelte-no-navigation-without-base-empty-href-crash.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `eslint-plugin-svelte-no-navigation-without-resolve-empty-rel-crash.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `eslint-plugin-svelte-shorthand-directive-modifier.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `oxfmt-const-tag-ending-in-a-line-comment.md` | oxc-project/oxc (`oxfmt`) | #3567 | unrecorded |
| `oxfmt-each-pattern-default-unknown-node-type.md` | oxc-project/oxc (`oxfmt`) | #3567 | unrecorded |
| `oxfmt-single-quoted-attribute-containing-a-double-quote.md` | oxc-project/oxc (`oxfmt`) | #3567 | unrecorded |
| `oxfmt-style-terminator-inside-a-css-string.md` | oxc-project/oxc (`oxfmt`) | #3567 | unrecorded |
| `svelte-bind-group-unresolved-identifier-crash.md` | sveltejs/svelte | #3567 | unrecorded |
| `svelte-class-index-signature-crash.md` | sveltejs/svelte | #3422 | unrecorded |
| `svelte-declaration-tag-dollar-identifier.md` | sveltejs/svelte | #3614 | unrecorded |
| `svelte-eslint-parser-self-closing-style-lookalike-component.md` | sveltejs/svelte-eslint-parser | — | unrecorded |
| `svelte-fromcodepoint-rangeerror.md` | sveltejs/svelte | #3617 | unrecorded |
| `svelte-inspect-with-in-a-declarator.md` | sveltejs/svelte | #3614 | unrecorded |
| `svelte-snippet-name-colliding-with-an-import.md` | sveltejs/svelte | #3567 | unrecorded |
| `svelte2tsx-shorthand-style-directive-modifier.md` | sveltejs/language-tools (svelte2tsx) | #3567 | unrecorded |

The six unnumbered reports came out of the lint-parity campaign rather than from a single rsvelte
issue, and none of them names one internally — `—` records that, rather than inventing a number.
