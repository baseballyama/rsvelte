# `{#each … as <pattern>}` — every `loc.column` in the destructuring pattern is one too large

`read_pattern` (`packages/svelte/src/compiler/phases/1-parse/read/context.js:41-53`) pads the
source before the pattern, prepends a `(`, and removes one space from the padding to compensate.
Its own comment states the intent:

```js
// the length of the `space_with_newline` has to be start - 1
// because we added a `(` in front of the pattern_string,
// which shifted the entire string to right by 1
// so we offset it by removing 1 character in the `space_with_newline`
// to achieve that, we remove the 1st space encountered,
// so it will not affect the `column` of the node
```

The removal restores the **length** and not the **line structure**. `space_with_newline` is the
prefix with every non-newline character replaced by a space, so `indexOf(' ')` is index `0`
whenever the file does not begin with a newline — the space is deleted from **line 1**, while the
`(` is inserted on the **pattern's own line**. Acorn therefore reports every column in the pattern
one to the right of where it is, for every pattern that is not on the line the deleted space came
from.

## Measured

`svelte@5.56.10`, from `packages/svelte/src/compiler/index.js`. `parse(src, { modern: true })`,
reading `ObjectPattern.loc.start.column` and comparing against the column computed directly from
the source offset (`offset − start of its line`).

| source | pattern offset | true column | `loc.start.column` |
|---|---|---|---|
| `{#each a as { b }}x{/each}` | 12 | 12 | **12** ✅ |
| `p\n{#each a as { b }}x{/each}` | 14 | 12 | **13** ❌ +1 |
| `\n{#each a as { b }}x{/each}` | 13 | 12 | **12** ✅ |
| `\np\n{#each a as { b }}x{/each}` | 15 | 12 | **13** ❌ +1 |
| `<div>{#each a as { b }}x{/each}</div>` | 17 | 17 | **17** ✅ |
| `<div>\n\t{#each a as { b }}x{/each}\n</div>` | 19 | 13 | **14** ❌ +1 |

Rows 3 and 4 are the discriminating pair. A leading newline moves the padding's first space from
line 1 to line 2, and the correct answer moves with it — the pattern on line 2 is right and the one
on line 3 is wrong. That is the mechanism above and not a general "patterns after line 1" rule.

The whole pattern subtree is affected, not just its root. On a real component
(`{#each toastList as { type, message, id }}` at line 28, column 21 of a file whose line 28 begins
with a tab), `parse()` returns column 22 for the `ObjectPattern` and for all three `Property`
nodes and all six `Identifier` nodes inside it; `start`/`end` are correct throughout, so only
`loc` diverges.

## Not affected

- The collection expression. In the same each block, `toastList` reports its true column.
- A non-destructuring context: `{#each a as b}` gives `b` its true column.
- `start` and `end`, on every node — the byte offsets are right and only `loc` is wrong, which is
  why nothing that consumes offsets sees this.

## Why it matters

`loc` is what a source map, an editor position and a diagnostic frame are built from, so a
consumer that trusts `loc` over `start`/`end` points one column to the right of the identifier it
means, for every destructured each binding below the first line of a file.

## Suggested direction

The compensation needs to remove a character from the **pattern's own line** rather than from the
first line of the padding — i.e. locate the last line break at or before `start` and delete one
space after it, falling back to the current behaviour only when the pattern really is on the
padding's first line. `parse_expression_at` is already given `start - 1`, so only the padding's
line structure has to change.
