# @rsvelte/cli

## 0.2.0

### Minor Changes

- 1b50998: `rsvelte format` takes the options of the nearest oxfmt or Prettier configuration unless `rsvelte.config` names them. It refuses a configuration it cannot honor and writes nothing. When the Svelte formatter cannot print an option yet, it leaves the Svelte files and exits with 2.
- 1b50998: `rsvelte lint` and `rsvelte format` skip the files that `.gitignore`, `.git/info/exclude` and `.ignore` exclude. `rsvelte format` also skips what `.prettierignore` lists. A `.gitignore` counts only inside a Git repository, and a file named on the command line is still read.

### Patch Changes

- 4f3a68e: `rsvelte typecheck` accepts `bind:this` on a generic component, as svelte-check does.
- afb93f4: `rsvelte typecheck` types the `load` functions and endpoints of SvelteKit files as svelte-check does, so their untyped parameters are no longer implicitly `any`. It also types form actions and the hooks files.
- 1b50998: `rsvelte typecheck` passes over a TypeScript older than 7.1 instead of stopping at it. When it finds no type checker, it prints the command that installs tsrs with the project's package manager.
- 656fa37: `rsvelte typecheck` no longer reports every file as outside `rootDir` (TS6059) in a project that sets `outDir` but not `rootDir`.
- c162947: `rsvelte lint` reports `@typescript-eslint/no-unused-vars` in TypeScript files as typescript-eslint does. Signature parameters, parameter properties and what an ambient context declares count as used, and a `typeof` does not.

## 0.1.0

- The first release: `rsvelte lint`, `rsvelte format` and `rsvelte typecheck`.
