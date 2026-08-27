---
"@rsvelte/compiler": patch
---

Match the official compiler's message and byte position when TypeScript-only syntax is used in a JavaScript component script or `.svelte.js` module. The parser now reports the token where acorn stops instead of OXC's enclosing TypeScript node, and uses acorn's generic or reserved-keyword wording rather than OXC's TypeScript-aware diagnostic.
