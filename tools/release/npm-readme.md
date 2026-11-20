# rsvelte

rsvelte lints, formats and type checks Svelte 5 and TypeScript files with native programs
built from Rust. This release is experimental.

## Install

```sh
npm install --save-dev @rsvelte/cli
```

## Use

```sh
npx @rsvelte/cli lint [<path>...]
npx @rsvelte/cli format [<path>...] [--check]
npx @rsvelte/cli typecheck
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

Without a path, `lint` and `format` read every file below the current directory. They skip
`node_modules` and what `.gitignore` skips; `format` also skips what `.prettierignore` skips.
`format` writes the files it changes. With `--check`, it lists them and writes nothing.

`format` formats each file with the options its formatter would use. It reads the nearest
formatter configuration from the file's directory upward. In each directory it looks for
`.oxfmtrc.json` or `.oxfmtrc.jsonc` first, then `.prettierrc` or `.prettierrc.json`, then the
`prettier` field of `package.json`. Where that configuration says nothing, `.editorconfig` sets
the indentation, the line width, the quotes and the line endings. Prettier reads every `.editorconfig` up to the project root, and oxfmt reads
the nearest one from the current directory. When `rsvelte.config` gives `svelte.format` or
`typescript.format` options, that plugin uses only those.

`format` ignores an option the formatter does not know and prints a warning, as Prettier does.
It reads nothing else for a file that the `ignorePatterns` of its nearest oxfmt configuration
leave, and it skips a `package.json` that does not parse, as Prettier does.
When `format` cannot print as the options say, it writes nothing and says why:

- It reads only JSON, so a YAML, TOML or JavaScript configuration stops it.
- It does not apply `overrides`, `sortImports`, Tailwind CSS sorting or Prettier plugins other
  than `prettier-plugin-svelte`.
- It does not print without a line limit, as Prettier prints with `max_line_length = off`.
  Under an oxfmt configuration, it drops that setting, as oxfmt does.
- The Svelte formatter prints only the defaults of `semi`, `singleQuote`, `trailingComma`,
  `arrowParens`, `bracketSpacing`, `quoteProps` and `objectWrap`. With another value, `format`
  formats the other files, leaves those Svelte files as they are, and exits with 2.

`typecheck` checks the project of `tsconfig.json` in the current directory and reports the
type errors that svelte-check reports. It runs a TypeScript 7 type checker from the project's
`node_modules`. Install one of these:

- [tsrs](https://www.npmjs.com/package/tsrs) (recommended): `npm install --save-dev tsrs`
- TypeScript 7.1 or newer (`typescript`, or `@typescript/native-preview`)

Each command exits with 1 when it finds an error, and with 2 when it cannot run.

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
    "svelte.lint": { "rules": { "no-unused-vars": "warn" } },
    "typescript.check": { "tsconfig": "tsconfig.app.json" }
  }
}
```

## License

MIT
