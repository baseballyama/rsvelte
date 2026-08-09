---
'@rsvelte/svelte-check': patch
---

Bound the shadow emission for an out-of-workspace package to the roots its `package.json` publishes (`files`, incl. negated entries, else `exports` / `svelte` / `main` / `module` / `types`). A monorepo sibling symlinked into `node_modules` is a whole repository directory, so walking all of it pulled in test fixtures the consumer can never import — including deliberately unparseable ones, which failed the entire run. A `svelte2tsx` failure inside such a package is no longer fatal either: that one file falls back to the ambient `*.svelte` declaration
