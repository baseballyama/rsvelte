---
"@rsvelte/lint": patch
"@rsvelte/oxlint-plugin": patch
---

fix(lint): `svelte/no-unused-props` no longer reports words from comments inside a Props type (e.g. a `/** … */` JSDoc on a member) as unused Props properties; the declared members are now read from the script's TypeScript AST.
