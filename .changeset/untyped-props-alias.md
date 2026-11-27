---
'@rsvelte/cli': patch
---

`rsvelte typecheck` types a component's untyped `$props()` as svelte-check does, as `$$ComponentProps`. A missing or unknown prop now gets the error and message that svelte-check reports, in both JavaScript and TypeScript components.
