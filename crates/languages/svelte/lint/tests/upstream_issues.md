# Upstream issues

Bugs in eslint-plugin-svelte (or in the parsers it uses) that this crate does not reproduce. Each
entry names the case that shows it: an upstream fixture listed in `upstream_deviations.json`, or a
case of this crate (`tests/cases`, or a rule's unit test). Nobody has filed them yet.

## prefer-style-directive: a declaration's fix cuts its value after a comment

- Case: `src/rules/prefer_style_directive/tests.rs`,
  `a_declaration_writes_the_whole_cleaned_value`.
- Upstream: `<div style="color: a /* c */ b;">` is fixed to `<div style:color="a /*">`.
- Correct: `<div style:color="a  b">`, the value PostCSS gives.
- Why: the fix slices the source from the value's start by the length of PostCSS's cleaned value
  (`decl.value.range`), which is shorter than the written value when it holds a comment.
