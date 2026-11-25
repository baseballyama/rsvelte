---
'@rsvelte/cli': patch
---

`typecheck` now types the `args` of a `@storybook/addon-svelte-csf` story's `template` snippet by the props of the story's component, as svelte-check does. In 0.7.0 they were `{ [x: string]: any }`, so `typecheck` reported a required prop as missing where a component took them as a spread.
