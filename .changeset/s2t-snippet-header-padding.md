---
"@rsvelte/svelte2tsx": patch
---

Count the padding in front of a standalone `{#snippet}`'s `const` from the gaps between the source ranges upstream's `transform()` keeps, instead of measuring the region after the last one. A header with anything between the name and the first parameter — a space, a tab, a type parameter list, or a formatted multi-line parameter list — was one space short, and svelte2tsx is one MagicString, so the shortfall shifted every mapping after it.
