# Upstream issues

These are the behaviors of eslint-plugin-svelte 3.23.1 that this crate does not reproduce. Each
entry is a candidate issue for eslint-plugin-svelte. ESLint with svelte-eslint-parser gave the
upstream output (`oracle lint-cases`), and `svelte/compiler`'s `parse` gave the decoded values.
Each entry names the test that holds this crate's behavior.

## A mustache fix that decodes to another string (`svelte/no-useless-mustaches`)

| Input                  | Upstream fix        | Compiler reads input as | Compiler reads fix as |
| ---------------------- | ------------------- | ----------------------- | --------------------- |
| `<p>{'&amp;'}</p>`     | `<p>&amp;</p>`      | `&amp;`                 | `&`                   |
| `<p title={'&amp;'}>`  | `<p title="&amp;">` | `&amp;`                 | `&`                   |
| `<p title="x{'&lt;'}">` | `<p title="x&lt;">` | `x&lt;`                | `x<`                  |
| `<p>&am{'p;'}</p>`     | `<p>&amp;</p>`      | `&amp;`                 | `&`                   |
| `<p>{'&am'}{'p;'}</p>` | `<p>&amp;</p>`      | `&amp;`                 | `&`                   |
| `<p>{'\0'}</p>`        | `<p>0</p>`          | U+0000                  | `0`                   |

The fix writes the literal's text into markup, and markup decodes character references. A fix
should not change the value. This crate withholds such a fix and keeps the report. For a reference
split across two mustaches, it fixes only the second one.
Tests: `no_useless_mustaches::tests::a_fix_that_would_decode_differently_is_withheld` and
`a_reference_split_between_mustaches_keeps_its_first_half`.

## An option that misses `\0` (`svelte/no-useless-mustaches`)

With `[{ "ignoreStringEscape": true }]`, upstream reports `<p>{'\0'}</p>` and fixes it to `0`.
The escape list (`nrvtbfux`) leaves out `\0`, the one digit escape that strict code allows. This
crate counts `\0` as an escape and does not report it.
Test: `no_useless_mustaches::tests::a_digit_escape_is_a_string_escape`.

## A shorthand that does not compile (`svelte/shorthand-attribute`)

| Input                 | Upstream fix        | `svelte/compiler` on the fix |
| --------------------- | ------------------- | ---------------------------- |
| `<div a={(a)}></div>` | `<div {(a)}></div>` | `attribute_empty_shorthand`  |
| `<div a={/*x*/a}>`    | `<div {/*x*/a}>`    | `attribute_empty_shorthand`  |

A shorthand holds a name and nothing else, apart from whitespace. This crate reports these
attributes and writes no fix.
Test: `shorthand_attribute::tests::a_shorthand_that_would_not_compile_is_not_written`.

## Runes mode from a rune named in some types (svelte-eslint-parser)

`hasRunesSymbol` walks the script with ESLint's visitor keys. Those keys skip an identifier's
annotation, a return type and type arguments, but they fall back to every key of a TypeScript node.
So `let o: $state;` leaves runes mode off, while each of these turns it on:

- `let o = 1 as $state;`
- `type T = $state;`
- `interface I { a: $state }`

A name in a type names no rune. This crate leaves runes mode off for these three and for the three
that upstream already skips.
Test: `runes_mode::tests::a_rune_named_in_a_type_does_not`. The own cases
`no-at-const-tags/valid/rune-names-in-types` and `no-inspect/valid/rune-name-in-a-type` hold the
half that agrees with upstream.

## A destructured name read as the whole object (`svelte/no-not-function-handler`)

`findRootExpression` follows `const { h } = { h: 1 }` to `{ h: 1 }` and reports "Unexpected
object in event handler." for `onclick={h}`. `const [h] = [1]` gets "array". Here `h` is 1. This
crate does not follow a destructured name, and reports nothing.
Test: `no_not_function_handler::tests::a_destructured_name_is_not_its_initializer`.

## A `{@const}` that the rule does not follow (`svelte/no-not-function-handler`)

`{#if 1}{@const h = 1}<button onclick={h}></button>{/if}` gets no report, because the variable's
definition is not a script `const`. A `{@const}` is as constant as a script `const`, so this crate
follows it and reports "Unexpected number value in event handler.".
Test: `no_not_function_handler::tests::a_const_tag_is_followed`.

## A value written before the modifiers (`svelte/shorthand-directive`)

