# Formatter Oracle Bugs and Exclusions

This document records every entry in
`compat/corpus/fmt-oracle-excluded.json` — the ids permanently excluded from
the formatter-parity gate because either (a) the `oxfmt(svelte:true)` oracle
output is itself wrong/corrupt (**oracle-bug**), (b) the input is invalid and
rsvelte correctly rejects it (**invalid-input**), or (c) the fixture is from
the out-of-scope Svelte 4→5 migrator (**migrate**).

These are suitable upstream bug reports to `oxformatter/oxfmt` or
`prettier/prettier-plugin-svelte` as indicated.

---

## Oracle Bugs (11 ids)

For each case: the oracle emits output that is semantically wrong or
syntactically corrupt. rsvelte-fmt's output is correct. Matching the oracle
would require rsvelte to produce broken output.

### 1. Nested-rest destructuring silently dropped → `...undefined`

**Ids:**

- `svelte/packages/svelte/tests/runtime-legacy/samples/each-block-destructured-array-nested-rest/main.svelte`
- `svelte/packages/svelte/tests/runtime-legacy/samples/await-then-destruct-array-nested-rest/main.svelte`
- `svelte/packages/svelte/tests/validator/samples/rest-eachblock-binding-nested-rest/input.svelte`

**Input (minimal):**

```svelte
{#each array as [first, second, ...[third, ...{ length }]]}
  {first} {second} {third} {length}
{/each}
```

**Oracle (buggy) output:**

```svelte
{#each array as [first, second, ...undefined]}
  {first} {second} {third} {length}
{/each}
```

**rsvelte-fmt (correct) output:**

```svelte
{#each array as [first, second, ...[third, ...{ length }]]}
  {first} {second} {third} {length}
{/each}
```

**What prettier-plugin-svelte does wrong:** The plugin's internal AST printer
fails to walk deeply-nested rest patterns in destructuring bindings. When the
rest element itself is a nested destructuring pattern (`...[z, ...{n}]`), the
printer substitutes `undefined` for the whole inner pattern, silently erasing
variable names `z`/`n`/`length` from the binding list. This is a source
corruption bug — the runtime breaks because bound names disappear.

**File to investigate:** `prettier-plugin-svelte`'s expression printer for
`RestElement` nodes inside `ArrayPattern`.

---

### 2. `{@const x = (h = 0)}` — closing paren dropped

**Id:** `svelte/packages/svelte/tests/runtime-legacy/samples/block-expression-assign/main.svelte`

**Input (minimal):**

```svelte
{@const x = (h = 0)}
```

**Oracle (buggy) output:**

```svelte
{@const x = (h = 0}
```

**rsvelte-fmt (correct) output:**

```svelte
{@const x = (h = 0)}
```

**What oxfmt does wrong:** When formatting a `{@const}` tag whose initializer is
a parenthesised assignment expression `(h = 0)`, oxfmt emits the inner
expression without the closing `)`, producing `{@const x = (h = 0}` which is
invalid Svelte syntax. This is a source corruption bug.

**File to investigate:** oxfmt's `ConstTag` / `ExpressionStatement` printer —
the closing paren of a `ParenthesizedExpression` inside a `ConstTag` is dropped.

---

### 3. `<textarea>` whitespace collapse

**Ids:**

- `svelte/packages/svelte/tests/runtime-legacy/samples/textarea-content/main.svelte`
- `svelte/packages/svelte/tests/validator/samples/textarea-value-children/input.svelte`
- `svelte/packages/svelte/tests/parser-legacy/samples/textarea-end-tag/input.svelte` (adversarial: multi-line `<textarea>` body with split/garbage close-tags; oxfmt collapses the whitespace-significant body onto one line, rsvelte preserves it)

**Input (minimal):**

```svelte
<textarea id="textarea">
  A
  B
</textarea>
```

**Oracle (buggy) output:**

```svelte
<textarea id="textarea"> A B </textarea>
```

