# Svelte parser follow-up records

Read [the report](../../svelte-parser-performance-followup.md) for populations,
results, and limits. `metadata.json` identifies the dirty source snapshots and
binaries. `followup-before-sources.json` and `followup-sources.json` hash each
source file. `sources.tar.gz` contains both workspaces, the runner and collectors,
generated inputs, and the current parser regression tests.

`cycles.json`, `synthetic-cycles.json`, and `three-arms.json` contain real macOS
CPU counters. Their sample archives retain the raw counters and output.
`cache-64.json` and `cache-128.json` contain simulations; their archives include
raw profiles. `allocations.json` records the counting allocator results.
`parity.json` and `parity.tar.gz` retain all 19,498 full-result hashes.
`positive-control.json` and its logs show that the comment test detects a defect.
The other logs retain the parser checks and unrelated full-check failures.

To repeat, unpack `sources.tar.gz` in a temporary directory. Update absolute
paths in the configs and manifests to that directory and your corpus checkout.
Build both native runners with Rust 1.98.1:

```sh
CARGO_TARGET_DIR=candidate/target cargo build --manifest-path followup-before/Cargo.toml -p rsvelte_svelte_parser --example measure --release
cargo build --manifest-path followup/Cargo.toml -p rsvelte_svelte_parser --example measure --release
node tools/performance/bin/macos-cycles.ts cycles-config.json cycles-repeat.json
```

For allocations, build with `--features metrics` and run each runner with a
manifest and `3`; add `cold` to disable pooling. For parity, use `dump` instead of
`3`. For cache profiles, build on Linux with Valgrind 3.22.0, then run
`tools/performance/bin/cache-profile.ts` with each cache config. These are models;
compare CPU cycles separately. Old parser sources and oracle details are retained
in the [first measurement records](../svelte-parser/README.md).
