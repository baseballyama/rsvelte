---
"@rsvelte/fmt": patch
---

Drive the formatter-parity corpus (rsvelte-fmt vs the `oxfmt(svelte:true)` =
prettier-plugin-svelte oracle) from 295 known failures down to a small residual,
with no regressions. Completes large parts of the prettier-plugin-svelte HTML
child-layout port onto the Doc IR (open-tag `dedent(softline)`, pure-text prose
word-fill via `Doc::Fill`, wrappable self-closing components, prose-fill
component bodies, re-hugging inline elements whose open tag already wrapped,
`blockElements` alignment) and improves embedded-JS formatting (`{@render}`/
`{@html}` object-arg wrapping, declaration-tag formatting, `{#each}`/`{#if}`
block-header wrapping, `<script>`/`<style>` open-tag attribute wrapping) via
correct width/column accounting. Also fixes several correctness bugs: preserve
TypeScript `as` casts in spread attributes, keep leading comments in function
bindings, and keep inline self-closing components in prose runs. Genuine
prettier-plugin-svelte/oxfmt oracle bugs (which corrupt source) and out-of-scope
inputs are excluded from the parity oracle and documented in
`docs/fmt-oracle-bugs.md` for upstream filing.
