---
'@rsvelte/cli': patch
---

`rsvelte typecheck` checks a component's value against svelte2tsx's constraint. A value that is no component now gives one finding at its tag, as svelte-check does, where it gave a second one about `never`.
