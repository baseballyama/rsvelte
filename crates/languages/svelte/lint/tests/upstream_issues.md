# Upstream issues

These are the behaviors of eslint-plugin-svelte 3.23.1 that this crate does not reproduce. Each
entry is a candidate issue for eslint-plugin-svelte. ESLint with svelte-eslint-parser gave the
upstream output (`oracle lint-cases`), and `svelte/compiler`'s `parse` gave the decoded values.
Each entry names the test that holds this crate's behavior.

## A mustache fix that decodes to another string (`svelte/no-useless-mustaches`)

Issue: [eslint-plugin-svelte #1646](https://github.com/sveltejs/eslint-plugin-svelte/issues/1646).

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
Cases: `tests/cases/no-useless-mustaches/invalid/entity-*`, `null-escape` and
`entity-split-between-mustaches`.

## An option that misses `\0` (`svelte/no-useless-mustaches`)

Issue: [eslint-plugin-svelte #1684](https://github.com/sveltejs/eslint-plugin-svelte/issues/1684).

With `[{ "ignoreStringEscape": true }]`, upstream reports `<p>{'\0'}</p>` and fixes it to `0`.
The escape list (`nrvtbfux`) leaves out `\0`, the one digit escape that strict code allows. This
crate counts `\0` as an escape and does not report it.
Case: `tests/cases/no-useless-mustaches/valid/null-escape-ignored-input.svelte`.

## A shorthand that does not compile (`svelte/shorthand-attribute`)

Issue: [eslint-plugin-svelte #1685](https://github.com/sveltejs/eslint-plugin-svelte/issues/1685).

| Input                 | Upstream fix        | `svelte/compiler` on the fix |
| --------------------- | ------------------- | ---------------------------- |
| `<div a={(a)}></div>` | `<div {(a)}></div>` | `attribute_empty_shorthand`  |
| `<div a={/*x*/a}>`    | `<div {/*x*/a}>`    | `attribute_empty_shorthand`  |

A shorthand holds a name and nothing else, apart from whitespace. This crate reports these
attributes and writes no fix.
Cases: `tests/cases/shorthand-attribute/invalid/parenthesized` and `commented`.

## Runes mode from a rune named in some types (svelte-eslint-parser)

Issue: [svelte-eslint-parser #1001](https://github.com/sveltejs/svelte-eslint-parser/issues/1001).

`hasRunesSymbol` walks the script with ESLint's visitor keys. Those keys skip an identifier's
annotation, a return type and type arguments, but they fall back to every key of a TypeScript node.
So `let o: $state;` leaves runes mode off, while each of these turns it on:

- `let o = 1 as $state;`
- `type T = $state;`
- `interface I { a: $state }`

A name in a type names no rune. This crate leaves runes mode off for these three and for the three
that upstream already skips.
Cases: `tests/cases/no-at-const-tags/valid/rune-in-as-type`, `rune-in-type-alias` and
`rune-in-interface`. The own cases
`no-at-const-tags/valid/rune-names-in-types` and `no-inspect/valid/rune-name-in-a-type` hold the
half that agrees with upstream.

## A destructured name read as the whole object (`svelte/no-not-function-handler`)

Issue: [eslint-plugin-svelte #1686](https://github.com/sveltejs/eslint-plugin-svelte/issues/1686).

`findRootExpression` follows `const { h } = { h: 1 }` to `{ h: 1 }` and reports "Unexpected
object in event handler." for `onclick={h}`. `const [h] = [1]` gets "array". Here `h` is 1. This
crate does not follow a destructured name, and reports nothing.
Cases: `tests/cases/no-not-function-handler/valid/destructured-object` and
`destructured-array`.

## A `{@const}` that the rule does not follow (`svelte/no-not-function-handler`)

Issue: [eslint-plugin-svelte #1687](https://github.com/sveltejs/eslint-plugin-svelte/issues/1687).

`{#if 1}{@const h = 1}<button onclick={h}></button>{/if}` gets no report, because the variable's
definition is not a script `const`. A `{@const}` is as constant as a script `const`, so this crate
follows it and reports "Unexpected number value in event handler.".
Case: `tests/cases/no-not-function-handler/invalid/const-tag-input.svelte`.

## A value written before the modifiers (`svelte/shorthand-directive`)

Issue: [eslint-plugin-svelte #1688](https://github.com/sveltejs/eslint-plugin-svelte/issues/1688).

With `prefer: never`, upstream fixes `<div style:color|important>` to
`<div style:color={color}|important>`. The compiler accepts that, but it reads the value as the
text `{color}|important`, so the directive loses `|important`. This crate writes
`style:color|important={color}`.
Case: `tests/cases/shorthand-directive/invalid/value-after-modifiers-input.svelte`.

## A slot name fix that breaks the attribute (`svelte/no-dynamic-slot-name`)

Not filed: upstream deprecates the rule.

| Input                      | Upstream fix           | What breaks                             |
| -------------------------- | ---------------------- | --------------------------------------- |
| `<slot name={'a"b'} />`    | `<slot name="a"b" />`  | the inner `"` ends the value            |
| `<slot name="x{'a"b'}" />` | `<slot name="xa"b" />` | the inner `"` ends the value            |
| `<slot name=x{"a b"}y />`  | `<slot name=xa by />`  | the space makes `by` a second attribute |

This crate reports these and writes no fix.
Cases: `tests/cases/no-dynamic-slot-name/invalid/quote-in-expression`,
`quote-in-quoted-value` and `space-in-unquoted-value`.

## U+2028 and U+2029 do not end a line in node locations

Issue: [svelte-eslint-parser #1002](https://github.com/sveltejs/svelte-eslint-parser/issues/1002).

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
- The corpus skips the 41 lint units whose source holds U+2028 or U+2029 and whose findings this
  changes.

## `svelte/valid-compile`: a block holding only a `svelte-ignore` comment reports `block_empty`

Issue: [eslint-plugin-svelte #1689](https://github.com/sveltejs/eslint-plugin-svelte/issues/1689).

- Case: `valid-compile/invalid/invalid-svelte-ignore03-input.svelte`. The corpus skips the units
  of this shape for `svelte.lint`.
- Upstream reports `Empty block` (`block_empty`) at 2:30 and 14:30, on `{#await …}` blocks whose
  pending branch holds only `<!-- svelte-ignore … -->`.
- Correct: no `block_empty`. `svelte compile` on the file does not warn, because the branch holds a
  comment besides whitespace. Upstream replaces every `svelte-ignore` comment with spaces before it
  compiles (`buildStrippedText` in `shared/svelte-compile-warns/index.ts`), so the compiler sees a
  branch of whitespace alone. Blanking the comments to apply them itself changes what the compiler
  warns about.

## `svelte/no-unused-svelte-ignore` and `svelte/valid-compile` drop the last of two or more codes

Issue: [eslint-plugin-svelte #1640](https://github.com/sveltejs/eslint-plugin-svelte/issues/1640).

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

Issue: [eslint-plugin-svelte #1690](https://github.com/sveltejs/eslint-plugin-svelte/issues/1690).

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

Issue: [eslint-plugin-svelte #1691](https://github.com/sveltejs/eslint-plugin-svelte/issues/1691).

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

Issue: [eslint-plugin-svelte #1692](https://github.com/sveltejs/eslint-plugin-svelte/issues/1692).

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
This crate does the opposite in both cases, and the corpus skips the lint units that show it.

## A crash in `svelte/no-reactive-functions` on ESLint 10

Fixed in eslint-plugin-svelte 3.24.1.

Input:

```svelte
<script>
	$: f = () => a;
</script>
```

The rule throws `source.isSpaceBetweenTokens is not a function`, a `SourceCode` method that
ESLint 10 removed, while it builds the report. This crate reports the statement as upstream's
tests expect.

## A crash in `svelte/indent` on an `enum` in a script without `lang`

Input:

```svelte
<script>
	enum E { A }
</script>
```

The rule throws `Cannot read properties of null (reading 'range')` from `getFirstAndLastTokens`,
which `setOffsetElementList` calls from the `TSEnumDeclaration` handler in
`indent-helpers/ts.ts`. The same `enum` in `<script lang="ts">` does not throw. This crate
indents the `enum` as in a TypeScript script. Test in `task/tests.rs`:
`an_enum_in_a_plain_script_is_indented`.

## A parse error at a position of the generated code (svelte-eslint-parser)

Input:

```svelte
<script>x</script>
```

The svelte-eslint-parser package (1.10.0) parses code it generates from the scripts and the template with
typescript-eslint (`parseScriptWithoutAnalyzeScopeFromVCode` and `analyzeTypeScriptInSvelte`
in `parser/script.js`). When that code fails, ESLint reports the error at its line and column in
the generated code: `Unexpected keyword or identifier.` at 2:0 here, a line the file does not
have. `{(a) /* c */}`, `let x = $;` and `generics="const T extends string"` fail the same way. This
crate does not reproduce them. The corpus skips each unit whose expected error is past the
end of its file.

## `<Script>` and `<Style>` read as blocks (svelte-eslint-parser)

Input:

```svelte
<Script>
	<p>hello</p>
</Script>
```

The svelte-eslint-parser package (1.10.0) finds the blocks in `context/index.js` with
`/<!--[\s\S]*?-->|<(script|style|template)([\s>])/giu`, which ignores case. Svelte reads
`<Script>` and `<Style>` as components and `<SCRIPT>` as an element, but the parser parses their
content as a script or a style sheet, and ESLint reports `Unterminated regular expression
literal.` here. Its end tag patterns, such as `/<\/style>/giu`, ignore case too, so a
`</STYLE>` in a string of the style sheet ends the block. This crate reads the tags as Svelte
does.

## `svelte/prefer-const` treats a `<script module>` export as a prop

Issue: [svelte-eslint-parser #992](https://github.com/sveltejs/svelte-eslint-parser/issues/992).

- Case: `tests/cases/prefer-const/invalid/script-module-input.svelte`,
  `<script module>\n\texport let m = 1;\n</script>`.
- Upstream reports nothing. The `analyzePropsScope` of svelte-eslint-parser adds a write to every
  `export let` in a script whose `context` attribute is not `"module"`, and Svelte 5's `module`
  attribute does not count.
- Correct: report `m`, as for `<script context="module">`. A module script's exports are not
  props, so nothing writes `m` after its declaration.
- The corpus skips the 22 lint units that this changes (`corpus/_registry/units.toml`).

## `svelte/prefer-const`: a write through a TypeScript assertion counts as a read

No issue yet.

- Cases: `bind:value={x as T}`, `bind:this={el as HTMLElement}` and, in a script,
  `(count satisfies number) = 1` or `count!! = 1`.
- Upstream reports the variable as never reassigned. Its scope analysis reads a reference inside
  `TSAsExpression`, `TSSatisfiesExpression`, `TSNonNullExpression` or a type assertion as a read
  and misses the write. `svelte/no-reactive-reassign` has the same gap (above).
- Correct: report nothing. Svelte writes the binding through the assertion, and TypeScript
  assigns through it, so `const` would break the code.
- The corpus skips its 15 lint units.

## `svelte/prefer-const`: a name that another scope declares too

No issue yet.

- Cases: `<script module>export const foo = 42;</script><script>let foo = 100;</script>`, and an
  instance `let nm = 1;` beside a root `{@const nm = 1}` or `{let nm = 1}`.
- Upstream reports nothing for the instance `let`. A guess: svelte-eslint-parser declares both
  names in one scope, and the rule skips a variable with two declarations.
- Correct: report the instance `let`. Svelte keeps the instance script in a scope of its own
  inside the module's, so the `let` shadows the other name and nothing reassigns it.
- The corpus skips its 7 lint units.

## `svelte/prefer-svelte-reactivity`: a reassigned variable hides its later constructions

Fixed in eslint-plugin-svelte 3.24.1, which reports the first construction twice instead: [eslint-plugin-svelte #1693](https://github.com/sveltejs/eslint-plugin-svelte/issues/1693).

- Case: `tests/cases/prefer-svelte-reactivity/invalid/reassigned-input.svelte.js`,
  `let q = new Set(); q = new Set(); q.add(1);`.
- Upstream reports only the first `new Set()`. The mutation check takes one result of
  `ReferenceTracker.iteratePropertyReferences` with `.next()` and never closes the generator,
  so `q` stays on the tracker's `variableStack` and the tracker skips the second construction as a cycle.
- Correct: report the second `Set` too. `q.add(1)` mutates that one, so upstream misses
  exactly the construction the rule exists to catch. rsvelte follows every reference of `q`
  from each construction and reports both.
- The corpus skips its 5 lint units, which reassign a variable a new instance.

## `svelte/indent`: a snippet without parameters takes a `(` from its body

Issue: [eslint-plugin-svelte #1694](https://github.com/sveltejs/eslint-plugin-svelte/issues/1694).

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

Issue: [svelte-eslint-parser #1002](https://github.com/sveltejs/svelte-eslint-parser/issues/1002).

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

Issue: [eslint-plugin-svelte #1695](https://github.com/sveltejs/eslint-plugin-svelte/issues/1695).

- Rule: `prefer-style-directive`.
- Case: `tests/cases/prefer-style-directive/invalid/declaration-with-comment-input.svelte`.
- Upstream: the fix turns `<div style="color: a /* c */ b;">` into `<div style:color="a /*">`.
- Correct: `<div style:color="a  b">`, the value that `PostCSS` gives.
- Why: the fix slices the source from the value's start by the length of the cleaned value
  (`decl.value.range`), and a comment makes the cleaned value shorter than the written one.

## A shorthand ID attribute does not count

Issue: [eslint-plugin-svelte #1696](https://github.com/sveltejs/eslint-plugin-svelte/issues/1696).

- Rule: `consistent-selector-style`.
- Case: `tests/cases/consistent-selector-style/valid/shorthand-id-input.svelte`.
- Upstream: with `let { id } = $props()`, `<div {id}>` reports `#a` as "Selector should select by
  element type instead of ID", while `<div id={id}>` reports nothing.
- Correct: both report nothing, because the element may carry any ID.
- Why: the rule reads IDs from `SvelteAttribute` only and skips `SvelteShorthandAttribute`.

## A selector inside `@keyframes` counts as an element type

Issue: [eslint-plugin-svelte #1697](https://github.com/sveltejs/eslint-plugin-svelte/issues/1697).

- Rule: `consistent-selector-style`.
- Case: `tests/cases/consistent-selector-style/valid/keyframe-selectors-input.svelte`.
- Upstream: with `style: ["class"]`, `@keyframes a { from {} 50% {} }` reports `from` and `50%` as
  "Selector should select by class instead of element type".
- Correct: no report, because these selectors select no element.
- Why: the rule checks every rule inside an at-rule, `@keyframes` included.

## An each block's else branch counts as repeated

Issue: [eslint-plugin-svelte #1698](https://github.com/sveltejs/eslint-plugin-svelte/issues/1698).

- Rule: `consistent-selector-style`.
- Case: `tests/cases/consistent-selector-style/invalid/each-else-branch-input.svelte`.
- Upstream: with `style: ["id", "class"]`, the rule says nothing about `.a` on the only element in
  `{#each xs as x}…{:else}…`. For the same element in `{#if c}…{:else}…`, it reports "Selector
  should select by ID instead of class".
- Correct: the rule reports both. The `{:else}` branch of an each block renders at most once.
- Why: `elementOccurrenceCount` multiplies the else block's count by the count of its parent each
  block, which is `ZeroToInf`.
- The corpus skips the lint units that hold such a branch.

## A space beside an expression names an empty class

Issue: [eslint-plugin-svelte #1700](https://github.com/sveltejs/eslint-plugin-svelte/issues/1700).

- Rule: `no-unused-class-name`.
- Cases: `tests/cases/no-unused-class-name/valid/space-after-expression` and
  `space-before-expression`.
- Upstream: `<div class="{b} ">` and `<div class=" {b}">` report `Unused class "".`.
- Correct: no report.
- Why: `findClassesInAttribute` trims a literal part and splits it on spaces, so a part that
  holds only spaces gives one empty string.
- The corpus skips the lint units with such a report (`corpus/_registry/units.toml`).

## The style directive fix breaks a value with a double quote

Issue: [eslint-plugin-svelte #1695](https://github.com/sveltejs/eslint-plugin-svelte/issues/1695).

- Rule: `prefer-style-directive`.
- Case: `tests/cases/prefer-style-directive/invalid/value-with-double-quote-input.svelte`.
- Upstream: the fix turns `<div style='font-family: "Arial"'>` into
  `<div style:font-family=""Arial"">`.
- Correct: no fix, and the report stays.
- Why: the fix always quotes the value with `"`.

## The style directive fix drops `!important` from a conditional

Issue: [eslint-plugin-svelte #1695](https://github.com/sveltejs/eslint-plugin-svelte/issues/1695).

- Rule: `prefer-style-directive`.
- Case: `tests/cases/prefer-style-directive/invalid/conditional-important-input.svelte`.
- Upstream: the fix turns `style={c ? "color: red !important" : ""}` into
  `style:color={c ? "red" : null}`.
- Correct: `style:color|important={c ? "red" : null}`.
- Why: the fix writes the declaration's value, and `PostCSS` keeps `!important` apart from it.

## The style directive fix changes a property that the style sets twice

Issue: [eslint-plugin-svelte #1695](https://github.com/sveltejs/eslint-plugin-svelte/issues/1695).

- Rule: `prefer-style-directive`.
- Cases: `tests/cases/prefer-style-directive/invalid/property-set-twice` and
  `conditional-property-set-twice`.
- Upstream: the fix turns `<div style="color: red; color: blue">` into
  `<div style:color="red" style="color: blue">`. A directive wins over the attribute, so the text
  turns red.
- Correct: no fix while another declaration or conditional in the style sets the same property,
  and the reports stay.
- Why: the rule fixes each declaration on its own.

## The class directive fix duplicates a directive

Issue: [eslint-plugin-svelte #1701](https://github.com/sveltejs/eslint-plugin-svelte/issues/1701).

- Rule: `prefer-class-directive`.
- Case: `tests/cases/prefer-class-directive/invalid/class-with-its-directive-input.svelte`.
- Upstream: the fix turns `<div class={a ? "" : "x"} class:x={b}>` into
  `<div class:x={!a} class:x={b}>`, and Svelte rejects the duplicate attribute.
- Correct: no fix, and the report stays.
- Why: the fix does not look at the element's other directives.

## A comment in a pseudo-class's arguments moves the selectors after it (`svelte/consistent-selector-style`)

No issue yet.

- Case: `<div class="a"></div><style>div:is(/* l */ .a) { color: red }</style>`.
- Upstream reports `.a` 7 columns before it, the length of `/* l */`, as if the comment were not in
  the source. A comment before another argument does the same: in `div:not(.a /* m */, .b)`,
  `.b` moves by its comment. So does a comment between the selectors of a rule: in
  `.a /* c */, .b`, upstream reports `.b` 7 columns before it. So does a comment between compounds,
  as in `p > /* c */ .a` and `.a /* mid */ .b`.
- Correct: report `.a` at its own column.
- The corpus skips its 8 lint units.

## Quirks of the CSS parsers that upstream uses

Not filed.

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
  The property itself starts at the prefix but is as long as the name without it, so
  `svelte/no-dupe-style-properties` and `svelte/no-shorthand-style-property-overrides` report
  `_colo` for `_color`. The corpus skips their 2 lint units.
- The safe parser ends an open comment, string or escape one character past the source, and the
  declaration that holds it too. For `a: b /* c`, the comment ends at 10. This crate ends it at the
  source's end, 9.
  The corpus skips its 3 lint units.
- An at-rule in an inline style, such as `style="@media x"`, has no end, and `convertChild`
  throws. This crate does not convert that style.
- `postcss-selector-parser` 7.2.0 ends a hex escape with a space only, and only after fewer than six
  digits
  ([`consumeEscape`](https://github.com/postcss/postcss-selector-parser/blob/7591d8d67f42fde79490d5e9c8fac0b8deb43fa2/src/tokenize.js#L71-L93)).
  CSS Syntax 3 lets one whitespace of any kind end it, a tab or a line break too, and so does
  Svelte. So upstream reads `#line\a` and `break` in `#line\a⏎break`, where Svelte reads one ID,
  `line⏎break`. `svelte/consistent-selector-style` then reports `#line\a`. The corpus skips the
  two lint units that hold such escapes.

## The SvelteKit navigation rules: `$app/paths` through a namespace, a constant or a pattern

Issue: [eslint-plugin-svelte #1702](https://github.com/sveltejs/eslint-plugin-svelte/issues/1702), for `no-navigation-without-resolve`. Not filed for `no-navigation-without-base`, which upstream deprecates.

In eslint-plugin-svelte 3.23.1, each input below is in a Kit 2 project, and its `<script>` holds
`import { goto } from '$app/navigation';` and the import shown:

| Rule                            | Input                                                                 | Upstream       |
| ------------------------------- | --------------------------------------------------------------------- | -------------- |
| `no-navigation-without-resolve` | `import * as p` and `goto(p.asset('/x'))`, `<a href={p.asset('/y')}>` | reports both   |
| `no-navigation-without-resolve` | `import { resolve }` and `const r = resolve; goto(r('/x'))`           | reports `goto` |
| `no-navigation-without-resolve` | `import * as p` and `const { resolve } = p; goto(resolve('/y'))`      | reports `goto` |
| `no-navigation-without-base`    | `import * as p` and `const { base } = p; goto(base + '/x')`           | reports `goto` |

Upstream allows `asset()` imported by name, `resolve as alias` and `base` imported by name. Each
input above calls the same function or reads the same value, so upstream should allow it too. The
rules take the references of an import specifier's local name. Of the other uses that the
`ReferenceTracker` of `@eslint-community/eslint-utils` finds, they keep only a `p.resolve` or
`p.base` member. This crate follows the value through the namespace, the constant and the
pattern, and reports none of them.
Tests in `crates/hosts/command_line/tests/svelte_kit.rs`: `asset_through_the_namespace_is_resolved`,
`resolve_through_a_constant_is_resolved` and `a_path_destructured_from_the_namespace_is_followed`.

## The SvelteKit navigation rules throw

Not filed: upstream deprecates `no-goto-without-base` and `no-navigation-without-base`. Since eslint-plugin-svelte 3.24.1, `rel` no longer throws.

In eslint-plugin-svelte 3.23.1, these inputs in a Kit 2 project make a rule throw:

| Rule                            | Input                                                                          | Upstream throws                                         |
| ------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `no-goto-without-base`          | `import * as p from '$app/paths'` and `goto(p.base + '/x')`                    | `Cannot read properties of undefined (reading 'range')` |
| `no-goto-without-base`          | `import * as p from '$app/paths'; const { base } = p;` and `goto(base + '/x')` | the same                                                |
| `no-navigation-without-base`    | `<a href="">`, `<a href=''>` or `<a href>`                                     | `Cannot read properties of undefined (reading 'type')`  |
| `no-navigation-without-resolve` | `<a href="/x" rel>`                                                            | the same                                                |

The first two take the `local` name of each use of `base`, which only an import specifier has. The
others read `value[0]` of an attribute without a value, and `svelte-eslint-parser` gives `href=""`
no value too. This crate takes `p.base + '/x'` as a path that starts with the base path. Like upstream's
`no-navigation-without-resolve`, both rules here check no link whose `href` is empty. A `rel`
without a value names no external link, so this crate reports `<a href="/x" rel>`.
Tests in `svelte_kit.rs`: `base_through_the_namespace_prefixes_a_url`,
`an_empty_link_is_not_checked` and `rel_without_a_value_is_not_external`.

## `svelte/no-export-load-in-svelte-module-in-kit-pages` misses `<script module>`

Fixed in eslint-plugin-svelte 3.24.1 ([eslint-plugin-svelte #1664](https://github.com/sveltejs/eslint-plugin-svelte/issues/1664)).

In eslint-plugin-svelte 3.23.1, the rule reports nothing for this `+error.svelte` or
`+layout.svelte` in a Kit 2 project:

```svelte
<script module>
	export function load() {}
</script>
```

The rule looks only for a script whose `context` attribute is `"module"`, and Svelte 5's `module`
attribute does not count. The export is the same mistake under either attribute. This crate reports
`load`, as upstream does for `<script context="module">`.
Test in `svelte_kit.rs`: `load_in_a_module_script_of_an_error_page_is_reported`.

## `svelte/valid-prop-names-in-kit-pages` reports a computed key

Issue: [eslint-plugin-svelte #1703](https://github.com/sveltejs/eslint-plugin-svelte/issues/1703).

In eslint-plugin-svelte 3.23.1, the rule reports `[k]` in this `+page.svelte` of a Kit 2 project:

```svelte
<script>
	const k = 'data';
	let { [k]: c } = $props();
</script>
```

The rule takes an identifier key as the prop's name even in brackets, so it reports a prop called
`k`. A computed key names the value of its expression, here `data`, which a page takes. This crate
does not check a computed key.
Test in `svelte_kit.rs`: `a_computed_prop_name_is_not_reported`.

## A legacy reference inside a longer name in an attribute (`@vue/compiler-core`)

This one is not eslint-plugin-svelte's. `@vue/compiler-sfc` 3.5.44 parses templates with
`entities` 7.0.1, which decodes these attribute values:

| Input               | Upstream reads | The HTML spec reads |
| ------------------- | -------------- | ------------------- |
| `title="&notinvb"`  | `¬invb`        | `&notinvb`          |
| `title="&timesb"`   | `×b`           | `&timesb`           |
| `title="&gtques9"`  | `>ques9`       | `&gtques9`          |

In an attribute, a name without its semicolon is not a reference when a letter or digit or `=`
follows it. Each input above stops partway through a longer name (`notinvb;` and `timesb;` and
`gtquest;`). There the decoder skips that check. Guess from reading `entities`: the check is
missing from the branch that matches a run of letters. Of 199924 generated attribute values,
1356 differ from the spec. Of those, 1324 are what the spec gives for text. This crate follows
the spec.
Test in `rsvelte_markup_syntax`: `character_references::tests::html_follows_the_spec_where_compiler_core_does_not`.

## A component's `let:` names reach its named slots (svelte-eslint-parser)

Issue: [svelte-eslint-parser #1003](https://github.com/sveltejs/svelte-eslint-parser/issues/1003).

- Case: `<C let:x><p slot="a">{x}</p></C>` beside an instance `let x`, as in Svelte's own
  `runtime-legacy/samples/component-slot-let-scope` and `component-slot-let-scope-3` and
  `runtime-runes/samples/component-let-directive`, and in five corpus apps.
- Upstream resolves `{x}` to the `let:` name. So no-unused-vars reports the instance `x`, or
  misses a `let:` name that only a named slot reads.
- Correct: Svelte's `create_scopes` gives a child with a static `slot` a scope of the component's
  outer one. That scope lacks the component's `let:` names, unless the component has a static
  `slot` of its own. This crate resolves names as the compiler does.
  Test: `rsvelte_svelte_semantic` `resolve::tests::a_component_s_let_names_reach_its_default_slot_and_not_a_named_one`.
- The corpus skips its 9 lint units.

## A component's `let:` names reach its own attributes (svelte-eslint-parser)

Issue: [svelte-eslint-parser #1004](https://github.com/sveltejs/svelte-eslint-parser/issues/1004).

- Case: `<Child message={message} let:message>` beside an instance `let message`, as in Svelte's
  `runtime-runes/samples/slot-static` and svelte2tsx's `component-slot-shadowed-prop`.
- Upstream resolves `{message}` to the `let:` name. So no-unused-vars reports the instance
  `message`, or the `let:` name that only the attribute reads.
- Correct: Svelte's compiler evaluates the attributes of a component without a static `slot`
  outside its `let:` scope. This crate resolves names as the compiler does.
  Test: `rsvelte_svelte_semantic` `resolve::tests::an_element_attribute_sees_its_let_names_and_a_component_one_only_with_a_slot`.

## Smaller upstream defects that one or two corpus units show

No issues yet. The corpus skips the lint units of each.

- `svelte/no-inspect` visits every `Identifier`
  ([no-inspect.ts](https://github.com/sveltejs/eslint-plugin-svelte/blob/24201e06a1a8e270c1143d1fb460e6ae635719d8/packages/eslint-plugin-svelte/src/rules/no-inspect.ts#L27)),
  and the syntax tree has two over the one token of `const { $inspect } = o`,
  `import { $inspect }` and `export { $inspect }`. Upstream reports them twice. This crate reports each token once.
- `hasUsefulStringEscape` does not count `\0`
  ([prefer-attribute-interpolation.ts](https://github.com/sveltejs/eslint-plugin-svelte/blob/24201e06a1a8e270c1143d1fb460e6ae635719d8/packages/eslint-plugin-svelte/src/rules/prefer-attribute-interpolation.ts#L15)),
  so upstream reports `` data-a={`a\0${b}`} ``, whose null character no attribute text can hold. This
  crate does not.
- `svelte/no-inner-declarations` gives the core rule a proxy node
  ([no-inner-declarations.ts](https://github.com/sveltejs/eslint-plugin-svelte/blob/24201e06a1a8e270c1143d1fb460e6ae635719d8/packages/eslint-plugin-svelte/src/rules/no-inner-declarations.ts#L29-L36)).
  `getScope` does not know the proxy, so `.upper` is the global scope for
  `if (a) function g() {}` at the top of a script, and upstream reports the strict code as
  sloppy. This crate does not report it.
- The `ReferenceTracker` of `@eslint-community/eslint-utils` stops a cycle with a stack, not a set of the variables it has
  seen. For `const { ['derived']: d = ns.derived } = ns; d()`, it reaches `d` through the key
  and through the default, and `svelte/require-stores-init` reports `d()` twice.
- The svelte-eslint-parser package takes a `}` inside a comment for the end of an `{#await}` head:
  `{#await p /* } */}` gives `svelte/mustache-spacing` the space before the comment's `}`.
- The svelte-eslint-parser package drops the attributes of a `<style>` whose closing tag is `</style >`, so
  `svelte/block-lang` and `svelte/first-attribute-linebreak` see no `lang`.
- The svelte-eslint-parser package reads `// c` in a start tag inside a block, such as
  `{#if a}<div // c\n>{/if}`, as a token for each character, not as a comment. Upstream then takes
  the comment's last character as the token before `>`.

## An export specifier marks its local name as a prop (svelte-eslint-parser)

No issue yet. `analyzePropsScope` adds a read of `spec.local` for every specifier of an
`export { … }`, whatever its `source` or `exportKind`
([analyze-scope.ts](https://github.com/sveltejs/svelte-eslint-parser/blob/467f843e0c74a08b694e0d1b5676a10931023a2f/src/parser/analyze-scope.ts)).

- Case: `let x = 1; export { x as y } from './mod';`. The specifier names the module's `x`,
  yet upstream counts the instance `x` as read and reports nothing for no-unused-vars.
- Case: `const q = 1; export { type q };`. A type-only export reads no value, yet upstream counts
  `q` as read.
- Correct: report the unused `x` and `q`. This crate does.
- The corpus skips their 2 lint units.

## An each block's context with a type annotation (`svelte/require-each-key`)

No issue yet. The rule ends its range at the token after the index, or after the context when
there is no index
([require-each-key.ts](https://github.com/sveltejs/eslint-plugin-svelte/blob/24201e06a1a8e270c1143d1fb460e6ae635719d8/packages/eslint-plugin-svelte/src/rules/require-each-key.ts#L21)).

- Case: `{#each xs as x: string}`. The context ends at `x`, so the next token is the `:` of
  the annotation, and upstream reports `{#each xs as x:`.
- Case: `{#each xs as x: string, i}`. The svelte-eslint-parser package finds the index by searching its name
  from the end of the context
  ([block.ts](https://github.com/sveltejs/svelte-eslint-parser/blob/467f843e0c74a08b694e0d1b5676a10931023a2f/src/parser/converts/block.ts#L287-L295)),
  and finds the `i` of `string`. Upstream's range then ends inside the annotation.
- Correct: the range ends at the `}` of the opening tag. This crate reports it so.
- The corpus skips their 2 lint units.

## The last `</textarea` of a textarea's end tag starts it (svelte-eslint-parser)

No issue yet. The svelte-eslint-parser package starts an end tag at the last `<` before the element's end
([element.ts](https://github.com/sveltejs/svelte-eslint-parser/blob/467f843e0c74a08b694e0d1b5676a10931023a2f/src/parser/converts/element.ts#L977)).

- Case: `<textarea>a</textarea\n\n\n</textarea\n\n>`. Svelte reads one end tag from the first
  `</textarea` to the `>`. Upstream starts it at the second, so the tag reads as one line, and
  `svelte/html-closing-bracket-new-line` reports the line breaks before its `>`.
- Correct: the end tag spans more than one line, and the rule never adds a line break to an end tag.
  This crate reports nothing.
- The corpus skips its lint unit.

## The `this` attribute of `<svelte:element>` (svelte-eslint-parser)

No issue yet. `processThisAttribute` finds the parts of `this=` by searching the text
([element.ts](https://github.com/sveltejs/svelte-eslint-parser/blob/467f843e0c74a08b694e0d1b5676a10931023a2f/src/parser/converts/element.ts#L536-L601)).

- Case: `<svelte:element this = {tag}>`. The key runs from `this` to the `=`
  ([element.ts](https://github.com/sveltejs/svelte-eslint-parser/blob/467f843e0c74a08b694e0d1b5676a10931023a2f/src/parser/converts/element.ts#L666)), so its text is `this `. Upstream reports only the space after the `=`
  for `svelte/no-spaces-around-equal-signs-in-attribute`, and names `'this '` in the message of
  `svelte/max-attributes-per-line`.
- Case: `<svelte:element this="{'div'}">` and `<svelte:element this='h{n}'>`. A string value
  that does not start with `{` becomes a static attribute. Its value is as long as the string
  Svelte read, measured from after the quote, so `this="{'div'}"` ends at `{'di`. Upstream
  reports nothing for `svelte/html-quotes` and gives other rules the short range.
- Correct: the key is `this`, and the value is the whole quoted text. This crate reads them so.
- The corpus skips their 11 lint units.

## A name declared inside `{:else}` is not found (svelte-eslint-parser)

No issue yet.

- Case: `{#if a}x{:else}{(() => { const o = new Set(); o.add(1); })()}{/if}`.
- Upstream reports nothing for `svelte/prefer-svelte-reactivity`. `nestIfBlock` gives the scope of
  the `{#if}` branch the whole `SvelteIfBlock` as its block
  ([script-let.ts](https://github.com/sveltejs/svelte-eslint-parser/blob/467f843e0c74a08b694e0d1b5676a10931023a2f/src/context/script-let.ts#L502-L509)),
  and the `{:else}` scope is its sibling. The `getInnermostScope` of
  `@eslint-community/eslint-utils` stops at the first
  child scope whose block holds the node, so `findVariable` never reaches the `{:else}` scope.
- Correct: report `new Set()`, as for the same code in the `{#if}` branch. This crate does.
- The corpus skips its lint unit.

## An each block's key sees a `{@const}` of the body (svelte-eslint-parser)

Issue: [svelte-eslint-parser #1005](https://github.com/sveltejs/svelte-eslint-parser/issues/1005).

- Case: `{#each things as thing (key)}{@const key = thing.id}…{/each}`, eslint-plugin-svelte's
  own `valid-each-key/invalid/const-key01`.
- Upstream resolves `key` to the `{@const}`, so no-unused-vars counts it as read.
- Correct: Svelte 5.57.3 compiles the key to `(thing) => key`, a global.
  Test: `rsvelte_svelte_semantic` `resolve::tests::an_each_key_does_not_see_a_const_of_the_body`.

## Markup that svelte-eslint-parser does not read

| Case                                                      | Upstream                        | Corpus units |
| --------------------------------------------------------- | ------------------------------- | ------------ |
| `<script` in a string: `` {@html `<script>…</script>`} `` | `Parsing error`                 | 9            |
| Components named `Script` and `Style`                     | `Parsing error: Type expected.` | 1            |
| `use:a.b`, `transition:a.b`, `class:A.B`, `style:a-b`     | `Parsing error`                 | 16           |
| A component named `Style` in a file without that error    | read as a `<style>` element     | 3            |
| A one-line `<script>import … from '…'</script>`           | `Parsing error: ';' expected.`  | 1            |
| Any other one-line `<script>…</script>`                   | `Parsing error: ',' expected.`  | 38           |
| `{@const x = (y)}`                                        | `Parsing error: ')' expected.`  | 2            |
| `{@const x = (a, b)}` and `{#await (a, b)}`               | `Parsing error: ')' expected.`  | 9            |
| An expression that ends in a line comment: `{a // c\n}`   | `Parsing error: ')' expected.`  | 24           |
| `<template lang="pug">` with a `{a}`                      | no reference to `a`             | 2            |
| A closing tag with a space: `</script >`                  | no script                       | 3            |
| A one-line file whose script follows the template         | no script                       | 1            |
| A line comment after a call: `{#await f(a) // }`          | the head ends inside it         | 1            |
| `</textarea` twice, the first not closed by `>`           | the end tag at the second       | 1            |

Issues for the rows of the table:

- `<script` in a string: [svelte-eslint-parser #346](https://github.com/sveltejs/svelte-eslint-parser/issues/346).
- `Script` and `Style`: [svelte-eslint-parser #1006](https://github.com/sveltejs/svelte-eslint-parser/issues/1006). `Style` parses since svelte-eslint-parser 1.10.1.
- Directive names: [svelte-eslint-parser #1007](https://github.com/sveltejs/svelte-eslint-parser/issues/1007), for a member name. Svelte reads a name with `-` as a subtraction, so that one has no issue.
- The one-line script: [svelte-eslint-parser #1009](https://github.com/sveltejs/svelte-eslint-parser/issues/1009). It fails with TypeScript when `</script>` ends the file.
- Any other one-line script: no issue yet. It may be the defect of #1009, without TypeScript. The error
  is past the end of the script.
- `{@const x = (y)}`: [svelte-eslint-parser #1008](https://github.com/sveltejs/svelte-eslint-parser/issues/1008).
- A parenthesized sequence: no issue yet. It may be #1008 again; `{#await}` is another host.
- A line comment at the end of an expression: no issue yet. The error is past the end of the
  file. A guess: the comment hides a `)` or `}` that the parser adds after the expression.
- `<template lang="pug">`: [svelte-eslint-parser #727](https://github.com/sveltejs/svelte-eslint-parser/issues/727).
- `</script >`: no issue yet. No rule sees the script, so `no-undef` reports its names in the
  template.
- A script after the template on one line: no issue yet. The case is
  `{#if x}<p></p>{/if}<script lang="ts">let a = 1</script>`.
- A line comment after a call: no issue yet. Without the call, `{#await a // }` is the
  `Parsing error` above. With it, the tokens read `//` as two `/` and the
  `}` after them as the end of the head, so the next line's `}` is text to `svelte/indent`.
- `</textarea`: no issue yet. In `<textarea>a</textarea⏎⏎</textarea⏎>`, Svelte ends the content
  at the first `</textarea`, whose end tag runs to the `>`. The svelte-eslint-parser package starts the end tag
  at the second `</textarea`, and the text between belongs to no node.

Svelte 5.57.3 compiles every one of them, so this crate lints them. The corpus skips their lint
units (`corpus/_registry/units.toml`).

## A `<script>` inside the markup joins the component's script (svelte-eslint-parser)

With svelte-eslint-parser 1.10.1 and `svelte/indent` at its defaults.

```svelte
<script>
  import { dev } from '$app/environment'
</script>

<svelte:head>
  {#if !dev}
    <script>
      window.a = 1
    </script>
  {/if}
</svelte:head>
```

Upstream reports every line from 3 to 11, for example line 5: `Expected indentation of 4 spaces
but found 0 spaces.` The `ImportDeclaration` ends at 8:18, the end of `window.a = 1`.
[`extractBlocks`](https://github.com/sveltejs/svelte-eslint-parser/blob/e7e70142ca0b211ff849057e0b1d68eba460fb4b/src/context/index.ts#L395-L396)
finds `<script>` elements with a regular expression over the whole file, and
[the loop](https://github.com/sveltejs/svelte-eslint-parser/blob/e7e70142ca0b211ff849057e0b1d68eba460fb4b/src/context/index.ts#L233)
adds the content of each one to the component's script code, a nested one too. Svelte reads the
nested element as markup. The corpus skips the lint unit.

## A comment in a tag inside a block is not a comment (svelte-eslint-parser)

No issue yet. With svelte-eslint-parser 1.10.1 and `svelte/indent` at its defaults.

```svelte
{#if a}
  <div
    class="a"
    // c
  ></div>
{/if}
```

Upstream reports nothing. Put `<div>` and `</div>` in place of the block, and it reports line 4
as indented by 4 spaces where it expects 2 spaces. To find the tag of each comment,
[the loop](https://github.com/sveltejs/svelte-eslint-parser/blob/e7e70142ca0b211ff849057e0b1d68eba460fb4b/src/parser/converts/root.ts#L186-L229)
walks only elements whose parents are elements, so it skips a comment in a tag inside a block.
[The fallback](https://github.com/sveltejs/svelte-eslint-parser/blob/e7e70142ca0b211ff849057e0b1d68eba460fb4b/src/parser/index.ts#L359-L360)
then makes a token of each character of the comment. The `svelte/indent` rule indents those
tokens as an attribute. `main` (2352dd6eac) has the same loop. The corpus skips the lint unit.

## Rules that throw (`svelte/indent`, `svelte/consistent-selector-style`, `no-unused-vars`)

- `svelte/indent` throws `Cannot read properties of null (reading 'range')` on 18 components of
  `svelte-material-ui` and one of `threlte`.
- `svelte/consistent-selector-style` throws `Unexpected '!'` on an HTML comment in `<style>`
  (Svelte's `css/samples/comment-html`).
- Issues: the `svelte/indent` crash comes from a mapped type in a `$props()` annotation, and [eslint-plugin-svelte #970](https://github.com/sveltejs/eslint-plugin-svelte/issues/970) fixes it on `main`, not yet released. [eslint-plugin-svelte #1699](https://github.com/sveltejs/eslint-plugin-svelte/issues/1699) is the `consistent-selector-style` crash.
- `svelte/consistent-selector-style` also throws on any selector `postcss-selector-parser`
  rejects (7 units). Examples are `*|`, a bare `:` and `[  ]`. So is `[x^]`, an attribute
  operator with no value.
- `svelte/indent` throws `Column number out of range` when a line starts with U+2028 or U+2029
  (2 units). `svelte-eslint-parser` counts token columns as if neither breaks a line, while
  ESLint's `sourceCode.lines` splits on both, and the fix calls `getIndexFromLoc` with that
  column on an empty line:
  [`indent-helpers/index.ts`](https://github.com/sveltejs/eslint-plugin-svelte/blob/24201e06a1a8e270c1143d1fb460e6ae635719d8/packages/eslint-plugin-svelte/src/rules/indent-helpers/index.ts).
- ESLint's `no-unused-vars` throws `Node must be provided when reporting error if location is
  not provided` on an unused `enum` member with a string-literal name, `enum E { 'a-b' }` (2 units):
  the `typescript-eslint` variable has a definition but no identifier to report at.
- ESLint then reports nothing for the file. This crate reports every rule, and the corpus skips
  these lint units.

## `svelte/indent`: a mapped type moves unrelated lines when the script uses a rune

With eslint-plugin-svelte 3.24.1, svelte-eslint-parser 1.10.1 and default options.

```svelte
<script lang="ts">
  const e: { [K in keyof typeof h]: K } = {}
  let s = $state(1)
</script>

<div>
  <p title="a"></p>
  <!-- the same line 15 more times -->
</div>
```

Upstream reports lines 3 to 6 and every `<p>`: `Expected indentation of 4 spaces but found 2
spaces.` and the like. With a rune or a store, svelte-eslint-parser parses virtual code. It then
fixes node locations, but not the deprecated alias `TSMappedType.typeParameter`, which keeps its
virtual-code range (here `[391, 410]` for a type at `[30, 58]`).
[`TSMappedType`](https://github.com/sveltejs/eslint-plugin-svelte/blob/a18a0e43f1d31a01f102208e75249ce5d401e983/packages/eslint-plugin-svelte/src/rules/indent-helpers/ts.ts#L269-L274)
lays out that range as an element, so it sets offsets on whatever tokens sit there. When the
range holds no token, the rule throws (the section above). PR
[#970](https://github.com/sveltejs/eslint-plugin-svelte/pull/970), merged on `main` and not yet
released, reads `key` and `constraint` instead. The corpus skips these lint units.

## Svelte's compiler: what `svelte.compile` warns, which `svelte/valid-compile` reports

These are behaviors of `svelte` 5.57.3 (`tools/oracle`) that `rsvelte_svelte_semantic`'s warnings do not
reproduce. Each is a candidate issue for `sveltejs/svelte`. `svelte.compile` gave the upstream
output (`corpus/**/expected/svelte.compile/client.warnings.json`).

### A `svelte-ignore` code warning before `<style>` points four bytes early

- Case: `<!-- svelte-ignore css-unused-selector -->` before `<style>`, as in
  `eslint-plugin-svelte/.../no-unused-svelte-ignore/invalid/style-lang01-input.svelte`.
- Upstream reports `legacy_code` four bytes before `css-unused-selector`. The analysis reads the
  style's comment with `extract_svelte_ignore(comment.start, comment.data, …)`, while the template
  walk passes `prev.start + 4`, the offset of `comment.data`.
- Correct: the code itself. This crate reports it there.
  Test: `warnings::tests::a_legacy_code_before_the_style_is_reported_at_the_code`.

### A comment in a component's default slot is read again before every later child

- Case: `svelte-ux/.../docs/components/Switch/+page.svelte`, where
  `<!-- svelte-ignore a11y-label-has-associated-control -->` stands inside `<Preview>`.
- Upstream reports its `legacy_code` twice, and the comment ignores the codes it names on every
  later element child of the component, not only the next one. `visit_component` collects the
  default slot's nodes with `nodes[slot_name].push(...comments, child)` and clears `comments` only
  for a named slot, so the comment comes again before each later child of the default slot.
- Correct: the comment leads the next node only, and warns once, as in any other fragment. This
  crate reads the fragment as written.
  Test: `warnings::tests::a_comment_in_a_default_slot_warns_once`.

## `svelte/valid-compile`: a literal after another one skips the bidirectional character check

An issue for Svelte, not for eslint-plugin-svelte.

- Case: none upstream; rsvelte's own corpus units under
  `rsvelte-tests-core-1/bidi_every_occurrence_3344/`, such as
  `<script>let a = "x‮y"; let b = "p‮q"; let c = "m‮n";</script>`, where upstream
  warns only about `b`.
- Svelte 5.57.3 tests each string literal and template element with the `test` of a global
  regular expression. The code is in [`patterns.js`](https://github.com/sveltejs/svelte/blob/23bb146306ff02cc5041bca0c5de9f8bd086e4a3/packages/svelte/src/compiler/phases/patterns.js#L24-L25),
  [`Literal.js`](https://github.com/sveltejs/svelte/blob/23bb146306ff02cc5041bca0c5de9f8bd086e4a3/packages/svelte/src/compiler/phases/2-analyze/visitors/Literal.js#L10),
  [`TemplateElement.js`](https://github.com/sveltejs/svelte/blob/23bb146306ff02cc5041bca0c5de9f8bd086e4a3/packages/svelte/src/compiler/phases/2-analyze/visitors/TemplateElement.js#L9).
  `test` starts at the `lastIndex` that the call before left, even one in another file, so a
  match moves the start of the next test and a failed test resets it.
- Correct: warn about every literal that holds such a character, as rsvelte does. The corpus
  skips these units for `svelte.lint` as it does for `svelte.compile`.

## `svelte/valid-compile`: a dotted namespace crashes the compiler

An issue for Svelte, not for eslint-plugin-svelte.

- Case: none upstream; rsvelte's own corpus units such as
  `<script lang="ts">namespace A.B { const a = 1; }</script>`, where upstream reports
  `node.body.body.map is not a function` at 1:1.
- Svelte 5.57.3 removes a namespace's types by mapping over `node.body.body`
  ([`remove_typescript_nodes.js`](https://github.com/sveltejs/svelte/blob/23bb146306ff02cc5041bca0c5de9f8bd086e4a3/packages/svelte/src/compiler/phases/1-parse/remove_typescript_nodes.js#L168-L178)).
  In `namespace A.B {}` the body of `A` is the declaration of `B`, which has no `body` array.
- Correct: walk into the inner declaration and refuse the namespace when it holds a value, as
  rsvelte does with `typescript_invalid_feature`. The corpus skips these units for `svelte.lint`
  as it does for `svelte.compile`.

## `svelte/valid-compile`: compiler bugs that `svelte.compile` already skips

Issues for Svelte or acorn-typescript, not for eslint-plugin-svelte. The `svelte/valid-compile` rule reports
what the compiler reports, so the corpus skips these units for `svelte.lint` with the reason
their `svelte.compile` skip gives.

- Svelte folds `String.fromCodePoint` as it analyzes and throws on an invalid code point
  ([`scope.js`][fold]).
- Svelte reads `An+B` with a pattern that misses `-2n-1`, `2N` and `-1` ([`style.js`][nth]).
- Svelte reads no namespace prefix in an attribute selector such as `[svg|a]`
  ([`style.js`][namespace]).
- Svelte refuses the empty declaration between two semicolons ([`style.js`][empty]).
- Svelte matches an empty `~=` or `^=` value, which selects nothing ([`css-prune.js`][prune]).
- The acorn-typescript parser reads an `await` in a namespace as one in a class static block.

[fold]: https://github.com/sveltejs/svelte/blob/23bb146306ff02cc5041bca0c5de9f8bd086e4a3/packages/svelte/src/compiler/phases/scope.js#L72
[nth]: https://github.com/sveltejs/svelte/blob/23bb146306ff02cc5041bca0c5de9f8bd086e4a3/packages/svelte/src/compiler/phases/1-parse/read/style.js#L13-L14
[namespace]: https://github.com/sveltejs/svelte/blob/23bb146306ff02cc5041bca0c5de9f8bd086e4a3/packages/svelte/src/compiler/phases/1-parse/read/style.js#L272-L274
[empty]: https://github.com/sveltejs/svelte/blob/23bb146306ff02cc5041bca0c5de9f8bd086e4a3/packages/svelte/src/compiler/phases/1-parse/read/style.js#L486-L488
[prune]: https://github.com/sveltejs/svelte/blob/23bb146306ff02cc5041bca0c5de9f8bd086e4a3/packages/svelte/src/compiler/phases/2-analyze/css/css-prune.js#L702-L706
