# TypeScript

Component scripts and standalone JavaScript and TypeScript files share parsing and scope
analysis. `rsvelte_typescript_tree` parses each file once with oxc, and its `register` adds only
that tree. The sibling `compile`, `format`, `lint`, and `check` crates register tasks over it; see
[crate layout](../../../README.md).

The tools select documents with the extensions `.ts`, `.mts` and `.cts`, and `.js`, `.mjs`
and `.cjs`. They also accept declaration files. The extension selects JavaScript or TypeScript
syntax.

| Task                 | Output                   | Current scope                                                                            |
| -------------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `ts.compile/default` | JavaScript               | Erases types; refuses the constructs with a runtime value that `features::Feature` lists |
| `ts.format/default`  | JavaScript or TypeScript | Every file oxc parses, by `oxc_formatter` with Prettier's default options                |
| `ts.lint/default`    | JSON                     | The shared unused-variable rule on supported syntax                                      |
| `ts.check/default`   | JSON                     | Every document with a TypeScript view, by the type checker `typescript.check` names      |

```sh
cargo run -p rsvelte_command_line --bin rsvelte-dev -- run input.ts --task ts.compile/default
cargo run -p rsvelte_command_line --bin rsvelte-dev -- run input.ts --task ts.format/default
cargo run -p rsvelte_command_line --bin rsvelte-dev -- run input.ts --task ts.lint/default
cargo run -p rsvelte_command_line --bin rsvelte-dev -- run input.ts --task ts.check/default \
  --options typescript.check '{"command": ["/path/to/tsc"]}'
```

The tree also reads JSX in `.jsx` and `.tsx` modules, but only the Svelte lint task selects
them. Parse failures and unsupported compilation produce diagnostics and no output file.

The type-check view copies the original source with byte mappings. It reads the tree only to
add the types SvelteKit gives the exports of its route, hooks and parameter-matching files. The
checker reads each document at its own path, so relative imports, declaration-file rules and
`.mts`/`.cts` module modes are the project's.

JavaScript uses the same compile, format, and lint tasks. The type-check view marks
JavaScript as unchecked, as it does for component scripts without type checking.
