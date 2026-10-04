# Special element CPU and memory tuning

The compiler uses the same lowering and output rules. This tuning changes allocation,
lookup and storage costs. [Results](measurements/special-elements-tuning.json) contain
input hashes, source manifests, binary hashes, raw counters and measurement populations.

| Change | Reason |
|---|---|
| Borrow filename parts and build the component identifier once | Remove temporary vectors and strings |
| Store final render regions as boxed slices | Remove unused capacity fields after construction |
| Store generated names once; keep source references separate | Remove duplicate strings and table updates |
| Use boxed string keys and the map entry API | Reduce table payloads and repeated lookups |
| Borrow lowercase element names; skip HTML namespace filtering | Avoid work that cannot change the result |
| Read the identifier tag directly | Avoid constructing a full decoded `Kind` for a boolean test |

## CPU counters

The macOS tool reads `proc_pid_rusage` V4 before `main` and during process teardown.
It records process CPU cycles and retired instructions from Apple's fixed hardware
counters. It includes all process threads and amortized startup. It does not estimate
cycles from a timer. See [Apple's CPU counter description](https://github.com/apple-oss-distributions/xnu/blob/main/doc/observability/cpu_counters.md)
and [rusage accounting](https://github.com/apple-oss-distributions/xnu/blob/main/osfmk/kern/bsd_kern.c).
User and system times are converted from Mach ticks to nanoseconds.

The tool sets the measurement thread to user-initiated QoS. It does not pin a core or
change system PMU settings. Other work on this machine can change cache state and core
placement. Cycles vary between runs. The report keeps every sample and its range.

```sh
mise exec -- node tools/performance/bin/macos-cycles.ts <config.json> <report.json>
mise exec -- node --test tools/performance/test/macos-cycles.test.ts
cargo run -p rsvelte_svelte_compile --example layout
```

The config has `rounds`, `repetitions`, and an `arms` array. Each arm has a unique `name`
and a `command` array containing an executable path and arguments. The command must
perform the stated number of rounds. Two arms run as ABBA. Three arms run forward and
backward. Allocation metrics use separate instrumented builds. CPU builds have no
allocation instrumentation. Builds use separate target directories to prevent stale
Cargo artifacts. Counter and workload outputs have separate files for each run.

A busy loop is the positive control. A signed system executable that ignores the
measurement library must fail, rather than return a zero or stale result.

## Measured results

Each round compiles every input for client and server. Cycles are medians per round.
The main A/B run has 24 process samples; the extended run has 16. Each process runs
4,000 rounds.

| Population | CPU cycles before → after | Reduction | Allocations before → after | Allocated bytes before → after |
|---|---:|---:|---:|---:|
| Main: 20 files, 40 outputs | 907,039 → 867,555 | 4.35% | 4,241 → 3,970 | 223,911 → 210,806 |
| Extended: 8 files, 16 outputs | 453,621 → 431,655 | 4.84% | 2,180 → 2,023 | 116,026 → 107,764 |

The workload summary hashes match between the two native arms. These hashes cover
counts and byte totals. All 56 generated outputs also match before and after byte for
byte and match official Svelte as ASTs. The main cycle ranges overlap;
the extended ranges do not. Instruction medians fall by 3.02% and 3.62% respectively.
Peak live growth falls from 36,952 to 36,854 bytes in the main population and from
19,582 to 19,447 bytes in the extended population.

The separate three-arm run uses 200 rounds per process and six samples per arm:

| Toolchain | Median CPU cycles per round |
|---|---:|
| Rewrite after tuning | 951,064 |
| Old Rust at `5ed8ea3a3401b9fbbe780d3b18d6f90073291d6b` | 4,436,435 |
| Official Svelte 5.57.1, Node 26.7.0, V8 JIT enabled | 23,309,710 |

The source manifests identify both native builds on a dirty workspace based on
`a25573c64087dd1f417321f19139b3edd709bf03`. Concurrent stylesheet edits after measurement
are excluded from these binaries. Both measured arms use identical stylesheet sources.

Workspace tests and Clippy pass. The selected corpus has 1,149 files and 2,298 outputs:
304 AST matches and 1,994 unsupported outputs, with no emitted AST differences.

## Layout

| ARM64 payload | Before | After |
|---|---:|---:|
| Final render region | 48 bytes | 40 bytes |
| Name map key and count | 32 bytes | 24 bytes |
| Name set key | 24 bytes | 16 bytes |
| HIR node | 56 bytes | 56 bytes |
| Attribute | 64 bytes | 64 bytes |
| Render item | 48 bytes | 48 bytes |

These are observed sizes from this Rust build. Table control bytes and string contents
are separate from key payloads. The mutable cleaning builder stays at 48 bytes; only
the final region changes to a boxed slice.

The main population contains the same special-element files used in the earlier
measurement. An additional population covers custom elements, boundary destructuring
and global event modifiers. The old Rust and official Svelte arms use the same main
inputs. The official CPU arm enables V8 JIT; the earlier Linux instruction comparison
disabled it. Those results are separate experiments.

Passing output checks does not establish full Svelte compatibility. Existing unsupported
language features still limit compilation. These measurements establish costs for the
recorded populations on this machine. They do not prove an absolute fastest implementation.
