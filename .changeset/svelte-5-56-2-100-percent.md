---
"@rsvelte/compiler": patch
---

Upgrade the Svelte compatibility target to **5.56.2** and keep **100% in-scope
test compatibility (3525/3525, 0 failures)**.

The 5.56.2 bump carried a single compiler change — upstream #18366 (ignore
`DeclarationTag` nodes in the keyed-`{#each}` `animate:` directive single-child
validation) — ported in `2_analyze/visitors/each_block.rs`.

The concurrent `language-tools` submodule bump added six svelte2tsx fixtures,
three of which exposed pre-existing port gaps that are now fixed:

- `$props()` typedef insertion now counts the real declaration-keyword length
  (`const` = 5) instead of assuming `let` = 3, so `const { x } = $props()` no
  longer loses two characters of the keyword.
- Hoisted interfaces are emitted in topological-promotion order (a base
  interface before the one that extends it), mirroring upstream
  `HoistableInterfaces`.
- Non-leading `{#snippet}` blocks inside `{#each}` are hoisted above sibling
  `{const}` / `{let}` declaration tags (port of upstream `hoistSnippetBlock`).
