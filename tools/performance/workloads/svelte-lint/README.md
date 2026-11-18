# Svelte lint workload

This package is separate from the workspace, so it builds the production lint crate without test
tracing. It lints the same files with the same rules in two arms:

- `rsvelte`: `lint-workload lint`, the lint crate with the project facts read from the files;
- `eslint`: `oracle.ts`, ESLint with eslint-plugin-svelte and svelte-eslint-parser, configured as
  `oracle lint-cases` configures them.

Every rule runs with its default options. `prepare.ts` takes every eslint-plugin-svelte rule but the
type-aware one. It leaves out a rule that throws in ESLint on one of the files, and names it. It
also leaves out a rule this crate lacks, and a file that ESLint cannot parse.

```sh
cargo build --release --manifest-path tools/performance/workloads/svelte-lint/Cargo.toml
W=tools/performance/workloads/svelte-lint
mise exec -- node $W/prepare.ts $W/target/release/lint-workload $W/generated bits-ui
mise exec -- node tools/performance/performance.ts macos-cycles $W/generated/cycles-corpus.json $W/generated/corpus-report.json
```

`real.txt` holds the hand-written compile cases and `corpus.txt` every component of the named
corpus sources. Declare which population a number is from; never combine them. Each
`cycles-<population>.json` checks `documents`, `rules` and `rounds` on both arms. Both arms report
`findings` and `output_bytes`. They do not print the same report, so the process totals give the
cost of each tool on the same work, not a ratio for the same output. Build with
`--features allocations` for allocation counts in the `rsvelte` arm.

`lint-workload profile <rules.txt> <inputs.txt> <rounds>` prints each rule's fastest round alone,
less that of `svelte/button-has-type`, which needs only the parse. This is wall-clock time; on a busy
host, compare instruction counts from separate processes instead.

Use the cycle and cache backends in [the performance guide](../../README.md).
