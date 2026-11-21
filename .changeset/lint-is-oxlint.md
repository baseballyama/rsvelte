---
'@rsvelte/cli': minor
---

`rsvelte lint` is oxlint with a built-in Svelte linter. It takes oxlint's options and reads `.oxlintrc.json`, where Svelte rules are configured under the `svelte/` prefix with oxlint's categories. `rsvelte.config` no longer configures lint: `svelte.lint` and `typescript.lint` are gone.
