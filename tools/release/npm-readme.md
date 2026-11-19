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

`format` uses the project's formatter options: the nearest `.oxfmtrc.json`, `.oxfmtrc.jsonc`,
`.prettierrc`, `.prettierrc.json` or `prettier` field of `package.json`. When it cannot print
as those options say, it writes nothing and says why:

- It reads only JSON, so a YAML, TOML or JavaScript configuration stops it.
- It does not apply `overrides`, `sortImports`, Tailwind CSS sorting or Prettier plugins other
  than `prettier-plugin-svelte`.
- The Svelte formatter prints only the defaults of `semi`, `singleQuote`, `trailingComma`,
  `arrowParens`, `bracketSpacing`, `quoteProps` and `objectWrap`. With another value, `format`
  formats the TypeScript files, leaves the Svelte files as they are, and exits with 2.

`typecheck` checks the project of `tsconfig.json` in the current directory and reports the
type errors that svelte-check reports. It runs a TypeScript 7 type checker from the project's
`node_modules`. Install one of these:

- [tsrs](https://www.npmjs.com/package/tsrs) (recommended): `npm install --save-dev tsrs`
- TypeScript 7.1 or newer (`typescript`, or `@typescript/native-preview`)

Each command exits with 1 when it finds an error, and with 2 when it cannot run.

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
