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
  does. A rule that compares `node.loc` lines therefore treats a tag as one line, while the same
  report's position and `sourceCode.lines` (for example in `no-trailing-spaces`) treat it as two.
- Case: `<div d="1"` U+2028 `e="2" f="3"></div>` with `svelte/max-attributes-per-line`.
  Upstream reports `'e' should be on a new line.` at 1:12, as if `d` and `e` were on one line.
  ESLint itself ends that line before `e`. Likewise, `<div` U+2028 `b="1"></div>` with
  `svelte/html-closing-bracket-new-line` reports nothing upstream, but the tag spans two lines,
  so a line break before `>` is expected.
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

## `svelte/no-unused-svelte-ignore` and `svelte/valid-compile`: the last of several codes is dropped

- Case: none upstream; rsvelte's own
  `tests/cases/no-unused-svelte-ignore/invalid/last-code-without-separator`.
- Upstream reads a code only before a separator (`extractSvelteIgnore` in
  `shared/svelte-compile-warns/ignore-comment.ts` slices up to each match of `/\s*[\s,]\s*/`). With
  several codes and nothing after the last one, as in `<!-- svelte-ignore a b-->` or
  `// svelte-ignore a b` at the end of a line, the last code is never read. It neither ignores its
  warning nor is reported unused.
- Correct: every code is read. The compiler's own `extract_svelte_ignore` matches each word, the
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

## svelte/prefer-const: a `<script module>` export is treated as a prop

- Case: `tests/cases/prefer-const/invalid/script-module-input.svelte`,
  `<script module>\n\texport let m = 1;\n</script>`.
- Upstream reports nothing. svelte-eslint-parser's `analyzePropsScope` adds a write to every
  `export let` in a script whose `context` attribute is not `"module"`, and Svelte 5's `module`
  attribute does not count.
- Correct: report `m`, as for `<script context="module">`. A module script's exports are not
  props, so nothing writes `m` after its declaration.

## svelte/prefer-svelte-reactivity: a reassigned variable hides its later constructions

- Case: `tests/cases/prefer-svelte-reactivity/invalid/reassigned-input.svelte.js`,
  `let q = new Set(); q = new Set(); q.add(1);`.
- Upstream reports only the first `new Set()`. The mutation check takes one result of
  `ReferenceTracker.iteratePropertyReferences` with `.next()` and never closes the generator,
  so `q` stays on the tracker's `variableStack` and the second construction is skipped as a cycle.
- Correct: report the second `Set` too. It is the one `q.add(1)` mutates, so upstream misses
  exactly the construction the rule exists to catch. rsvelte follows every reference of `q`
  from each construction and reports both.
