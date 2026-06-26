---
"@rsvelte/fmt": patch
---

fix(fmt): don't CSS-parse non-CSS `<style lang>` blocks

`rsvelte-fmt` hard-failed on `<style lang="scss">` (and other non-CSS dialects):
the body was run through the internal CSS parser, which choked on SCSS syntax
(`//` line comments, `$variables`, maps) with `css_expected_identifier` and
aborted the whole-file format. A non-CSS `lang` block is opaque preprocessor
input, so the formatter no longer CSS-parses it — its raw body is still handed to
the embedded style formatter (oxfmt), exactly as before, so output is unchanged
for already-working blocks while SCSS-syntax blocks stop aborting the format.