With `prefer: never`, upstream fixes `<div style:color|important>` to
`<div style:color={color}|important>`. The compiler accepts that, but it reads the value as the
text `{color}|important`, so the directive loses `|important`. This crate writes
`style:color|important={color}`.
Test: `shorthand_directive::tests::the_value_goes_after_the_modifiers`.

## A slot name fix that breaks the attribute (`svelte/no-dynamic-slot-name`)

| Input                      | Upstream fix           | What breaks                             |
| -------------------------- | ---------------------- | --------------------------------------- |
| `<slot name={'a"b'} />`    | `<slot name="a"b" />`  | the inner `"` ends the value            |
| `<slot name="x{'a"b'}" />` | `<slot name="xa"b" />` | the inner `"` ends the value            |
| `<slot name=x{"a b"}y />`  | `<slot name=xa by />`  | the space makes `by` a second attribute |

This crate reports these and writes no fix.
Test: `no_dynamic_slot_name::tests::a_name_that_the_markup_cannot_hold_as_written_is_not_fixed`.

## U+2028 and U+2029 do not end a line in node locations

- Rules: `svelte/max-attributes-per-line`, `svelte/html-closing-bracket-new-line`,
  `svelte/first-attribute-linebreak`, and every rule that compares the lines of template nodes.
- Measured with eslint-plugin-svelte 3.23.1 and svelte-eslint-parser 1.10.0.
- Cause: svelte-eslint-parser's `LinesAndColumns` (`lib/context/index.js`) ends lines at `\r\n`,
  `\r` and `\n` only. ESLint's `SourceCode` also ends lines at U+2028 and U+2029, as ECMAScript
  does. So a rule that compares `node.loc` lines treats a tag as one line, while the same
  report's position and `sourceCode.lines` (for example in `no-trailing-spaces`) treat it as two.
- Case: `<div d="1"` U+2028 `e="2" f="3"></div>` with `svelte/max-attributes-per-line`.
  Upstream reports `'e' should be on a new line.` at 1:12, as if `d` and `e` were on one line.
  ESLint itself ends that line before `e`. Likewise, `<div` U+2028 `b="1"></div>` with
  `svelte/html-closing-bracket-new-line` reports nothing upstream, but the tag spans two lines,
  so the rule should want a line break before `>`.
- Correct: count node lines with ECMAScript's line terminators, as ESLint does. This crate counts
  lines once, with ECMAScript's terminators (`LineBreaks::Ecmascript`).

## `svelte/valid-compile`: a block holding only a `svelte-ignore` comment reports `block_empty`

- Case: `valid-compile/invalid/invalid-svelte-ignore03-input.svelte`
- Upstream reports `Empty block` (`block_empty`) at 2:30 and 14:30, on `{#await …}` blocks whose
  pending branch holds only `<!-- svelte-ignore … -->`.
- Correct: no `block_empty`. `svelte compile` on the file does not warn, because the branch holds a
  comment besides whitespace. Upstream replaces every `svelte-ignore` comment with spaces before it
  compiles (`buildStrippedText` in `shared/svelte-compile-warns/index.ts`), so the compiler sees a
  branch of whitespace alone. Blanking the comments to apply them itself changes what the compiler
  warns about.

## `svelte/no-unused-svelte-ignore` and `svelte/valid-compile` drop the last of two or more codes

- Case: none upstream; rsvelte's own
  `tests/cases/no-unused-svelte-ignore/invalid/last-code-without-separator`.
- Upstream reads a code only before a separator: `extractSvelteIgnore` in
  `shared/svelte-compile-warns/ignore-comment.ts` slices up to each match of the separator
  pattern `/\s*[\s,]\s*/`. With two or more codes and nothing after the last one, as in
  `<!-- svelte-ignore a b-->` or `// svelte-ignore a b` at the end of a line, upstream never reads
  the last code. It neither ignores its warning nor reports it unused.
- Correct: read every code. The compiler's own `extract_svelte_ignore` matches each word, the
  last one included. rsvelte reads the last code too, so in the case above it reports
  `export_let_unused` and `a11y_accesskey` as unused.

## Suggestions of `svelte/no-reactive-literals` that do not parse

Input:

```svelte
<script>
	let a = 0;
	let obj = {};
	$: a += 1;
	$: obj.x = 1;
</script>
```

Upstream suggests replacing the statements with `let a += 1` and `let obj.x = 1`. It writes
`let` before any assignment whose right side is a literal, so the code it suggests is a syntax
error unless the assignment is `name = literal`. This crate reports both statements and suggests
the move only for `=` with a name on the left.

## A cast or `!` hides an assignment from `svelte/no-reactive-reassign`

