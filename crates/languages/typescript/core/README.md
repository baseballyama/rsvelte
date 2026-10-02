# TypeScript

Component scripts and standalone JavaScript and TypeScript files share parsing and scope
analysis. Core `register` adds facts only. The sibling `compile`, `format`, `lint`, and `check`
crates register tools separately; see [crate layout](../../../README.md).

The tools select `.ts`, `.mts`, `.cts`, `.js`, `.mjs`, and `.cjs` documents. They also accept
declaration files. The extension selects JavaScript or TypeScript syntax in the same parser.

| Task | Output | Current scope |
|---|---|---|
| `ts.compile/default` | JavaScript | Erases types in the parser's supported subset; refuses enums and namespaces with values |
| `ts.format/default` | JavaScript or TypeScript | The shared formatter's supported subset; refuses unsupported types and layouts |
| `ts.lint/default` | JSON | The shared unused-variable rule on supported syntax |
| `ts.check/default` | JSON | The CLI's shared TypeScript checker, configured with `--tsc` and optionally `--tsconfig` |

```sh
cargo run -p rsvelte_command_line -- run input.ts --task ts.compile/default
cargo run -p rsvelte_command_line -- run input.ts --task ts.format/default
cargo run -p rsvelte_command_line -- run input.ts --task ts.lint/default
cargo run -p rsvelte_command_line -- run input.ts --task ts.check/default --tsc /path/to/tsgo
```

This is partial TypeScript support. The parser does not yet support full JavaScript
or TypeScript syntax, such as classes. JSX and TSX are not selected. Parse failures
and unsupported compilation or formatting produce diagnostics and no output file.

The type-check view copies the original source with byte mappings. It does not need
our subset parser. The current checker uses temporary `.ts` files: relative imports,
declaration-file rules, and `.mts`/`.cts` module modes are not preserved yet.

JavaScript uses the same compile, format, and lint tasks. The type-check view marks
JavaScript as unchecked, as it does for component scripts without type checking.
