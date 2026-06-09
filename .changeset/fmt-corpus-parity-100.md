---
"@rsvelte/fmt": patch
---

fix(fmt): reach byte-for-byte parity with the `oxfmt(svelte: true)` oracle across the entire svelte.dev corpus (1103/1103). Markup-layout fixes: fill fragment-level inline prose runs (pure text and one-line inline elements) that overflow; hug a block's single inline-element body (`{#each …}<span>…</span>{/each}`); wrap an overflowing content mustache inside `<pre>`/`<textarea>`; member-chain-break a hugged element's overflowing trailing mustache; glue a hugged inline child to a wrapped open tag's last attribute; format `<pre>`/`<textarea>` block content (space-indented bodies + embedded JS, element-direct whitespace kept as tabs) and hug pure-text components. Correctness fixes: preserve raw entities in attribute values (no longer decode `&quot;` → `"`, which corrupted the markup); make the collapse re-parse best-effort instead of fatal; fall back to the TypeScript parser for a `<script>` without `lang="ts"` that uses TS-only syntax.
