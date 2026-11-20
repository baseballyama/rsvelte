# Upstream issues

These are the behaviors of eslint-plugin-svelte 3.23.1 rules that this crate does not reproduce.
Each entry is a candidate issue for eslint-plugin-svelte and names the test that holds this crate's
behavior. ESLint with svelte-eslint-parser gave the upstream output (`oracle lint-cases`), and
`svelte/compiler`'s `parse` gave the decoded values. Issue
[rsvelte#4939](https://github.com/baseballyama/rsvelte/issues/4939) tracks the defects of
svelte-eslint-parser, the Svelte compiler and other projects.

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

## Quirks of the inline style reader

Not filed.

A differential fuzz finds these in the inline style reader of `eslint-plugin-svelte` 3.23.1. It
compares this crate's port with `postcss` 8.5.32, `postcss-scss` 4.0.9 and that reader on 173,841
inputs: corpus style bodies, their mutations and random strings. The fuzz harness is not in the
repository, and no lint case covers these quirks.

- In an inline style, `convertChild` places a declaration's value from the property's end. A hack
  prefix (`*a: b`) moves that end one character left. This crate places the value at its own
  position.
  The property itself starts at the prefix but is as long as the name without it, so
  `svelte/no-dupe-style-properties` and `svelte/no-shorthand-style-property-overrides` report
  `_colo` for `_color`. The corpus skips their 2 lint units.
- An at-rule in an inline style, such as `style="@media x"`, has no end, and `convertChild`
  throws. This crate does not convert that style.

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
Tests in `crates/hosts/command_line/tests/cli/svelte_kit.rs`: `asset_through_the_namespace_is_resolved`,
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

## An each block's context with a type annotation (`svelte/require-each-key`)

No issue yet. The rule ends its range at the token after the index, or after the context when
there is no index
([require-each-key.ts](https://github.com/sveltejs/eslint-plugin-svelte/blob/24201e06a1a8e270c1143d1fb460e6ae635719d8/packages/eslint-plugin-svelte/src/rules/require-each-key.ts#L21)).

- Case: `{#each xs as x: string}`. The context ends at `x`, so the next token is the `:` of
  the annotation, and upstream reports `{#each xs as x:`.
- Correct: the range ends at the `}` of the opening tag. This crate reports it so.
- The corpus skips its 2 lint units.

## The last of several codes is dropped without a separator after it (`svelte/no-unused-svelte-ignore`)

No issue yet. `extractSvelteIgnore` takes each code up to the separator after it, and keeps the
text after the last separator only when it found no code before
([ignore-comment.ts](https://github.com/sveltejs/eslint-plugin-svelte/blob/24201e06a1a8e270c1143d1fb460e6ae635719d8/packages/eslint-plugin-svelte/src/shared/svelte-compile-warns/ignore-comment.ts#L103-L126)).

- Case: `<!--svelte-ignore a11y_missing_attribute a11y_distracting_elements-->` before an
  `<img>` without `alt`. Upstream never checks `a11y_distracting_elements`, and reports nothing.
  With a space before `-->`, it reports the code as unused.
- Case: `// svelte-ignore state_referenced_locally TODO`, where the last word is a note, and
  `// svelte-ignore await_reactivity_loss, state_referenced_locally`.
- Correct: Svelte reads every code of the list. This crate checks the last one too.
- The corpus skips their 5 lint units.

## Rules that throw (`svelte/indent`, `svelte/consistent-selector-style`)

- `svelte/indent` throws `Cannot read properties of null (reading 'range')` on 18 components of
  `svelte-material-ui` and one of `threlte`.
- `svelte/consistent-selector-style` throws `Unexpected '!'` on an HTML comment in `<style>`
  (Svelte's `css/samples/comment-html`).
- Issues: the `svelte/indent` crash comes from a mapped type in a `$props()` annotation, and [eslint-plugin-svelte #970](https://github.com/sveltejs/eslint-plugin-svelte/issues/970) fixes it on `main`, not yet released. [eslint-plugin-svelte #1699](https://github.com/sveltejs/eslint-plugin-svelte/issues/1699) is the `consistent-selector-style` crash.
- `svelte/consistent-selector-style` also throws on any selector `postcss-selector-parser`
  rejects (7 units). Examples are `*|`, a bare `:` and `[  ]`. So is `[x^]`, an attribute
  operator with no value.
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
spaces.` and the like. With a rune or a store, the deprecated alias `TSMappedType.typeParameter`
keeps a range of the parser's virtual code
([rsvelte#4939](https://github.com/baseballyama/rsvelte/issues/4939)).
[`TSMappedType`](https://github.com/sveltejs/eslint-plugin-svelte/blob/a18a0e43f1d31a01f102208e75249ce5d401e983/packages/eslint-plugin-svelte/src/rules/indent-helpers/ts.ts#L269-L274)
lays out that range as an element, so it sets offsets on whatever tokens sit there. When the
range holds no token, the rule throws (the section above). PR
[#970](https://github.com/sveltejs/eslint-plugin-svelte/pull/970), merged on `main` and not yet
released, reads `key` and `constraint` instead. The corpus skips these lint units.
