---
'@rsvelte/cli': minor
---

`rsvelte lint` is oxlint with a built-in Svelte linter. It takes oxlint's options and reads `.oxlintrc.json`, where it configures Svelte rules under the `svelte/` prefix with oxlint's categories. `rsvelte.config` no longer configures lint, so it has no `svelte.lint` and `typescript.lint` any more. `@rsvelte/eslint-plugin` now turns off only the rules rsvelte adds to oxlint, to use beside `eslint-plugin-oxlint`, and gains `buildFromOxlintConfig` and `buildFromOxlintConfigFile`.
