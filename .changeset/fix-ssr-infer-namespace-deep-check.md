---
"@rsvelte/compiler": patch
---

fix(transform): deep infer_namespace for SSR reset-parent fragments

The server whitespace trimmer decides whether a fragment's inter-node
whitespace is removable from its inferred namespace (svg/mathml contexts drop
whitespace-only text; html keeps a single space). rsvelte inferred that
namespace with a shallow direct-child scan; upstream `infer_namespace`
deep-walks into `{#if}` / `{#each}` / `{#await}` / `{#key}` block bodies for
namespace-resetting parents (Root / Fragment / Component / SnippetBlock /
SlotElement). Porting `check_nodes_for_namespace` fixes two SSR whitespace
divergences: `<svg>…</svg> {#if}<p>…{/if}` (keep the space — html found inside
the block) and top-level `{#if}svg{/if} {#if}svg{/if}` (drop the space — all svg).
