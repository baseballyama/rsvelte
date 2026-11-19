# rsvelte

rsvelte lints, formats and type checks Svelte 5 and TypeScript files with native programs
built from Rust. This release is experimental.

## Install

```sh
npm install --save-dev @rsvelte/cli
```

## Use

```sh
npx rsvelte lint [<path>...]
npx rsvelte format [<path>...] [--check]
npx rsvelte typecheck
```

Without a path, `lint` and `format` read every file below the current directory, except
`node_modules`. `format` writes the files it changes. With `--check`, it lists them and
writes nothing.

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
