---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

Imports hoisted out of a component's instance script now keep the source-map segments of their original span, so a diagnostic on an import in a `.svelte` file is reported on the import's own line instead of line 1. The hoisted text used to be re-synthesized above `$$render()` with the original range blanked out, which left those generated lines with no mapping at all; they are now relocated the way official svelte2tsx's `moveNode` does it. As a side effect the hoisted text is byte-identical to the source, which also fixes multi-line imports losing their continuation-line indentation and leading-comment imports dropping a line.
