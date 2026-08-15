# LSP benchmark

This harness drives the official and rsvelte language servers with the same
stdio session. It measures process spawn through `initialize`, first published
diagnostics, warmed hover/completion latency distributions, and the server
process tree's current/peak RSS. Every operation has a deadline and every child
process group is reaped on success or failure.

Build both servers, then run:

```sh
cargo build --release -p rsvelte_language_server --bin rsvelte-language-server
pnpm --dir submodules/language-tools --filter svelte-language-server build
node scripts/bench-lsp/run.mjs --project /path/to/large-sveltekit-project
```

The default output is `lsp-benchmark.json`. The JSON records the harness and
project Git HEAD/dirty state, plus each opened file's relative path, byte count,
and SHA-256 digest.

## Explicit commands

Command overrides are JSON argv arrays so paths and arguments are not
interpreted by a shell:

```sh
node scripts/bench-lsp/run.mjs \
  --official-command-json '["node","/path/to/svelteserver","--stdio"]' \
  --rsvelte-command-json '["/path/to/rsvelte-language-server","--stdio"]' \
  --project /path/to/project \
  --iterations 100 \
  --max-files 250 \
	--tsgo-bin /path/to/tsgo \
  --output results/lsp.json
```

`--official-command` and `--rsvelte-command` are shorter aliases that accept
the same JSON array form. The same values can be supplied as
`OFFICIAL_LSP_COMMAND` and `RSVELTE_LSP_COMMAND`.
Without overrides the harness checks a
`scripts/compat-lsp` launcher, the built upstream submodule, local
`node_modules/.bin`, and Rust release/debug binaries. `TSGO_BIN` or
`--tsgo-bin` overrides TypeScript Go discovery; otherwise the pinned
`@typescript/native-preview` under `submodules/language-tools` is used. Every
run requires non-null TypeScript hover and completion from each server before
recording latency samples.

## CI smoke

The smoke test uses two deterministic fake servers; it validates framing,
timeouts, cleanup, archive-free temporary fixtures, percentile fields, and the
JSON schema without making performance assertions:

```sh
node --test scripts/bench-lsp/smoke.test.mjs
```

The real smoke discovers the built official and rsvelte servers plus pinned
tsgo, then asserts the TypeScript positive control and metrics:

```sh
node --test scripts/bench-lsp/real-smoke.test.mjs
```

## Scheduled benchmark

`.github/workflows/lsp-benchmark.yml` runs every Monday at 06:00 UTC and on
manual dispatch. It builds both language servers from the pinned repository
and submodules, installs `bits-ui` from its own lockfile, then opens exactly 250
files from pinned `submodules/bits-ui` and collects 100 requests per measured
operation after 10 warmup requests. A validation step requires both servers to
publish diagnostics and return error-free TypeScript hover and completion
results.

Each run retains `lsp-benchmark.json` for 30 days in the
`lsp-benchmark-<run id>` artifact. The upload runs even when a server-level
benchmark fails, preserving the failure report; a missing report is an
explicit artifact-step failure.

Benchmark numbers are observations, not a loaded-runner CI gate.
