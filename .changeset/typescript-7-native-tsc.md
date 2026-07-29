---
"rsvelte-check": patch
---

Make `--tsgo` mean "type-check with the TypeScript 7 native compiler", matching
official svelte-check's flag of the same name (sveltejs/language-tools#3073).
TypeScript 7 is looked up as `@typescript/native` — the npm alias it is
installed under when a TypeScript 6 `typescript` has to stay alongside it — and
then as the legacy `@typescript/native-preview`, accepting only major 7 or
newer. Resolution goes through the package directory rather than
`node_modules/.bin`, because an aliased TypeScript 7 declares the same `tsc` bin
name as the real `typescript` and whichever install wins that shim is an
install-order coin flip.

Without the flag, the workspace's own `tsc` is used whatever its major version
is, exactly as before. Passing `--tsgo` with no TypeScript 7 installed is now an
error rather than a silent downgrade to a different compiler; the message tells
you how to install it:

```sh
npm install --save-dev typescript@~6 @typescript/native@npm:typescript@7
```
