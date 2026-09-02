# `getLastLeadingDoc` indexes SourceFile-absolute positions into a node-relative slice

**Repository**: `sveltejs/language-tools` (`packages/svelte2tsx`)
**Measured**: 2026-09-02, `submodules/language-tools` at the pinned revision, driven through
`packages/svelte2tsx/index.js` with the options `scripts/compat-corpus/svelte2tsx-compile.mjs`
passes: `{ filename, isTsFile, mode: 'ts', namespace: 'html', version: '5' }`.

## Summary

`getLastLeadingDoc` (`src/svelte2tsx/utils/tsAst.ts:143-160`) removes every `@typedef` tag from a
declaration's leading JSDoc before the comment is copied onto the prop. It reads the tag's span
from `ts.getAllJSDocTagsOfKind`, whose `pos` / `end` are **SourceFile-absolute**, and slices them
out of `node.getFullText()`, which is **node-relative**:

```ts
const nodeText = node.getFullText();                      // source.slice(node.pos, node.end)
const comments = ts.getLeadingCommentRanges(nodeText, 0); // nodeText-relative
let commentText = nodeText.substring(comment.pos, comment.end);

const typedefTags = ts.getAllJSDocTagsOfKind(node, ts.SyntaxKind.JSDocTypedefTag);
typedefTags
    .filter((tag) => tag.pos >= comment.pos)              // absolute compared to relative
    .map((tag) => nodeText.substring(tag.pos, tag.end))   // absolute indexed into relative
    .forEach((comment) => {
        commentText = commentText.replace(comment, '');
    });
```

The slice is therefore offset by `node.pos`, which is zero only when the declaration is the
**first statement of the instance script**. The three outcomes:

| `node.pos` | shifted slice occurs in the comment? | result |
|---|---|---|
| 0 | — | the `@typedef` tag is removed, as intended |
| > 0 | no | `replace` no-ops and the tag survives into the emitted prop JSDoc |
| > 0 | yes | **the wrong text is deleted** and the emitted comment is corrupted |

## Reduction

Both inputs carry the identical comment; only the statement before it differs.

```svelte
<!-- A: the declaration is the first statement -->
<script>
  /**
   * The position of the popover content relative to the triggering handle.
   * @typedef {typeof import('./popover-positions').default} PopoverPositions
   * @type {PopoverPositions[keyof PopoverPositions]}
   */
  export let position = 1;
</script>
<p>{position}</p>
```

```svelte
<!-- B: one import precedes it -->
<script>
  import PopoverPositions from './popover-positions.js';

  /**
   * The position of the popover content relative to the triggering handle.
   * @typedef {typeof import('./popover-positions').default} PopoverPositions
   * @type {PopoverPositions[keyof PopoverPositions]}
   */
  export let position = PopoverPositions.TOP;
</script>
<p>{position}</p>
```

`props:` in the emitted TSX:

```
A  /**
    * The position of the popover content relative to the triggering handle.
    * 
    * @type {PopoverPositions[keyof PopoverPositions]}
    */position: position

B  /**
    * The position of the popover content relative to the triggering handle.
    * @typedef {typeof import('./popover-positions').default} P */position: position
```

B's comment is truncated in the middle of the typedef's name and loses the `@type` tag that
followed it — the removed slice was
`"opoverPositions\n   * @type {PopoverPositions[keyof PopoverPositions]}\n   "`, which is what
`nodeText.substring(tag.pos, tag.end)` yields once it is shifted by `node.pos`.

Driving `ts` directly on B's script shows the same slice:

```
STMT pos 56  comment.pos 4
  TAG abs pos 145 end 217
  nodeText.substring(pos, end) = "PopoverPositions\n   * @type {PopoverPositions[keyof PopoverPositions]}\n "
```

## Real-world instances

`attractions/attractions/popover/popover.svelte` and
`attractions/attractions/snackbar/snackbar-container.svelte` land in the second row (the tag
survives). `carbon-components-svelte/src/TreeView/TreeViewNode.svelte` lands in the first (the
tag is removed) because its documented export is the script's first statement.

## Fix

`tag.pos` / `tag.end` are absolute, so subtract the node's own start:

```ts
.map((tag) => nodeText.substring(tag.pos - node.pos, tag.end - node.pos))
```

## What rsvelte does

rsvelte reproduces rows 1 and 2 — it strips `@typedef` tags exactly when the comment is the
script's first token, and leaves them otherwise. Row 3 (upstream corrupting the comment) is not
reproduced.
