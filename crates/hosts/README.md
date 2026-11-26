# Hosts

A host connects the rsvelte toolchain to an execution environment. It chooses tools, accepts
input, runs tasks through the kernel, and returns their output. Language trees and tool
implementations live in `../languages/`; shared data and task scheduling live in
`../language_independent/kernel/`. Before tasks run, a host loads the
[configuration](configuration_loading/README.md): JSON, JS/TS or custom settings, and the
runtime functions they name. Node is optional.

| Host            | Who uses it                                                                | Interface                                          |
| --------------- | -------------------------------------------------------------------------- | -------------------------------------------------- |
| `command_line/` | People running rsvelte in a terminal, and toolchain developers             | The native `rsvelte` and `rsvelte-dev` executables |
| `browser/`      | Developers embedding rsvelte in a web page; for now, the site's playground | JavaScript bindings to WebAssembly                 |

A host knows no language. It installs the plugins' extensions and runs their tasks; a page
installs them without a file system, and shows each artifact a task computed through the
artifact's `Debug`.

## Command line

The command line is two programs. `rsvelte`, which a [release](../../tools/release/README.md)
publishes to npm, runs `lint`, `format` and `typecheck` over Svelte and TypeScript files; its
[README](../../apps/cli/README.md) is the user guide. `rsvelte lsp` lints, fixes, formats and type
checks the text in an editor over the Language Server Protocol, for example for
[the Visual Studio Code extension](../../apps/vscode/README.md). It
[routes](command_line/src/release/language_server.rs) between the editor and three servers:
oxlint's language server with the Svelte plugin `rsvelte lint` runs and the formatter, the type
check of `rsvelte typecheck`, and the language server of the TypeScript 7.1 that check runs, for
TypeScript's features in components.
`rsvelte-dev` runs every task of every language, and the development commands below. Run these examples from the repository root
with the pinned Rust toolchain:

```sh
cargo run -p rsvelte_command_line --bin rsvelte-dev -- run App.svelte --task svelte.compile/client
cargo run -p rsvelte_command_line --bin rsvelte-dev -- run App.svelte --task svelte.format/default
cargo run -p rsvelte_command_line --bin rsvelte-dev -- run App.svelte --task svelte.lint/default
```

Repeat `--task` to request more than one task. `run` prints generated files and diagnostics to
standard output, with task labels. It exits with 1 when an error diagnostic or finding remains,
and with 2 for a usage error. It does not edit the input file unless you pass `--fix`. Then it
applies the findings' fixes as ESLint does, in up to 10 passes, and writes the file. With more
than one file, `run` runs the tasks over every file in one run, so one type check covers the
whole project, and labels each output with its file. It does not take `--fix` then. `check`
finds those files itself: it runs `ts.check/default`, or the given tasks, over every file the
type checker selects from the `tsconfig` option of `typescript.check`, outside `node_modules`.
`lint` runs the lint of every language over the files below the given paths, by default the
current directory. It skips `node_modules` and `.git`, as ESLint does, and prints the problems
in the `stylish` layout of ESLint. `format` formats the same files and writes the ones that
change; with `--check`, it writes nothing, lists them, and exits with 1.

| Command                                    | Purpose                                                         |
| ------------------------------------------ | --------------------------------------------------------------- |
| `run <file>... --task <identifier>`        | Run selected tasks on files, in one run                         |
| `check [--task <identifier>]...`           | Type check the files of the project, in one run                 |
| `lint [<path>...]`                         | Lint the files below the paths, in one run                      |
| `format [<path>...] [--check]`             | Format the files below the paths, in one run                    |
| `corpus <dir>... --task <identifier>`      | Write task outputs under each corpus unit's `actual/` directory |
| `benchmark <dir> --task <identifier>`      | Measure pipeline time                                           |
| `performance <dir>... --task <identifier>` | Measure performance counters                                    |

The CLI knows no language. `rsvelte-dev` installs every plugin's `EXTENSION`, and each plugin reads its own
options from `plugins.<plugin>` in [the configuration file](configuration_loading/README.md).
`--options <plugin> <json>` replaces them; paths in it start from the current directory. Two
mistakes stop the run with exit code 2 before it reads a file: an option no installed plugin
reads, and a task that would run without what it needs. Without `--task`, `corpus` and `run` run
every task, the checks included.

The check tasks share the type checker that `typescript.check` names: TypeScript 7.1's `tsc` or
any product with its API, such as `tsrs`. rsvelte starts it with
`--api --cwd <dir> --runExternalCode` and asks it for diagnostics. The CLI looks for a bare name
such as `tsrs` in the project's `node_modules/.bin`, then in `PATH`. Without `command`, it runs
the first of `tsrs`, `@typescript/native-preview` and `typescript` that the project installs.
It starts the package's native executable directly, as the package's script finds it; for
`tsrs`, that is the program `TSRS_BINARY` names, when set. Without the executable, it runs the
script through `node`. It passes over a TypeScript older than 7.1. If it finds no checker, the
error names the ones it passed over and the command that installs `tsrs` with the project's
package manager. Before it reads any file,
the CLI runs `<checker> --version`; `benchmark` and `performance` record each program and its
version in `tools`. `svelte.check` also needs the svelte package, by default the project's, and the content mapper,
by default `rsvelte-svelte-content-mapper` beside the running program. `vue.check` needs the
vue package. `rsvelte typecheck` gives both check plugins empty options when nothing configures
them, so a project needs no configuration.

```sh
cargo install --path crates/languages/typescript/content_mapper
cargo run -p rsvelte_command_line --bin rsvelte-dev -- run App.svelte --task svelte.check/default \
  --options typescript.check '{"command": ["tsrs"], "tsconfig": "tsconfig.json"}' \
  --options svelte.check '{"svelte": "node_modules/svelte"}'
```

[`command_line/src/lib.rs`](command_line/src/lib.rs) handles the arguments of `rsvelte-dev`
and [`command_line/src/release.rs`](command_line/src/release.rs) those of `rsvelte`; each
registers its tools. See [the corpus guide](../../corpus/README.md) for oracle comparisons.

## Browser / WebAssembly

The browser host exposes Rust functions to JavaScript through `wasm-bindgen`. Web application
developers call these functions directly. The site's playground calls the same bindings.

Build the bindings with `pnpm run generate` from `apps/site/`. See
[the site setup](../../apps/site/README.md) for prerequisites and build steps. Initialize the
generated module before you call its functions:

```js
import init, { runPipeline } from './rsvelte_browser.js';

await init();
const result = JSON.parse(
  runPipeline('<p>Hello</p>', 'App.svelte', 'svelte', 'compile-client,lint', true),
);
console.log(result.steps);
```

| Export                                                  | Purpose                                                                                       |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `runPipeline(source, filename, plugins, tasks, shared)` | Run language tasks and return a JSON string with outputs, diagnostics, and computation traces |

`plugins` is a comma-separated selection of `typescript`, `svelte`, `vue`, `svue` and `vuelte`. `tasks`
selects `compile-client`, `compile-server`, `format` and `lint` in the same form. The plugin and
the filename decide which tasks are available. `shared = true` lets tasks reuse derived facts;
`false` keeps each task's computations apart, for comparison.

For now this host serves the playground. It runs one source file on one thread, accepts at most
64 KiB of source, and includes tree and analysis snapshots in its results. It has no type
checking, because that needs an external TypeScript process. Check `ok` for request errors and
each step's `diagnostics` for source errors.
