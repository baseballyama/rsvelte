---
'@rsvelte/fmt': patch
'@rsvelte/language-server': patch
---

Format an inline element that wraps its attributes inside `{#if}` / `{#each}` / `{#key}` after a mustache or inline element (`<div>{value}{#if unit}<sup class="…">{unit}</sup>{/if}</div>`) the same way on every run, instead of alternating between two placements of its open `>` (#4725).
