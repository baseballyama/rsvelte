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

The two `3422-*` files are a genuine duplicate: one defect, one project, written up twice. They are
**not** a supersession in either direction — the shorter one carries the root-cause analysis
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
| `3234-svelte2tsx-style-shorthand-store-is-referenced-but-not-declared.md` | sveltejs/language-tools (svelte2tsx) | #3234 | unrecorded |
| `3300-svelte-client-never-rewrites-a-for-head-rune-read.md` | sveltejs/svelte | #3300 | unrecorded |
| `3337-svelte-nul-byte-for-a-surrogate-character-reference.md` | sveltejs/svelte | #3337 | unrecorded |
| `3344-svelte-bidi-regex-lastindex.md` | sveltejs/svelte | #3344 | unrecorded |
| `3376-svelte-bare-debug-tag-dropped-inside-an-element.md` | sveltejs/svelte | #3376 | unrecorded |
| `3421-svelte-class-method-overload-signature-emits-unparseable-output.md` | sveltejs/svelte | #3421 | unrecorded |
| `3422-svelte-class-index-signature-crash.md` | sveltejs/svelte | #3422 | unrecorded |
| `3422-svelte-class-index-signature-crashes-the-compiler.md` | sveltejs/svelte | #3422 | unrecorded |
| `3441-svelte-rune-in-a-declarator-initializer.md` | sveltejs/svelte | #3441 | unrecorded |
| `3451-oxc-private-in-parens.md` | oxc-project/oxc (`oxc_formatter`) | #3451 | unrecorded |
| `3451-oxfmt-drops-required-parens-after-a-private-in.md` | oxc-project/oxc (`oxfmt`) | #3451 | unrecorded |
| `eslint-plugin-svelte-no-add-event-listener-suggestion.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `eslint-plugin-svelte-no-goto-without-base-namespace-import-crash.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `eslint-plugin-svelte-no-navigation-without-base-empty-href-crash.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `eslint-plugin-svelte-no-navigation-without-resolve-empty-rel-crash.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `eslint-plugin-svelte-shorthand-directive-modifier.md` | sveltejs/eslint-plugin-svelte | — | unrecorded |
| `svelte-eslint-parser-self-closing-style-lookalike-component.md` | sveltejs/svelte-eslint-parser | — | unrecorded |

The six unnumbered reports came out of the lint-parity campaign rather than from a single rsvelte
issue, and none of them names one internally — `—` records that, rather than inventing a number.
