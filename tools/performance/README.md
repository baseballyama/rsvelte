# Performance measurements

| Command | Measures |
|---|---|
| `mise run performance` | Allocation ratchet over the corpus |
| `tools/performance/linux.sh` | Allocation and instruction ratchets in Linux |
| `mise run performance:cache <config.json> <report.json>` | Cachegrind cache simulation and an optional baseline gate |
| `mise run performance:hardware <config.json> <report.json>` | Linux `perf` CPU and cache hardware events |
| `node tools/performance/bin/macos-cycles.ts <config.json> <report.json> [--max-load <n>] [--allow-busy]` | macOS hardware CPU cycles and instructions, P-core share, peak footprint |
| `mise run performance:layout` | Kernel, JS/TS, Svelte, Vue and CSS type sizes, alignment and field offsets |
| `mise run performance:test` | Measurement tests and defect controls |

## Cache profiles

Run in Linux with `valgrind`, `cg_annotate`, Node and a release binary with debug line
tables. `tools/performance/Dockerfile` supplies these tools. Profile a frozen source tree;
use separate Cargo target directories for different source trees.

The config contains:

| Field | Meaning |
|---|---|
| `arms` | Unique `name` and `command` array for each executable |
| `rounds`, `repetitions` | Workload rounds per process, and forward/reverse sample pairs |
| `inputs`, `sources` | Lists of input files and files used by the build; hashed before profiling |
| `revision` | Full base commit hash for a frozen snapshot; otherwise read from Git |
| `model` | Optional `i1`, `d1`, `ll` cache objects: `bytes`, `ways`, `line_bytes` |
| `expect_stdout` | Optional expected fields in a JSON workload summary |
| `minimum_output_bytes` | Optional lower bound on that summary's `output_bytes` |
| `baseline` | Optional previous complete report to compare |
| `tolerance` | Optional relative tolerance for the two-sided gate; default 0.02 |

The command must perform the declared number of rounds. For `rsvelte performance`,
check `documents`, `skipped`, `metrics`, `rounds` and the minimum output size. Outside
the fixture corpus, unit directory names must end in the language extension, such as
`case.svelte/input.svelte`. A file count alone does not prove tasks ran.

Two arms run as ABBA; three run forward then reverse. Reports retain every sample,
input/source/tool/binary hashes, the model and tool version. Each sample has the raw
Cachegrind file, stdout, stderr and function counts sorted by L1 data read misses.
For source lines, run `cg_annotate --auto=yes <sample.cg>` with the frozen source paths
available. Records include instruction fetches, reads, writes and L1/last-level misses.
The summaries show process totals, totals per declared round and miss rates.

The gate checks all nine events. It refuses a different population, platform, backend,
Valgrind version, model, round count or sample count. Either direction outside tolerance
fails: accept an intended improvement by recording a new complete baseline report.
Keep the old baseline and output report separate. Never edit counter values by hand.
Cache counts depend on code and heap addresses as well as access order; keep the raw
samples and compare their spread. Choose tolerance for the recorded environment.

Cachegrind is a basic model. It does not reproduce modern prefetching, out-of-order
execution, all cache levels or contention between cores. A model miss is not a measured
hardware miss. See the [Valgrind manual](https://valgrind.org/docs/manual/cg-manual.html).
Use models with different capacities and line sizes, then check actual CPU cycles.

## macOS counters

`macos-cycles.ts` injects `macos-counters.c` and reads `proc_pid_rusage` for the process it
starts. Its limits:

- Only that process is measured. A child that the arm waits for is rejected (`child_time_ns`
  above zero). A process that replaces itself with `exec` (a shim, for example) has no report.
  A child that is not waited for is not counted and never writes a report. Pass the real
  executable.
- The arm is found on `PATH` and hashed before the first sample, and again after the last. A
  different hash fails the run. The report keeps the path, its real path and the hash. A
  symbolic link to a multi-call tool hashes that tool. An empty `PATH` entry is skipped; it
  does not mean the current directory.
- A start load above a quarter of the logical CPUs is refused, as in `tools/buildtime`. The
  report keeps the start load, the limit and the load before each sample. `--allow-busy`
  records the override; it does not make busy samples comparable.
- `cycles` and `instructions` cover every core type. `p_cycles` and `p_instructions` come from
  `RUSAGE_INFO_V6`, and only on a host with more than one core type. An older kernel falls
  back to V4, and both values are `null` (UNMEASURED), never zero. One `null` sample makes the
  arm's P-core summary `null`. The share of P-core cycles is a property of scheduling, not of
  the code.
- `lifetime_max_phys_footprint_bytes` is the process peak, including start-up. It is not the
  heap growth of the workload; use the `metrics` build for that.
- There are no hardware cache-miss counters here. Cache claims need the Cachegrind model above
  and a cycle measurement.

`mise run performance` copies the built binary and writes the report into its own temporary
directory, so a later build or run in the same tree cannot change what it measures. A build
that finishes between another run's build and its copy can still be copied; run one ratchet
per tree. Cargo reads `CARGO_BUILD_JOBS` from the environment.

## Hardware and layout

The Linux backend uses `perf stat` for cycles, instructions, L1 data loads/misses and
LLC loads/misses. It uses the same arm ordering and round declarations as the other
backends. A missing PMU, unsupported event or permission failure returns nonzero and
records `UNMEASURED`; it never turns missing events into zero misses. Install `perf`
for the host kernel and run on a host that exposes those events. Virtual machines may
not expose a PMU. Raw records retain scaling/runtime fields from `perf`.

All three counter backends accept `expect_stdout` and `minimum_output_bytes`.
Use them for compiler workloads to reject skipped units or empty output before a
sample is accepted. Commands without these fields may produce plain text.

Type layout reports measure Rust payload sizes and field offsets, not the live heap or
cache residency. Borrowed references, owned buffers and allocator metadata have
different costs. Inspect the hot access paths and allocation metrics with the layout.

CI runs a real sequential/strided memory control and verifies that the baseline gate
rejects the deliberate miss increase. It also saves a type layout artifact. The cache
gate is available for pinned workload configs; it is separate from the whole-corpus
allocation/instruction baseline.

For a measured compiler change, see [cache locality](../../docs/cache-locality.md).
For a candidate held after measurement, see [expression precedence](../../docs/cache-precedence.md).
