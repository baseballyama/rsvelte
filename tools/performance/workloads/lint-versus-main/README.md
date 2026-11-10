# Lint versus main

Compares the lint crate of `main` (`rsvelte_lint`) with this branch's (`rsvelte_svelte_lint`) on
every Svelte component of the corpus. `.github/workflows/lint-versus-main.yml` runs it on x86_64
Linux, arm64 Linux and macOS, and writes the report to the run's summary.

The two arms share everything but the library they call:

- `arms.ts` writes one package for each arm outside every workspace. Each has the same release
  profile, the same versions of `libc` and `mimalloc`, and the harness in `harness.rs`. Each
  takes the `Cargo.lock` of its tree, and the `main` arm takes the `[patch.crates-io]` of `main`.
- `harness.rs` reads every file before it starts timing, and counts each thread's allocations.
  `LINT_ALLOCATOR=mimalloc` picks `mimalloc`; otherwise the arm uses the system's `malloc`.
- Both arms run the rules both crates have, each with its default options. `universe.json` lists
  the rules left out and why.

Mode `rules` runs those rules alone. Mode `product` adds what each tool runs on top of them.
`main` compiles each component for the compiler's warnings. This branch runs
`svelte/valid-compile`. The arms skip a component that either arm fails on in either mode, and
`excluded.tsv` names it.

```sh
W=tools/performance/workloads/lint-versus-main
node $W/arms.ts <main checkout> <arms>
cargo build --release --manifest-path <arms>/main/Cargo.toml
cargo build --release --manifest-path <arms>/experimental/Cargo.toml
node $W/stage.ts <stage>
node $W/measure.ts universe --main <main-arm> --experimental <experimental-arm> --out <results>
node $W/measure.ts check --main … --inputs <stage>/inputs.txt --sample 20
node $W/report.ts report.md <results>
```

The header of `measure.ts` lists its other commands: findings per rule, wall-clock time, each
component alone, and Valgrind's instruction counts. Wall-clock time and memory depend on the
runner. Instruction counts do not, so compare those across runs.
