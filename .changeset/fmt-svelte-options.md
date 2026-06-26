---
"@rsvelte/fmt": minor
---

fmt: honor `prettier-plugin-svelte` / oxfmt markup options (#1057)

`rsvelte-fmt` previously read the project `.oxfmtrc` but only applied the scalar
JS options to embedded `<script>` blocks — markup-level and sort options were
silently ignored. The Svelte formatter now honors them so `.svelte` output stays
compatible with `oxfmt` + `prettier-plugin-svelte` under the same config:

- **`singleAttributePerLine`** — break every attribute onto its own line when an
  element has more than one.
- **`bracketSameLine`** — keep a wrapped open tag's `>` / `/>` on the last
  attribute's line (the replacement for the removed `svelteBracketNewLine`).
- **`sortImports`** — sort imports inside embedded `<script>` (accepts `true` or
  the full oxfmt object form).
- **`svelte.allowShorthand`** — set `false` to expand `name={name}` /
  `class:x={x}` / `style:x={x}` / `bind:x={x}` to the full form.
- **`svelte.indentScriptAndStyle`** — set `false` to keep `<script>` / `<style>`
  bodies flush instead of indented one level.
- **`svelte.sortOrder`** — print the top-level sections in any permutation of
  `options`/`scripts`/`markup`/`styles`, or `none` to keep source order.

`sortTailwindcss` remains unsupported (its ordering depends on the project's
Tailwind stylesheet); `rsvelte-fmt` now prints a warning when it is set instead
of silently dropping it.
