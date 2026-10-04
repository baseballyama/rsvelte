# Svelte projection measurements

The initial sections describe the frozen implementation before the rename to
`typescript_projection` and before element helpers became generic call/object nodes.
They do not measure the current node layout. Keep their source hashes and counters intact.
The final section records the generic-node update separately.

The projection now builds an immutable AST, then prints once. Flat node and child
buffers, one shared scratch buffer, and a per-node TypeScript suffix index reduce
allocations and repeated searches. Expression statements store their source reference
inline. Shared buffers return to the kernel's bounded per-thread pool.

These results do not establish the fastest complete Svelte projection. The rewrite
still rejects many constructs and emits fewer component helpers than the other arms.

## Identity and populations

Measurements used an Apple M1 Pro with 32 GiB RAM. Actual cycles and instructions
come from macOS process hardware counters. Native executables use optimized Cargo
profiles. Cachegrind runs arm64 Linux, Valgrind 3.22.0, with debug line tables.
Both Rust arms use thin LTO and optimization level 3. The rewrite uses one codegen
unit; old `main` uses its profiling profile with 16. This build difference is another
limit of the three-arm comparison.

| Tree or oracle | Identity |
|---|---|
| Rewrite | Base `d3fe0394b0b11ab70829fad9a544b2b03ac81618`, plus frozen working changes |
| Old `main` | `5ed8ea3a3401b9fbbe780d3b18d6f90073291d6b` |
| Official JS | svelte2tsx bundled by svelte-check 4.7.6; Svelte 5.57.1, TypeScript 6.0.3 |
| JS runtime | Node 26.7.0 |

The base commit alone does not identify the measured rewrite. The
[identity](../tools/performance/reports/svelte-project/identity.json) records source,
input, bundle, harness and binary hashes. Archives preserve frozen sources, inputs,
baseline code, and raw samples. Stored commands contain the original measurement paths;
restore those paths or update them when repeating a run. The official harness extracts
the unchanged svelte2tsx function and its dependencies from the installed bundle.

## Actual CPU cycles and RSS

The small workload has eight compiler fixtures. Each process performs 1,000 rounds of
parse, projection and emission. Three forward/reverse pairs give six samples per arm.
Counters include process startup and file reads. JS uses its normal JIT configuration.

| Arm | Median cycles / eight-input round | Sample range | Instructions / round | Maximum RSS, bytes |
|---|---:|---:|---:|---:|
| Official JS | 7,555,583 | 7,241,658–8,213,496 | 17,607,914 | 298,500,096 |
| Old `main` | 550,655 | 510,705–596,724 | 1,796,789 | 5,488,640 |
| Rewrite AST | 87,577 | 85,216–96,022 | 463,169 | 2,457,600 |

RSS is one separate `/usr/bin/time -l` run per arm, not a repeated median. The official
and old arms emit 6,174 bytes per round; the rewrite emits 2,553. This is a supported
subset comparison, not evidence of equivalent type semantics or full-corpus speed.
Old-main allocation fields in raw wrapper stdout are placeholder zeros: **UNMEASURED**.

Two synthetic TypeScript inputs each contain 1,024 expressions. Each arm has six
hardware samples of 100 rounds. These benchmarks parse once per file, then lower and
print repeatedly; process counters still include that initial parse.

| Input | Previous direct emitter, cycles / round | AST projection, cycles / round |
|---|---:|---:|
| Repeated `class:a={x as number}` | 1,452,901 | 174,549 |
| Repeated `{x as number}` | 47,625 | 73,617 |

The suffix index removes repeated fact-table searches in class attributes. Simple
expression statements already avoided that search in the direct emitter. They remain
slower with an output AST; keep this regression visible when optimizing further.

## Layout, allocation and cache models

`Node` is 28 bytes, aligned to 4; its ID is 4 bytes. `SyntaxTree` is 56 bytes, aligned
to 8. Nodes and child IDs occupy separate contiguous buffers. These are payload sizes,
not evidence that data stays in a hardware cache.

