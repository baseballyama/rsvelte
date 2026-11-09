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

## consistent-selector-style: a shorthand `{id}` is ignored

- Case: `src/rules/consistent_selector_style/tests.rs`, `a_shorthand_id_is_read_as_its_attribute`.
- Upstream: with `let { id } = $props()`, `<div {id}>` reports `#a` as "Selector should select by
  element type instead of ID", while `<div id={id}>` reports nothing.
- Correct: both report nothing, because the element may carry any id.
- Why: the rule reads ids from `SvelteAttribute` only and skips `SvelteShorthandAttribute`.

## consistent-selector-style: keyframe selectors are read as element types

- Case: `src/rules/consistent_selector_style/tests.rs`, `a_keyframe_selector_selects_no_element`.
- Upstream: with `style: ["class"]`, `@keyframes a { from {} 50% {} }` reports `from` and `50%` as
  "Selector should select by class instead of element type".
- Correct: no report. A keyframe selector selects no element.
- Why: the rule checks every rule inside an at-rule, `@keyframes` included.

## consistent-selector-style: an each block's `{:else}` branch counts as repeated

- Case: `src/rules/consistent_selector_style/tests.rs`, `an_each_else_branch_renders_at_most_once`.
- Upstream: with `style: ["id", "class"]`, `.a` on the only element in `{#each xs as x}…{:else}…`
  is not reported. The same element in `{#if c}…{:else}…` is reported as "Selector should select
  by ID instead of class".
- Correct: both are reported. The `{:else}` branch of an each block renders at most once.
- Why: `elementOccurrenceCount` multiplies the else block's count by its parent each block's
  count, which is ZeroToInf.

## no-unused-class-name: a space beside an expression is a class named ""

- Case: `src/rules/no_unused_class_name/tests.rs`, `a_space_beside_an_expression_names_no_class`.
- Upstream: `<div class="{b} ">` and `<div class=" {b}">` report `Unused class "".`.
- Correct: no report.
- Why: `findClassesInAttribute` trims a literal part and splits it on spaces, so a part that
  is only spaces gives one empty string.

## prefer-style-directive: a value with a double quote breaks the fix

- Case: `src/rules/prefer_style_directive/tests.rs`,
  `a_value_with_a_double_quote_is_reported_without_a_fix`.
- Upstream: `<div style='font-family: "Arial"'>` is fixed to `<div style:font-family=""Arial"">`.
- Correct: no fix; the report stays.
- Why: the fix always quotes the value with `"`.

## prefer-style-directive: a conditional's fix drops `!important`

- Case: `src/rules/prefer_style_directive/tests.rs`, `a_conditional_keeps_important`.
- Upstream: `style={c ? "color: red !important" : ""}` is fixed to `style:color={c ? "red" : null}`.
- Correct: `style:color|important={c ? "red" : null}`.
- Why: the fix writes the declaration's value, which PostCSS keeps apart from `!important`.

## prefer-style-directive: a fix changes a property the style sets twice

- Case: `src/rules/prefer_style_directive/tests.rs`,
  `a_property_set_twice_is_reported_without_a_fix`.
- Upstream: `<div style="color: red; color: blue">` is fixed to
  `<div style:color="red" style="color: blue">`, which is red, because a directive wins over the
  attribute.
- Correct: no fix while another declaration or conditional in the style sets the same property;
  the reports stay.
- Why: each declaration is fixed on its own.

## prefer-class-directive: a fix duplicates an existing `class:` directive

- Case: `src/rules/prefer_class_directive/tests.rs`,
  `a_class_with_a_directive_is_reported_without_a_fix`.
- Upstream: `<div class={a ? "" : "x"} class:x={b}>` is fixed to `<div class:x={!a} class:x={b}>`,
  which Svelte rejects as a duplicate attribute.
- Correct: no fix; the report stays.
- Why: the fix does not look at the element's other directives.

## Quirks of the CSS parsers upstream uses

A differential fuzz finds these. It compares this crate's PostCSS port with postcss 8.5.32,
postcss-scss 4.0.9 and eslint-plugin-svelte 3.23.1's inline-style reader on 173,841 inputs: corpus
style bodies, their mutations and random strings. The fuzz harness is not in the repository, and
no lint case covers these quirks.

- An escaped astral character splits a surrogate pair. For `\😀&`, PostCSS reports
  `Unknown word \�`. This crate reports `Unknown word \😀`.
- Some errors have no position. For `:<FF>;<TAB>,{{`, PostCSS reports
  `undefined:undefined: Unknown word`. This crate reports line 1, column 2.
- postcss-scss throws a `TypeError` on a nested declaration without a word, for example
  `{:]{/_`. This crate reports `Unknown word /_` at line 1, column 5.
- In an inline style, eslint-plugin-svelte's `convertChild` places a declaration's value from the
  property's end. With a hack prefix (`*a: b`), that end moves one character left. This crate
  places the value where it is written.
- The safe parser ends an unclosed comment, string or escape one character past the source, and so
  the declaration that holds it. For `a: b /* c`, the comment ends at 10. This crate ends it at the
  source's end, 9.
- An at-rule in an inline style, such as `style="@media x"`, has no end, and `convertChild`
  throws. This crate does not convert that style.
