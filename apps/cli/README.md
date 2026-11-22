# rsvelte

rsvelte lints, formats and type checks Svelte 5, TypeScript and JavaScript files with native
programs built from Rust. This release is experimental.

## Install

```sh
npm install --save-dev @rsvelte/cli
```

## Use

```sh
npx @rsvelte/cli lint [<path>...]
npx @rsvelte/cli format [<path>...] [--check]
npx @rsvelte/cli typecheck
npx @rsvelte/cli help [<command>]
npx @rsvelte/cli version
npx @rsvelte/cli format lint typecheck [<path>...] [--check]
```

`npx` runs the project's copy, or downloads one when the project has none. In `package.json`
scripts, the command is `rsvelte`:

```json
{
  "scripts": {
    "lint": "rsvelte lint",
    "format": "rsvelte format",
    "typecheck": "rsvelte typecheck"
  }
}
```

`lint` reads these files:

- Svelte: `.svelte`
- JavaScript: `.js`, `.mjs` and `.cjs`
- TypeScript: `.ts`, `.mts` and `.cts`

Without a path, it reads every such file below the current directory. It skips `node_modules`
and what `.gitignore` skips.
A `svelte.lint` rule that applies to modules, such as `svelte/no-inspect`, also runs on
JavaScript and TypeScript files, `.jsx` and `.tsx` included.

`format` is [oxfmt](https://oxc.rs/docs/guide/usage/formatter) with a built-in Svelte
formatter. It takes oxfmt's options (`rsvelte format --help`) and reads oxfmt's configuration:
`.oxfmtrc.json`, `oxfmt.config.ts`, `.editorconfig` and `.prettierignore`. It runs `node` to
read `oxfmt.config.ts`. It formats each file that oxfmt formats
in Rust, such as TypeScript, JSON, CSS and Markdown files. It formats a `.svelte` file with the
options that oxfmt would give prettier-plugin-svelte, and it sorts imports and formats `/** */`
comments in its scripts as oxfmt does. It also formats the `svelte` code blocks of a Markdown
file. `format` never runs Prettier, so it skips the files that oxfmt hands to Prettier.
`"svelte": false` in the configuration turns Svelte formatting off. `rsvelte.config` does not
configure `format`.

With `sortTailwindcss`, `format` sorts Tailwind CSS classes as oxfmt does, with the
[`prettier-plugin-tailwindcss`](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) of
the file's project, run by `node`. In a Svelte file, it sorts the classes of `class` and of the
attributes `sortTailwindcss` names, of the functions it names in the scripts, and of `@apply`.
Install the plugin, version 0.8 or later, in the project: `format` does not ship one, so the
project chooses its version. Without `node` or the plugin, `format` reports an error for each
file whose classes it would sort and formats the others. As with oxfmt, an attribute named by a
regular expression (`/…/`) sorts only in a Svelte file, where the plugin matches it.

`typecheck` checks the project of `tsconfig.json` in the current directory, or next to
`rsvelte.config` when it gives `typescript.check` options, and reports the
type errors that svelte-check reports. It runs a TypeScript 7 type checker from the project's
`node_modules`. Install one of these:

- [tsrs](https://www.npmjs.com/package/tsrs) (recommended): `npm install --save-dev tsrs`
- TypeScript 7.1 or newer (`typescript`, or `@typescript/native-preview`)

`lint` and `typecheck` exit with 1 when they find an error, and with 2 when they cannot run.
`format` exits with the codes of oxfmt. It exits with 1 when `--check` finds a file to format
or when the configuration is invalid. It exits with 2 when a file does not format or when no
path matches a file.

Name more than one command to run them together, as `rsvelte format lint typecheck --check` in CI.
The paths go to `lint` and `format`, `--check` goes to `format`, and the `--config` options go
to `lint` and `typecheck`. To pass other oxfmt options, run `format` alone. `format` runs first,
and the other commands read what it wrote. `lint` and `typecheck` then run together and read each
file once. Each prints what it prints alone. The run exits with the worst exit code of its
commands. rsvelte reads each leading `lint`, `format` or `typecheck` as a command, so write a
directory named `lint` as `./lint`.

## Svelte 5 runes mode only

rsvelte supports Svelte 5 components in runes mode. It does not support Svelte 4 projects or
components in legacy mode. A component is in legacy mode when it uses `export let`, `$:`,
`$$props` or `$$restProps`, or sets `<svelte:options runes={false} />`. Svelte 5 deprecates
`on:click`, `<slot>` and `createEventDispatcher`. In a runes component, rsvelte treats them as
the official compiler does in runes mode.

On a legacy component:

- `typecheck` gives wrong results. It reports `check_unsupported` for `export let` in a
  TypeScript component and checks nothing else in that file. It reports `$$props`,
  `$$restProps` and the names that `$:` declares as unknown. For a JavaScript component, it can report no error at all, even when svelte-check
  finds one.
- `lint` and `format` accept the legacy syntax. Their results can still differ from the
  official tools, because legacy mode is not supported.

For a Svelte 4 project or legacy components, use the official tools:
[svelte-check](https://www.npmjs.com/package/svelte-check),
[eslint-plugin-svelte](https://www.npmjs.com/package/eslint-plugin-svelte) and
[prettier-plugin-svelte](https://www.npmjs.com/package/prettier-plugin-svelte).

## Configure

rsvelte reads `rsvelte.config.json` (or `.js`, `.ts` and the other module extensions) from
the current directory or the nearest parent directory that has one. Each plugin reads its
options from `plugins`:

```json
{
  "plugins": {
    "svelte.lint": { "rules": { "no-unused-vars": "warn", "svelte/button-has-type": "error" } },
    "typescript.check": { "tsconfig": "tsconfig.app.json" }
  }
}
```

A `rules` object replaces the default rules. For Svelte files, those are `no-unused-vars` and
`svelte/button-has-type`. A path in the options starts from the directory of the configuration
file.

## License

MIT