The compiler corpus contains 19,654 Svelte components. The allocation benchmark selects
13,010 instance-TypeScript files; 88 other files fail parsing. With 20 rounds, each arm
reports 242,660 unsupported attempts. Counts below cover lowering and printing only,
including failed attempts, with parser allocations outside that scope.

| Projection stage | Allocations | Allocated bytes |
|---|---:|---:|
| Previous direct emitter | 956,360 | 767,966,680 |
| First AST version | 2,145,380 | 647,092,880 |
| Final pooled AST | 121,992 | 77,976,892 |

The final AST buffers reach 32,768 bytes of capacity in this population. Single-run
projection time changes from 917.9 ms to 145.4 ms; this is not a repeated timing result.
Output byte totals differ, so the allocation result also has a semantic scope limit.

Cachegrind runs ABBA, 20 rounds per sample. Two L1 models use 32 KiB/64-byte lines and
64 KiB/128-byte lines; both are 8-way, with an 8 MiB, 16-way last-level model.

| Input / L1 model | Arm | Instructions / round | L1 read misses / round | L1 write misses / round |
|---|---|---:|---:|---:|
| Class attributes / 32 KiB | Previous | 7,030,190 | 6,109.8 | 3,910.7 |
| Class attributes / 32 KiB | AST | 1,009,835 | 5,859.4 | 4,560.6 |
| Class attributes / 64 KiB | Previous | 7,030,190 | 2,486.9 | 1,877.7 |
| Class attributes / 64 KiB | AST | 1,009,835 | 2,711.9 | 2,254.6 |
| Simple expressions / 32 KiB | Previous | 300,613 | 2,112.5 | 1,773.2 |
| Simple expressions / 32 KiB | AST | 452,723 | 3,199.7 | 2,686.1 |

AST storage adds writes. Read misses do not improve in both models, even where actual
cycles improve. Cache residency and hardware cache misses remain **UNMEASURED**:
Docker's PMU rejected access, and the macOS helper provides cycles and instructions only.

A separate three-arm Cachegrind run completed with JS `--jitless` and 20 rounds. It is
stored as a model experiment, not compared with normal-JIT hardware results. The normal-JIT
Cachegrind attempt exited 137 and is **UNMEASURED**. Cache simulation is not hardware
measurement; model misses do not prove actual CPU cache use.

## Correctness limits

The checker reads the compiler's exact 20,259-case input population. Its 151 handwritten
snapshots match. Of 20,108 external cases, 605 are not applicable and 19,503 have no
checker oracle snapshot: **UNMEASURED**, not matches.

An independent TypeScript parser verifies generated syntax across all 19,654 Svelte
components: 19,566 parse, 3,840 project, 15,726 are unsupported, and zero emitted outputs
have syntax errors. Syntax validity does not establish correct type semantics.

Repeat the production benchmarks with the commands in the
[projection README](../crates/languages/svelte/typescript_projection/README.md). Counter configs and
raw evidence live in [the report directory](../tools/performance/reports/svelte-project).

## Generic-node update

Element helpers and attachment keys now lower to member accesses, calls, object literals
and computed properties before printing. The printer makes no Svelte lowering decisions.
The crate and its standalone task are named `typescript_projection`.

The new node payload is 24 bytes, aligned to 8. More explicit nodes increase the largest
AST buffer capacity from 32,768 to 53,248 bytes. The same allocation workload reports
122,173 allocations and 78,027,008 allocated bytes. Both correctness populations and
the unsupported counts stay the same; all 3,840 emitted outputs still parse as TypeScript.

A fresh three-arm hardware run uses the same eight inputs, 1,000 rounds and six samples
per arm. Median cycles per round are 6,293,252 for official JS, 436,371 for old `main`,
and 87,017 for the generic AST. The semantic and build-profile limits above still apply.
Do not treat this as a controlled before/after comparison with the earlier AST: other
workspace sources changed between the two builds. Current RSS and cache profiles are
**UNMEASURED**; the historical measurements do not describe the new AST.

[Update identity](../tools/performance/reports/svelte-project/generic-update.json) records
the working-source snapshot, input and binary hashes, output checks and raw samples.
