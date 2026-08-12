# Performance benchmark

From a normal development checkout, reproduce the published performance report with:

```bash
pnpm benchmark:reproduce
```

The command collects the pinned corpus, installs pinned competitor packages, builds the official
Svelte compiler and shared AST-equivalence checker when needed, runs one warmup plus five measured
samples, and writes `apps/playground/static/performance-report.json`. The published type-check card
runs 5,000 files end to end and shows regular `svelte-check`, `svelte-check + tsgo`, and `rsvelte + tsgo`.
The two tsgo rows use the same pinned backend, and every sample starts without a generated overlay
cache. `svelte-check-rs` is measured on the same workspace and passes planted script and template
diagnostics, but remains a separate default-sources row because it cannot select diagnostic sources.
The runner retains a Svelte-diagnostics-only measurement for profiling, but the site does not present
that partial workload as type checking.

Competitor compatibility is not a compile-completion count. For every input accepted by its
matching Svelte version, the runner compares normalized JavaScript by byte equality or shared AST
equivalence and requires identical CSS output. Inputs rejected by Svelte require rejection parity,
so the displayed correctness denominator is the same complete corpus used by the elapsed-time row.

Formatter alternatives are timed across every attempted file even when they reject part of the
corpus. Oxfmt uses its multi-threaded CLI with Svelte support enabled; its public single-file API is
used only for the untimed completion check. Incomplete output is shown with its completion count
and elapsed time, but is not ranked as equivalent work.

The JSON records the rsvelte and Svelte commits, CPU, platform, Node version, run counts, raw
compiler samples, and a SHA-256 hash of the measured file set. This makes the conditions auditable;
results from different machines or non-equivalent workloads must not be combined into one ranking.

The root dependencies and Git submodules must already be initialized:

```bash
pnpm install --frozen-lockfile
git submodule update --init --recursive
```

For a quick diagnostic run, override the fixed defaults explicitly:

```bash
REPORT_RUNS=2 REPORT_FILE_LIMIT=500 pnpm benchmark:reproduce
```

Do not publish a report produced with `REPORT_FILE_LIMIT`.
