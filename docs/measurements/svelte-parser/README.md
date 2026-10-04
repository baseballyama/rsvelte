# Parser measurement records

See [results](../../svelte-parser-performance.md) and [metadata](metadata.json).

| Artifact | Contains |
|---|---|
| `sources.tar.gz`, `*-source.json` | Exact source snapshots, runners, profiles, locks, and file hashes |
| `population.json` | Selected input paths, byte sizes, and SHA-256 hashes |
| `parity.json`, `parity.tar.gz` | Full corpus comparison and complete-result hashes |
| `cycles.json`, `synthetic-cycles.json`, `three-arms.json` | Every hardware CPU sample and observed medians |
| `*.samples.tar.gz` | Raw CPU logs, Cachegrind profiles and function counts, or RSS logs |
| `allocations*.json` | Separate allocator-instrumented runs, pooling on and off |
| `cache-final-*.json` | Simulation samples, models, and summaries |
| `hardware-cache-final.log` | The real unsupported-PMU probe |
| `*tests.log`, `clippy*.log`, `structure.log` | Checks and unrelated workspace blockers |
| `defect-control.log`, `restored-control.log` | Real delimiter defect, then restored passing tests |

To reproduce, extract the source archive outside the working tree. Build each
snapshot's parser example with its own Cargo target directory:

```sh
cargo build --manifest-path frozen/Cargo.toml -p rsvelte_svelte_parser --example measure --release --offline
cargo build --manifest-path candidate/Cargo.toml -p rsvelte_svelte_parser --example measure --release --offline
```

Create a newline-separated input manifest from `population.json`, resolving paths
against the repository root. The runner accepts `<manifest> <rounds>`, `<manifest>
<rounds> cold` to disable recycling, or `<manifest> dump` to hash complete results.
Use `<manifest> layout` for the parser/component payload sizes. Separate release
builds with `--features metrics` enable the counting allocator. Timings from those
instrumented builds are excluded from the CPU comparison.

The report configs retain the measured commands and paths. Adapt their paths to
the extraction directory, retaining the same inputs and profiles. Use the included
CPU/Cachegrind collectors. The official runner requires Svelte 5.57.1 and its import
path must point to that package. Build `old-parser-measure` under `old/Cargo.toml`
for the old arm. Its Cargo lock pins the OXC source revision.

The source archive adds measurement-only layout probes and runner features. The
production parser files have no measurement API or counting allocator. Absolute
paths in the recorded configs identify the original run; they are not installation
paths or a replacement for the retained source/input hashes.
