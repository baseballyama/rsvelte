---
"@rsvelte/compiler": patch
---

Keep a `.svelte.(js|ts)` module's statements in source order. `compileModule` split the transformed source into "imports" and "the rest" with a line scan and emitted every import first, so an `import` written below an `export … from` was hoisted above it — which reorders the two modules' side effects, not just the text. Upstream's `client_module` / `server_module` concatenate the generated `$` import with the walked module body untouched, and rsvelte now does the same: the scan is gone, so a line whose text merely *spells* an import (inside a comment, a string, a template literal or a regex literal) can no longer move anything either.
