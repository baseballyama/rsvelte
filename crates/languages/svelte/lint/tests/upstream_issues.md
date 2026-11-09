# Upstream issues

Bugs in `eslint-plugin-svelte` (or in the parsers it uses) that this crate does not reproduce. Each
entry names the case that shows it: an upstream fixture listed in `upstream_deviations.json`, or a
case of this crate (`tests/cases`, or a rule's unit test). Nobody has filed them yet.

## The style directive fix cuts a value after a comment

- Rule: `prefer-style-directive`.
- Case: `src/rules/prefer_style_directive/tests.rs`,
  `a_declaration_writes_the_whole_cleaned_value`.
- Upstream: the fix turns `<div style="color: a /* c */ b;">` into `<div style:color="a /*">`.
- Correct: `<div style:color="a  b">`, the value that `PostCSS` gives.
- Why: the fix slices the source from the value's start by the length of the cleaned value
  (`decl.value.range`), and a comment makes the cleaned value shorter than the written one.

## A shorthand ID attribute does not count

- Rule: `consistent-selector-style`.
- Case: `src/rules/consistent_selector_style/tests.rs`, `a_shorthand_id_is_read_as_its_attribute`.
- Upstream: with `let { id } = $props()`, `<div {id}>` reports `#a` as "Selector should select by
  element type instead of ID", while `<div id={id}>` reports nothing.
- Correct: both report nothing, because the element may carry any ID.
- Why: the rule reads IDs from `SvelteAttribute` only and skips `SvelteShorthandAttribute`.

## A selector inside `@keyframes` counts as an element type

- Rule: `consistent-selector-style`.
- Case: `src/rules/consistent_selector_style/tests.rs`, `a_keyframe_selector_selects_no_element`.
- Upstream: with `style: ["class"]`, `@keyframes a { from {} 50% {} }` reports `from` and `50%` as
  "Selector should select by class instead of element type".
- Correct: no report, because these selectors select no element.
- Why: the rule checks every rule inside an at-rule, `@keyframes` included.

## An each block's else branch counts as repeated

- Rule: `consistent-selector-style`.
- Case: `src/rules/consistent_selector_style/tests.rs`, `an_each_else_branch_renders_at_most_once`.
- Upstream: with `style: ["id", "class"]`, the rule says nothing about `.a` on the only element in
  `{#each xs as x}…{:else}…`. For the same element in `{#if c}…{:else}…`, it reports "Selector
  should select by ID instead of class".
- Correct: the rule reports both. The `{:else}` branch of an each block renders at most once.
- Why: `elementOccurrenceCount` multiplies the else block's count by the count of its parent each
  block, which is `ZeroToInf`.

## A space beside an expression names an empty class

- Rule: `no-unused-class-name`.
- Case: `src/rules/no_unused_class_name/tests.rs`, `a_space_beside_an_expression_names_no_class`.
- Upstream: `<div class="{b} ">` and `<div class=" {b}">` report `Unused class "".`.
- Correct: no report.
- Why: `findClassesInAttribute` trims a literal part and splits it on spaces, so a part that
  holds only spaces gives one empty string.

## The style directive fix breaks a value with a double quote

- Rule: `prefer-style-directive`.
- Case: `src/rules/prefer_style_directive/tests.rs`,
  `a_value_with_a_double_quote_is_reported_without_a_fix`.
- Upstream: the fix turns `<div style='font-family: "Arial"'>` into
  `<div style:font-family=""Arial"">`.
- Correct: no fix, and the report stays.
- Why: the fix always quotes the value with `"`.

## The style directive fix drops `!important` from a conditional

- Rule: `prefer-style-directive`.
- Case: `src/rules/prefer_style_directive/tests.rs`, `a_conditional_keeps_important`.
- Upstream: the fix turns `style={c ? "color: red !important" : ""}` into
  `style:color={c ? "red" : null}`.
- Correct: `style:color|important={c ? "red" : null}`.
- Why: the fix writes the declaration's value, and `PostCSS` keeps `!important` apart from it.

## The style directive fix changes a property that the style sets twice

- Rule: `prefer-style-directive`.
- Case: `src/rules/prefer_style_directive/tests.rs`,
  `a_property_set_twice_is_reported_without_a_fix`.
- Upstream: the fix turns `<div style="color: red; color: blue">` into
  `<div style:color="red" style="color: blue">`. A directive wins over the attribute, so the text
  turns red.
- Correct: no fix while another declaration or conditional in the style sets the same property,
  and the reports stay.
- Why: the rule fixes each declaration on its own.

## The class directive fix duplicates a directive

- Rule: `prefer-class-directive`.
- Case: `src/rules/prefer_class_directive/tests.rs`,
  `a_class_with_a_directive_is_reported_without_a_fix`.
- Upstream: the fix turns `<div class={a ? "" : "x"} class:x={b}>` into
  `<div class:x={!a} class:x={b}>`, and Svelte rejects the duplicate attribute.
- Correct: no fix, and the report stays.
- Why: the fix does not look at the element's other directives.

## Quirks of the CSS parsers that upstream uses

A differential fuzz finds these. It compares this crate's port with `postcss` 8.5.32,
`postcss-scss` 4.0.9 and the inline style reader of `eslint-plugin-svelte` 3.23.1 on 173,841
inputs: corpus style bodies, their mutations and random strings. The fuzz harness is not in the
repository, and no lint case covers these quirks.

- An escaped astral character splits a surrogate pair. For `\😀&`, `PostCSS` reports
  `Unknown word \�`. This crate reports `Unknown word \😀`.
- Some errors have no position. For `:<FF>;<TAB>,{{`, `PostCSS` reports
  `undefined:undefined: Unknown word`. This crate reports line 1, column 2.
- `postcss-scss` throws a `TypeError` on a nested declaration without a word, for example
  `{:]{/_`. This crate reports `Unknown word /_` at line 1, column 5.
- In an inline style, `convertChild` places a declaration's value from the property's end. A hack
  prefix (`*a: b`) moves that end one character left. This crate places the value at its own
  position.
- The safe parser ends an open comment, string or escape one character past the source, and the
  declaration that holds it too. For `a: b /* c`, the comment ends at 10. This crate ends it at the
  source's end, 9.
- An at-rule in an inline style, such as `style="@media x"`, has no end, and `convertChild`
  throws. This crate does not convert that style.
