# TypeScript

Component scripts and standalone JavaScript and TypeScript files share parsing and scope
analysis. Core `register` adds facts only. The sibling `compile`, `format`, `lint`, and `check`
crates register tools separately; see [crate layout](../../../README.md).

The tools select documents with the extensions `.ts`, `.mts` and `.cts`, and `.js`, `.mjs`
and `.cjs`. They also accept declaration files. The extension selects JavaScript or TypeScript
syntax in the same parser.

| Task                 | Output                   | Current scope                                                                           |
| -------------------- | ------------------------ | --------------------------------------------------------------------------------------- |
| `ts.compile/default` | JavaScript               | Erases types in the parser's supported subset; refuses enums and namespaces with values |
| `ts.format/default`  | JavaScript or TypeScript | Every file oxc parses, by `oxc_formatter` with Prettier's default options               |
| `ts.lint/default`    | JSON                     | The shared unused-variable rule on supported syntax                                     |
| `ts.check/default`   | JSON                     | Every document with a TypeScript view, by the type checker `typescript.check` names     |

```sh
cargo run -p rsvelte_command_line -- run input.ts --task ts.compile/default
cargo run -p rsvelte_command_line -- run input.ts --task ts.format/default
cargo run -p rsvelte_command_line -- run input.ts --task ts.lint/default
cargo run -p rsvelte_command_line -- run input.ts --task ts.check/default \
  --options typescript.check '{"command": ["/path/to/tsc"]}'
```

This is partial TypeScript support. Compile and lint use our own parser, which does not
yet support full JavaScript or TypeScript syntax, such as classes; format uses oxc. JSX and
TSX are not selected. Parse failures and unsupported compilation produce diagnostics and no
output file.

The type-check view copies the original source with byte mappings. It does not need
our subset parser. The current checker uses temporary `.ts` files: relative imports,
declaration-file rules, and `.mts`/`.cts` module modes are not preserved yet.

JavaScript uses the same compile, format, and lint tasks. The type-check view marks
JavaScript as unchecked, as it does for component scripts without type checking.
