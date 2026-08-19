# lint-env-known-failures.json — why entries are accepted

`scripts/compat-corpus/lint-env.mjs` lints the mini-projects under
`compatibility/lint-env/` with both the real `eslint-plugin-svelte` (oracle) and
native `rsvelte-lint`, comparing findings by `(ruleId, line, column, message)` —
the same key as the other lint gates. What is different is the **population**:
the sources are byte-identical across projects and only the `package.json`
differs, so a divergence is attributable to the environment and to nothing else.
The gate asserts that identical-sources invariant rather than trusting it.

**`lint-env-known-failures.json` is expected to stay empty, and holds 0 entries
today.** It is not a burndown backlog. An entry
here means rsvelte behaves differently from ESLint *because of what the project
declares*, which is a class of bug users hit on their own machines and no other
gate can reach.

## Why this gate exists

eslint-plugin-svelte gates five rules on SvelteKit being resolvable **from the
linted file's path** (`getSvelteKitVersion` in `src/utils/svelte-context.ts`):
`no-goto-without-base`, `no-navigation-without-base`,
`no-navigation-without-resolve`, `no-export-load-in-svelte-module-in-kit-pages`
and `valid-prop-names-in-kit-pages` — the last two indirectly, because
`svelteKitFileType` is only computed once a version is known, so a
`svelteKitFileTypes` condition also fails without SvelteKit.

Every other lint gate compares files that share one ancestry, and
`compatibility/lint-adversarial/package.json` declares `@sveltejs/kit` for the
entire adversarial corpus — deliberately, so those rules are exercised. The
consequence is that "is SvelteKit installed" was a **constant** across every
population this project measures, and rsvelte's total absence of the condition
was invisible: in a plain Svelte project it reported all five rules where ESLint
reports none. Measured on a two-file project whose only difference was a
`@sveltejs/kit` entry in `package.json`: 3 rsvelte-only findings without it, 0
with it.

`svelteVersions` is deliberately **not** modelled, and that is not an omission.
Upstream's `getSvelteVersion()` takes no file path — it reads the `svelte`
package the *plugin itself* resolves — so it describes the linter's own
installation rather than the linted project. rsvelte, being a Svelte 5 port,
behaving as "5" is the faithful answer.

## Adding a project

Copy an existing directory and change **only** the `package.json`. The gate
refuses to run if two projects' same-named sources differ, because a population
that varies the sources measures the sources. It also refuses when every
project yields the same oracle finding count: that means the manifests do not
separate any rule, so agreeing with upstream would prove nothing.
