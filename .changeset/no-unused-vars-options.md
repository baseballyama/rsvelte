---
'@rsvelte/cli': patch
---

`no-unused-vars` and `no-undef` in a component now read their options from the configuration, such as `varsIgnorePattern` and `typeof`. Before, a component ignored them. An option the Svelte linter does not take now fails when oxlint reads the configuration.
