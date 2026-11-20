# @rsvelte/cli

## 0.2.2

### Patch Changes

- 8a99b42: Read `as`, `then` and `catch` in a block tag as a prefix, so `{#each items asx}` reports `expected_whitespace` as Svelte does.
- f022127: Report `each_key_without_as` for a keyed `{#each}` block without `as` instead of crashing, and read an `{#each}` key with its types erased, as Svelte does.
- aacdd5a: Report `element_invalid_closing_tag_autoclosed` for an end tag of an element that a start tag already closed, as Svelte does.
- 9810d15: `rsvelte format` resolves the formatter options of each file as Prettier and oxfmt do: from the nearest configuration and `.editorconfig`. It ignores an unknown option with a warning, and an option that `rsvelte.config` gives a plugin replaces the project's.
- 507e702: `rsvelte lint` reads `compilerOptions.experimental.async` from `svelte.config.js`, so `svelte/valid-compile` no longer reports `experimental_async` for top-level `await` when the option is on.
- 5a1f605: Report a repeated attribute in a Vue template at the repeated attribute instead of at 1:1.

## 0.2.1

### Patch Changes

- c8116c2: Compile `bind:group` beside a `value` made of text and expressions, such as `value="{a}-{b}"`, instead of refusing it.
- ea61e22: `rsvelte typecheck` no longer reports a false "has no default export" at an import of a component whose script only TypeScript reads, such as a plain `<script>` with TypeScript syntax.
- 1db7820: An `{#each}` block without `as` now ends its expression where Svelte does, so a comment or a closing parenthesis after the expression is an error.
- c9c88b5: `rsvelte format` now takes the options of the nearest oxfmt or Prettier configuration, as the 0.2.0 notes announced; 0.2.0 shipped without this change and formatted with Prettier's defaults.
- cf93141: Inside a Git repository, `rsvelte lint` and `rsvelte format` read `.gitignore` files only up to the repository root, so an enclosing repository's no longer skip a nested project's files. Outside Git, `.gitignore` files still apply.
- 9893576: Compile `bind:focused` on `<svelte:window>` and `<svelte:document>` as Svelte does.
- cce073d: `svelte/no-navigation-without-resolve` accepts a link whose `href` an `{#each}` item takes from `resolve()` in a constant array or object literal.
- 050637e: `rsvelte lint` supports the `no-undef` rule for Svelte components.
- 4e358aa: Report `attribute_invalid_multiple` for a binding on a `<select>` with a dynamic `multiple` attribute, as Svelte does.
- dc51a86: The README says that `on:click`, `<slot>` and `createEventDispatcher` work as in the official compiler's runes mode, and that `typecheck` reports `$$props` and `$$restProps` as unknown names.
- d6270b1: The README states that rsvelte supports only Svelte 5 components in runes mode, and what each command does on a legacy component.
- e2b3c65: `rsvelte typecheck` reports the errors of the project's `tsconfig.json` and exits 1, as svelte-check does. Examples are an `include` that matches no file, an empty `files` and an unknown compiler option.
- 7154a25: A `<svelte:options>`, `<svelte:head>`, component or `<slot>` left open at the end of a file now raises `block_unclosed` like Svelte does. A regular element left open raises `element_unclosed`.

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