**rsvelte-fmt (correct) output:**

```svelte
<textarea id="textarea">
  A
  B
</textarea>
```

**What oxfmt does wrong:** `<textarea>` content is whitespace-significant in
HTML; a formatter must preserve the interior text verbatim (modulo leading
indentation, which is itself debated). oxfmt collapses multi-line textarea
content to a single space-separated line, altering the text the user sees at
runtime. The rules are also inconsistent — some textarea inputs with a leading
newline are treated differently from others — making the behaviour impossible to
reproduce correctly without introducing the same bug.

**File to investigate:** `prettier-plugin-svelte` / oxfmt's `Element` printer
for `textarea` — it should not reflow the child text nodes.

---

### 4. CSS tab/space indentation mixing

**Ids:**

- `svelte/packages/svelte/tests/css/samples/comment-html/input.svelte`
- `svelte/packages/svelte/tests/css/samples/comments-after-last-selector/input.svelte`
- `svelte/packages/svelte/tests/parser-modern/samples/css-pseudo-classes/input.svelte`

**Input example (`comments-after-last-selector`):**

```css
.foo,  /* some comment */
.bar /* some other comment */ {
  color: red;
}
```

**Oracle (buggy) output:**

```css
.foo,  /* some comment */
	.bar /* some other comment */ {
  color: red;
}
```

Note: the `.bar` selector line is indented with a **tab** (`\t`) while `.foo`
and the rule body use **spaces**. This mixes tab and space indentation within a
single selector list.

**In `css-pseudo-classes`:** The `:is()` pseudo-class body inner selectors are
indented with `\t\t` (two tabs) while the containing rule uses 2-space indent,
producing mixed whitespace.

**What oxfmt does wrong:** When reformatting CSS selector lists that contain
inline comments, oxfmt preserves the original raw tab characters from the input
instead of normalising to the project's indent style (2 spaces). The result
mixes tabs and spaces within the same block, which violates CSS formatting
conventions and makes the output non-idempotent (running the formatter again
would change the output).

**File to investigate:** oxfmt's CSS `SelectorList` / `Selector` printer — it
should not pass raw whitespace from the input through to indented continuation
lines.

---

### 5. Malformed `<script>`/`<style>` close tag loses body content

**Ids:**

- `svelte/packages/svelte/tests/parser-legacy/samples/whitespace-after-script-tag/input.svelte`
- `svelte/packages/svelte/tests/parser-legacy/samples/whitespace-after-style-tag/input.svelte`

**Input (`whitespace-after-script-tag`):**

```svelte
<script>
  let name = "world";
</script




>

<h1>Hello {name}!</h1>
```

(The `</script` close tag has whitespace and newlines before the `>`.)

**Oracle (buggy) output:**

```svelte
<script></script>

<h1>Hello {name}!</h1>
```

**rsvelte-fmt output:** rsvelte preserves the body (it cannot fully close the
tag either due to the unusual syntax, so it keeps the literal source).

**What prettier-plugin-svelte does wrong:** When the `</script>` or `</style>`
close tag has whitespace between `</script` and `>`, prettier-plugin-svelte's
lenient parser treats the tag as empty and discards the entire block body. This
silently destroys the script/style content — a severe source corruption.

**File to investigate:** `prettier-plugin-svelte`'s `<script>` / `<style>` tag
reader — it should not treat a whitespace-containing close tag as an empty
block.

---

## Invalid Input (1 id)

### 6. Snippet optional param with initializer

**Id:** `svelte/packages/svelte/tests/runtime-runes/samples/snippet-typescript/main.svelte`

**Input (offending construct):**

```svelte
{#snippet counter5(c?: number = 5)}
  {c}
{/snippet}
```

**What is invalid:** TypeScript error TS1015: "A parameter property cannot have
an initializer." — `c?: number = 5` has both a `?` (optional marker) and `= 5`
(default initializer), which is illegal TypeScript. oxc (the rsvelte-fmt script
parser) correctly rejects this with a parse error.

