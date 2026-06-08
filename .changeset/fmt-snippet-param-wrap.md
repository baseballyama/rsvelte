---
"@rsvelte/fmt": patch
---

fix(fmt): break a long `{#snippet}` parameter list across lines like a function signature. `{#snippet name(params)}` parameters were spliced one-at-a-time and each forced onto a single line (`Expand::Never` + max width), so a long destructured/typed parameter list never wrapped — unlike prettier-plugin-svelte, which prints the snippet header as a function signature and breaks it by print width. The whole header `name<…>(params)` is now formatted as one `function name<…>(params) {}` unit with normal width-driven breaking (narrowed by the markup depth and the `{#snippet ` prefix), then reindented to the snippet's depth. The other block headers (`{#each}` / `{#await}` / `{#if}` / `{#key}`) still stay single-line — only `{#snippet}`, whose `{/snippet}` delimiter makes a multi-line header safe, breaks. Closes #797.
