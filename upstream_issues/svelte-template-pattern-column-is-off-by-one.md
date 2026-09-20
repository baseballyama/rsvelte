# Every `loc.column` in a template destructuring pattern is one too large

`read_pattern` (`packages/svelte/src/compiler/phases/1-parse/read/context.js:36-54`) pads the
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

Stated exactly, for a position `p` inside the pattern:

```
reported column(p) = true column(p)
                   + (line(p) == line(pattern.start) ? 1 : 0)      // the inserted `(`
                   - (line(p) == line(first non-newline byte) ? 1 : 0)   // the deleted space
```

Both terms are needed: on a pattern that spans several lines the `(` moves only the first line, so
a nested node on a later line of the same pattern is reported correctly while its parent is not.

## It is every pattern reader, not just `{#each}`

`read_pattern` has nine call sites, all in `phases/1-parse/state/tag.js`, and every one of them
carries the defect:

| construct | call site |
|---|---|
| `{#each … as <pattern>}` | `:269`, `:304` (the `{#each foo. as x}` re-read) |
| `{#await … then <pattern>}` | `:362`, `:390` (the `{#await foo. then x}` re-read) |
| `{#await … catch <pattern>}` | `:373`, `:402` |
| `{:then <pattern>}` | `:603` |
| `{:catch <pattern>}` | `:622` |
| `{@const <pattern> = …}` | `:778` |

## Measured

Oracle: the source tree at `submodules/svelte` = `7bc0a70fe`, `VERSION` `5.57.0`, imported as
`packages/svelte/src/compiler/index.js`. `parse(src, { modern: true })`, `ObjectPattern` /
`ArrayPattern` `loc` compared against the column computed directly from the source offset
(`offset − start of its line`), so neither implementation is the reference.

One family per row, the same `{ a }` pattern in each, on line 1 and on line 2:

| cell | true | official | rsvelte |
|---|---|---|---|
| `{#each l as { a }}` on line 1 | 1:12 | 1:12 ✅ | 1:12 ✅ |
| `{#each l as { a }}` on line 2 | 2:12 | **2:13** ❌ | 2:12 ✅ |
| `{#await p then { a }}` on line 1 | 1:15 | 1:15 ✅ | 1:15 ✅ |
| `{#await p then { a }}` on line 2 | 2:15 | **2:16** ❌ | 2:15 ✅ |
| `{#await p catch { a }}` on line 1 | 1:16 | 1:16 ✅ | 1:16 ✅ |
| `{#await p catch { a }}` on line 2 | 2:16 | **2:17** ❌ | 2:16 ✅ |
| `{:then { a }}` on line 1 | 1:17 | 1:17 ✅ | 1:17 ✅ |
| `{:then { a }}` on line 2 | 2:7 | **2:8** ❌ | 2:7 ✅ |
| `{:catch { a }}` on line 1 | 1:18 | 1:18 ✅ | 1:18 ✅ |
| `{:catch { a }}` on line 2 | 2:8 | **2:9** ❌ | 2:8 ✅ |
| `{@const { a } = o}` on line 1 | 1:15 | 1:15 ✅ | 1:15 ✅ |
| `{@const { a } = o}` on line 2 | 2:8 | **2:9** ❌ | 2:8 ✅ |
| `\n{#each l as { a }}` (leading newline) | 2:12 | 2:12 ✅ | **2:13** ❌ |

The last row is the discriminating cell, and it runs the **other way**. A leading newline moves the
padding's first space off line 1, the correct answer moves with it, and official is then right —
so this is the mechanism above and not a general "patterns after line 1" rule. It is also the one
cell rsvelte gets wrong; that is an rsvelte defect, tracked separately.

### Over the real-world corpus

33,988 components, the same two arms. 946 files carry a destructuring pattern at one of the nine
reader sites; those patterns contain **6,261** nodes.

| | |
|---|---|
| nodes where the formula above predicts official's `loc` exactly | **6,261 / 6,261** |
| of those, nodes where the two compilers disagree | 4,783 |
| diverging nodes where rsvelte reports the source-derived column | 4,783 / 4,783 |
| agreeing nodes that agree because rsvelte reproduces the same shift | 1,303 |

The formula is scored on every node in every pattern, agreeing ones included, so it is not a
restatement of the divergences it was derived from.

## Not affected

- **A bare identifier.** `read_pattern` returns the identifier before it wraps anything, so
  `{#each a as b}` and `{@const c = …}` are correct. 11,431 of the corpus's pattern sites are this
  shape.
- **The collection expression.** In the same each block, `toastList` reports its true column.
- **`start` and `end`, on every node** — the byte offsets are right and only `loc` is wrong, which
  is why nothing that consumes offsets sees this.

## Why it matters

`loc` is what a source map, an editor position and a diagnostic frame are built from, so a
consumer that trusts `loc` over `start`/`end` points one column to the right of the identifier it
means, for every destructured template binding below the first line of a file.

## Suggested direction

The compensation needs to remove a character from the **pattern's own line** rather than from the
first line of the padding — i.e. locate the last line break at or before `start` and delete one
space after it, falling back to the current behaviour only when the pattern really is on the
padding's first line. `parse_expression_at` is already given `start - 1`, so only the padding's
line structure has to change.
