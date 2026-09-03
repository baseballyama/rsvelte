# `svelte-language-server` resolves a rune's definition eight lines short, inside its JSDoc

Go-to-definition on a rune (`$state`, `$derived`, `$props`, …) from a `.svelte` file answers with
`svelte/types/index.d.ts` and a range that is **eight lines above the `declare function`**, landing
inside the declaration's JSDoc comment. The reported columns are the ones the declaration would
have, so on the comment line they point past its end and an editor highlights nothing.

## Reproduction

A project containing only `svelte` (5.56.10), a `tsconfig.json`, and one component:

```svelte
<script lang="ts">
  let count = $state(0);
</script>

{count}
```

`textDocument/definition` at line 1, character 16 — inside `$state`:

```
official: svelte/types/index.d.ts  LSP line 3234 (file line 3235)  chars 17..23
          text: " * ```ts"
rsvelte : svelte/types/index.d.ts  LSP line 3242 (file line 3243)  chars 17..23
          text: "declare function $state<T>(initial: T): T;"
```

File line 3243 is the declaration, and `$state` occupies exactly columns 17..23 of it. File line
3235 is a fenced-code line inside the JSDoc block above it and is nine characters long, so columns
17..23 name no text at all.

## It is systematic, not one symbol

Measured on 5 samples drawn from `shadcn-svelte` by the LSP differential gate, four of which land
in `svelte/types/index.d.ts`. Every one is short by exactly eight lines, at three different
targets:

| rune | official (LSP line) | rsvelte (LSP line) | what is at rsvelte's line |
|---|---|---|---|
| `$state` | 3234 | 3242 | `declare function $state<T>(initial: T): T;` |
| `$derived` | 3407 | 3415 | `declare function $derived<T>(expression: T): T;` |
| `$props` | 3582 | 3590 | `declare function $props(): any;` |

Only one copy of `svelte/types/index.d.ts` is resolvable in the tree that produced this
(`svelte@5.56.10`; the other copy is `svelte@4.2.20`, which declares no runes), and both servers
report that same file's URI — so this is not two servers reading two files.

## Why it matters here

The LSP differential gate labels this class `projection-target-position`, a name that presumes the
error is in rsvelte's projection mapping. On these samples the presumption is backwards: rsvelte
answers with the declaration and official does not.
