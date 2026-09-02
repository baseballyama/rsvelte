---
'@rsvelte/compiler': patch
---

A module script's member assignment in value position is now wrapped in dev's
`$.assign(...)`, as upstream's one `AssignmentExpression` visitor does for every
script. rsvelte ran that collector only over a settled instance script, so a
`.svelte.js`, a `.svelte.ts` and a component's `<script module>` all emitted the
bare assignment and lost the proxy warning it exists to give
(`(object.items ??= []).push(x)`).
