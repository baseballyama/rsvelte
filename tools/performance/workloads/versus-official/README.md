# Versus official

Compares the official tools with the compiler and formatter of `main` and of this branch, on the
corpus's Svelte components. `.github/workflows/versus-official.yml` runs it on x86_64 Linux,
arm64 Linux and macOS, one job for each workload and runner, and writes the report to the run's
summary.

| Workload  | Tasks                              | Arms                                                        |
| --------- | ---------------------------------- | ----------------------------------------------------------- |
| `compile` | `compile-client`, `compile-server` | `svelte/compiler`, `rsvelte_core`, `rsvelte_svelte_compile` |
| `format`  | `format`                           | Prettier with prettier-plugin-svelte, `rsvelte_formatter`,  |
|           |                                    | `rsvelte_svelte_format`, oxfmt                              |

- `official.ts` runs the corpus oracle's own tasks (`tools/oracle/tasks/svelte-compile.ts` and
  `svelte-format.ts`), so the options are those the expected output came from: runes mode and
  production for the compiler, Prettier's defaults for the formatter. `measure.ts platform` fails
  unless the installed versions are the ones `corpus/_registry/oracles.json` pins.
- `oxfmt.ts` runs oxfmt's `format` with the same Prettier options. oxfmt formats a `.svelte` file
  with the prettier-plugin-svelte it bundles; the workflow installs the latest oxfmt.
- `arms.ts` writes the two Rust arms, `main.rs` and `experimental.rs`, as `lint-versus-main` does:
  one harness (`harness.rs`), one profile, each tree's lockfile. `ARM_ALLOCATOR=mimalloc` picks
  `mimalloc`; otherwise the arm uses the system's `malloc`.
- `node-arm.ts` gives the Node arms the harness's commands. With more than one thread, each worker
  thread loads its own compiler or formatter, and the peak resident set is the whole process.

Each arm gets each component's path below the staging root as its filename, and reads every input
before the timing starts. The compiler arms build the source map and the warnings as the official
`compile` does. `measure.ts check` drops a component that any arm fails on in any task of the
workload, lists it in `excluded.tsv`, and counts the outputs that equal the official one, byte for
byte and as the corpus compares them. `measure.ts control` breaks the experimental arm on purpose
and fails unless those counts and the output size catch it.

```sh
W=tools/performance/workloads/versus-official
node $W/arms.ts <main checkout> <arms>
cargo build --release --manifest-path <arms>/main/Cargo.toml
cargo build --release --manifest-path <arms>/experimental/Cargo.toml
node tools/performance/workloads/lint-versus-main/stage.ts <stage>
A=(--workload compile --official $W/official.ts --main <main-arm> --experimental <experimental-arm> --out <results>)
node $W/measure.ts check "${A[@]}" --root <stage>/files --inputs <stage>/inputs.txt --sources real
node $W/measure.ts control "${A[@]}" --root <stage>/files
node $W/measure.ts wall "${A[@]}" --root <stage>/files --repetitions 3 --rounds 3 --threads 1,all --allocators system
node $W/report.ts report.md <results>
```

The arms need `pnpm install`. `--sources real` leaves out the sources named `rsvelte…`, the cases
written for this project. The header of `measure.ts` lists every command and option.
