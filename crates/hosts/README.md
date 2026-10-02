# Hosts

A host connects the rsvelte toolchain to an execution environment. It chooses
tools, accepts input, runs tasks through the kernel, and returns their output.
Language trees and tool implementations live in `../languages/`; shared data and
task scheduling live in `../kernel/`.

| Host | Who uses it | Interface |
|---|---|---|
| `command_line/` | People running rsvelte in a terminal, and toolchain developers | The native `rsvelte` executable |
| `browser/` | Developers embedding rsvelte in a web page; currently the Learn site | JavaScript bindings to WebAssembly |

## Command line

The CLI provides file processing and development commands. Run these examples
from the repository root with the pinned Rust toolchain:

```sh
cargo run -p rsvelte_command_line -- run App.svelte --task svelte.compile/client
cargo run -p rsvelte_command_line -- run App.svelte --task svelte.format/default
cargo run -p rsvelte_command_line -- run App.svelte --task svelte.lint/default
```

Repeat `--task` to request more than one task. `run` prints generated files and
diagnostics to standard output, with task labels. It does not edit the input file.

| Command | Purpose |
|---|---|
| `run <file> --task <identifier>` | Run selected tasks on one file |
| `fixtures <dir>... --task <identifier>` | Write task outputs under each fixture unit's `actual/` directory |
| `benchmark <dir> --task <identifier>` | Measure pipeline time |
| `performance <dir>... --task <identifier>` | Measure performance counters |

Type checking also needs an external TypeScript executable. For example:

```sh
cargo run -p rsvelte_command_line -- run App.svelte \
  --task svelte.check/default --tsc /path/to/tsc \
  --svelte /path/to/node_modules/svelte --tsconfig /path/to/tsconfig.json
```

The CLI argument handling and registered tools are in
[`command_line/src/main.rs`](command_line/src/main.rs).
See [the fixture guide](../../fixtures/README.md) for oracle comparisons.

## Browser / WebAssembly

The browser host exposes Rust functions through `wasm-bindgen`. Web application
developers call these functions from JavaScript. People using the Learn site use
its playground UI, which calls the same bindings.

Build the bindings with `pnpm run build:wasm` from `apps/site/`.
See [the site setup](../../apps/site/README.md) for prerequisites and build steps.
Initialize the generated module before calling its functions:

```js
import init, { runPipeline } from './rsvelte_kernel_browser.js';

await init();
const result = JSON.parse(runPipeline(
  '<p>Hello</p>', 'App.svelte', 'svelte', 'compile-client,lint', true
));
console.log(result.steps);
```

| Export | Purpose |
|---|---|
| `runPipeline(source, filename, plugins, tasks, shared)` | Run language tasks and return a JSON string with outputs, diagnostics, and computation traces |
| `renderDocument(source, width, tabs)` | Render a document layout expression and return a JSON string with output and layout traces |
| `stringWidth(text)` | Return the printer's display width for a string |

`plugins` is a comma-separated selection of `svelte`, `vue`, `svue`, and `vuelte`.
`tasks` selects `compile-client`, `compile-server`, `format`, and `lint` in the
same form. Available tasks depend on the plugin and filename. `shared = true`
lets tasks reuse derived facts; `false` isolates task computations for comparison.

This host currently serves the playground. It runs one source file on one thread,
accepts at most 64 KiB of source, and includes tree and analysis snapshots in its
results. Type checking is not exposed because it needs an external TypeScript
process. Check `ok` for request errors and each step's `diagnostics` for source
errors.
