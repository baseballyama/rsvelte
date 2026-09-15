# `{#each <expr> as <ctx>}` — the expression's `loc.end` keeps the `as <ctx>` that was taken back off its `end`

In a TypeScript component, `{#each errors ?? [] as error}` is handed to acorn-typescript with the
whole template still visible, so `[] as error` parses as a `TSAsExpression`. `tag.js`'s `each`
branch unwraps it again:

```js
expression = walk(expression, null, {
  TSAsExpression(node, context) {
    if (node.end === expression.end) {
      assertion = node;
      end = node.expression.end;
      return node.expression;
    }
    context.next();
  }
});

expression.end = end;
```

`expression.end` is corrected, `expression.loc` is not — so the node's `loc.end.column` still
points at the end of the **context identifier**, past the `as`, while its `end` offset points at
the end of the expression. The two disagree inside one node.

## Measured

`svelte@5.57.0`, `submodules/svelte/packages/svelte/src/compiler/index.js` (the source tree, not
the npm package). `parse(src, { modern: true })`, reading the `EachBlock`'s `expression`, and
comparing `loc.end.column` to the column computed from that node's **own** `end` offset
(`end − start of its line`). No second implementation is involved: the check is internal to
official's own output.

| source (line 3, indented two spaces) | `end` | column from `end` | `loc.end.column` | |
|---|---|---|---|---|
| `{#each a ?? [] as x}` (`lang="ts"`) | 72 | 16 | **21** | ❌ |
| `{#each a ?? [] as x}` (no `lang`) | 51 | 16 | 16 | ✅ |
| `{#each (a ?? []) as x}` (`lang="ts"`) | 73 | 17 | 17 | ✅ |
| `{#each a as x}` (`lang="ts"`) | 66 | 10 | 10 | ✅ |
| `{#each f ? [1] : [2] as x}` (`lang="ts"`) | 69 | 22 | **27** | ❌ |
| `{#each o.items ?? [] as x (x)}` (`lang="ts"`) | 72 | 22 | **27** | ❌ |

The three ✅ rows are the discriminating ones and they fail the mechanism in three different ways:
without `lang="ts"` there is no TS assertion to swallow, parentheses end the expression before the
`as`, and a bare identifier has no operator for `as <ctx>` to bind into. Only a component in TS
mode whose each-expression ends in an operand that `as` can attach to is affected.

## Population

Whole rsvelte corpus, 34,087 components, official compiler as above:

```
carriers 108 files / 139 each-expressions
official loc.end.column disagrees with its own end offset: 139
rsvelte  loc.end.column disagrees with its own end offset: 0
  135  LogicalExpression
    4  ConditionalExpression
```

That is every one of the four `parse-ast` ratchet keys this report is attributed from
(`legacy::` / `modern::` x `LogicalExpression#span` / `ConditionalExpression#span`, 104 and 4
entries per axis): the counts match the sweep exactly, so no second mechanism is hiding under
them.

## Fix

Move `loc.end` with `end`, next to `expression.end = end`.
