---
'@rsvelte/compiler': patch
---

Stop an apostrophe in a comment from suppressing the store and prop read rewrites. `// it's fine` opened a string literal that nothing closed, so every `$store` / prop read after it was emitted uncalled — code that parses and is silently wrong at runtime.
