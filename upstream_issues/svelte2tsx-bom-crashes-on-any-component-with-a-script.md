# `svelte2tsx` throws on any component that starts with a UTF-8 BOM

**Repository**: `sveltejs/language-tools` (`packages/svelte2tsx`)
**Measured**: 2026-09-01, `submodules/language-tools` at the pinned revision, driven through
`packages/svelte2tsx/index.js` with the options `scripts/compat-corpus/svelte2tsx-compile.mjs`
passes: `{ filename, isTsFile, mode: 'ts', namespace: 'html', version: '5' }`.

## Summary

A component whose source begins with a UTF-8 BOM (`U+FEFF`) and contains **both** a `<script>`
block and markup makes `svelte2tsx` throw from `magic-string`:

```
Cannot split a chunk that has already been edited (2:9 – ">…
```

Either half alone is fine. Removing the BOM from the same source is fine. The `<script>` may be
`lang="ts"` or plain JavaScript.

## Reduction

```js
const { svelte2tsx } = await import('packages/svelte2tsx/index.js');
const opts = { filename: 'a.svelte', isTsFile: true, mode: 'ts', namespace: 'html', version: '5' };
const BOM = '﻿';
```

| input | official `svelte2tsx` |
|---|---|
| `BOM + '<script lang="ts">\n\tlet a = 1;\n</script>\n\n<div>{a}</div>\n'` | **throws** `Cannot split a chunk that has already been edited (2:9 – ">…` |
| `BOM + '<script>\n\tlet a = 1;\n</script>\n\n<div>{a}</div>\n'` | **throws**, same message |
| the first input **without** the BOM | ok |
| `BOM + '<div>x</div>\n'` (no script) | ok |
| `BOM + '<script lang="ts">\n\tlet a = 1;\n</script>\n'` (no markup) | ok |

A larger real input reports a different magic-string message from the same cause
(`Cannot move a selection inside itself`), preceded by svelte2tsx's own
`Error leaving node {…}` dump — so the message alone does not identify the class.

## Real-world instances

`cnblocks/src/routes/(app)/veil/+page.svelte` and
`cnblocks/src/routes/(app)/veil/+layout.svelte` (both begin with a BOM) are the two
`error-mismatch` entries in `compatibility/svelte2tsx-known-failures.json`: official rejects them,
rsvelte's port converts them.

## Why this is filed rather than matched

rsvelte's `svelte2tsx` port produces TSX for these inputs. Reproducing the crash would mean
porting a `magic-string` bookkeeping fault, so the two entries stay listed and are attributed
here.
