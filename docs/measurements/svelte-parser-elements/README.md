# Svelte parser element records

Read [the report](../../svelte-parser-performance-elements.md) for populations,
results and limits. `metadata.json` identifies versions, dirty snapshots and
binary hashes. `round3-cold-sources.json` and `round4-sources.json` identify every
workspace file in `sources.tar.gz`. Both workspaces, tests, the runner and the
collectors are included. `production-match.json` records the syntax comparison.

CPU sample archives retain raw hardware counters and process output. Cache
sample archives retain simulated profiles. `allocations.json` retains counting
allocator results. `parity.tar.gz` retains all 19,498 full-result hashes. The
positive control and check logs retain the test failure and restored success.
`artifacts.json` identifies each archived artifact by size and SHA-256.

Unpack `sources.tar.gz` in a temporary directory. Update absolute paths in the
configs and manifests to your build directory and corpus checkout. Use Rust
1.98.1 and Node 26.7.0:

```sh
cargo build --manifest-path round3-cold/Cargo.toml -p rsvelte_svelte_parser --example measure --release
cargo build --manifest-path round4/Cargo.toml -p rsvelte_svelte_parser --example measure --release
node tools/performance/bin/macos-cycles.ts cycles-config.json cycles-repeat.json
```

For allocations, build with `--features metrics`, then run each runner with a
manifest and `3`; add `cold` to disable pooling. Use `dump` instead of `3` for
parity and `layout` for state sizes. For cache profiles, build on Linux with
Valgrind 3.22.0 and use `tools/performance/bin/cache-profile.ts` with each cache
config. Compare actual CPU cycles separately. Old parser sources and oracle
details are in the [first measurement records](../svelte-parser/README.md).
