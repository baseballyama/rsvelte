# Svelte parser whitespace records

Read [the report](../../svelte-parser-performance-whitespace.md) for populations,
results and limits. `metadata.json` identifies dirty snapshots, versions and
executable hashes. `followup-sources.json` and `round3-cold-sources.json` identify
every source file in `sources.tar.gz`. Both workspaces, the runner, collectors,
generated inputs and parser tests are included.

`cycles.json`, `synthetic-cycles.json`, and `three-arms.json` retain real macOS CPU
counters. Their sample archives retain raw counters and output. Cache records
are simulations; their sample archives include raw profiles. `allocations.json`
retains counting allocator results. `parity.tar.gz` retains all 19,498 full-result
hashes. The positive control and check logs retain successes and unrelated errors.

To repeat, unpack `sources.tar.gz` in a temporary directory. Update absolute paths
in configs and manifests to your build directory and corpus checkout. Build with
Rust 1.98.1 and collect with Node 26.7.0:

```sh
cargo build --manifest-path followup/Cargo.toml -p rsvelte_svelte_parser --example measure --release
CARGO_TARGET_DIR=candidate/target cargo build --manifest-path round3-cold/Cargo.toml -p rsvelte_svelte_parser --example measure --release
node tools/performance/bin/macos-cycles.ts cycles-config.json cycles-repeat.json
```

For allocation counts, build with `--features metrics`, then run each runner with
a manifest and `3`; add `cold` to disable pooling. Use `dump` instead of `3` for
parity. For cache profiles, build on Linux with Valgrind 3.22.0 and use each cache
config with `tools/performance/bin/cache-profile.ts`. Compare actual CPU cycles
separately. The trial can be rebuilt by removing the three `#[cold]` annotations
from the after snapshot. Old parser sources and oracle details are retained in
the [first measurement records](../svelte-parser/README.md).
