---
"@rsvelte/svelte-check": minor
---

feat(svelte-check): upstream CLI flag parity — `--config`, `--no-tsconfig`, `--threshold`, `--preserveWatchOutput`

- `--config <path>`: use an explicit `svelte.config.*` / `vite.config.*` instead of discovery; a missing path exits with code 2, matching the JS reference.
- `--no-tsconfig`: check only the Svelte files under the workspace, ignoring any project tsconfig/jsconfig.
- `--threshold error|warning`: filter which diagnostics are printed; counts and the exit code stay computed from the unfiltered set, matching the JS reference.
- `--preserveWatchOutput` is now the canonical spelling (the hyphenated `--preserve-watch-output` remains as an alias), and `--tsgo-experimental-api` is accepted as an alias of `--tsgo`. `--color` / `--no-color` are accepted for CLI compatibility (output is un-colorized either way).
