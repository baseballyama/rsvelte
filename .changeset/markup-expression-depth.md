---
"@rsvelte/fmt": patch
---

Wrap markup expressions by the column they render at, matching `prettier-plugin-svelte` (which `oxfmt` delegates `.svelte` to).

Every JS expression was formatted at indent 0 and then spliced into the markup, so wrap decisions used the full print width regardless of nesting: a line that fit at column 0 silently overflowed once nested, and continuation lines stuck at column 0 instead of aligning to the nesting depth.

- `<script>` bodies are narrowed by one indent level before formatting (the body is nested one level under `<script>`).
- Content expressions (`{expr}`, `{@html}`, `{@render}`, `{@attach}`) thread the markup nesting depth through the walk, narrow the width by `depth × indentWidth`, and re-indent continuation lines to that depth.
- Block-header expressions (`{#if}`, `{#each}`, `{:else if}`, `{#key}`, `{#await}`, snippet name) are forced onto a single line — `prettier-plugin-svelte` never breaks a block tag's expression regardless of width.

On a 1,115-file Svelte corpus this brings `oxfmt`-divergent files from 180 to ~111, with zero idempotency breaks and zero `svelte` parse breaks. The remaining diffs are attribute-value wrapping, close-tag placement, and snippet-parameter expansion, tracked for follow-up.
