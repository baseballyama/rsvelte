---
'@rsvelte/compiler': patch
---

Grow the stack on demand in two recursions whose depth follows the input's expression nesting: serializing JavaScript AST nodes, and applying client expression transforms. A long chain such as `x1 + x2 + … + x32` overflowed the default 2 MB thread stack in debug builds. Native targets only; the wasm build is unchanged.
