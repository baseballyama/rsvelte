---
"@rsvelte/compiler": patch
---

fix(compiler): preserve whitespace inside `<title>` (SSR), matching upstream

Upstream's server `TitleElement` visitor calls `process_children` directly on the
raw fragment nodes — it never runs `clean_nodes`, so the title's inner whitespace
is preserved verbatim:

```svelte
<svelte:head>
  <title>
    {name ? `${name} |` : ''} Smelte the framework
  </title>
</svelte:head>
```

rsvelte's `process_children` cleans whitespace internally, so the leading
`\n    ` before the expression was trimmed (`<title>${…}` instead of
`<title>\n    ${…}`). Toggle `preserve_whitespace` around the title body's
`process_children` so its whitespace is kept verbatim, matching upstream's
clean_nodes bypass. Clears `smelte/src/routes/components/_layout.svelte`
(39 → 38).
