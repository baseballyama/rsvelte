# lint-env — mini-projects whose *environment* is the variable

Every other lint gate compares sources that all sit under one ancestry, so the
answer to "is SvelteKit installed" is a constant across the whole population.
It is not a constant for users: eslint-plugin-svelte resolves `@sveltejs/kit`
**from the linted file's path** (`getSvelteKitVersion` in
`src/utils/svelte-context.ts`) and disables five rules when it finds none.

Each directory here is a self-contained project with its own `package.json`.
The sources are deliberately identical across projects — the only variable is
the manifest — so a divergence is attributable to the environment and nothing
else. `scripts/compat-corpus/lint-env.mjs` compares each project with the real
eslint-plugin-svelte and with `rsvelte-lint`.

Dependencies are declared but never installed: upstream's resolution accepts a
`dependencies` / `devDependencies` entry in any `package.json` up the chain, so
a committed manifest is enough and no `node_modules` is needed.

## Adding a project

Copy an existing directory, change only the `package.json`, and keep the
sources byte-identical to its sibling. A project whose sources differ from its
siblings measures the sources, not the environment.
