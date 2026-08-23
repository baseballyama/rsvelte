---
'@rsvelte/compiler': patch
---

Strip a leading UTF-8 BOM before compiling, as `svelte/compiler` does. A BOM at the start of a `.svelte` or `.svelte.js` file was treated as template content, which added a text node to the client template (changing the extra-node flag and the fragment shape) and a stray zero-width no-break space to the server output.
