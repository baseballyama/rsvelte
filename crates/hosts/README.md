# Hosts

A host connects the rsvelte toolchain to an execution environment. It chooses tools, accepts
input, runs tasks through the kernel, and returns their output. Language trees and tool
implementations live in `../languages/`; shared data and task scheduling live in
`../language_independent/kernel/`. Before tasks run, a host loads the
[configuration](configuration_loading/README.md): JSON, JS/TS or custom settings, and the
runtime or native functions they name. Node is optional.

| Host            | Who uses it                                                         | Interface                          |
| --------------- | ------------------------------------------------------------------- | ---------------------------------- |
| `command_line/` | People running rsvelte in a terminal, and toolchain developers      | The native `rsvelte` executable    |
| `browser/`      | Developers embedding rsvelte in a web page; for now, the Learn site | JavaScript bindings to WebAssembly |
| `site/`         | The site's build (`apps/site/scripts/generate.ts`)                  | Executables that print figure data |

## Command line

The CLI processes files and runs development commands. Run these examples from the repository
root with the pinned Rust toolchain:

```sh
cargo run -p rsvelte_command_line -- run App.svelte --task svelte.compile/client
cargo run -p rsvelte_command_line -- run App.svelte --task svelte.format/default
cargo run -p rsvelte_command_line -- run App.svelte --task svelte.lint/default
```

Repeat `--task` to request more than one task. `run` prints generated files and diagnostics to
standard output, with task labels. It does not edit the input file.

| Command                                    | Purpose                                                         |
| ------------------------------------------ | --------------------------------------------------------------- |
| `run <file> --task <identifier>`           | Run selected tasks on one file                                  |
| `corpus <dir>... --task <identifier>`      | Write task outputs under each corpus unit's `actual/` directory |
| `benchmark <dir> --task <identifier>`      | Measure pipeline time                                           |
| `performance <dir>... --task <identifier>` | Measure performance counters                                    |

The CLI knows no language. It installs every plugin's `EXTENSION`, and each plugin reads its own
options from `plugins.<plugin>` in [the configuration file](configuration_loading/README.md).
`--options <plugin> <json>` replaces them; paths in it start from the current directory. Two
mistakes stop the run with exit code 2 before it reads a file: an option no installed plugin
reads, and a task that would run without what it needs. Without `--task`, `corpus` and `run` run
every task, the checks included.

The check tasks share the type checker that `typescript.check` names: TypeScript 7.1's `tsc` or
any product with its command line, such as `tsrs`. rsvelte adds
`-p <dir> --pretty true --runExternalCode` and reads its report. The CLI looks for a bare name
such as `tsrs` in the project's `node_modules/.bin`, then in `PATH`. Before it reads any file,
the CLI runs `<checker> --version`; `benchmark` and `performance` record each program and its
version in `tools`. `svelte.check` also needs the svelte package and the content mapper, and
`vue.check` needs the vue package.

```sh
cargo install --path crates/languages/typescript/content_mapper
cargo run -p rsvelte_command_line -- run App.svelte --task svelte.check/default \
  --options typescript.check '{"command": ["tsrs", "--fast"], "tsconfig": "tsconfig.json"}' \
  --options svelte.check '{"svelte": "node_modules/svelte"}'
```

The optional `lint-typed` Cargo feature, off by default, adds Svelte type-aware lint to the CLI:

```sh
cargo run -p rsvelte_command_line --features lint-typed -- run App.svelte --task svelte.lint.typed/default
```

Its type provider is a limited Rust prototype; it does not connect to tsgo. See
[typed lint](../languages/svelte/lint_typed/README.md).

[`command_line/src/main.rs`](command_line/src/main.rs) handles the arguments and registers the
tools. See [the corpus guide](../../corpus/README.md) for oracle comparisons.

## Browser / WebAssembly

The browser host exposes Rust functions to JavaScript through `wasm-bindgen`. Web application
developers call these functions directly. The Learn site's playground UI calls the same
bindings.

Build the bindings with `pnpm run generate` from `apps/site/`. See
[the site setup](../../apps/site/README.md) for prerequisites and build steps. Initialize the
generated module before you call its functions:

```js
import init, { runPipeline } from './rsvelte_kernel_browser.js';

await init();
const result = JSON.parse(
  runPipeline('<p>Hello</p>', 'App.svelte', 'svelte', 'compile-client,lint', true),
);
console.log(result.steps);
```

| Export                                                  | Purpose                                                                                       |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `runPipeline(source, filename, plugins, tasks, shared)` | Run language tasks and return a JSON string with outputs, diagnostics, and computation traces |
| `renderDocument(source, width, tabs)`                   | Render a document layout expression and return a JSON string with output and layout traces    |
| `stringWidth(text)`                                     | Return the printer's display width for a string                                               |

`plugins` is a comma-separated selection of `svelte`, `vue`, `svue` and `vuelte`. `tasks`
selects `compile-client`, `compile-server`, `format` and `lint` in the same form. The plugin and
the filename decide which tasks are available. `shared = true` lets tasks reuse derived facts;
`false` keeps each task's computations apart, for comparison.

For now this host serves the playground. It runs one source file on one thread, accepts at most
64 KiB of source, and includes tree and analysis snapshots in its results. It has no type
checking, because that needs an external TypeScript process. Check `ok` for request errors and
each step's `diagnostics` for source errors.