Input:

```svelte
<script lang="ts">
	let a = 0;
	$: v = a;
	$: obj = { a };
	function f() {
		(v as any) = 2;
		obj!.a = 3;
	}
</script>
```

Upstream reports nothing. Its walk from the reference to the assignment stops at
`TSAsExpression` and `TSNonNullExpression`, which pass the value through unchanged, so both
assignments to reactive values go unreported. This crate reports both.

## An inverted member test in `svelte/prefer-destructured-store-props`

`isExpressionIdentifier` (`utils/ast-utils.ts`) returns `!parent.computed || parent.property !==
node` for a member, and the same for a property key. That is true for the name in `x.name` and
false for the index in `x[index]`, the opposite of what it means. Two inputs show it:

```svelte
{#each items as i}{$s[i]}{/each}
```

The `{#each}` item `i` is not seen, so upstream reports `$s[i]`, which no destructuring outside
the block can replace.

```svelte
{#each items as a}{$s.a}{/each}
```

Upstream takes the property name `a` for the `{#each}` item `a`, so it does not report `$s.a`.
This crate does the opposite in both cases.

## A crash in `svelte/no-reactive-functions` on ESLint 10

Input:

```svelte
<script>
	$: f = () => a;
</script>
```

The rule throws `source.isSpaceBetweenTokens is not a function`, a `SourceCode` method that
ESLint 10 removed, while it builds the report. This crate reports the statement as upstream's
tests expect.

## `svelte/prefer-const` treats a `<script module>` export as a prop

- Case: `tests/cases/prefer-const/invalid/script-module-input.svelte`,
  `<script module>\n\texport let m = 1;\n</script>`.
- Upstream reports nothing. The `analyzePropsScope` of svelte-eslint-parser adds a write to every
  `export let` in a script whose `context` attribute is not `"module"`, and Svelte 5's `module`
  attribute does not count.
- Correct: report `m`, as for `<script context="module">`. A module script's exports are not
  props, so nothing writes `m` after its declaration.

## `svelte/prefer-svelte-reactivity`: a reassigned variable hides its later constructions

- Case: `tests/cases/prefer-svelte-reactivity/invalid/reassigned-input.svelte.js`,
  `let q = new Set(); q = new Set(); q.add(1);`.
- Upstream reports only the first `new Set()`. The mutation check takes one result of
  `ReferenceTracker.iteratePropertyReferences` with `.next()` and never closes the generator,
  so `q` stays on the tracker's `variableStack` and the tracker skips the second construction as a cycle.
- Correct: report the second `Set` too. `q.add(1)` mutates that one, so upstream misses
  exactly the construction the rule exists to catch. rsvelte follows every reference of `q`
  from each construction and reports both.

## `svelte/indent`: a snippet without parameters takes a `(` from its body

With eslint-plugin-svelte 3.23.1 and default options.

```svelte
<div>
  {#snippet foo()}
    <p>
      {@render baz()
          }
    </p>
  {/snippet}
</div>
```

Upstream reports line 5: `Expected indentation of 2 spaces but found 10 spaces.` Its fix moves
the `}` of `{@render baz()}` to column 2.

For a snippet with no parameters, `src/rules/indent-helpers/svelte.ts` looks for the `(` of the
parameter list by searching back from the end of the whole `{#snippet}` block. It finds the last
`(` in the body, here the one of `baz()`, and lays out the tokens after it as the snippet's
parameters. With one parameter (`{#snippet foo(a)}`) the same body reports nothing. The `(` is the
first one after the snippet's name.

## `svelte/indent` and `svelte/max-lines-per-block`: U+2028 and U+2029 do not end a line

With eslint-plugin-svelte 3.23.1, take each input below with every `\n` replaced by U+2028 (or
U+2029):

```svelte
<script>
let a;
let b;
let c;
</script>
```

```svelte
<div>
<p>x</p>
</div>
<script>
let a;
</script>
```

With `max-lines-per-block` set to `{ "script": 2 }`, upstream reports nothing for the first input.
With `\n`, `\r\n` or a lone `\r` it reports `<script> block has too many lines (3). Maximum allowed
is 2.` With default options, `indent` reports nothing for the second input. With the other
terminators it reports lines 2 and 5.

ESLint's `sourceCode.lines` splits at all five ECMAScript line terminators. The node locations
from svelte-eslint-parser count `\r\n`, `\r` and `\n` but not U+2028 or U+2029, so the rules see
the whole file as one line. This crate ends a line at every ECMAScript line terminator.

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
