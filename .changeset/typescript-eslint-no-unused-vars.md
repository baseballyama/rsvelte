---
'@rsvelte/cli': patch
---

`rsvelte lint` reports `@typescript-eslint/no-unused-vars` in TypeScript files as typescript-eslint does. Signature parameters, parameter properties, enum members and what an ambient context declares count as used, and a `typeof` does not.
