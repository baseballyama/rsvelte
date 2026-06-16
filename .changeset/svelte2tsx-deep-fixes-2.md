---
"@rsvelte/svelte2tsx": patch
---

svelte2tsx output-parity (corpus burndown, follow-up): further port divergences fixed so rsvelte's svelte2tsx matches the official tool:

- `render_tag_invalid_call_expression` (snippet via `.apply`/`.bind`/`.call`) is deferred to the analysis phase like official Svelte, instead of being rejected at parse time — svelte2tsx (parse-only) no longer errors on templates official tolerates.
- `<script>` content is parsed as TypeScript regardless of `lang="ts"` (matching official svelte2tsx on acorn-typescript), so TS-only script syntax such as `let x: typeof C<any>` no longer fails the parse; template expressions stay lang-respecting.
- Trailing TypeScript postfixes on `{#each}` collection expressions (`{#each x! as i}`, `{#each [...] as const as i}`) are preserved instead of being dropped.