**Oracle behaviour:** prettier-plugin-svelte's lenient parser accepts this
construct and reformats the file. That is incorrect behaviour for a
compiler-grade tool; rsvelte-fmt correctly rejects invalid input.

**Note:** This is an intentionally invalid fixture (it lives in
`compiler-errors/` adjacent tests). Excluding it from the parity gate is
correct — we must not special-case invalid-TS acceptance into rsvelte-fmt.

---

## Migrate Fixtures (4 ids)

Svelte 4→5 migrator output is intentionally out of scope per `AGENTS.md`. These
fixtures contain Svelte 4 syntax (legacy `let:` directives, SCSS `$`-variables
in `lang="scss"` stylesheets, `slot=` attributes) that rsvelte's Svelte 5
compiler correctly rejects or formats differently.

| Id                                                        | Reason                                                                            |
| --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `tests/migrate/samples/css-ignore/input.svelte`           | `lang="scss"` with `$font-stack` variable — `css_expected_identifier` parse error |
| `tests/migrate/samples/css-ignore/output.svelte`          | Same — SCSS output of the migrator                                                |
| `tests/migrate/samples/slot-non-identifier/output.svelte` | Svelte 4 `let:` directives + `slot=` attributes                                   |
| `tests/migrate/samples/slot-usages/output.svelte`         | Svelte 4 slot migration output                                                    |

---

## OXC-vs-prettier JS engine divergences (upstream oxc-alignment opportunities)

These are **not** oracle bugs and **not** rsvelte logic bugs: they are cases
where the embedded-JS formatter rsvelte uses (the `oxc_formatter` crate, by
architectural design — for the 100x-perf and oxc-integration goals) makes a
different but equally-valid line-break choice than the oracle's prettier-based
JS printer. Reproducing them in rsvelte would require either abandoning oxc or
post-processing oxc's output with fragile prettier-mimicking string surgery
(explicitly avoided). The right long-term fix is to align `oxc_formatter`'s
break heuristics with prettier upstream; until then these are excluded with
`"class": "engine-divergence"`.

| Id | Divergence |
|---|---|
| `flowbite-svelte/.../timeline/TimelineColor.svelte` | In a long `class="…{cond ? a : b}"`, the oracle breaks the ternary **condition** at `===` (`status ===\n 'completed'`); oxc either keeps `===` together or breaks every nested condition. Ternary-break granularity differs. |
| `flowbite-svelte/.../blocks/utils/GitHubSourceList.svelte` | An IIFE `((rootDir) => …)(arg)`: the oracle breaks the arrow **parameter list** (`((\n rootDir,\n) => …)`), oxc breaks the IIFE **call argument**. |
| `flowbite-svelte/.../builder/range/+page.svelte` | Template-literal `${}` substitution indentation inside `<script>`: the oracle indents a ternary inside `${ … }` two levels deeper than oxc. |

Filing target: `oxc_formatter` (the break-point heuristics for conditional
expressions, IIFE/arrow parameter lists, and template-literal substitutions).

---

## Exclusion mechanism

The exclusion list is loaded by `scripts/compat-corpus/fmt-verify.mjs` from
`compat/corpus/fmt-oracle-excluded.json`. Excluded ids are removed from the
comparison set entirely — they count as neither matched nor failed. The script
prints:

- A **warning** if an excluded id is no longer in the current run's parity set
  (the file may have been removed from the corpus — the exclusion entry can be
  deleted).
- A **notice** if an excluded id now matches the oracle byte-for-byte (it can
  be un-excluded, which would mean either the oracle bug was fixed upstream, or
  rsvelte-fmt was changed to match the broken oracle — the latter should be
  avoided).

To add a new exclusion, append an entry to `fmt-oracle-excluded.json` with
`"id"`, `"class"` (`"oracle-bug"` | `"invalid-input"` | `"migrate"` |
`"engine-divergence"`), and `"reason"` fields.
