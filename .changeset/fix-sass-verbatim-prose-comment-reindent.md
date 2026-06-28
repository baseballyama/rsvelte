---
"@rsvelte/fmt": patch
---

fix(fmt): keep preprocessor styles and prose block comments verbatim

Two formatter-parity fixes that mirror the oxfmt / prettier-plugin-svelte oracle:

- Indented-syntax `<style lang="sass">` / `"stylus"` bodies are not brace-based
  CSS — oxfmt cannot parse them and the oracle leaves them byte-for-byte
  verbatim. The formatter now emits no edit for those dialects (scss/less/postcss
  still route through oxfmt). Combined with the non-CSS-lang parse passthrough,
  this stops the whole-file format from falling back to the raw source for
  components whose `<style>` uses an indented preprocessor dialect.

- `reindent` over-indented prose `/**` block comments. `oxc_formatter` only
  re-aligns a block comment whose every continuation line starts with `*`
  (prettier's `isIndentableBlockComment`); a `/**` comment with prose
  continuation lines — which may carry intentional leading whitespace such as a
  tab — is left verbatim. The old heuristic treated any `/**` as indentable and
  prepended the splice indent to those lines. Fixed with a full star-alignment
  scan.
