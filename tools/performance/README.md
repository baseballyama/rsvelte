# Performance measurements

Every command is `node tools/performance/performance.ts <command>`; the header of
`performance.ts` lists them with their options.

| Command                                                     | Measures                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| `mise run performance` (`ratchet`)                          | Allocation ratchet over the corpus                                       |
| `performance.ts linux`                                      | Allocation and instruction ratchets in Linux (`linux.Dockerfile`)        |
| `mise run performance:cache <config.json> <report.json>`    | Cachegrind cache simulation and an optional baseline gate                |
| `mise run performance:hardware <config.json> <report.json>` | Linux `perf` CPU and cache hardware events                               |
| `performance.ts macos-cycles <config.json> <report.json>`   | macOS hardware CPU cycles and instructions, P-core share, peak footprint |
| `mise run performance:test`                                 | Measurement tests and defect controls                                    |

`mise run performance` copies the built binary and writes the report into its own temporary
directory, so a later build or run in the same tree cannot change what it measures. A build that
finishes between another run's build and its copy can still get copied, so run one ratchet per
tree. Cargo reads `CARGO_BUILD_JOBS` from the environment.

## Cache profiles

Run in Linux with `valgrind`, `cg_annotate`, Node and a release binary with debug line tables;
`linux.Dockerfile` supplies these tools. Profile a frozen source tree, and use separate Cargo
target directories for different source trees.

The config has these fields:

| Field                   | Meaning                                                                   |
| ----------------------- | ------------------------------------------------------------------------- |
| `arms`                  | Unique `name` and `command` array for each executable                     |
| `rounds`, `repetitions` | Workload rounds per process, and forward/reverse sample pairs             |
| `inputs`, `sources`     | Lists of input files and files used by the build; hashed before profiling |
| `revision`              | Full base commit hash for a frozen snapshot; otherwise read from Git      |
| `model`                 | Optional `i1`, `d1`, `ll` cache objects: `bytes`, `ways`, `line_bytes`    |
| `expect_stdout`         | Optional expected fields in a JSON workload summary                       |
| `minimum_output_bytes`  | Optional lower bound on that summary's `output_bytes`                     |
| `baseline`              | Optional previous complete report to compare                              |
| `tolerance`             | Optional relative tolerance for the two-sided gate; default 0.02          |

The command must run the declared number of rounds. For `rsvelte performance`, check
`documents`, `skipped`, `metrics` and `rounds`. Also check the smallest allowed output size. Outside the
corpus, a unit directory name must end in the language extension, such as
`case.svelte/input.svelte`. A file count alone does not prove that the tasks ran.

Each repetition runs the arms forward, then in reverse; two arms run first-second, then
second-first. A report keeps every sample, the model and the tool version. It also keeps the
hashes of the inputs and sources, and of the tools and binaries. Each sample has the raw Cachegrind file, stdout and stderr. It also has the
function counts, sorted by L1 data read misses. For source lines, run
`cg_annotate --auto=yes <sample.cg>` with the frozen source paths available. Records include
instruction fetches, reads, writes and L1 and last-level misses. The summaries show process
totals, totals per declared round, and miss rates.

The gate checks all nine events. It refuses a run that differs from the baseline in population,
platform, backend, Valgrind version or model. It also refuses a different round or sample count.
A change outside the tolerance fails in either direction. To accept an intended improvement,
record a new complete baseline report. Keep the old baseline and the output report separate, and
never edit counter values by hand. Cache counts depend on code and heap addresses as well as
access order, so keep the raw samples and compare their spread. Choose the tolerance for the
recorded environment.

Cachegrind is a basic model. It does not reproduce modern prefetching, out-of-order execution,
every cache level or contention between cores. A model miss is not a measured hardware miss.
See the [Valgrind manual](https://valgrind.org/docs/manual/cg-manual.html). Use models with
different capacities and line sizes, then check the real CPU cycles.

## macOS counters

`macos-cycles.ts` injects `macos-cycles.c` and reads `proc_pid_rusage` for the process it starts.
Its limits:

- It measures that process alone. It rejects an arm that waits for a child (`child_time_ns`
  above zero). A process that replaces itself with `exec` (a shim, for example) has no report. A
  child that the arm does not wait for does not count and never writes a report. Pass the real
  executable.
- The tool finds the arm on `PATH` and hashes it before the first sample and again after the
  last. A different hash fails the run. The report keeps the path, its real path and the hash. A
  symbolic link to a multi-call tool hashes that tool. The tool skips an empty `PATH` entry; it
  does not mean the current directory.
- The tool refuses to start when the load is above a quarter of the logical CPUs, as
  `tools/buildtime` does. The report keeps the start load, the limit and the load before each
  sample. `--allow-busy` records the override; it does not make busy samples comparable.
- `cycles` and `instructions` cover every core type. `p_cycles` and `p_instructions` come from
  `RUSAGE_INFO_V6`, and only on a host with more than one core type. An older kernel falls back
  to V4, and both values are `null` (UNMEASURED), never zero. One `null` sample makes the arm's
  P-core summary `null`. The share of P-core cycles depends on scheduling, not on the code.
- `lifetime_max_phys_footprint_bytes` is the process peak, start-up included. It does not show
  the heap growth of the workload; use the `metrics` build for that.
- This backend has no hardware cache-miss counters. Cache claims need the Cachegrind model above
  and a cycle measurement.

## Hardware and layout

The Linux backend uses `perf stat` for cycles and instructions. It also counts L1 data loads and
misses, and last-level cache loads and misses. It uses the same arm order and round declarations
as the other backends. Some failures return nonzero and record `UNMEASURED`: a missing
performance monitoring unit, an unsupported event or a permission error. The backend never turns
missing events into zero misses. Install `perf` for the host kernel, and run on a host that
exposes those events; a virtual machine may not. Raw records keep the scaling and runtime fields
from `perf`.

All three counter backends accept `expect_stdout` and `minimum_output_bytes`. Use them for
compiler workloads, so that a sample with skipped units or empty output fails. Commands without
these fields may print plain text.

CI runs a real sequential and strided memory control, and checks that the baseline gate rejects
the deliberate rise in misses. The cache gate is for pinned workload configs and does not touch
the allocation and instruction baseline of the whole corpus.
