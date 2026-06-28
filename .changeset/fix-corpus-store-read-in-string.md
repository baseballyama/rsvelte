---
"@rsvelte/compiler": patch
---

fix(compiler): don't rewrite a `$store` reference inside a string literal

`transform_store_reads_client` appends `()` to legacy store-subscription reads
(`$store` → `$store()`). Its guard against rewriting inside a string only checked
whether the *immediately preceding* character was a quote, so it caught
`'$store'` but not a store name appearing mid-string, e.g. a log message:

```js
foo("[TODO] -> if ($canvas_dim) :", { w: $canvas_dim.w });
```

The `$canvas_dim` inside the string was rewritten to `$canvas_dim()`, changing
the string's content. Replace the preceding-char heuristic with
`is_inside_string_literal`, which scans from the start tracking string and
template `${ }` state (a `$store` inside a `${ }` interpolation is code and is
still rewritten). Clears `svelthree/.../WebGLRenderer.svelte` from the corpus
baseline (51 → 50).
