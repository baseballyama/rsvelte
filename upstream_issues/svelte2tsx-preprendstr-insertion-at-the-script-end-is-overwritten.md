# An insertion at the script's last byte is overwritten by the `</script>` removal

**Repository**: `sveltejs/language-tools` (`packages/svelte2tsx`)
**Measured**: 2026-09-02, `submodules/language-tools` at the pinned revision, driven through
`packages/svelte2tsx/index.js` with the options `scripts/compat-corpus/svelte2tsx-compile.mjs`
passes: `{ filename, isTsFile, mode: 'ts', namespace: 'html', version: '5' }`.

## Summary

`preprendStr` (`src/utils/magic-string.ts:7-17`) does not append — it **overwrites** the single
character at the insertion point with `toAppend + that character`:

```ts
str.overwrite(index, index + 1, toAppend + str.original.charAt(index), { contentOnly: true });
```

`propTypeAssertToUserDefined` (`nodes/ExportedNames.ts:420-487`) uses it to add
`;x = __sveltets_2_any(x);` at `declaration.end`, which widens a prop's type so TS does not
narrow it to its initializer or report it as possibly undefined. When the declaration is the last
thing in the script, `declaration.end` is the index of the `<` in `</script>` — and the script-tag
removal overwrites that chunk afterwards, discarding the insertion. No error is raised; the
widener is simply absent.

One trailing byte of any kind moves the insertion point off that character and it survives.

## Reduction

```svelte
<!-- A: the declaration is the script's last byte -->
<script lang="ts">export let answer: number</script>
```

```svelte
<!-- B: one space before the closing tag -->
<script lang="ts">export let answer: number </script>
```

```
A   let answer: number;
B   let answer: number /*Ωignore_startΩ*/;answer = __sveltets_2_any(answer);/*Ωignore_endΩ*/;
```

A is `sveltekit/packages/package/test/watch/expected/Test.svelte` verbatim.

## The axis

An `x` marks the widener present in the output.

| source | widener |
|---|---|
| `export let answer: number</script>` | — |
| `export let answer: number </script>` | x |
| `export let answer: number\t</script>` | x |
| `export let answer: number/*c*/</script>` | x |
| `export let answer: number;</script>` | x |
| `export let answer: number\n</script>` | x |
| `export let a: number;export let answer: number</script>` | on `a` only |
| `export let a: number, answer: number</script>` | on `a` only |

Markup after `</script>` does not change the answer — the position that matters is the end of the
**script content**, not of the file.

The same insertion carries the SvelteKit `import('./$types.js')` annotation when
`nameEnd === end` (`:465-472`), so `export let data` in a `+page.svelte` that ends at `</script>`
loses its `PageData` type as well as the widener. `export const snapshot`, whose annotation goes
on the name rather than on the declaration end, is unaffected.

## Fix

Insert rather than overwrite at a position the script-tag transformation also owns — or clamp the
insertion to `min(declaration.end, scriptContentEnd - 1)`. The cheapest correct change is for
`preprendStr` to use `appendLeft`, which attaches to the chunk **before** the position and so
survives a later overwrite of the chunk after it; that is what rsvelte's port does.

## What rsvelte does

Byte equality is the goal, so rsvelte suppresses the insertion when it would land on the script's
last byte, pinned by
`crates/rsvelte_projection/tests/svelte2tsx_script_end_insertion.rs`.
