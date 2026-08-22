---
"@rsvelte/fmt": patch
---

Stop `rsvelte-fmt` aborting on a template expression whose last token is a `//` line comment. The expression was handed to the JS formatter as `(<slice>);` with the `);` on the comment's own line, so the comment swallowed it and the whole file failed with `script parse failed: Expected `)` but found `EOF``. `<b>{flag // c⏎}</b>` and `<div data-a={flag // c⏎}>` now format. Their output is still not valid Svelte — the markup printer puts the tag's closing `}` on the comment's line, tracked separately.
