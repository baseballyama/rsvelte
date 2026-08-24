---
"@rsvelte/compiler": patch
---

Hand a preprocessor's `script` / `style` hook its `attributes` in source order, and write a hook's returned `attributes` back in the order it built them. Both were hash order: upstream fills a plain object from the attribute regex and stringifies `Object.entries`, and JavaScript key order is observable through `Object.keys`, `for…in` and `JSON.stringify`, so a preprocessor that rebuilds a tag or hashes the attributes for a cache key produced different output under the two compilers.
